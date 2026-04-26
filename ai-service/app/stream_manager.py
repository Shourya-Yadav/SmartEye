"""
Manages long-running RTSP / webcam stream jobs in daemon threads.
At most MAX_STREAMS can be active simultaneously.
"""
from __future__ import annotations

import logging
import threading
import uuid
from datetime import datetime
from typing import Callable, Dict, List, Optional

from app.config import settings

logger = logging.getLogger(__name__)


class StreamJob:
    def __init__(self, stream_id: str, source, camera_id: str):
        self.stream_id:          str      = stream_id
        self.source                       = source
        self.camera_id:          str      = camera_id
        self.status:             str      = "starting"
        self.frames_processed:   int      = 0
        self.violations_detected: int     = 0
        self.started_at:         datetime = datetime.utcnow()
        self.stopped:            bool     = False
        self._thread: Optional[threading.Thread] = None

    def stop(self) -> None:
        self.stopped = True

    def to_dict(self) -> dict:
        return {
            "stream_id":           self.stream_id,
            "camera_id":           self.camera_id,
            "status":              self.status,
            "frames_processed":    self.frames_processed,
            "violations_detected": self.violations_detected,
            "started_at":          self.started_at.isoformat(),
        }


class StreamManager:
    def __init__(self):
        self._jobs: Dict[str, StreamJob] = {}
        self._lock = threading.Lock()

    # ── public ─────────────────────────────────────────────────────────────

    def active_count(self) -> int:
        with self._lock:
            return sum(1 for j in self._jobs.values() if j.status == "running")

    def start(self, source, camera_id: str, processor: Callable) -> str:
        if self.active_count() >= settings.MAX_STREAMS:
            raise RuntimeError(
                f"Max concurrent streams ({settings.MAX_STREAMS}) reached"
            )

        stream_id = uuid.uuid4().hex[:8]
        job       = StreamJob(stream_id, source, camera_id)

        def _run():
            processor(job)

        t           = threading.Thread(target=_run, daemon=True, name=f"stream-{stream_id}")
        job._thread = t

        with self._lock:
            self._jobs[stream_id] = job

        t.start()
        logger.info("Stream %s started  camera=%s", stream_id, camera_id)
        return stream_id

    def stop(self, stream_id: str) -> bool:
        with self._lock:
            job = self._jobs.get(stream_id)
        if job:
            job.stop()
            logger.info("Stream %s stop requested", stream_id)
            return True
        return False

    def get(self, stream_id: str) -> Optional[StreamJob]:
        return self._jobs.get(stream_id)

    def list_all(self) -> List[dict]:
        with self._lock:
            return [j.to_dict() for j in self._jobs.values()]


stream_manager = StreamManager()