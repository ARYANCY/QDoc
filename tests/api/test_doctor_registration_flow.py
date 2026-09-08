import uuid
import pytest
from backend.app.db.repository import DatabaseRepository


def test_doctor_registration_creates_doctor_directory_entry(client):
    """Test that creating an account with role 'doctor' automatically registers them into the doctors directory."""
    unique_suffix = uuid.uuid4().hex[:6]
    doc_username = f"dr.neha_{unique_suffix}"
    doc_name = f"Dr. Neha Kapoor {unique_suffix.upper()}"

    # 1. Register a new doctor
    reg_payload = {
        "username": doc_username,
        "password": "doctorSecurePass123",
        "name": doc_name,
        "email": f"{doc_username}@aiims.edu",
        "role": "doctor",
        "emergency_phone": "+91 99887 76655",
        "hospital_affiliation": "Max Healthcare Cardiology",
        "specialty": "Cardiology & Preventive Medicine",
        "fee_inr": 850.0,
        "experience_years": 8,
        "languages": ["English", "Hindi", "Punjabi"],
    }

    response = client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["status"] == "success"
    user_id = data["user"]["id"]

    # 2. Verify doctor record in database repository
    doc_profile = DatabaseRepository.get_doctor_by_user_id(user_id)
    assert doc_profile is not None
    assert doc_profile["name"] == doc_name
    assert doc_profile["specialty"] == "Cardiology & Preventive Medicine"
    assert doc_profile["hospital_affiliation"] == "Max Healthcare Cardiology"
    assert doc_profile["fee_inr"] == 850.0
    assert doc_profile["experience_years"] == 8
    assert doc_profile["verification_status"] == "verified"
    assert "English" in doc_profile["languages"]

    # 3. Query the consultation doctors directory endpoint as a user/patient
    list_res = client.get("/api/v1/consultations/doctors")
    assert list_res.status_code == 200
    doctors_list = list_res.json().get("doctors", [])
    
    # Assert newly created doctor is in the list
    matching_docs = [d for d in doctors_list if d["user_id"] == user_id]
    assert len(matching_docs) == 1
    matched = matching_docs[0]
    assert matched["name"] == doc_name
    assert matched["specialty"] == "Cardiology & Preventive Medicine"
    assert matched["hospital_affiliation"] == "Max Healthcare Cardiology"
    assert len(matched["available_slots"]) > 0

    # 4. Verify specialty filtering works for this new doctor
    spec_res = client.get("/api/v1/consultations/doctors?specialty=Cardiology")
    assert spec_res.status_code == 200
    spec_docs = spec_res.json().get("doctors", [])
    assert any(d["user_id"] == user_id for d in spec_docs)


def test_update_doctor_profile_syncs_to_doctor_directory(client, admin_headers):
    """Test that updating doctor user details syncs to the doctor directory."""
    unique_suffix = uuid.uuid4().hex[:6]
    doc_username = f"dr.sync_{unique_suffix}"

    # Register doctor
    reg_payload = {
        "username": doc_username,
        "password": "doctorSecurePass123",
        "name": f"Dr. Old Name {unique_suffix}",
        "email": f"{doc_username}@hospital.org",
        "role": "doctor",
        "hospital_affiliation": "Old Hospital",
        "specialty": "General Medicine & Clinical AI",
    }
    response = client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 200
    user_id = response.json()["user"]["id"]

    # Update doctor profile via update_user_profile
    updated_name = f"Dr. Updated Name {unique_suffix}"
    updated_hospital = "Fortis Escorts Heart Institute"
    DatabaseRepository.update_user_profile(user_id, {
        "name": updated_name,
        "hospital_affiliation": updated_hospital,
    })

    # Verify doctor directory record updated
    doc_profile = DatabaseRepository.get_doctor_by_user_id(user_id)
    assert doc_profile["name"] == updated_name
    assert doc_profile["hospital_affiliation"] == updated_hospital


def test_persistent_doctor_and_user_relogin(client):
    """Test that accounts created as doctor or user are stored in DB and can efficiently log in again with credentials."""
    unique_suffix = uuid.uuid4().hex[:6]
    doc_username = f"dr.relogin_{unique_suffix}"
    doc_email = f"dr.relogin_{unique_suffix}@aiims.edu"
    doc_pass = "MySecretDoctorPass2026!"

    # 1. Register new doctor
    reg_res = client.post("/api/v1/auth/register", json={
        "username": doc_username,
        "password": doc_pass,
        "name": "Dr. Relogin Specialist",
        "email": doc_email,
        "role": "doctor",
        "specialty": "Neurology & Neuro-imaging",
    })
    assert reg_res.status_code == 200

    # 2. Log in again with exact username and password
    login_user_res = client.post("/api/v1/auth/login", json={
        "username": doc_username,
        "password": doc_pass,
    })
    assert login_user_res.status_code == 200
    data_u = login_user_res.json()
    assert "access_token" in data_u
    assert data_u["user"]["role"] == "doctor"
    assert data_u["user"]["username"] == doc_username

    # 3. Log in again with email identifier and password
    login_email_res = client.post("/api/v1/auth/login", json={
        "username": doc_email,
        "password": doc_pass,
    })
    assert login_email_res.status_code == 200
    data_e = login_email_res.json()
    assert data_e["user"]["role"] == "doctor"

    # 4. Log in case-insensitively
    login_case_res = client.post("/api/v1/auth/login", json={
        "username": doc_username.upper(),
        "password": doc_pass,
    })
    assert login_case_res.status_code == 200

    # 5. Verify incorrect password fails with 401
    bad_login = client.post("/api/v1/auth/login", json={
        "username": doc_username,
        "password": "WrongPassword123!",
    })
    assert bad_login.status_code == 401
