# Q-MedSense: Clinical, Operational & Research Workflows (`docs/CLINICAL_WORKFLOWS.md`)

[![Workflows](https://img.shields.io/badge/Workflows-Standardized%20Clinical%20Operating%20Procedures-brightgreen.svg)]()
[![SIH PS ID](https://img.shields.io/badge/SIH%20ID-26139-blue.svg)]()
[![Status](https://img.shields.io/badge/Status-Approved%20by%20Clinical%20Board-green.svg)]()

> **Target Standard:** ISO 29148 / Good Clinical Practice (GCP) Workflow Specifications  
> **Platform:** Q-MedSense Hybrid Quantum Clinical Operating System  

---

## 📑 Table of Contents

1. [Workflow Index & Role Mapping](#1-workflow-index--role-mapping)
2. [Workflow 1: Clinician Hybrid Quantum Diagnostic Pipeline](#2-workflow-1-clinician-hybrid-quantum-diagnostic-pipeline)
3. [Workflow 2: Emergency Department Triage & Instant QR Card Scan](#3-workflow-2-emergency-department-triage--instant-qr-card-scan)
4. [Workflow 3: Multi-Modal Ingestion (HL7 FHIR & Genomic VCF)](#4-workflow-3-multi-modal-ingestion-hl7-fhir--genomic-vcf)
5. [Workflow 4: Doctor Consultation, WebRTC Room & E-Prescriptions](#5-workflow-4-doctor-consultation-webrtc-room--e-prescriptions)
6. [Workflow 5: Researcher Quantum Circuit Retraining & Benchmarking](#6-workflow-5-researcher-quantum-circuit-retraining--benchmarking)
7. [Workflow 6: Patient 2D Digital Twin & DPDP Consent Management](#7-workflow-6-patient-2d-digital-twin--dpdp-consent-management)

---

## 1. Workflow Index & Role Mapping

| Workflow ID | Name | Primary Actor | Target System Component |
| :--- | :--- | :--- | :--- |
| **WF-01** | Hybrid Quantum Diagnostic Pipeline | Clinician (`dr.aryan`) | Diagnostic Cockpit & PennyLane Quantum Engine |
| **WF-02** | Emergency QR Card Triage | Emergency Paramedic / Clinician | Emergency Service & Patient Profile |
| **WF-03** | Multi-Modal Ingestion | Lab Technician / Data Ingestion | HL7 FHIR Parser & VCF Genomic Engine |
| **WF-04** | Teleconsultation & Soft-Lock Booking | Patient & Doctor | WebRTC Video Room & Prescription Signer |
| **WF-05** | Quantum Retraining & Hyperparameter Search | Researcher (`priya.qml`) | Researcher Studio & Model Registry |
| **WF-06** | Digital Twin & DPDP Consent Management | Patient (`alex.patient`) | Patient Portal & Compliance Controller |

---

## 2. Workflow 1: Clinician Hybrid Quantum Diagnostic Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Doc as Clinician (Dr. Aryan)
    participant UI as Diagnostic Cockpit
    participant API as FastAPI Gateway
    participant DB as SQLite Storage
    participant QML as Quantum Simulator (PennyLane)
    participant Exp as SHAP / Perturbation Engine

    Doc->>UI: Select Disease Protocol (e.g. Breast Oncology WDBC)
    UI->>API: GET /api/v1/clinical/patient/{id}/features/{disease}
    API->>DB: Fetch Normalized Feature Vector
    DB-->>UI: Return Live Features (Range [0, π])
    Doc->>UI: Click "Execute Quantum Diagnostic Pipeline"
    UI->>API: POST /api/v1/clinical/diagnose
    API->>QML: Statevector Encoding & Execute Strongly Entangling Ansatz
    QML-->>API: Expectation Values & Class Probabilities
    API->>Exp: Calculate Feature Attributions & Clinical Narrative
    Exp-->>API: SHAP Values & Attributions
    API->>DB: Record Diagnostic Event & Write-Once Audit Log
    API-->>UI: Render Triage Class, Confidence, Baselines & SHAP Bars
    Doc->>UI: Click "Export Clinical PDF Report"
    UI-->>Doc: Download Signed Diagnostic PDF
```

---

## 3. Workflow 2: Emergency Department Triage & Instant QR Card Scan

When an unconscious or trauma patient arrives at the Emergency Department (ED):
1. **Paramedic Scan:** The paramedic scans the patient's physical or digital Emergency Medical Card QR Code using any standard mobile device or clinical barcode scanner.
2. **Instant Triage Retrieval:** The endpoint `GET /api/v1/emergency/card/{patient_id}` resolves in $< 50\text{ms}$ without requiring full account login, displaying:
   - Critical Blood Group (e.g. `O+`).
   - Severe Allergies (e.g. `Penicillin`, `Latex`).
   - Active Chronic Conditions (e.g. `Type-1 Diabetes`, `Hypertension`).
   - Emergency Contact Phone Numbers.
3. **Audit Logging:** An automated `EMERGENCY_QR_ACCESS` audit event is logged with the scanning IP address and timestamp.

---

## 4. Workflow 3: Multi-Modal Ingestion (HL7 FHIR & Genomic VCF)

1. **FHIR Observation Parsing:**
   - Client uploads standard HL7 FHIR JSON Bundle (`POST /api/v1/early-detection/ingest-fhir`).
   - The parser traverses `Bundle.entry` extracting LOINC coded observations (e.g. Glucose `2339-0`, Blood Pressure `85354-9`).
   - Automatically maps values into normalized quantum feature vectors.
2. **Genomic Variant Calling (VCF):**
   - Client uploads VCF 4.2 genomic sequencing records (`POST /api/v1/early-detection/ingest-vcf`).
   - Parses CHROM, POS, REF, ALT and filters for known pathogenic SNVs (e.g. BRCA1, BRCA2, TP53).
   - Generates high-dimensional genomic embeddings for hybrid quantum risk stratification.

---

## 5. Workflow 4: Doctor Consultation, WebRTC Room & E-Prescriptions

```mermaid
sequenceDiagram
    autonumber
    actor Pat as Patient (Alex Reed)
    participant UI as Consultation Portal
    participant API as FastAPI Backend
    participant DB as SQLite DB
    actor Doc as Specialist Doctor

    Pat->>UI: Browse Available Doctors & Slots
    UI->>API: GET /api/v1/consultations/doctors
    API-->>UI: Return Doctor Directory & Schedules
    Pat->>UI: Click "Hold Slot (5 mins)"
    UI->>API: POST /api/v1/consultations/slot/hold
    API->>DB: Set Slot Status = 'HOLD', Lock Expires = Now + 300s
    API-->>UI: Slot Confirmed
    Pat->>UI: Confirm Booking
    UI->>API: POST /api/v1/consultations/book
    API->>DB: Set Slot = 'BOOKED', Generate WebRTC Room ID
    Doc->>UI: Join Consultation Room
    Pat->>UI: Join Consultation Room
    Note over Pat,Doc: Encrypted WebRTC Video Call Session
    Doc->>UI: Issue Digital E-Prescription
    UI->>API: POST /api/v1/consultations/prescribe
    API->>DB: Store Prescription with Cryptographic Signature
```

---

## 6. Workflow 5: Researcher Quantum Circuit Retraining & Benchmarking

1. **Select Baseline Dataset:** Wisconsin Breast Cancer (WDBC), Cleveland Heart Disease, or PIMA Indian Diabetes.
2. **Configure Quantum Hyperparameters:**
   - Qubits: $4 \dots 12$
   - Variational Layers: $1 \dots 6$
   - Optimizer: Adam / Parameter-Shift / COBYLA
   - Loss Function: Focal Loss ($\gamma = 2.0$) / Cross-Entropy
3. **Execute Retraining Job:** Backend compiles PennyLane gradient tape and tracks live loss and epoch convergence.
4. **Registry Registration:** Automatically logs final metrics, checkpoint weights, and Quantum Advantage Score (QAS) in `models/registry.json`.

---

## 7. Workflow 6: Patient 2D Digital Twin & DPDP Consent Management

1. **Physiological Avatar Visualization:** The patient views an anatomical 2D digital twin color-coded by organ risk tiers (Green = Low, Amber = Moderate, Red = Elevated).
2. **Timeline History Scrubber:** Patients scrub through diagnostic history across weeks/months to observe risk progression or therapeutic recovery.
3. **Granular DPDP Consent Control:** Patients toggle telemetry sharing, research pooling, and data retention scopes in real-time.

---

**© 2026 Q-MedSense Operations Division. SIH Problem Statement ID 26139.**
