import time
import math
from . import config

def compute_iou(boxA, boxB):
    # box = [x1, y1, x2, y2]
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0, xB - xA + 1) * max(0, yB - yA + 1)
    if interArea == 0:
         return 0.0

    boxAArea = (boxA[2] - boxA[0] + 1) * (boxA[3] - boxA[1] + 1)
    boxBArea = (boxB[2] - boxB[0] + 1) * (boxB[3] - boxB[1] + 1)

    iou = interArea / float(boxAArea + boxBArea - interArea)
    return iou

class BehaviorAnalyzer:
    def __init__(self):
        pass

    def check_armed_person(self, tracked_persons, weapons):
        alerts = []
        for person in tracked_persons:
            person_box = person["box"]
            for weapon in weapons:
                weapon_box = weapon["box"]
                iou = compute_iou(person_box, weapon_box)
                
                # If they overlap, or if weapon is very close to person
                if iou > config.WEAPON_PERSON_IOU_THRESHOLD:
                    alerts.append({
                        "alert_type": "ARMED_PERSON",
                        "severity": "CRITICAL",
                        "confidence": weapon["confidence"],
                        "box": person_box,
                        "track_id": person["track_id"],
                        "weapon_class": weapon["label"],
                        "details": f"Person #{person['track_id']} holding {weapon['label']}"
                    })
        return alerts

    def check_loitering(self, tracked_persons, current_time):
        alerts = []
        for person in tracked_persons:
            history = person["history"]
            if not history or len(history) < 2:
                continue
                
            # Only look at history within the window
            recent_history = [h for h in history if current_time - h[2] <= config.LOITER_WINDOW_SEC]
            if not recent_history:
                continue
                
            first_time = recent_history[0][2]
            duration = current_time - first_time
            
            if duration >= config.LOITER_THRESHOLD_SEC:
                # Check if all points are within LOITER_RADIUS_PX
                c_x = np.mean([h[0] for h in recent_history])
                c_y = np.mean([h[1] for h in recent_history])
                
                is_loitering = True
                for h in recent_history:
                    dist = math.hypot(h[0] - c_x, h[1] - c_y)
                    if dist > config.LOITER_RADIUS_PX:
                        is_loitering = False
                        break
                        
                if is_loitering:
                    alerts.append({
                        "alert_type": "LOITERING",
                        "severity": "MEDIUM",
                        "confidence": 0.8,  # Heuristic
                        "box": person["box"],
                        "track_id": person["track_id"],
                        "duration_seconds": round(duration, 1),
                        "details": f"Person #{person['track_id']} stationary for {duration:.1f}s"
                    })
        return alerts

    def check_running(self, tracked_persons):
        alerts = []
        for person in tracked_persons:
            history = person["history"]
            if len(history) < config.SPEED_CONSECUTIVE_FRAMES + 1:
                continue
                
            recent_h = history[-(config.SPEED_CONSECUTIVE_FRAMES + 1):]
            
            is_running = True
            for i in range(1, len(recent_h)):
                p1 = recent_h[i-1]
                p2 = recent_h[i]
                dist = math.hypot(p2[0] - p1[0], p2[1] - p1[1])
                
                if dist < config.SPEED_THRESHOLD_PX_PER_FRAME:
                    is_running = False
                    break
                    
            if is_running:
                alerts.append({
                    "alert_type": "RUNNING",
                    "severity": "HIGH",
                    "confidence": 0.75,
                    "box": person["box"],
                    "track_id": person["track_id"],
                    "details": f"Person #{person['track_id']} moving rapidly"
                })
        return alerts

    def check_fighting(self, tracked_persons):
        alerts = []
        n = len(tracked_persons)
        for i in range(n):
            for j in range(i+1, n):
                p1 = tracked_persons[i]
                p2 = tracked_persons[j]
                
                iou = compute_iou(p1["box"], p2["box"])
                if iou > config.FIGHT_IOU_THRESHOLD:
                    # simplistic check: overlap and enough history
                    if len(p1["history"]) > config.FIGHT_PERSIST_FRAMES and len(p2["history"]) > config.FIGHT_PERSIST_FRAMES:
                        
                        # could also check motion here
                        alerts.append({
                            "alert_type": "FIGHTING_OR_CLOSE_CONTACT",
                            "severity": "HIGH",
                            "confidence": 0.7,
                            "box": p1["box"], # bounding box of first person
                            "track_id": p1["track_id"],
                            "details": f"Person #{p1['track_id']} and #{p2['track_id']} in sustained close contact"
                        })
        return alerts

    def analyze(self, tracked_persons, weapons):
        current_time = time.time()
        
        alerts = []
        alerts.extend(self.check_armed_person(tracked_persons, weapons))
        alerts.extend(self.check_loitering(tracked_persons, current_time))
        alerts.extend(self.check_running(tracked_persons))
        alerts.extend(self.check_fighting(tracked_persons))
        
        # Simple deduplication by track_id and alert_type
        seen = set()
        deduped = []
        for a in alerts:
            key = (a["track_id"], a["alert_type"])
            if key not in seen:
                seen.add(key)
                deduped.append(a)
                
        return deduped
import numpy as np
