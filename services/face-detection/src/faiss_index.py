import faiss
import numpy as np
import json
import os
from typing import Tuple, Optional

class EmbeddingIndex:
    def __init__(self, device="gpu", dimension=512):
        self.dimension = dimension
        self.device = device
        
        # Inner Product = Cosine Similarity if vectors are L2-normalized
        self.cpu_index = faiss.IndexFlatIP(dimension)
        
        if self.device == "gpu":
            try:
                res = faiss.StandardGpuResources()
                self.index = faiss.index_cpu_to_gpu(res, 0, self.cpu_index)
            except AttributeError:
                print("Warning: faiss-gpu not found or no GPU available. Falling back to CPU.")
                self.index = self.cpu_index
                self.device = "cpu"
        else:
            self.index = self.cpu_index
            
        self.id_map = {} # dict[int, str] mapping FAISS internal ID to person_id

    def add(self, person_id: str, embedding: np.ndarray):
        if embedding.shape != (self.dimension,):
            embedding = embedding.reshape(-1)
            
        # Ensure it's 2D for faiss
        vec = embedding.astype(np.float32).reshape(1, -1)
        
        # FAISS gives us the internal IDs sequentially (ntotal before add)
        internal_id = self.index.ntotal
        self.index.add(vec)
        self.id_map[internal_id] = person_id

    def search(self, embedding: np.ndarray, top_k=1) -> Tuple[Optional[float], Optional[str]]:
        if self.index.ntotal == 0:
            return None, None
            
        if embedding.shape != (self.dimension,):
            embedding = embedding.reshape(-1)
            
        vec = embedding.astype(np.float32).reshape(1, -1)
        
        scores, indices = self.index.search(vec, top_k)
        
        best_score = float(scores[0][0])
        best_internal_id = int(indices[0][0])
        
        if best_internal_id == -1:
            return None, None
            
        person_id = self.id_map.get(best_internal_id)
        return best_score, person_id

    def save(self, index_path: str, id_map_path: str):
        # We must save the CPU index, so if we are using GPU, copy back to CPU first
        if self.device == "gpu":
            cpu_idx = faiss.index_gpu_to_cpu(self.index)
        else:
            cpu_idx = self.index
            
        os.makedirs(os.path.dirname(index_path), exist_ok=True)
        faiss.write_index(cpu_idx, index_path)
        
        os.makedirs(os.path.dirname(id_map_path), exist_ok=True)
        with open(id_map_path, 'w') as f:
            # Convert keys to str for JSON serialization
            json_map = {str(k): v for k, v in self.id_map.items()}
            json.dump(json_map, f)

    def load(self, index_path: str, id_map_path: str):
        if not os.path.exists(index_path) or not os.path.exists(id_map_path):
            return False
            
        self.cpu_index = faiss.read_index(index_path)
        
        if self.device == "gpu":
            try:
                res = faiss.StandardGpuResources()
                self.index = faiss.index_cpu_to_gpu(res, 0, self.cpu_index)
            except AttributeError:
                print("Warning: faiss-gpu not found or no GPU available. Falling back to CPU.")
                self.index = self.cpu_index
                self.device = "cpu"
        else:
            self.index = self.cpu_index
            
        with open(id_map_path, 'r') as f:
            json_map = json.load(f)
            self.id_map = {int(k): v for k, v in json_map.items()}
            
        return True
