# gateway/main.py
import httpx
from fastapi import FastAPI, File, UploadFile

app = FastAPI(title="gateway")

SERVICES = {
    "human": "http://human-detection:8001/detect",
    "vehicle": "http://vehicle-detection:8002/detect",
    "face": "http://face-detection:8003/detect",
    "anpr": "http://anpr:8004/detect",
}

@app.post("/process-frame")
async def process_frame(frame: UploadFile = File(...)):
    contents = await frame.read()
    results = {}

    async with httpx.AsyncClient(timeout=2.0) as client:
        for name, url in SERVICES.items():
            try:
                resp = await client.post(
                    url,
                    files={"frame": ("frame.jpg", contents, "image/jpeg")},
                )
                results[name] = resp.json()
            except Exception as e:
                # this service is down/slow — don't fail the whole request
                results[name] = {"ok": False, "error": f"unreachable: {e}"}

    return results