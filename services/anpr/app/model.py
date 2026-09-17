from ultralytics import YOLO
import easyocr
import cv2
import numpy as np

class ANPRDetector:
    def __init__(self, plate_weights: str = "license_plate_detector.pt"):
        self.plate_model = YOLO(plate_weights)
        self.reader = easyocr.Reader(['en'], gpu=True)

    def infer(self, frame: np.ndarray):
        results = self.plate_model(frame, device="cuda", verbose=False)[0]
        detections = []

        if results.boxes is not None:
            for box in results.boxes:
                xyxy = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                x1, y1, x2, y2 = [int(v) for v in xyxy]

                plate_crop = frame[y1:y2, x1:x2]
                if plate_crop.size == 0:
                    continue

                text, ocr_conf = self._read_plate(plate_crop)
                detections.append({
                    "label": "license_plate",
                    "confidence": conf,
                    "box": [x1, y1, x2, y2],
                    "plate_text": text,
                    "ocr_confidence": ocr_conf,
                })
        return detections

    def _read_plate(self, plate_img):
        gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
        results = self.reader.readtext(gray)
        if not results:
            return None, 0.0
        best = max(results, key=lambda r: r[2])
        text = best[1].upper().replace(" ", "")
        return text, float(best[2])