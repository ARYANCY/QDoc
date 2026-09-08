from __future__ import annotations

import uuid
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.db.database import get_db_connection
from backend.app.core.security import verify_password, hash_password

client = TestClient(app)


def test_login_rejects_wrong_password():
    res = client.post(
        "/api/v1/auth/login",
        json={"username": "alex.patient", "password": "wrongpassword123"},
    )
    assert res.status_code == 401
    assert "detail" in res.json()


def test_admin_rbac_rejects_non_admin(patient_headers):
    res = client.get("/api/v1/admin/users", headers=patient_headers)
    assert res.status_code == 403
    assert "Administrator access required" in res.json()["detail"]


def test_admin_unauthenticated_rejects_with_401():
    res = client.get("/api/v1/admin/users")
    assert res.status_code == 401


def test_registration_hashes_password():
    suffix = uuid.uuid4().hex[:6]
    unique_user = "testuser_" + suffix
    raw_pass = "SuperSecret2026!"

    res = client.post(
        "/api/v1/auth/register",
        json={
            "username": unique_user,
            "password": raw_pass,
            "name": "Test User",
            "email": unique_user + "@example.com",
            "role": "patient",
        },
    )

    assert res.status_code == 200
    assert "access_token" in res.json()

    conn = get_db_connection()
    row = conn.execute("SELECT password_hash FROM users WHERE username = ?;", (unique_user,)).fetchone()
    conn.close()

    assert row is not None
    stored_hash = row["password_hash"]
    assert stored_hash != raw_pass
    assert stored_hash.startswith("pbkdf2$")
    assert verify_password(raw_pass, stored_hash) is True


def test_skin_cancer_prediction_sqlite_persistence():
    from backend.app.features.skin_cancer.repository import save_prediction, list_predictions

    test_record = {
        "filename": "test_dermoscopy.jpg",
        "model": "QuantumDerma",
        "result": {
            "prediction": {"class": "nv", "confidence": 0.942},
            "probabilities": {"nv": 0.942, "mel": 0.058},
            "quantum": {"qubits": 10, "layers": 4},
            "inference_ms": 28.4,
        },
    }
    save_prediction(test_record)

    items = list_predictions()
    assert len(items) > 0
    found = any(i["filename"] == "test_dermoscopy.jpg" for i in items)
    assert found is True


def test_pbkdf2_unique_salts_for_identical_passwords():
    pwd = "MySecretPassword2026!"
    h1 = hash_password(pwd)
    h2 = hash_password(pwd)
    assert h1 != h2, "Two hashes of the same password must produce distinct random salts"
    assert verify_password(pwd, h1) is True
    assert verify_password(pwd, h2) is True
    assert verify_password("WrongPassword!", h1) is False


def test_report_html_xss_escaping():
    res = client.post(
        "/api/v1/reports/generate",
        json={
            "patient_id": "<script>alert('xss')</script>",
            "disease": "<img src=x onerror=alert(1)>",
            "prediction_class": "<b>Malignant</b>",
            "confidence": 0.95,
            "classical_confidence": 0.90,
            "top_biomarkers": ["<script>evil()</script> (30%)"],
        },
    )
    assert res.status_code == 200
    html_content = res.json()["report_html"]
    assert "<script>" not in html_content
    assert "&lt;script&gt;" in html_content
    assert "<img src=x onerror=alert(1)>" not in html_content
    assert "&lt;img src=x onerror=alert(1)&gt;" in html_content


def test_rate_limiter():
    from backend.app.core.security import InMemoryRateLimiter
    limiter = InMemoryRateLimiter(max_requests=3, window_seconds=2)
    assert limiter.check("test_ip") is True
    assert limiter.check("test_ip") is True
    assert limiter.check("test_ip") is True
    # 4th request in window exceeds max_requests
    assert limiter.check("test_ip") is False
    # different IP is unaffected
    assert limiter.check("other_ip") is True

