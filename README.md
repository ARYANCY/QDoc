# Q-MedSense: Hybrid Quantum Machine Learning Clinical Decision Support Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/Tests-21%2F21%20Passed-brightgreen.svg)]()
[![SIH Problem Statement](https://img.shields.io/badge/SIH%20ID-26139-blue.svg)]()
[![Python](https://img.shields.io/badge/Python-3.10--3.14-blue.svg)]()
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

> **Smart India Hackathon (SIH) Problem Statement ID 26139**  
> *Theme:* MedTech / BioTech / Quantum Computing in Healthcare  
> *Platform:* Q-MedSense Quantum Clinical Operating System

---

## 📑 Master Documentation Index

| Section | Document Link | Description |
| :--- | :--- | :--- |
| 🚀 **Execution Guide** | [**run.md**](file:///c:/Users/aryan/OneDrive/Desktop/doc/run.md) | Complete step-by-step launch guide, prerequisites, and test instructions |
| 🏗️ **System Architecture** | [**docs/ARCHITECTURE.md**](file:///c:/Users/aryan/OneDrive/Desktop/doc/docs/architecture.md) | Hybrid Quantum-Classical architecture and subsystem interactions |
| 🗄️ **Database Design** | [**docs/DATABASE_SCHEMA.md**](file:///c:/Users/aryan/OneDrive/Desktop/doc/docs/DATABASE_SCHEMA.md) | SQLite relational schema, tables (`users`, `patients`, `records`), and CRUD rules |
| ⚛️ **Quantum Algorithms** | [**docs/QUANTUM_ALGORITHMS.md**](file:///c:/Users/aryan/OneDrive/Desktop/doc/docs/QUANTUM_ALGORITHMS.md) | Formulations of VQC, QSVM, QNN, Angle Embedding, and QAS metric |
| 🔌 **API Specification** | [**docs/API_SPEC.md**](file:///c:/Users/aryan/OneDrive/Desktop/doc/docs/API_SPEC.md) | REST API endpoints for clinical inference, telemetry, auth, and ingestion |
| 🔒 **Compliance & Security** | [**docs/COMPLIANCE_DPDP_HIPAA.md**](file:///c:/Users/aryan/OneDrive/Desktop/doc/docs/COMPLIANCE_DPDP_HIPAA.md) | DPDP Act 2023, HIPAA Safe Harbor, WORM audit trail, and SaMD compliance |
| 🩺 **Clinical Workflows** | [**docs/CLINICAL_WORKFLOWS.md**](file:///c:/Users/aryan/OneDrive/Desktop/doc/docs/CLINICAL_WORKFLOWS.md) | End-to-end user workflows for Clinicians, Researchers, Admins, and Patients |
| 📐 **Mathematical Formulas**| [**docs/FORMULA_SHEET.md**](file:///c:/Users/aryan/OneDrive/Desktop/doc/docs/FORMULA_SHEET.md) | Mathematical equations for Matthews Correlation Coefficient, QAS, and SHAP |
| 🛠️ **Issue Resolution Log** | [**docs/ISSUES_RESOLVED.md**](file:///c:/Users/aryan/OneDrive/Desktop/doc/docs/ISSUES_RESOLVED.md) | Complete catalog of audited and resolved bugs and optimizations |
| 📋 **IEEE 830 SRS** | [**docs/SRS.md**](file:///c:/Users/aryan/OneDrive/Desktop/doc/docs/SRS.md) | Software Requirements Specification document |

---

## 1. Introduction & Problem Statement

Modern healthcare diagnostic pipelines face exponential increases in complex, high-dimensional multi-omics datasets (genomic variants, radiomics, and micro-cellular textures). Classical deep neural networks suffer from the curse of dimensionality, catastrophic vanishing gradients, and opaque "black-box" decision architectures.

**Q-MedSense** solves this by bridging **Variational Quantum Classifiers (VQC)**, **Quantum Support Vector Machines (QSVM)**, and **Quantum Neural Networks (QNN)** with real-time SHAP perturbation explainability and an interactive **2D Physiological Digital Twin**.

### Key Architectural Highlights
1. **Hybrid Quantum-Classical Execution:** Evaluates clinical samples using PennyLane statevector simulations and compares against classical baselines (Random Forest, Logistic Regression, MLP).
2. **Dynamic Role-Based Access Control (RBAC):** Automatically adapts the navigation sidebar and accessible modules to the logged-in authority (*Clinician*, *Researcher*, *Admin*, *Patient*).
3. **Zero Default Metric Enforcement:** Strictly starts unanalyzed views at `0%` / `0.00` / `Unanalyzed` with zero hardcoded dummy data.
4. **Persistent SQLite Database (`qmedsense.db`):** Stores clinical records, patient profiles, diagnostic histories, and WORM-compliant tamper-evident audit logs with SHA-256 digital signatures.
5. **Zero-Border-Radius Clinical UI (`border-radius: 0px`):** High-contrast, dense single-screen desktop interface with full WCAG 2.1 AA accessibility (dyslexia font, high contrast, reduced motion).

---

## 2. Quickstart Execution Guide

### Fast Launch via PowerShell Scripts

In the project root, open two terminals:

```powershell
# Terminal 1: Start Backend API & Quantum Engine
.\start_backend.ps1

# Terminal 2: Start React Frontend
.\start_frontend.ps1
```

- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

*For detailed setup instructions, troubleshooting, and manual startup commands, see [run.md](file:///c:/Users/aryan/OneDrive/Desktop/doc/run.md).*

---

## 3. Pre-Seeded Authority Personas

Switch between any persona in 1-click via the user badge or modal:

| Persona | Username | Role | Primary Workspace |
| :--- | :--- | :--- | :--- |
| **Alexander Reed** | `alex.patient` | `patient` | Autonomous Self-Analysis Cockpit, 2D Digital Twin, Early Detection Map |
| **Priya Nair, PhD** | `priya.qml` | `researcher` | Live Retraining Studio, Hyperparameter Optimizer, Benchmark Matrix |
| **Security Admin** | `admin.audit` | `admin` | Compliance Console, User Management, DPDP Consent Toggles, Immutable Audit Trail |

---

## 4. Verification & Testing

Run the full automated test suite (21 unit & integration tests):
```bash
python -m pytest tests/ -v
```

Build the production frontend bundle:
```bash
cd frontend && npm run build
```

---

## 5. Technology Stack

- **Backend Framework:** FastAPI 0.115 + Pydantic v2 + Uvicorn
- **Quantum Machine Learning:** PennyLane 0.38+ (default.qubit simulator, Parameter-Shift rules)
- **Classical ML & Metrics:** PyTorch, scikit-learn, NumPy, Pandas
- **Database:** SQLite 3 with context-managed connection pooling
- **Frontend Framework:** React 18 + Vite + Lucide React
- **Compliance & Security:** DPDP Act 2023, HIPAA Safe Harbor De-identification, WORM SHA-256 Logs
