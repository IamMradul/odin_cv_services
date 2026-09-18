import asyncio
import json
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
import uvicorn

from .database import init_db
from .tracker import process_frame, sweep_expired, active_objects

app = FastAPI(title="Event Logging Service")

background_task_running = False

async def periodic_sweep():
    while True:
        await sweep_expired()
        await asyncio.sleep(2.0)

@app.on_event("startup")
async def startup_event():
    await init_db()
    asyncio.create_task(periodic_sweep())
    print("Event Logging Service started. DB initialized and background sweep running.")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "alert-logging"}

@app.post("/ingest")
async def ingest_frame(
    source_id: str = Form(...),
    detections: str = Form(...),
    frame: UploadFile = File(...)
):
    try:
        det_dict = json.loads(detections)
        frame_bytes = await frame.read()
        await process_frame(source_id, det_dict, frame_bytes)
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/logs/active/{source_id}")
async def get_active_logs(source_id: str):
    active_for_cam = []
    for key, obj in active_objects.items():
        if key[0] == source_id:
            active_for_cam.append({
                "object_id": obj["object_id"],
                "source_id": obj["source_id"],
                "track_id": obj["track_id"],
                "first_seen_at": obj["first_seen_at"],
                "last_seen_at": obj["last_seen_at"],
                "total_frames": obj["total_frames"],
                "best_confidence": obj["best_confidence"],
                "last_position": obj["positions"][-1] if obj["positions"] else None
            })
    return {"ok": True, "active_objects": active_for_cam}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8006, reload=True)
