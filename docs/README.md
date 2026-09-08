# Q-MedSense Documentation Hub (`docs/README.md`)

[![Documentation Hub](https://img.shields.io/badge/Documentation-Hub%20v2.0-blue.svg)]()
[![SIH PS ID](https://img.shields.io/badge/SIH%20ID-26139-0052CC.svg)]()
[![Build Passing](https://img.shields.io/badge/Tests-43%2F43%20Passing-brightgreen.svg)]()

Welcome to the centralized technical documentation hub for **Q-MedSense: Hybrid Quantum Machine Learning Clinical Decision Support Platform** (Smart India Hackathon Problem Statement ID 26139).

---

## 🧭 Documentation Roadmap & Quick Navigation

### 1. Core Architecture & System Specifications
- 🏗️ [**System Requirements Specification (SRS)**](architecture/srs.md): Complete IEEE 830-1998 / ISO/IEC/IEEE 29148 compliant system specifications, non-functional requirements, and safety gates.
- 🗄️ [**Database Architecture & Schema**](DATABASE_SCHEMA.md): Complete relational SQLite 3 schema, DDL definitions, entity-relationship diagrams, and context-managed CRUD patterns.
- 📡 [**REST API Specification**](API_SPEC.md): Full OpenAPI 3.1.0 specification with complete JSON request/response payloads, status codes, and RBAC authorization matrices.

### 2. Quantum & Classical Machine Learning
- ⚛️ [**Quantum Algorithms & Mathematical Foundations**](QUANTUM_ALGORITHMS.md): Statevector Hilbert spaces, Parameter-Shift rule, Strongly Entangling Ansatz, QSVM fidelity kernels, and Quantum Advantage Score (QAS).
- 📐 [**Mathematical Formula Reference Sheet**](FORMULA_SHEET.md): Concise derivation sheet for angle scaling, unitary rotations, analytic gradients, Matthews Correlation Coefficient (MCC), and Expected Calibration Error (ECE).
- 🔬 [**Skin Cancer QML Implementation Plan**](plans/SKIN_CANCER_QML_COMPLETE_IMPLEMENTATION.md): 7-class HAM10000 dermoscopy pipeline, `QuantumDerma` family, ablation protocols, and Grad-CAM explainability.
- 🫁 [**Pneumonia QML Implementation Plan**](plans/PNEUMONIA_QML_IMPLEMENTATION_PLAN.md): Chest radiograph classification using hybrid EfficientNet-B0 + 8-qubit variational quantum circuit with validation-tuned thresholding.
- 🏷️ [**Model Governance & Specification Handbook**](model.md): Named model family governance (`OncoPulse`, `CardioWave`, `NeuroSynapse`), fairness audits, and deployment gates.
- 📊 [**Quick Experiments Leaderboard**](quick_experiments_leaderboard.md): Live benchmark results comparing quantum variants against classical baselines on Macro F1, Balanced Accuracy, and ROC-AUC.

### 3. Clinical Workflows, Security & Compliance
- 🩺 [**Clinical, Operational & Research Workflows**](CLINICAL_WORKFLOWS.md): Step-by-step clinical workflows, Emergency QR card triage, WebRTC doctor teleconsultations, and HL7 FHIR/VCF multi-modal ingestion.
- 🔒 [**Regulatory Compliance & Data Privacy**](COMPLIANCE_DPDP_HIPAA.md): DPDP Act 2023 consent lifecycle, HIPAA Safe Harbor 18 de-identification protocol, and WORM SHA-256 audit chaining.
- 🛠️ [**Issue Audit & Resolution Log**](ISSUES_RESOLVED.md): Complete engineering resolution log covering all algorithmic, database, security, and git configuration fixes.

### 4. Developer Runbooks & Operations
- 🚀 [**Complete Step-by-Step Execution Guide**](guides/run.md): Prerequisites, PowerShell one-click scripts, manual CLI commands, and persona walkthroughs.
- 🏋️ [**Model Training Handbook**](model_training.md): PowerShell-safe, end-to-end training guide for both vision tasks with ablation sweeps.
- 📝 [**Master Documentation Index**](INDEX.md): Comprehensive reference catalog connecting every document across the repository.

---

**© 2026 Q-MedSense Architecture Group. SIH Problem Statement ID 26139.**