# Pneumonia Module (Quantum Machine Learning)

## Scope

The Pneumonia module is a hybrid Classical-Quantum Machine Learning (HQCNN) research workflow for binary chest X-ray classification:

- `NORMAL`
- `PNEUMONIA`

The system uses a transfer-learning feature extractor (EfficientNet-B0) coupled to an 8-qubit, 4-layer **Variational Quantum Circuit (VQC)** with **data re-uploading**, **StronglyEntanglingLayers**, **Focal Loss**, and **Cosine Annealing** learning rate schedule.

## Dataset

The dataset is located under:

```text
datasets/PNEUMONIA/
```

The system automatically discovers extracted `train/`, `val/`, and `test/` folders recursively while filtering out archive artifacts (`__MACOSX`, `.DS_Store`, `Thumbs.db`).

## Audit

To audit the dataset:

```powershell
python -m ml.pneumonia.data.audit_dataset --root datasets/PNEUMONIA
```

Report written to `reports/pneumonia/dataset_audit.json`.

## Quantum Hybrid Architecture

The `QuantumPneu` model architecture follows the 2025 NISQ best practices for medical imaging:

1. **Backbone Feature Extractor:** Pre-trained EfficientNet-B0 extracts compact high-level representations from 224x224 chest X-rays.
2. **Dimension Reduction:** StandardScaler and PCA compress CNN feature vectors to 8 principal components.
3. **Feature Scaling:** `BatchNorm1d` normalises values followed by $tanh$ angle scaling to $[-\pi, \pi]$.
4. **Variational Quantum Circuit:**
   - 8 qubits with PennyLane `default.qubit` simulator.
   - 4 variational layers with `StronglyEntanglingLayers` ansatz.
   - **Data Re-uploading:** Classical features are re-encoded at every layer to maximise expressivity.
   - Pauli-Z expectation values $\langle Z_i \rangle$ measured across all 8 qubits.
5. **Post-Quantum MLP:** `LayerNorm` + 2-layer GELU multilayer perceptron produces classification logits.
6. **Residual Shortcut:** Direct linear residual path from inputs to logits preserves gradient flow.
7. **Loss & Scheduling:** Binary Focal Loss ($\gamma = 2.0$) with class weighting + `CosineAnnealingWarmRestarts`.

## Training the Quantum Model

### Quantum Training (QuantumPneu)

Train the quantum hybrid model:

```powershell
python -m ml.pneumonia.training.train_quantum
```

To specify custom epochs or config:

```powershell
python -m ml.pneumonia.training.train_quantum --config quantum.yaml --root datasets/PNEUMONIA
```

### Artifacts

Training saves the following artifacts:

```text
models/pneumonia/quantum/QuantumPneu/best.pt
models/pneumonia/quantum/QuantumPneu/scaler.pkl
models/pneumonia/quantum/QuantumPneu/pca.pkl
models/pneumonia/quantum/QuantumPneu/metrics.json
models/pneumonia/quantum/QuantumPneu/training_history.json
models/pneumonia/quantum_best.pt
models/pneumonia/quantum_metrics.json
```

## API & Inference

Start the FastAPI server:

```powershell
uvicorn backend.app.main:app --reload
```

Endpoint:

```text
POST /api/v1/pneumonia/predict
```

The predictor automatically detects and loads `QuantumPneu` if quantum checkpoints exist, and falls back gracefully to classical `PneuVision` if only the classical model is available.

## Evaluation & Safety

The evaluation report includes:
- Accuracy, Macro F1
- ROC AUC
- Sensitivity (Recall on Pneumonia class)
- Specificity (True Negative rate on Normal class)
- Validation-selected optimal decision threshold
- Confusion Matrix

> **Medical Notice:** This software is for research decision support and does not constitute medical diagnosis. Professional radiologist review is required.
