# test/combined_test.py
import json
from pathlib import Path
import cv2
from loader import load_model_module

TEST_DIR = Path(__file__).parent
(TEST_DIR / "outputs").mkdir(parents=True, exist_ok=True)


human_mod = load_model_module("human-detection")
vehicle_mod = load_model_module("vehicle-detection")
anpr_mod = load_model_module("anpr")

human_detector = human_mod.HumanDetector()
vehicle_detector = vehicle_mod.VehicleDetector()
anpr_detector = anpr_mod.ANPRDetector(
    plate_weights=str(TEST_DIR / "models" / "license_plate_detector.pt")
)

video_path = TEST_DIR / "test_clips.mp4"
cap = cv2.VideoCapture(str(video_path))
if not cap.isOpened():
    raise RuntimeError(f"Could not open {video_path}")

fps = cap.get(cv2.CAP_PROP_FPS) or 25
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
print(f"Opened video: {w}x{h} @ {fps}fps")

out = cv2.VideoWriter(str(TEST_DIR / "outputs" / "combined_output.avi"),
                       cv2.VideoWriter_fourcc(*"XVID"), fps, (w, h))

def draw(frame, detections, color):
    for d in detections:
        x1, y1, x2, y2 = d["box"]
        label = f'{d["label"]} #{d.get("track_id")} {d["confidence"]:.2f}'
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(frame, label, (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

plate_summary = {}   # plate_text -> summary dict

frame_count = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frame_count += 1
    timestamp_sec = round(frame_count / fps, 2)

    draw(frame, human_detector.infer(frame), (0, 255, 0))       # green
    draw(frame, vehicle_detector.infer(frame), (255, 128, 0))   # orange

    for d in anpr_detector.infer(frame):
        x1, y1, x2, y2 = d["box"]
        text = d["plate_text"] or "UNREADABLE"
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)  # red
        cv2.putText(frame, text, (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        if text == "UNREADABLE":
            continue  # don't pollute the summary with failed OCR reads

        if text not in plate_summary:
            plate_summary[text] = {
                "plate_text": text,
                "first_seen_sec": timestamp_sec,
                "last_seen_sec": timestamp_sec,
                "times_seen": 1,
                "best_confidence": d["confidence"],
                "best_ocr_confidence": d["ocr_confidence"],
            }
        else:
            entry = plate_summary[text]
            entry["last_seen_sec"] = timestamp_sec
            entry["times_seen"] += 1
            # keep the highest-confidence OCR reading, not just the latest
            if d["ocr_confidence"] > entry["best_ocr_confidence"]:
                entry["best_ocr_confidence"] = d["ocr_confidence"]
                entry["best_confidence"] = d["confidence"]

    out.write(frame)
    if frame_count % 30 == 0:
        print(f"processed {frame_count} frames...")

cap.release()
out.release()

log_path = TEST_DIR / "outputs" / "plate_summary.json"
with open(log_path, "w") as f:
    json.dump(list(plate_summary.values()), f, indent=2)

print(f"done -> combined_output.avi ({frame_count} frames)")
print(f"logged {len(plate_summary)} unique plates -> {log_path}")