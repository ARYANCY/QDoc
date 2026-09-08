# Q-MedSense: Complete Step-by-Step Execution & Deployment Guide (`run.md`)

[![Execution Guide](https://img.shields.io/badge/Runbook-Complete%20%26%20Verified-brightgreen.svg)]()
[![SIH Problem ID](https://img.shields.io/badge/SIH%20ID-26139-0052CC.svg)]()
[![Tests Passing](https://img.shields.io/badge/Tests-43%2F43%20Passing-brightgreen.svg)]()
[![Python](https://img.shields.io/badge/Python-3.10%20--%203.14-blue.svg)]()
[![React](https://img.shields.io/badge/React-18%20%2B%20Vite-61DAFB.svg)]()

This guide provides exhaustive, end-to-end instructions for launching, testing, and developing both the **Backend API & Quantum Engine** and the **Frontend Web Applications** of the **Q-MedSense** platform across Windows, macOS, and Linux environments.

---

## 📑 Table of Contents

1. [System Prerequisites & Runtimes](#1-system-prerequisites--runtimes)
2. [Service Architecture & Port Map](#2-service-architecture--port-map)
3. [Backend Execution Guide (FastAPI + Quantum Engine)](#3-backend-execution-guide-fastapi--quantum-engine)
   - [Step 1: Python Virtual Environment Setup](#step-1-python-virtual-environment-setup)
   - [Step 2: Install Dependencies](#step-2-install-dependencies)
   - [Step 3: Launching the Backend API (4 Methods)](#step-3-launching-the-backend-api-4-methods)
   - [Step 4: Verifying Backend Health](#step-4-verifying-backend-health)
4. [Frontend Execution Guide (React 18 + Vite)](#4-frontend-execution-guide-react-18--vite)
   - [Step 1: Primary Clinical Web Application (`frontend/`)](#step-1-primary-clinical-web-application-frontend)
   - [Step 2: Emergency Medical Card App (`card-frontend/`)](#step-2-emergency-medical-card-app-card-frontend)
   - [Step 3: Building for Production](#step-3-building-for-production)
5. [Running Full-Stack Simultaneously (Two-Terminal Workflow)](#5-running-full-stack-simultaneously-two-terminal-workflow)
6. [Docker & Containerized Deployment](#6-docker--containerized-deployment)
7. [Pre-Seeded Authority Personas & Test Credentials](#7-pre-seeded-authority-personas--test-credentials)
8. [Automated Verification & Test Suite (43 Tests)](#8-automated-verification--test-suite-43-tests)
9. [Comprehensive Troubleshooting Matrix](#9-comprehensive-troubleshooting-matrix)

---

## 1. System Prerequisites & Runtimes

Ensure your workstation has the following runtimes installed:

| Runtime / Tool | Minimum Version | Recommended Version | Verification Command |
| :--- | :---: | :---: | :--- |
| **Python** | `3.10.x` | `3.11.x` / `3.12.x` / `3.14.x` (64-bit) | `python --version` |
| **Node.js** | `v18.0.0` | `v20.x` LTS or higher | `node -v` |
| **npm** | `v9.0.0` | `v10.x` or higher | `npm -v` |
| **Git** | `2.30+` | Latest | `git --version` |
| **Docker** (Optional) | `24.0+` | Docker Desktop Latest | `docker --version` |

---

## 2. Service Architecture & Port Map

When running locally, the platform components bind to the following default network ports:

| Service Component | Port | Local URL | Description |
| :--- | :---: | :--- | :--- |
| **FastAPI Backend API** | `8000` | [http://127.0.0.1:8000](http://127.0.0.1:8000) | Core REST API, Quantum Simulator & SQLite Storage |
| **Interactive Swagger Docs** | `8000` | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Interactive OpenAPI 3.1 Swagger test UI |
| **ReDoc API Reference** | `8000` | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | Clean formatted API schema documentation |
| **Primary Clinical Frontend** | `5173` | [http://localhost:5173](http://localhost:5173) | Main React 18 UI (Clinician, Researcher, Admin, Patient) |
| **Emergency Medical Card HUD** | `5174` | [http://localhost:5174](http://localhost:5174) | Lightweight standalone Emergency QR Card Web App |

---

## 3. Backend Execution Guide (FastAPI + Quantum Engine)

### Step 1: Python Virtual Environment Setup

Open a terminal at the repository root (`doc/`):

#### On Windows (PowerShell):
```powershell
# If script execution is restricted, allow it for current process:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1
```

#### On Windows (Command Prompt `cmd.exe`):
```cmd
python -m venv .venv
.\.venv\Scripts\activate.bat
```

#### On Linux / macOS (Bash / Zsh):
```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### Using Anaconda / Miniconda:
```bash
conda create -n qmedsense python=3.11 -y
conda activate qmedsense
```

---

### Step 2: Install Dependencies

With the virtual environment activated, install all required Python packages:

```bash
# 1. Upgrade pip installer
python -m pip install --upgrade pip

# 2. Install all core backend, quantum, vision & test dependencies
pip install -r requirements.txt
```

*(Optional)* If you have an NVIDIA GPU with CUDA 12.x and want GPU acceleration for PyTorch:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126
```

---

### Step 3: Launching the Backend API (4 Methods)

Choose any of the following methods to start the backend:

#### Method A: Universal Root Launcher (Recommended — Fastest & Easiest)
```bash
python main.py
```
*Optional CLI Flags:*
```bash
# Run on specific port and host
python main.py --port 8000 --host 0.0.0.0

# Run in demo database mode
python main.py --mode demo

# Disable auto-reload for production benchmark testing
python main.py --no-reload --workers 2
```

#### Method B: One-Click PowerShell Script (Windows)
```powershell
.\start_backend.ps1
# Or run with demo database:
.\start_backend.ps1 demo
```

#### Method C: Direct Uvicorn CLI
```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Method D: Scoped from `backend/` Folder
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

### Step 4: Verifying Backend Health

Once started, test that the API is running:

1. **Browser Test:** Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) to access Swagger UI.
2. **Terminal Curl Test:**
   ```bash
   curl http://127.0.0.1:8000/
   ```
   *Expected JSON response:*
   ```json
   {
     "platform": "Q-MedSense",
     "version": "2.0.0",
     "sih_problem_id": "26139",
     "status": "online",
     "quantum_engine": "PennyLane + Qiskit Aer",
     "docs": "/docs"
   }
   ```

---

## 4. Frontend Execution Guide (React 18 + Vite)

### Step 1: Primary Clinical Web Application (`frontend/`)

Open a new terminal window at the repository root:

```bash
# 1. Navigate into the frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Launch Vite development server
npm run dev
```

- **Access URL:** [http://localhost:5173](http://localhost:5173)
- The Vite development server automatically proxies all `/api/*` network requests to `http://127.0.0.1:8000`.

---

### Step 2: Emergency Medical Card App (`card-frontend/`)

Open a separate terminal window if you wish to run the standalone Emergency Card HUD:

```bash
# 1. Navigate into the card-frontend directory
cd card-frontend

# 2. Install Node dependencies
npm install

# 3. Launch Vite development server
npm run dev
```

- **Access URL:** [http://localhost:5174](http://localhost:5174)
- **Direct Patient Card URL:** [http://localhost:5174/#emergency/PT-89421](http://localhost:5174/#emergency/PT-89421)

---

### Step 3: Building for Production

To create optimized production bundles:

```bash
# Build primary frontend:
cd frontend
npm run build
# Outputs to frontend/dist/

# Build card frontend:
cd ../card-frontend
npm run build
# Outputs to card-frontend/dist/
```

To preview the production build locally:
```bash
cd frontend
npm run preview
```

---

## 5. Running Full-Stack Simultaneously (Two-Terminal Workflow)

For regular daily development, open two side-by-side terminal windows:

```text
┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
│  TERMINAL 1: BACKEND API & QUANTUM ENGINE    │  TERMINAL 2: FRONTEND UI DEV SERVER          │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│  # From workspace root:                      │  # From workspace root:                      │
│  .\.venv\Scripts\Activate.ps1                │  cd frontend                                 │
│  python main.py                              │  npm run dev                                 │
│                                              │                                              │
│  Server: http://127.0.0.1:8000               │  App: http://localhost:5173                  │
│  Docs:   http://127.0.0.1:8000/docs          │  Proxy: /api -> http://127.0.0.1:8000        │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 6. Docker & Containerized Deployment

To launch the complete stack inside isolated Docker containers:

```bash
# Build and start all services (Backend + Frontend + Nginx):
docker-compose up --build

# Run in background (detached mode):
docker-compose up -d

# Stop containers:
docker-compose down
```

---

## 7. Pre-Seeded Authority Personas & Test Credentials

The database initializes automatically with 4 pre-configured personas across clinical and administrative roles:

| Persona | Role | Username | Password | Accessible Views & Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Alexander Reed** | `patient` | `alex.patient` | `patient123` | Autonomous Self-Analysis Cockpit, 2D Digital Twin, Early Detection, Emergency QR Card |
| **Dr. Aryan Sharma** | `clinician` | `dr.aryan` | `clinician123` | Diagnostic Cockpit, Multi-Organ Ingestion, Patient History, Clinical PDF Export |
| **Dr. Priya Nair** | `researcher` | `priya.qml` | `quantum123` | Live Retraining Studio, Hyperparameter Optimizer, Benchmark Matrix, Quantum Telemetry |
| **Security Admin** | `admin` | `admin.audit` | `admin123` | Compliance Console, User Management, Immutable WORM Audit Logs, DPDP Consent Manager |

> **1-Click Switching:** You can instantly switch between personas inside the web app by clicking the **User Profile Badge** in the sidebar or top header.

---

## 8. Automated Verification & Test Suite (43 Tests)

Run the full automated test suite to verify all backend endpoints, quantum circuits, database repositories, and security guards:

```bash
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run complete pytest test suite with verbose output
python -m pytest tests/ -v
```

### Targeted Test Commands:
```bash
# Test API endpoints and RBAC security:
python -m pytest tests/api/test_api_endpoints.py -v
python -m pytest tests/api/test_auth_security.py -v

# Test Doctor Consultations & WebRTC Soft-Locks:
python -m pytest tests/api/test_doctor_consultations.py -v

# Test Quantum Algorithms (VQC, QSVM, QNN, Parameter-Shift):
python -m pytest tests/unit/test_quantum_algorithms.py -v

# Test Multi-Modal Ingestion (HL7 FHIR & Genomic VCF):
python -m pytest tests/unit/test_early_detection_and_ingestion.py -v
```

---

## 9. Comprehensive Troubleshooting Matrix

| Issue Encountered | Root Cause | Exact Resolution Command |
| :--- | :--- | :--- |
| **`python main.py: command not found`** | Python not added to PATH or wrong working directory. | Ensure your terminal is in the project root directory (`doc/`) and run `python --version`. |
| **`UnauthorizedAccess / Script Execution Disabled`** | Windows PowerShell security policy blocks `.ps1` scripts. | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in PowerShell. |
| **`Port 8000 already in use`** | A lingering Python/Uvicorn process is holding port 8000. | In PowerShell: `netstat -ano \| findstr :8000`<br>Then: `taskkill /PID <PID> /F` |
| **`Port 5173 already in use`** | Another Vite dev server is running. | Vite will auto-switch to port 5174 or run `taskkill /IM node.exe /F` to stop old servers. |
| **`502 Bad Gateway / Network Error in UI`** | Frontend cannot reach backend at `127.0.0.1:8000`. | Ensure `python main.py` or `start_backend.ps1` is running in Terminal 1. |
| **`ModuleNotFoundError: No module named 'backend'`** | `PYTHONPATH` does not include repository root. | Run from the repository root, or start via `python main.py` which sets `sys.path` automatically. |
| **`sqlite3.OperationalError: database is locked`** | Concurrent connection conflict. | Fixed in database settings with `busy_timeout=30000` and `WAL` journal mode. Restart backend. |
| **`Database Reset to Clean State`** | Need to purge records and re-seed defaults. | Delete `backend/qmedsense.db` (or `qmedsense.db`) and restart `python main.py`. |

---

**© 2026 Q-MedSense Team. Smart India Hackathon (SIH Problem Statement ID 26139).**
