import os
import sys
import uuid
import numpy as np
import cv2

# Ensure we can import from services/face-detection
sys.path.append(os.path.abspath("services/face-detection"))

from src.detector import FaceDetector
from src.faiss_index import EmbeddingIndex
from src.registry import PersonRegistry

def main():
    print("========================================")
    print("Starting face enrollment process...")
    print("========================================")
    
    INDEX_PATH = "services/face-detection/data/faiss.index"
    ID_MAP_PATH = "services/face-detection/data/id_map.json"
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Initialize components
    print("Initializing models (this may take a few seconds)...")
    detector = FaceDetector()
    index = EmbeddingIndex(device="cpu")
    index.load(INDEX_PATH, ID_MAP_PATH)
    
    try:
        registry = PersonRegistry(REDIS_URL)
    except Exception as e:
        print(f"Error connecting to Redis: {e}")
        print("Please ensure Redis is running (e.g., via startup.bat) before enrolling faces.")
        return
    
    data_dir = "services/face-detection/data"
    categories = ["safe", "threat"]
    
    total_enrolled = 0
    
    for category in categories:
        folder_path = os.path.join(data_dir, category)
        if not os.path.exists(folder_path):
            print(f"Skipping {category} (folder not found: {folder_path})")
            continue
            
        print(f"\nScanning folder: {folder_path} for category: '{category}'")
        files = os.listdir(folder_path)
        if not files:
            print("  - Folder is empty.")
            
        for filename in files:
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                filepath = os.path.join(folder_path, filename)
                print(f"Processing {filename}...")
                
                try:
                    faces = detector.detect(filepath)
                    if not faces:
                        print(f"  - No faces detected in {filename}")
                        continue
                        
                    # Use the largest face if multiple are detected
                    faces = sorted(faces, key=lambda f: (f.bbox[2]-f.bbox[0])*(f.bbox[3]-f.bbox[1]), reverse=True)
                    face = faces[0]
                    
                    # Normalize embedding for Cosine Similarity
                    embedding = face.embedding
                    norm = np.linalg.norm(embedding)
                    if norm > 0:
                        embedding = embedding / norm
                        
                    # Generate ID and register
                    person_id = uuid.uuid4().hex
                    
                    # Add to FAISS
                    index.add(person_id, embedding)
                    
                    # Add to Registry
                    registry.create(person_id, status=category)
                    
                    # Optionally log a sighting so it shows up with an image
                    registry.log_sighting(person_id, "enrollment", 1.0, f"data/{category}/{filename}")
                    
                    print(f"  + Enrolled {filename} as '{category}' (ID: {person_id})")
                    total_enrolled += 1
                    
                except Exception as e:
                    print(f"  - Error processing {filename}: {e}")
                    
    if total_enrolled > 0:
        print("\nSaving FAISS index...")
        index.save(INDEX_PATH, ID_MAP_PATH)
        print(f"========================================")
        print(f"Enrollment complete. {total_enrolled} faces successfully enrolled.")
        print("IMPORTANT: You must restart your services (close windows & run startup.bat again)")
        print("for the face-detection service to load the newly enrolled faces.")
        print("========================================")
    else:
        print("\nNo new faces were enrolled.")

if __name__ == "__main__":
    main()
