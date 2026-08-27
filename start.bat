@echo off
title Rosee Launcher

cd /d "%~dp0"

echo.
echo  ========================================
echo   Rosee - Local LLM Assistant Launcher
echo  ========================================
echo.

echo  [1/5] Checking virtual environment...
if not exist venv\Scripts\python.exe (
    echo  Creating virtual environment...
    py -m venv venv
    if %errorlevel% neq 0 (
        echo  [ERROR] Failed to create venv
        pause
        exit /b 1
    )
)
echo  OK.

echo.
echo  [2/5] Installing Python dependencies...
"%~dp0venv\Scripts\python.exe" -m pip install --upgrade pip >nul 2>&1
"%~dp0venv\Scripts\python.exe" -m pip install --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu -r "%~dp0requirements.txt"
if %errorlevel% neq 0 (
    echo  [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)
echo  OK.

echo.
echo  [3/5] Checking model...
if exist "%~dp0models\qwen2.5-3b-instruct-q4_k_m.gguf" (
    echo  Model already present.
    goto :server
)
echo  Model not found. Downloading Qwen2.5 3B Q4_K_M...
"%~dp0venv\Scripts\python.exe" "%~dp0download_models.py"
if %errorlevel% neq 0 (
    echo  [ERROR] Model download failed
    pause
    exit /b 1
)

:server
echo.
echo  [4/5] Starting Python backend server...
start "Rosee Server" "%~dp0venv\Scripts\python.exe" "%~dp0server.py"
echo  Waiting for server to load model...
timeout /t 5 /nobreak >nul
echo  OK.

echo.
echo  [5/5] Starting frontend...
start "" http://localhost:5173
call npm run dev
pause
