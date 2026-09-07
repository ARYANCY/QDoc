from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from backend.app.core.config import settings
from backend.app.core.security import hash_password


DB_PATH = settings.DB_PATH


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

    # Skin Cancer Prediction History Table (H1: replaces in-memory _HISTORY list)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS skin_cancer_predictions (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        model TEXT NOT NULL,
        prediction_class TEXT NOT NULL,
        confidence REAL NOT NULL,
        probabilities_json TEXT NOT NULL,
        quantum_info_json TEXT,
        inference_ms REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Doctors Table (Module A, F, I)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS doctors (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        registration_number TEXT NOT NULL,
        council_name TEXT NOT NULL,
        experience_years INTEGER NOT NULL,
        fee_inr REAL NOT NULL,
        rating REAL DEFAULT 4.8,
        languages_json TEXT NOT NULL,
        hospital_affiliation TEXT NOT NULL,
        available_slots_json TEXT NOT NULL,
        verification_status TEXT DEFAULT 'verified',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );
    """)

    # Consultation Bookings Table with State Machine (Module F)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        slot_time TEXT NOT NULL,
        mode TEXT NOT NULL DEFAULT 'video',
        status TEXT NOT NULL DEFAULT 'requested',
        payment_status TEXT NOT NULL DEFAULT 'authorized',
        intake_json TEXT,
        triage_risk TEXT DEFAULT 'normal',
        emergency_flags_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id),
        FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    );
    """)

    # Virtual Consultation Rooms (Module G)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS consultation_rooms (
        id TEXT PRIMARY KEY,
        booking_id TEXT UNIQUE NOT NULL,
        room_token TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'waiting',
        doctor_joined INTEGER DEFAULT 0,
        patient_joined INTEGER DEFAULT 0,
        chat_messages_json TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings (id)
    );
    """)

    # E-Prescriptions & Care Plans (Module H)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS prescriptions (
        id TEXT PRIMARY KEY,
        booking_id TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        diagnosis TEXT NOT NULL,
        medications_json TEXT NOT NULL,
        care_plan_json TEXT NOT NULL,
        soap_notes_json TEXT NOT NULL,
        digital_signature_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings (id),
        FOREIGN KEY (patient_id) REFERENCES patients (id),
        FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    );
    """)

    # In-App Notifications (Module L)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        reference_code TEXT,
        category TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # M7: Guard legacy cleanup — only run if the old seed IDs actually exist in the DB.
    cursor.execute("SELECT COUNT(*) FROM users WHERE username IN ('dr.aryan', 'priya.qml') OR role IN ('clinician', 'researcher') OR id IN ('DR-ARYAN', 'RES-PRIYA');")
    if cursor.fetchone()[0] > 0:
        cursor.execute("DELETE FROM users WHERE username = 'dr.aryan' OR role = 'clinician' OR id = 'DR-ARYAN' OR username = 'priya.qml' OR role = 'researcher' OR id = 'RES-PRIYA';")
        cursor.execute("DELETE FROM audit_logs WHERE actor LIKE '%Aryan%' OR actor LIKE '%dr.%' OR actor LIKE '%Dr.%' OR actor LIKE '%priya%' OR actor LIKE '%Diagnostician%' OR actor LIKE '%Clinician%' OR actor LIKE '%Researcher%';")


    # C3: Seed Default Users with properly PBKDF2-hashed passwords
    seed_users = [
        ("PT-ALEX", "alex.patient", hash_password("patient123"), "Alexander Reed", "alexander.reed@email.com", "alex.emergency@gmail.com", "+91 98333 44556", "patient", "AIIMS Cardiology & Oncology OPD", "PT-REC-89421"),
        ("ADM-SYSTEM", "admin.audit", hash_password("admin123"), "Audit & Security Admin", "compliance.lead@egreenquanta.health", "admin.sec@gmail.com", "+91 98222 33445", "admin", "Q-MedSense Governance Board", "SEC-DPDP-001"),
        ("DOC-USR-KAVITA", "dr.kavita", hash_password("doctor123"), "Dr. Kavita Rao, MD", "kavita.rao@aiims.edu", "dr.kavita@gmail.com", "+91 98111 22334", "doctor", "AIIMS Cardiology OPD", "MCI-2014-89312"),
        ("DOC-USR-RAJESH", "dr.rajesh", hash_password("doctor123"), "Dr. Rajesh Mehta, MD, DM", "rajesh.mehta@tmh.org", "dr.rajesh@gmail.com", "+91 98222 55667", "doctor", "Tata Memorial Hospital", "MCI-2009-44120"),
        ("DOC-USR-ANANYA", "dr.ananya", hash_password("doctor123"), "Dr. Ananya Sen, MD", "ananya.sen@manipal.health", "dr.ananya@gmail.com", "+91 98333 77889", "doctor", "Manipal Hospital Pulmonology", "MCI-2018-77412"),
        ("DOC-USR-VIKRAM", "dr.vikram", hash_password("doctor123"), "Dr. Vikram Malhotra, MBBS", "vikram.malhotra@gmail.com", "", "+91 98444 88990", "doctor", "Apollo Clinics", "MCI-2023-11045"),
    ]

    for uid, uname, pwd_hash, name, email, sec_email, em_phone, role, aff, lic in seed_users:
        cursor.execute("""
        INSERT INTO users (id, username, password_hash, name, email, secondary_email, emergency_phone, role, hospital_affiliation, license_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash
        WHERE users.password_hash NOT LIKE 'pbkdf2$%';
        """, (uid, uname, pwd_hash, name, email, sec_email, em_phone, role, aff, lic))

    # Seed Verified Doctors Directory
    seed_doctors = [
        (
            "DOC-KAVITA",
            "DOC-USR-KAVITA",
            "Dr. Kavita Rao, MD",
            "Cardiology & Preventive Medicine",
            "MCI-2014-89312",
            "Delhi Medical Council",
            14,
            800.0,
            4.9,
            json.dumps(["English", "Hindi"]),
            "AIIMS Cardiology OPD",
            json.dumps(["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"]),
            "verified",
        ),
        (
            "DOC-RAJESH",
            "DOC-USR-RAJESH",
            "Dr. Rajesh Mehta, MD, DM",
            "Medical Oncology",
            "MCI-2009-44120",
            "Maharashtra Medical Council",
            16,
            1000.0,
            4.8,
            json.dumps(["English", "Hindi", "Marathi"]),
            "Tata Memorial Hospital",
            json.dumps(["09:30 AM", "11:00 AM", "03:00 PM"]),
            "verified",
        ),
        (
            "DOC-ANANYA",
            "DOC-USR-ANANYA",
            "Dr. Ananya Sen, MD",
            "Pulmonary & Respiratory Medicine",
            "MCI-2018-77412",
            "Karnataka Medical Council",
            9,
            700.0,
            4.9,
            json.dumps(["English", "Hindi", "Bengali"]),
            "Manipal Hospital Pulmonology",
            json.dumps(["10:30 AM", "01:00 PM", "05:00 PM"]),
            "verified",
        ),
        (
            "DOC-VIKRAM",
            "DOC-USR-VIKRAM",
            "Dr. Vikram Malhotra, MBBS",
            "Dermatology & Skin Lesions",
            "MCI-2023-11045",
            "Delhi Medical Council",
            3,
            500.0,
            4.5,
            json.dumps(["English", "Hindi"]),
            "Apollo Clinics",
            json.dumps(["11:00 AM", "02:30 PM"]),
            "pending",
        ),
    ]

    for did, duid, dname, dspec, dreg, dcoun, dexp, dfee, drat, dlang, daff, dslots, dstat in seed_doctors:
        cursor.execute("""
        INSERT OR IGNORE INTO doctors (id, user_id, name, specialty, registration_number, council_name, experience_years, fee_inr, rating, languages_json, hospital_affiliation, available_slots_json, verification_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (did, duid, dname, dspec, dreg, dcoun, dexp, dfee, drat, dlang, daff, dslots, dstat))

    # Seed Initial Booking BK-2026-8801 (Patient Alexander with Dr. Kavita)
    cursor.execute("""
    INSERT OR IGNORE INTO bookings (id, patient_id, doctor_id, slot_time, mode, status, payment_status, intake_json, triage_risk)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        "BK-2026-8801",
        "PT-89421",
        "DOC-KAVITA",
        "Today at 02:00 PM",
        "video",
        "confirmed",
        "authorized",
        json.dumps({
            "reason": "Preventive Cardiology checkup following VQC risk evaluation",
            "symptoms": "Mild exertional breathlessness, family history of CAD",
            "duration": "2 weeks",
            "medications": ["Atorvastatin 10mg"],
        }),
        "normal"
    ))

    # Seed Room for BK-2026-8801
    cursor.execute("""
    INSERT OR IGNORE INTO consultation_rooms (id, booking_id, room_token, status, doctor_joined, patient_joined, chat_messages_json)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    """, (
        "ROOM-8801",
        "BK-2026-8801",
        "TOKEN-RTC-99420",
        "waiting",
        0,
        1,
        json.dumps([
            {"sender": "system", "text": "Patient Alexander Reed has checked into the virtual waiting room.", "time": "01:55 PM"},
            {"sender": "Alexander Reed", "text": "Hello Doctor, I have uploaded my recent VQC coronary analysis for review.", "time": "01:58 PM"},
        ])
    ))

    # Seed Notifications for Alexander and Dr. Kavita
    seed_notifications = [
        ("NOTIF-101", "alex.patient", "Appointment Confirmed", "Your video consultation with Dr. Kavita Rao is confirmed for Today at 02:00 PM.", "REF-BK-8801", "booking"),
        ("NOTIF-102", "alex.patient", "Quantum AI Checkup Ready", "Your Wisconsin Breast Oncology analysis has completed with 94.7% confidence.", "REF-DX-7721", "diagnostic"),
        ("NOTIF-201", "dr.kavita", "New Tele-Consultation Booked", "Patient Alexander Reed has booked a video consultation for Today at 02:00 PM.", "REF-BK-8801", "booking"),
    ]
    for nid, nuid, ntitle, nmsg, nref, ncat in seed_notifications:
        cursor.execute("""
        INSERT OR IGNORE INTO notifications (id, user_id, title, message, reference_code, category)
        VALUES (?, ?, ?, ?, ?, ?);
        """, (nid, nuid, ntitle, nmsg, nref, ncat))



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

