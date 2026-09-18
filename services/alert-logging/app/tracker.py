import time
import uuid
import json
import os
import cv2
import numpy as np
from datetime import datetime, timezone
from .config import TRACK_EXPIRY_SEC, TRAJECTORY_SAMPLE_INTERVAL, SNAPSHOT_DIR
from .database import insert_event_log, insert_object_alert

# In-memory store: {(source_id, track_id): ActiveObjectDict}
active_objects = {}

def get_center(box):
    x1, y1, x2, y2 = box
    return {"x": int((x1 + x2) / 2), "y": int((y1 + y2) / 2)}

def save_snapshot(frame_bytes, box, snap_id):
    if not frame_bytes or not box:
        return None
    try:
        nparr = np.frombuffer(frame_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return None
            
        x1, y1, x2, y2 = map(int, box)
        h, w = img.shape[:2]
        mx1, my1 = max(0, x1 - 20), max(0, y1 - 20)
        mx2, my2 = min(w, x2 + 20), min(h, y2 + 20)
        
        cropped = img[my1:my2, mx1:mx2]
        if cropped.size == 0:
            return None
            
        path = os.path.join(SNAPSHOT_DIR, f"{snap_id}.jpg")
        cv2.imwrite(path, cropped)
        return path
    except Exception as e:
        print(f"Error saving snapshot: {e}")
        return None

async def process_frame(source_id: str, detections: dict, frame_bytes: bytes):
    current_time = time.time()
    now_iso = datetime.now(timezone.utc).isoformat()
    
    # Flatten all detections that have a track_id
    tracked_items = []
    
    # 1. Process regular tracked items (humans, vehicles)
    for service_name in ["human", "vehicle", "face", "anpr"]:
        res = detections.get(service_name)
        if res and res.get("ok"):
            for d in res.get("detections", []):
                if d.get("track_id") is not None:
                    tracked_items.append({**d, "object_type": service_name})
                elif d.get("person_id") is not None:
                     # Face detection returns person_id, we might associate this with a human track later
                     pass
                elif d.get("plate_text") is not None:
                     # ANPR might not have track_id natively, handle if needed
                     pass

    # Process items
    for item in tracked_items:
        track_id = item["track_id"]
        key = (source_id, track_id)
        
        pos = get_center(item["box"])
        conf = item.get("confidence", 0.0)
        
        if key not in active_objects:
            # NEW OBJECT - ENTRY LOG
            obj_id = f"{source_id}_trk{track_id}_{int(current_time)}"
            snap_id = f"{obj_id}_entry"
            snap_path = save_snapshot(frame_bytes, item["box"], snap_id)
            
            metadata = {}
            if item.get("label"): metadata["label"] = item["label"]
            
            obj_data = {
                "object_id": obj_id,
                "source_id": source_id,
                "track_id": track_id,
                "object_type": item["object_type"],
                "object_subtype": item.get("label"),
                "first_seen_at": current_time,
                "last_seen_at": current_time,
                "total_frames": 1,
                "positions": [pos],
                "best_confidence": conf,
                "confidence_sum": conf,
                "best_snapshot_path": snap_path,
                "best_box": item["box"],
                "metadata": metadata,
                "global_id": item.get("person_id") or item.get("plate_text") # Map if we have them
            }
            active_objects[key] = obj_data
            
            # Insert ENTRY log
            await insert_event_log({
                "id": str(uuid.uuid4()),
                "object_id": obj_id,
                "event_type": "ENTRY",
                "source_id": source_id,
                "track_id": track_id,
                "global_id": obj_data["global_id"],
                "object_type": obj_data["object_type"],
                "object_subtype": obj_data["object_subtype"],
                "timestamp": now_iso,
                "position": pos,
                "confidence": conf,
                "snapshot_path": snap_path,
                "metadata": obj_data["metadata"]
            })
            
        else:
            # UPDATE EXISTING OBJECT
            obj = active_objects[key]
            obj["last_seen_at"] = current_time
            obj["total_frames"] += 1
            obj["confidence_sum"] += conf
            
            if obj["total_frames"] % TRAJECTORY_SAMPLE_INTERVAL == 0:
                pos["t"] = int(current_time - obj["first_seen_at"])
                obj["positions"].append(pos)
                
            if conf > obj["best_confidence"]:
                obj["best_confidence"] = conf
                obj["best_box"] = item["box"]
                # Replace best snapshot if it's much better (or we could just take it)
                if frame_bytes:
                     snap_id = f"{obj['object_id']}_best"
                     snap_path = save_snapshot(frame_bytes, item["box"], snap_id)
                     if snap_path:
                         obj["best_snapshot_path"] = snap_path
                         
    # 2. Process Alerts (from suspicious service)
    susp = detections.get("suspicious")
    if susp and susp.get("ok"):
        for alert in susp.get("detections", []):
            if alert.get("alert_type") and alert.get("track_id") is not None:
                alert_track_id = alert["track_id"]
                key = (source_id, alert_track_id)
                obj_id = None
                
                if key in active_objects:
                    obj_id = active_objects[key]["object_id"]
                
                if obj_id:
                    alert_snap_id = f"alert_{uuid.uuid4().hex[:8]}"
                    alert_snap_path = save_snapshot(frame_bytes, alert["box"], alert_snap_id)
                    
                    await insert_object_alert({
                        "id": str(uuid.uuid4()),
                        "object_id": obj_id,
                        "alert_type": alert["alert_type"],
                        "severity": alert.get("severity", "MEDIUM"),
                        "confidence": alert.get("confidence", 1.0),
                        "timestamp": now_iso,
                        "snapshot_path": alert_snap_path,
                        "details": alert.get("details", f"Alert triggered for track {alert_track_id}")
                    })


async def sweep_expired():
    current_time = time.time()
    now_iso = datetime.now(timezone.utc).isoformat()
    expired_keys = []
    
    for key, obj in active_objects.items():
        if current_time - obj["last_seen_at"] > TRACK_EXPIRY_SEC:
            expired_keys.append(key)
            
    for key in expired_keys:
        obj = active_objects.pop(key)
        
        duration = obj["last_seen_at"] - obj["first_seen_at"]
        avg_conf = obj["confidence_sum"] / max(1, obj["total_frames"])
        
        # Insert EXIT log
        await insert_event_log({
            "id": str(uuid.uuid4()),
            "object_id": obj["object_id"],
            "event_type": "EXIT",
            "source_id": obj["source_id"],
            "track_id": obj["track_id"],
            "global_id": obj.get("global_id"),
            "object_type": obj["object_type"],
            "object_subtype": obj.get("object_subtype"),
            "timestamp": now_iso,
            "position": obj["positions"][-1] if obj["positions"] else None,
            "confidence": avg_conf, # using avg conf for exit
            "snapshot_path": obj.get("best_snapshot_path"), # Provide best snapshot at exit
            "duration_seconds": duration,
            "total_frames_seen": obj["total_frames"],
            "trajectory_summary": obj["positions"],
            "best_snapshot_path": obj.get("best_snapshot_path"),
            "best_confidence": obj["best_confidence"],
            "avg_confidence": avg_conf,
            "metadata": obj.get("metadata", {})
        })
