from __future__ import annotations

import time
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.core.security import hash_password
from backend.app.db.repository import DatabaseRepository

router = APIRouter(prefix="/api/v1/admin", tags=["Admin User Management"])


class CreateUserRequest(BaseModel):
    username: str
    password: str = "tempPass2026"
    name: str
    email: str
    secondary_email: str | None = ""
    emergency_phone: str | None = "+91 98765 43210"
    role: str = "patient"  # patient | admin
    hospital_affiliation: str | None = "AIIMS New Delhi"
    license_number: str | None = None


class UpdateUserRequest(BaseModel):
    name: str | None = None
    email: str | None = None
    secondary_email: str | None = None
    emergency_phone: str | None = None
    role: str | None = None
    hospital_affiliation: str | None = None
    license_number: str | None = None
    password: str | None = None


@router.get("/users")
async def list_all_users():
    """Retrieves all registered platform users from SQLite database."""
    users = DatabaseRepository.list_users()
    return {"status": "success", "total_users": len(users), "users": users}


@router.post("/users")
async def create_new_user(req: CreateUserRequest):
    """Creates a new user profile with assigned authority tier in SQLite database."""
    existing = DatabaseRepository.get_user_by_username(req.username)
    if existing:
        raise HTTPException(status_code=400, detail=f"Username '{req.username}' already exists.")

    uid = f"USR-{req.role[:3].upper()}-{uuid.uuid4().hex[:4].upper()}"
    new_user = DatabaseRepository.create_user({
        "id": uid,
        "username": req.username,
        "password_hash": hash_password(req.password),
        "name": req.name,
        "email": req.email,
        "secondary_email": req.secondary_email or "",
        "emergency_phone": req.emergency_phone or "+91 98765 43210",
        "role": req.role,
        "hospital_affiliation": req.hospital_affiliation or "Q-MedSense Clinical Network",
        "license_number": req.license_number or f"LIC-{uuid.uuid4().hex[:4].upper()}",
    })

    DatabaseRepository.add_audit_log(
        actor="admin.audit",
        action="USER_CREATE",
        resource=f"{uid}:{req.username}:{req.role}",
        status="SUCCESS",
    )

    return {"status": "success", "message": "User created successfully.", "user": new_user}


@router.put("/users/{user_id}")
async def update_user(user_id: str, req: UpdateUserRequest):
    """Updates user authority, credentials, and profile settings in SQLite database."""
    user = DatabaseRepository.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found.")

    updates = {}
    if req.name: updates["name"] = req.name
    if req.email: updates["email"] = req.email
    if req.secondary_email is not None: updates["secondary_email"] = req.secondary_email
    if req.emergency_phone is not None: updates["emergency_phone"] = req.emergency_phone
    if req.role: updates["role"] = req.role
    if req.hospital_affiliation is not None: updates["hospital_affiliation"] = req.hospital_affiliation
    if req.license_number is not None: updates["license_number"] = req.license_number
    if req.password: updates["password_hash"] = hash_password(req.password)

    updated = DatabaseRepository.update_user_admin(user_id, updates)

    DatabaseRepository.add_audit_log(
        actor="admin.audit",
        action="USER_UPDATE",
        resource=f"{user_id}:{updated.get('username')}",
        status="SUCCESS",
    )

    return {"status": "success", "message": "User updated successfully.", "user": updated}


@router.delete("/users/{user_id}")
async def delete_user_account(user_id: str):
    """Deletes a user account from SQLite database with WORM audit logging."""
    user = DatabaseRepository.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found.")

    DatabaseRepository.delete_user(user_id)

    DatabaseRepository.add_audit_log(
        actor="admin.audit",
        action="USER_DELETE",
        resource=f"{user_id}:{user.get('username')}",
        status="SUCCESS",
    )

    return {"status": "success", "message": f"User '{user_id}' deleted successfully."}
