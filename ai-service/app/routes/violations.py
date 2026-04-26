from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query

from app.db import get_db
from app.utils import serialize_doc

router = APIRouter()


@router.get("")
async def list_violations(
    camera_id:    Optional[str] = Query(None),
    signal_state: Optional[str] = Query(None),
    plate_number: Optional[str] = Query(None),
    start_date:   Optional[str] = Query(None, description="ISO datetime"),
    end_date:     Optional[str] = Query(None, description="ISO datetime"),
    skip:  int = Query(0,  ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """List violations with optional filtering and pagination."""
    db    = get_db()
    query: dict = {}

    if camera_id:
        query["camera_id"] = camera_id
    if signal_state:
        query["signal_state"] = signal_state
    if plate_number:
        query["plate_number"] = {"$regex": plate_number, "$options": "i"}

    date_q: dict = {}
    if start_date:
        date_q["$gte"] = datetime.fromisoformat(start_date)
    if end_date:
        date_q["$lte"] = datetime.fromisoformat(end_date)
    if date_q:
        query["timestamp"] = date_q

    total  = await db.violations.count_documents(query)
    cursor = db.violations.find(query).sort("timestamp", -1).skip(skip).limit(limit)
    docs   = [serialize_doc(doc) async for doc in cursor]

    return {"total": total, "skip": skip, "limit": limit, "violations": docs}


@router.get("/{violation_id}")
async def get_violation(violation_id: str):
    db  = get_db()
    oid = _parse_oid(violation_id)
    doc = await db.violations.find_one({"_id": oid})
    if not doc:
        raise HTTPException(404, "Violation not found")
    return serialize_doc(doc)


@router.delete("/{violation_id}")
async def delete_violation(violation_id: str):
    db     = get_db()
    oid    = _parse_oid(violation_id)
    result = await db.violations.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(404, "Violation not found")
    return {"status": "deleted", "id": violation_id}


# ── helper ─────────────────────────────────────────────────────────────────

def _parse_oid(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except Exception:
        raise HTTPException(400, f"Invalid ID format: {value}")