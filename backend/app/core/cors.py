from __future__ import annotations

import logging
import os
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger("qmed.cors")


def get_allowed_origins() -> List[str]:
    """Parses and deduplicates allowed CORS origins from environment variables."""
    default_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://q-rakshak.health",
        "https://www.q-rakshak.health",
    ]
    raw_env_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
    if raw_env_origins:
        for item in raw_env_origins.split(","):
            cleaned = item.strip().rstrip("/")
            if cleaned and cleaned not in default_origins:
                default_origins.append(cleaned)
    return list(dict.fromkeys(default_origins))


def setup_cors(app: FastAPI) -> None:
    """Attaches hardened, enterprise-ready CORS middleware to the FastAPI application."""
    allowed_origins = get_allowed_origins()
    origin_regex = os.getenv("CORS_ORIGIN_REGEX", None) or None
    allow_credentials = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() in {"true", "1", "yes"}

    logger.info(f"[CORS] Configured {len(allowed_origins)} allowed origins: {allowed_origins}")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_origin_regex=origin_regex,
        allow_credentials=allow_credentials,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "X-API-Key",
            "Accept",
            "Origin",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
        ],
        expose_headers=[
            "Content-Disposition",
            "Content-Length",
            "X-Request-ID",
            "X-Quantum-Circuit-Depth",
        ],
        max_age=86400,
    )
