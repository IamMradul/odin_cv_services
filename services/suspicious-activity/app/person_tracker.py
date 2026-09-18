import time
from collections import deque
import numpy as np
import torch
from ultralytics import YOLO
from . import config

class PersonTracker:
    def __init__(self, weights_path: str = "yolov8n-pose.pt"):
        self.model = YOLO(weights_path)
        self.person_class_id = 0
        
        # State: track_id -> deque of (x_center, y_center, timestamp)
        self.track_history = {}

    def _cleanup_stale_tracks(self, current_time):
        stale_ids = []
        for track_id, history in self.track_history.items():
            if not history:
                stale_ids.append(track_id)
                continue
            
            last_time = history[-1][2]
            if current_time - last_time > config.TRACK_EXPIRY_SEC:
                stale_ids.append(track_id)
                
        for track_id in stale_ids:
            del self.track_history[track_id]

    def detect_and_track(self, frame: np.ndarray):
        current_time = time.time()
        self._cleanup_stale_tracks(current_time)
        
        results = self.model.track(
            frame,
            persist=True,
            classes=[self.person_class_id],
            device="cuda" if torch.cuda.is_available() else "cpu",
            verbose=False,
        )[0]
        
        tracked_persons = []
        
        if results.boxes is not None:
            # For pose models, results.keypoints contains the pose data
            keypoints = None
            if hasattr(results, 'keypoints') and results.keypoints is not None:
                keypoints = results.keypoints.data.cpu().numpy() # Shape: (N, 17, 3) where N is number of boxes
                
            for i, box in enumerate(results.boxes):
                conf = float(box.conf[0])
                if conf < config.PERSON_CONFIDENCE:
                    continue
                    
                xyxy = [int(v) for v in box.xyxy[0].tolist()]
                track_id = int(box.id[0]) if box.id is not None else None
                
                # Extract keypoints for this person if available
                person_keypoints = None
                if keypoints is not None and i < len(keypoints):
                    person_keypoints = keypoints[i] # 17x3 array (x, y, conf)
                
                if track_id is not None:
                    # Calculate centroid
                    cx = (xyxy[0] + xyxy[2]) / 2.0
                    cy = (xyxy[1] + xyxy[3]) / 2.0
                    
                    if track_id not in self.track_history:
                        self.track_history[track_id] = deque(maxlen=config.MAX_TRACK_HISTORY)
                        
                    self.track_history[track_id].append((cx, cy, current_time))
                    
                tracked_persons.append({
                    "track_id": track_id,
                    "box": xyxy,
                    "confidence": conf,
                    "history": list(self.track_history.get(track_id, [])),
                    "keypoints": person_keypoints
                })
                
        return tracked_persons
