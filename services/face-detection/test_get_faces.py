import os
from src.registry import PersonRegistry

def main():
    try:
        REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
        person_registry = PersonRegistry(REDIS_URL)
        
        keys = person_registry.r.smembers("persons:all")
        faces = []
        for k in keys:
            person = person_registry.get(k)
            if person:
                faces.append({
                    "id": person.id,
                    "name": person.id,
                    "status": person.status,
                    "lastSeen": person.last_seen,
                    "events": person.sighting_count,
                    "tags": [],
                    "description": ""
                })
        print(f"Success! Loaded {len(faces)} faces.")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
