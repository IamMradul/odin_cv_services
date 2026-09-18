import numpy as np
from ultralytics import YOLO
from . import config

class WeaponDetector:
    def __init__(self, weights_path: str = "yolov8n.pt"): # Defaulting to standard model if weapon model not provided, ideally change to 'weapon_detector.pt' when available
        # Note: For demo, if a dedicated weapon model isn't available, we might just load YOLOv8n
        # but in production this must point to a weapon-finetuned model.
        try:
            self.model = YOLO(weights_path)
        except Exception as e:
            print(f"Warning: Could not load weapon model {weights_path}: {e}")
            self.model = None
            
        # Assuming classes 0: gun, 1: knife for a custom weapon model
        # Adjust these based on the actual model used
        self.weapon_classes = {0: "gun", 1: "knife", 2: "sharp_object"}
        # If using standard yolov8 for testing, knife is sometimes 43.

    def detect(self, frame: np.ndarray):
        detections = []
        if self.model is None:
            return detections
            
        results = self.model(frame, verbose=False, device="cuda" if torch.cuda.is_available() else "cpu")[0]
        
        if results.boxes is not None:
            for box in results.boxes:
                conf = float(box.conf[0])
                if conf < config.WEAPON_CONFIDENCE:
                    continue
                    
                cls_id = int(box.cls[0])
                
                # If we're using a standard COCO model as fallback, let's map knife (43)
                label = self.weapon_classes.get(cls_id, "weapon")
                if label == "weapon" and cls_id == 43:
                     label = "knife"
                     
                xyxy = [int(v) for v in box.xyxy[0].tolist()]
                
                detections.append({
                    "label": label,
                    "confidence": conf,
                    "box": xyxy
                })
                
        return detections

import torch # added torch import just in case
