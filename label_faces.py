import sys
import os

# Add services/face-detection to path to import registry
sys.path.append(os.path.abspath("services/face-detection"))

from src.registry import PersonRegistry
import cv2

def main():
    try:
        registry = PersonRegistry("redis://localhost:6379")
    except Exception as e:
        print("Could not connect to Redis. Ensure it is running.")
        return

    unidentified = registry.list_by_status("unidentified")
    
    if not unidentified:
        print("No unidentified faces found in the database!")
        return
        
    print(f"Found {len(unidentified)} unidentified face(s).")
    print("Controls:")
    print("  's' -> Mark as SAFE")
    print("  't' -> Mark as THREAT")
    print("  'x' -> Skip this face")
    print("  'q' -> Quit")
    print("-" * 40)
    
    for p in unidentified:
        sightings = registry.get_sightings(p.id, limit=1)
        if not sightings:
            continue
            
        latest_sighting = sightings[0]
        # Image path is relative to services/face-detection
        img_path = os.path.join("services/face-detection", latest_sighting.snapshot_path)
        
        if not os.path.exists(img_path):
            print(f"Image not found: {img_path}. Skipping.")
            continue
            
        img = cv2.imread(img_path)
        if img is None:
            continue
            
        # Scale up image for easier viewing
        h, w = img.shape[:2]
        img = cv2.resize(img, (w*3, h*3))
        
        cv2.imshow("Label Faces (Make sure this window is focused)", img)
        print(f"\nViewing Person ID: {p.id}")
        print("Press 's' (safe), 't' (threat), 'x' (skip), or 'q' (quit)...")
        
        while True:
            key = cv2.waitKey(0) & 0xFF
            if key == ord('s'):
                registry.update_status(p.id, "safe", "admin")
                print(f"-> Marked as SAFE! The viewer will now draw a Green box for this person.")
                break
            elif key == ord('t'):
                registry.update_status(p.id, "threat", "admin")
                print(f"-> Marked as THREAT! The viewer will now draw a Red box for this person.")
                break
            elif key == ord('x'):
                print("-> Skipped.")
                break
            elif key == ord('q'):
                print("Exiting...")
                cv2.destroyAllWindows()
                return
                
    cv2.destroyAllWindows()
    print("\nFinished labeling all faces!")

if __name__ == "__main__":
    main()
