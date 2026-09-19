import os
import sys
import numpy as np
import faiss

sys.path.append(os.path.abspath("services/face-detection"))
from src.faiss_index import EmbeddingIndex

def main():
    index_path = "services/face-detection/data/faiss.index"
    id_map_path = "services/face-detection/data/id_map.json"
    
    index = EmbeddingIndex(device="cpu")
    if not index.load(index_path, id_map_path):
        print("Could not load FAISS index.")
        return
        
    ntotal = index.index.ntotal
    print(f"Loaded FAISS index with {ntotal} faces.")
    
    if ntotal == 0:
        print("No faces to fix.")
        return
        
    # Reconstruct all vectors
    vecs = index.cpu_index.reconstruct_n(0, ntotal)
    
    # Normalize them
    normalized_vecs = []
    fixed_count = 0
    for i, vec in enumerate(vecs):
        norm = np.linalg.norm(vec)
        if abs(norm - 1.0) > 1e-4 and norm > 0:
            vec = vec / norm
            fixed_count += 1
        normalized_vecs.append(vec)
        
    if fixed_count == 0:
        print("All vectors are already normalized!")
        return
        
    print(f"Fixed {fixed_count} un-normalized vectors.")
    
    # Rebuild index
    new_cpu_index = faiss.IndexFlatIP(index.dimension)
    new_cpu_index.add(np.array(normalized_vecs).astype(np.float32))
    
    index.cpu_index = new_cpu_index
    index.index = new_cpu_index
    
    # Save back
    index.save(index_path, id_map_path)
    print("Successfully saved normalized FAISS database!")

if __name__ == "__main__":
    main()
