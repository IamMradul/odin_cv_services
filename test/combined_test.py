import importlib.util
import sys
from pathlib import Path
import cv2

ROOT = Path(__file__).resolve().parent.parent
SERVICES = ROOT / "services"

def load_model_module(service_name):
    path = SERVICES / service_name / "app" / "model.py"
    spec = importlib.util.spec_from_file_location(f"{service_name}_model", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


# Load the model modules which ever you guys coded
human_mod = load_model_module("human-detection")
vehicle_mod = load_model_module("vehicle-detection")


human_detector = human_mod.HumanDetector()
vehicle_detector = vehicle_mod.VehicleDetector()

VIDEO_PATH = Path(__file__).parent / "test_clips.mp4"   # or if you want some other video you want to test with, change this path to point to it
cap = cv2.VideoCapture(str(VIDEO_PATH))
if not cap.isOpened():
    raise RuntimeError(f"Could not open {VIDEO_PATH}")

fps = cap.get(cv2.CAP_PROP_FPS) or 25
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
print(f"Opened video: {w}x{h} @ {fps}fps")

out = cv2.VideoWriter(str(Path(__file__).parent / "combined_output.avi"),
                       cv2.VideoWriter_fourcc(*"XVID"), fps, (w, h))

def draw(frame, detections, color):
    for d in detections:
        x1, y1, x2, y2 = d["box"]
        label = f'{d["label"]} #{d["track_id"]} {d["confidence"]:.2f}'
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(frame, label, (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

frame_count = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frame_count += 1


    # ye bhi dekh lena bhai
    draw(frame, human_detector.infer(frame), (0, 255, 0))     # green = human
    draw(frame, vehicle_detector.infer(frame), (255, 128, 0)) # blue-orange = vehicle

    out.write(frame)
    if frame_count % 30 == 0:
        print(f"processed {frame_count} frames...")

cap.release()
out.release()
print(f"done -> combined_output.avi ({frame_count} frames)")


