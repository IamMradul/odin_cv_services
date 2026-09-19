from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class Detection(BaseModel):
    box: List[int]
    label: str
    confidence: Optional[float] = None
    track_id: Optional[int] = None
    status: Optional[str] = None
    person_id: Optional[str] = None
    plate_text: Optional[str] = None
    ocr_confidence: Optional[float] = None
    alert_type: Optional[str] = None
    severity: Optional[str] = None
    details: Optional[str] = None

class ServiceResult(BaseModel):
    service: str
    ok: bool
    detections: List[Detection]
    error: Optional[str] = None

class IngestPayload(BaseModel):
    source_id: str
    detections: Dict[str, ServiceResult]

class EventLogResponse(BaseModel):
    id: str
    object_id: str
    event_type: str
    source_id: str
    track_id: int
    global_id: Optional[str]
    object_type: str
    object_subtype: Optional[str]
    timestamp: str
    position: Dict[str, int]
    confidence: float
    snapshot_path: str
    duration_seconds: Optional[float]
    total_frames_seen: Optional[int]
    trajectory_summary: Optional[List[Dict[str, Any]]]
    best_snapshot_path: Optional[str]
    best_confidence: Optional[float]
    avg_confidence: Optional[float]
    metadata: Dict[str, Any]
    created_at: str

class AlertResponse(BaseModel):
    id: str
    object_id: str
    alert_type: str
    severity: str
    confidence: float
    timestamp: str
    snapshot_path: str
    details: str
    acknowledged: bool
    false_positive: bool

class ActiveObjectResponse(BaseModel):
    object_id: str
    source_id: str
    track_id: int
    first_seen_at: float
    last_seen_at: float
    total_frames: int
    best_confidence: float
    last_position: tuple

class AlertUpdateRequest(BaseModel):
    status: Optional[str] = None
    note: Optional[str] = None
    operator: Optional[str] = None
    false_positive: Optional[bool] = None

class StatsResponse(BaseModel):
    total_alerts: int
    alerts_by_severity: Dict[str, int]
    active_objects: int
