import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="session")
def patient_token(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "alex.patient", "password": "patient123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture(scope="session")
def admin_token(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin.audit", "password": "admin123", "role": "admin"},

    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture(scope="session")
def patient_headers(patient_token):
    return {"Authorization": f"Bearer {patient_token}"}


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}
