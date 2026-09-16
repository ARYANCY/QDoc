# Q-RAKSHAK: Full-Stack Deployment Architecture & File Structure Specification
**Document Version:** 2.0.0  
**Target Architecture:** Decoupled 3-Tier Production Microservices (`model/`, `frontend/`, `backend/`)  
**SIH Problem Statement ID:** 26139  
**Status:** Deployment Specification Document (Ready for Production)

---

## Table of Contents
1. [Present Monorepo File Structure & Gap Analysis](#1-present-monorepo-file-structure--gap-analysis)
2. [Target Production File Structure (`model/`, `frontend/`, `backend/`)](#2-target-production-file-structure-model-frontend-backend)
3. [Environment Configuration Matrix (`.env` per Tier)](#3-environment-configuration-matrix-env-per-tier)
   - [3.1 Model Service `.env` & `.env.example`](#31-model-service-env--envexample)
   - [3.2 Frontend Client `.env` & `.env.example`](#32-frontend-client-env--envexample)
   - [3.3 Backend Core API `.env` & `.env.example`](#33-backend-core-api-env--envexample)
4. [API Routes Catalog & Hardcoded URL Remediation](#4-api-routes-catalog--hardcoded-url-remediation)
   - [4.1 Complete Backend Route Registry](#41-complete-backend-route-registry)
   - [4.2 Frontend Hardcoded Endpoints & Remediation Code](#42-frontend-hardcoded-endpoints--remediation-code)
5. [Hosting-Safe `.gitignore` Specifications (Tier-by-Tier)](#5-hosting-safe-gitignore-specifications-tier-by-tier)
   - [5.1 Root `.gitignore`](#51-root-gitignore)
   - [5.2 Model Tier `.gitignore`](#52-model-tier-gitignore)
   - [5.3 Frontend Tier `.gitignore`](#53-frontend-tier-gitignore)
   - [5.4 Backend Tier `.gitignore`](#54-backend-tier-gitignore)
6. [CORS Architecture & Production Implementation](#6-cors-architecture--production-implementation)
   - [6.1 FastAPI CORS Engine Implementation](#61-fastapi-cors-engine-implementation)
   - [6.2 Nginx Reverse Proxy / Gateway CORS Configuration](#62-nginx-reverse-proxy--gateway-cors-configuration)
7. [CORS Error Handling, Decoding & Debugging Guide](#7-cors-error-handling-decoding--debugging-guide)
   - [7.1 Common CORS Errors & Diagnostic Decoding](#71-common-cors-errors--diagnostic-decoding)
   - [7.2 Exception Handling vs. CORS Header Loss (The 500 Pitfall)](#72-exception-handling-vs-cors-header-loss-the-500-pitfall)
   - [7.3 Diagnostic cURL Verification Scripts](#73-diagnostic-curl-verification-scripts)

---

## 1. Present Monorepo File Structure & Gap Analysis

### 1.1 Current Workspace Layout
The current repository is structured as a semi-coupled monorepo containing application backend code, multiple React frontends (`frontend` and `card-frontend`), machine learning pipelines (`ml`, `model_lab`, `models`), and root scripts:

```
doc/ (Monorepo Root)
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── core/             # Config, Security, QR, Logging
│   │   ├── db/               # SQLite DB, Repositories, Schemas
│   │   ├── features/         # 17 Feature Domain Controllers
│   │   └── main.py           # FastAPI initialization & Router mounting
│   ├── q-rakshak.db          # Local SQLite runtime database
│   ├── q-rakshak_demo.db     # Local SQLite demo database
│   └── requirements.txt      # Backend Python dependencies
├── frontend/                 # React 18 + Vite Web Application
│   ├── public/models/        # 3D GLB anatomical organs (Three.js)
│   ├── src/
│   │   ├── api/              # 15 API caller modules (Hardcoded relative URLs)
│   │   ├── components/       # UI & 3D WebGL components
│   │   ├── features/         # Clinical, Researcher, Patient consoles
│   │   └── main.jsx          # React SPA entry point
│   ├── package.json
│   └── vite.config.js        # Local proxy to 127.0.0.1:8000
├── card-frontend/            # Duplicate standalone Emergency Card Vite App
├── ml/                       # ML/QML Pipeline, Preprocessing, Benchmarking
├── model_lab/                # Model training scripts, configs, weights
├── models/                   # Serialized PyTorch (.pt) & QML artifacts
├── infra/                    # Docker, K8s, Nginx, Terraform
├── main.py                   # Root Uvicorn CLI runner
├── requirements.txt          # Unified Python environment requirements
├── .env / .env.example       # Single monorepo .env file
└── .gitignore                # Single root gitignore
```

### 1.2 Deployment Friction Points & Gaps
1. **Coupled Model & Backend Dependencies:** PyTorch, PennyLane, Qiskit, MedGemma, BioMedCLIP, and Transformers require heavy CUDA runtimes (~6GB–12GB container images), whereas the core REST API (Auth, Bookings, Profiles, Compliance) only needs a lightweight Python runtime (<200MB).
2. **Hardcoded API Endpoints in Frontend:** Frontend API modules use direct relative strings (`/api/v1/...`) relying solely on Vite dev proxies. When deployed to static CDNs (Vercel, Netlify, CloudFront, S3), requests fail with 404 or CORS errors.
3. **Hardcoded Secret Keys in Client Code:** `frontend/src/api/client.js` contains a hardcoded fallback API key (`qmed-master-api-key-2026`).
4. **Duplicate Frontends:** `card-frontend` is kept as a separate project with redundant build configs instead of an integrated sub-route or micro-frontend.
5. **Local SQLite Databases in VCS Scope:** `q-rakshak.db` resides in the backend directory without multi-tier storage separation.
6. **Monolithic `.env` File:** Single root `.env` combines Vite variables (`VITE_*`), server secrets (`JWT_SECRET`), and ML weights paths (`MODEL_CACHE_DIR`), creating credential leakage risks during frontend builds.

---

## 2. Target Production File Structure (`model/`, `frontend/`, `backend/`)

In production, the platform is cleanly decoupled into 3 autonomous services with clear operational boundaries:
1. **`frontend/`**: Static SPA deployed on Vercel/Netlify/S3+CloudFront or Nginx.
2. **`backend/`**: FastAPI REST API Gateway & Orchestration service deployed on AWS ECS/Render/Railway/K8s.
3. **`model/`**: GPU/CPU Accelerated QML & Deep Learning Inference Microservice (FastAPI + Torch + PennyLane).

```
q-rakshak-platform/
│
├── frontend/                                   # TIER 1: FRONTEND WEB APPLICATION (SPA)
│   ├── .env.development                       # Local dev overrides (Vite)
│   ├── .env.production                        # Production build environment
│   ├── .env.example                           # Documented template for frontend
│   ├── .gitignore                             # Frontend-specific exclusions
│   ├── Dockerfile                             # Multi-stage Nginx build for containerized hosting
│   ├── nginx.conf                             # Frontend Nginx SPA routing & caching config
│   ├── package.json                           # Dependencies (React, Three.js, Lucide, Recharts)
│   ├── vite.config.js                         # Build optimizations & base API configuration
│   ├── jsconfig.json                          # Path aliases (@/*)
│   ├── index.html                             # Single Page Application HTML root
│   ├── public/                                # Public Static Assets
│   │   ├── favicon.ico
│   │   ├── robots.txt
│   │   └── models/                            # 3D GLTF/GLB Organ Assets
│   │       ├── brain.glb
│   │       ├── heart.glb
│   │       ├── lungs.glb
│   │       ├── skin_male.glb
│   │       └── ... (anatomical meshes)
│   └── src/                                   # Application Source
│       ├── api/                               # Dynamic API Clients (Env-Driven)
│       │   ├── client.js                      # Central Axios/Fetch interceptor + Token handler
│       │   ├── config.js                      # API base URL & route constants
│       │   ├── auth.js                        # Authentication & registration endpoints
│       │   ├── clinical.js                    # Diagnosis & EHR records
│       │   ├── earlyDetection.js              # FHIR/VCF genomics & biomarker pipelines
│       │   ├── twin.js                        # 2D/3D Digital Twin state retrieval
│       │   ├── consultations.js               # Doctor discovery, booking & WebRTC rooms
│       │   ├── benchmarks.js                  # Classical vs Quantum performance metrics
│       │   ├── quantumTelemetry.js            # PennyLane statevector & circuit telemetry
│       │   ├── compliance.js                  # Audit logs & Model registry
│       │   ├── notifications.js               # In-app notifications & alerts
│       │   ├── profile.js                     # Patient & Clinician profiles
│       │   ├── reports.js                     # Clinical PDF/JSON report generation
│       │   ├── researcher.js                  # QML Retraining triggers
│       │   └── users.js                       # Admin user management
│       ├── assets/                            # Brand assets, SVGs, static icons
│       ├── components/                        # Reusable Component Library
│       │   ├── common/                        # Buttons, Modals, Badges, QR Code SVG
│       │   ├── layout/                        # AppShell, Navigation, Header, Sidebar
│       │   └── visualizations/                # Three.js 3D Twin, Recharts, Quantum Circuits
│       ├── context/                           # React Context (Auth, Theme, Active Patient)
│       ├── features/                          # Domain Feature Modules
│       │   ├── admin/                         # User Management & Doctor Verification
│       │   ├── analysis/                      # Unified Diagnosis & AI Analysis UI
│       │   ├── clinical/                      # Clinician Workbench & EHR Views
│       │   ├── consultation/                  # Doctor Scheduling, Video Room & Rx
│       │   ├── digital_twin/                  # 3D Interactive Organ Twin
│       │   ├── emergency/                     # Emergency ID Card & QR Access Portal
│       │   ├── profile/                       # Patient/Doctor Account Settings
│       │   └── researcher/                    # Quantum Retraining Studio
│       ├── hooks/                             # Custom React Hooks (useAuth, useFetch)
│       ├── routes/                            # React Router DOM configuration
│       ├── styles/                            # Tailwind & Global CSS
│       └── main.jsx                           # Application entry point
│
├── backend/                                    # TIER 2: BACKEND CORE BUSINESS LOGIC API
│   ├── .env.development                       # Local backend settings
│   ├── .env.production                        # Production backend settings
│   ├── .env.example                           # Template for backend deployment
│   ├── .gitignore                             # Backend-specific exclusions
│   ├── Dockerfile                             # Production Python slim container
│   ├── requirements.txt                       # Core API dependencies (FastAPI, SQLModel, etc.)
│   ├── pyproject.toml                         # Tool configurations (Ruff, Black, Pytest)
│   ├── alembic.ini                            # DB migration configuration (PostgreSQL/SQLite)
│   ├── migrations/                            # Schema migration scripts
│   └── app/
│       ├── __init__.py
│       ├── main.py                            # FastAPI factory, CORS & Middleware setup
│       ├── core/                              # Infrastructure & Foundation
│       │   ├── __init__.py
│       │   ├── config.py                      # Pydantic BaseSettings (Environment Loader)
│       │   ├── security.py                    # PBKDF2 Hashing, JWT HMAC, Rate Limiter
│       │   ├── logging.py                     # Structured JSON logging & Correlation IDs
│       │   ├── qr_service.py                  # QR Matrix & Vector SVG Generator
│       │   ├── cors.py                        # CORS validation & dynamic origin checker
│       │   └── exceptions.py                  # Global HTTP & CORS exception handlers
│       ├── db/                                # Persistence Layer
│       │   ├── __init__.py
│       │   ├── session.py                     # SQLAlchemy / SQLModel Engine & Session factory
│       │   ├── models.py                      # Database Table Models (User, Patient, Rx, etc.)
│       │   └── repository.py                  # Data access objects & seeders
│       ├── features/                          # Domain Feature Routers & Business Logic
│       │   ├── admin/controller.py            # User CRUD & Verification Queue
│       │   ├── auth/controller.py             # Login, Register, JWT Me
│       │   ├── benchmarks/controller.py       # Benchmark metrics retrieval
│       │   ├── clinical/controller.py         # Clinical EHR & Diagnosis Orchestration
│       │   ├── compliance/controller.py       # Audit logs & FDA/HIPAA compliance
│       │   ├── consultations/controller.py    # Doctor Discovery, Slots, WebRTC & Rx
│       │   ├── digital_twin/controller.py     # Twin state aggregation
│       │   ├── early_detection/controller.py  # FHIR & VCF parsing
│       │   ├── emergency/controller.py        # Public Triage & QR Card Endpoints
│       │   ├── graphs/controller.py           # Pre-computed diagnostic SVG graphs
│       │   ├── notifications/controller.py    # Notification inbox & alerts
│       │   ├── profile/controller.py          # Profile management
│       │   └── reports/controller.py          # Clinical Report Generation
│       └── services/                          # External Integrations
│           ├── model_client.py                # gRPC / HTTP Client to Model Inference Service
│           └── storage_service.py             # S3 / MinIO Cloud Storage for uploads & PDFs
│
├── model/                                      # TIER 3: QUANTUM & DEEP LEARNING INFERENCE SERVICE
│   ├── .env.development                       # Local Model Lab settings
│   ├── .env.production                        # GPU/Inference Server settings
│   ├── .env.example                           # Template for Model Service
│   ├── .gitignore                             # Model-specific exclusions (large weights/data)
│   ├── Dockerfile                             # CUDA/PyTorch accelerated container
│   ├── requirements.txt                       # PyTorch, PennyLane, Qiskit, Transformers
│   ├── service.py                             # FastAPI Inference Microservice Entry Point
│   ├── configs/                               # Architecture hyperparameters
│   │   ├── pneumonia.yaml
│   │   ├── skin_cancer.yaml
│   │   └── quantum_circuits.yaml
│   ├── pipelines/                             # Pipeline Implementations
│   │   ├── __init__.py
│   │   ├── base.py                            # Abstract Model Base Class
│   │   ├── pneumonia_pipeline.py              # DenseNet / ResNet + Quantum Feature Map
│   │   ├── skin_cancer_pipeline.py            # DermisNova / EfficientNet Pipeline
│   │   ├── quantum_vqc.py                     # Variational Quantum Classifier (PennyLane)
│   │   ├── qsvm.py                            # Quantum Kernel Support Vector Machine
│   │   └── explainability.py                  # Grad-CAM, SHAP & Quantum Saliency
│   ├── weights/                               # Production Serialized Weights (.pt, .pkl)
│   │   ├── pneumonia/
│   │   │   └── best.pt
│   │   ├── skin_cancer/
│   │   │   └── best_dermisnova.pt
│   │   ├── quantum/
│   │   │   ├── CardioWave-VQC.pt
│   │   │   ├── Diabetes-VQC.pt
│   │   │   ├── OncoPulse-QSVM.pkl
│   │   │   └── NeuroSynapse-VQC.pt
│   │   └── registry.json                      # Model versions & checksums
│   └── data/                                  # Preprocessing schemas & test vectors
│       ├── test_samples/
│       └── schemas.py                         # Request/Response inference Pydantic schemas
│
├── deploy/                                     # DEPLOYMENT & INFRASTRUCTURE ORCHESTRATION
│   ├── docker-compose.prod.yml                # Production multi-container composition
│   ├── docker-compose.dev.yml                 # Local development composition
│   ├── nginx/
│   │   ├── nginx.conf                         # Main reverse proxy configuration
│   │   └── conf.d/
│   │       ├── frontend.conf                  # Static web server & TLS termination
│   │       ├── api_gateway.conf               # /api/ routes -> Backend (Port 8000)
│   │       └── model_gateway.conf             # /inference/ routes -> Model Service (Port 8001)
│   └── k8s/                                   # Kubernetes Manifests
│       ├── frontend-deployment.yaml
│       ├── backend-deployment.yaml
│       ├── model-gpu-deployment.yaml
│       └── ingress.yaml
│
├── .gitignore                                 # Monorepo root gitignore
└── README.md                                  # Platform overview & setup instructions
```

---

## 3. Environment Configuration Matrix (`.env` per Tier)

Each tier has distinct operational variables. **Never share `.env` files between tiers.**

### 3.1 Model Service `.env` & `.env.example`
Path: `model/.env` / `model/.env.example`

```ini
# ==============================================================================
# Q-RAKSHAK: Model Inference Service Environment Configuration
# ==============================================================================

# Server Network Configuration
MODEL_SERVICE_HOST=0.0.0.0
MODEL_SERVICE_PORT=8001
ENVIRONMENT=production
LOG_LEVEL=INFO

# Hardware & Accelerator Configuration
# Options: 'cuda', 'cuda:0', 'mps', 'cpu', or leave blank for auto-detect
DEVICE=cuda
TORCH_NUM_THREADS=4
CUDA_VISIBLE_DEVICES=0

# Quantum Simulation Engine
# Options: 'default.qubit', 'lightning.qubit', 'qiskit.aer', 'braket.aws.qubit'
QUANTUM_BACKEND=lightning.qubit
QUANTUM_SHOTS=1024
DEFAULT_QUBITS=8
DEFAULT_LAYERS=2

# Weights & Artifact Storage
WEIGHTS_DIR=weights
MODEL_CACHE_DIR=/tmp/model_cache
REGISTRY_PATH=weights/registry.json

# Model Hub Credentials (Required for gated Foundation models e.g. MedGemma)
HUGGINGFACE_HUB_TOKEN=
HF_TOKEN=

# Model Service Internal API Security
MODEL_SERVICE_API_KEY=qmed-internal-model-key-secure-prod-2026

# Backend Callback Webhook (For asynchronous batch retraining jobs)
BACKEND_WEBHOOK_URL=http://backend:8000/api/v1/researcher/training-callback

# Performance & Batching Settings
MAX_BATCH_SIZE=16
INFERENCE_TIMEOUT_SECONDS=30
ENABLE_GRADCAM=true
ENABLE_SHAP=false
```

---

### 3.2 Frontend Client `.env` & `.env.example`
Path: `frontend/.env` / `frontend/.env.example`  
*Note: Vite requires variables exposed to the client to begin with `VITE_`.*

```ini
# ==============================================================================
# Q-RAKSHAK: Frontend Client (Vite) Environment Configuration
# ==============================================================================

# Application Meta
VITE_APP_TITLE=Q-RAKSHAK — Quantum Clinical Decision Support OS
VITE_APP_VERSION=2.0.0
VITE_ENVIRONMENT=production

# Backend REST API Gateway (Target URL for all HTTP/WebSocket requests)
# In local dev: http://localhost:8000/api/v1
# In production (same origin reverse proxy): /api/v1
# In production (cross origin subdomain): https://api.q-rakshak.health/api/v1
VITE_API_BASE_URL=https://api.q-rakshak.health/api/v1
VITE_BACKEND_ORIGIN=https://api.q-rakshak.health

# API Gateway Key (Passed via X-API-Key header)
VITE_API_KEY=qmed-master-api-key-2026

# Emergency Portal Public Web Address (Used in QR Code generation)
VITE_EMERGENCY_PORTAL_BASE=https://q-rakshak.health/#emergency

# Feature Toggles & Capabilities
VITE_ENABLE_3D_DIGITAL_TWIN=true
VITE_ENABLE_QUANTUM_TELEMETRY=true
VITE_ENABLE_RESEARCHER_STUDIO=true
VITE_ENABLE_MOCK_FALLBACK=false

# Request Telemetry & Timeouts
VITE_API_TIMEOUT_MS=15000
```

---

### 3.3 Backend Core API `.env` & `.env.example`
Path: `backend/.env` / `backend/.env.example`

```ini
# ==============================================================================
# Q-RAKSHAK: Backend Core API Gateway Environment Configuration
# ==============================================================================

# Server Network Configuration
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production
API_V1_PREFIX=/api/v1
DEBUG=false

# Database Configuration (PostgreSQL in production, SQLite in development)
# Production Example: postgresql+asyncpg://qmed_user:secure_pwd@db.internal:5432/q-rakshak_prod
# Local Development: sqlite:///q-rakshak.db
DATABASE_URL=sqlite:///q-rakshak.db
QMED_DB_MODE=production
QMED_REAL_DB_PATH=q-rakshak.db
QMED_DEMO_DB_PATH=q-rakshak_demo.db

# Authentication, Tokens & Security
SECRET_KEY=replace-with-a-64-character-cryptographic-random-secret-key
JWT_SECRET=replace-with-a-64-character-cryptographic-random-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
API_KEY=qmed-master-api-key-2026

# CORS Security (Comma-Separated Allowed Origins)
# Include all client domain variants (localhost, IP, preview URLs, production domains)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,https://q-rakshak.health,https://www.q-rakshak.health,https://app.q-rakshak.health
CORS_ALLOW_CREDENTIALS=true

# Model Inference Microservice Communication
MODEL_SERVICE_URL=http://model:8001
MODEL_SERVICE_API_KEY=qmed-internal-model-key-secure-prod-2026
MODEL_SERVICE_TIMEOUT_SECONDS=45

# Frontend Web Origin (Used for deep links, QR verification, email alerts)
FRONTEND_URL=https://q-rakshak.health

# Rate Limiting Settings
RATE_LIMIT_INFERENCE_MAX_PER_MINUTE=60
RATE_LIMIT_AUTH_MAX_PER_MINUTE=10

# Storage & Report Generation
REPORTS_DIR=storage/reports
UPLOAD_DIR=storage/uploads
MAX_UPLOAD_SIZE_MB=50
```

---

## 4. API Routes Catalog & Hardcoded URL Remediation

### 4.1 Complete Backend Route Registry
The backend exposes 17 domain feature routers grouped under `/api/v1`:

| Domain Feature | Router Prefix | HTTP Method | Endpoint Path | Summary / Responsibility | Auth Required |
|---|---|---|---|---|---|
| **Auth** | `/api/v1/auth` | `POST` | `/register` | Register new clinician/patient/researcher | No |
| | | `POST` | `/login` | Authenticate user & return signed JWT | No |
| | | `GET` | `/me` | Retrieve current authenticated user profile | Yes (Bearer/API-Key) |
| **Clinical** | `/api/v1/clinical` | `POST` | `/diagnose` | Run hybrid classical + quantum diagnosis | Yes (Rate-limited) |
| | | `GET` | `/patient/{patient_id}` | Retrieve patient clinical EHR record | Yes |
| | | `PUT` | `/patient/{patient_id}` | Update patient EHR data | Yes |
| | | `POST` | `/patient` | Register a new patient record | Yes |
| | | `GET` | `/patient/{patient_id}/features/{disease}` | Get feature vector for specific disease | Yes |
| | | `GET` | `/status` | Platform healthcheck & model status | No |
| **Emergency** | `/api/v1/emergency` | `GET` | `/{patient_id}` | Public emergency triage summary | No |
| | | `GET` | `/{patient_id}/card-data` | Complete emergency health card record | No |
| | | `GET` | `/{patient_id}/qr.png` | Stream PNG format QR Code | No |
| | | `GET` | `/{patient_id}/qr.svg` | Stream SVG format QR Code | No |
| **Pneumonia** | `/api/v1/pneumonia` | `POST` | `/predict` | X-ray chest scan pneumonia prediction | Yes |
| | | `GET` | `/health` | Pneumonia model health check | No |
| **Skin Cancer** | `/api/v1/skin-cancer` | `POST` | `/predict` | Dermoscopy lesion classification | Yes |
| | | `GET` | `/history` | History of dermoscopy scans | Yes |
| | | `GET` | `/health` | Skin cancer model health check | No |
| **Digital Twin** | `/api/v1/digital-twin` | `GET` | `/state/{patient_id}` | Retrieve 2D/3D Digital Twin organ vitals | Yes |
| **Early Detection** | `/api/v1/early-detection` | `GET` | `/pathway/{disease_key}` | Disease risk progression pathway map | Yes |
| | | `POST` | `/ingest-fhir` | Ingest HL7 FHIR Observation Bundle | Yes |
| | | `POST` | `/ingest-vcf` | Ingest Variant Call Format (VCF) genomics | Yes |
| **Consultations**| `/api/v1/consultations` | `GET` | `/doctors` | List verified specialist physicians | Yes |
| | | `GET` | `/doctors/{doctor_id}` | Retrieve doctor credentials & slots | Yes |
| | | `POST` | `/slots/hold` | Temporarily hold an appointment slot | Yes |
| | | `POST` | `/triage-check` | Automated symptom pre-triage check | Yes |
| | | `POST` | `/book` | Confirm doctor appointment booking | Yes |
| | | `GET` | `/bookings` | List user consultation bookings | Yes |
| | | `GET` | `/bookings/{booking_id}` | Retrieve booking session details | Yes |
| | | `POST` | `/bookings/{booking_id}/transition` | Update appointment lifecycle state | Yes |
| | | `GET` | `/rooms/{booking_id}` | Retrieve WebRTC consultation room | Yes |
| | | `POST` | `/rooms/{booking_id}/admit` | Admit patient into active video call | Yes |
| | | `POST` | `/rooms/{booking_id}/chat` | Send consultation in-room chat message | Yes |
| | | `POST` | `/rooms/{booking_id}/signals` | WebRTC SDP & ICE signaling exchange | Yes |
| | | `GET` | `/rooms/{booking_id}/signals` | Poll WebRTC ICE candidates & signals | Yes |
| | | `POST` | `/prescriptions/check-interactions` | Check drug-drug interactions | Yes |
| | | `POST` | `/prescriptions` | Create digital e-Prescription | Yes (Doctor) |
| | | `GET` | `/prescriptions` | List user prescriptions | Yes |
| | | `GET` | `/prescriptions/{prescription_id}` | Retrieve digital e-Prescription | Yes |
| **Admin** | `/api/v1/admin` | `GET` | `/users` | List all platform users | Yes (Admin) |
| | | `POST` | `/users` | Create user account | Yes (Admin) |
| | | `PUT` | `/users/{user_id}` | Update user permissions & roles | Yes (Admin) |
| | | `DELETE`| `/users/{user_id}` | Delete user account | Yes (Admin) |
| | | `GET` | `/doctor-verification-queue` | List pending doctor credential reviews | Yes (Admin) |
| | | `POST` | `/doctor-verification/{doctor_id}/verify` | Approve or reject doctor verification | Yes (Admin) |
| **Compliance** | `/api/v1/compliance` | `GET` | `/audit-logs` | Retrieve tamper-evident audit logs | Yes (Admin) |
| | | `GET` | `/model-registry` | List certified ML/QML model checksums | Yes |
| | | `POST` | `/consent` | Record patient informed data consent | Yes |
| **Telemetry** | `/api/v1/quantum-telemetry` | `GET` | `/circuit/{model_name}` | PennyLane quantum circuit diagram & depth | Yes |
| **Benchmarks** | `/api/v1/benchmarks` | `GET` | `/matrix` | Classical vs Quantum Benchmark metrics | Yes |
| **Researcher** | `/api/v1/researcher` | `POST` | `/train` | Trigger asynchronous QML retraining job | Yes (Researcher) |
| **Reports** | `/api/v1/reports` | `POST` | `/generate` | Generate clinical PDF & JSON report | Yes |
| | | `GET` | `/` | List all generated clinical reports | Yes |
| | | `GET` | `/patient/{patient_id}` | List reports for specific patient | Yes |
| **Notifications**| `/api/v1/notifications` | `GET` | `/` | List notifications for authenticated user | Yes |
| | | `POST` | `/{notification_id}/read` | Mark notification as read | Yes |
| | | `POST` | `/send-alert` | Dispatch critical clinical alert | Yes |
| **Profile** | `/api/v1/profile` | `GET` | `/{user_id}` | Get user profile metadata | Yes |
| | | `PUT` | `/{user_id}` | Update profile information | Yes |
| | | `DELETE`| `/{user_id}` | Delete user profile | Yes |
| **Graphs** | `/api/v1/graphs` | `GET` | `/` | List available pre-rendered diagnostic graphs | Yes |
| | | `GET` | `/{disease}/{filename}` | Stream SVG graph visualization | Yes |

---

### 4.2 Frontend Hardcoded Endpoints & Remediation Code

#### 4.2.1 Identification of Current Hardcoded Values
In the present frontend files, several values are hardcoded directly into source code:

1. **`frontend/src/api/client.js`**:
   - `const API_KEY = "qmed-master-api-key-2026";` (Hardcoded master key in source).
   - Hardcoded direct relative paths like `/api/v1/...` which break when frontend is hosted on a separate CDN/domain without a reverse proxy.
2. **`frontend/src/features/profile/UserProfilePage.jsx`**:
   - `emergencyPortalUrl = ... "https://q-rakshak.health/#emergency/..."` (Hardcoded production domain).
   - `emergencyQrUrl = '/api/v1/emergency/${...}/qr.png'` (Hardcoded relative endpoint).
3. **`frontend/src/components/common/QRCodeSVG.jsx`**:
   - Fallback matrix `value || 'https://q-rakshak.health'` (Hardcoded domain).
4. **All individual API caller modules (`auth.js`, `clinical.js`, `consultations.js`, etc.)**:
   - Calling `/api/v1/auth/login`, `/api/v1/clinical/diagnose` without an environment prefix.

#### 4.2.2 Remediation: Centralized Environment Config (`src/api/config.js`)
Create a centralized configuration module in `frontend/src/api/config.js`:

```javascript
// frontend/src/api/config.js

// Safely normalize trailing slashes
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const API_KEY = import.meta.env.VITE_API_KEY || "";
export const EMERGENCY_PORTAL_BASE = 
  import.meta.env.VITE_EMERGENCY_PORTAL_BASE || "https://q-rakshak.health/#emergency";

export const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15000;

export const ENDPOINTS = {
  // Auth
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  AUTH_ME: `${API_BASE_URL}/auth/me`,

  // Clinical & Diagnosis
  CLINICAL_DIAGNOSE: `${API_BASE_URL}/clinical/diagnose`,
  CLINICAL_PATIENT: (patientId) => `${API_BASE_URL}/clinical/patient/${encodeURIComponent(patientId)}`,
  CLINICAL_FEATURES: (patientId, disease) => `${API_BASE_URL}/clinical/patient/${encodeURIComponent(patientId)}/features/${encodeURIComponent(disease)}`,
  CLINICAL_STATUS: `${API_BASE_URL}/clinical/status`,

  // Vision & Specialized Models
  PNEUMONIA_PREDICT: `${API_BASE_URL}/pneumonia/predict`,
  SKIN_CANCER_PREDICT: `${API_BASE_URL}/skin-cancer/predict`,

  // Digital Twin & Early Detection
  TWIN_STATE: (patientId) => `${API_BASE_URL}/digital-twin/state/${encodeURIComponent(patientId)}`,
  EARLY_DETECTION_PATHWAY: (disease) => `${API_BASE_URL}/early-detection/pathway/${encodeURIComponent(disease)}`,
  EARLY_DETECTION_INGEST_FHIR: `${API_BASE_URL}/early-detection/ingest-fhir`,
  EARLY_DETECTION_INGEST_VCF: `${API_BASE_URL}/early-detection/ingest-vcf`,

  // Emergency & QR
  EMERGENCY_CARD: (patientId) => `${API_BASE_URL}/emergency/${encodeURIComponent(patientId)}/card-data`,
  EMERGENCY_QR_PNG: (patientId) => `${API_BASE_URL}/emergency/${encodeURIComponent(patientId)}/qr.png`,
  EMERGENCY_QR_SVG: (patientId) => `${API_BASE_URL}/emergency/${encodeURIComponent(patientId)}/qr.svg`,

  // Consultations & WebRTC
  CONSULTATIONS_DOCTORS: `${API_BASE_URL}/consultations/doctors`,
  CONSULTATIONS_BOOKINGS: `${API_BASE_URL}/consultations/bookings`,
  CONSULTATIONS_SLOTS_HOLD: `${API_BASE_URL}/consultations/slots/hold`,
  CONSULTATIONS_TRIAGE: `${API_BASE_URL}/consultations/triage-check`,
  CONSULTATIONS_PRESCRIPTIONS: `${API_BASE_URL}/consultations/prescriptions`,
  CONSULTATIONS_ROOM: (bookingId) => `${API_BASE_URL}/consultations/rooms/${encodeURIComponent(bookingId)}`,
  CONSULTATIONS_SIGNALS: (bookingId) => `${API_BASE_URL}/consultations/rooms/${encodeURIComponent(bookingId)}/signals`,

  // Admin & Compliance
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_DOCTOR_QUEUE: `${API_BASE_URL}/admin/doctor-verification-queue`,
  COMPLIANCE_AUDIT: `${API_BASE_URL}/compliance/audit-logs`,
  COMPLIANCE_REGISTRY: `${API_BASE_URL}/compliance/model-registry`,

  // Telemetry, Benchmarks & Researcher
  QUANTUM_CIRCUIT: (model) => `${API_BASE_URL}/quantum-telemetry/circuit/${encodeURIComponent(model)}`,
  BENCHMARKS_MATRIX: `${API_BASE_URL}/benchmarks/matrix`,
  RESEARCHER_TRAIN: `${API_BASE_URL}/researcher/train`,
  REPORTS_GENERATE: `${API_BASE_URL}/reports/generate`,
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
};
```

#### 4.2.3 Remediation: Robust Environment-Aware API Client (`src/api/client.js`)

```javascript
// frontend/src/api/client.js
import { API_KEY, API_TIMEOUT_MS } from "./config";

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("qmed_token");
  const storedApiKey = localStorage.getItem("qmed_api_key");
  const effectiveApiKey = storedApiKey || API_KEY;

  const timeoutMs = options.timeout || API_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    Accept: "application/json",
    ...(effectiveApiKey ? { "X-API-Key": effectiveApiKey } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Ensure credentials mode is properly set for CORS
  const fetchOptions = {
    ...options,
    headers,
    signal: controller.signal,
    mode: "cors", // Explicit cross-origin mode
  };

  try {
    const response = await fetch(endpoint, fetchOptions);
    clearTimeout(timeoutId);

    if (response.status === 401) {
      localStorage.removeItem("qmed_token");
      window.dispatchEvent(new CustomEvent("qmed:auth_expired"));
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status} Error`;
      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = errorData;
      throw err;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${endpoint}`);
    }
    // Network / CORS failure detection
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      console.error(`[CORS / Network Failure] Unable to reach ${endpoint}. Verify CORS headers & server status.`);
    }
    throw error;
  }
}

export const apiClient = {
  get: (endpoint, headers, options = {}) => request(endpoint, { method: "GET", headers, ...options }),
  post: (endpoint, body, headers, options = {}) => 
    request(endpoint, { 
      method: "POST", 
      body: body instanceof FormData ? body : JSON.stringify(body), 
      headers, 
      ...options 
    }),
  put: (endpoint, body, headers, options = {}) => 
    request(endpoint, { 
      method: "PUT", 
      body: body instanceof FormData ? body : JSON.stringify(body), 
      headers, 
      ...options 
    }),
  delete: (endpoint, headers, options = {}) => request(endpoint, { method: "DELETE", headers, ...options }),
};

export default apiClient;
```

---

## 5. Hosting-Safe `.gitignore` Specifications (Tier-by-Tier)

Files that must **never** be checked into version control or uploaded to hosting servers:

### 5.1 Root `.gitignore`
Path: `.gitignore`

```gitignore
# ==============================================================================
# Q-RAKSHAK Root .gitignore
# ==============================================================================

# OS & Editor Artifacts
.DS_Store
Thumbs.db
desktop.ini
.idea/
.vscode/
*.swp
*.swo

# Environment Files (Keep .env.example tracked only)
.env
.env*.local
.env.production
.env.staging
!.env.example

# Version Control & Caches
.git/
.pytest_cache/
.ruff_cache/
.mypy_cache/
.coverage
htmlcov/

# Build & Dependency Outputs
node_modules/
dist/
build/
__pycache__/
*.py[cod]
*$py.class
*.so
.venv/
env/
venv/
ENV/

# Databases & Runtime State
*.db
*.sqlite
*.sqlite3
*.db-journal
*.db-wal
*.db-shm
q-rakshak.db
q-rakshak_demo.db

# Heavy Training Datasets & Large Checkpoints (Managed by DVC/S3/Model Hub)
datasets/
data/raw/
data/processed/
*.zip
*.tar.gz
*.tar
*.7z
*.vcf
*.dcm
```

---

### 5.2 Model Tier `.gitignore`
Path: `model/.gitignore`

```gitignore
# Python & Bytecode
__pycache__/
*.pyc
*.pyo
*.pyd

# Virtual Environments
.venv/
venv/
env/

# Environment Secrets
.env
.env.production
!.env.example

# Large Weight Checkpoints (Download from S3 / HuggingFace Hub during deployment)
weights/checkpoints/
weights/experimental/
weights/tmp/
*.pt
*.pth
*.bin
*.onnx
*.safetensors
*.pkl
*.h5
# Retain lightweight metadata / registry files
!weights/registry.json

# Caches & Hardware Logs
.cache/
/tmp/
model_cache/
lightning_logs/
runs/
wandb/
*.cuda-prof
```

---

### 5.3 Frontend Tier `.gitignore`
Path: `frontend/.gitignore`

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build Distribution
dist/
dist-ssr/
build/
*.local

# Environment Variables
.env
.env.production
.env.staging
.env.local
.env.development.local
.env.test.local
.env.production.local
!.env.example

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Testing & Coverage
coverage/
.nyc_output/

# IDE / Editor Files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

---

### 5.4 Backend Tier `.gitignore`
Path: `backend/.gitignore`

```gitignore
# Python Bytecode
__pycache__/
*.py[cod]
*$py.class
*.so

# Environment Variables
.env
.env.production
.env.staging
.env.local
!.env.example

# Database Files
*.db
*.sqlite
*.sqlite3
q-rakshak.db
q-rakshak_demo.db

# Storage & User Uploads
storage/uploads/*
storage/reports/*
!storage/uploads/.gitkeep
!storage/reports/.gitkeep
reports/*.pdf
reports/*.json

# Testing & Coverage
.pytest_cache/
.coverage
htmlcov/
.mypy_cache/
.ruff_cache/

# Virtual Environment
.venv/
venv/
```

---

## 6. CORS Architecture & Production Implementation

Cross-Origin Resource Sharing (CORS) is an HTTP-header based mechanism that allows a server to indicate any origins (domain, scheme, or port) other than its own from which a browser should permit loading resources.

```
+------------------+          1. Preflight OPTIONS /api/v1/clinical/diagnose
|  Browser Client  | -----------------------------------------------------> +--------------------+
| (q-rakshak.health) | <----------------------------------------------------- | Backend / Gateway  |
+------------------+          2. 200 OK + Access-Control-Allow-Origin        +--------------------+
         |
         |                    3. Actual POST Request with Authorization & X-API-Key
         +----------------------------------------------------------------->
         <-----------------------------------------------------------------
                              4. 200 OK Response + Clinical Diagnosis Result
```

### 6.1 FastAPI CORS Engine Implementation
In `backend/app/core/cors.py` and `backend/app/main.py`:

```python
# backend/app/core/cors.py
from __future__ import annotations
import os
import re
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def parse_cors_origins() -> List[str]:
    """Extracts, cleans, and deduplicates allowed origins from environment variables."""
    default_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    raw_env_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
    if raw_env_origins:
        for item in raw_env_origins.split(","):
            cleaned = item.strip().rstrip("/")
            if cleaned and cleaned not in default_origins:
                default_origins.append(cleaned)
    return default_origins


def setup_cors(app: FastAPI) -> None:
    """Configures enterprise-grade CORS middleware with support for credentials, custom headers, and preflight caching."""
    allowed_origins = parse_cors_origins()
    
    # Check if wildcard regex is enabled (e.g. for Vercel/Netlify preview deployments)
    origin_regex = os.getenv("CORS_ORIGIN_REGEX", None) # e.g. r"https://.*\.q-rakshak\.health"

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_origin_regex=origin_regex,
        allow_credentials=True, # Required when passing Authorization Bearer tokens or cookies
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "X-API-Key",
            "Accept",
            "Origin",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
        ],
        expose_headers=[
            "Content-Disposition",
            "Content-Length",
            "X-Request-ID",
            "X-Quantum-Circuit-Depth",
        ],
        max_age=86400, # Cache preflight OPTIONS responses for 24 hours (reduces OPTIONS latency)
    )
```

---

### 6.2 Nginx Reverse Proxy / Gateway CORS Configuration
When hosting behind Nginx (e.g. `deploy/nginx/conf.d/api_gateway.conf`), configure Nginx to handle preflights or forward headers cleanly:

```nginx
# deploy/nginx/conf.d/api_gateway.conf

upstream backend_upstream {
    server backend:8000;
    keepalive 32;
}

server {
    listen 80;
    server_name api.q-rakshak.health;

    # Maximum upload size for DICOM / Dermoscopy / VCF genomic files
    client_max_body_size 50M;

    location /api/ {
        # Intercept and handle Preflight OPTIONS at Nginx level for ultra-low latency
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$http_origin' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-API-Key, Accept, Origin, X-Requested-With' always;
            add_header 'Access-Control-Max-Age' 86400;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        proxy_pass http://backend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for heavy Quantum ML executions
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
}
```

---

## 7. CORS Error Handling, Decoding & Debugging Guide

### 7.1 Common CORS Errors & Diagnostic Decoding

#### Error 1: Missing `Access-Control-Allow-Origin` Header
```text
Access to fetch at 'https://api.q-rakshak.health/api/v1/clinical/diagnose' from origin 'https://q-rakshak.health' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```
* **Decoded Meaning:** The backend received the request, but the requesting origin `https://q-rakshak.health` was not present in the backend's allowed list (`CORS_ALLOWED_ORIGINS`). The server responded without an `Access-Control-Allow-Origin` header matching the client.
* **Root Causes:**
  1. `CORS_ALLOWED_ORIGINS` in `backend/.env` is missing `https://q-rakshak.health` (or has a trailing slash mismatch like `https://q-rakshak.health/`).
  2. The server threw an unhandled 500 exception before the CORS middleware could append headers.
* **Resolution:** Add the exact protocol + domain + port to `CORS_ALLOWED_ORIGINS` in `backend/.env` without trailing slashes.

---

#### Error 2: Preflight Request Failed (Status code 401/405/500)
```text
Access to fetch at 'https://api.q-rakshak.health/api/v1/clinical/diagnose' from origin 'https://q-rakshak.health' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```
* **Decoded Meaning:** Before sending `POST /diagnose`, the browser dispatched an `OPTIONS` preflight request. The server returned a non-2xx status code (e.g. `401 Unauthorized` or `405 Method Not Allowed`).
* **Root Causes:**
  1. An authentication dependency or custom middleware in FastAPI is running *before* the CORS middleware and blocking `OPTIONS` requests because they lack a Bearer token.
  2. A router does not permit the `OPTIONS` method.
* **Resolution:** Ensure `CORSMiddleware` is added **after** other middlewares in FastAPI (which means it executes first in Starlette's onion model), or ensure custom security dependencies explicitly return `200` for `request.method == "OPTIONS"`.

---

#### Error 3: Disallowed Custom Header (`X-API-Key` or `Authorization`)
```text
Access to fetch at 'https://api.q-rakshak.health/api/v1/clinical/diagnose' from origin 'https://q-rakshak.health' 
has been blocked by CORS policy: Request header field x-api-key is not allowed by 
Access-Control-Allow-Headers in preflight response.
```
* **Decoded Meaning:** The client frontend passed `X-API-Key: qmed-master-api-key-2026`, but the backend's `allow_headers` list in `CORSMiddleware` did not explicitly authorize `X-API-Key`.
* **Resolution:** Add `"X-API-Key"` to `allow_headers` in `CORSMiddleware` (or use `allow_headers=["*"]`).

---

#### Error 4: Wildcard `*` Conflict with Credentials
```text
Access to fetch at 'https://api.q-rakshak.health/api/v1/clinical/diagnose' from origin 'https://q-rakshak.health' 
has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response 
must not be the wildcard '*' when the request's credentials mode is 'include'.
```
* **Decoded Meaning:** The frontend sent cookies, HTTP-only auth tokens, or `credentials: "include"`, but the server responded with `Access-Control-Allow-Origin: *`. The W3C Fetch standard prohibits wildcard origins when credentials are included.
* **Resolution:** Change `allow_origins=["*"]` in backend configuration to explicit origin strings (e.g. `allow_origins=["https://q-rakshak.health"]`) whenever `allow_credentials=True`.

---

### 7.2 Exception Handling vs. CORS Header Loss (The 500 Pitfall)

In FastAPI / Starlette, if an unhandled Python exception occurs inside a route handler (e.g. Database connection failure, PyTorch CUDA Out-of-Memory), default exception handling may return an unformatted `500 Internal Server Error` response **without CORS headers**. As a result, the browser displays a confusing CORS error instead of revealing the true 500 server error.

#### Production Solution: Global Exception Handler with CORS Preservation
Add this to `backend/app/main.py`:

```python
# backend/app/main.py (Global Exception Handler)
from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("qmed.api")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catches all unhandled exceptions and ensures CORS headers are preserved on 500 responses."""
    logger.error(f"Unhandled Exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    
    origin = request.headers.get("origin")
    allowed_origins = app.state.allowed_origins if hasattr(app.state, "allowed_origins") else ["*"]
    
    headers = {}
    if origin and (origin in allowed_origins or "*" in allowed_origins):
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Headers"] = "*"
        headers["Access-Control-Allow-Methods"] = "*"

    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error_type": exc.__class__.__name__,
            "detail": "Internal Server Error occurred during processing.",
            "path": request.url.path,
        },
        headers=headers,
    )
```

---

### 7.3 Diagnostic cURL Verification Scripts

Test and debug your CORS configuration directly from the command line without browser caching:

#### 1. Test Preflight `OPTIONS` Request:
```bash
curl -i -X OPTIONS https://api.q-rakshak.health/api/v1/clinical/diagnose \
  -H "Origin: https://q-rakshak.health" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization, Content-Type, X-API-Key"
```

**Expected Successful Preflight Response:**
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://q-rakshak.health
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Authorization, Content-Type, X-API-Key, Accept, Origin
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
Content-Length: 0
```

---

#### 2. Test Actual `POST` Request with Headers:
```bash
curl -i -X POST https://api.q-rakshak.health/api/v1/clinical/diagnose \
  -H "Origin: https://q-rakshak.health" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: qmed-master-api-key-2026" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{"disease":"breast_cancer","patient_id":"PT-89421","features":{}}'
```

**Expected Successful Actual Response:**
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://q-rakshak.health
Access-Control-Allow-Credentials: true
Content-Type: application/json

{
  "status": "success",
  "diagnosis": "malignant",
  "confidence": 0.942,
  "quantum_advantage_score": 1.18
}
```

---

## 8. Summary & Deployment Readiness Checklist

| Category | Component / Item | Verification Status | Action Required |
|---|---|---|---|
| **Structure** | `model/` service separation | Fully Specified | Move ML pipelines & weights to autonomous container |
| **Structure** | `backend/` core API separation | Fully Specified | Clean REST controllers without heavy CUDA runtime |
| **Structure** | `frontend/` client decoupling | Fully Specified | Single React 18 SPA with env-driven `src/api/config.js` |
| **Env** | Separate `.env` for `model/` | Fully Specified | Set `DEVICE`, `QUANTUM_BACKEND`, `MODEL_SERVICE_PORT=8001` |
| **Env** | Separate `.env` for `frontend/` | Fully Specified | Set `VITE_API_BASE_URL`, `VITE_API_KEY`, `VITE_EMERGENCY_PORTAL_BASE` |
| **Env** | Separate `.env` for `backend/` | Fully Specified | Set `DATABASE_URL`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS` |
| **Gitignore** | Tier-by-tier `.gitignore` | Fully Specified | Prevent `.pt` model weights, `.db` SQLite, and secrets from leaking |
| **CORS** | FastAPI CORS Middleware | Fully Specified | Configured with dynamic origins, credentials, and preflight max-age |
| **CORS** | Global Exception Handler | Fully Specified | Preserves CORS headers during internal 500 errors |
| **CORS** | Nginx Reverse Proxy Config | Fully Specified | Low-latency 204 preflight caching at proxy edge |
