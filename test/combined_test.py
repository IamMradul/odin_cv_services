# test/combined_test.py
import json
from pathlib import Path
import cv2
import sys

# Force stdout to be line-buffered to fix missing prints during long runs
sys.stdout.reconfigure(line_buffering=True)

from loader import load_model_module

TEST_DIR = Path(__file__).parent
(TEST_DIR / "outputs").mkdir(parents=True, exist_ok=True)


human_mod = load_model_module("human-detection")
vehicle_mod = load_model_module("vehicle-detection")

human_detector = human_mod.HumanDetector()
vehicle_detector = vehicle_mod.VehicleDetector()

import sys
suspicious_path = str(TEST_DIR.parent / "services" / "suspicious-activity")
if suspicious_path not in sys.path:
    sys.path.insert(0, suspicious_path)
from app.detector import SuspiciousActivityDetector  # type: ignore
suspicious_detector = SuspiciousActivityDetector()

video_path = TEST_DIR.parent / "Demo_v" / "wep.mp4"
cap = cv2.VideoCapture(str(video_path))
if not cap.isOpened():
    raise RuntimeError(f"Could not open {video_path}")

fps = cap.get(cv2.CAP_PROP_FPS) or 25
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
print(f"Opened video: {w}x{h} @ {fps}fps")

out = cv2.VideoWriter(str(TEST_DIR / "outputs" / "out_wep.avi"),
                       cv2.VideoWriter_fourcc(*"XVID"), fps, (w, h))

def draw(frame, detections, color):
    for d in detections:
        x1, y1, x2, y2 = d["box"]
        label = f'{d["label"]} #{d.get("track_id")} {d["confidence"]:.2f}'
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(frame, label, (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

def draw_suspicious(frame, detections, color):
    for d in detections:
        x1, y1, x2, y2 = d.box
        label = f'ALERT: {d.alert_type} ({d.severity}) {d.confidence:.2f}'
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
        cv2.putText(frame, label, (x1, y1 - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

frame_count = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frame_count += 1
    timestamp_sec = round(frame_count / fps, 2)

    draw(frame, human_detector.infer(frame), (0, 255, 0))       # green
    draw(frame, vehicle_detector.infer(frame), (255, 128, 0))   # orange
    
    suspicious_detections = suspicious_detector.infer(frame)
    draw_suspicious(frame, suspicious_detections, (0, 0, 255))  # red

    out.write(frame)
    if frame_count % 30 == 0:
        print(f"processed {frame_count} frames...")

cap.release()
out.release()

print(f"done -> outputs/out_wep.avi ({frame_count} frames)")