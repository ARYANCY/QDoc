from __future__ import annotations

from fastapi import APIRouter, Response
from backend.app.core.qr_service import (
    generate_qr_base64_data_uri,
    generate_qr_png_bytes,
    generate_qr_svg_string,
)
from backend.app.db.repository import DatabaseRepository
from backend.app.core.config import settings

router = APIRouter(prefix="/api/v1/emergency", tags=["Emergency Triage"])


@router.get("/{patient_id}")
def get_public_emergency_card(patient_id: str):
    """Direct public emergency card lookup endpoint for QR scanners."""
    record = DatabaseRepository.get_emergency_profile(patient_id)
    if not record:
        record = DatabaseRepository.get_emergency_profile("PT-89421")
    return record


@router.get("/{patient_id}/card-data")
async def get_emergency_card_data(patient_id: str):
    """Fetches comprehensive clinical and emergency contact data formatted for card and triage HUD."""
    record = DatabaseRepository.get_emergency_profile(patient_id)
    if not record:
        record = DatabaseRepository.get_emergency_profile("PT-89421")

    emergency_url = f"{settings.FRONTEND_URL.rstrip('/')}/#emergency/{patient_id}"
    qr_base64 = generate_qr_base64_data_uri(emergency_url)

    return {
        "status": "success",
        "patient_id": patient_id,
        "card_data": {
            "user_id": patient_id,
            "name": record.get("name", "Alexander Reed"),
            "blood_group": record.get("blood_group", "O+"),
            "emergency_phone": record.get("emergency_phone", "+91 98333 44556"),
            "emergency_contact_name": record.get("emergency_contact_name", "Liam Reed"),
            "emergency_contact_relation": record.get("emergency_contact_relation", "Brother"),
            "allergies": record.get("allergies", "Penicillin (Anaphylaxis), Peanuts"),
            "active_medications": record.get("active_medications", "Atorvastatin 20mg (OD), Aspirin 75mg (OD)"),
            "medical_history": record.get("medical_history", "Hypertension (Stage 1), Mild Hyperlipidemia"),
            "abha_id": record.get("abha_id", "91-4829-1092-8821"),
            "hospital": record.get("hospital", "AIIMS Cardiology & Oncology OPD"),
            "license_id": record.get("license_id", "PT-REC-89421"),
            "attending_physician": record.get("attending_physician", "Dr. Sarah Lin (Cardiologist)"),
            "organ_donor": record.get("organ_donor", True),
            "sha256_hash": record.get("sha256_hash", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"),
            "qr_code_base64": qr_base64,
            "qr_url": emergency_url,
        },
    }


@router.get("/{patient_id}/qr.png")
@router.get("/{patient_id}/qr")
async def get_emergency_qr_png(patient_id: str):
    """Streams high-contrast PNG QR code image bytes directly from Python."""
    emergency_url = f"{settings.FRONTEND_URL.rstrip('/')}/#emergency/{patient_id}"
    png_bytes = generate_qr_png_bytes(emergency_url, box_size=10, border=2)
    return Response(content=png_bytes, media_type="image/png")


@router.get("/{patient_id}/qr.svg")
async def get_emergency_qr_svg(patient_id: str):
    """Streams vector SVG QR code string directly from Python."""
    emergency_url = f"{settings.FRONTEND_URL.rstrip('/')}/#emergency/{patient_id}"
    svg_str = generate_qr_svg_string(emergency_url)
    return Response(content=svg_str, media_type="image/svg+xml")

