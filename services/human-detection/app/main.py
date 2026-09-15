import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile
from app.model import HumanDetector
from app.schemas import DetectionResponse

app = FastAPI(title="human-detection-service")
detector = HumanDetector()

SERVICE_NAME = "human-detection"

@app.get("/health")
def health():
    return {"status": "ok", "service": SERVICE_NAME}

@app.post("/detect", response_model=DetectionResponse)
async def detect(frame: UploadFile = File(...)):
    try:
        contents = await frame.read()
        np_arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            return DetectionResponse(service=SERVICE_NAME, ok=False, error="invalid image")

        detections = detector.infer(img)
        return DetectionResponse(service=SERVICE_NAME, ok=True, detections=detections)
    except Exception as e:
        # Never let this bubble up and take the process down — isolate at the request level too
        return DetectionResponse(service=SERVICE_NAME, ok=False, error=str(e))