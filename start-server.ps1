# PowerShell script to start TaskFlow server
Write-Host "Starting TaskFlow Server..." -ForegroundColor Green
Write-Host ""
python server.py
Read-Host "Press Enter to exit"
