@echo off
echo =============================================
echo  SmartEye AI Service - First Time Setup
echo =============================================

if not exist .env (
    copy .env.example .env
    echo [!] .env created from .env.example
)

if not exist models   mkdir models
if not exist evidence mkdir evidence
if not exist logs     mkdir logs

echo [*] Installing Python dependencies...
pip install -r requirements.txt

echo.
echo [OK] Setup complete.
echo [>>] Run: run.bat
pause