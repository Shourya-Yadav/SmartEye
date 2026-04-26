import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


class Settings:
    MONGO_URI: str       = os.getenv("MONGO_URI", "")
    DB_NAME: str         = os.getenv("DB_NAME", "smarteye")
    MODEL_PATH: str      = os.getenv("MODEL_PATH", "models/yolov8n.pt")
    CONFIDENCE: float    = float(os.getenv("CONFIDENCE", "0.4"))
    FRAME_SKIP: int      = int(os.getenv("FRAME_SKIP", "2"))
    INPUT_SIZE: int      = int(os.getenv("INPUT_SIZE", "640"))
    STOP_LINE_RATIO: float = float(os.getenv("STOP_LINE_RATIO", "0.65"))
    EVIDENCE_DIR: str    = os.getenv("EVIDENCE_DIR", "evidence")
    LOG_DIR: str         = os.getenv("LOG_DIR", "logs")
    MAX_STREAMS: int     = int(os.getenv("MAX_STREAMS", "2"))
    HOST: str            = os.getenv("HOST", "0.0.0.0")
    PORT: int            = int(os.getenv("PORT", "8000"))


settings = Settings()