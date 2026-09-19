import sys
import os
import json

# Add services/face-detection to path to import registry
sys.path.append(os.path.abspath("services/face-detection"))
from src.registry import PersonRegistry

def sync_folders():
    try:
        registry = PersonRegistry("redis://localhost:6379")
    except Exception:
        print("Redis is not running!")
        return

    # 1. Build a mapping of snapshot filename -> person_id from Redis
    all_persons_keys = registry.r.keys("sightings:*")
    
    filename_to_person = {}
    
    for key in all_persons_keys:
        person_id = key.split(":")[1]
        items = registry.r.lrange(key, 0, -1)
        for item in items:
            sighting = json.loads(item)
            path = sighting.get("snapshot_path", "")
            if path:
                filename = os.path.basename(path)
                filename_to_person[filename] = person_id
                
    # 2. Iterate over the folders
    data_dir = "services/face-detection/data"
    folders = ["safe", "threat", "suspicious", "unidentified"]
    
    updated_count = 0
    for folder in folders:
        folder_path = os.path.join(data_dir, folder)
        if not os.path.exists(folder_path): 
            continue
        
        for filename in os.listdir(folder_path):
            if filename in filename_to_person:
                person_id = filename_to_person[filename]
                person = registry.get(person_id)
                
                # If the person's current status doesn't match the folder they are in, update it!
                if person and person.status != folder:
                    registry.update_status(person_id, folder, "auto_sync")
                    print(f"[{folder.upper()}] Updated person {person_id} because their photo '{filename}' was found in the '{folder}' folder.")
                    updated_count += 1
                    
    print(f"\nFinished! Automatically updated {updated_count} people based on their folder placements.")

if __name__ == "__main__":
    sync_folders()
