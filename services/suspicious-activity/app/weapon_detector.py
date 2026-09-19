import os
import torch
import numpy as np
from ultralytics import YOLO
from . import config

class WeaponDetector:
    def __init__(self):
        # Resolve the model path relative to this file's directory
        base_dir = os.path.dirname(__file__)
        model_path = os.path.abspath(os.path.join(base_dir, "..", config.WEAPON_MODEL_PATH))
        
        try:
            self.model = YOLO(model_path)
            print(f"Loaded weapon model from {model_path}")
        except Exception as e:
            print(f"Warning: Could not load weapon model {model_path}: {e}")
            self.model = None

        # Fallback names in case the model doesn't have them
        self.fallback_names = {
            0: "Gun",
            1: "explosion",
            2: "grenade",
            3: "knife"
        }

    def detect(self, frame: np.ndarray):
        detections = []
        if self.model is None:
            return detections
            
        # Run inference
        results = self.model(frame, verbose=False, device="cuda" if torch.cuda.is_available() else "cpu")[0]
        
        if results.boxes is not None:
            for box in results.boxes:
                conf = float(box.conf[0])
                if conf < config.WEAPON_CONFIDENCE:
                    continue
                    
                cls_id = int(box.cls[0])
                
                # Get label from model.names or fallback
                label = self.model.names.get(cls_id, self.fallback_names.get(cls_id, f"class_{cls_id}"))
                
                # We specifically map them to capitalization standards used in the dashboard
                if label.lower() == "gun":
                    label = "Gun"
                elif label.lower() == "explosion":
                    label = "Explosive"
                elif label.lower() == "grenade":
                    label = "Grenade"
                elif label.lower() == "knife":
                    label = "Knife"

                xyxy = [int(v) for v in box.xyxy[0].tolist()]
                
                detections.append({
                    "label": label,
                    "confidence": conf,
                    "box": xyxy
                })
                
        return detections
