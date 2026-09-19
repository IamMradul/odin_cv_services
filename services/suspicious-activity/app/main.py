import asyncio
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile
from .detector import SuspiciousActivityDetector
from .schemas import SuspiciousActivityResponse

app = FastAPI(title="suspicious-activity-service")
detector = SuspiciousActivityDetector()
SERVICE_NAME = "suspicious-activity"

@app.get("/health")
def health():
    return {"status": "ok", "service": SERVICE_NAME}

@app.post("/detect", response_model=SuspiciousActivityResponse)
async def detect(frame: UploadFile = File(...)):
    try:
        contents = await frame.read()
        np_arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            return SuspiciousActivityResponse(service=SERVICE_NAME, ok=False, error="invalid image")

        detections = await asyncio.to_thread(detector.infer, img)
        return SuspiciousActivityResponse(service=SERVICE_NAME, ok=True, detections=detections)
    except Exception as e:
        return SuspiciousActivityResponse(service=SERVICE_NAME, ok=False, error=f"{type(e).__name__}: {e}")
