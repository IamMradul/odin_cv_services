import numpy as np
from .person_tracker import PersonTracker
from .weapon_detector import WeaponDetector
from .behavior_analyzer import BehaviorAnalyzer
from .schemas import SuspiciousDetection

class SuspiciousActivityDetector:
    def __init__(self):
        self.tracker = PersonTracker()
        self.weapon_det = WeaponDetector()
        self.analyzer = BehaviorAnalyzer()

    def infer(self, frame: np.ndarray, source_id: str = "default"):
        tracked_persons = self.tracker.detect_and_track(frame)
        weapons = self.weapon_det.detect(frame)
        
        alerts = self.analyzer.analyze(tracked_persons, weapons)
        
        detections = []
        for a in alerts:
            detections.append(SuspiciousDetection(**a))
            
        return detections
