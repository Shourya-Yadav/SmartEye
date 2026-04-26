from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any


def serialize_doc(doc: dict) -> dict:
    """Make a MongoDB document JSON-serialisable."""
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    for key in ("timestamp", "created_at"):
        if isinstance(doc.get(key), datetime):
            doc[key] = doc[key].isoformat()
    # Coerce any remaining non-serialisable values
    return {k: (str(v) if not isinstance(v, (str, int, float, bool, list, dict, type(None)))
                else v)
            for k, v in doc.items()}


def is_valid_rtsp(url: str) -> bool:
    return url.startswith(("rtsp://", "rtmp://", "http://", "https://"))


def evidence_url(path: str) -> str:
    return f"/evidence/{Path(path).name}" if path else ""