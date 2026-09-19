# services/suspicious-activity/app/config.py

# --- Weapon Detection ---
WEAPON_MODEL_PATH = "best.pt"          # HuggingFace pretrained (Gun/Explosion/Grenade/Knife)
WEAPON_CONFIDENCE = 0.40               # Min confidence for weapon detection

# --- Person Tracking ---
POSE_MODEL_PATH = "yolov8n-pose.pt"
PERSON_CONFIDENCE = 0.40
TRACK_EXPIRY_SEC = 10
MAX_TRACK_HISTORY = 300

# --- Loitering ---
LOITER_RADIUS_PX = 60                  # Max centroid drift to count as "stationary"
LOITER_THRESHOLD_SEC = 15              # Seconds before triggering alert
LOITER_WINDOW_SEC = 60

# --- Running ---
SPEED_THRESHOLD_PX_PER_FRAME = 25
SPEED_CONSECUTIVE_FRAMES = 5

# --- Armed Person ---
WEAPON_PERSON_IOU_THRESHOLD = 0.1      # Weapon bbox overlapping person bbox
WEAPON_PERSON_DISTANCE_PX = 50

# --- Stabbing (pose-based) ---
STABBING_WRIST_HEIGHT_RATIO = 0.3      # Wrist above shoulder by this fraction of body height
STABBING_KNIFE_IOU = 0.05              # Knife must be near the person
