from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.app.db.repository import DatabaseRepository

router = APIRouter(prefix="/api/v1/profile", tags=["User Profile & Settings"])


class ProfileUpdateRequest(BaseModel):
    name: str = "Alexander Reed"
    role: str = "patient"
    primary_email: str = "alexander.reed@email.com"
    extra_email: str | None = "alex.emergency@gmail.com"
    emergency_phone: str | None = "+91 98333 44556"
    phone: str | None = "+91 98333 44556"
    blood_group: str | None = "O+"
    age: int | None = 48
    gender: str | None = "Unspecified"
    department: str | None = "Patient Self-Analysis & Care"
    hospital: str | None = "AIIMS Cardiology & Oncology OPD"
    license_id: str | None = "PT-REC-89421"
    notifications_sms: bool = True
    notifications_email: bool = True
    notifications_critical_qpu: bool = True


@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    """Retrieves user profile and clinical contact settings from SQLite."""
    user = DatabaseRepository.get_user_by_id(user_id)
    if not user:
        user = DatabaseRepository.get_user_by_username(user_id)
    
    if user:
        patient = DatabaseRepository.get_patient(user.get("id") or user_id)
        profile = {
            "user_id": user.get("id") or user_id,
            "name": user["name"],
            "role": user["role"],
            "primary_email": user["email"],
            "extra_email": user.get("secondary_email") or "",
            "emergency_phone": user.get("emergency_phone") or "+91 98333 44556",
            "phone": user.get("emergency_phone") or "+91 98333 44556",
            "blood_group": patient.get("blood_group", "O+") if patient else "O+",
            "age": patient.get("age", 48) if patient else 48,
            "gender": patient.get("gender", "Unspecified") if patient else "Unspecified",
            "department": "Patient Self-Analysis & Care",
            "hospital": user.get("hospital_affiliation") or "AIIMS Clinical AI OPD",
            "license_id": user.get("license_number") or "PT-REC-89421",
            "notifications_sms": True,
            "notifications_email": True,
            "notifications_critical_qpu": True,
            "updated_at": user.get("created_at", time.strftime("%Y-%m-%d %H:%M:%S")),
        }
    else:
        profile = {
            "user_id": user_id,
            "name": "Alexander Reed",
            "role": "patient",
            "primary_email": "alexander.reed@email.com",
            "extra_email": "alex.emergency@gmail.com",
            "emergency_phone": "+91 98333 44556",
            "phone": "+91 98333 44556",
            "blood_group": "O+",
            "age": 48,
            "gender": "Unspecified",
            "department": "Patient Self-Analysis & Care",
            "hospital": "AIIMS Clinical AI OPD",
            "license_id": "PT-REC-89421",
            "notifications_sms": True,
            "notifications_email": True,
            "notifications_critical_qpu": True,
            "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
    return {"status": "success", "profile": profile}


@router.put("/{user_id}")
async def update_user_profile(user_id: str, req: ProfileUpdateRequest):
    """Updates user profile settings in SQLite including secondary email and emergency phone number."""
    DatabaseRepository.update_user_profile(user_id, {
        "name": req.name,
        "email": req.primary_email,
        "secondary_email": req.extra_email,
        "emergency_phone": req.emergency_phone,
        "hospital_affiliation": req.hospital,
        "license_number": req.license_id,
    })

    DatabaseRepository.add_audit_log(
        actor=req.name,
        action="PROFILE_SETTINGS_UPDATE",
        resource=user_id,
        status="SUCCESS",
    )

    record = {
        "user_id": user_id,
        "name": req.name,
        "role": req.role,
        "primary_email": req.primary_email,
        "extra_email": req.extra_email,
        "emergency_phone": req.emergency_phone,
        "phone": req.phone,
        "blood_group": req.blood_group,
        "age": req.age,
        "gender": req.gender,
        "department": req.department,
        "hospital": req.hospital,
        "license_id": req.license_id,
        "notifications_sms": req.notifications_sms,
        "notifications_email": req.notifications_email,
        "notifications_critical_qpu": req.notifications_critical_qpu,
        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }

    return {
        "status": "success",
        "message": "Profile and emergency contact settings updated in SQLite database successfully.",
        "profile": record,
    }


@router.delete("/{user_id}")
async def delete_user_profile(user_id: str):
    """Permanently deletes a user profile and credentials completely from the SQLite database."""
    user = DatabaseRepository.get_user_by_id(user_id)
    if not user:
        user = DatabaseRepository.get_user_by_username(user_id)

    target_id = user["id"] if user else user_id
    actor_name = user["name"] if user else user_id
    target_username = user.get("username") if user else user_id

    DatabaseRepository.delete_user(target_id)

    DatabaseRepository.add_audit_log(
        actor=actor_name,
        action="USER_PROFILE_SELF_DELETE",
        resource=f"{target_id}:{target_username}",
        status="SUCCESS",
    )

    return {
        "status": "success",
        "message": f"Profile and user account '{user_id}' have been permanently deleted from the database.",
    }

