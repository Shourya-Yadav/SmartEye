import logging
import os
import shutil
import tempfile
import uuid
from pathlib import Path
from typing import Optional

import cv2
from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile

from app.processing import get_detector, process_source
from app.stream_manager import stream_manager

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_EXT = {".mp4", ".avi", ".mov", ".mkv", ".webm"}


# ── /detect/video ──────────────────────────────────────────────────────────

@router.post("/video")
async def detect_video(
    background_tasks: BackgroundTasks,
    file:       UploadFile = File(...),
    camera_id:  str        = Form(default="upload"),
    async_mode: bool       = Form(default=False),
):
    """
    Upload an MP4/AVI/MOV video for violation detection.

    - **async_mode=false** (default): process synchronously, return results.
    - **async_mode=true**: queue in background, return job_id immediately.
    """
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, f"Unsupported format '{ext}'. Use: {ALLOWED_EXT}")

    # Save upload to temp file
    tmp_path = Path(tempfile.gettempdir()) / f"se_{uuid.uuid4().hex}{ext}"
    with open(tmp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    if async_mode:
        job_id = uuid.uuid4().hex[:8]
        background_tasks.add_task(_bg_video, str(tmp_path), camera_id, job_id)
        return {"status": "queued", "job_id": job_id,
                "message": "Processing in background. Query /violations for results."}

    # Synchronous — run in thread pool so we don't block the event loop
    import asyncio
    loop   = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None, _sync_video, str(tmp_path), camera_id
    )
    return {"status": "completed", **result}


def _sync_video(video_path: str, camera_id: str) -> dict:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video: {video_path}")
    try:
        return process_source(cap, camera_id)
    finally:
        cap.release()
        try:
            os.remove(video_path)
        except OSError:
            pass


def _bg_video(video_path: str, camera_id: str, job_id: str) -> None:
    try:
        result = _sync_video(video_path, camera_id)
        logger.info("BG job %s done — %d violations", job_id, result["violations_found"])
    except Exception as exc:
        logger.error("BG job %s failed: %s", job_id, exc)


# ── /detect/stream ─────────────────────────────────────────────────────────

@router.post("/stream")
async def detect_stream(
    rtsp_url:  str = Form(...),
    camera_id: str = Form(default="stream"),
):
    """Start processing an RTSP / IP-camera stream in the background."""
    if not rtsp_url.startswith(("rtsp://", "rtmp://", "http://", "https://")):
        raise HTTPException(400, "URL must start with rtsp://, rtmp://, http://, or https://")

    try:
        sid = stream_manager.start(rtsp_url, camera_id, _make_cap_processor(rtsp_url, camera_id))
    except RuntimeError as exc:
        raise HTTPException(429, str(exc))

    return {"status": "started", "stream_id": sid, "camera_id": camera_id,
            "info": "Stop via DELETE /detect/stream/{stream_id}"}


# ── /detect/webcam ─────────────────────────────────────────────────────────

@router.post("/webcam")
async def detect_webcam(
    device_index: int = Form(default=0),
    camera_id:    str = Form(default="webcam"),
):
    """Start processing a USB webcam feed in the background."""
    try:
        sid = stream_manager.start(
            device_index, camera_id,
            _make_cap_processor(device_index, camera_id)
        )
    except RuntimeError as exc:
        raise HTTPException(429, str(exc))

    return {"status": "started", "stream_id": sid,
            "device_index": device_index, "camera_id": camera_id}


# ── /detect/streams (list / stop) ─────────────────────────────────────────

@router.get("/streams")
async def list_streams():
    """List all stream jobs (running, completed, failed)."""
    return stream_manager.list_all()


@router.delete("/stream/{stream_id}")
async def stop_stream(stream_id: str):
    if stream_manager.stop(stream_id):
        return {"status": "stop_requested", "stream_id": stream_id}
    raise HTTPException(404, f"Stream '{stream_id}' not found")


# ── shared processor factory ───────────────────────────────────────────────

def _make_cap_processor(source, camera_id: str):
    """Return a function(job) that opens a VideoCapture and runs the pipeline."""
    def _processor(job):
        job.status = "running"
        cap = cv2.VideoCapture(source)
        if not cap.isOpened():
            job.status = "failed"
            logger.error("Cannot open source: %s", source)
            return
        try:
            process_source(cap, camera_id, job)
            job.status = "completed"
        except Exception as exc:
            job.status = "failed"
            logger.error("Stream %s error: %s", job.stream_id, exc)
        finally:
            cap.release()
    return _processor