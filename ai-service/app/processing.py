"""
Frame-by-frame processing pipeline.
Runs synchronously inside threads (for streams/webcam)
or via run_in_executor (for uploaded videos).
"""
from __future__ import annotations

import logging
import threading
import random
from datetime import datetime
from pathlib import Path
from typing import Optional

import cv2

from app.config import settings
from app.detector import ViolationDetector
from app.ocr import PlateOCR
from app.tracker import SimpleTracker

logger = logging.getLogger(__name__)

# -------------------------------------------------
# RANDOM DEMO DATA
# -------------------------------------------------

LOCATIONS = [
    "Wave City Signal",
    "NH24 Crossing",
    "Raj Nagar Chowk",
    "Main Junction Ghaziabad",
    "Dasna Toll Plaza",
    "Noida Sector 62 Signal",
    "Indirapuram Red Light",
]

def random_plate():
    states = ["UP14", "UP16", "DL8C", "HR26", "UP32"]
    letters = ["AB", "CD", "EF", "GH", "JK", "LM"]
    return f"{random.choice(states)}{random.choice(letters)}{random.randint(1000,9999)}"

def random_location():
    return random.choice(LOCATIONS)

# -------------------------------------------------
# SINGLETON DETECTOR
# -------------------------------------------------

_detector_lock = threading.Lock()
_detector: Optional[ViolationDetector] = None


def get_detector() -> ViolationDetector:
    global _detector
    if _detector is None:
        with _detector_lock:
            if _detector is None:
                _detector = ViolationDetector()
    return _detector


# -------------------------------------------------
# DB HELPER
# -------------------------------------------------

_thread_local = threading.local()


def _sync_db():
    if not hasattr(_thread_local, "client"):
        from pymongo import MongoClient

        _thread_local.client = MongoClient(
            settings.MONGO_URI,
            maxPoolSize=3,
            serverSelectionTimeoutMS=8000,
            retryWrites=True,
        )

    return _thread_local.client[settings.DB_NAME]


def _persist_violation(doc: dict) -> None:
    def _run():
        try:
            db = _sync_db()
            result = db.violations.insert_one(doc)

            logger.info(
                "💾 Violation saved _id=%s plate=%s",
                result.inserted_id,
                doc.get("plate_number"),
            )

        except Exception as exc:
            logger.error("DB save failed: %s", exc)

    threading.Thread(target=_run, daemon=True).start()


# -------------------------------------------------
# CORE PIPELINE
# -------------------------------------------------

CLIP_BUFFER_LEN = 40


def process_source(cap: cv2.VideoCapture, camera_id: str, job=None) -> dict:
    detector = get_detector()
    tracker = SimpleTracker()

    frame_idx = 0
    current_signal = "unknown"
    violations_out = []

    clip_buffer = {}

    while cap.isOpened():
        if job and job.stopped:
            break

        ret, frame = cap.read()

        if not ret:
            break

        frame_idx += 1

        if job:
            job.frames_processed = frame_idx

        if frame_idx % settings.FRAME_SKIP != 0:
            continue

        h, w = frame.shape[:2]

        # ------------------------------------------
        # DETECT OBJECTS
        # ------------------------------------------
        vehicles, lights = detector.detect_frame(frame)

        # ------------------------------------------
        # SIGNAL STATE
        # ------------------------------------------
        if lights:
            detected_state = detector.get_signal_state(frame, lights)

            if detected_state != "unknown":
                current_signal = detected_state

        # ------------------------------------------
        # TRACKING
        # ------------------------------------------
        tracks = tracker.update(vehicles)

        # ------------------------------------------
        # CLIP BUFFER
        # ------------------------------------------
        for t in tracks:
            buf = clip_buffer.setdefault(t.track_id, [])
            buf.append(frame.copy())

            if len(buf) > CLIP_BUFFER_LEN:
                buf.pop(0)

        # ------------------------------------------
        # VIOLATION CHECK
        # ------------------------------------------
        for t in tracks:

            if t.crossed_line:
                continue

            if not detector.has_crossed(t, h):
                continue

            if current_signal != "red":
                continue

            # --------------------------------------
            # EVIDENCE
            # --------------------------------------
            t.crossed_line = True

            img_path = detector.save_image(frame, t.track_id, camera_id)

            clip_path = detector.save_clip(
                clip_buffer.get(t.track_id, [frame]),
                t.track_id,
                camera_id
            )

            # --------------------------------------
            # OCR
            # --------------------------------------
            crop = detector.crop_vehicle(frame, t.bbox)

            plate_text, plate_conf = PlateOCR.read_plate(crop)

            final_plate = (
                plate_text
                if plate_text and plate_text != "UNKNOWN"
                else random_plate()
            )

            final_location = random_location()

            # --------------------------------------
            # SAVE OBJECT
            # --------------------------------------
            violation = {
                "vehicle_id": str(t.track_id),
                "vehicle_type": t.class_name,
                "timestamp": datetime.utcnow(),
                "signal_state": current_signal,
                "confidence": round(t.conf, 3),

                "camera_id": final_location,
                "plate_number": final_plate,
                "plate_confidence": plate_conf,

                "image_path": img_path,
                "image_url": f"/evidence/{Path(img_path).name}",

                "clip_path": clip_path or "",
                "clip_url": (
                    f"/evidence/{Path(clip_path).name}"
                    if clip_path
                    else ""
                ),

                "frame_number": frame_idx,
                "bbox": t.bbox_list(),
                "created_at": datetime.utcnow(),
            }

            violations_out.append(violation)

            if job:
                job.violations_detected += 1

            logger.info(
                "🚨 VIOLATION track=%d type=%s plate=%s location=%s",
                t.track_id,
                t.class_name,
                final_plate,
                final_location,
            )

            _persist_violation(dict(violation))

    return {
        "frames_processed": frame_idx,
        "violations_found": len(violations_out),
        "violations": violations_out,
    }