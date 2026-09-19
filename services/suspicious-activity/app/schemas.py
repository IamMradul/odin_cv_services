from pydantic import BaseModel
from typing import List, Optional

class SuspiciousDetection(BaseModel):
    alert_type: str
    severity: str
    confidence: float
    box: List[int]
    track_id: Optional[int] = None
    weapon_class: Optional[str] = None
    duration_seconds: Optional[float] = None
    details: str

class SuspiciousActivityResponse(BaseModel):
    service: str
    ok: bool
    detections: List[SuspiciousDetection] = []
    error: Optional[str] = None
