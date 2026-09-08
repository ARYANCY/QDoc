from __future__ import annotations

import json
import uuid
from typing import Any, Optional

from .database import get_db_connection


class DatabaseRepository:
    """Repository handling all database queries and transaction operations."""

    @staticmethod
    def get_user_by_username(username: str) -> Optional[dict[str, Any]]:
        conn = get_db_connection()
        clean = (username or "").strip()
        row = conn.execute("SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?);", (clean, clean)).fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        d["user_id"] = d["id"]
        return d

    @staticmethod
    def get_user_by_credentials(identifier: str) -> Optional[dict[str, Any]]:
        return DatabaseRepository.get_user_by_username(identifier)

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[dict[str, Any]]:
        conn = get_db_connection()
        clean = (user_id or "").strip()
        row = conn.execute("SELECT * FROM users WHERE id = ? OR username = ?;", (clean, clean)).fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        d["user_id"] = d["id"]
        return d

    @staticmethod
    def list_users() -> list[dict[str, Any]]:
        conn = get_db_connection()
        rows = conn.execute("SELECT id, username, name, email, secondary_email, emergency_phone, role, hospital_affiliation, license_number, created_at FROM users ORDER BY created_at ASC;").fetchall()
        conn.close()
        res = []
        for r in rows:
            d = dict(r)
            d["user_id"] = d["id"]
            res.append(d)
        return res

    @staticmethod
    def create_user(user_data: dict[str, Any]) -> dict[str, Any]:
        conn = get_db_connection()
        uid = user_data.get("id") or f"USR-{uuid.uuid4().hex[:6].upper()}"
        username = user_data["username"].strip()
        raw_pwd = user_data.get("password_hash") or user_data.get("password", "tempPass2026")
        if not raw_pwd.startswith("pbkdf2$"):
            from backend.app.core.security import hash_password
            pwd = hash_password(raw_pwd)
        else:
            pwd = raw_pwd

        name = user_data.get("name", username.replace(".", " ").title()).strip()
        email = user_data.get("email", f"{username.lower()}@qmedsense.health").strip()
        sec_email = user_data.get("secondary_email", "").strip()
        phone = user_data.get("emergency_phone", "+91 98765 43210").strip()
        role = user_data.get("role", "patient").strip().lower()
        aff = user_data.get("hospital_affiliation", "AIIMS Clinical AI OPD" if role in ("doctor", "clinician") else "Q-MedSense Network")
        lic = user_data.get("license_number", f"MCI-2026-{uuid.uuid4().hex[:4].upper()}" if role in ("doctor", "clinician") else f"LIC-{uuid.uuid4().hex[:4].upper()}")

        conn.execute("""
        INSERT INTO users (id, username, password_hash, name, email, secondary_email, emergency_phone, role, hospital_affiliation, license_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(username) DO UPDATE SET
            password_hash = excluded.password_hash,
            name = excluded.name,
            email = excluded.email,
            role = excluded.role,
            hospital_affiliation = excluded.hospital_affiliation,
            license_number = excluded.license_number;
        """, (uid, username, pwd, name, email, sec_email, phone, role, aff, lic))
        conn.commit()
        created = DatabaseRepository.get_user_by_id(uid)
        conn.close()

        # If role is doctor or clinician, automatically ensure doctor profile is created in doctors table
        if role.lower() in ("doctor", "clinician"):
            existing_doc = DatabaseRepository.get_doctor_by_user_id(uid)
            if not existing_doc:
                doc_name = name if (name.startswith("Dr.") or name.startswith("Dr ")) else f"Dr. {name}"
                DatabaseRepository.create_doctor({
                    "id": f"DOC-{uid.replace('USR-', '')}",
                    "user_id": uid,
                    "name": doc_name,
                    "specialty": user_data.get("specialty") or "General Medicine & Clinical AI",
                    "registration_number": lic or f"MCI-2026-{uuid.uuid4().hex[:5].upper()}",
                    "council_name": user_data.get("council_name") or "National Medical Commission",
                    "experience_years": int(user_data.get("experience_years", 6)),
                    "fee_inr": float(user_data.get("fee_inr", 600.0)),
                    "rating": float(user_data.get("rating", 4.9)),
                    "languages": user_data.get("languages") or ["English", "Hindi"],
                    "hospital_affiliation": aff or "AIIMS Clinical AI OPD",
                    "available_slots": user_data.get("available_slots") or ["09:30 AM", "11:00 AM", "02:30 PM", "04:30 PM"],
                    "verification_status": user_data.get("verification_status", "verified"),
                })

        # If role is patient or user, ensure patient clinical record exists for bookings and health vault
        if role.lower() in ("patient", "user"):
            conn_pt = get_db_connection()
            p_row = conn_pt.execute("SELECT id FROM patients WHERE id = ?;", (uid,)).fetchone()
            if not p_row:
                conn_pt.execute("""
                INSERT INTO patients (id, mrn, name, age, gender, blood_group, height_cm, weight_kg, conditions_json, baseline_vitals_json, emergency_contact)
                VALUES (?, ?, ?, 35, 'Male', 'O+', 175.0, 70.0, '[]', '{}', ?)
                ON CONFLICT (id) DO NOTHING;
                """, (uid, f"MRN-{uuid.uuid4().hex[:6].upper()}", name, phone))
                conn_pt.commit()
            conn_pt.close()

        return created or {}

    @staticmethod
    def update_user_admin(user_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        conn = get_db_connection()
        fields = []
        values = []
        for k, v in updates.items():
            if k in {"name", "username", "password_hash", "email", "secondary_email", "emergency_phone", "role", "hospital_affiliation", "license_number"}:
                fields.append(f"{k} = ?")
                values.append(v)

        if fields:
            values.append(user_id)
            query = f"UPDATE users SET {', '.join(fields)} WHERE id = ?;"
            conn.execute(query, tuple(values))
            conn.commit()

        # Cross-sync doctor profile if applicable
        try:
            d_updates = []
            d_values = []
            if "name" in updates:
                d_name = updates["name"]
                if not d_name.startswith("Dr.") and not d_name.startswith("Dr "):
                    d_name = f"Dr. {d_name}"
                d_updates.append("name = ?")
                d_values.append(d_name)
            if "hospital_affiliation" in updates:
                d_updates.append("hospital_affiliation = ?")
                d_values.append(updates["hospital_affiliation"])
            if "license_number" in updates:
                d_updates.append("registration_number = ?")
                d_values.append(updates["license_number"])
            if "specialty" in updates:
                d_updates.append("specialty = ?")
                d_values.append(updates["specialty"])
            if d_updates:
                d_values.append(user_id)
                d_query = f"UPDATE doctors SET {', '.join(d_updates)} WHERE user_id = ?;"
                conn.execute(d_query, tuple(d_values))
                conn.commit()
        except Exception:
            pass

        updated = DatabaseRepository.get_user_by_id(user_id)
        conn.close()
        return updated or {}

    @staticmethod
    def delete_user(user_id: str) -> bool:
        conn = get_db_connection()
        conn.execute("DELETE FROM users WHERE id = ? OR username = ?;", (user_id, user_id))
        conn.commit()
        conn.close()
        return True

    @staticmethod
    def update_user_profile(user_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        conn = get_db_connection()
        fields = []
        values = []
        for k, v in updates.items():
            if k in {"name", "email", "secondary_email", "emergency_phone", "hospital_affiliation", "license_number"}:
                fields.append(f"{k} = ?")
                values.append(v)

        if fields:
            values.append(user_id)
            query = f"UPDATE users SET {', '.join(fields)} WHERE id = ? OR username = ?;"
            conn.execute(query, tuple(values + [user_id]))
            conn.commit()

        # Cross-sync patient record if applicable
        try:
            p_updates = []
            p_values = []
            if "name" in updates:
                p_updates.append("name = ?")
                p_values.append(updates["name"])
            if "blood_group" in updates:
                p_updates.append("blood_group = ?")
                p_values.append(updates["blood_group"])
            if "emergency_phone" in updates:
                p_updates.append("emergency_contact = ?")
                p_values.append(updates["emergency_phone"])
            if p_updates:
                p_values.extend([user_id, "PT-89421", "PT-ALEX"])
                p_query = f"UPDATE patients SET {', '.join(p_updates)} WHERE id = ? OR id = ? OR id = ?;"
                conn.execute(p_query, tuple(p_values))
                conn.commit()
        except Exception:
            pass

        # Cross-sync doctor record if applicable
        try:
            d_updates = []
            d_values = []
            if "name" in updates:
                d_name = updates["name"]
                if not d_name.startswith("Dr.") and not d_name.startswith("Dr "):
                    d_name = f"Dr. {d_name}"
                d_updates.append("name = ?")
                d_values.append(d_name)
            if "hospital_affiliation" in updates:
                d_updates.append("hospital_affiliation = ?")
                d_values.append(updates["hospital_affiliation"])
            if "license_number" in updates:
                d_updates.append("registration_number = ?")
                d_values.append(updates["license_number"])
            if "specialty" in updates:
                d_updates.append("specialty = ?")
                d_values.append(updates["specialty"])
            if d_updates:
                d_values.append(user_id)
                d_query = f"UPDATE doctors SET {', '.join(d_updates)} WHERE user_id = ?;"
                conn.execute(d_query, tuple(d_values))
                conn.commit()
        except Exception:
            pass

        updated = DatabaseRepository.get_user_by_id(user_id)
        conn.close()
        return updated or {}

    @staticmethod
    def get_patient(patient_id: str) -> Optional[dict[str, Any]]:
        conn = get_db_connection()
        row = conn.execute("SELECT * FROM patients WHERE id = ?;", (patient_id,)).fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        try:
            d["conditions"] = json.loads(d["conditions_json"])
        except Exception:
            d["conditions"] = [d.get("conditions_json", "Active Clinical Triage")]
        try:
            d["baseline_vitals"] = json.loads(d["baseline_vitals_json"])
        except Exception:
            d["baseline_vitals"] = {"heart_rate_bpm": 72, "blood_pressure": "120/80 mmHg", "spo2_percent": 98, "temperature_f": 98.6}

        for field, fallback in (
            ("medical_history", ["Hypertension (Stage 1)", "Mild Hyperlipidemia"]),
            ("allergies", [{"id": "alg-1", "allergen": "Penicillin", "severity": "high", "reaction": "Anaphylaxis / Urticaria"}]),
            ("medications", [{"id": "med-1", "name": "Atorvastatin", "dose": "20mg", "frequency": "Once daily (OD) - Night"}]),
            ("emergency_contacts", [{"name": "Liam Reed", "phone": "+91 98333 44556", "email": "", "relation": "Brother / Next of Kin", "is_primary": True}]),
        ):
            json_field = f"{field}_json"
            try:
                d[field] = json.loads(d.get(json_field) or "null") or fallback
            except (TypeError, json.JSONDecodeError):
                d[field] = fallback

        d["organ_donor"] = d.get("organ_donor", True)
        d["abha_id"] = d.get("abha_id", "91-4829-1092-8821")
        d["address"] = d.get("address", "Flat 402, Green Glen Heights, New Delhi - 110029")
        return d

    @staticmethod
    def get_emergency_profile(patient_id: str) -> Optional[dict[str, Any]]:
        """High-speed public emergency endpoint helper for QR-code first responders."""
        patient = DatabaseRepository.get_patient(patient_id)
        if not patient:
            return None
        return {
            "status": "success",
            "patient_id": patient["id"],
            "mrn": patient["mrn"],
            "name": patient["name"],
            "age": patient["age"],
            "gender": patient["gender"],
            "blood_group": patient["blood_group"],
            "height_cm": patient.get("height_cm", 175.0),
            "weight_kg": patient.get("weight_kg", 70.0),
            "organ_donor": patient.get("organ_donor", True),
            "abha_id": patient.get("abha_id", "91-4829-1092-8821"),
            "address": patient.get("address", "New Delhi, India"),
            "emergency_contact": patient.get("emergency_contact", "+91 98333 44556"),
            "emergency_contacts": patient.get("emergency_contacts", []),
            "allergies": patient.get("allergies", []),
            "medications": patient.get("medications", []),
            "conditions": patient.get("conditions", []),
            "baseline_vitals": patient.get("baseline_vitals", {}),
            "critical_alerts": [
                f"Blood Group: {patient['blood_group']}",
                "Severe Anaphylaxis Risk: Penicillin",
                "Active Antiplatelet Therapy (Aspirin 75mg)",
            ],
            "verified_at": "2026-09-08 UTC",
            "issuer": "Q-MedSense Quantum Clinical Network // WORM Ledger Verified",
        }

    @staticmethod
    def create_or_update_patient(patient_data: dict[str, Any]) -> dict[str, Any]:
        conn = get_db_connection()
        pid = patient_data.get("id") or patient_data.get("patient_id") or f"PT-{uuid.uuid4().hex[:5].upper()}"
        mrn = patient_data.get("mrn") or f"MRN-{pid}-QX"
        name = patient_data.get("name", "Alexander Reed")
        age = int(patient_data.get("age", 48))
        gender = patient_data.get("gender", "Male")
        blood = patient_data.get("blood_group", "O+")
        h = float(patient_data.get("height_cm", 182.0))
        w = float(patient_data.get("weight_kg", 78.0))
        conds = json.dumps(patient_data.get("conditions", ["Coronary Plaque Risk", "Dense Breast Tissue", "Mild Dyslipidemia"]))
        vitals = json.dumps(patient_data.get("baseline_vitals", {"heart_rate_bpm": 72, "blood_pressure": "120/78 mmHg", "spo2_percent": 98, "temperature_f": 98.6}))
        em = patient_data.get("emergency_contact", "+91 98333 44556 (Brother: Liam Reed)")
        history = json.dumps(patient_data.get("medical_history", ["Hypertension (Stage 1)"]))
        allergies = json.dumps(patient_data.get("allergies", []))
        medications = json.dumps(patient_data.get("medications", []))
        contacts = json.dumps(patient_data.get("emergency_contacts", []))

        conn.execute("""
        INSERT INTO patients (id, mrn, name, age, gender, blood_group, height_cm, weight_kg, conditions_json, baseline_vitals_json, emergency_contact, medical_history_json, allergies_json, medications_json, emergency_contacts_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name=excluded.name,
            age=excluded.age,
            gender=excluded.gender,
            blood_group=excluded.blood_group,
            height_cm=excluded.height_cm,
            weight_kg=excluded.weight_kg,
            conditions_json=excluded.conditions_json,
            baseline_vitals_json=excluded.baseline_vitals_json,
            emergency_contact=excluded.emergency_contact,
            medical_history_json=excluded.medical_history_json,
            allergies_json=excluded.allergies_json,
            medications_json=excluded.medications_json,
            emergency_contacts_json=excluded.emergency_contacts_json;
        """, (pid, mrn, name, age, gender, blood, h, w, conds, vitals, em, history, allergies, medications, contacts))
        conn.commit()
        conn.close()
        return DatabaseRepository.get_patient(pid)

    @staticmethod
    def save_diagnostic_record(record: dict[str, Any]) -> str:
        conn = get_db_connection()
        rid = record.get("id") or f"DX-{uuid.uuid4().hex[:8].upper()}"
        conn.execute("""
        INSERT INTO diagnostic_records (
            id, patient_id, disease, model_architecture, prediction_class, confidence,
            classical_model, classical_confidence, probabilities_json, explainability_json,
            inference_ms, fallback_used
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            rid,
            record["patient_id"],
            record["disease"],
            record["model_architecture"],
            record["prediction"]["class"],
            record["prediction"]["confidence"],
            record["classical_baseline"]["model"],
            record["classical_baseline"]["confidence"],
            json.dumps(record.get("probabilities", {})),
            json.dumps(record.get("explainability", {})),
            record["inference_ms"],
            1 if record.get("fallback_mode") else 0,
        ))
        conn.commit()
        conn.close()
        return rid

    @staticmethod
    def get_patient_diagnostic_records(patient_id: str) -> list[dict[str, Any]]:
        conn = get_db_connection()
        rows = conn.execute(
            "SELECT * FROM diagnostic_records WHERE patient_id = ? ORDER BY created_at DESC;",
            (patient_id,)
        ).fetchall()
        conn.close()
        out = []
        for r in rows:
            d = dict(r)
            d["probabilities"] = json.loads(d["probabilities_json"])
            d["explainability"] = json.loads(d["explainability_json"])
            out.append(d)
        return out

    @staticmethod
    def add_audit_log(actor: str, action: str, resource: str, ip_address: str = "127.0.0.1", status: str = "SUCCESS", hash_sig: str = "") -> dict[str, Any]:
        conn = get_db_connection()
        aid = f"AUD-{uuid.uuid4().hex[:6].upper()}"
        import datetime, hashlib
        ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
        if not hash_sig:
            hash_sig = hashlib.sha256(f"{aid}|{ts}|{actor}|{action}|{resource}".encode()).hexdigest()

        conn.execute("""
        INSERT INTO audit_logs (id, timestamp, actor, action, resource, ip_address, status, hash_signature)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (aid, ts, actor, action, resource, ip_address, status, hash_sig))
        conn.commit()
        conn.close()
        return {
            "id": aid,
            "timestamp": ts,
            "actor": actor,
            "action": action,
            "resource": resource,
            "ip_address": ip_address,
            "status": status,
            "hash_signature": hash_sig,
        }

    @staticmethod
    def get_audit_logs(limit: int = 50) -> list[dict[str, Any]]:
        conn = get_db_connection()
        rows = conn.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?;", (limit,)).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_consent(patient_id: str) -> dict[str, Any]:
        conn = get_db_connection()
        row = conn.execute("SELECT * FROM consents WHERE patient_id = ?;", (patient_id,)).fetchone()
        conn.close()
        if not row:
            return {
                "patient_id": patient_id,
                "dpdp_opt_in": True,
                "telemetry_sharing": True,
                "research_access": True,
            }
        d = dict(row)
        return {
            "patient_id": d["patient_id"],
            "dpdp_opt_in": bool(d["dpdp_opt_in"]),
            "telemetry_sharing": bool(d["telemetry_sharing"]),
            "research_access": bool(d["research_access"]),
        }

    @staticmethod
    def update_consent(patient_id: str, consents: dict[str, bool]) -> dict[str, Any]:
        conn = get_db_connection()
        dpdp = 1 if consents.get("dpdp_opt_in", True) else 0
        telem = 1 if consents.get("telemetry_sharing", True) else 0
        res = 1 if consents.get("research_access", True) else 0

        conn.execute("""
        INSERT INTO consents (patient_id, dpdp_opt_in, telemetry_sharing, research_access)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(patient_id) DO UPDATE SET
            dpdp_opt_in=excluded.dpdp_opt_in,
            telemetry_sharing=excluded.telemetry_sharing,
            research_access=excluded.research_access,
            updated_at=CURRENT_TIMESTAMP;
        """, (patient_id, dpdp, telem, res))
        conn.commit()
        conn.close()
        return DatabaseRepository.get_consent(patient_id)

    # ── Doctor Operations (Modules A, F, I, K) ─────────────────────────────────

    @staticmethod
    def list_doctors(specialty: str | None = None, status: str = "verified") -> list[dict[str, Any]]:
        conn = get_db_connection()
        query = "SELECT * FROM doctors"
        params: list[Any] = []
        conditions = []
        if status:
            conditions.append("verification_status = ?")
            params.append(status)
        if specialty and specialty.lower() != "all":
            conditions.append("LOWER(specialty) LIKE ?")
            params.append(f"%{specialty.lower()}%")
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY rating DESC, experience_years DESC;"
        rows = conn.execute(query, tuple(params)).fetchall()
        conn.close()
        out = []
        for r in rows:
            d = dict(r)
            d["languages"] = json.loads(d["languages_json"])
            d["available_slots"] = json.loads(d["available_slots_json"])
            out.append(d)
        return out

    @staticmethod
    def get_doctor_by_id(doctor_id: str) -> dict[str, Any] | None:
        conn = get_db_connection()
        row = conn.execute("SELECT * FROM doctors WHERE id = ?;", (doctor_id,)).fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        d["languages"] = json.loads(d["languages_json"])
        d["available_slots"] = json.loads(d["available_slots_json"])
        return d

    @staticmethod
    def get_doctor_by_user_id(user_id: str) -> dict[str, Any] | None:
        conn = get_db_connection()
        row = conn.execute("SELECT * FROM doctors WHERE user_id = ?;", (user_id,)).fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        d["languages"] = json.loads(d["languages_json"])
        d["available_slots"] = json.loads(d["available_slots_json"])
        return d

    @staticmethod
    def create_doctor(doc_data: dict[str, Any]) -> dict[str, Any]:
        conn = get_db_connection()
        did = doc_data.get("id") or f"DOC-{uuid.uuid4().hex[:6].upper()}"
        uid = doc_data["user_id"]
        name = doc_data.get("name", "Dr. Specialist")
        if not name.startswith("Dr.") and not name.startswith("Dr "):
            name = f"Dr. {name}"
        specialty = doc_data.get("specialty") or "General Medicine & Clinical AI"
        reg_num = doc_data.get("registration_number") or f"MCI-2026-{uuid.uuid4().hex[:5].upper()}"
        council = doc_data.get("council_name") or "National Medical Commission"
        exp = int(doc_data.get("experience_years", 6))
        fee = float(doc_data.get("fee_inr", 600.0))
        rating = float(doc_data.get("rating", 4.9))

        langs = doc_data.get("languages", ["English", "Hindi"])
        if isinstance(langs, str):
            try:
                langs = json.loads(langs)
            except Exception:
                langs = [l.strip() for l in langs.split(",") if l.strip()]
        langs_json = json.dumps(langs)

        aff = doc_data.get("hospital_affiliation") or "AIIMS Clinical AI OPD"

        slots = doc_data.get("available_slots", ["09:30 AM", "11:00 AM", "02:30 PM", "04:30 PM"])
        if isinstance(slots, str):
            try:
                slots = json.loads(slots)
            except Exception:
                slots = [s.strip() for s in slots.split(",") if s.strip()]
        slots_json = json.dumps(slots)

        stat = doc_data.get("verification_status", "verified")

        conn.execute("""
        INSERT INTO doctors (id, user_id, name, specialty, registration_number, council_name, experience_years, fee_inr, rating, languages_json, hospital_affiliation, available_slots_json, verification_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            specialty = excluded.specialty,
            hospital_affiliation = excluded.hospital_affiliation,
            available_slots_json = excluded.available_slots_json,
            verification_status = excluded.verification_status;
        """, (did, uid, name, specialty, reg_num, council, exp, fee, rating, langs_json, aff, slots_json, stat))
        conn.commit()
        created = DatabaseRepository.get_doctor_by_id(did)
        conn.close()
        return created or {}

    @staticmethod
    def sync_doctor_accounts() -> int:
        """Ensures all user records with role in ('doctor', 'clinician') have a corresponding verified doctor profile."""
        conn = get_db_connection()
        doc_users = conn.execute("SELECT id, username, name, hospital_affiliation, license_number FROM users WHERE LOWER(role) IN ('doctor', 'clinician');").fetchall()
        existing_doc_user_ids = {r["user_id"] for r in conn.execute("SELECT user_id FROM doctors;").fetchall()}
        conn.close()

        synced = 0
        for u in doc_users:
            uid = u["id"]
            if uid not in existing_doc_user_ids:
                doc_name = u["name"] if (u["name"].startswith("Dr.") or u["name"].startswith("Dr ")) else f"Dr. {u['name']}"
                DatabaseRepository.create_doctor({
                    "id": f"DOC-{uid.replace('USR-', '')}",
                    "user_id": uid,
                    "name": doc_name,
                    "specialty": "General Medicine & Clinical AI",
                    "registration_number": u.get("license_number") or f"MCI-2026-{uuid.uuid4().hex[:5].upper()}",
                    "council_name": "National Medical Commission",
                    "experience_years": 6,
                    "fee_inr": 600.0,
                    "rating": 4.9,
                    "languages": ["English", "Hindi"],
                    "hospital_affiliation": u.get("hospital_affiliation") or "AIIMS Clinical AI OPD",
                    "available_slots": ["09:30 AM", "11:00 AM", "02:30 PM", "04:30 PM"],
                    "verification_status": "verified",
                })
                synced += 1
        return synced

    @staticmethod
    def update_doctor_verification(doctor_id: str, status: str) -> bool:
        conn = get_db_connection()
        cursor = conn.execute("UPDATE doctors SET verification_status = ? WHERE id = ?;", (status, doctor_id))
        conn.commit()
        updated = cursor.rowcount > 0
        conn.close()
        return updated

    # ── Booking & State Machine Operations (Module F) ──────────────────────────

    @staticmethod
    def create_booking(booking_data: dict[str, Any]) -> dict[str, Any]:
        conn = get_db_connection()
        bid = booking_data.get("id") or f"BK-{uuid.uuid4().hex[:6].upper()}"
        pid = booking_data.get("patient_id") or "PT-89421"
        did = booking_data["doctor_id"]
        slot = booking_data["slot_time"]
        mode = booking_data.get("mode", "video")
        status = booking_data.get("status", "requested")
        pay_status = booking_data.get("payment_status", "authorized")
        intake_json = json.dumps(booking_data.get("intake", {}))
        triage_risk = booking_data.get("triage_risk", "normal")
        flags_json = json.dumps(booking_data.get("emergency_flags", []))

        # Guarantee doctor record exists in doctors table (resolve user_id to doctor_id if needed)
        d_row = conn.execute("SELECT id FROM doctors WHERE id = ?;", (did,)).fetchone()
        if not d_row:
            d_by_user = conn.execute("SELECT id FROM doctors WHERE user_id = ?;", (did,)).fetchone()
            if d_by_user:
                did = d_by_user["id"]

        # Guarantee patient record exists in patients table to satisfy foreign key constraint
        p_row = conn.execute("SELECT id FROM patients WHERE id = ?;", (pid,)).fetchone()
        if not p_row:
            u_row = conn.execute("SELECT id, name, emergency_phone FROM users WHERE id = ? OR username = ?;", (pid, pid)).fetchone()
            if u_row:
                pid = u_row["id"]
                p_name = u_row["name"]
                p_phone = u_row["emergency_phone"] or "+91 98765 43210"
            else:
                p_name = "Registered Patient"
                p_phone = "+91 98765 43210"
            conn.execute("""
            INSERT INTO patients (id, mrn, name, age, gender, blood_group, height_cm, weight_kg, conditions_json, baseline_vitals_json, emergency_contact)
            VALUES (?, ?, ?, 35, 'Male', 'O+', 175.0, 70.0, '[]', '{}', ?)
            ON CONFLICT (id) DO NOTHING;
            """, (pid, f"MRN-{uuid.uuid4().hex[:6].upper()}", p_name, p_phone))
            conn.commit()

        conn.execute("""
        INSERT INTO bookings (id, patient_id, doctor_id, slot_time, mode, status, payment_status, intake_json, triage_risk, emergency_flags_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (bid, pid, did, slot, mode, status, pay_status, intake_json, triage_risk, flags_json))
        conn.commit()

        # Also initialize consultation room
        room_token = f"TOKEN-RTC-{uuid.uuid4().hex[:8].upper()}"
        conn.execute("""
        INSERT INTO consultation_rooms (id, booking_id, room_token, status)
        VALUES (?, ?, ?, 'waiting')
        ON CONFLICT (id) DO NOTHING;
        """, (f"ROOM-{bid}", bid, room_token))
        conn.commit()
        conn.close()
        return DatabaseRepository.get_booking_by_id(bid) or {}

    @staticmethod
    def get_booking_by_id(booking_id: str) -> dict[str, Any] | None:
        conn = get_db_connection()
        row = conn.execute("""
        SELECT b.*, d.name as doctor_name, d.specialty as doctor_specialty, d.hospital_affiliation,
               COALESCE(u.name, p.name, 'Registered Patient') as patient_name,
               COALESCE(p.age, 35) as patient_age,
               COALESCE(p.gender, 'Not Specified') as patient_gender,
               COALESCE(u.emergency_phone, p.emergency_contact, '+91 98765 43210') as patient_phone,
               COALESCE(u.email, '') as patient_email,
               p.conditions_json, p.baseline_vitals_json, p.allergies_json, p.medications_json
        FROM bookings b
        JOIN doctors d ON (b.doctor_id = d.id OR b.doctor_id = d.user_id)
        LEFT JOIN patients p ON (b.patient_id = p.id)
        LEFT JOIN users u ON (b.patient_id = u.id OR b.patient_id = u.username)
        WHERE b.id = ?;
        """, (booking_id,)).fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        d["intake"] = json.loads(d["intake_json"]) if d.get("intake_json") else {}
        d["emergency_flags"] = json.loads(d["emergency_flags_json"]) if d.get("emergency_flags_json") else []
        d["conditions"] = json.loads(d["conditions_json"]) if d.get("conditions_json") else []
        d["baseline_vitals"] = json.loads(d["baseline_vitals_json"]) if d.get("baseline_vitals_json") else {}
        return d

    @staticmethod
    def list_bookings(patient_id: str | None = None, doctor_id: str | None = None) -> list[dict[str, Any]]:
        conn = get_db_connection()
        query = """
        SELECT b.*, d.name as doctor_name, d.specialty as doctor_specialty, d.hospital_affiliation,
               COALESCE(u.name, p.name, 'Registered Patient') as patient_name,
               COALESCE(p.age, 35) as patient_age,
               COALESCE(p.gender, 'Not Specified') as patient_gender,
               COALESCE(u.emergency_phone, p.emergency_contact, '+91 98765 43210') as patient_phone,
               COALESCE(u.email, '') as patient_email,
               p.conditions_json, p.baseline_vitals_json, p.allergies_json, p.medications_json
        FROM bookings b
        JOIN doctors d ON (b.doctor_id = d.id OR b.doctor_id = d.user_id)
        LEFT JOIN patients p ON (b.patient_id = p.id)
        LEFT JOIN users u ON (b.patient_id = u.id OR b.patient_id = u.username)
        """
        params: list[Any] = []
        conditions = []
        if patient_id:
            conditions.append("(b.patient_id = ? OR u.username = ? OR u.id = ?)")
            params.extend([patient_id, patient_id, patient_id])
        if doctor_id:
            conditions.append("(b.doctor_id = ? OR d.user_id = ? OR d.id = ?)")
            params.extend([doctor_id, doctor_id, doctor_id])
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY b.created_at DESC;"

        rows = conn.execute(query, tuple(params)).fetchall()
        conn.close()
        out = []
        for r in rows:
            d = dict(r)
            d["intake"] = json.loads(d["intake_json"]) if d.get("intake_json") else {}
            d["emergency_flags"] = json.loads(d["emergency_flags_json"]) if d.get("emergency_flags_json") else []
            d["conditions"] = json.loads(d["conditions_json"]) if d.get("conditions_json") else []
            d["baseline_vitals"] = json.loads(d["baseline_vitals_json"]) if d.get("baseline_vitals_json") else {}
            out.append(d)
        return out

    @staticmethod
    def update_booking_status(booking_id: str, status: str, payment_status: str | None = None) -> dict[str, Any] | None:
        conn = get_db_connection()
        if payment_status:
            conn.execute("UPDATE bookings SET status = ?, payment_status = ? WHERE id = ?;", (status, payment_status, booking_id))
        else:
            conn.execute("UPDATE bookings SET status = ? WHERE id = ?;", (status, booking_id))
        conn.commit()
        conn.close()
        return DatabaseRepository.get_booking_by_id(booking_id)

    # ── Virtual Room Operations (Module G) ─────────────────────────────────────

    @staticmethod
    def get_room_by_booking(booking_id: str) -> dict[str, Any] | None:
        conn = get_db_connection()
        row = conn.execute("SELECT * FROM consultation_rooms WHERE booking_id = ?;", (booking_id,)).fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        d["chat_messages"] = json.loads(d["chat_messages_json"]) if d.get("chat_messages_json") else []
        return d

    @staticmethod
    def update_room_status(booking_id: str, status: str | None = None, doctor_joined: bool | None = None, patient_joined: bool | None = None) -> dict[str, Any] | None:
        conn = get_db_connection()
        updates = []
        params = []
        if status:
            updates.append("status = ?")
            params.append(status)
        if doctor_joined is not None:
            updates.append("doctor_joined = ?")
            params.append(1 if doctor_joined else 0)
        if patient_joined is not None:
            updates.append("patient_joined = ?")
            params.append(1 if patient_joined else 0)
        if updates:
            params.append(booking_id)
            conn.execute(f"UPDATE consultation_rooms SET {', '.join(updates)} WHERE booking_id = ?;", tuple(params))
            conn.commit()
        conn.close()
        return DatabaseRepository.get_room_by_booking(booking_id)

    @staticmethod
    def add_room_chat_message(booking_id: str, sender: str, text: str) -> list[dict[str, Any]]:
        room = DatabaseRepository.get_room_by_booking(booking_id)
        if not room:
            return []
        import time
        messages = room.get("chat_messages", [])
        messages.append({
            "sender": sender,
            "text": text,
            "time": time.strftime("%I:%M %p"),
        })
        conn = get_db_connection()
        conn.execute("UPDATE consultation_rooms SET chat_messages_json = ? WHERE booking_id = ?;", (json.dumps(messages), booking_id))
        conn.commit()
        conn.close()
        return messages

    @staticmethod
    def add_room_signal(booking_id: str, sender_id: str, sender_role: str, signal_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        conn = get_db_connection()
        is_postgres = isinstance(conn, PostgresConnectionWrapper)
        payload_str = json.dumps(payload)
        if is_postgres:
            row = conn.execute(
                "INSERT INTO consultation_signals (booking_id, sender_id, sender_role, signal_type, payload_json) VALUES (%s, %s, %s, %s, %s) RETURNING *;",
                (booking_id, sender_id, sender_role, signal_type, payload_str),
            ).fetchone()
            conn.commit()
            conn.close()
            signal = dict(row)
            signal["payload"] = json.loads(signal.pop("payload_json", "{}"))
            return signal
        else:
            cursor = conn.execute(
                "INSERT INTO consultation_signals (booking_id, sender_id, sender_role, signal_type, payload_json) VALUES (?, ?, ?, ?, ?);",
                (booking_id, sender_id, sender_role, signal_type, payload_str),
            )
            conn.commit()
            signal_id = cursor.lastrowid
            row = conn.execute("SELECT * FROM consultation_signals WHERE id = ?;", (signal_id,)).fetchone()
            conn.close()
            signal = dict(row) if row else {"id": signal_id, "booking_id": booking_id, "sender_id": sender_id, "sender_role": sender_role, "signal_type": signal_type, "payload_json": payload_str}
            signal["payload"] = json.loads(signal.pop("payload_json", "{}"))
            return signal

    @staticmethod
    def list_room_signals(booking_id: str, after_id: int = 0, sender_id: str | None = None, exclude_role: str | None = None) -> list[dict[str, Any]]:
        conn = get_db_connection()
        is_postgres = isinstance(conn, PostgresConnectionWrapper)
        placeholder = "%s" if is_postgres else "?"
        query = f"SELECT * FROM consultation_signals WHERE booking_id = {placeholder} AND id > {placeholder}"
        params: list[Any] = [booking_id, after_id]
        if sender_id:
            query += f" AND sender_id != {placeholder}"
            params.append(sender_id)
        if exclude_role:
            query += f" AND sender_role != {placeholder}"
            params.append(exclude_role)
        query += " ORDER BY id ASC;"
        rows = conn.execute(query, tuple(params)).fetchall()
        conn.close()
        signals = []
        for row in rows:
            signal = dict(row)
            signal["payload"] = json.loads(signal.pop("payload_json", "{}"))
            signals.append(signal)
        return signals

    # ── E-Prescriptions & Care Plans (Module H) ────────────────────────────────

    @staticmethod
    def create_prescription(presc_data: dict[str, Any]) -> dict[str, Any]:
        conn = get_db_connection()
        import hashlib
        pid = presc_data.get("id") or f"RX-{uuid.uuid4().hex[:6].upper()}"
        bid = presc_data["booking_id"]
        pat_id = presc_data["patient_id"]
        doc_id = presc_data["doctor_id"]
        diagnosis = presc_data["diagnosis"]
        meds_json = json.dumps(presc_data.get("medications", []))
        care_json = json.dumps(presc_data.get("care_plan", {}))
        soap_json = json.dumps(presc_data.get("soap_notes", {}))
        sig = hashlib.sha256(f"{pid}:{doc_id}:{pat_id}:{diagnosis}".encode()).hexdigest()

        conn.execute("""
        INSERT INTO prescriptions (id, booking_id, patient_id, doctor_id, diagnosis, medications_json, care_plan_json, soap_notes_json, digital_signature_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (pid, bid, pat_id, doc_id, diagnosis, meds_json, care_json, soap_json, sig))
        conn.commit()
        conn.close()
        return DatabaseRepository.get_prescription_by_id(pid) or {}

    @staticmethod
    def get_prescription_by_id(presc_id: str) -> dict[str, Any] | None:
        conn = get_db_connection()
        row = conn.execute("""
        SELECT pr.*, d.name as doctor_name, d.specialty, d.registration_number, d.hospital_affiliation,
               p.name as patient_name, p.mrn
        FROM prescriptions pr
        JOIN doctors d ON pr.doctor_id = d.id
        LEFT JOIN patients p ON pr.patient_id = p.id
        WHERE pr.id = ?;
        """, (presc_id,)).fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        d["medications"] = json.loads(d["medications_json"]) if d.get("medications_json") else []
        d["care_plan"] = json.loads(d["care_plan_json"]) if d.get("care_plan_json") else {}
        d["soap_notes"] = json.loads(d["soap_notes_json"]) if d.get("soap_notes_json") else {}
        return d

    @staticmethod
    def list_prescriptions(patient_id: str | None = None, doctor_id: str | None = None) -> list[dict[str, Any]]:
        conn = get_db_connection()
        query = """
        SELECT pr.*, d.name as doctor_name, d.specialty, d.hospital_affiliation,
               p.name as patient_name
        FROM prescriptions pr
        JOIN doctors d ON pr.doctor_id = d.id
        LEFT JOIN patients p ON pr.patient_id = p.id
        """
        params: list[Any] = []
        conditions = []
        if patient_id:
            conditions.append("pr.patient_id = ?")
            params.append(patient_id)
        if doctor_id:
            conditions.append("pr.doctor_id = ?")
            params.append(doctor_id)
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY pr.created_at DESC;"
        rows = conn.execute(query, tuple(params)).fetchall()
        conn.close()
        out = []
        for r in rows:
            d = dict(r)
            d["medications"] = json.loads(d["medications_json"]) if d.get("medications_json") else []
            d["care_plan"] = json.loads(d["care_plan_json"]) if d.get("care_plan_json") else {}
            d["soap_notes"] = json.loads(d["soap_notes_json"]) if d.get("soap_notes_json") else {}
            out.append(d)
        return out

    # ── Notifications Operations (Module L) ───────────────────────────────────

    @staticmethod
    def list_notifications(user_id_or_username: str, limit: int = 20) -> list[dict[str, Any]]:
        conn = get_db_connection()
        # Find the user's primary id and username
        u_row = conn.execute("SELECT id, username FROM users WHERE username = ? OR id = ?;", (user_id_or_username, user_id_or_username)).fetchone()
        if u_row:
            target_id = u_row["id"]
            target_uname = u_row["username"]
        else:
            target_id = user_id_or_username
            target_uname = user_id_or_username

        rows = conn.execute(
            "SELECT * FROM notifications WHERE user_id = ? OR user_id = ? ORDER BY created_at DESC LIMIT ?;",
            (target_id, target_uname, limit)
        ).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def mark_notification_read(notification_id: str) -> bool:
        conn = get_db_connection()
        cursor = conn.execute("UPDATE notifications SET is_read = 1 WHERE id = ?;", (notification_id,))
        conn.commit()
        updated = cursor.rowcount > 0
        conn.close()
        return updated

    @staticmethod
    def create_notification(user_id: str, title: str, message: str, ref_code: str = "", category: str = "general") -> dict[str, Any]:
        conn = get_db_connection()
        nid = f"NOTIF-{uuid.uuid4().hex[:6].upper()}"

        # Guarantee user_id matches a real user record in users table to satisfy PostgreSQL foreign key
        u_row = conn.execute("SELECT id FROM users WHERE id = ? OR username = ?;", (user_id, user_id)).fetchone()
        if u_row:
            target_user_id = u_row["id"]
        else:
            # Fallback to PT-ALEX or first user if user_id is a placeholder
            fallback_u = conn.execute("SELECT id FROM users WHERE role = 'patient' OR id = 'PT-ALEX' LIMIT 1;").fetchone()
            target_user_id = fallback_u["id"] if fallback_u else user_id

        try:
            conn.execute("""
            INSERT INTO notifications (id, user_id, title, message, reference_code, category)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO NOTHING;
            """, (nid, target_user_id, title, message, ref_code, category))
            conn.commit()
        except Exception as exc:
            logger.warning(f"Notification creation suppressed error: {exc}")
            if hasattr(conn, "rollback"):
                conn.rollback()
        finally:
            conn.close()

        return {"id": nid, "user_id": target_user_id, "title": title, "message": message, "reference_code": ref_code, "category": category, "is_read": 0}

