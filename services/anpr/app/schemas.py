from pydantic import BaseModel
from typing import List, Optional

class PlateDetection(BaseModel):
    label: str
    confidence: float
    box: List[int]
    plate_text: Optional[str] = None
    ocr_confidence: float = 0.0

class ANPRResponse(BaseModel):
    service: str
    ok: bool
    detections: List[PlateDetection] = []
    error: Optional[str] = None