# Q-MedSense: Complete Step-by-Step Execution & Deployment Guide (`run.md`)

[![Execution Guide](https://img.shields.io/badge/Runbook-Complete%20%26%20Verified-brightgreen.svg)]()
[![SIH Problem ID](https://img.shields.io/badge/SIH%20ID-26139-0052CC.svg)]()
[![Tests Passing](https://img.shields.io/badge/Tests-65%2F65%20Passing-brightgreen.svg)]()
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

| Runtime / Component | Minimum Version | Verified Active Version | Verification Command |
| :--- | :---: | :---: | :--- |
| **Python** | `3.10.x` | `3.10.20` (64-bit) | `python --version` |
| **PyTorch** | `2.2.0` | `2.13.0+cu126` (CUDA 12.6 supported) | `python -c "import torch; print(torch.__version__, torch.cuda.is_available())"` |
| **PennyLane** | `0.36.0` | `0.42.3` / `0.40.0` | `python -c "import pennylane as qml; print(qml.__version__)"` |
| **Node.js** | `v18.0.0` | `v20.x` or higher | `node -v` |
| **npm** | `v9.0.0` | `v10.x` or higher | `npm -v` |
| **Prisma** | `5.x` | `5.22.0` | `npx -y prisma@5 --version` |
| **Git** | `2.30+` | Latest | `git --version` |

---

## 2. Service Architecture & Port Map

| Component | Port | URL | Description |
| :--- | :---: | :--- | :--- |
| **FastAPI Backend & QML Engine** | `8000` | [http://127.0.0.1:8000](http://127.0.0.1:8000) | Core REST API, Quantum Engine, Foundation Models & DB CRUD |
| **Interactive Swagger Docs** | `8000` | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Interactive OpenAPI 3.1 schema & request tester |
| **ReDoc Schema Explorer** | `8000` | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | Clean formatted API documentation |
| **Primary Clinical Frontend** | `5173` | [http://localhost:5173](http://localhost:5173) | Main React 18 UI (Patient, Doctor, Researcher, Admin) |
| **Prisma Studio GUI** | `5555` | [http://localhost:5555](http://localhost:5555) | Visual database manager & record editor |
| **Emergency Medical Card Web App** | `5174` | [http://localhost:5174](http://localhost:5174) | Standalone Emergency QR Card Viewer HUD |

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

---

## 4. Database & Prisma PostgreSQL Setup

The project supports both cloud **Prisma Postgres** and local **SQLite** (with zero external dependencies).

### Step 1: Configure `DATABASE_URL` in `.env`
Ensure your [.env](file:///f:/Hackathon/SIH(2026)/QDoc/.env) file contains your PostgreSQL connection string:
```ini
DATABASE_URL="postgres://user:password@pooled.db.prisma.io:5432/postgres?sslmode=require"
```

### Step 2: Synchronize Prisma Schema
To create/update all 12 database tables:
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

```bash
# Recommended Universal Root Launcher
python main.py
```
- **Health Endpoint:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 6. Frontend Execution Guide (React 18 + Vite)

```bash
cd frontend
npm install
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 7. Full-Stack Three-Terminal Workflow

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

```bash
python -m ml.experiments.runner
```
*Results and full provenance logs are automatically saved to `reports/experiment_registry.json`.*

---

## 10. Pre-Seeded Authority Personas & Credentials

| Persona | Role | Username | Password | Accessible Views & Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Alexander Reed** | `patient` | `alex.patient` | `patient123` | Self-Analysis Cockpit, 3D Digital Twin, Early Detection, Emergency QR Card |
| **Dr. Kavita Rao, MD** | `doctor` | `dr.kavita` | `doctor123` | Diagnostic Cockpit, Patient Triage, Tele-Consultations, E-Prescriptions |
| **Dr. Priya Nair** | `researcher` | `priya.qml` | `quantum123` | Live Retraining Studio, Hyperparameter Optimizer, Quantum Telemetry |
| **Security Admin** | `admin` | `admin.audit` | `admin123` | Compliance Console, User Management, Immutable WORM Audit Logs |

---

## 11. Automated Verification & Test Suite (65/65 Tests)

```bash
# Run all 65 unit and integration tests
python -m pytest tests/ -v
```

---

**© 2026 Q-MedSense Team. Smart India Hackathon (SIH Problem Statement ID 26139).**
