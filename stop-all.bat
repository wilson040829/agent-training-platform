@echo off
setlocal

title Agent Platform Stopper
set "ROOT=%~dp0"

echo ==========================================
echo Agent Platform Stopper
echo ==========================================
echo.

call :kill_port 3000 Frontend
call :kill_port 8080 Backend

echo.
echo [DB] Try stopping docker compose services...
docker --version >nul 2>&1
if errorlevel 1 (
  echo [INFO] Docker not found. Skip container stop.
) else (
  cd /d "%ROOT%"
  docker compose down >nul 2>&1
  if errorlevel 1 (
    echo [WARN] docker compose down failed or no compose stack running.
  ) else (
    echo [OK] Database container stopped.
  )
)

echo.
echo Done. Frontend and Backend should be closed now.
pause
exit /b 0

:kill_port
set "PORT=%~1"
set "NAME=%~2"
echo [%NAME%] Checking port %PORT% ...
set "FOUND=0"
for /f %%P in ('powershell -NoProfile -Command "$p=(Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique); if($p){$p|ForEach-Object{Write-Output $_}}"') do (
  set "FOUND=1"
  echo [INFO] Killing PID %%P on port %PORT% ...
  taskkill /PID %%P /F >nul 2>&1
)
if "%FOUND%"=="0" echo [INFO] Port %PORT% is not in use.
if "%FOUND%"=="1" echo [OK] Port %PORT% released if permission allows.
exit /b 0
