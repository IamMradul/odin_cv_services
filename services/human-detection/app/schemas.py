from pydantic import BaseModel
from typing import List

class Detection(BaseModel):
    label: str
    confidence: float
    box: List[int]        # [x1, y1, x2, y2]
    track_id: int | None = None

class DetectionResponse(BaseModel):
    service: str
    ok: bool
    detections: List[Detection] = []
    error: str | None = None