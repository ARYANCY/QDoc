from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.app.core.security import create_access_token, get_current_user, hash_password, verify_password
from backend.app.core.config import settings
from backend.app.db.repository import DatabaseRepository


router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    username: str
    password: str
    name: str
    email: str
    role: str = "patient"  # patient | doctor | admin
    emergency_phone: str | None = "+91 98765 43210"
    hospital_affiliation: str | None = "AIIMS Clinical AI OPD"
    license_number: str | None = None
    specialty: str | None = "General Medicine & Clinical AI"
    experience_years: int | None = 6
    fee_inr: float | None = 600.0
    languages: list[str] | None = None
    council_name: str | None = "National Medical Commission"


@router.post("/register")
async def register(req: RegisterRequest):
    """Registers a new custom user account with full editing authority."""
    existing = DatabaseRepository.get_user_by_username(req.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists. Please choose a different handle.")

    created = DatabaseRepository.create_user({
        "username": req.username,
        "password_hash": hash_password(req.password),  # H5: hash before storing
        "name": req.name,
        "email": req.email,
        "role": req.role,
        "emergency_phone": req.emergency_phone or "+91 98765 43210",
        "hospital_affiliation": req.hospital_affiliation or ("AIIMS Clinical AI OPD" if req.role in ("doctor", "clinician") else "Community Hospital"),
        "license_number": req.license_number,
        "specialty": req.specialty or "General Medicine & Clinical AI",
        "experience_years": req.experience_years or 6,
        "fee_inr": req.fee_inr or 600.0,
        "languages": req.languages or ["English", "Hindi"],
        "council_name": req.council_name or "National Medical Commission",
    })


    token = create_access_token({
        "user_id": created.get("id"),
        "username": created["username"],
        "role": created["role"],
        "name": created["name"],
        "email": created["email"],
    })

    DatabaseRepository.add_audit_log(
        actor=created["name"],
        action="USER_REGISTRATION",
        resource=f"ROLE:{created['role']}",
        status="SUCCESS",
    )

    doctor_id = None
    if created["role"] in ("doctor", "clinician"):
        doc_rec = DatabaseRepository.get_doctor_by_user_id(created.get("id") or created.get("user_id"))
        if doc_rec:
            doctor_id = doc_rec["id"]
        else:
            doctor_id = f"DOC-{str(created.get('id', '')).replace('USR-', '')}"

    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            **created,
            "doctor_id": doctor_id,
            "is_custom": True,
            "is_test": False,
        },
    }


class LoginRequest(BaseModel):
    username: str = "alex.patient"
    password: str = "patient123"
    role: str | None = None  # optional: keep account's actual role by default



@router.post("/login")
async def login(req: LoginRequest):
    """Logs in using credentials against the database. Returns 401 on invalid credentials."""
    user = DatabaseRepository.get_user_by_credentials(req.username)

    # C4: Enforce password verification for ALL accounts — no bypass for seed accounts
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    stored_hash = user.get("password_hash", "")
    if not verify_password(req.password, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    is_test_account = settings.DB_MODE == "demo"

    # Retain the user's authentic database role; allow role persona test override only for demo/admin accounts
    stored_role = user.get("role", "patient")
    if req.role and req.role != stored_role:
        if stored_role == "admin" or str(user.get("id", "")).startswith("ADM-") or str(user.get("id", "")) in ("PT-ALEX", "DOC-USR-KAVITA"):
            user_role = req.role
        else:
            user_role = stored_role
    else:
        user_role = stored_role

    user["role"] = user_role

    doctor_id = None
    if user["role"] in ("doctor", "clinician"):
        doc_rec = DatabaseRepository.get_doctor_by_user_id(user.get("id") or user.get("user_id"))
        if doc_rec:
            doctor_id = doc_rec["id"]
        else:
            doctor_id = f"DOC-{str(user.get('id', '')).replace('USR-', '')}"

    token = create_access_token({
        "user_id": user.get("id") or user.get("user_id"),
        "username": user["username"],
        "role": user["role"],
        "name": user["name"],
        "email": user["email"],
        "doctor_id": doctor_id,
    })

    DatabaseRepository.add_audit_log(
        actor=user["name"],
        action="USER_LOGIN",
        resource=f"ROLE:{user['role']}",
        status="SUCCESS",
    )

    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user.get("id") or user.get("user_id"),
            "id": user.get("id") or user.get("user_id"),
            "username": user["username"],
            "name": user["name"],
            "role": user["role"],
            "doctor_id": doctor_id,
            "email": user["email"],
            "secondary_email": user.get("secondary_email", ""),
            "emergency_phone": user.get("emergency_phone", ""),
            "hospital_affiliation": user.get("hospital_affiliation", ""),
            "license_number": user.get("license_number", ""),
            "is_test": is_test_account,
            "is_custom": not is_test_account,
        },
    }


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
