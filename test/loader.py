import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SERVICES = ROOT / "services"

def load_model_module(service_name: str):
    path = SERVICES / service_name / "app" / "model.py"
    spec = importlib.util.spec_from_file_location(f"{service_name}_model", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module