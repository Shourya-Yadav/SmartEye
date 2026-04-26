"""
Lightweight IoU-based multi-object tracker (SORT-style).
No external tracker dependencies required.
"""
from __future__ import annotations

import numpy as np
from scipy.optimize import linear_sum_assignment
from typing import Dict, List, Optional, Tuple


# ── helpers ────────────────────────────────────────────────────────────────

def _iou(a: np.ndarray, b: np.ndarray) -> float:
    x1 = max(a[0], b[0]); y1 = max(a[1], b[1])
    x2 = min(a[2], b[2]); y2 = min(a[3], b[3])
    inter = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    if inter == 0:
        return 0.0
    area_a = (a[2] - a[0]) * (a[3] - a[1])
    area_b = (b[2] - b[0]) * (b[3] - b[1])
    return inter / (area_a + area_b - inter + 1e-6)


# ── Track ──────────────────────────────────────────────────────────────────

class Track:
    _counter: int = 0

    def __init__(self, bbox: np.ndarray, class_id: int, class_name: str, conf: float):
        Track._counter += 1
        self.track_id: int       = Track._counter
        self.bbox: np.ndarray    = bbox.copy()
        self.class_id: int       = class_id
        self.class_name: str     = class_name
        self.conf: float         = conf
        self.hits: int           = 1
        self.miss_streak: int    = 0
        self.crossed_line: bool  = False
        self._history: List[np.ndarray] = [bbox.copy()]

    def update(self, bbox: np.ndarray, conf: float) -> None:
        self.bbox        = bbox.copy()
        self.conf        = conf
        self.hits       += 1
        self.miss_streak = 0
        self._history.append(bbox.copy())
        if len(self._history) > 60:
            self._history.pop(0)

    @property
    def center(self) -> Tuple[float, float]:
        return (self.bbox[0] + self.bbox[2]) / 2, (self.bbox[1] + self.bbox[3]) / 2

    @property
    def bottom_y(self) -> float:
        return float(self.bbox[3])

    def bbox_list(self) -> List[float]:
        return self.bbox.tolist()

    @classmethod
    def reset_counter(cls) -> None:
        cls._counter = 0


# ── Tracker ────────────────────────────────────────────────────────────────

class SimpleTracker:
    """
    IoU-based Hungarian-assignment tracker.
    Call update() each frame with a list of detection dicts.
    """

    def __init__(self, max_miss: int = 10, min_iou: float = 0.25):
        self.max_miss  = max_miss
        self.min_iou   = min_iou
        self._tracks: Dict[int, Track] = {}

    # ── public ─────────────────────────────────────────────────────────────

    def update(self, detections: List[dict]) -> List[Track]:
        """
        detections: list of {"bbox": [x1,y1,x2,y2], "class_id": int,
                              "class_name": str, "conf": float}
        Returns all currently-active tracks.
        """
        if not detections:
            self._age_all()
            return self._active_tracks()

        det_bboxes = np.array([d["bbox"] for d in detections], dtype=float)
        track_ids  = list(self._tracks.keys())

        if not track_ids:
            for d in detections:
                self._new_track(d)
            return self._active_tracks()

        trk_bboxes = np.array([self._tracks[tid].bbox for tid in track_ids], dtype=float)
        cost = np.zeros((len(track_ids), len(detections)), dtype=float)
        for i, tb in enumerate(trk_bboxes):
            for j, db in enumerate(det_bboxes):
                cost[i, j] = _iou(tb, db)

        row_idx, col_idx = linear_sum_assignment(-cost)

        matched_trk, matched_det = set(), set()
        for r, c in zip(row_idx, col_idx):
            if cost[r, c] >= self.min_iou:
                tid = track_ids[r]
                self._tracks[tid].update(det_bboxes[c], detections[c]["conf"])
                matched_trk.add(tid)
                matched_det.add(c)

        for i, tid in enumerate(track_ids):
            if tid not in matched_trk:
                self._tracks[tid].miss_streak += 1

        for j, d in enumerate(detections):
            if j not in matched_det:
                self._new_track(d)

        self._prune_dead()
        return self._active_tracks()

    def reset(self) -> None:
        self._tracks.clear()

    # ── private ────────────────────────────────────────────────────────────

    def _new_track(self, d: dict) -> None:
        t = Track(np.array(d["bbox"], dtype=float), d["class_id"], d["class_name"], d["conf"])
        self._tracks[t.track_id] = t

    def _age_all(self) -> None:
        for t in self._tracks.values():
            t.miss_streak += 1
        self._prune_dead()

    def _prune_dead(self) -> None:
        dead = [tid for tid, t in self._tracks.items() if t.miss_streak > self.max_miss]
        for tid in dead:
            del self._tracks[tid]

    def _active_tracks(self) -> List[Track]:
        return list(self._tracks.values())