@echo off
setlocal enabledelayedexpansion
title Install Dependencies - Code Converter
cd /d "%~dp0"

echo ========================================================
echo       Installing Dependencies for Code Converter
echo ========================================================
echo.

:: ---------------------------------------------------------
:: 1. Check and Setup Node.js in PATH (auto-detect standard path)
:: ---------------------------------------------------------
where node >nul 2>&1
if %errorlevel% neq 0 (
    if exist "%ProgramFiles%\nodejs\node.exe" (
        set "PATH=%ProgramFiles%\nodejs;%PATH%"
    ) else if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
        set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
    ) else if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
    )
)

:: ---------------------------------------------------------
:: 2. Check and Setup Python in PATH (auto-detect standard path)
:: ---------------------------------------------------------
where python >nul 2>&1
if %errorlevel% neq 0 (
    if exist "%LOCALAPPDATA%\Programs\Python\Python314\python.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\Python\Python314;%LOCALAPPDATA%\Programs\Python\Python314\Scripts;%PATH%"
    ) else if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\Python\Python313;%LOCALAPPDATA%\Programs\Python\Python313\Scripts;%PATH%"
    ) else if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\Python\Python312;%LOCALAPPDATA%\Programs\Python\Python312\Scripts;%PATH%"
    ) else if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\Python\Python311;%LOCALAPPDATA%\Programs\Python\Python311\Scripts;%PATH%"
    ) else if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\Python\Python310;%LOCALAPPDATA%\Programs\Python\Python310\Scripts;%PATH%"
    ) else if exist "C:\Python312\python.exe" (
        set "PATH=C:\Python312;C:\Python312\Scripts;%PATH%"
    ) else if exist "C:\Python311\python.exe" (
        set "PATH=C:\Python311;C:\Python311\Scripts;%PATH%"
    )
)

:: ---------------------------------------------------------
:: 3. Verify Python installation
:: ---------------------------------------------------------
echo [1/4] Checking Python installation...
set "PY_CMD=python"
python --version >nul 2>&1
if %errorlevel% neq 0 (
    py -3 --version >nul 2>&1
    if %errorlevel% equ 0 (
        set "PY_CMD=py -3"
    ) else (
        goto :python_not_found
    )
)

%PY_CMD% --version
echo [OK] Python is available and working.

:: ---------------------------------------------------------
:: 4. Verify Node.js and npm installation
:: ---------------------------------------------------------
echo.
echo [2/4] Checking Node.js and npm installation...
node --version >nul 2>&1
if %errorlevel% neq 0 goto :node_not_found

call node --version
call npm.cmd --version >nul 2>&1
if %errorlevel% neq 0 (
    call npm --version >nul 2>&1
    if %errorlevel% neq 0 goto :npm_not_found
    set "NPM_CMD=npm"
) else (
    set "NPM_CMD=npm.cmd"
)
call %NPM_CMD% --version
echo [OK] Node.js and npm are available and working.

:: ---------------------------------------------------------
:: 5. Install Python backend dependencies
:: ---------------------------------------------------------
echo.
echo [3/4] Installing Python backend packages...
echo Running: %PY_CMD% -m pip install -r backend\requirements.txt
%PY_CMD% -m pip install -r backend\requirements.txt
if %errorlevel% neq 0 goto :pip_failed
echo [OK] Python dependencies installed successfully.

:: ---------------------------------------------------------
:: 6. Install Node dependencies and Build Frontend assets
:: ---------------------------------------------------------
echo.
echo [4/4] Installing frontend packages and building web UI...
cd frontend
echo Running: %NPM_CMD% install in frontend\
call %NPM_CMD% install
if %errorlevel% neq 0 (
    cd ..
    goto :npm_install_failed
)

echo.
echo Building frontend production assets...
call %NPM_CMD% run build
if %errorlevel% neq 0 (
    cd ..
    goto :npm_build_failed
)
cd ..
echo [OK] Frontend packages installed and UI built successfully.

:: ---------------------------------------------------------
:: 7. Setup .env file if missing
:: ---------------------------------------------------------
if not exist "backend\.env" (
    echo.
    echo [INFO] Creating backend\.env from template...
    copy "backend\.env.example" "backend\.env" >nul
    echo [NOTE] Remember to add your GEMINI_API_KEY inside backend\.env!
)

