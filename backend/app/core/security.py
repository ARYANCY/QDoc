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

# Pull secret from centralized settings so there is a single source of truth.
try:
    from backend.app.core.config import settings as _settings
    SECRET_KEY: str = _settings.JWT_SECRET
except Exception:  # pragma: no cover
    SECRET_KEY = os.environ.get("SECRET_KEY", "q-medsense-quantum-clinical-secret-key-2026-production")

# ── Password Hashing — PBKDF2-HMAC-SHA256 (100k iterations) ───────────────────
_PBKDF2_ITERATIONS = 100_000
_PBKDF2_HASH = "sha256"
_PBKDF2_SALT = "qmed_pbkdf2_salt_v2"


def hash_password(password: str) -> str:
    """Hashes password with PBKDF2-HMAC-SHA256 (100k iterations).
    Backward-compatible: verify_password also accepts the legacy SHA-256 format.
    """
    dk = hashlib.pbkdf2_hmac(
        _PBKDF2_HASH,
        password.encode("utf-8"),
        _PBKDF2_SALT.encode("utf-8"),
        _PBKDF2_ITERATIONS,
    )
    return "pbkdf2$" + dk.hex()


def _legacy_hash(password: str) -> str:
    """Returns the old SHA-256 hash for backward-compatible verification only."""
    salt = "qmed_salt_2026"
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()


def verify_password(plain: str, stored_hash: str) -> bool:
    """Constant-time password verification.
    Accepts PBKDF2 hashes (prefix 'pbkdf2$'), legacy SHA-256 hashes,
    and handles automatic migration of pre-existing plaintext seed accounts.
    """
    if stored_hash.startswith("pbkdf2$"):
        expected = hash_password(plain)
        return hmac.compare_digest(expected.encode(), stored_hash.encode())
    # Tolerates legacy unhashed entries in existing database during migration
    if hmac.compare_digest(plain.encode(), stored_hash.encode()):
        return True
    # Legacy SHA-256 path
    expected_legacy = _legacy_hash(plain)
    return hmac.compare_digest(expected_legacy.encode(), stored_hash.encode())



# ── Token (HMAC-SHA256, payload.signature) ───────────────────────────────────

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
        rem = len(payload_b64) % 4
        padded = payload_b64 + ("=" * (4 - rem) if rem > 0 else "")
        payload = json.loads(base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8"))
        if payload.get("exp", 0) < time.time():
            raise ValueError("Token expired")
        return payload
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Authentication invalid: {exc}")


async def get_current_user(authorization: str | None = Header(None)) -> dict[str, Any]:
    """Requires a valid Bearer token. Raises HTTP 401 if missing or invalid.
    Use get_optional_user for endpoints that allow unauthenticated guest access.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid. Please log in.")
    token = authorization.split(" ", 1)[1]
    return verify_access_token(token)


async def get_optional_user(authorization: str | None = Header(None)) -> dict[str, Any]:
    """Returns authenticated user dict OR a default guest patient dict.
    Use this for endpoints where unauthenticated (guest) access is intentional.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return {"user_id": "PT-ALEX", "username": "alex.patient", "role": "patient", "name": "Alexander Reed"}
    token = authorization.split(" ", 1)[1]
    try:
        return verify_access_token(token)
    except HTTPException:
        return {"user_id": "PT-ALEX", "username": "alex.patient", "role": "patient", "name": "Alexander Reed"}


def require_admin(user: dict[str, Any]) -> dict[str, Any]:
    """Guard helper — raises HTTP 403 if the authenticated user is not an admin."""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Administrator access required.")
    return user


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
