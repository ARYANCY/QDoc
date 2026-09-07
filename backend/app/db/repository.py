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
        row = conn.execute("SELECT * FROM users WHERE username = ?;", (username,)).fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        d["user_id"] = d["id"]
        return d

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[dict[str, Any]]:
        conn = get_db_connection()
        row = conn.execute("SELECT * FROM users WHERE id = ?;", (user_id,)).fetchone()
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
        username = user_data["username"]
        pwd = user_data.get("password_hash") or user_data.get("password", "tempPass2026")
        name = user_data.get("name", username.replace(".", " ").title())
        email = user_data.get("email", f"{username}@qmedsense.health")
        sec_email = user_data.get("secondary_email", "")
        phone = user_data.get("emergency_phone", "+91 98765 43210")
        role = user_data.get("role", "patient")
        aff = user_data.get("hospital_affiliation", "Q-MedSense Network")
        lic = user_data.get("license_number", f"LIC-{uuid.uuid4().hex[:4].upper()}")

        conn.execute("""
        INSERT INTO users (id, username, password_hash, name, email, secondary_email, emergency_phone, role, hospital_affiliation, license_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (uid, username, pwd, name, email, sec_email, phone, role, aff, lic))
        conn.commit()
        created = DatabaseRepository.get_user_by_id(uid)
        conn.close()
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
            query = f"UPDATE users SET {', '.join(fields)} WHERE id = ?;"
            conn.execute(query, tuple(values))
            conn.commit()

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
        d["conditions"] = json.loads(d["conditions_json"])
        d["baseline_vitals"] = json.loads(d["baseline_vitals_json"])
        return d

    @staticmethod
    def create_or_update_patient(patient_data: dict[str, Any]) -> dict[str, Any]:
        conn = get_db_connection()
        pid = patient_data.get("id") or f"PT-{uuid.uuid4().hex[:5].upper()}"
        mrn = patient_data.get("mrn") or f"MRN-{pid}-QX"
        name = patient_data.get("name", "Unknown Patient")
        age = patient_data.get("age", 45)
        gender = patient_data.get("gender", "Unspecified")
        blood = patient_data.get("blood_group", "O+")
        h = patient_data.get("height_cm", 175.0)
        w = patient_data.get("weight_kg", 70.0)
        conds = json.dumps(patient_data.get("conditions", ["Active Clinical Triage"]))
        vitals = json.dumps(patient_data.get("baseline_vitals", {"heart_rate_bpm": 70, "blood_pressure": "120/80 mmHg", "spo2_percent": 99, "temperature_f": 98.4}))
        em = patient_data.get("emergency_contact", "Emergency OPD")

        conn.execute("""
        INSERT INTO patients (id, mrn, name, age, gender, blood_group, height_cm, weight_kg, conditions_json, baseline_vitals_json, emergency_contact)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name=excluded.name,
            age=excluded.age,
            gender=excluded.gender,
            blood_group=excluded.blood_group,
            height_cm=excluded.height_cm,
            weight_kg=excluded.weight_kg,
            conditions_json=excluded.conditions_json,
            baseline_vitals_json=excluded.baseline_vitals_json,
            emergency_contact=excluded.emergency_contact;
        """, (pid, mrn, name, age, gender, blood, h, w, conds, vitals, em))
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
        pid = booking_data["patient_id"]
        did = booking_data["doctor_id"]
        slot = booking_data["slot_time"]
        mode = booking_data.get("mode", "video")
        status = booking_data.get("status", "requested")
        pay_status = booking_data.get("payment_status", "authorized")
        intake_json = json.dumps(booking_data.get("intake", {}))
        triage_risk = booking_data.get("triage_risk", "normal")
        flags_json = json.dumps(booking_data.get("emergency_flags", []))

        conn.execute("""
        INSERT INTO bookings (id, patient_id, doctor_id, slot_time, mode, status, payment_status, intake_json, triage_risk, emergency_flags_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (bid, pid, did, slot, mode, status, pay_status, intake_json, triage_risk, flags_json))
        conn.commit()

        # Also initialize consultation room
        room_token = f"TOKEN-RTC-{uuid.uuid4().hex[:8].upper()}"
        conn.execute("""
        INSERT OR IGNORE INTO consultation_rooms (id, booking_id, room_token, status)
        VALUES (?, ?, ?, 'waiting');
        """, (f"ROOM-{bid}", bid, room_token))
        conn.commit()
        conn.close()
        return DatabaseRepository.get_booking_by_id(bid) or {}

    @staticmethod
    def get_booking_by_id(booking_id: str) -> dict[str, Any] | None:
        conn = get_db_connection()
        row = conn.execute("""
        SELECT b.*, d.name as doctor_name, d.specialty as doctor_specialty, d.hospital_affiliation,
               p.name as patient_name
        FROM bookings b
        JOIN doctors d ON b.doctor_id = d.id
        LEFT JOIN patients p ON b.patient_id = p.id
        WHERE b.id = ?;
        """, (booking_id,)).fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        d["intake"] = json.loads(d["intake_json"]) if d.get("intake_json") else {}
        d["emergency_flags"] = json.loads(d["emergency_flags_json"]) if d.get("emergency_flags_json") else []
        return d

    @staticmethod
    def list_bookings(patient_id: str | None = None, doctor_id: str | None = None) -> list[dict[str, Any]]:
        conn = get_db_connection()
        query = """
        SELECT b.*, d.name as doctor_name, d.specialty as doctor_specialty, d.hospital_affiliation,
               p.name as patient_name, p.age as patient_age, p.gender as patient_gender
        FROM bookings b
        JOIN doctors d ON b.doctor_id = d.id
        LEFT JOIN patients p ON b.patient_id = p.id
        """
        params: list[Any] = []
        conditions = []
        if patient_id:
            conditions.append("b.patient_id = ?")
            params.append(patient_id)
        if doctor_id:
            conditions.append("b.doctor_id = ?")
            params.append(doctor_id)
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY b.created_at DESC;"

        rows = conn.execute(query, tuple(params)).fetchall()
        conn.close()
        out = []
        for r in rows:
            d = dict(r)
            d["intake"] = json.loads(d["intake_json"]) if d.get("intake_json") else {}
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
    def list_notifications(user_id: str, limit: int = 20) -> list[dict[str, Any]]:
        conn = get_db_connection()
        rows = conn.execute(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?;",
            (user_id, limit)
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
        conn.execute("""
        INSERT INTO notifications (id, user_id, title, message, reference_code, category)
        VALUES (?, ?, ?, ?, ?, ?);
        """, (nid, user_id, title, message, ref_code, category))
        conn.commit()
        conn.close()
        return {"id": nid, "user_id": user_id, "title": title, "message": message, "reference_code": ref_code, "category": category, "is_read": 0}

