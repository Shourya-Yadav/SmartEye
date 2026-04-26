"""
Lazy-loaded EasyOCR wrapper.
Reader is instantiated only on the first violation — keeps startup fast and RAM low.
"""
from __future__ import annotations

import logging
from typing import Tuple

import numpy as np

logger = logging.getLogger(__name__)


class PlateOCR:
    _reader = None

    # ── public API ─────────────────────────────────────────────────────────

    @classmethod
    def read_plate(cls, image: np.ndarray) -> Tuple[str, float]:
        """
        Extract licence-plate text from a cropped vehicle image.
        Returns (plate_text, confidence).  Falls back to ("", 0.0) on error.
        """
        if image is None or image.size == 0:
            return "", 0.0
        try:
            reader  = cls._get_reader()
            results = reader.readtext(
                image,
                allowlist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                detail=1,
                paragraph=False,
            )
            if not results:
                return "", 0.0

            texts, confs = [], []
            for (_, text, conf) in results:
                text = text.strip().upper().replace(" ", "")
                if len(text) >= 2 and conf >= 0.3:
                    texts.append(text)
                    confs.append(conf)

            if not texts:
                return "", 0.0

            plate     = " ".join(texts)
            avg_conf  = round(sum(confs) / len(confs), 3)
            return plate, avg_conf

        except Exception as exc:
            logger.warning("OCR failed: %s", exc)
            return "", 0.0

    # ── private ────────────────────────────────────────────────────────────

    @classmethod
    def _get_reader(cls):
        if cls._reader is None:
            logger.info("Loading EasyOCR (first violation — one-time cost)…")
            import easyocr  # imported lazily
            cls._reader = easyocr.Reader(["en"], gpu=False, verbose=False)
            logger.info("EasyOCR ready")
        return cls._reader