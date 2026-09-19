import os
import cv2
import sys
import numpy as np

sys.path.append(os.path.abspath("services/face-detection"))
from src.detector import FaceDetector

def main():
    detector = FaceDetector()
    
    # Get last 5 images from unidentified
    unidentified_dir = "services/face-detection/data/unidentified"
    if not os.path.exists(unidentified_dir):
        print("No unidentified images.")
        return
        
    files = sorted([os.path.join(unidentified_dir, f) for f in os.listdir(unidentified_dir) if f.endswith(".jpg")], key=os.path.getmtime)
    
    if len(files) < 2:
        print("Need at least 2 images to compare.")
        return
        
    recent_files = files[-5:]
    print("Extracting embeddings for:")
    
    embeddings = []
    for f in recent_files:
        print(f)
        img = cv2.imread(f)
        faces = detector.detect(img)
        if faces:
            # use the first face
            emb = faces[0].embedding
            norm = np.linalg.norm(emb)
            if norm > 0:
                emb = emb / norm
            embeddings.append(emb)
        else:
            print(f"No face found in {f}")
            
    if len(embeddings) >= 2:
        print("\nCosine Similarities:")
        for i in range(len(embeddings)):
            for j in range(i+1, len(embeddings)):
                sim = np.dot(embeddings[i], embeddings[j])
                print(f"Img {i} vs Img {j}: {sim:.4f}")

if __name__ == "__main__":
    main()
