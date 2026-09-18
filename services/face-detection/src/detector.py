import cv2
import numpy as np
from dataclasses import dataclass
from typing import List, Tuple, Optional
import warnings

# Suppress InsightFace future warnings
warnings.filterwarnings("ignore", category=FutureWarning)
from insightface.app import FaceAnalysis

@dataclass
class FaceResult:
    bbox: Tuple[int, int, int, int]
    landmarks: np.ndarray  # 5x2 kps
    embedding: np.ndarray  # 512-d
    det_score: float
    quality: dict

class FaceDetector:
    def __init__(self, det_size=(640, 640)):
        self.app = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
        self.app.prepare(ctx_id=0, det_size=det_size)

    def detect(self, image_input) -> List[FaceResult]:
        """
        Detects faces in an image (path or numpy array).
        """
        if isinstance(image_input, str):
            img = cv2.imread(image_input)
            if img is None:
                raise ValueError(f"Failed to load image: {image_input}")
        else:
            img = image_input

        faces = self.app.get(img)
        
        results = []
        for f in faces:
            x1, y1, x2, y2 = [int(v) for v in f.bbox]
            bbox = (x1, y1, x2, y2)
            quality = self._assess_quality(img, bbox)
            
            results.append(FaceResult(
                bbox=bbox,
                landmarks=f.kps,
                embedding=f.embedding,
                det_score=float(f.det_score),
                quality=quality
            ))
        return results

    def _assess_quality(self, img: np.ndarray, bbox: Tuple[int, int, int, int]) -> dict:
        x1, y1, x2, y2 = bbox
        h, w = img.shape[:2]
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        
        face_w = x2 - x1
        face_h = y2 - y1
        
        if face_w <= 0 or face_h <= 0:
            return {"is_blurry": True, "is_tiny": True, "blur_score": 0.0, "face_size": (0, 0)}
            
        cropped = img[y1:y2, x1:x2]
        gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        return {
            "is_blurry": bool(laplacian_var < 100.0),
            "is_tiny": bool(face_w < 80 or face_h < 80),
            "blur_score": float(laplacian_var),
            "face_size": (face_w, face_h)
        }
