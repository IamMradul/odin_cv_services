"""
Test script for the HuggingFace weapon detection model (best.pt).
Classes: 1=Gun, 2=Explosive, 3=Grenade, 4=Knife

Usage:
    python video_tests/test_weapon_video.py --input "path/to/video.mp4" --output "output.mp4"
    python video_tests/test_weapon_video.py --input "path/to/video.mp4" --output "output.mp4" --conf 0.3
"""
import cv2
import argparse
from ultralytics import YOLO
import os
import sys

# Add suspicious-activity directory to python path
service_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services", "suspicious-activity"))
sys.path.append(service_dir)

MODEL_PATH = os.path.join(service_dir, "best.pt")

CLASS_NAMES = {
    0: "Gun",       # some models are 0-indexed
    1: "Gun",
    2: "Explosive",
    3: "Grenade",
    4: "Knife",
}

# Colors per class (BGR)
CLASS_COLORS = {
    "Gun":       (0, 0, 255),     # Red
    "Explosive": (0, 100, 255),   # Orange
    "Grenade":   (0, 255, 255),   # Yellow
    "Knife":     (255, 0, 255),   # Magenta
}

def main():
    parser = argparse.ArgumentParser(description="Test weapon detection model on video")
    parser.add_argument("--input", required=True, help="Path to input video file")
    parser.add_argument("--output", required=True, help="Path to save processed video")
    parser.add_argument("--model", default=MODEL_PATH, help="Path to best.pt model file")
    parser.add_argument("--conf", type=float, default=0.35, help="Confidence threshold (default: 0.35)")
    parser.add_argument("--show", action="store_true", help="Show live preview window")
    args = parser.parse_args()

    model_path = os.path.abspath(args.model)
    print(f"Loading model from: {model_path}")
    model = YOLO(model_path)

    # Print model class names to verify mapping
    print(f"Model classes: {model.names}")

    cap = cv2.VideoCapture(args.input)
    if not cap.isOpened():
        print(f"Error: Cannot open video '{args.input}'")
        return

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(args.output, fourcc, fps, (width, height))

    print(f"Video: {width}x{height} @ {fps:.1f}fps, {total_frames} frames")
    print(f"Confidence threshold: {args.conf}")
    print(f"Processing...")

    frame_idx = 0
    total_detections = 0
    detection_counts = {}

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame, verbose=False, conf=args.conf)[0]

        if results.boxes is not None:
            for box in results.boxes:
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]

                # Use model's own class names if available, fallback to our mapping
                label = model.names.get(cls_id, CLASS_NAMES.get(cls_id, f"class_{cls_id}"))
                color = CLASS_COLORS.get(label, (0, 255, 0))

                # Track stats
                detection_counts[label] = detection_counts.get(label, 0) + 1
                total_detections += 1

                # Draw thick box
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)

                # Draw label background
                text = f"{label} {conf:.2f}"
                (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                cv2.rectangle(frame, (x1, max(0, y1 - th - 10)), (x1 + tw, max(0, y1)), color, -1)
                cv2.putText(frame, text, (x1, max(0, y1 - 5)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        # Frame counter overlay
        cv2.putText(frame, f"Frame: {frame_idx}/{total_frames}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        out.write(frame)

        if args.show:
            cv2.imshow("Weapon Detection Test", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        frame_idx += 1
        if frame_idx % 100 == 0:
            pct = (frame_idx / total_frames) * 100
            print(f"  [{pct:.0f}%] Frame {frame_idx}/{total_frames} | Detections so far: {total_detections}")

    cap.release()
    out.release()
    if args.show:
        cv2.destroyAllWindows()

    print(f"\n{'='*50}")
    print(f"RESULTS")
    print(f"{'='*50}")
    print(f"Total frames processed: {frame_idx}")
    print(f"Total detections: {total_detections}")
    print(f"\nDetections by class:")
    for cls_name, count in sorted(detection_counts.items(), key=lambda x: -x[1]):
        print(f"  {cls_name}: {count}")
    print(f"\nOutput saved to: {os.path.abspath(args.output)}")


if __name__ == "__main__":
    main()
