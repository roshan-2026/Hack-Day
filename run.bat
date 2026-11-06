@echo off
setlocal enabledelayedexpansion
title Code Converter and Equivalence Tester
cd /d "%~dp0"

:: Auto-detect standard Node / Python paths if missing from current PATH
where node >nul 2>&1
if %errorlevel% neq 0 (
    if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
    if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
)
where python >nul 2>&1
if %errorlevel% neq 0 (
    if exist "%LOCALAPPDATA%\Programs\Python\Python314\python.exe" set "PATH=%LOCALAPPDATA%\Programs\Python\Python314;%LOCALAPPDATA%\Programs\Python\Python314\Scripts;%PATH%"
    if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" set "PATH=%LOCALAPPDATA%\Programs\Python\Python313;%LOCALAPPDATA%\Programs\Python\Python313\Scripts;%PATH%"
    if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "PATH=%LOCALAPPDATA%\Programs\Python\Python312;%LOCALAPPDATA%\Programs\Python\Python312\Scripts;%PATH%"
    if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" set "PATH=%LOCALAPPDATA%\Programs\Python\Python311;%LOCALAPPDATA%\Programs\Python\Python311\Scripts;%PATH%"
    if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" set "PATH=%LOCALAPPDATA%\Programs\Python\Python310;%LOCALAPPDATA%\Programs\Python\Python310\Scripts;%PATH%"
)

echo ========================================================
echo       Code Converter and Equivalence Tester
echo ========================================================
echo.

:: Verify Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found or not in your PATH!
    echo Please run "install_dependencies.bat" first to verify and setup dependencies.
    echo.
    pause
    exit /b 1
)

:: Ensure .env exists
if not exist "backend\.env" (
    echo [INFO] Initializing backend\.env from template...
    copy "backend\.env.example" "backend\.env" >nul
)

echo Select launch mode:
echo   [1] Start Application (Recommended - Full-Stack on http://localhost:8000)
echo   [2] Start in Development Mode (FastAPI :8000 + Vite :5173 Hot-Reload)
echo.
set /p choice="Enter choice [1 or 2, default is 1]: "
if "%choice%"=="" set choice=1
if "%choice%"=="2" goto dev_mode

:production_mode
echo.
echo ========================================================
echo [INFO] Starting Full-Stack Server on http://localhost:8000...
echo ========================================================
if not exist "frontend\dist\index.html" (
    echo [INFO] Building web assets for first-time launch...
    cd frontend
    call npm.cmd run build
    if %errorlevel% neq 0 call npm run build
    cd ..
)

echo [INFO] Opening your browser...
start http://localhost:8000
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] The server exited unexpectedly.
    pause
)
goto end

:dev_mode
echo.
echo ========================================================
echo [INFO] Launching Backend and Frontend dev servers...
echo ========================================================
start "Backend API Server (FastAPI :8000)" cmd /k "cd /d "%~dp0" && python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"
timeout /t 2 >nul
start "Frontend UI Server (Vite :5173)" cmd /k "cd /d "%~dp0\frontend" && npm run dev"
timeout /t 3 >nul
start http://localhost:5173
echo.
echo [SUCCESS] Both servers are running!
echo   - Web UI:      http://localhost:5173
echo   - Backend API: http://localhost:8000/docs
echo.
pause
goto end

:end
