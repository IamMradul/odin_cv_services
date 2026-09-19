import sys
import os
import cv2
import argparse

# Add suspicious-activity directory to python path so we can import its modules
service_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services", "suspicious-activity"))
sys.path.append(service_dir)

from app.detector import SuspiciousActivityDetector

def main():
    parser = argparse.ArgumentParser(description="Test full Suspicious Activity Detector on video")
    parser.add_argument("--input", required=True, help="Path to input video file")
    parser.add_argument("--output", required=True, help="Path to save processed video (e.g., output.mp4)")
    args = parser.parse_args()

    # Load suspicious activity detector (which encapsulates WeaponDetector, PersonTracker, and BehaviorAnalyzer)
    print("Loading full Suspicious Activity detector (pose + tracking + weapons)...")
    detector = SuspiciousActivityDetector()
    
    cap = cv2.VideoCapture(args.input)
    if not cap.isOpened():
        print(f"Error opening video {args.input}")
        return

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Use mp4v codec for standard mp4 files
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(args.output, fourcc, fps, (width, height))

    print(f"Video: {width}x{height} @ {fps:.1f}fps, {total_frames} frames")
    print(f"Processing {args.input}...")
    
    frame_idx = 0
    total_alerts = 0
    alert_counts = {}
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Run inference (detects people, keypoints, weapons, and analyzes behavior)
        detections = detector.infer(frame)
        
        # Draw bounding boxes for any active alerts
        for det in detections:
            x1, y1, x2, y2 = det.box
            alert_type = det.alert_type
            severity = det.severity
            conf = det.confidence
            
            # Color based on severity
            color = (0, 0, 255) if severity == "CRITICAL" else (0, 140, 255) if severity == "HIGH" else (0, 255, 255)
            
            # Track stats
            alert_counts[alert_type] = alert_counts.get(alert_type, 0) + 1
            total_alerts += 1
            
            # Draw thick box
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
            
            # Label
            label_str = f"{alert_type}"
            if det.weapon_class:
                label_str += f" [{det.weapon_class}]"
            label_str += f" {conf:.2f}"
            
            (tw, th), _ = cv2.getTextSize(label_str, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            cv2.rectangle(frame, (x1, max(0, y1 - th - 10)), (x1 + tw, max(0, y1)), color, -1)
            cv2.putText(frame, label_str, (x1, max(0, y1 - 5)), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                        
        out.write(frame)
        frame_idx += 1
        
        if frame_idx % 100 == 0:
            pct = (frame_idx / total_frames) * 100
            print(f"  [{pct:.0f}%] Frame {frame_idx}/{total_frames} | Alerts so far: {total_alerts}")

    cap.release()
    out.release()
    
    print(f"\n{'='*50}")
    print(f"RESULTS")
    print(f"{'='*50}")
    print(f"Total frames processed: {frame_idx}")
    print(f"Total alerts triggered: {total_alerts}")
    print(f"\nAlerts by type:")
    for a_type, count in sorted(alert_counts.items(), key=lambda x: -x[1]):
        print(f"  {a_type}: {count}")
        
    print(f"\nFinished processing! Output saved to {args.output}")

if __name__ == "__main__":
    main()
