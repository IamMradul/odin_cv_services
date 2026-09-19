import numpy as np

def normalize(vec: np.ndarray) -> np.ndarray:
    """
    L2 normalization of an embedding vector.
    This allows using Inner Product (IP) to compute Cosine Similarity in FAISS.
    """
    norm = np.linalg.norm(vec)
    if norm == 0:
        return vec
    return vec / norm

def get_embedding(face_result) -> np.ndarray:
    """
    Extracts and normalizes the embedding from a FaceResult.
    """
    return normalize(face_result.embedding)
