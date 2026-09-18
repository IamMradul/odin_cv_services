# services/suspicious-activity/app/config.py

# Loitering
LOITER_RADIUS_PX = 50          # Max centroid drift to still count as "stationary"
LOITER_THRESHOLD_SEC = 30      # Seconds before triggering loitering alert
LOITER_WINDOW_SEC = 60         # History window to analyze

# Lurking / Pacing
LURK_REVERSAL_THRESHOLD = 4    # Direction reversals in window
LURK_WINDOW_SEC = 20           # Time window for counting reversals
LURK_AREA_RADIUS_PX = 100      # Must stay within this area to count as lurking

# Running / Aggressive
SPEED_THRESHOLD_PX_PER_FRAME = 25   # Pixels/frame displacement for "running"
SPEED_CONSECUTIVE_FRAMES = 5         # Must sustain for N frames
APPROACH_DISTANCE_SHRINK_RATE = 0.7  # Distance must be decreasing at this rate

# Fighting
FIGHT_IOU_THRESHOLD = 0.25     # Bbox overlap for potential fight
FIGHT_MOTION_THRESHOLD = 15    # Both persons must show this much motion
FIGHT_PERSIST_FRAMES = 8       # Must persist for N frames

# Armed Person
WEAPON_PERSON_IOU_THRESHOLD = 0.1   # Weapon bbox overlapping person bbox
WEAPON_PERSON_DISTANCE_PX = 50      # Or within this distance

# General
PERSON_CONFIDENCE = 0.4        # Min confidence for person detection
WEAPON_CONFIDENCE = 0.35       # Min confidence for weapon detection
TRACK_EXPIRY_SEC = 10          # Remove stale tracks after N seconds
MAX_TRACK_HISTORY = 300        # Max position entries per track
