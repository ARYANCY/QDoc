from __future__ import annotations

from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.app.core.security import get_optional_user
from backend.app.db.repository import DatabaseRepository

router = APIRouter(prefix="/api/v1/notifications", tags=["In-App Notifications"])


class NotificationCreateRequest(BaseModel):
    user_id: str
    title: str
    message: str
    reference_code: Optional[str] = ""
    category: str = "general"


@router.get("")
def get_user_notifications(
    limit: int = 20,
    current_user: dict = Depends(get_optional_user),
):
    """Module L: Retrieves in-app notifications for authenticated user."""
    username = current_user.get("username", "alex.patient")
    notifs = DatabaseRepository.list_notifications(username, limit=limit)
    unread_count = sum(1 for n in notifs if not n.get("is_read"))
    return {
        "status": "success",
        "total": len(notifs),
        "unread_count": unread_count,
        "notifications": notifs,
    }


@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: str):
    """Module L: Marks an in-app notification as read."""
    success = DatabaseRepository.mark_notification_read(notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return {"status": "success", "message": "Notification marked as read."}


@router.post("/send-alert")
def send_notification_alert(req: NotificationCreateRequest):
    """Module L: Creates a new notification with an anti-phishing reference code."""
    created = DatabaseRepository.create_notification(
        user_id=req.user_id,
        title=req.title,
        message=req.message,
        ref_code=req.reference_code or "",
        category=req.category,
    )
    return {"status": "success", "notification": created}
