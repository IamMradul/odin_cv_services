# start_all.ps1 — run this once, every time, on any network
$venv = ".\venv\Scripts\Activate.ps1"

# auto-detect active LAN IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notmatch "Loopback|vEthernet" -and $_.IPAddress -notmatch "^169\."
} | Select-Object -First 1).IPAddress

Write-Host "Detected IP: $ip"

# regenerate cert for this IP
Set-Location "D:\Dev\Projects\odin-cv\camera_server"
mkcert $ip localhost | Out-Null
$certFile = "${ip}+1.pem"
$keyFile = "${ip}+1-key.pem"
Set-Location "D:\Dev\Projects\odin-cv"

$services = @(
    @{ path = "services\human-detection"; port = 8001; module = "app.main:app" },
    @{ path = "services\vehicle-detection"; port = 8002; module = "app.main:app" },
    @{ path = "services\anpr"; port = 8004; module = "app.main:app" },
    @{ path = "gateway"; port = 9000; module = "main:app" }
)

foreach ($svc in $services) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$venv'; cd '$($svc.path)'; uvicorn $($svc.module) --port $($svc.port)"
}

Start-Sleep -Seconds 8   # give detection services time to load models before camera-server starts sending them frames

Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$venv'; cd 'camera_server'; uvicorn main:app --host 0.0.0.0 --port 8000 --ssl-keyfile $keyFile --ssl-certfile $certFile"

Write-Host ""
Write-Host "All services launching..."
Write-Host "Phone:  https://${ip}:8000/phone"
Write-Host "Laptop: https://${ip}:8000/viewer"