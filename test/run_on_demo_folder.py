import json
from pathlib import Path
# pyrefly: ignore [missing-import]
import cv2

# Import loader from current directory
from loader import load_model_module

TEST_DIR = Path(__file__).parent
PROJECT_DIR = TEST_DIR.parent
DEMO_DIR = PROJECT_DIR / "Demo_v"

OUT_DIR = TEST_DIR / "outputs" / "demo_results"
OUT_DIR.mkdir(parents=True, exist_ok=True)

print("Loading models...")
human_mod = load_model_module("human-detection")
vehicle_mod = load_model_module("vehicle-detection")
import sys
suspicious_path = str(PROJECT_DIR / "services" / "suspicious-activity")
if suspicious_path not in sys.path:
    sys.path.insert(0, suspicious_path)
from app.detector import SuspiciousActivityDetector  # type: ignore

print("Models modules loaded successfully.")

print("Models loaded successfully.")

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

mp4_files = list(DEMO_DIR.glob("*.mp4"))
print(f"Found {len(mp4_files)} videos in {DEMO_DIR}")

for video_path in mp4_files:
    print(f"\n--- Processing: {video_path.name} ---")
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"Could not open {video_path}, skipping.")
        continue
        
    print("  Initializing detectors for new video (to clear tracker state)...")
    human_detector = human_mod.HumanDetector()
    vehicle_detector = vehicle_mod.VehicleDetector()
    suspicious_detector = SuspiciousActivityDetector()
    
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    out_video_path = OUT_DIR / f"out_{video_path.name}"
    # Use mp4v codec for mp4
    out = cv2.VideoWriter(str(out_video_path), cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))
    
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
        if frame_count % 100 == 0:
            print(f"  Processed {frame_count} frames...")
            
    cap.release()
    out.release()
    print(f"Finished {video_path.name} -> {out_video_path.name}")

print(f"\nAll processing complete.")
