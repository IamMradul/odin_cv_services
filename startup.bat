@echo off
echo Starting Gateway (Port 9000)...
start cmd /k "conda activate odin_cv && cd gateway && uvicorn main:app --port 9000 --reload"
timeout /t 2 /nobreak >nul

echo Starting Human Detection (Port 8001)...
start cmd /k "conda activate odin_cv && cd services\human-detection && uvicorn app.main:app --port 8001 --reload"
timeout /t 2 /nobreak >nul

echo Starting Vehicle Detection (Port 8002)...
start cmd /k "conda activate odin_cv && cd services\vehicle-detection && uvicorn app.main:app --port 8002 --reload"
timeout /t 2 /nobreak >nul

echo Starting ANPR (Port 8004)...
start cmd /k "conda activate odin_cv && cd services\anpr && uvicorn app.main:app --port 8004 --reload"
timeout /t 2 /nobreak >nul

echo Starting Suspicious Activity (Port 8005)...
start cmd /k "conda activate odin_cv && cd services\suspicious-activity && uvicorn app.main:app --port 8005 --reload"
timeout /t 2 /nobreak >nul

echo Starting Face Detection (Port 8003)...
start cmd /k "conda activate odin_cv && cd services\face-detection && uvicorn main:app --port 8003 --reload"
timeout /t 2 /nobreak >nul

echo Starting Camera Server (Port 8000)...
start cmd /k "conda activate odin_cv && cd camera_server && uvicorn main:app --host 0.0.0.0 --port 8000 --ssl-keyfile 10.247.87.13+1-key.pem --ssl-certfile 10.247.87.13+1.pem"

echo All services are starting up in separate terminal windows!
