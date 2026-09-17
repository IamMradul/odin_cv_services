import asyncio
import json
import time
import httpx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from pathlib import Path

app = FastAPI(title="camera-server")
STATIC_DIR = Path(__file__).parent / "static"

GATEWAY_URL = "http://localhost:9000/process-frame"
DETECT_EVERY_N_FRAMES = 5

viewers: dict[str, list[WebSocket]] = {}
frame_counters: dict[str, int] = {}
detection_in_flight: dict[str, bool] = {}
http_client: httpx.AsyncClient | None = None

@app.on_event("startup")
async def startup():
    global http_client
    http_client = httpx.AsyncClient(timeout=5.0)

@app.on_event("shutdown")
async def shutdown():
    await http_client.aclose()

@app.get("/phone")
async def phone_page():
    return FileResponse(STATIC_DIR / "phone.html")

@app.get("/viewer")
async def viewer_page():
    return FileResponse(STATIC_DIR / "viewer.html")

async def broadcast(source_id: str, message, binary: bool):
    dead = []
    for viewer_ws in viewers.get(source_id, []):
        try:
            if binary:
                await viewer_ws.send_bytes(message)
            else:
                await viewer_ws.send_text(json.dumps(message))
        except Exception:
            dead.append(viewer_ws)
    for d in dead:
        viewers[source_id].remove(d)

async def run_detection(source_id: str, frame_bytes: bytes):
    detection_in_flight[source_id] = True
    try:
        resp = await http_client.post(
            GATEWAY_URL, files={"frame": ("frame.jpg", frame_bytes, "image/jpeg")}
        )
        result = resp.json()
        result["_timestamp"] = time.time()
        await broadcast(source_id, result, binary=False)
    except Exception as e:
        print(f"detection call failed for {source_id}: {type(e).__name__}: {e}")
    finally:
        detection_in_flight[source_id] = False

@app.websocket("/ws/publish/{source_id}")
async def publish(websocket: WebSocket, source_id: str):
    await websocket.accept()
    frame_counters.setdefault(source_id, 0)
    detection_in_flight.setdefault(source_id, False)
    try:
        while True:
            frame_bytes = await websocket.receive_bytes()
            await broadcast(source_id, frame_bytes, binary=True)

            frame_counters[source_id] += 1
            if (frame_counters[source_id] % DETECT_EVERY_N_FRAMES == 0
                    and not detection_in_flight[source_id]):
                asyncio.create_task(run_detection(source_id, frame_bytes))

    except WebSocketDisconnect:
        print(f"publisher {source_id} disconnected")

@app.websocket("/ws/view/{source_id}")
async def view(websocket: WebSocket, source_id: str):
    await websocket.accept()
    viewers.setdefault(source_id, []).append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        viewers[source_id].remove(websocket)