:: ---------------------------------------------------------
:: Success Screen
:: ---------------------------------------------------------
echo.
echo ========================================================
echo   SUCCESS: All dependencies installed and frontend built!
echo.
echo   You can now launch the application by double-clicking:
echo                    run.bat
echo ========================================================
echo.
echo Press any key to exit this window...
pause >nul
exit /b 0

:: ---------------------------------------------------------
:: Error Handlers with Clear Actionable Steps
:: ---------------------------------------------------------

:python_not_found
echo.
echo ========================================================================
echo [ERROR] Python is not installed or not recognized in your system PATH!
echo ========================================================================
echo.
echo WHAT YOU NEED TO DO:
echo   1. Download Python 3.10 or higher (recommended: 3.11, 3.12, or 3.14) from:
echo      https://www.python.org/downloads/
echo.
echo   2. Run the downloaded installer.
echo.
echo   3. CRITICAL: On the very first installer screen, you MUST check the box:
echo      [X] "Add python.exe to PATH"
echo      (If this box is not checked, Windows will not recognize python).
echo.
echo   4. Click "Install Now" to finish installation.
echo.
echo   5. Close this window and double-click "install_dependencies.bat" again.
echo ========================================================================
echo.
echo Press any key to close this window...
pause >nul
exit /b 1

:node_not_found
echo.
echo ========================================================================
echo [ERROR] Node.js is not installed or not recognized in your system PATH!
echo ========================================================================
echo.
echo WHAT YOU NEED TO DO:
echo   1. Download the LTS version of Node.js (v18 or higher) from:
echo      https://nodejs.org/
echo.
echo   2. Run the installer and proceed through all default setup options.
echo      (The installer automatically configures Node.js and npm in your PATH).
echo.
echo   3. Once the installation is complete:
echo      Close this window and double-click "install_dependencies.bat" again.
echo ========================================================================
echo.
echo Press any key to close this window...
pause >nul
exit /b 1

:npm_not_found
echo.
echo ========================================================================
echo [ERROR] Node.js was found, but the 'npm' command is not recognized!
echo ========================================================================
echo.
echo WHAT YOU NEED TO DO:
echo   1. Re-run the Node.js installer from:
echo      https://nodejs.org/
echo   2. Select "Repair" or reinstall Node.js with the default npm package manager.
echo   3. Ensure "C:\Program Files\nodejs" is added to your Environment Variables.
echo   4. Restart this script.
echo ========================================================================
echo.
echo Press any key to close this window...
pause >nul
exit /b 1

:pip_failed
echo.
echo ========================================================================
echo [ERROR] Failed to install Python dependencies from backend\requirements.txt!
echo ========================================================================
echo.
echo WHAT YOU NEED TO DO:
echo   1. Check your internet connection (packages must be downloaded from PyPI).
echo   2. Try updating pip by running:
echo      python -m pip install --upgrade pip
echo   3. If you see permission errors, right-click this script and select:
echo      "Run as administrator"
echo   4. You can also try installing manually:
echo      Open Command Prompt in this folder and run:
echo      python -m pip install -r backend\requirements.txt
echo ========================================================================
echo.
echo Press any key to close this window...
pause >nul
exit /b 1

:npm_install_failed
echo.
echo ========================================================================
echo [ERROR] Failed to install frontend packages (npm install)!
echo ========================================================================
echo.
echo WHAT YOU NEED TO DO:
echo   1. Verify your internet connection.
echo   2. Clear your npm cache by opening Command Prompt and running:
echo      npm cache clean --force
echo   3. Try installing manually:
echo      Open Command Prompt, navigate to the frontend folder, and run:
echo      cd frontend
echo      npm install
echo ========================================================================
echo.
echo Press any key to close this window...
pause >nul
exit /b 1

:npm_build_failed
echo.
echo ========================================================================
echo [ERROR] Failed to compile and build the frontend (npm run build)!
echo ========================================================================
echo.
echo WHAT YOU NEED TO DO:
echo   1. Ensure all packages installed properly by running:
echo      cd frontend
echo      npm install
echo   2. Test compiling manually by running:
echo      npm run build
echo ========================================================================
echo.
echo Press any key to close this window...
pause >nul
exit /b 1
