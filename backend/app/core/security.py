from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any

from fastapi import Header, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

SECRET_KEY = os.environ.get("SECRET_KEY", "q-medsense-quantum-clinical-secret-key-2026-production")
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin.audit")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")


def hash_password(password: str) -> str:
    salt = "qmed_salt_2026"
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()


def create_access_token(data: dict[str, Any], expires_delta_sec: int = 86400) -> str:
    payload = data.copy()
    payload["exp"] = time.time() + expires_delta_sec
    payload_json = json.dumps(payload, separators=(",", ":"))
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode("utf-8")).decode("utf-8").rstrip("=")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{signature}"


def verify_access_token(token: str) -> dict[str, Any]:
    try:
        parts = token.split(".")
        if len(parts) != 2:
            raise ValueError("Malformed token")
        payload_b64, signature = parts
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            raise ValueError("Invalid signature")
        # Add padding if needed
        rem = len(payload_b64) % 4
        padded = payload_b64 + ("=" * (4 - rem) if rem > 0 else "")
        payload = json.loads(base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8"))
        if payload.get("exp", 0) < time.time():
            raise ValueError("Token expired")
        return payload
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Authentication invalid: {exc}")


async def get_current_user(authorization: str | None = Header(None)) -> dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        # Return default guest patient for self-analysis platform access
        return {"user_id": "PT-ALEX", "username": "alex.patient", "role": "patient", "name": "Alexander Reed"}
    token = authorization.split(" ")[1]
    return verify_access_token(token)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Enforces enterprise security headers per SRS Section 9.1."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response
