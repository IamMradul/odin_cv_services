import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File
import uvicorn
import os
import uuid
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import asyncio

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

osint_states = {}
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
        classification = engine.classify_and_save(img, f.bbox, f.embedding)
        status = classification["status"]
        results.append(FaceDetectionOutput(
            box=f.bbox,
            label=f"Face: {status}",
            status=status,
            person_id=classification["person_id"]
        ))
        
    return DetectionResponse(service="face", ok=True, detections=results)

@app.get("/faces")
async def get_faces():
    # Retrieve all known persons from the registry
    # Assuming registry has a method to list all, or we construct a mock response for now
    # Since person_registry is a Redis-backed PersonRegistry, we need to get all keys
    keys = person_registry.redis.keys("person:*")
    faces = []
    for k in keys:
        person_data = person_registry.redis.hgetall(k)
        person_data = {k.decode('utf-8'): v.decode('utf-8') for k, v in person_data.items()}
        faces.append({
            "id": person_data.get("person_id", k.decode('utf-8').split(":")[1]),
            "name": person_data.get("name", "Unknown"),
            "status": person_data.get("category", "Unknown"),
            "lastSeen": "Unknown",
            "lastSeenDate": "Unknown",
            "events": 0,
            "tags": [],
            "description": ""
        })
    return faces

@app.get("/faces/{person_id}")
async def get_face(person_id: str):
    person_data = person_registry.redis.hgetall(f"person:{person_id}")
    if not person_data:
        return {"error": "Not found"}
    person_data = {k.decode('utf-8'): v.decode('utf-8') for k, v in person_data.items()}
    return person_data

@app.post("/faces")
async def add_face(data: dict):
    # Stub for adding a face
    return {"status": "ok"}

@app.post("/faces/{person_id}/osint")
async def trigger_osint(person_id: str):
    osint_states[person_id] = "queued"
    async def simulate_osint():
        await asyncio.sleep(2)
        osint_states[person_id] = "processing"
        await asyncio.sleep(4)
        osint_states[person_id] = "ready"
    
    asyncio.create_task(simulate_osint())
    return {"status": "ok", "state": "queued"}

@app.get("/faces/{person_id}/osint")
async def get_osint(person_id: str):
    state = osint_states.get(person_id, "idle")
    return {"state": state}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)
