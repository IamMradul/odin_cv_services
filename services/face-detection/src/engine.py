import uuid
import numpy as np
import cv2
import os
from typing import Dict, Any

from src.faiss_index import EmbeddingIndex
from src.registry import PersonRegistry

HIGH_CONF = 0.70

class ClassificationEngine:
    def __init__(self, index: EmbeddingIndex, registry: PersonRegistry):
        self.index = index
        self.registry = registry

    def classify_and_save(self, img: np.ndarray, bbox: tuple, embedding: np.ndarray) -> Dict[str, Any]:
        score, person_id = self.index.search(embedding, top_k=1)
        snap_id = uuid.uuid4().hex
        
        # Determine match
        is_match = False
        person = None
        if person_id is not None and score is not None and score >= HIGH_CONF:
            person = self.registry.get(person_id)
            if person:
                is_match = True
        
        if is_match:
            status = person.status
            # Map status to folder
            folder = status if status in ["safe", "threat", "unidentified"] else "unidentified"
            snapshot_path = f"data/{folder}/{snap_id}.jpg"
            
            # Log sighting
            self.registry.log_sighting(person_id, "api_upload", score, snapshot_path)
            
            self._save_snapshot(img, bbox, snapshot_path)
            
            return {
                "person_id": person_id,
                "status": status,
                "confidence": score,
                "enrolled": False,
                "snapshot_path": snapshot_path
            }
        else:
            # No match or low confidence -> enroll as unidentified
            new_id = uuid.uuid4().hex
            status = "unidentified"
            snapshot_path = f"data/{status}/{snap_id}.jpg"
            
            # Add to FAISS index
            self.index.add(new_id, embedding)
            
            # Add to Registry
            self.registry.create(new_id, status=status)
            self.registry.log_sighting(new_id, "api_upload", 1.0, snapshot_path)
            
            self._save_snapshot(img, bbox, snapshot_path)
            
            return {
                "person_id": new_id,
                "status": status,
                "confidence": None,
                "enrolled": True,
                "snapshot_path": snapshot_path
            }

    def _save_snapshot(self, img: np.ndarray, bbox: tuple, snapshot_path: str):
        x1, y1, x2, y2 = [int(v) for v in bbox]
        h, w = img.shape[:2]
        # Add margin
        mx1, my1 = max(0, x1-20), max(0, y1-20)
        mx2, my2 = min(w, x2+20), min(h, y2+20)
        cropped = img[my1:my2, mx1:mx2]
        
        if cropped.size != 0:
            os.makedirs(os.path.dirname(snapshot_path), exist_ok=True)
            cv2.imwrite(snapshot_path, cropped)
