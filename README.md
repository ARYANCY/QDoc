# Hybrid Quantum Machine Learning (HQCNN) Medical Diagnosis Platform

A state-of-the-art hybrid Classical-Quantum Deep Learning platform for clinical image analysis, featuring **Variational Quantum Circuits (VQCs)** with **data re-uploading**, **StronglyEntanglingLayers**, **Focal Loss**, **Cosine Annealing optimization**, FastAPI backend services, and an interactive React clinical dashboard.

> **Medical Disclaimer:** This platform is designed for research decision-support and benchmarking. Predictions do not constitute clinical diagnoses and must be reviewed by certified medical professionals.

---

## Key Highlights & Innovations (2025 SOTA)

- **Data Re-Uploading:** Encodes features at the beginning of *every* variational layer, proving universal function approximation capabilities on NISQ quantum architectures.
- **Strongly Entangling Ansatz:** Maximum 2-qubit entanglement capability across all qubit pairs using full parameterized SU(2) rotations and multi-qubit CNOT cascades.
- **Class-Imbalance Mitigation:** Built-in multi-class **Focal Loss ($\gamma = 2.0$)** with class weighting and label smoothing to effectively classify minority pathological classes.
- **Barren Plateau Defense:** Small-variance parameter initialization, `BatchNorm1d` input scaling, and linear classical residual shortcuts for stable gradient flow.
- **End-to-End Pipeline:** Automated data auditing, stratified dataset splitting, CNN feature extraction, PCA reduction, quantum training, temperature calibration, and REST API inference.

---

## Directory Structure

```
├── backend/                  # FastAPI REST API services
│   ├── app/
│   │   ├── features/         # Disease-specific endpoints (skin cancer, pneumonia, graphs)
│   │   └── main.py           # Application entry point & CORS configuration
│   └── graphs/               # Automated Matplotlib clinical graph generators
│
├── docs/                     # Comprehensive documentation & guides
│   ├── architecture.md       # Full mathematical & architectural design
│   ├── qml_training_guide.md # Step-by-step training & benchmark guide
│   ├── skin_cancer.md        # Skin Cancer (HAM10000) QML specifications
│   └── pneumonia.md          # Pneumonia (Chest X-Ray) QML specifications
│
├── frontend/                 # React + Vite Clinical UI
│   ├── src/
│   │   ├── features/analysis/UnifiedAnalysisPage.jsx  # Main diagnosis workspace
│   │   └── data/dummy.js     # Patient profile, vitals & clinical mock data
│   └── package.json
│
├── ml/                       # Machine Learning core modules
│   ├── pneumonia/            # Chest X-Ray QML pipeline
│   │   ├── classical/        # EfficientNet-B0 backbone extractor
│   │   ├── configs/          # quantum.yaml & classical.yaml
│   │   ├── inference/        # QuantumPneu inference predictor with fallback
│   │   ├── quantum/          # QuantumPneu VQC implementation
│   │   └── training/         # train_quantum.py & train.py
│   │
│   └── skin_cancer/          # HAM10000 Dermatoscopy QML pipeline
│       ├── classical/        # DermisNova & DenseNet121 backbones
│       ├── configs/          # quantum.yaml & classical.yaml
│       ├── evaluation/       # Metrics, ROC/PR curves, temperature calibration
│       ├── features/         # CNN feature extraction & 16-component PCA
│       ├── inference/        # Multi-model QML predictor
│       ├── quantum/          # QuantumDerma, QuantumDermaX, QSkin-Vortex, VitaQ-Derm
│       └── training/         # train_quantum.py & run_pipeline.py
│
├── models/                   # Saved model checkpoints (*.pt), scalers (*.pkl), & metrics
├── reports/                  # Evaluation artifacts, ROC curves, calibration plots, & logs
├── requirements.txt          # Python dependencies (PyTorch, PennyLane, FastAPI, etc.)
└── README.md
```

---

## Quick Start Guide

### 1. Environment Setup

```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install core dependencies
python -m pip install -r requirements.txt
```

### 2. Quantum Model Training

#### Skin Cancer (HAM10000) — QuantumDerma (10 Qubits, 4 Layers)
```powershell
python -m ml.skin_cancer.training.train_quantum --model QuantumDerma
```

#### Pneumonia (Chest X-Ray) — QuantumPneu (8 Qubits, 4 Layers)
```powershell
python -m ml.pneumonia.training.train_quantum
```

### 3. Start Backend REST API

```powershell
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload --reload-exclude ".venv/**"
```
API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 4. Start Clinical Frontend Dashboard

```powershell
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Dashboard URL: [http://localhost:5173](http://localhost:5173)

---

## Quantum Models Overview

| Model | Task | Qubits | Layers | Ansatz | Data Re-uploading | Input Features |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **`QuantumDerma`** | 7-Class Skin Lesion | **10** | **4** | Strongly Entangling | Yes | 16 (PCA) |
| **`QuantumDermaX`** | 7-Class Skin Lesion | **12** | **4** | Strongly Entangling | Yes | 16 (PCA) |
| **`QSkin-Vortex`** | 7-Class Skin Lesion | **10** | **5** | Strongly Entangling | Yes | 16 (PCA) |
| **`VitaQ-Derm`** | 7-Class Skin Lesion | **10** | **4** | Strongly Entangling | Yes | 128 (Raw CNN) |
| **`QuantumPneu`** | Binary Pneumonia | **8** | **4** | Strongly Entangling | Yes | 8 (PCA) |

---

## Documentation Links

- [Complete Architecture & Mathematical Design](docs/architecture.md)
- [QML Training & Optimization Guide](docs/qml_training_guide.md)
- [Skin Cancer Module Documentation](docs/skin_cancer.md)
- [Pneumonia Module Documentation](docs/pneumonia.md)

---

## License & Citation

This research platform is released under the MIT License. If you use these hybrid quantum architectures in your research, please cite PennyLane and PyTorch accordingly.
