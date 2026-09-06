from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent.parent.parent / "qmedsense.db"


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """Initializes SQLite schema and populates initial verified seed records."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        secondary_email TEXT,
        emergency_phone TEXT,
        role TEXT NOT NULL,
        hospital_affiliation TEXT,
        license_number TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Patients Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        mrn TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        blood_group TEXT NOT NULL,
        height_cm REAL DEFAULT 175.0,
        weight_kg REAL DEFAULT 70.0,
        conditions_json TEXT NOT NULL,
        baseline_vitals_json TEXT NOT NULL,
        emergency_contact TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Diagnostic Records Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS diagnostic_records (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        disease TEXT NOT NULL,
        model_architecture TEXT NOT NULL,
        prediction_class TEXT NOT NULL,
        confidence REAL NOT NULL,
        classical_model TEXT NOT NULL,
        classical_confidence REAL NOT NULL,
        probabilities_json TEXT NOT NULL,
        explainability_json TEXT NOT NULL,
        inference_ms REAL NOT NULL,
        fallback_used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
    );
    """)

    # Audit Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        status TEXT NOT NULL,
        hash_signature TEXT NOT NULL
    );
    """)

    # Consents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS consents (
        patient_id TEXT PRIMARY KEY,
        dpdp_opt_in INTEGER DEFAULT 1,
        telemetry_sharing INTEGER DEFAULT 1,
        research_access INTEGER DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
    );
    """)

    # Early Detection Assessments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS early_detection_assessments (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        protocol TEXT NOT NULL,
        risk_tier TEXT NOT NULL,
        trajectory_stage INTEGER NOT NULL,
        biomarkers_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
    );
    """)

    # Clean up any legacy clinician/doctor or researcher seed users and audit entries
    cursor.execute("DELETE FROM users WHERE username = 'dr.aryan' OR role = 'clinician' OR id = 'DR-ARYAN' OR username = 'priya.qml' OR role = 'researcher' OR id = 'RES-PRIYA';")
    cursor.execute("DELETE FROM audit_logs WHERE actor LIKE '%Aryan%' OR actor LIKE '%dr.%' OR actor LIKE '%Dr.%' OR actor LIKE '%priya%' OR actor LIKE '%Diagnostician%' OR actor LIKE '%Clinician%' OR actor LIKE '%Researcher%';")

    # Seed Default Users (Two-Tier: Patient and Admin)
    seed_users = [
        ("PT-ALEX", "alex.patient", "patient123", "Alexander Reed", "alexander.reed@email.com", "alex.emergency@gmail.com", "+91 98333 44556", "patient", "AIIMS Cardiology & Oncology OPD", "PT-REC-89421"),
        ("ADM-SYSTEM", "admin.audit", "admin123", "Audit & Security Admin", "compliance.lead@egreenquanta.health", "admin.sec@gmail.com", "+91 98222 33445", "admin", "Q-MedSense Governance Board", "SEC-DPDP-001"),
    ]

    for uid, uname, pwd, name, email, sec_email, em_phone, role, aff, lic in seed_users:
        cursor.execute("""
        INSERT OR IGNORE INTO users (id, username, password_hash, name, email, secondary_email, emergency_phone, role, hospital_affiliation, license_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (uid, uname, pwd, name, email, sec_email, em_phone, role, aff, lic))

    # Seed Default Patient PT-89421
    cursor.execute("""
    INSERT OR IGNORE INTO patients (id, mrn, name, age, gender, blood_group, height_cm, weight_kg, conditions_json, baseline_vitals_json, emergency_contact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        "PT-89421",
        "MRN-89421-QX",
        "Alexander Reed",
        48,
        "Male",
        "O+",
        182.0,
        78.0,
        json.dumps(["Coronary Plaque Risk", "Dense Breast Tissue", "Mild Dyslipidemia"]),
        json.dumps({
            "heart_rate_bpm": 72,
            "blood_pressure": "120/78 mmHg",
            "spo2_percent": 98,
            "temperature_f": 98.6,
        }),
        "+91 98333 44556 (Brother: Liam Reed)"
    ))

    # Seed Default Consent for PT-89421
    cursor.execute("""
    INSERT OR IGNORE INTO consents (patient_id, dpdp_opt_in, telemetry_sharing, research_access)
    VALUES (?, 1, 1, 1);
    """, ("PT-89421",))

    # Seed Initial Audit Logs
    cursor.execute("SELECT COUNT(*) FROM audit_logs;")
    if cursor.fetchone()[0] == 0:
        seed_logs = [
            ("AUD-1001", "2026-09-06T12:00:00Z", "Alexander Reed (Patient)", "PATIENT_RECORD_VIEW", "PT-89421", "192.168.1.104", "SUCCESS", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"),
            ("AUD-1002", "2026-09-06T12:05:00Z", "Alexander Reed (Patient)", "QUANTUM_INFERENCE_EXEC", "VQC_BREAST_CANCER", "192.168.1.104", "SUCCESS", "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb"),
            ("AUD-1003", "2026-09-06T12:10:00Z", "Audit & Security Admin", "DPDP_CONSENT_VERIFY", "PT-89421", "192.168.1.1", "SUCCESS", "3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d"),
        ]
        for aid, ts, actor, action, res, ip, status, hsig in seed_logs:
            cursor.execute("""
            INSERT INTO audit_logs (id, timestamp, actor, action, resource, ip_address, status, hash_signature)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """, (aid, ts, actor, action, res, ip, status, hsig))

    conn.commit()
    conn.close()


# Auto-initialize database on import
init_database()
