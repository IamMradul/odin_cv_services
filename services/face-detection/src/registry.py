import redis
import json
from dataclasses import dataclass, asdict
from typing import Optional, List
from datetime import datetime, timezone, timedelta

@dataclass
class Person:
    id: str
    status: str
    case_ref_id: Optional[str]
    created_at: str
    last_seen: str
    sighting_count: int

@dataclass
class Sighting:
    camera_id: str
    timestamp: str
    confidence: float
    snapshot_path: str

class DummyRedis:
    def __init__(self):
        self.data = {}
    def get(self, key):
        return self.data.get(key)
    def set(self, key, val):
        self.data[key] = val
    def sadd(self, key, val):
        if key not in self.data: self.data[key] = set()
        self.data[key].add(val)
    def srem(self, key, val):
        if key in self.data and val in self.data[key]:
            self.data[key].remove(val)
    def smembers(self, key):
        return self.data.get(key, set())
    def lpush(self, key, val):
        if key not in self.data: self.data[key] = []
        self.data[key].insert(0, val)
    def lrange(self, key, start, end):
        if key not in self.data: return []
        if end == -1: return self.data[key][start:]
        return self.data[key][start:end+1]
    def delete(self, key):
        if key in self.data: del self.data[key]

class PersonRegistry:
    def __init__(self, redis_url: str):
        try:
            self.r = redis.from_url(redis_url, decode_responses=True)
            self.r.ping()
        except redis.exceptions.ConnectionError:
            print("Warning: Redis not found! Falling back to in-memory dictionary.")
            self.r = DummyRedis()

    def _now(self):
        return datetime.now(timezone.utc).isoformat()

    def create(self, person_id: str, status: str = "unidentified") -> Person:
        now = self._now()
        person = Person(
            id=person_id,
            status=status,
            case_ref_id=None,
            created_at=now,
            last_seen=now,
            sighting_count=0
        )
        self.r.set(f"person:{person_id}", json.dumps(asdict(person)))
        self.r.sadd("persons:all", person_id)
        self.r.sadd(f"persons:by_status:{status}", person_id)
        return person

    def get(self, person_id: str) -> Optional[Person]:
        data = self.r.get(f"person:{person_id}")
        if data:
            return Person(**json.loads(data))
        return None

    def update_status(self, person_id: str, new_status: str, operator_id: str, case_ref_id: Optional[str] = None):
        person = self.get(person_id)
        if not person:
            raise ValueError(f"Person {person_id} not found")

        old_status = person.status
        person.status = new_status
        if case_ref_id is not None:
            person.case_ref_id = case_ref_id

        self.r.set(f"person:{person_id}", json.dumps(asdict(person)))
        
        # Update indices
        self.r.srem(f"persons:by_status:{old_status}", person_id)
        self.r.sadd(f"persons:by_status:{new_status}", person_id)
        
        return person

    def update_last_seen(self, person_id: str):
        person = self.get(person_id)
        if person:
            person.last_seen = self._now()
            self.r.set(f"person:{person_id}", json.dumps(asdict(person)))

    def log_sighting(self, person_id: str, camera_id: str, confidence: float, snapshot_path: str):
        person = self.get(person_id)
        if person:
            person.sighting_count += 1
            person.last_seen = self._now()
            self.r.set(f"person:{person_id}", json.dumps(asdict(person)))

        sighting = Sighting(
            camera_id=camera_id,
            timestamp=self._now(),
            confidence=confidence,
            snapshot_path=snapshot_path
        )
        self.r.lpush(f"sightings:{person_id}", json.dumps(asdict(sighting)))

    def get_sightings(self, person_id: str, limit: int = 50) -> List[Sighting]:
        items = self.r.lrange(f"sightings:{person_id}", 0, limit - 1)
        return [Sighting(**json.loads(item)) for item in items]

    def list_by_status(self, status: str) -> List[Person]:
        person_ids = self.r.smembers(f"persons:by_status:{status}")
        persons = []
        for pid in person_ids:
            p = self.get(pid)
            if p:
                persons.append(p)
        return persons

    def prune_stale(self, min_sightings: int = 2, older_than_days: int = 7) -> int:
        """
        Removes 'unidentified' persons with fewer than min_sightings who haven't been seen recently.
        """
        stale_threshold = datetime.now(timezone.utc) - timedelta(days=older_than_days)
        unidentified = self.list_by_status("unidentified")
        
        removed_count = 0
        for p in unidentified:
            if p.sighting_count < min_sightings:
                last_seen_dt = datetime.fromisoformat(p.last_seen)
                if last_seen_dt < stale_threshold:
                    self._delete_person(p.id)
                    removed_count += 1
                    
        return removed_count
        
    def _delete_person(self, person_id: str):
        person = self.get(person_id)
        if not person:
            return
            
        # Remove from sets
        self.r.srem("persons:all", person_id)
        self.r.srem(f"persons:by_status:{person.status}", person_id)
        
        # Delete keys
        self.r.delete(f"person:{person_id}")
        self.r.delete(f"sightings:{person_id}")
