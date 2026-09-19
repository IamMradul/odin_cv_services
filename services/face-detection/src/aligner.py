import cv2
import numpy as np

def align_face(frame: np.ndarray, landmarks: np.ndarray, output_size=(112, 112)) -> np.ndarray:
    """
    Aligns a face using ArcFace 3-point canonical coordinates.
    landmarks should be 5x2 (kps from InsightFace).
    We use left_eye, right_eye, nose tip.
    """
    if landmarks.shape != (5, 2):
        raise ValueError(f"Expected landmarks of shape (5, 2), got {landmarks.shape}")
        
    left_eye = landmarks[0]
    right_eye = landmarks[1]
    nose = landmarks[2]
    
    src = np.array([left_eye, right_eye, nose], dtype=np.float32)
    
    # ArcFace standard reference points for 112x112
    dst = np.array([
        [38.2946, 51.6963],
        [73.5318, 51.5014],
        [56.0252, 71.7366]
    ], dtype=np.float32)
    
    M, _ = cv2.estimateAffinePartial2D(src, dst)
    aligned = cv2.warpAffine(frame, M, output_size, borderValue=0.0)
    return aligned
