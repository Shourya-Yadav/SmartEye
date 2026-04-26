"""
Core detection engine:
  - YOLOv8n for vehicles + traffic lights
  - HSV colour analysis for signal state (red / yellow / green)
  - Evidence image & clip saving
"""
from __future__ import annotations

import logging
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

import cv2
import numpy as np
from ultralytics import YOLO

from app.config import settings

logger = logging.getLogger(__name__)

# COCO class IDs
VEHICLE_CLASSES: dict = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}
TRAFFIC_LIGHT_CLASS: int = 9


# ── Signal colour analysis ─────────────────────────────────────────────────

class SignalDetector:
    """Determine traffic-light state from a bounding-box crop."""

    @staticmethod
    def get_state(frame: np.ndarray, bbox: list) -> str:
        x1, y1, x2, y2 = map(int, bbox)
        h, w = frame.shape[:2]
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w - 1, x2), min(h - 1, y2)

        crop = frame[y1:y2, x1:x2]
        if crop.size == 0:
            return "unknown"

        bh = y2 - y1
        third = max(1, bh // 3)

        # Split into top / mid / bottom thirds (red / yellow / green layout)
        top    = frame[y1        : y1 + third,     x1:x2]
        mid    = frame[y1 + third: y1 + 2 * third, x1:x2]
        bottom = frame[y1 + 2 * third: y2,         x1:x2]

        def brightness(region: np.ndarray) -> int:
            if region.size == 0:
                return 0
            hsv  = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
            mask = cv2.inRange(hsv,
                               np.array([0, 60, 150], np.uint8),
                               np.array([180, 255, 255], np.uint8))
            return int(cv2.countNonZero(mask))

        scores = {"red": brightness(top),
                  "yellow": brightness(mid),
                  "green": brightness(bottom)}
        best = max(scores, key=scores.get)

        # Minimum pixel threshold — fall back to full-box HSV
        if scores[best] < 8:
            hsv    = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
            r1     = cv2.inRange(hsv, np.array([0,   100, 100]), np.array([10,  255, 255]))
            r2     = cv2.inRange(hsv, np.array([160, 100, 100]), np.array([180, 255, 255]))
            yellow = cv2.inRange(hsv, np.array([15,  100, 100]), np.array([35,  255, 255]))
            green  = cv2.inRange(hsv, np.array([40,   50,  50]), np.array([90,  255, 255]))
            fb = {"red":    cv2.countNonZero(r1) + cv2.countNonZero(r2),
                  "yellow": cv2.countNonZero(yellow),
                  "green":  cv2.countNonZero(green)}
            best = max(fb, key=fb.get)
            if fb[best] < 5:
                return "unknown"

        return best


# ── Main detector ──────────────────────────────────────────────────────────

class ViolationDetector:

    def __init__(
        self,
        model_path: str        = settings.MODEL_PATH,
        confidence: float      = settings.CONFIDENCE,
        frame_skip: int        = settings.FRAME_SKIP,
        input_size: int        = settings.INPUT_SIZE,
        stop_line_ratio: float = settings.STOP_LINE_RATIO,
        evidence_dir: str      = settings.EVIDENCE_DIR,
    ):
        # Auto-download if file missing (ultralytics handles it)
        mp = Path(model_path)
        if not mp.exists():
            logger.warning("Model file %s not found — downloading yolov8n.pt", model_path)
            model_path = "yolov8n.pt"

        logger.info("Loading YOLO model: %s", model_path)
        self.model = YOLO(model_path)
        self.model.fuse()           # fuse Conv+BN for faster CPU inference

        self.confidence      = confidence
        self.frame_skip      = frame_skip
        self.input_size      = input_size
        self.stop_line_ratio = stop_line_ratio
        self.evidence_dir    = Path(evidence_dir)
        self.evidence_dir.mkdir(parents=True, exist_ok=True)
        self._signal_det     = SignalDetector()
        logger.info("ViolationDetector ready  (conf=%.2f  skip=%d  size=%d)",
                    confidence, frame_skip, input_size)

    # ── Detection ──────────────────────────────────────────────────────────

    def detect_frame(
        self, frame: np.ndarray
    ) -> Tuple[List[dict], List[dict]]:
        """Run YOLOv8 on a frame. Returns (vehicles, traffic_lights)."""
        results = self.model(
            frame,
            imgsz=self.input_size,
            conf=self.confidence,
            verbose=False,
            device="cpu",
        )[0]

        vehicles, lights = [], []
        for box in results.boxes:
            cls_id = int(box.cls[0])
            conf   = float(box.conf[0])
            bbox   = box.xyxy[0].tolist()          # [x1,y1,x2,y2]

            if cls_id in VEHICLE_CLASSES:
                vehicles.append({"bbox": bbox, "class_id": cls_id,
                                  "class_name": VEHICLE_CLASSES[cls_id], "conf": conf})
            elif cls_id == TRAFFIC_LIGHT_CLASS:
                lights.append({"bbox": bbox, "conf": conf})

        return vehicles, lights

    def get_signal_state(self, frame: np.ndarray, lights: List[dict]) -> str:
        if not lights:
            return "unknown"
        states  = [self._signal_det.get_state(frame, l["bbox"]) for l in lights]
        valid   = [s for s in states if s != "unknown"]
        return Counter(valid).most_common(1)[0][0] if valid else "unknown"

    # ── Geometry ───────────────────────────────────────────────────────────

    def stop_line_y(self, frame_height: int) -> int:
        return int(frame_height * self.stop_line_ratio)

    def has_crossed(self, track, frame_height: int) -> bool:
        return track.bottom_y >= self.stop_line_y(frame_height)

    def crop_vehicle(self, frame: np.ndarray, bbox: list) -> np.ndarray:
        x1, y1, x2, y2 = map(int, bbox)
        h, w = frame.shape[:2]
        return frame[max(0, y1):min(h, y2), max(0, x1):min(w, x2)].copy()

    # ── Evidence saving ────────────────────────────────────────────────────

    def save_image(self, frame: np.ndarray, track_id: int, camera_id: str) -> str:
        ts   = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        name = f"viol_{camera_id}_{track_id}_{ts}.jpg"
        path = self.evidence_dir / name
        cv2.imwrite(str(path), frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        return str(path)

    def save_clip(
        self, frames: List[np.ndarray], track_id: int, camera_id: str
    ) -> Optional[str]:
        if not frames:
            return None
        ts    = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        name  = f"clip_{camera_id}_{track_id}_{ts}.mp4"
        path  = self.evidence_dir / name
        h, w  = frames[0].shape[:2]
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out   = cv2.VideoWriter(str(path), fourcc, 10, (w, h))
        for f in frames:
            out.write(f)
        out.release()
        return str(path)

    # ── Annotation ─────────────────────────────────────────────────────────

    def annotate(
        self, frame: np.ndarray, tracks, signal_state: str
    ) -> np.ndarray:
        out   = frame.copy()
        h, _  = frame.shape[:2]
        sly   = self.stop_line_y(h)

        # Stop line
        cv2.line(out, (0, sly), (frame.shape[1], sly), (0, 255, 255), 2)
        cv2.putText(out, "STOP LINE", (8, sly - 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 255), 2)

        # Signal badge
        _SCOLORS = {"red": (0,0,255), "yellow": (0,255,255),
                    "green": (0,200,0), "unknown": (120,120,120)}
        sc = _SCOLORS.get(signal_state, (120,120,120))
        cv2.putText(out, f"SIGNAL: {signal_state.upper()}",
                    (8, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.9, sc, 3)

        # Tracks
        for t in tracks:
            x1, y1, x2, y2 = map(int, t.bbox)
            color = (0, 0, 255) if t.crossed_line else (0, 220, 0)
            cv2.rectangle(out, (x1, y1), (x2, y2), color, 2)
            cv2.putText(out, f"#{t.track_id} {t.class_name}",
                        (x1, y1 - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 2)
        return out