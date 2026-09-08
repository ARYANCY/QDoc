from __future__ import annotations

import os
from pathlib import Path
from typing import List


class Settings:
    PROJECT_NAME: str = "Q-MedSense — Quantum Clinical Decision Support API"
    VERSION: str = "2.0.0"
    SIH_PROBLEM_ID: str = "26139"
    API_V1_PREFIX: str = "/api/v1"

    # Directory Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent.parent
    BACKEND_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BACKEND_DIR
    DB_MODE: str = os.getenv("QMED_DB_MODE", "production").strip().lower()
    REAL_DB_PATH: Path = Path(os.getenv("QMED_REAL_DB_PATH", str(BACKEND_DIR / "qmedsense.db")))
    DEMO_DB_PATH: Path = Path(os.getenv("QMED_DEMO_DB_PATH", str(BACKEND_DIR / "qmedsense_demo.db")))
    DB_PATH: Path = Path(os.getenv("QMED_DB_PATH", str(DEMO_DB_PATH if DB_MODE == "demo" else REAL_DB_PATH)))
    MODELS_DIR: Path = BASE_DIR / "models"
    REPORTS_DIR: Path = BASE_DIR / "reports"
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # Security & Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "qmed-sih2026-super-secret-key-change-in-prod")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

    # Quantum Backend & Execution
    QUANTUM_BACKEND: str = os.getenv("QUANTUM_BACKEND", "simulator")
    SIMULATOR_SHOTS: int = int(os.getenv("SIMULATOR_SHOTS", "1024"))

    # CORS
    @property
    def cors_origins(self) -> List[str]:
        default_origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
        extra = os.getenv("CORS_ALLOWED_ORIGINS", "")
        if extra:
            default_origins.extend(origin.strip() for origin in extra.split(",") if origin.strip())
        return list(dict.fromkeys(default_origins))


settings = Settings()
if settings.DB_MODE not in {"production", "demo"}:
    raise ValueError("QMED_DB_MODE must be 'production' or 'demo'.")
