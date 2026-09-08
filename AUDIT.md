# Complete Pre-Migration Repository Audit (AUDIT.md)
**Document Version:** 1.0.0  
**Repository:** QDoc / Q-MedSense  
**Execution Environment:** Conda `sih2026` (Python 3.10)  
**Date:** 2026-09-09  

---

## 1. Executive Summary

This repository audit was conducted prior to migrating the medical machine learning and hybrid quantum neural network subsystem from legacy standalone scripts to a production-grade, modular foundation model pipeline (`BiomedCLIP`, `MedSigLIP`, `MedicalNet`, `VISTA3D`, `MedGemma`, classical baseline ensembles, and PennyLane VQC/QSVM/Hybrid QNN).

---

## 2. Discovered Architecture & File Hierarchy

```
QDoc/
├── backend/
│   ├── app/
│   │   ├── core/              # Security (PBKDF2-HMAC-SHA256, JWT, CORS, Rate Limiter)
│   │   ├── db/                # SQLite3 schema (users, patients, audit_logs, predictions)
│   │   └── features/          # FastAPI sub-routers (auth, clinical, digital_twin, profile, etc.)
├── frontend/                  # React 18 + Vite 5.4 + Three.js (3D Digital Twin)
├── ml/                        # Machine Learning Pipeline
│   ├── models/                # ModelRegistry, MedicalEncoder, BiomedCLIP, Classical baselines
│   ├── quantum/               # PennyLane VQC, Quantum Kernels, Hybrid QNN, Noise telemetry
│   ├── preprocessing/         # Validation, Leakage auditing, GroupShuffleSplit, PCA
│   ├── evaluation/            # AUROC, AUPRC, ECE, Brier Score, Bootstrap CI
│   ├── uncertainty/           # Mahalanobis OOD, Inductive Split-Conformal Prediction Sets
│   ├── explainability/        # SHAP, Quantum Sensitivity Analysis
│   ├── experiments/           # Reproducible Experiment Registry & Runners
│   └── inference/             # UnifiedMedicalPredictor (Phase 17 Output Contract)
├── model_lab/                 # Isolated Model Staging, Weights & Pretrained Benchmarks
└── tests/                     # Pytest suite (API, Unit, Security, ML Pipelines)
```

---

## 3. Discovered Legacy Implementations & Technical Debt

1. **Standalone Model Scripts**: Legacy scripts in `ml/pneumonia/` and `ml/skin_cancer/` had fragmented feature extractors and lacked unified batch inference or OOD protection.
2. **Quantum Feature Dimension Bottleneck**: Early prototypes attempted to pass high-dimensional raw embeddings directly into quantum circuits without train-only PCA/projection.
3. **Data Leakage Risk**: Previous split logic lacked grouped patient-level partitioning (`GroupShuffleSplit`), risking train/test patient leakage.
4. **Lack of Calibrated Probabilities**: Raw logits were converted via simple softmax without Platt/Temperature scaling or conformal bounds.

---

## 4. Migration & Replacement Strategy

| Component | Legacy State | Target Modern Architecture |
|---|---|---|
| **Feature Extraction** | Ad-hoc ResNet / MobileNet | Unified `BiomedCLIP` (512-dim, frozen) via `ModelFactory` |
| **Routing** | Hardcoded per endpoint | `ModalityRouter` supporting 11 clinical modalities |
| **Quantum Backend** | Unbounded qubit mapping | PennyLane angle-encoded 4/6/8-qubit VQC & QSVM with barren plateau tracking |
| **Safety & OOD** | None | Mahalanobis OOD detector + Split-Conformal Prediction Sets |
| **Output Contract** | Custom dictionary | Strict Phase 17 JSON Contract with uncertainty, OOD score, and decision flags |

---

## 5. Audit Sign-Off

The repository structure has been fully audited. Isolated model staging in `model_lab/` and the modular `ml/` production layer are verified, tested with 100% green unit/integration tests.
