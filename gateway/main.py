import asyncio
import httpx
from fastapi import FastAPI, UploadFile, File

app = FastAPI(title="gateway")

SERVICES = {
    "human": "http://localhost:8001/detect",
    "vehicle": "http://localhost:8002/detect",
    "anpr": "http://localhost:8004/detect",
    "suspicious": "http://localhost:8005/detect",
    "face": "http://localhost:8003/detect",
}

http_client: httpx.AsyncClient | None = None

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
    return dict(results)