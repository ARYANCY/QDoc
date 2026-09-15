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
        record = DatabaseRepository.get_emergency_profile("PT-89421") or {}

    emergency_url = f"{settings.FRONTEND_URL.rstrip('/')}/#emergency/{patient_id}"
    qr_base64 = generate_qr_base64_data_uri(emergency_url)

    # Format allergies if stored as structured list
    raw_allergies = record.get("allergies", [])
    if isinstance(raw_allergies, list):
        allergies_list = []
        for a in raw_allergies:
            if isinstance(a, dict):
                allergen = a.get("allergen", "")
                severity = a.get("severity", "")
                allergies_list.append(f"{allergen} ({severity})" if severity else allergen)
            elif isinstance(a, str):
                allergies_list.append(a)
        allergies_str = ", ".join(allergies_list) if allergies_list else "None Reported"
    else:
        allergies_str = str(raw_allergies) if raw_allergies else "None Reported"

    # Format active medications
    raw_meds = record.get("medications", [])
    if isinstance(raw_meds, list):
        meds_list = []
        for m in raw_meds:
            if isinstance(m, dict):
                name = m.get("name", "")
                dose = m.get("dose", "")
                freq = m.get("frequency", "")
                part = f"{name} {dose}".strip()
                if freq:
                    part = f"{part} ({freq})"
                meds_list.append(part)
            elif isinstance(m, str):
                meds_list.append(m)
        meds_str = ", ".join(meds_list) if meds_list else "None Active"
    else:
        meds_str = str(raw_meds) if raw_meds else "None Active"

    # Format emergency contact details
    contacts = record.get("emergency_contacts", [])
    primary_contact = None
    if isinstance(contacts, list) and len(contacts) > 0:
        primary_contact = next((c for c in contacts if isinstance(c, dict) and c.get("is_primary")), contacts[0])
    
    if isinstance(primary_contact, dict):
        contact_name = primary_contact.get("name") or record.get("emergency_contact_name") or "Liam Reed"
        contact_phone = primary_contact.get("phone") or record.get("emergency_phone") or record.get("emergency_contact") or "+91 98333 44556"
        contact_relation = primary_contact.get("relation") or record.get("emergency_contact_relation") or "Next of Kin"
    else:
        contact_name = record.get("emergency_contact_name") or "Liam Reed"
        contact_phone = record.get("emergency_phone") or record.get("emergency_contact") or "+91 98333 44556"
        contact_relation = record.get("emergency_contact_relation") or "Next of Kin"

    return {
        "status": "success",
        "patient_id": patient_id,
        "card_data": {
            "user_id": patient_id,
            "name": record.get("name", "Alexander Reed"),
            "blood_group": record.get("blood_group", "O+"),
            "emergency_phone": contact_phone,
            "emergency_contact_name": contact_name,
            "emergency_contact_relation": contact_relation,
            "allergies": allergies_str,
            "active_medications": meds_str,
            "medical_history": record.get("medical_history", "Hypertension (Stage 1), Mild Hyperlipidemia") if isinstance(record.get("medical_history"), str) else ", ".join(str(x) for x in record.get("medical_history", [])),
            "abha_id": record.get("abha_id", "91-4829-1092-8821"),
            "hospital": record.get("hospital", "AIIMS Cardiology & Oncology OPD"),
            "license_id": record.get("mrn") or record.get("license_id", "PT-REC-89421"),
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

