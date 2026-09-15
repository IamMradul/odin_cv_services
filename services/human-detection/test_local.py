import cv2
from app.model import HumanDetector

detector = HumanDetector()

cap = cv2.VideoCapture("test_video.mp4.f399-sr.mp4")
if not cap.isOpened():
    raise RuntimeError("Could not open test_video.mp4 — check the path/filename")

fps = cap.get(cv2.CAP_PROP_FPS) or 25
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
print(f"Opened video: {w}x{h} @ {fps}fps")

out = cv2.VideoWriter("output_annotated.avi", cv2.VideoWriter_fourcc(*"XVID"), fps, (w, h))

frame_count = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frame_count += 1

    detections = detector.infer(frame)
    for d in detections:
        x1, y1, x2, y2 = d["box"]
        label = f'{d["label"]} #{d["track_id"]} {d["confidence"]:.2f}'
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(frame, label, (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    out.write(frame)
    if frame_count % 30 == 0:
        print(f"processed {frame_count} frames...")

cap.release()
out.release()
print(f"done -> output_annotated.avi ({frame_count} total frames)")