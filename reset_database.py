import os
import sys
import shutil

sys.path.append(os.path.abspath("services/face-detection"))
from src.registry import PersonRegistry

def main():
    print("WARNING: This will completely wipe all learned faces and the Redis database.")
    confirm = input("Are you sure you want to proceed? (y/n): ")
    if confirm.lower() != 'y':
        print("Aborted.")
        return

    # 1. Clear Redis
    try:
        registry = PersonRegistry("redis://localhost:6379")
        registry.r.flushdb()
        print("Cleared Redis database.")
    except Exception as e:
        print(f"Could not clear Redis (maybe it's not running?): {e}")

    # 2. Delete FAISS index files
    faiss_path = "services/face-detection/data/faiss.index"
    id_map_path = "services/face-detection/data/id_map.json"
    
    if os.path.exists(faiss_path):
        os.remove(faiss_path)
        print("Deleted faiss.index")
        
    if os.path.exists(id_map_path):
        os.remove(id_map_path)
        print("Deleted id_map.json")
        
    # 3. Clear the photo directories
    data_dir = "services/face-detection/data"
    for folder in ["safe", "threat", "suspicious", "unidentified", "undetected", "snapshots"]:
        folder_path = os.path.join(data_dir, folder)
        if os.path.exists(folder_path):
            shutil.rmtree(folder_path)
            os.makedirs(folder_path, exist_ok=True)
            print(f"Cleared images from {folder}")

    print("\nDatabase has been completely reset! You now have a clean slate.")
    print("Please restart your servers (close the windows and run startup.bat again).")

if __name__ == "__main__":
    main()
