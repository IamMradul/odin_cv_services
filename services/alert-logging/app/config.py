import os

# Configuration Constants
TRACK_EXPIRY_SEC = 10
TRAJECTORY_SAMPLE_INTERVAL = 10
DATA_DIR = "data"
SNAPSHOT_DIR = os.path.join(DATA_DIR, "snapshots")
DB_PATH = os.path.join(DATA_DIR, "events.db")

os.makedirs(SNAPSHOT_DIR, exist_ok=True)
