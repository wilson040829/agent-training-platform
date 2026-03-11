@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "USE_LOCAL=1"
set "START_BACKEND=1"
set "START_FRONTEND=1"

title Agent Platform Starter
echo ==========================================
echo Agent Platform Starter
echo Project: %ROOT%
echo ==========================================
echo.

if not exist "%BACKEND%" (
  echo [ERROR] backend folder not found: %BACKEND%
  pause
  exit /b 1
)

if not exist "%FRONTEND%" (
  echo [ERROR] frontend folder not found: %FRONTEND%
  pause
  exit /b 1
)

echo [1/6] Check Docker...
docker --version >nul 2>&1
if errorlevel 1 (
  echo [INFO] Docker not found, fallback to local H2 mode.
  set "USE_LOCAL=1"
) else (
  echo [2/6] Try start PostgreSQL with docker compose...
  cd /d "%ROOT%"
  docker compose up -d >nul 2>&1
  if errorlevel 1 (
    echo [WARN] docker compose failed, fallback to local H2 mode.
    set "USE_LOCAL=1"
  ) else (
    echo [OK] PostgreSQL started.
    set "USE_LOCAL=0"
  )
)

echo [3/6] Check backend health on 8080...
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing http://localhost:8080/health -TimeoutSec 2; if($r.StatusCode -eq 200){exit 0}else{exit 1} } catch { exit 1 }"
if not errorlevel 1 (
  echo [OK] Backend already running on 8080, skip starting backend.
  set "START_BACKEND=0"
) else (
  powershell -NoProfile -Command "$p=Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue; if($p){exit 0}else{exit 1}"
  if not errorlevel 1 (
    echo [WARN] Port 8080 is in use by another process. Skip backend start.
    set "START_BACKEND=0"
  )
)

echo [4/6] Check frontend port 3000...
powershell -NoProfile -Command "$p=Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; if($p){exit 0}else{exit 1}"
if not errorlevel 1 (
  echo [INFO] Port 3000 already in use. Skip frontend start.
  set "START_FRONTEND=0"
)

echo [5/6] Start backend...
if "%START_BACKEND%"=="1" (
  if "%USE_LOCAL%"=="1" (
    start "Agent Backend" cmd /k "cd /d "%BACKEND%" && mvn spring-boot:run -Dspring-boot.run.profiles=local"
  ) else (
    start "Agent Backend" cmd /k "cd /d "%BACKEND%" && mvn spring-boot:run"
  )
) else (
  echo [SKIP] Backend not started by script.
)

echo [6/6] Start frontend...
if "%START_FRONTEND%"=="1" (
  if exist "%FRONTEND%\.next" (
    echo [INFO] Cleaning frontend cache folder .next
    rmdir /s /q "%FRONTEND%\.next"
  )
  start "Agent Frontend" cmd /k "cd /d "%FRONTEND%" && npm run dev"
) else (
  echo [SKIP] Frontend not started by script.
)

echo.
echo Started. Wait 10-30 seconds.
echo Frontend: http://localhost:3000/agent/create
echo Backend : http://localhost:8080/health
echo.
pause
