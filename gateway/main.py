import asyncio
import httpx
from fastapi import FastAPI, UploadFile, File, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import time

app = FastAPI(title="gateway")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev, or restrict to ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVICES = {
    "human": "http://localhost:8001/detect",
    "vehicle": "http://localhost:8002/detect",
    "anpr": "http://localhost:8004/detect",
    "suspicious": "http://localhost:8005/detect",
    "face": "http://localhost:8003/detect",
}

ALERT_LOGGING_URL = "http://localhost:8006"
FACE_DETECTION_URL = "http://localhost:8003"
CAMERA_SERVER_URL = "http://localhost:8000"

http_client: httpx.AsyncClient | None = None
active_websockets: list[WebSocket] = []

@app.on_event("startup")
async def startup():
    global http_client
    http_client = httpx.AsyncClient(timeout=5.0)

@app.on_event("shutdown")
async def shutdown():
    await http_client.aclose()

async def call_service(name: str, url: str, contents: bytes):
    try:
        resp = await http_client.post(url, files={"frame": ("frame.jpg", contents, "image/jpeg")})
        return name, resp.json()
    except Exception as e:
        return name, {"ok": False, "error": f"{type(e).__name__}: {e}"}

@app.post("/process-frame")
async def process_frame(frame: UploadFile = File(...)):
    contents = await frame.read()
    tasks = [call_service(name, url, contents) for name, url in SERVICES.items()]
    results = await asyncio.gather(*tasks)
    res_dict = dict(results)
    
    # Broadcast to WS clients
    await broadcast_ws({"event": "frame_processed", "data": res_dict})
    
    return res_dict

# --- REST PROXY ENDPOINTS ---

@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "Gateway running"}

async def proxy_request(method: str, url: str, request: Request = None, data=None):
    params = dict(request.query_params) if request else {}
    try:
        if method == "GET":
            resp = await http_client.get(url, params=params)
        elif method == "POST":
            resp = await http_client.post(url, json=data, params=params)
        elif method == "PATCH":
            resp = await http_client.patch(url, json=data, params=params)
        else:
            return Response(status_code=405)
            
        return Response(content=resp.content, status_code=resp.status_code, media_type=resp.headers.get("content-type"))
    except httpx.RequestError as e:
        return Response(content=json.dumps({"error": str(e)}), status_code=502, media_type="application/json")

@app.get("/api/alerts")
async def get_alerts(request: Request):
    return await proxy_request("GET", f"{ALERT_LOGGING_URL}/alerts", request)

@app.get("/api/alerts/{id}")
async def get_alert(id: str, request: Request):
    return await proxy_request("GET", f"{ALERT_LOGGING_URL}/alerts/{id}", request)

@app.patch("/api/alerts/{id}")
async def patch_alert(id: str, request: Request):
    data = await request.json()
    return await proxy_request("PATCH", f"{ALERT_LOGGING_URL}/alerts/{id}", request, data)

@app.get("/api/faces")
async def get_faces(request: Request):
    return await proxy_request("GET", f"{FACE_DETECTION_URL}/faces", request)

@app.get("/api/faces/{id}")
async def get_face(id: str, request: Request):
    return await proxy_request("GET", f"{FACE_DETECTION_URL}/faces/{id}", request)

@app.post("/api/faces")
async def create_face(request: Request):
    # Form data proxy for image upload would be more complex, keeping it simple for JSON or fallback
    data = await request.json()
    return await proxy_request("POST", f"{FACE_DETECTION_URL}/faces", request, data)

@app.post("/api/faces/{id}/osint")
async def trigger_osint(id: str, request: Request):
    return await proxy_request("POST", f"{FACE_DETECTION_URL}/faces/{id}/osint", request)

@app.get("/api/faces/{id}/osint")
async def get_osint(id: str, request: Request):
    return await proxy_request("GET", f"{FACE_DETECTION_URL}/faces/{id}/osint", request)

@app.get("/api/logs")
async def get_logs(request: Request):
    return await proxy_request("GET", f"{ALERT_LOGGING_URL}/logs", request)

@app.get("/api/logs/active/{source_id}")
async def get_active_logs(source_id: str, request: Request):
    return await proxy_request("GET", f"{ALERT_LOGGING_URL}/logs/active/{source_id}", request)

@app.get("/api/search")
async def proxy_search(request: Request):
    return await proxy_request("GET", f"{ALERT_LOGGING_URL}/search", request)

@app.get("/api/stats")
async def proxy_stats(request: Request):
    # return await proxy_request("GET", f"{ALERT_LOGGING_URL}/stats", request)
    return {"status": "mocked", "alerts": 0}

@app.get("/api/health/all")
async def get_all_health():
    services = [
        {"name": "API Gateway", "url": None}, # Gateway itself
        {"name": "Human Detection", "url": "http://127.0.0.1:8001/health"},
        {"name": "Vehicle Detection", "url": "http://127.0.0.1:8002/health"},
        {"name": "Face Recognition", "url": "http://127.0.0.1:8003/health"},
        {"name": "ANPR Engine", "url": "http://127.0.0.1:8004/health"},
        {"name": "Suspicious Activity", "url": "http://127.0.0.1:8005/health"},
        {"name": "Alert Logging", "url": "http://127.0.0.1:8006/health"},
        {"name": "Camera Server", "url": "https://127.0.0.1:8000/viewer"}, # Rough check
    ]
    
    results = []
    async with httpx.AsyncClient(verify=False, timeout=1.0) as client:
        for svc in services:
            if svc["url"] is None:
                results.append({"name": svc["name"], "status": "ok", "latency": "1ms"})
                continue
                
            start = time.time()
            try:
                resp = await client.get(svc["url"])
                latency = int((time.time() - start) * 1000)
                status = "ok" if resp.status_code == 200 else "degraded"
                results.append({"name": svc["name"], "status": status, "latency": f"{latency}ms"})
            except Exception as e:
                print(f"Health check failed for {svc['name']}: {repr(e)}")
                results.append({"name": svc["name"], "status": "offline", "latency": "-"})
                
    return results

@app.get("/api/cameras")
async def get_cameras():
    # Stub cameras for now
    return [
        {"id": "cam1", "name": "Main Entrance", "location": "Gate A", "status": "normal", "priority": False, "lastSeen": None, "detections": []},
        {"id": "cam2", "name": "Lobby Perimeter", "location": "Building 1", "status": "normal", "priority": False, "lastSeen": None, "detections": []}
    ]

# --- WEBSOCKET EVENT STREAM ---

async def broadcast_ws(message: dict):
    dead = []
    for ws in active_websockets:
        try:
            await ws.send_text(json.dumps(message))
        except Exception:
            dead.append(ws)
    for w in dead:
        active_websockets.remove(w)

@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming client messages if any
    except WebSocketDisconnect:
        active_websockets.remove(websocket)