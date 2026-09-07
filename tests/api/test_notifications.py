from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_notifications_feed_and_read():
    """Verify in-app notification retrieval and read status transition."""
    # List notifications for default user
    res = client.get("/api/v1/notifications")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "notifications" in data
    assert len(data["notifications"]) >= 1

    # Mark first notification as read
    first_id = data["notifications"][0]["id"]
    res_read = client.post(f"/api/v1/notifications/{first_id}/read")
    assert res_read.status_code == 200


def test_send_anti_phishing_alert():
    """Verify dispatching anti-phishing reference-number alerts."""
    alert_req = {
        "user_id": "alex.patient",
        "title": "Security Checkup Verified",
        "message": "Your profile security settings were verified.",
        "reference_code": "REF-SEC-9912",
        "category": "security",
    }
    res_alert = client.post("/api/v1/notifications/send-alert", json=alert_req)
    assert res_alert.status_code == 200
    notif = res_alert.json()["notification"]
    assert notif["reference_code"] == "REF-SEC-9912"
