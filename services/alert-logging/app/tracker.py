import time
import uuid
import json
import os
import cv2
import numpy as np
import asyncio
from datetime import datetime, timezone
from .config import TRACK_EXPIRY_SEC, TRAJECTORY_SAMPLE_INTERVAL, SNAPSHOT_DIR, CLIP_DIR
from .database import insert_event_log, insert_object_alert, update_retroactive_global_id

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

def create_clip_sync(frame_bytes_list, clip_id):
    if not frame_bytes_list:
        return None
    try:
        # Decode first frame to get dimensions
        nparr = np.frombuffer(frame_bytes_list[0], np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return None
        h, w = img.shape[:2]
        
        path = os.path.join(CLIP_DIR, f"{clip_id}.mp4")
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        # Assume 15 fps as rough estimate for the clip
        out = cv2.VideoWriter(path, fourcc, 15.0, (w, h))
        
        for f_bytes in frame_bytes_list:
            arr = np.frombuffer(f_bytes, np.uint8)
            frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if frame is not None:
                out.write(frame)
                
        out.release()
        return path
    except Exception as e:
        print(f"Error saving clip: {e}")
        return None

async def create_clip(frame_bytes_list, clip_id):
    return await asyncio.to_thread(create_clip_sync, frame_bytes_list, clip_id)

async def process_frame(source_id: str, detections: dict, frame_bytes: bytes):
    current_time = time.time()
    now_iso = datetime.now(timezone.utc).isoformat()
    
    # Flatten all detections that have a track_id
    tracked_items = []
    
    for service_name in ["human", "vehicle", "face", "anpr"]:
        res = detections.get(service_name)
        if res and res.get("ok"):
            for d in res.get("detections", []):
                if d.get("track_id") is not None:
                    tracked_items.append({**d, "object_type": service_name})

    for item in tracked_items:
        track_id = item["track_id"]
        key = (source_id, track_id)
        
        pos = get_center(item["box"])
        conf = item.get("confidence", 0.0)
        
        if key not in active_objects:
            # NEW OBJECT - ENTRY LOG
            obj_id = f"{source_id}_trk{track_id}_{int(current_time)}"
            snap_id = f"{obj_id}_entry"
            snap_path = await asyncio.to_thread(save_snapshot, frame_bytes, item["box"], snap_id)
            
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
                "global_id": item.get("person_id") or item.get("plate_text"),
                "frames": [frame_bytes] # Buffer frames for the clip
            }
            active_objects[key] = obj_data
            
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
            obj["frames"].append(frame_bytes)
            
            # Update global_id if we didn't have one and just found it
            new_global_id = item.get("person_id") or item.get("plate_text")
            if new_global_id and not obj["global_id"]:
                obj["global_id"] = new_global_id
                # Retroactively update the ENTRY log
                await update_retroactive_global_id(obj["object_id"], new_global_id)
            
            if obj["total_frames"] % TRAJECTORY_SAMPLE_INTERVAL == 0:
                pos["t"] = int(current_time - obj["first_seen_at"])
                obj["positions"].append(pos)
                
            if conf > obj["best_confidence"]:
                obj["best_confidence"] = conf
                obj["best_box"] = item["box"]
                if frame_bytes:
                     snap_id = f"{obj['object_id']}_best"
                     snap_path = await asyncio.to_thread(save_snapshot, frame_bytes, item["box"], snap_id)
                     if snap_path:
                         obj["best_snapshot_path"] = snap_path
                         
    # Process Alerts (from suspicious service)
    susp = detections.get("suspicious")
    if susp and susp.get("ok"):
        for alert in susp.get("detections", []):
            if alert.get("alert_type") and alert.get("track_id") is not None:
                alert_track_id = alert["track_id"]
                key = (source_id, alert_track_id)
                obj_id = None
                recent_frames = [frame_bytes]
                
                if key in active_objects:
                    obj_id = active_objects[key]["object_id"]
                    # Grab up to the last 150 frames (~5-10 seconds) for the alert clip
                    recent_frames = active_objects[key]["frames"][-150:]
                
                if obj_id:
                    alert_uuid = uuid.uuid4().hex[:8]
                    alert_snap_id = f"alert_{alert_uuid}"
                    alert_clip_id = f"alert_clip_{alert_uuid}"
                    
                    alert_snap_path = await asyncio.to_thread(save_snapshot, frame_bytes, alert["box"], alert_snap_id)
                    alert_clip_path = await create_clip(recent_frames, alert_clip_id)
                    
                    await insert_object_alert({
                        "id": str(uuid.uuid4()),
                        "object_id": obj_id,
                        "alert_type": alert["alert_type"],
                        "severity": alert.get("severity", "MEDIUM"),
                        "confidence": alert.get("confidence", 1.0),
                        "timestamp": now_iso,
                        "snapshot_path": alert_snap_path,
                        "clip_path": alert_clip_path,
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
        
        # Generate the full journey clip
        clip_id = f"{obj['object_id']}_full"
        clip_path = await create_clip(obj["frames"], clip_id)
        
        # Free up memory (frames list can be large)
        del obj["frames"]
        
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
            "confidence": avg_conf,
            "snapshot_path": obj.get("best_snapshot_path"),
            "duration_seconds": duration,
            "total_frames_seen": obj["total_frames"],
            "trajectory_summary": obj["positions"],
            "best_snapshot_path": obj.get("best_snapshot_path"),
            "best_confidence": obj["best_confidence"],
            "avg_confidence": avg_conf,
            "clip_path": clip_path,
            "metadata": obj.get("metadata", {})
        })
