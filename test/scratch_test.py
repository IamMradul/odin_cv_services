import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SERVICES = ROOT / "services"

suspicious_path = str(SERVICES / "suspicious-activity")
if suspicious_path not in sys.path:
    sys.path.insert(0, suspicious_path)


from app.detector import SuspiciousActivityDetector

detector = SuspiciousActivityDetector()
print("Successfully loaded detector!")
