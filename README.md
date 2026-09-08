# Q-MedSense: Hybrid Quantum Machine Learning Clinical Decision Support Platform

[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.13%20%7C%203.14-3776AB.svg?logo=python&logoColor=white)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)]()
[![PennyLane](https://img.shields.io/badge/PennyLane-0.36+-blueviolet.svg?logo=quantum-computing)]()
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2+-EE4C2C.svg?logo=pytorch&logoColor=white)]()
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=black)]()
[![Tests](https://img.shields.io/badge/Tests-43%2F43%20Passed-brightgreen.svg)]()
[![SIH Problem Statement](https://img.shields.io/badge/SIH%20ID-26139-0052CC.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

> **Smart India Hackathon (SIH) Problem Statement ID 26139**  
> *Theme:* MedTech / BioTech / Quantum Computing in Healthcare  
> *Platform:* Q-MedSense Quantum Clinical Operating System

---

## 📑 Table of Contents

1. [Overview & Problem Statement](#-overview--problem-statement)
2. [System Architecture](#-system-architecture)
3. [Repository Structure](#-repository-structure)
4. [Quickstart & Execution Guide](#-quickstart--execution-guide)
   - [Method 1: Direct Python Entrypoint (`python main.py`)](#method-1-direct-python-entrypoint-fastest)
   - [Method 2: One-Click PowerShell Scripts](#method-2-one-click-powershell-scripts-windows)
   - [Method 3: Standard Manual CLI Setup](#method-3-standard-manual-cli-setup)
   - [Method 4: Docker Compose](#method-4-docker-compose)
5. [Pre-Seeded Authority Personas (RBAC)](#-pre-seeded-authority-personas-rbac)
6. [Quantum Machine Learning Models & Engines](#-quantum-machine-learning-models--engines)
7. [Automated Verification & Testing](#-automated-verification--testing)
8. [Git & Repository Configuration](#-git--repository-configuration)
9. [Troubleshooting & FAQ](#-troubleshooting--faq)
10. [Documentation Index](#-documentation-index)

---

## 🔬 Overview & Problem Statement

Modern healthcare diagnostic pipelines face exponential increases in high-dimensional multi-modal clinical data (genomic variants, radiomics, micro-cellular dermoscopy, and electronic health records). Classical deep neural networks often suffer from the curse of dimensionality, catastrophic vanishing gradients in deep feature spaces, and opaque "black-box" decision architectures.

**Q-MedSense** solves this by bridging **Variational Quantum Classifiers (VQC)**, **Quantum Support Vector Machines (QSVM)**, and **Quantum Neural Networks (QNN)** with real-time perturbation explainability (SHAP / Grad-CAM) and an interactive **2D/3D Physiological Digital Twin**.

### Key Architectural Highlights
- ⚛️ **Hybrid Quantum-Classical Execution:** Evaluates clinical samples via PennyLane statevector simulations (`default.qubit`) and compares results against classical baselines (DenseNet-121, Random Forest, Logistic Regression, MLP).
- 🔐 **Dynamic Role-Based Access Control (RBAC):** Automatically adapts navigation menus and access privileges to the authenticated persona (*Clinician*, *Researcher*, *Admin*, *Patient*).
- 📊 **Zero Default Metric Enforcement:** Strictly initializes unanalyzed clinical views at `0%` / `0.00` / `Unanalyzed` with zero hardcoded dummy placeholders.
- 🗄️ **Persistent SQLite Engine (`qmedsense.db`):** Stores clinical records, patient profiles, diagnostic histories, and WORM-compliant tamper-evident audit logs with SHA-256 digital signatures.
- ♿ **WCAG 2.1 AA Compliant Clinical UI:** High-contrast, dense single-screen desktop interface with dyslexia font toggles, reduced motion modes, and zero-border-radius aesthetics.

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             REACT 18 FRONTEND (Vite)                             │
│   ┌───────────────────────┬────────────────────────┬─────────────────────────┐   │
│   │ Clinician Cockpit     │ Researcher Studio      │ Patient Twin & Emergency│   │
│   │ • Biomarker Ingestion │ • Hyperparameter Tuning│ • Physiological Digital │   │
│   │ • QML Inference View  │ • Quantum Telemetry    │   Twin Visualization    │   │
│   └───────────────────────┴────────────────────────┴─────────────────────────┘   │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ REST API / WebSockets
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                      FASTAPI APPLICATION SERVER (main.py)                        │
│   ┌────────────────────────┬────────────────────────┬────────────────────────┐   │
│   │  Auth & RBAC Guards    │ Diagnostic Endpoints   │ Compliance & Audit     │   │
│   │  • JWT Security        │ • Skin Cancer QNN      │ • WORM SHA-256 Trail   │   │
│   │  • Role Authorization  │ • Pneumonia Vision QML │ • DPDP 2023 Consent    │   │
│   └────────────────────────┴────────────────────────┴────────────────────────┘   │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
               ┌─────────────────────────┴─────────────────────────┐
               ▼                                                   ▼
┌───────────────────────────────┐               ┌──────────────────────────────────┐
│     QUANTUM ENGINE (ml/)      │               │       PERSISTENCE & DATA         │
│ • PennyLane Statevector Engine│               │ • SQLite 3 Database              │
│ • Angle / Amplitude Embedding │               │ • Model Registry (models/*.json) │
│ • VQC, QSVM, Hybrid QNNs      │               │ • WORM Audit Event Logs          │
│ • PyTorch Classical Backbones │               │ • HL7 FHIR & VCF Parsers         │
└───────────────────────────────┘               └──────────────────────────────────┘
```

---

## 📁 Repository Structure

```text
doc/
├── main.py                         # Universal FastAPI application entry point
├── requirements.txt                # Root Python dependencies specification
├── pyproject.toml                  # Project build & tool configuration
├── pytest.ini                      # Pytest runner configuration
├── .gitignore                      # Git exclusion rules (safeguarding weights & secrets)
├── .env.example                    # Environment variable template
├── docker-compose.yml              # Multi-container orchestration
│
├── backend/                        # Backend Application Source
│   ├── requirements.txt            # Scoped backend requirements
│   ├── qmedsense.db                # Production SQLite database (created on launch)
│   └── app/
│       ├── main.py                 # FastAPI application instance & router registry
│       ├── core/                   # Security, config, logging, QR service
│       ├── db/                     # SQLite database connection & seed repositories
│       └── features/               # Feature controllers (auth, clinical, qml, etc.)
│
├── frontend/                       # Primary React 18 Web Application
│   ├── package.json                # Frontend npm dependencies & scripts
│   ├── vite.config.js              # Vite bundler & reverse proxy config
│   └── src/                        # React components, stores, and styles
│
├── card-frontend/                  # Lightweight Emergency Medical Card App
│   ├── package.json
│   └── src/
│
├── ml/                             # Quantum & Classical ML Engine
│   ├── quantum_engine/             # VQC, QSVM, QNN, benchmarks, and baselines
│   ├── skin_cancer/                # HAM10000 hybrid QNN pipeline & Grad-CAM
│   ├── pneumonia/                  # Chest X-ray hybrid quantum vision pipeline
│   ├── digital_twin/               # Physiological twin mathematical models
│   └── explainability/             # Quantum perturbation SHAP attribution
│
├── models/                         # Model Registry & Trained Configurations
│   ├── registry.json               # Master model catalog & performance index
│   ├── skin_cancer/                # Skin cancer QML model metadata & configs
│   └── pneumonia/                  # Pneumonia QML model metadata & configs
│
├── docs/                           # Architecture Specifications & Runbooks
│   ├── architecture/srs.md         # IEEE 830 / ISO 29148 System Requirements
│   ├── guides/run.md               # Detailed execution & troubleshooting guide
│   └── plans/                      # Detailed ML engineering implementation plans
│
├── scripts/                        # Automated environment & startup scripts
│   ├── setup_env.ps1               # Automated venv creation and package installer
│   ├── start_backend.ps1           # Backend launcher
│   └── start_frontend.ps1          # Frontend launcher
│
└── tests/                          # Automated Pytest Test Suite
    ├── conftest.py                 # Pytest fixtures and mock client
    ├── api/                        # API endpoint & RBAC integration tests
    └── unit/                       # Quantum circuit & preprocessing unit tests
```

---

## 🚀 Quickstart & Execution Guide

### Method 1: Direct Python Entrypoint (Fastest)

Run the universal entrypoint directly from the project root:

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the API server
python main.py
```

Optional CLI parameters:
```bash
python main.py --port 8000 --host 0.0.0.0 --mode production
# Or run with demo database:
python main.py --mode demo
```

---

### Method 2: One-Click PowerShell Scripts (Windows)

Open two PowerShell terminals in the workspace root:

```powershell
# Terminal 1: Backend API & Quantum Simulator
.\start_backend.ps1

# Terminal 2: React Frontend UI
.\start_frontend.ps1
```

---

### Method 3: Standard Manual CLI Setup

#### 1. Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv

# Windows:
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Launch API server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc API Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Method 4: Docker Compose

```bash
docker-compose up --build
```

---

## 👥 Pre-Seeded Authority Personas (RBAC)

Switch between personas in 1-click via the user badge or login endpoint:

| Persona | Username | Default Password | Role | Primary Workspace & Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Alexander Reed** | `alex.patient` | `patient123` | `patient` | Patient Cockpit, 2D Digital Twin, Early Detection, Emergency QR Card |
| **Dr. Priya Nair** | `priya.qml` | `quantum123` | `researcher` | Live Retraining Studio, Hyperparameter Optimizer, Benchmark Matrix |
| **Security Admin** | `admin.audit` | `admin123` | `admin` | Compliance Console, User Management, DPDP Consent, WORM Audit Logs |

---

## ⚛️ Quantum Machine Learning Models & Engines

| Model | Modality | Quantum Architecture | Entanglement / Encoding | Accuracy / Macro F1 |
| :--- | :--- | :--- | :--- | :--- |
| **Q-Skin-Vortex** | Dermoscopy (HAM10000) | 8-Qubit Strongly Entangling QNN | Angle Embedding + CNOT Mesh | **89.4% / 0.88** |
| **QuantumDerma-X** | Dermoscopy (HAM10000) | 6-Qubit Hardware-Efficient Ansatz | Rotational Layers + Ring CNOT | **88.1% / 0.86** |
| **VitaQ-Derm** | Dermoscopy (HAM10000) | 4-Qubit Lightweight QNN | Angle Embedding + Linear Entangler | **85.7% / 0.84** |
| **QuantumPneu** | Chest X-Ray (Radiomics) | Hybrid ResNet + 4-Qubit Variational QNN | Amplitude Encoding + Parameter-Shift | **91.2% / 0.90** |
| **WDBC Classifier** | Multi-Omics / Biomarkers | Variational Quantum Classifier (VQC) | Angle Embedding + Parameter-Shift | **96.5% / 0.96** |

---

## 🧪 Automated Verification & Testing

Execute the complete test suite (43 unit, API, RBAC, and quantum algorithm tests):

```bash
# Run all tests with verbose output
python -m pytest tests/ -v
```

Build and validate the production React bundle:

```bash
cd frontend
npm run build
```

---

## 📦 Git & Repository Configuration

### Git Ignore Architecture
The `.gitignore` is specifically tailored for AI/ML projects:
- **Binary Model Weights Excluded:** Binary model files (`*.pt`, `*.pth`, `*.pkl`, `*.onnx`) are excluded from version control to prevent repository bloat and GitHub 100MB file limit errors.
- **Model Metadata Tracked:** All architecture definitions, labels, hyperparameters, and benchmark metrics (`models/**/*.json`) are fully tracked in Git.
- **Local Databases Excluded:** SQLite databases (`qmedsense.db`) are generated automatically on first startup and excluded from Git.
- **Secrets Excluded:** `.env` and secret key files are ignored, while `.env.example` serves as the public configuration template.

---

## ❓ Troubleshooting & FAQ

### 1. `main.py` Missing Error
A root `main.py` is provided as the universal entrypoint. You can run the application directly from the root with:
```bash
python main.py
```
Or start the ASGI server explicitly with:
```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Missing Python Packages after `git clone` or `git push`
Ensure you have activated your virtual environment and installed all dependencies:
```bash
pip install -r requirements.txt
```

### 3. Port 8000 or 5173 Already in Use
```powershell
# Windows: Find process listening on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### 4. Database Reset
To reset the database to factory default seeds:
1. Delete `backend/qmedsense.db` (or `qmedsense.db` if present).
2. Restart `python main.py` or `.\start_backend.ps1`. The database schema and seed records will be re-initialized automatically.

---

## 📚 Documentation Index

- 🚀 [Complete Execution Guide (`docs/guides/run.md`)](docs/guides/run.md)
- 🏗️ [IEEE 830 / ISO 29148 System Requirements Specification (`docs/architecture/srs.md`)](docs/architecture/srs.md)
- 🔬 [Skin Cancer QML Implementation Plan (`docs/plans/SKIN_CANCER_QML_COMPLETE_IMPLEMENTATION.md`)](docs/plans/SKIN_CANCER_QML_COMPLETE_IMPLEMENTATION.md)
- 🫁 [Pneumonia QML Implementation Plan (`docs/plans/PNEUMONIA_QML_IMPLEMENTATION_PLAN.md`)](docs/plans/PNEUMONIA_QML_IMPLEMENTATION_PLAN.md)
- 📑 [Central Documentation Hub (`docs/README.md`)](docs/README.md)

---

**© 2026 Q-MedSense Team. Smart India Hackathon (SIH 26139). Licensed under the MIT License.**
