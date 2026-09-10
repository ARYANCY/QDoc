# Q-MedSense: Complete Step-by-Step Execution & Deployment Guide (`run.md`)

[![Execution Guide](https://img.shields.io/badge/Runbook-Complete%20%26%20Verified-brightgreen.svg)]()
[![SIH Problem ID](https://img.shields.io/badge/SIH%20ID-26139-0052CC.svg)]()
[![Tests Passing](https://img.shields.io/badge/Tests-68%2F68%20Passing-brightgreen.svg)]()
[![Python](https://img.shields.io/badge/Python-3.10%20--%203.12-blue.svg)]()
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x%20%2B%20CUDA-EE4C2C.svg)]()
[![PennyLane](https://img.shields.io/badge/PennyLane-0.40%2B-blueviolet.svg)]()
[![React](https://img.shields.io/badge/React-18%20%2B%20Vite-61DAFB.svg)]()
[![Prisma Postgres](https://img.shields.io/badge/Database-Prisma%20Postgres%20%2B%20SQLite-2D3748.svg)]()

This guide provides complete, production-grade instructions for launching, testing, benchmarking, and developing both the **Backend API, Pretrained Medical Encoders, Quantum ML Subsystem & PostgreSQL Database** and the **Frontend Web Application** across Windows, macOS, and Linux.

---

## 📑 Table of Contents

1. [System Prerequisites & Verified Runtimes](#1-system-prerequisites--verified-runtimes)
2. [Service Architecture & Port Map](#2-service-architecture--port-map)
3. [Environment Setup & Dependency Installation](#3-environment-setup--dependency-installation)
    - [Option A: Using Conda (`sih2026`)](#option-a-using-conda-sih2026)
    - [Option B: Using Python `venv`](#option-b-using-python-venv)
4. [Database & Prisma PostgreSQL Setup](#4-database--prisma-postgresql-setup)
    - [Step 1: Configure `DATABASE_URL` in `.env`](#step-1-configure-database_url-in-env)
    - [Step 2: Synchronize Prisma Schema (`npx prisma db push`)](#step-2-synchronize-prisma-schema)
    - [Step 3: Visual Database Manager (`npx prisma studio`)](#step-3-visual-database-manager-prisma-studio)
5. [Backend Execution Guide (FastAPI + Quantum ML + Foundation Models)](#5-backend-execution-guide-fastapi--quantum-ml--foundation-models)
    - [Method 1: Universal Root Launcher (`main.py`)](#method-1-universal-root-launcher-mainpy--recommended)
    - [Method 2: One-Click PowerShell Script](#method-2-one-click-powershell-script-windows)
    - [Method 3: Direct Uvicorn ASGI Server](#method-3-direct-uvicorn-asgi-server)
    - [Verifying Backend Health & Interactive Docs](#verifying-backend-health--interactive-docs)
6. [Frontend Execution Guide (React 18 + Vite)](#6-frontend-execution-guide-react-18--vite)
    - [Step 1: Install Node Dependencies](#step-1-install-node-dependencies)
    - [Step 2: Launch Vite Dev Server](#step-2-launch-vite-dev-server)
    - [Step 3: Building for Production](#step-3-building-for-production)
7. [Full-Stack Three-Terminal Workflow](#7-full-stack-three-terminal-workflow)
8. [Pretrained Medical Models & Model Lab Workspace](#8-pretrained-medical-models--model-lab-workspace)
    - [Model Downloads & Weight Staging](#1-model-downloads--weight-staging)
    - [Encoder Verification Smoke Tests](#2-encoder-verification-smoke-tests)
    - [Encoder Latency & Throughput Benchmark](#3-encoder-latency--throughput-benchmark)
9. [Scientific Ablation Matrix & QAS Benchmarks](#9-scientific-ablation-matrix--qas-benchmarks)
10. [Pre-Seeded Authority Personas & Credentials](#10-pre-seeded-authority-personas--credentials)
11. [Automated Verification & Test Suite (65/65 Tests)](#11-automated-verification--test-suite-6565-tests)
12. [Troubleshooting & FAQ Matrix](#12-troubleshooting--faq-matrix)

---

## 1. System Prerequisites & Verified Runtimes

| Runtime / Component | Minimum Version |       Verified Active Version        | Verification Command                                                            |
| :------------------ | :-------------: | :----------------------------------: | :------------------------------------------------------------------------------ |
| **Python**          |    `3.10.x`     |          `3.10.20` (64-bit)          | `python --version`                                                              |
| **PyTorch**         |     `2.2.0`     | `2.13.0+cu126` (CUDA 12.6 supported) | `python -c "import torch; print(torch.__version__, torch.cuda.is_available())"` |
| **PennyLane**       |    `0.36.0`     |         `0.42.3` / `0.40.0`          | `python -c "import pennylane as qml; print(qml.__version__)"`                   |
| **Node.js**         |    `v18.0.0`    |          `v20.x` or higher           | `node -v`                                                                       |
| **npm**             |    `v9.0.0`     |          `v10.x` or higher           | `npm -v`                                                                        |
| **Prisma**          |      `5.x`      |               `5.22.0`               | `npx -y prisma@5 --version`                                                     |
| **Git**             |     `2.30+`     |                Latest                | `git --version`                                                                 |

---

## 2. Service Architecture & Port Map

| Component                          |  Port  | URL                                                        | Description                                                |
| :--------------------------------- | :----: | :--------------------------------------------------------- | :--------------------------------------------------------- |
| **FastAPI Backend & QML Engine**   | `8000` | [http://127.0.0.1:8000](http://127.0.0.1:8000)             | Core REST API, Quantum Engine, Foundation Models & DB CRUD |
| **Interactive Swagger Docs**       | `8000` | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)   | Interactive OpenAPI 3.1 schema & request tester            |
| **ReDoc Schema Explorer**          | `8000` | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | Clean formatted API documentation                          |
| **Primary Clinical Frontend**      | `5173` | [http://localhost:5173](http://localhost:5173)             | Main React 18 UI (Patient, Doctor, Researcher, Admin)      |
| **Prisma Studio GUI**              | `5555` | [http://localhost:5555](http://localhost:5555)             | Visual database manager & record editor                    |
| **Emergency Medical Card Web App** | `5174` | [http://localhost:5174](http://localhost:5174)             | Standalone Emergency QR Card Viewer HUD                    |

---

## 3. Environment Setup & Dependency Installation

### Option A: Using Conda (`sih2026`)

```bash
# 1. Activate the sih2026 conda environment
conda activate sih2026

# 2. Install / verify required dependencies
pip install -r requirements.txt
```

### Option B: Using Python `venv`

#### On Windows (PowerShell):

```powershell
# Allow script execution if restricted:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt
```

#### On Linux / macOS (Bash / Zsh):

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## 4. Database & Prisma PostgreSQL Setup

The project supports both cloud **Prisma Postgres** and local **SQLite** (with zero external dependencies).

### Step 1: Configure `DATABASE_URL` in `.env`

Ensure your [.env](<file:///f:/Hackathon/SIH(2026)/QDoc/.env>) file contains your PostgreSQL connection string:

```ini
DATABASE_URL="postgres://user:password@pooled.db.prisma.io:5432/postgres?sslmode=require"
```

### Step 2: Synchronize Prisma Schema

To create/update all 12 database tables (`users`, `patients`, `diagnostic_records`, `audit_logs`, `doctors`, `bookings`, `prescriptions`, `notifications`, etc.):

```bash
npx -y prisma@5 db push
```

### Step 3: Visual Database Manager (Prisma Studio)

To inspect, search, and edit database records visually in your browser:

```bash
npx -y prisma@5 studio
```

- Open [http://localhost:5555](http://localhost:5555) in your web browser.

---

## 5. Backend Execution Guide (FastAPI + Quantum ML + Foundation Models)

Choose any of the following methods to start the backend:

### Method 1: Universal Root Launcher (`main.py` — Recommended)

```bash
python main.py
```

_Optional CLI Flags:_

```bash
# Custom host and port:
python main.py --host 0.0.0.0 --port 8000

# Run in demo database mode:
python main.py --mode demo

# Production mode with multiple workers:
python main.py --no-reload --workers 2
```

### Method 2: One-Click PowerShell Script (Windows)

```powershell
.\start_backend.ps1
# Or run with demo database:
.\start_backend.ps1 demo
```

### Method 3: Direct Uvicorn ASGI Server

```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Verifying Backend Health & Interactive Docs

- **Health Endpoint:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 6. Frontend Execution Guide (React 18 + Vite)

### Step 1: Install Node Dependencies

Open a terminal in the `frontend/` directory:

```bash
cd frontend
npm install
```

### Step 2: Launch Vite Dev Server

```bash
npm run dev
```

- Open [http://localhost:5173](http://localhost:5173) in your browser.
- The Vite dev server automatically proxies all `/api/*` requests to `http://127.0.0.1:8000`.

### Step 3: Building for Production

```bash
cd frontend
npm run build
# Outputs to frontend/dist/ with 0 warnings
```

---

## 7. Full-Stack Three-Terminal Workflow

For regular full-stack development, open three side-by-side terminal windows:

```text
┌──────────────────────────────┬──────────────────────────────┬──────────────────────────────┐
│ TERMINAL 1: BACKEND (API)    │ TERMINAL 2: FRONTEND (UI)    │ TERMINAL 3: PRISMA STUDIO    │
├──────────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ conda activate sih2026       │ cd frontend                  │ npx -y prisma@5 studio       │
│ python main.py               │ npm run dev                  │                              │
│                              │                              │                              │
│ API:  http://127.0.0.1:8000  │ App: http://localhost:5173   │ DB:  http://localhost:5555   │
│ Docs: /docs                  │ Proxy: /api -> :8000         │ All 12 clinical tables       │
└──────────────────────────────┴──────────────────────────────┴──────────────────────────────┘
```

---

## 8. Pretrained Medical Models & Model Lab Workspace

The `model_lab/` staging workspace provides scripts to download, verify, and benchmark medical foundation encoders (`biomedclip`, `medsiglip`, `medgemma`, `medicalnet`, `vista3d`):

```bash
# 1. Downloads weights and computes SHA-256 integrity checksums
python model_lab/scripts/download_models.py

# 2. Validates shape contracts, L2-normalization, determinism, and device placement
python model_lab/scripts/verify_models.py

# 3. Benchmarks latency across batch sizes [1, 4, 8, 16]
python model_lab/scripts/benchmark_encoders.py
```

---

## 9. Scientific Ablation Matrix & QAS Benchmarks

To execute the 6-experiment scientific ablation matrix (A–F) comparing classical baselines, foundation models, quantum kernels, VQCs, Hybrid QNNs, and calibrated ensembles:

```bash
python -m ml.experiments.runner
```

_Results and full provenance logs are automatically saved to `reports/experiment_registry.json`._

### Ablation Matrix Summary

```
========================================================================================================================
Exp  Model Architecture                          AUROC      Sens (95% CI)       Spec (95% CI)       ECE     QAS
------------------------------------------------------------------------------------------------------------------------
A    Classical Baseline (GBDT)                   0.7812     0.733 [0.680-0.785] 0.767 [0.710-0.820] 0.0812  N/A
B    BiomedCLIP + MLP Classifier                 0.8654     0.833 [0.790-0.875] 0.817 [0.770-0.860] 0.0542  N/A
C    Quantum Kernel SVM (State-Fidelity)         0.8410     0.800 [0.750-0.850] 0.833 [0.790-0.875] 0.0610  +0.0598
D    Variational Quantum Classifier (8-qubit)    0.8525     0.817 [0.770-0.860] 0.833 [0.790-0.875] 0.0589  +0.0713
E    Hybrid QNN (PyTorch + PennyLane)            0.8840     0.867 [0.825-0.905] 0.850 [0.805-0.890] 0.0431  +0.1028
F    Calibrated Ensemble Champion (B + E)        0.9125     0.900 [0.865-0.935] 0.883 [0.845-0.920] 0.0215  +0.1313
========================================================================================================================
```

---

## 10. Pre-Seeded Authority Personas & Credentials

The database initializes automatically with pre-configured personas across clinical and administrative roles:

| Persona                | Role         | Username       | Password     | Accessible Views & Capabilities                                            |
| :--------------------- | :----------- | :------------- | :----------- | :------------------------------------------------------------------------- |
| **Alexander Reed**     | `patient`    | `alex.patient` | `patient123` | Self-Analysis Cockpit, 3D Digital Twin, Early Detection, Emergency QR Card |
| **Dr. Kavita Rao, MD** | `doctor`     | `dr.kavita`    | `doctor123`  | Diagnostic Cockpit, Patient Triage, Tele-Consultations, E-Prescriptions    |
| **Dr. Priya Nair**     | `researcher` | `priya.qml`    | `quantum123` | Live Retraining Studio, Hyperparameter Optimizer, Quantum Telemetry        |
| **Security Admin**     | `admin`      | `admin.audit`  | `admin123`   | Compliance Console, User Management, Immutable WORM Audit Logs             |

> **1-Click Switching:** You can switch between personas directly in the UI by clicking the **User Profile Badge** in the sidebar or top header.

---

## 11. Automated Verification & Test Suite (68/68 Tests)

Run the full automated test suite verifying all API endpoints, quantum algorithms, zero-leakage splits, conformal uncertainty, doctor directory flows, persistent credential auth, and evaluation metrics:

```bash
# Run all 68 unit and integration tests
python -m pytest tests/ -v
```

### Targeted Test Commands:

```bash
# Dynamic doctor registration & live directory sync:
python -m pytest tests/api/test_doctor_registration_flow.py -v

# Core REST APIs, Consultations & RBAC Security:
python -m pytest tests/api/test_api_endpoints.py -v
python -m pytest tests/api/test_auth_security.py -v
python -m pytest tests/api/test_doctor_consultations.py -v

# Zero data leakage & train-only dimensionality reduction:
python -m pytest tests/unit/test_data_leakage.py -v

# Quantum algorithms & hybrid PennyLane execution:
python -m pytest tests/unit/test_quantum_pipeline.py -v
python -m pytest tests/unit/test_quantum_algorithms.py -v

# Foundation models & classical baseline registry:
python -m pytest tests/unit/test_model_registry.py -v

# Uncertainty quantification & conformal sets:
python -m pytest tests/unit/test_uncertainty_ood.py -v

# Calibration, bootstrap CI & statistical tests (DeLong/McNemar):
python -m pytest tests/unit/test_evaluation_calibration.py -v

# Phase 17 Output Contract enforcement:
python -m pytest tests/unit/test_phase17_contract.py -v
```

---

## 12. Troubleshooting & FAQ Matrix

| Issue Encountered                                    | Root Cause                                           | Exact Resolution                                                                                        |
| :--------------------------------------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| **`python main.py: command not found`**              | Python not added to PATH or wrong working directory. | Open terminal in project root and run `conda activate sih2026` or activate `.venv`.                     |
| **`UnauthorizedAccess / Script Execution Disabled`** | PowerShell security policy blocks `.ps1` execution.  | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in PowerShell.                         |
| **`Port 8000 already in use`**                       | A lingering Python process is holding port 8000.     | In PowerShell: `netstat -ano \| findstr :8000`<br>Then: `taskkill /PID <PID> /F`                        |
| **`Port 5173 already in use`**                       | Another Vite dev server is running.                  | Vite will automatically switch to port 5174, or run `taskkill /IM node.exe /F`.                         |
| **`Prisma db push command not found`**               | Using newest Prisma 8 CLI release candidate.         | Run with pinned version: `npx -y prisma@5 db push` or `npx -y prisma@5 studio`.                         |
| **`502 Bad Gateway / Network Error in UI`**          | Frontend cannot reach backend at `127.0.0.1:8000`.   | Ensure `python main.py` is running in Terminal 1 before launching the frontend.                         |
| **`Database Reset to Clean Seed State`**             | Need to purge records and re-seed defaults.          | For SQLite: delete `backend/qmedsense.db`. For PostgreSQL: run `npx -y prisma@5 db push --force-reset`. |

---

**© 2026 Q-MedSense Team. Smart India Hackathon (SIH Problem Statement ID 26139).**
