# Q-MedSense Documentation Hub

Welcome to the comprehensive technical documentation for **Q-MedSense** (SIH Problem Statement ID: 26139).

---

## 📚 Documentation Index

### 1. Architecture & Specifications
- [System Requirements Specification (SRS)](./architecture/srs.md) — Complete IEEE 830-1998 / ISO/IEC/IEEE 29148 compliant specifications.
- [Database Schema & Seed Models](../backend/app/db/database.py) — SQLite / Relational schema for patients, diagnostics, audit logs, and consents.
- [Security & Compliance](../backend/app/core/security.py) — DPDP Act 2023 & HIPAA compliance, JWT auth, RBAC, and SHA-256 audit chaining.

### 2. Quantum & Classical ML Pipelines
- [Quantum Engine Core](../ml/quantum_engine/) — VQC, QNN, QSVM, and Quantum Advantage Benchmarks.
- [Pneumonia Pipeline Plan](./plans/PNEUMONIA_QML_IMPLEMENTATION_PLAN.md) — Chest X-ray hybrid quantum vision architecture.
- [Skin Cancer Pipeline Plan](./plans/SKIN_CANCER_QML_COMPLETE_IMPLEMENTATION.md) — HAM10000 hybrid QNN architecture, ablation studies, and Grad-CAM explainability.

### 3. Developer & Operational Guides
- [Quickstart & Run Guide](./guides/run.md) — Step-by-step setup and execution.
- [Testing & Quality Assurance](./guides/run.md#testing) — Running unit tests, API tests, and coverage.
- [Containerization & Infrastructure](../infra/) — Docker, Docker Compose, Kubernetes, and Nginx reverse proxy.