@echo off
TITLE MEDIAOS Launcher - Mohammad Zumaan Sayyed
COLOR 0B

echo ======================================================================
echo    MEDIAOS - Neural Media Intelligence & Operating System
echo    Crafted with pride by Mohammad Zumaan Sayyed
echo ======================================================================
echo.

cd /d "%~dp0"

echo [*] Checking Python environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    pause
    exit /b 1
)

echo [*] Launching MEDIAOS Unified Orchestrator...
python run_mediaos.py

pause
