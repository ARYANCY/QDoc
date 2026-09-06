# Q-MedSense REST API Specification

**Base Path:** `/api/v1`  
**Authentication:** HTTP Bearer JWT (`Authorization: Bearer <token>`)  
**Protocol:** HTTPS / TLS 1.3  

---

## 1. Authentication & User Profile (`/auth`, `/profile`)

- `POST /api/v1/auth/login`: Authenticate user and receive JWT access token.
- `POST /api/v1/auth/register`: Register new clinical or researcher account.
- `GET /api/v1/auth/me`: Fetch authenticated user identity and role.
- `GET /api/v1/profile`: Retrieve user profile including secondary email and emergency contact.
- `PUT /api/v1/profile`: Update user profile attributes.

---

## 2. Clinical Diagnosis & Early Detection (`/clinical`, `/early-detection`)

- `POST /api/v1/clinical/diagnose`: Run hybrid quantum (VQC/QSVM/QNN) inference on patient data.
- `POST /api/v1/clinical/predict-pneumonia`: Inference on chest X-ray radiographs with VQC.
- `POST /api/v1/clinical/predict-skin-cancer`: Multi-class dermatoscopy classification with QuantumDerma.
- `POST /api/v1/early-detection/analyze-all`: Run multi-disease quantum multi-organ screen.
- `POST /api/v1/early-detection/ingest-fhir`: Ingest HL7 FHIR Observation/Patient JSON bundle.
- `POST /api/v1/early-detection/ingest-vcf`: Ingest Genomic VCF variant text.

---

## 3. Benchmarking, Explainability & Digital Twin (`/benchmarks`, `/digital-twin`, `/quantum-telemetry`)

- `GET /api/v1/benchmarks`: Fetch hybrid vs classical performance metrics and Quantum Advantage Score (QAS).
- `GET /api/v1/digital-twin/{patient_id}`: Retrieve 2D physiological avatar state and timeline scrubber history.
- `GET /api/v1/quantum-telemetry`: Stream live quantum circuit depth, gate counts, and hardware metrics.
- `POST /api/v1/researcher/retrain`: Trigger model retraining with customizable qubit count and optimizer.

---

## 4. Compliance & Reporting (`/compliance`, `/reports`)

- `GET /api/v1/compliance/audit-logs`: Query immutable PHI access and inference audit events.
- `GET /api/v1/compliance/consent/{patient_id}`: Fetch granular DPDP/HIPAA patient consent record.
- `POST /api/v1/compliance/consent`: Update or revoke patient consent version.
- `POST /api/v1/reports/generate`: Generate exportable clinical PDF/HTML diagnostic report.
