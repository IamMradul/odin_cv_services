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
    
    # Ensure OSINT data is loaded into Redis and FAISS on boot
    await seed_database()
    
    yield
    print("Saving FAISS index before shutdown...")
    embedding_index.save(INDEX_PATH, ID_MAP_PATH)
    print("Face Detection Service Shutting Down")

from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Face Classification Service", lifespan=lifespan)
app.mount("/data", StaticFiles(directory="data"), name="data")
app.mount("/osint_images", StaticFiles(directory="id_osint"), name="osint_images")

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

@app.get("/faces")
async def get_faces():
    try:
        # Retrieve all known persons from the registry
        keys = person_registry.r.smembers("persons:all")
        faces = []
        for k in keys:
            person = person_registry.get(k)
            if person:
                sightings = person_registry.get_sightings(person.id, limit=1)
                image_url = ""
                if sightings and sightings[0].snapshot_path:
                    path = sightings[0].snapshot_path.replace("\\", "/")
                    if path.startswith("data/"):
                        image_url = f"http://localhost:8003/{path}"
                    else:
                        image_url = f"http://localhost:8003/data/{path}"
                else:
                    image_url = f"http://localhost:8003/data/snapshots/{person.id}.jpg"

                faces.append({
                    "id": person.id,
                    "name": person.name if person.name else person.id,
                    "contact": person.contact,
                    "status": person.status,
                    "lastSeen": person.last_seen,
                    "events": person.sighting_count,
                    "tags": [],
                    "description": person.notes if person.notes else "",
                    "imageUrl": image_url,
                    "osintImageUrl": f"http://localhost:8003/osint_images/{person.id}.jpeg"
                })
        return faces
    except Exception as e:
        import traceback
        return {"error": str(e), "traceback": traceback.format_exc()}

@app.get("/faces/{person_id}")
async def get_face(person_id: str):
    person = person_registry.get(person_id)
    if not person:
        return {"error": "Not found"}
        
    sightings = person_registry.get_sightings(person.id, limit=1)
    image_url = ""
    if sightings and sightings[0].snapshot_path:
        path = sightings[0].snapshot_path.replace("\\", "/")
        if path.startswith("data/"):
            image_url = f"http://localhost:8003/{path}"
        else:
            image_url = f"http://localhost:8003/data/{path}"
    else:
        image_url = f"http://localhost:8003/data/{person.status}/{person.id}.jpg"

    return {
        "id": person.id,
        "name": person.name if person.name else person.id,
        "contact": person.contact,
        "status": person.status,
        "lastSeen": person.last_seen,
        "events": person.sighting_count,
        "description": person.notes if person.notes else "",
        "imageUrl": image_url,
        "osintImageUrl": f"http://localhost:8003/osint_images/{person.id}.jpeg"
    }

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

@app.post("/seed")
async def seed_database():
    import os, cv2, numpy as np
    osint_dir = "id_osint"
    if not os.path.exists(osint_dir):
        return {"status": "error", "message": f"Directory {osint_dir} not found"}

    seeded_count = 0
    statuses = ["Employee", "Cleared", "Watchlist", "Target"]
    
    for idx, filename in enumerate(os.listdir(osint_dir)):
        if not filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            continue
            
        filepath = os.path.join(osint_dir, filename)
        name = os.path.splitext(filename)[0]
        
        img = cv2.imread(filepath)
        if img is None: continue
            
        faces = face_detector.detect(img)
        if not faces: continue
            
        f = faces[0]
        norm = np.linalg.norm(f.embedding)
        if norm > 0: f.embedding = f.embedding / norm
            
        person_id = name
        status = statuses[idx % len(statuses)]
        
        # Add to in-memory FAISS
        embedding_index.add(person_id, f.embedding)
        
        # Register in Redis
        person_registry.r.delete(f"person:{person_id}")
        person_registry.r.srem("persons:all", person_id)
        for s in statuses + ["safe", "threat", "unidentified"]:
            person_registry.r.srem(f"persons:by_status:{s}", person_id)
            
        mock_osint_data = {
            "aks": {"name": "AKSHAT SINHA", "contact": "7765859270", "notes": "B.P. KUTTIR, S.K. PURI, BORING ROAD, PATNA, PATNA"},
            "maya": {"name": "MAYANK KUMAR", "contact": "8709679393", "notes": "IC-77, NTS BARKAKANA GHUTUWA, PS- GHUTUWA, CHAINGARA, PO. BARKAKANA, RAMGARH, JHARKHAND-829103, RAMGARH CANTT"},
            "mg": {"name": "MRADUL GUPTA", "contact": "9305343135", "notes": "THOK STATION ROAD, MISHRIKH, SITAPUR, UTTAR PRADESH-261401, MISRIKH NEEMSAR"},
            "sid": {"name": "SIDDHARTH PAUL", "contact": "9748545110", "notes": "SANKRAIL, HAORA, WEST BENGAL-711313, HOWRAH"}
        }
        
        osint_info = mock_osint_data.get(person_id, {"name": person_id.capitalize(), "contact": "N/A", "notes": ""})
        person_registry.create(person_id, status=status, name=osint_info["name"], contact=osint_info["contact"], notes=osint_info["notes"])
        
        snapshot_path = f"data/snapshots/{person_id}.jpg"
        x1, y1, x2, y2 = [int(v) for v in f.bbox]
        h, w = img.shape[:2]
        mx1, my1 = max(0, x1-20), max(0, y1-20)
        mx2, my2 = min(w, x2+20), min(h, y2+20)
        cropped = img[my1:my2, mx1:mx2]
        if cropped.size != 0:
            os.makedirs(os.path.dirname(snapshot_path), exist_ok=True)
            cv2.imwrite(snapshot_path, cropped)
            
        person_registry.log_sighting(person_id, "seed", 1.0, snapshot_path)
        seeded_count += 1

    embedding_index.save(INDEX_PATH, ID_MAP_PATH)
    return {"status": "ok", "seeded": seeded_count}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)
# Trigger reload
