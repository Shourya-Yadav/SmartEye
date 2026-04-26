import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db import close_db, connect_db
from app.routes import detect, health, violations

# ── Logging setup ──────────────────────────────────────────────────────────

Path(settings.LOG_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.EVIDENCE_DIR).mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(
            Path(settings.LOG_DIR) / "app.log", encoding="utf-8"
        ),
    ],
)
logger = logging.getLogger(__name__)


# ── Lifespan ───────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    logger.info("🚀 SmartEye AI Service started")
    yield
    await close_db()
    logger.info("SmartEye AI Service stopped")


# ── App ────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="SmartEye AI Detection Service",
    description=(
        "Traffic-violation detection microservice — "
        "YOLOv8n · MongoDB Atlas · FastAPI"
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve evidence images / clips directly
app.mount(
    "/evidence",
    StaticFiles(directory=settings.EVIDENCE_DIR),
    name="evidence",
)

# Routers
app.include_router(health.router,     tags=["System"])
app.include_router(detect.router,     prefix="/detect",     tags=["Detection"])
app.include_router(violations.router, prefix="/violations", tags=["Violations"])


@app.get("/", tags=["System"])
async def root():
    return {
        "service": "SmartEye AI Detection Service",
        "docs":    "/docs",
        "health":  "/health",
        "stats":   "/stats",
    }