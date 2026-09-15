import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile
from app.model import ANPRDetector
from app.schemas import ANPRResponse

app = FastAPI(title="anpr-service")
detector = ANPRDetector()
SERVICE_NAME = "anpr"

@app.get("/health")
def health():
    return {"status": "ok", "service": SERVICE_NAME}

@app.post("/detect", response_model=ANPRResponse)
async def detect(frame: UploadFile = File(...)):
    try:
        contents = await frame.read()
        np_arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            return ANPRResponse(service=SERVICE_NAME, ok=False, error="invalid image")
        detections = detector.infer(img)
        return ANPRResponse(service=SERVICE_NAME, ok=True, detections=detections)
    except Exception as e:
        return ANPRResponse(service=SERVICE_NAME, ok=False, error=str(e))