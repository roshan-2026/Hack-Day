@echo off
title Install Dependencies - Code Converter
cd /d "%~dp0"

echo ========================================================
echo       Installing Dependencies for Code Converter
echo ========================================================
echo.

:: 1. Check Python
echo [1/4] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found in PATH! Please install Python 3.10+ and add it to your PATH.
    pause
    exit /b 1
)
python --version

:: 2. Check Node / npm
echo.
echo [2/4] Checking Node.js and npm installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH! Please install Node.js (v18+) from https://nodejs.org.
    pause
    exit /b 1
)
node --version
call npm --version

:: 3. Install Python Dependencies
echo.
echo [3/4] Installing Python backend packages...
python -m pip install -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies.
    pause
    exit /b 1
)

:: 4. Install Node Dependencies & Build Frontend UI
echo.
echo [4/4] Installing frontend packages and building web UI...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install npm dependencies.
    cd ..
    pause
    exit /b 1
)
call npm run build
cd ..

:: 5. Setup .env if missing
if not exist "backend\.env" (
    echo.
    echo [INFO] Creating backend\.env from template...
    copy "backend\.env.example" "backend\.env" >nul
    echo [NOTE] Remember to add your GEMINI_API_KEY inside backend\.env!
)

echo.
echo ========================================================
echo   All dependencies installed & frontend built successfully!
echo   You can now launch the app anytime by double-clicking:
echo                    run.bat
echo ========================================================
echo.
pause
