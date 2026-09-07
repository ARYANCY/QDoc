from __future__ import annotations

import uuid
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)



def test_admin_user_crud(admin_headers):
    # 1. Unauthenticated request must be rejected with 401
    res_unauth = client.get("/api/v1/admin/users")
    assert res_unauth.status_code == 401

    # 2. List users with admin auth
    res_list = client.get("/api/v1/admin/users", headers=admin_headers)
    assert res_list.status_code == 200
    users = res_list.json()["users"]
    assert len(users) >= 2

    # 3. Create new user with unique username
    unique_suffix = uuid.uuid4().hex[:6]
    unique_username = f"sarah.patient.{unique_suffix}"
    new_user = {
        "username": unique_username,
        "name": "Sarah Patel",
        "email": f"sarah.{unique_suffix}@hospital.org",
        "secondary_email": "sarah.alt@gmail.com",
        "emergency_phone": "+91 98777 66554",
        "role": "patient",
        "hospital_affiliation": "Cardiology OPD",
        "license_number": "PT-REC-8812",
        "password": "Password123!",
    }
    res_create = client.post("/api/v1/admin/users", json=new_user, headers=admin_headers)
    assert res_create.status_code == 200, f"Error creating user: {res_create.text}"
    created = res_create.json()["user"]
    assert created["username"] == unique_username
    user_id = created["user_id"]

    # 4. Update the created user
    update_payload = {
        "name": "Sarah Patel (Updated)",
        "hospital_affiliation": "Advanced Preventive Cardiology",
        "secondary_email": "sarah.pager@cardio.med",
    }
    res_update = client.put(f"/api/v1/admin/users/{user_id}", json=update_payload, headers=admin_headers)
    assert res_update.status_code == 200
    updated = res_update.json()["user"]
    assert updated["name"] == "Sarah Patel (Updated)"
    assert updated["hospital_affiliation"] == "Advanced Preventive Cardiology"
    assert updated["secondary_email"] == "sarah.pager@cardio.med"

    # 5. Delete the user
    res_delete = client.delete(f"/api/v1/admin/users/{user_id}", headers=admin_headers)
    assert res_delete.status_code == 200
    assert res_delete.json()["status"] == "success"

    # 6. Verify user is no longer listed
    res_verify = client.get("/api/v1/admin/users", headers=admin_headers)
    user_ids = [u["user_id"] for u in res_verify.json()["users"]]
    assert user_id not in user_ids

