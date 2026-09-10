from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_get_ai_doctor_config():
    res = client.get("/api/v1/ai-doctor/config")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "supported_voices" in data
    assert len(data["supported_voices"]) >= 3


def test_get_patient_ai_doctor_context():
    res = client.get("/api/v1/ai-doctor/context/PT-89421")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "dossier" in data
    dossier = data["dossier"]
    assert dossier["name"] == "Alexander Reed"
    assert "vitals" in dossier
    assert "blood_pressure" in dossier["vitals"]
    assert "composite_risk_score" in dossier
    assert "recent_quantum_diagnoses" in dossier
    assert "system_prompt" in data
    assert "Dr. Quantum" in data["system_prompt"]
    assert "Alexander Reed" in data["system_prompt"]


def test_generate_vapi_assistant_config():
    payload = {
        "patient_id": "PT-89421",
        "assistant_name": "Dr. Quantum — SIH Clinical AI",
        "voice_provider": "11labs",
        "voice_id": "sarah",
        "model_name": "gpt-4o",
        "temperature": 0.2,
    }
    res = client.post("/api/v1/ai-doctor/assistant-config", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "assistant_config" in data
    cfg = data["assistant_config"]
    assert cfg["name"] == "Dr. Quantum — SIH Clinical AI"
    assert "firstMessage" in cfg
    assert "model" in cfg
    assert cfg["model"]["messages"][0]["role"] == "system"
    assert "Alexander Reed" in cfg["model"]["messages"][0]["content"]


def test_ai_doctor_chat_cardiology_query():
    payload = {
        "patient_id": "PT-89421",
        "message": "Can you explain my blood pressure and heart test results?",
        "history": [],
    }
    res = client.post("/api/v1/ai-doctor/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "response" in data
    assert len(data["response"]) > 20
    assert "key_factors" in data
    assert len(data["key_factors"]) >= 1


def test_ai_doctor_chat_skin_lesion_query():
    payload = {
        "patient_id": "PT-89421",
        "message": "What did the skin cancer quantum scan say about my mole?",
        "history": [],
    }
    res = client.post("/api/v1/ai-doctor/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "QuantumDerma" in data["response"] or "Benign" in data["response"] or "nevus" in data["response"].lower()
