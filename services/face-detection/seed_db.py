import os
import cv2
import uuid
import numpy as np
from src.detector import FaceDetector
from src.faiss_index import EmbeddingIndex
from src.registry import PersonRegistry

def seed_database():
    print("Loading FaceDetector...")
    face_detector = FaceDetector()
    
    print("Loading FAISS index...")
    INDEX_PATH = "data/faiss.index"
    ID_MAP_PATH = "data/id_map.json"
    embedding_index = EmbeddingIndex(device="cpu")
    embedding_index.load(INDEX_PATH, ID_MAP_PATH)
    
    print("Loading PersonRegistry...")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    person_registry = PersonRegistry(REDIS_URL)

    osint_dir = "id_osint"
    if not os.path.exists(osint_dir):
        print(f"Directory {osint_dir} not found!")
        return

    # Set status to 'safe' so they appear properly in the UI
    status = "safe"

    for filename in os.listdir(osint_dir):
        if not filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            continue
            
        filepath = os.path.join(osint_dir, filename)
        name = os.path.splitext(filename)[0] # e.g. aks.jpeg -> aks
        
        print(f"Processing {name} from {filename}...")
        img = cv2.imread(filepath)
        if img is None:
            print(f"Failed to read {filepath}")
            continue
            
        faces = face_detector.detect(img)
        if not faces:
            print(f"No face detected in {filename}")
            continue
            
        # Assume the largest face is the target
        f = faces[0]
        
        # Normalize embedding
        norm = np.linalg.norm(f.embedding)
        if norm > 0:
            f.embedding = f.embedding / norm
            
        # Use name as ID for easy identification
        person_id = name
        
        # Add to FAISS
        embedding_index.add(person_id, f.embedding)
        
        # Register in Redis
        # Delete if exists to recreate
        person_registry.r.delete(f"person:{person_id}")
        person_registry.r.srem("persons:all", person_id)
        person_registry.r.srem(f"persons:by_status:safe", person_id)
        person_registry.r.srem(f"persons:by_status:threat", person_id)
        person_registry.r.srem(f"persons:by_status:unidentified", person_id)
        
        person_registry.create(person_id, status=status)
        
        # Save a snapshot of the face for the UI
        snapshot_path = f"data/snapshots/{person_id}.jpg"
        x1, y1, x2, y2 = [int(v) for v in f.bbox]
        h, w = img.shape[:2]
        mx1, my1 = max(0, x1-20), max(0, y1-20)
        mx2, my2 = min(w, x2+20), min(h, y2+20)
        cropped = img[my1:my2, mx1:mx2]
        if cropped.size != 0:
            os.makedirs(os.path.dirname(snapshot_path), exist_ok=True)
            cv2.imwrite(snapshot_path, cropped)
            
        # Log a sighting so it has at least one
        person_registry.log_sighting(person_id, "seed", 1.0, snapshot_path)
        
        print(f"Successfully seeded {person_id}")

    print("Saving FAISS index...")
    embedding_index.save(INDEX_PATH, ID_MAP_PATH)
    print("Done!")

if __name__ == "__main__":
    seed_database()
