@echo off
echo =============================================
echo  SmartEye AI Detection Service
echo =============================================

if not exist .env (
    echo [ERROR] .env not found. Run setup.bat first.
    pause
    exit /b 1
)
if not exist evidence mkdir evidence
if not exist logs     mkdir logs
if not exist models   mkdir models

echo [*] Starting service on http://localhost:8000
echo [*] API docs at   http://localhost:8000/docs
echo.
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level info
pause