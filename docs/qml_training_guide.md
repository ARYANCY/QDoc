# Complete QML Training & Optimization Guide

This guide details the complete end-to-end workflow for training, benchmarking, and serving the Quantum Machine Learning models for **Skin Cancer** and **Pneumonia**.

---

## 1. Prerequisites & Environment Setup

Ensure you have Python 3.10+ installed and the virtual environment active:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Verify PennyLane and PyTorch installation:

```powershell
python -c "import pennylane as qml; import torch; print('PennyLane:', qml.__version__, 'PyTorch:', torch.__version__)"
```

---

## 2. Skin Cancer (HAM10000) QML Workflow

### Step 2.1: Dataset Audit & Split
Audits the 10,015-sample HAM10000 dataset, detects duplicate images, and builds a 70/15/15 stratified train/val/test split:

```powershell
python -m ml.skin_cancer.data.audit_dataset
python -m ml.skin_cancer.data.detect_duplicates
python -m ml.skin_cancer.data.split_dataset
```

### Step 2.2: Train Quantum Hybrid Models

> [!NOTE]
> **GPU & Resume Support:**
> - The training scripts automatically detect and leverage GPUs (CUDA or MPS) when available; otherwise, they fall back to CPU.
> - If training is interrupted (e.g., interrupted by Ctrl+C or a crash), simply run the same command again. The pipeline will automatically load the resume checkpoint `last.pt` and resume from the exact epoch where it was cut.
> - **To start fresh from epoch 1 (ignore any stored resume checkpoint):** add the `--no-resume` flag to the command.

#### Option A: Primary SOTA Model (QuantumDerma — 10 Qubits)
```powershell
python -m ml.skin_cancer.training.train_quantum --model QuantumDerma --no-resume
```

#### Option B: Extended 12-Qubit Model (QuantumDermaX)
```powershell
python -m ml.skin_cancer.training.train_quantum --model QuantumDermaX --no-resume
```

#### Option C: Deep 5-Layer Model (QSkin-Vortex)
```powershell
python -m ml.skin_cancer.training.train_quantum --model QSkin-Vortex --no-resume
```

#### Option D: SOTA Raw-Feature Model (VitaQ-Derm)
*VitaQ-Derm uses non-linear residual projection weights initialized from the pretrained classical model head and a zero-initialized quantum MLP corrector head to guarantee stable training starting exactly at the classical baseline accuracy.*
```powershell
python -m ml.skin_cancer.training.train_quantum --model VitaQ-Derm --no-resume
```

#### Option E: Complete Automated Pipeline
Trains the feature extractor, all quantum variants, and evaluates them:
```powershell
python -m ml.skin_cancer.training.run_pipeline --full --no-resume
```

### Step 2.3: Evaluate Metrics & Artifacts
Check the generated test metrics and calibration charts:
- Reports: `reports/skin_cancer/QuantumDerma/metrics.json`
- Confusion Matrix: `reports/skin_cancer/QuantumDerma/confusion_matrix.png`
- ROC & PR Curves: `reports/skin_cancer/QuantumDerma/roc_curve.png`

---

## 3. Pneumonia (Chest X-Ray) QML Workflow

### Step 3.1: Dataset Audit
Audits chest X-ray images, splits, and formats:

```powershell
python -m ml.pneumonia.data.audit_dataset
```

### Step 3.2: Train QuantumPneu Model
Trains the 8-qubit, 4-layer variational quantum classifier with data re-uploading, Focal Loss, and validation threshold tuning:

```powershell
python -m ml.pneumonia.training.train_quantum
```

### Step 3.3: Metrics & Checkpoints
- Checkpoint: `models/pneumonia/quantum/QuantumPneu/best.pt`
- Metrics: `models/pneumonia/quantum_metrics.json`

---

## 4. Serving & Inference

### Start Backend API:
```powershell
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload --reload-exclude ".venv/**"
```

### Start Frontend UI:
```powershell
cd frontend
npm run dev
```

Open your browser at `http://localhost:5173`.
Select **Pneumonia** or **Skin Cancer**, upload or capture an image via camera, and review the quantum confidence profile and metrics.
