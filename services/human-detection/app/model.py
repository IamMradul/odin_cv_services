from ultralytics import YOLO
import numpy as np

class HumanDetector:
    def __init__(self, weights: str = "yolov8n.pt"):
        self.model = YOLO(weights)
        self.person_class_id = 0  # COCO class 0 = person

    def infer(self, frame: np.ndarray):
        results = self.model.track(
            frame,
            persist=True,
            classes=[self.person_class_id],
            device="cuda",
            verbose=False,
        )[0]

        detections = []
        if results.boxes is not None:
            for box in results.boxes:
                xyxy = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                track_id = int(box.id[0]) if box.id is not None else None
                detections.append({
                    "label": "person",
                    "confidence": conf,
                    "box": [int(v) for v in xyxy],
                    "track_id": track_id,
                })
        return detections