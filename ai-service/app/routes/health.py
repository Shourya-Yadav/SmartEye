from datetime import datetime, timedelta

from fastapi import APIRouter

from app.db import get_async_client, get_db

router = APIRouter()


@router.get("/health")
async def health():
    """Liveness + DB connectivity check."""
    db_status = "connected"
    try:
        await get_async_client().admin.command("ping")
    except Exception:
        db_status = "disconnected"

    return {
        "status":    "ok",
        "db":        db_status,
        "timestamp": datetime.utcnow().isoformat(),
        "service":   "SmartEye AI Detection Service v1.0",
    }


@router.get("/stats")
async def stats():
    """Aggregated violation statistics."""
    db = get_db()

    total = await db.violations.count_documents({})

    # By signal state
    by_signal: dict = {}
    async for doc in db.violations.aggregate(
        [{"$group": {"_id": "$signal_state", "count": {"$sum": 1}}}]
    ):
        by_signal[doc["_id"] or "unknown"] = doc["count"]

    # By camera
    by_camera: dict = {}
    async for doc in db.violations.aggregate(
        [{"$group": {"_id": "$camera_id", "count": {"$sum": 1}}}]
    ):
        by_camera[doc["_id"] or "—"] = doc["count"]

    # Last 24 h
    cutoff  = datetime.utcnow() - timedelta(hours=24)
    recent  = await db.violations.count_documents({"created_at": {"$gte": cutoff}})

    return {
        "total_violations":    total,
        "violations_last_24h": recent,
        "by_signal_state":     by_signal,
        "by_camera":           by_camera,
        "timestamp":           datetime.utcnow().isoformat(),
    }