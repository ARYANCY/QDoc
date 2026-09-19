import asyncio
import logging
import urllib.parse
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from backend.app.core.security import create_access_token, get_current_user, hash_password, verify_password
from backend.app.core.config import settings
from backend.app.db.repository import DatabaseRepository
from backend.app.services.email_service import send_login_notification, send_welcome_email

logger = logging.getLogger("qrakshak.auth")

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


# Removed RegisterRequest and /register endpoint
# Removed LoginRequest and /login endpoint


@router.get("/google")
async def google_login(prompt: str | None = "select_account"):
    """Redirects user to Google OAuth 2.0 consent authorization screen."""
    client_id = settings.GOOGLE_CLIENT_ID
    redirect_uri = settings.GOOGLE_REDIRECT_URI

    if not client_id or client_id.startswith("your-"):
        # Graceful notice if Google Client ID not yet set in .env
        frontend_url = settings.FRONTEND_URL.rstrip("/")
        return RedirectResponse(url=f"{frontend_url}/?error=google_oauth_credentials_required")

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": prompt or "select_account",
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url=auth_url)


@router.get("/google/callback")
async def google_callback(code: str | None = None, error: str | None = None, request: Request = None):
    """Handles redirect callback from Google OAuth 2.0.
    Exchanges code for tokens, retrieves userinfo, provisions or finds user, issues JWT,
    dispatches login email notification, and redirects to frontend with ?token=...
    """
    frontend_url = settings.FRONTEND_URL.rstrip("/")
    if error or not code:
        return RedirectResponse(url=f"{frontend_url}/?error={error or 'no_code_provided'}")

    client_id = settings.GOOGLE_CLIENT_ID
    client_secret = settings.GOOGLE_CLIENT_SECRET
    redirect_uri = settings.GOOGLE_REDIRECT_URI

    if not client_id or not client_secret or client_id.startswith("your-"):
        return RedirectResponse(url=f"{frontend_url}/?error=google_credentials_not_configured")

    token_url = "https://oauth2.googleapis.com/token"
    token_payload = {
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            token_res = await http_client.post(token_url, data=token_payload)
            if token_res.status_code != 200:
                logger.error("Failed Google token exchange: %s", token_res.text)
                return RedirectResponse(url=f"{frontend_url}/?error=token_exchange_failed")
            token_data = token_res.json()
            google_access_token = token_data.get("access_token")

            userinfo_res = await http_client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {google_access_token}"}
            )
            if userinfo_res.status_code != 200:
                logger.error("Failed Google userinfo retrieval: %s", userinfo_res.text)
                return RedirectResponse(url=f"{frontend_url}/?error=userinfo_failed")
            userinfo = userinfo_res.json()
    except Exception as exc:
        logger.error("Google OAuth error: %s", exc)
        return RedirectResponse(url=f"{frontend_url}/?error=google_network_error")

    google_email = (userinfo.get("email") or "").strip().lower()
    google_name = userinfo.get("name") or google_email.split("@")[0]
    google_picture = userinfo.get("picture", "")

    if not google_email:
        return RedirectResponse(url=f"{frontend_url}/?error=no_email_in_profile")

    user = DatabaseRepository.get_user_by_credentials(google_email)
    if not user:
        user = DatabaseRepository.create_user({
            "username": google_email,
            "password_hash": "GOOGLE_OAUTH_TOKEN",
            "name": google_name,
            "email": google_email,
            "role": "patient",
            "hospital_affiliation": "Google Clinical SSO",
            "emergency_phone": "+91 98765 43210",
        })
        asyncio.create_task(
            send_welcome_email(
                user_email=google_email,
                user_name=google_name,
                user_role="patient",
            )
        )

    doctor_id = None
    if user.get("role") in ("doctor", "clinician"):
        doc_rec = DatabaseRepository.get_doctor_by_user_id(user.get("id") or user.get("user_id"))
        doctor_id = doc_rec["id"] if doc_rec else f"DOC-{str(user.get('id', '')).replace('USR-', '')}"

    jwt_token = create_access_token({
        "user_id": user.get("id") or user.get("user_id"),
        "username": user["username"],
        "role": user["role"],
        "name": user["name"],
        "email": user["email"],
        "doctor_id": doctor_id,
        "picture": google_picture,
    })

    client_ip = request.client.host if (request and request.client) else "127.0.0.1"
    asyncio.create_task(
        send_login_notification(
            user_email=user["email"],
            user_name=user["name"],
            ip_address=client_ip,
            auth_method="Google OAuth 2.0 (Verified OpenID)",
            user_role=user["role"],
        )
    )

    DatabaseRepository.add_audit_log(
        actor=user["name"],
        action="GOOGLE_LOGIN",
        resource=f"ROLE:{user['role']}",
        ip_address=client_ip,
        status="SUCCESS",
    )

    return RedirectResponse(url=f"{frontend_url}/?token={jwt_token}")


@router.get("/me")
async def get_me(user: dict[str, Any] = Depends(get_current_user)):
    """Validates session and returns authenticated user metadata."""
    if user.get("role") in ("doctor", "clinician") and not user.get("doctor_id"):
        doc_rec = DatabaseRepository.get_doctor_by_user_id(user.get("user_id") or user.get("id"))
        if doc_rec:
            user["doctor_id"] = doc_rec["id"]
        else:
            user["doctor_id"] = f"DOC-{str(user.get('id') or user.get('user_id', '')).replace('USR-', '')}"
    return {"status": "authenticated", "user": user}
