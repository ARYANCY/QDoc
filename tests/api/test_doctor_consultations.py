from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_doctor_listing_and_filtering():
    """Verify that doctors directory returns verified specialists and supports filtering."""
    # List all verified doctors
    res = client.get("/api/v1/consultations/doctors")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["total"] >= 3
    
    # Filter by Cardiology
    res_cardio = client.get("/api/v1/consultations/doctors?specialty=cardiology")
    assert res_cardio.status_code == 200
    docs = res_cardio.json()["doctors"]
    assert len(docs) >= 1
    assert any("Cardiology" in d["specialty"] for d in docs)


def test_slot_soft_lock_hold():
    """Verify 5-minute soft lock on doctor slots prevents double booking."""
    hold_payload = {
        "doctor_id": "DOC-KAVITA",
        "slot_time": "10:00 AM",
        "patient_id": "PT-89421",
    }
    res_hold = client.post("/api/v1/consultations/slots/hold", json=hold_payload)
    assert res_hold.status_code == 200
    data = res_hold.json()
    assert data["status"] == "held"
    assert data["ttl_seconds"] == 300

    # Another patient attempting to lock the same slot receives 409 Conflict
    conflict_payload = {
        "doctor_id": "DOC-KAVITA",
        "slot_time": "10:00 AM",
        "patient_id": "PT-OTHER",
    }
    res_conflict = client.post("/api/v1/consultations/slots/hold", json=conflict_payload)
    assert res_conflict.status_code == 409


def test_emergency_triage_checker():
    """Verify red-flag acute symptom interception vs routine clinical intake."""
    # Routine symptoms
    routine_res = client.post(
        "/api/v1/consultations/triage-check",
        json={"symptoms": "Mild fatigue and routine health review"},
    )
    assert routine_res.status_code == 200
    assert routine_res.json()["is_emergency"] is False
    assert routine_res.json()["triage_risk"] == "routine_clinical"

    # Acute emergency symptoms (Crushing chest pain radiating to arm)
    emergency_res = client.post(
        "/api/v1/consultations/triage-check",
        json={"symptoms": "Crushing chest pain radiating to arm and difficulty breathing"},
    )
    assert emergency_res.status_code == 200
    data = emergency_res.json()
    assert data["is_emergency"] is True
    assert data["triage_risk"] == "emergency_red_flag"
    assert len(data["detected_red_flags"]) >= 1


def test_booking_lifecycle_state_machine():
    """Verify booking creation, state machine transitions, and escrow hold."""
    booking_req = {
        "doctor_id": "DOC-KAVITA",
        "slot_time": "11:30 AM",
        "mode": "video",
        "patient_id": "PT-89421",
        "reason": "Preventative Cardiology evaluation",
        "symptoms": "Mild exertional discomfort",
        "duration": "1 week",
        "existing_medications": ["Atorvastatin 10mg"],
        "emergency_contact": "+91 98333 44556",
    }
    res_book = client.post("/api/v1/consultations/book", json=booking_req)
    assert res_book.status_code == 200
    b = res_book.json()["booking"]
    booking_id = b["id"]
    assert b["status"] == "confirmed"
    assert b["payment_status"] == "authorized"

    # Transition to in_consultation
    res_in = client.post(
        f"/api/v1/consultations/bookings/{booking_id}/transition",
        json={"status": "in_consultation"},
    )
    assert res_in.status_code == 200
    assert res_in.json()["booking"]["status"] == "in_consultation"

    # Transition to completed
    res_comp = client.post(
        f"/api/v1/consultations/bookings/{booking_id}/transition",
        json={"status": "completed"},
    )
    assert res_comp.status_code == 200
    assert res_comp.json()["booking"]["status"] == "completed"
    assert res_comp.json()["booking"]["payment_status"] == "captured"


def test_webrtc_room_and_admit():
    """Verify consultation room metadata, doctor admit, and in-call chat."""
    booking_id = "BK-2026-8801"
    # Get room
    res_room = client.get(f"/api/v1/consultations/rooms/{booking_id}")
    assert res_room.status_code == 200
    assert "room_token" in res_room.json()["room"]

    # Admit patient
    res_admit = client.post(f"/api/v1/consultations/rooms/{booking_id}/admit")
    assert res_admit.status_code == 200
    assert res_admit.json()["room"]["status"] == "active"

    # Post chat message
    res_chat = client.post(
        f"/api/v1/consultations/rooms/{booking_id}/chat",
        json={"sender": "Dr. Kavita Rao", "text": "Welcome Alexander, review of your VQC scan complete."},
    )
    assert res_chat.status_code == 200
    messages = res_chat.json()["chat_messages"]
    assert any("Welcome Alexander" in m["text"] for m in messages)


def test_drug_interaction_checker():
    """Verify contraindication detection between conflicting medications."""
    # Hazardous combination: Aspirin + Warfarin
    res_hazard = client.post(
        "/api/v1/consultations/prescriptions/check-interactions",
        json={"candidate_drugs": ["Aspirin 75mg"], "current_medications": ["Warfarin 5mg"]},
    )
    assert res_hazard.status_code == 200
    data = res_hazard.json()
    assert data["is_safe"] is False
    assert data["warnings_count"] >= 1
    assert any("bleeding risk" in i["warning"].lower() for i in data["interactions"])

    # Safe combination: Metformin + Vitamin D3
    res_safe = client.post(
        "/api/v1/consultations/prescriptions/check-interactions",
        json={"candidate_drugs": ["Metformin 500mg"], "current_medications": ["Vitamin D3 60k"]},
    )
    assert res_safe.status_code == 200
    assert res_safe.json()["is_safe"] is True


def test_eprescription_creation_and_signature():
    """Verify creation of cryptographically signed E-Prescription with SOAP notes."""
    rx_payload = {
        "booking_id": "BK-2026-8801",
        "patient_id": "PT-89421",
        "doctor_id": "DOC-KAVITA",
        "diagnosis": "Stage 1 Coronary Calcification Risk",
        "medications": [
            {
                "name": "Atorvastatin",
                "dosage": "20mg",
                "frequency": "0-0-1",
                "duration_days": 30,
                "instructions": "Take at bedtime",
            }
        ],
        "soap_subjective": "Patient reports mild exertional dyspnea.",
        "soap_objective": "BP 120/78 mmHg, normal heart sounds.",
        "soap_assessment": "Sub-clinical coronary risk per VQC assessment.",
        "soap_plan": "Statin therapy, repeat lipid panel in 6 weeks.",
        "lifestyle_advice": ["Brisk walk 30 mins daily", "Low sodium diet"],
        "follow_up_date": "In 6 weeks",
        "tests_to_order": ["Lipid Profile Fasting"],
    }
    res_rx = client.post("/api/v1/consultations/prescriptions", json=rx_payload)
    assert res_rx.status_code == 200
    rx = res_rx.json()["prescription"]
    assert "digital_signature_hash" in rx
    assert len(rx["digital_signature_hash"]) == 64  # SHA-256 hash
