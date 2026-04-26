import logging
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING

from app.config import settings

logger = logging.getLogger(__name__)


class _Database:
    client: AsyncIOMotorClient = None
    db = None


_db = _Database()


async def connect_db() -> None:
    logger.info("Connecting to MongoDB Atlas...")
    _db.client = AsyncIOMotorClient(
        settings.MONGO_URI,
        maxPoolSize=10,
        minPoolSize=2,
        serverSelectionTimeoutMS=10_000,
        retryWrites=True,
        retryReads=True,
    )
    _db.db = _db.client[settings.DB_NAME]

    # Verify connection
    await _db.client.admin.command("ping")
    logger.info("✅ MongoDB Atlas connected — db: %s", settings.DB_NAME)

    await _create_indexes()


async def close_db() -> None:
    if _db.client:
        _db.client.close()
        logger.info("MongoDB connection closed")


async def _create_indexes() -> None:
    v = _db.db.violations
    await v.create_index([("timestamp", DESCENDING)])
    await v.create_index([("camera_id", ASCENDING)])
    await v.create_index([("plate_number", ASCENDING)])
    await v.create_index([("created_at", DESCENDING)])

    c = _db.db.cameras
    await c.create_index([("camera_id", ASCENDING)], unique=True)

    lg = _db.db.logs
    await lg.create_index([("created_at", DESCENDING)])

    logger.info("MongoDB indexes ready")


def get_db():
    """Return async Motor database handle (use in FastAPI routes)."""
    return _db.db


def get_async_client() -> AsyncIOMotorClient:
    return _db.client