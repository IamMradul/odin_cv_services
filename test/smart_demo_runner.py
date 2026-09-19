import sys
from pathlib import Path
import cv2

TEST_DIR = Path(__file__).parent
PROJECT_DIR = TEST_DIR.parent
DEMO_DIR = PROJECT_DIR / "Demo_v"
OUT_DIR = TEST_DIR / "outputs" / "demo_results_smart"
OUT_DIR.mkdir(parents=True, exist_ok=True)

from loader import load_model_module
print("Loading standard models...")
human_mod = load_model_module("human-detection")
vehicle_mod = load_model_module("vehicle-detection")
try:
    anpr_mod = load_model_module("anpr")
    has_anpr = True
except Exception as e:
    print(f"Warning: Could not load ANPR module: {e}")
    has_anpr = False

suspicious_path = str(PROJECT_DIR / "services" / "suspicious-activity")
if suspicious_path not in sys.path:
    sys.path.insert(0, suspicious_path)
from app.detector import SuspiciousActivityDetector

face_path = str(PROJECT_DIR / "services" / "face-detection")
if face_path not in sys.path:
    sys.path.insert(0, face_path)
try:
    from src.detector import FaceDetector
    face_detector_class = FaceDetector
except ImportError:
    print("Warning: face-detection dependencies missing (insightface). Face detection will be disabled.")
    face_detector_class = None

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

def draw_face(frame, detections, color):
    for d in detections:
        x1, y1, x2, y2 = d.bbox
        label = f'Face {d.det_score:.2f}'
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(frame, label, (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

def draw_anpr(frame, detections, color):
    for d in detections:
        x1, y1, x2, y2 = d["box"]
        text = d.get("plate_text") or "unreadable"
        label = f'{text} ({d.get("ocr_confidence", 0):.2f})'
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(frame, label, (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

video_tasks = {
    "carmove.mp4": ["vehicle", "anpr"],
    "crowd.mp4": ["human", "face"],
    "night.mp4": ["human", "vehicle"],
    "nightcar.mp4": ["vehicle", "anpr"],
    "vech.mp4": ["vehicle", "anpr"],
    "wep.mp4": ["human", "suspicious"]
}

mp4_files = list(DEMO_DIR.glob("*.mp4"))
print(f"Found {len(mp4_files)} videos in {DEMO_DIR}")

for video_path in mp4_files:
    print(f"\n--- Processing: {video_path.name} ---")
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"Could not open {video_path}, skipping.")
        continue
        
    tasks = video_tasks.get(video_path.name, ["human", "vehicle", "suspicious"])
    print(f"  Tasks for this video: {tasks}")

    human_detector = human_mod.HumanDetector() if "human" in tasks else None
    vehicle_detector = vehicle_mod.VehicleDetector() if "vehicle" in tasks else None
    suspicious_detector = SuspiciousActivityDetector() if "suspicious" in tasks else None
    face_detector = face_detector_class() if ("face" in tasks and face_detector_class) else None
    anpr_weights = TEST_DIR / "models" / "license_plate_detector.pt"
    anpr_detector = anpr_mod.ANPRDetector(plate_weights=str(anpr_weights)) if ("anpr" in tasks and has_anpr and anpr_weights.exists()) else None
    
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    out_video_path = OUT_DIR / f"out_{video_path.name}"
    out = cv2.VideoWriter(str(out_video_path), cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))
    
    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_count += 1
        
        if human_detector:
            draw(frame, human_detector.infer(frame), (0, 255, 0))       # green
        if vehicle_detector:
            draw(frame, vehicle_detector.infer(frame), (255, 128, 0))   # orange
        if suspicious_detector:
            draw_suspicious(frame, suspicious_detector.infer(frame), (0, 0, 255))  # red
        if face_detector:
            draw_face(frame, face_detector.detect(frame), (255, 0, 255)) # magenta
        if anpr_detector:
            draw_anpr(frame, anpr_detector.infer(frame), (0, 255, 255)) # yellow

        out.write(frame)
        if frame_count % 100 == 0:
            print(f"  Processed {frame_count} frames...")
            
    cap.release()
    out.release()
    print(f"Finished {video_path.name} -> {out_video_path.name}")

print(f"\nAll processing complete.")
