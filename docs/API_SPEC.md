# Q-MedSense: Complete REST API Specification (`docs/API_SPEC.md`)

[![API Version](https://img.shields.io/badge/API%20Version-2.0.0-blue.svg)]()
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1.0-green.svg)]()
[![FastAPI](https://img.shields.io/badge/Framework-FastAPI%200.110+-009688.svg)]()
[![SIH PS ID](https://img.shields.io/badge/SIH%20ID-26139-blue.svg)]()

> **Target Standard:** OpenAPI 3.1.0 / RFC 7231  
> **Base Path:** `/api/v1`  
> **Interactive Documentation:** `http://localhost:8000/docs` (Swagger UI) & `http://localhost:8000/redoc` (ReDoc)  
> **Security Protocol:** TLS 1.3 / HTTP Bearer JWT Authentication  

---

## 📑 Table of Contents
1. [General Architecture & Conventions](#1-general-architecture--conventions)
2. [Security & Authentication Headers](#2-security--authentication-headers)
3. [Standard Error Envelope](#3-standard-error-envelope)
4. [Authentication & Profile Endpoints (`/auth`, `/profile`)](#4-authentication--profile-endpoints)
5. [Clinical Diagnostic Engine (`/clinical`)](#5-clinical-diagnostic-engine)
6. [Specialized Vision QML Modalities (`/skin-cancer`, `/pneumonia`)](#6-specialized-vision-qml-modalities)
7. [Multi-Modal Ingestion & Early Detection (`/early-detection`)](#7-multi-modal-ingestion--early-detection)
8. [Digital Twin & Quantum Telemetry (`/digital-twin`, `/quantum-telemetry`)](#8-digital-twin--quantum-telemetry)
9. [Researcher Studio & Retraining (`/researcher`, `/benchmarks`)](#9-researcher-studio--retraining)
10. [Doctor Consultations & WebRTC (`/consultations`)](#10-doctor-consultations--webrtc)
11. [Emergency Medical QR Card (`/emergency`)](#11-emergency-medical-qr-card)
12. [Compliance, WORM Audit & Reports (`/compliance`, `/reports`, `/graphs`)](#12-compliance-worm-audit--reports)

---

## 1. General Architecture & Conventions

### URL Structure
All production endpoints are namespaced under the `/api/v1` prefix. System health check and metadata are served at root `/`.

### Content Types
- Request: `application/json` (or `multipart/form-data` for radiological/dermatoscopic image uploads).
- Response: `application/json; charset=utf-8` (or `image/png`, `image/svg+xml` for QR endpoints, `application/pdf` for reports).

### Zero-Default Metric Rule
Unanalyzed parameters strictly return `0.0`, `0%`, or `"Unanalyzed"`. No synthetic dummy mock numbers are allowed.

---

## 2. Security & Authentication Headers

Protected endpoints require the `Authorization` header with a valid JSON Web Token (JWT):
```http
Authorization: Bearer <jwt_access_token>
```

### Role-Based Access Control (RBAC) Matrix

| Endpoint Route Prefix | `patient` | `clinician` | `researcher` | `admin` |
| :--- | :---: | :---: | :---: | :---: |
| `/api/v1/auth/*` | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/profile/*` | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/clinical/*` | ❌ | ✅ | ✅ | ✅ |
| `/api/v1/early-detection/*` | ✅ (Self) | ✅ | ✅ | ✅ |
| `/api/v1/skin-cancer/*` | ❌ | ✅ | ✅ | ✅ |
| `/api/v1/pneumonia/*` | ❌ | ✅ | ✅ | ✅ |
| `/api/v1/digital-twin/*` | ✅ (Self) | ✅ | ✅ | ✅ |
| `/api/v1/researcher/*` | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/emergency/*` | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/compliance/*` | ❌ | ❌ | ❌ | ✅ |
| `/api/v1/admin/*` | ❌ | ❌ | ❌ | ✅ |

### Injected Security Headers
Every HTTP response carries the following OWASP-compliant security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self';`

---

## 3. Standard Error Envelope

When an error occurs ($4xx$ or $5xx$), the API responds with a structured RFC 7807 compliant error payload:

```json
{
  "detail": {
    "error_code": "RESOURCE_NOT_FOUND",
    "message": "Patient with ID PT-99999 was not found in the database.",
    "timestamp": "2026-09-08T18:20:00Z",
    "path": "/api/v1/clinical/patient/PT-99999"
  }
}
```

Common HTTP status codes:
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully registered.
- `400 Bad Request`: Validation failure or malformed payload.
- `401 Unauthorized`: Missing or expired JWT token.
- `403 Forbidden`: Insufficient RBAC permission.
- `404 Not Found`: Entity does not exist.
- `422 Unprocessable Entity`: Pydantic schema validation error.
- `500 Internal Server Error`: Unhandled backend exception with automated fallback.

---

## 4. Authentication & Profile Endpoints

### 4.1 Login & Issue JWT
- **Route:** `POST /api/v1/auth/login`
- **Auth:** Public
- **Request Body:**
```json
{
  "username": "priya.qml",
  "password": "quantum123"
}
```
- **Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 28800,
  "user": {
    "id": "USR-RESEARCH-01",
    "username": "priya.qml",
    "name": "Priya Nair, PhD",
    "email": "priya.nair@qmedsense.org",
    "role": "researcher",
    "hospital_affiliation": "Quantum AI Health Center"
  }
}
```

### 4.2 Get Current User Identity
- **Route:** `GET /api/v1/auth/me`
- **Auth:** Bearer Token
- **Response `200 OK`:**
```json
{
  "id": "USR-RESEARCH-01",
  "username": "priya.qml",
  "role": "researcher",
  "permissions": ["qml:retrain", "benchmarks:read", "telemetry:read"]
}
```

### 4.3 Retrieve & Update User Profile
- **Route:** `GET /api/v1/profile` & `PUT /api/v1/profile`
- **Request Body (`PUT`):**
```json
{
  "name": "Alexander Reed",
  "secondary_email": "alex.backup@gmail.com",
  "emergency_phone": "+91-9876543210"
}
```

---

## 5. Clinical Diagnostic Engine

### 5.1 Execute Hybrid Quantum Diagnosis
- **Route:** `POST /api/v1/clinical/diagnose`
- **Auth:** Clinician, Researcher, Admin
- **Request Body:**
```json
{
  "patient_id": "PT-89421",
  "disease_protocol": "Breast Oncology (WDBC)",
  "features": [17.99, 10.38, 122.8, 1001.0, 0.1184, 0.2776, 0.3001, 0.1471],
  "model_override": "VQC (8-Qubit Strongly Entangling)"
}
```
- **Response `200 OK`:**
```json
{
  "diagnostic_id": "DX-94A8012E",
  "patient_id": "PT-89421",
  "disease": "Breast Oncology (WDBC)",
  "prediction": "Malignant",
  "confidence": 0.9642,
  "probabilities": {
    "Benign": 0.0358,
    "Malignant": 0.9642
  },
  "quantum_telemetry": {
    "backend": "default.qubit",
    "qubit_count": 8,
    "circuit_depth": 14,
    "gate_count": 56,
    "shots": 1024,
    "quantum_advantage_score": 1.24
  },
  "classical_comparison": {
    "model": "Random Forest",
    "prediction": "Malignant",
    "confidence": 0.9210,
    "delta_confidence": 0.0432
  },
  "explainability": {
    "method": "SHAP Perturbation Attribution",
    "top_contributing_biomarkers": [
      {"feature": "mean concave points", "importance": 0.342, "direction": "positive"},
      {"feature": "worst radius", "importance": 0.281, "direction": "positive"},
      {"feature": "mean texture", "importance": 0.114, "direction": "neutral"}
    ],
    "clinical_narrative": "Elevated concave points and worst radius strongly correlate with micro-cellular boundary irregularity."
  },
  "inference_latency_ms": 142.6,
  "fallback_used": false
}
```

---

## 6. Specialized Vision QML Modalities

### 6.1 HAM10000 Skin Lesion Multi-Class Classification
- **Route:** `POST /api/v1/skin-cancer/predict`
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `image: (binary JPEG/PNG)`, `model_variant: "QuantumDerma" | "QuantumDermaX" | "VitaQ-Derm" | "QSkin-Vortex"`
- **Response `200 OK`:**
```json
{
  "prediction": "mel",
  "prediction_name": "Melanoma",
  "confidence": 0.8941,
  "probabilities": {
    "akiec": 0.012,
    "bcc": 0.024,
    "bkl": 0.031,
    "df": 0.005,
    "mel": 0.894,
    "nv": 0.028,
    "vasc": 0.006
  },
  "model_used": "QuantumDerma (10-Qubit Strongly Entangling QNN)",
  "temperature_calibrated": true,
  "ece_score": 0.041
}
```

### 6.2 Chest Radiograph Pneumonia Detection
- **Route:** `POST /api/v1/pneumonia/predict`
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `image: (binary JPEG/PNG)`
- **Response `200 OK`:**
```json
{
  "prediction": "PNEUMONIA",
  "confidence": 0.942,
  "probabilities": {
    "NORMAL": 0.058,
    "PNEUMONIA": 0.942
  },
  "decision_threshold_applied": 0.43,
  "sensitivity_score": 0.961,
  "specificity_score": 0.912,
  "model": "QuantumPneu Hybrid VQC"
}
```

---

## 7. Multi-Modal Ingestion & Early Detection

### 7.1 Multi-Organ Screen
- **Route:** `POST /api/v1/early-detection/analyze-all`
- **Request Body:**
```json
{
  "patient_id": "PT-89421",
  "biomarker_payload": {
    "cardiovascular": [130, 240, 1, 150, 0, 1.4],
    "oncology": [14.2, 18.1, 92.0, 650.1, 0.09],
    "metabolic": [126, 78, 31, 110, 28.4]
  }
}
```
- **Response `200 OK`:** Returns multi-organ risk scores (0–100%) and personalized trajectory stages.

### 7.2 HL7 FHIR Bundle Ingestion
- **Route:** `POST /api/v1/early-detection/ingest-fhir`
- **Request Body:** Standard HL7 FHIR R4 Bundle JSON.
- **Response `200 OK`:** Parsed observations mapped to patient record vectors.

### 7.3 Genomic VCF Ingestion
- **Route:** `POST /api/v1/early-detection/ingest-vcf`
- **Request Body:** Variant Call Format (VCF 4.2) string or file upload.
- **Response `200 OK`:** Extracted pathogenic SNVs and quantum genomic feature vector.

---

## 8. Digital Twin & Quantum Telemetry

### 8.1 Retrieve Patient 2D Digital Twin
- **Route:** `GET /api/v1/digital-twin/{patient_id}`
- **Response `200 OK`:**
```json
{
  "patient_id": "PT-89421",
  "organ_states": {
    "brain": {"risk_tier": "Low", "confidence": 0.91, "stage": 0},
    "heart": {"risk_tier": "Moderate", "confidence": 0.74, "stage": 1},
    "lungs": {"risk_tier": "Low", "confidence": 0.95, "stage": 0},
    "breast": {"risk_tier": "High", "confidence": 0.96, "stage": 2},
    "liver": {"risk_tier": "Low", "confidence": 0.88, "stage": 0}
  },
  "timeline_scrubber": [
    {"timestamp": "2026-01-10", "overall_risk": 18.2},
    {"timestamp": "2026-05-14", "overall_risk": 34.5},
    {"timestamp": "2026-09-08", "overall_risk": 62.1}
  ]
}
```

### 8.2 Live Quantum Telemetry
- **Route:** `GET /api/v1/quantum-telemetry`
- **Response `200 OK`:** Real-time statevector simulator telemetry, gate depth, and qubit entanglement fidelity metrics.

---

## 9. Researcher Studio & Retraining

### 9.1 Trigger Quantum Model Retraining
- **Route:** `POST /api/v1/researcher/retrain`
- **Auth:** Researcher, Admin
- **Request Body:**
```json
{
  "dataset": "Wisconsin Breast Cancer (WDBC)",
  "model_type": "VQC",
  "qubits": 8,
  "layers": 4,
  "epochs": 10,
  "learning_rate": 0.01,
  "optimizer": "Adam",
  "loss_function": "Focal Loss"
}
```
- **Response `200 OK`:**
```json
{
  "job_id": "TRAIN-QML-8042",
  "status": "COMPLETED",
  "initial_loss": 0.6921,
  "final_loss": 0.1412,
  "training_accuracy": 0.971,
  "validation_accuracy": 0.964,
  "macro_f1": 0.962,
  "registered_model_version": "VQC-WDBC-v2.1"
}
```

### 9.2 Fetch Benchmark Matrix
- **Route:** `GET /api/v1/benchmarks`
- **Response `200 OK`:** Comprehensive side-by-side performance matrix comparing VQC, QSVM, QNN against Random Forest, SVM, MLP, XGBoost across all clinical protocols.

---

## 10. Doctor Consultations & WebRTC

### 10.1 Doctor Directory & Filter
- **Route:** `GET /api/v1/consultations/doctors?specialty=Oncology`

### 10.2 Slot Soft-Lock Hold
- **Route:** `POST /api/v1/consultations/slot/hold`
- **Request Body:** `{"doctor_id": "DOC-102", "slot_time": "2026-09-09T14:30:00Z"}`
- **Response:** Soft-locks slot for 5 minutes preventing double-booking.

### 10.3 Emergency Triage & Symptom Checker
- **Route:** `POST /api/v1/consultations/triage`
- **Request Body:** `{"symptoms": ["acute chest pain", "shortness of breath"]}`
- **Response:** Severity tier (`RED_FLAG`, `URGENT`, `ROUTINE`) with recommended care pathway.

---

## 11. Emergency Medical QR Card

### 11.1 Fetch Medical Emergency Data
- **Route:** `GET /api/v1/emergency/card/{patient_id}`
- **Response `200 OK`:** Critical triage info: Blood Group, Allergies, Active Conditions, Emergency Contacts, Organ Donor status.

### 11.2 Generate QR Code Image
- **Route:** `GET /api/v1/emergency/qr.png?patient_id=PT-89421` (Binary PNG)
- **Route:** `GET /api/v1/emergency/qr.svg?patient_id=PT-89421` (Vector SVG)

---

## 12. Compliance, WORM Audit & Reports

### 12.1 Query Immutable WORM Audit Logs
- **Route:** `GET /api/v1/compliance/audit-logs?limit=50&offset=0`
- **Auth:** Admin
- **Response `200 OK`:**
```json
{
  "total": 1284,
  "logs": [
    {
      "id": "AUD-0192A",
      "timestamp": "2026-09-08T18:15:22Z",
      "actor": "alex.patient",
      "action": "EMERGENCY_QR_ACCESS",
      "resource": "PT-89421",
      "ip_address": "192.168.1.45",
      "status": "SUCCESS",
      "hash_signature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
  ]
}
```

### 12.2 DPDP Act 2023 Consent Management
- **Route:** `GET /api/v1/compliance/consent/{patient_id}` & `POST /api/v1/compliance/consent`
- **Request Body (`POST`):**
```json
{
  "patient_id": "PT-89421",
  "dpdp_opt_in": true,
  "telemetry_sharing": false,
  "research_access": true
}
```

### 12.3 Export Clinical PDF/HTML Diagnostic Report
- **Route:** `POST /api/v1/reports/generate`
- **Request Body:** `{"diagnostic_id": "DX-94A8012E", "format": "html"}`

---

**© 2026 Q-MedSense API Team. SIH Problem Statement ID 26139.**
