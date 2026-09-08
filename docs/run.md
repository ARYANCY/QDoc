# Q-MedSense: Complete Step-by-Step Execution & Deployment Guide (`run.md`)

[![Execution Guide](https://img.shields.io/badge/Runbook-Complete%20%26%20Verified-brightgreen.svg)]()
[![SIH Problem ID](https://img.shields.io/badge/SIH%20ID-26139-0052CC.svg)]()
[![Tests Passing](https://img.shields.io/badge/Tests-65%2F65%20Passing-brightgreen.svg)]()
[![Python](https://img.shields.io/badge/Python-3.10%20--%203.12-blue.svg)]()
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x%20%2B%20CUDA-EE4C2C.svg)]()
[![PennyLane](https://img.shields.io/badge/PennyLane-0.40%2B-blueviolet.svg)]()
[![React](https://img.shields.io/badge/React-18%20%2B%20Vite-61DAFB.svg)]()

This guide provides complete, production-grade instructions for launching, testing, benchmarking, and developing both the **Backend API, Pretrained Medical Encoders & Quantum ML Subsystem** and the **Frontend Web Application** across Windows, macOS, and Linux.

---

## 📑 Table of Contents

1. [System Prerequisites & Verified Runtimes](#1-system-prerequisites--verified-runtimes)
2. [Service Architecture & Port Map](#2-service-architecture--port-map)
3. [Environment Setup & Dependency Installation](#3-environment-setup--dependency-installation)
   - [Option A: Using Conda (`sih2026`)](#option-a-using-conda-sih2026)
   - [Option B: Using Python `venv`](#option-b-using-python-venv)
4. [Backend Execution Guide (FastAPI + Quantum ML + Foundation Models)](#4-backend-execution-guide-fastapi--quantum-ml--foundation-models)
   - [Method 1: Universal Root Launcher (`main.py`)](#method-1-universal-root-launcher-mainpy--recommended)
   - [Method 2: One-Click PowerShell Script](#method-2-one-click-powershell-script-windows)
   - [Method 3: Direct Uvicorn ASGI Server](#method-3-direct-uvicorn-asgi-server)
   - [Verifying Backend Health & Interactive Docs](#verifying-backend-health--interactive-docs)
5. [Frontend Execution Guide (React 18 + Vite)](#5-frontend-execution-guide-react-18--vite)
   - [Step 1: Install Node Dependencies](#step-1-install-node-dependencies)
   - [Step 2: Launch Vite Dev Server](#step-2-launch-vite-dev-server)
   - [Step 3: Building for Production](#step-3-building-for-production)
6. [Full-Stack Two-Terminal Workflow](#6-full-stack-two-terminal-workflow)
7. [Pretrained Medical Models & Model Lab Workspace](#7-pretrained-medical-models--model-lab-workspace)
   - [Model Downloads & Weight Staging](#1-model-downloads--weight-staging)
   - [Encoder Verification Smoke Tests](#2-encoder-verification-smoke-tests)
   - [Encoder Latency & Throughput Benchmark](#3-encoder-latency--throughput-benchmark)
8. [Scientific Ablation Matrix & QAS Benchmarks](#8-scientific-ablation-matrix--qas-benchmarks)
9. [Pre-Seeded Authority Personas & Credentials](#9-pre-seeded-authority-personas--credentials)
10. [Automated Verification & Test Suite (65/65 Tests)](#10-automated-verification--test-suite-6565-tests)
11. [Troubleshooting & FAQ Matrix](#11-troubleshooting--faq-matrix)

---

## 1. System Prerequisites & Verified Runtimes

| Runtime / Component | Minimum Version | Verified Active Version | Verification Command |
| :--- | :---: | :---: | :--- |
| **Python** | `3.10.x` | `3.10.20` (64-bit) | `python --version` |
| **PyTorch** | `2.2.0` | `2.13.0+cu126` (CUDA 12.6 supported) | `python -c "import torch; print(torch.__version__, torch.cuda.is_available())"` |
| **PennyLane** | `0.36.0` | `0.42.3` / `0.40.0` | `python -c "import pennylane as qml; print(qml.__version__)"` |
| **Node.js** | `v18.0.0` | `v20.x` or higher | `node -v` |
| **npm** | `v9.0.0` | `v10.x` or higher | `npm -v` |
| **Git** | `2.30+` | Latest | `git --version` |

---

## 2. Service Architecture & Port Map

| Component | Port | URL | Description |
| :--- | :---: | :--- | :--- |
| **FastAPI Backend & QML Engine** | `8000` | [http://127.0.0.1:8000](http://127.0.0.1:8000) | Core REST API, Quantum Engine, Foundation Model Registry & SQLite |
| **Interactive Swagger Docs** | `8000` | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Interactive OpenAPI 3.1 schema & request tester |
| **ReDoc Schema Explorer** | `8000` | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | Clean formatted API documentation |
| **Primary Clinical Frontend** | `5173` | [http://localhost:5173](http://localhost:5173) | Main React 18 UI (Patient, Clinician, Researcher, Admin) |
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

#### On Linux / macOS (Bash / Zsh):
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## 4. Backend Execution Guide (FastAPI + Quantum ML + Foundation Models)

Choose any of the following methods to start the backend:

### Method 1: Universal Root Launcher (`main.py` — Recommended)
```bash
python main.py
```
*Optional CLI Flags:*
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

---

## 5. Frontend Execution Guide (React 18 + Vite)

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

---

## 6. Full-Stack Two-Terminal Workflow

```text
┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
│  TERMINAL 1: BACKEND + QUANTUM ML            │  TERMINAL 2: FRONTEND UI (VITE)              │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│  conda activate sih2026                      │  cd frontend                                 │
│  python main.py                              │  npm run dev                                 │
│                                              │                                              │
│  API:  http://127.0.0.1:8000                 │  App:   http://localhost:5173                │
│  Docs: http://127.0.0.1:8000/docs            │  Proxy: /api -> http://127.0.0.1:8000        │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 7. Pretrained Medical Models & Model Lab Workspace

```bash
# Downloads weights and computes SHA-256 integrity checksums
python model_lab/scripts/download_models.py

# Validates shape contracts, L2-normalization, determinism, and device placement
python model_lab/scripts/verify_models.py

# Benchmarks latency across batch sizes [1, 4, 8, 16]
python model_lab/scripts/benchmark_encoders.py
```

---

## 8. Scientific Ablation Matrix & QAS Benchmarks

```bash
python -m ml.experiments.runner
```
*Results and full provenance logs are automatically saved to `reports/experiment_registry.json`.*

---

## 9. Pre-Seeded Authority Personas & Credentials

| Persona | Role | Username | Password | Accessible Views & Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Alexander Reed** | `patient` | `alex.patient` | `patient123` | Autonomous Self-Analysis Cockpit, 2D Digital Twin, Early Detection, Emergency QR Card |
| **Dr. Aryan Sharma** | `clinician` | `dr.aryan` | `clinician123` | Diagnostic Cockpit, Multi-Organ Ingestion, Patient History, Clinical PDF Export |
| **Dr. Priya Nair** | `researcher` | `priya.qml` | `quantum123` | Live Retraining Studio, Hyperparameter Optimizer, Benchmark Matrix, Quantum Telemetry |
| **Security Admin** | `admin` | `admin.audit` | `admin123` | Compliance Console, User Management, Immutable WORM Audit Logs, DPDP Consent Manager |

---

## 10. Automated Verification & Test Suite (65/65 Tests)

```bash
# Run all 65 unit and integration tests
python -m pytest tests/ -v
```

---

**© 2026 Q-MedSense Team. Smart India Hackathon (SIH Problem Statement ID 26139).**
