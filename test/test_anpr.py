import cv2
from pathlib import Path
from loader import load_model_module

anpr_mod = load_model_module("anpr")

TEST_DIR = Path(__file__).parent
(TEST_DIR / "outputs").mkdir(parents=True, exist_ok=True)
weights_path = TEST_DIR / "models" / "license_plate_detector.pt"
detector = anpr_mod.ANPRDetector(plate_weights=str(weights_path))

video_path = TEST_DIR / "test_clips.mp4"
cap = cv2.VideoCapture(str(video_path))
if not cap.isOpened():
    raise RuntimeError(f"Could not open {video_path}")

fps = cap.get(cv2.CAP_PROP_FPS) or 25
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
print(f"Opened video: {w}x{h} @ {fps}fps")

out_path = TEST_DIR / "outputs" / "anpr_output.avi"
out = cv2.VideoWriter(str(out_path), cv2.VideoWriter_fourcc(*"XVID"), fps, (w, h))

frame_count = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frame_count += 1

    for d in detector.infer(frame):
        x1, y1, x2, y2 = d["box"]
        text = d["plate_text"] or "unreadable"
        label = f'{text} ({d["ocr_confidence"]:.2f})'
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(frame, label, (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    out.write(frame)
    if frame_count % 30 == 0:
        print(f"processed {frame_count} frames...")

cap.release()
out.release()
print(f"done -> {out_path} ({frame_count} frames)")