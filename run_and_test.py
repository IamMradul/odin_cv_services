import subprocess
import time
import urllib.request

print("Starting server...")
p = subprocess.Popen(["conda", "run", "-n", "odin_cv", "uvicorn", "main:app", "--port", "8008"], cwd=r"d:\Project\odin_cv_services\services\face-detection", stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
time.sleep(5)
try:
    print("Making request...")
    resp = urllib.request.urlopen("http://localhost:8008/faces")
    print("Response:", resp.read().decode())
except Exception as e:
    print("Request failed:", e)

p.terminate()
print("Server output:")
print(p.stdout.read().decode('utf-8', errors='ignore'))
