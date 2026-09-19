import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File
import uvicorn
import os
from contextlib import asynccontextmanager

from src.detector import FaceDetector
from src.aligner import align_face
from src.embedder import get_embedding
from src.faiss_index import EmbeddingIndex
from src.registry import PersonRegistry
from src.engine import ClassificationEngine
from pydantic import BaseModel
from typing import List, Tuple, Dict, Any, Optional

class FaceDetectionOutput(BaseModel):
    box: Tuple[int, int, int, int]
    label: str
    status: str
    person_id: str

class DetectionResponse(BaseModel):
    service: str
    ok: bool
    detections: List[FaceDetectionOutput]
    error: Optional[str] = None

face_detector = None
embedding_index = None
person_registry = None
engine = None

INDEX_PATH = "data/faiss.index"
ID_MAP_PATH = "data/id_map.json"
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global face_detector, embedding_index, person_registry, engine
    
    face_detector = FaceDetector()
    
    embedding_index = EmbeddingIndex(device="cpu")
    embedding_index.load(INDEX_PATH, ID_MAP_PATH)
    
    person_registry = PersonRegistry(REDIS_URL)
    
    engine = ClassificationEngine(embedding_index, person_registry)
    
    print("Face Detection & Classification Service Started")
    yield
    print("Saving FAISS index before shutdown...")
    embedding_index.save(INDEX_PATH, ID_MAP_PATH)
    print("Face Detection Service Shutting Down")

app = FastAPI(title="Face Classification Service", lifespan=lifespan)

@app.get("/")
async def root():
    return {"status": "ok", "service": "Face Classification Service"}

@app.post("/detect", response_model=DetectionResponse)
async def detect_faces(frame: UploadFile = File(...)):
    contents = await frame.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return DetectionResponse(service="face", ok=False, detections=[], error="invalid image")
        
    faces = face_detector.detect(img)
    if not faces:
        return DetectionResponse(service="face", ok=True, detections=[])
        
    results = []
    for f in faces:
        # L2-normalize the embedding for proper Cosine Similarity via Inner Product
        norm = np.linalg.norm(f.embedding)
        if norm > 0:
            f.embedding = f.embedding / norm
            
        classification = engine.classify_and_save(img, f.bbox, f.embedding)
        
        # Save FAISS index immediately so it survives hard reboots (startup.bat closes)
        if classification.get("enrolled"):
            embedding_index.save(INDEX_PATH, ID_MAP_PATH)
            
        status = classification["status"]
        results.append(FaceDetectionOutput(
            box=f.bbox,
            label=f"Face: {status}",
            status=status,
            person_id=classification["person_id"]
        ))
        
    return DetectionResponse(service="face", ok=True, detections=results)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)
