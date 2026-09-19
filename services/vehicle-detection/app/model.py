from ultralytics import YOLO
import numpy as np
import torch

class VehicleDetector:
    VEHICLE_CLASSES = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}

    def __init__(self, weights: str = "yolov8n.pt"):
        self.model = YOLO(weights)

    def infer(self, frame: np.ndarray):
        results = self.model.track(
            frame,
            persist=True,
            classes=list(self.VEHICLE_CLASSES.keys()),
            device="cuda" if torch.cuda.is_available() else "cpu",
            verbose=False,
        )[0]

        detections = []
        if results.boxes is not None:
            for box in results.boxes:
                cls_id = int(box.cls[0])
                xyxy = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                track_id = int(box.id[0]) if box.id is not None else None
                detections.append({
                    "label": self.VEHICLE_CLASSES.get(cls_id, "vehicle"),
                    "confidence": conf,
                    "box": [int(v) for v in xyxy],
                    "track_id": track_id,
                })
        return detections