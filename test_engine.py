import os
import cv2
import sys
import numpy as np

sys.path.append(os.path.abspath("services/face-detection"))
from src.faiss_index import EmbeddingIndex

def main():
    index = EmbeddingIndex(device="cpu")
    if not index.load("services/face-detection/data/faiss.index", "services/face-detection/data/id_map.json"):
        print("Could not load FAISS index.")
        return
        
    print(f"Loaded FAISS index with {index.index.ntotal} faces.")
    
    # Let's check the norms of the first 5 embeddings in FAISS
    if index.index.ntotal > 0:
        print("\nChecking max similarities in FAISS:")
        vecs = index.cpu_index.reconstruct_n(0, index.index.ntotal)
        max_sim = 0
        for i in range(len(vecs)):
            for j in range(i+1, len(vecs)):
                sim = np.dot(vecs[i], vecs[j])
                if sim > max_sim:
                    max_sim = sim
                if sim > 0.40:
                    print(f"Face {i} vs Face {j}: {sim:.4f}")
        print(f"Max similarity between any two faces: {max_sim:.4f}")

if __name__ == "__main__":
    main()
