import asyncio
import json
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
import uvicorn

from .database import init_db, query_alerts, get_alert_by_id, update_alert, query_event_logs, get_stats
from .tracker import process_frame, sweep_expired, active_objects
from .schemas import AlertUpdateRequest
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Event Logging Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/alerts")
async def get_alerts(severity: str = "all", status: str = "all", limit: int = 50, offset: int = 0):
    alerts = await query_alerts({"severity": severity, "status": status, "limit": limit, "offset": offset})
    return alerts

@app.get("/alerts/{id}")
async def get_alert(id: str):
    alert = await get_alert_by_id(id)
    return alert if alert else {"error": "Alert not found"}

@app.patch("/alerts/{id}")
async def patch_alert(id: str, updates: AlertUpdateRequest):
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    await update_alert(id, update_data)
    return {"status": "ok"}

@app.get("/logs")
async def get_logs(limit: int = 100, offset: int = 0):
    logs = await query_event_logs({"limit": limit, "offset": offset})
    return logs

@app.get("/search")
async def search(q: str = ""):
    # A simple mock search for now, could be expanded to full text search on logs
    return []

@app.get("/stats")
async def stats():
    stats_data = await get_stats()
    stats_data["active_objects"] = len(active_objects)
    return stats_data

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8006, reload=True)
