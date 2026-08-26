# Skin Cancer Module (Quantum Machine Learning)

## Scope

The Skin Cancer module is a hybrid Classical-Quantum Machine Learning (HQCNN) workflow for seven HAM10000 skin lesion classes:

```text
akiec, bcc, bkl, df, nv, vasc, mel
```

The system uses a pre-trained convolutional feature extractor combined with a **Variational Quantum Circuit (VQC)** head featuring **data re-uploading**, **strongly entangling ansatz**, **Focal Loss**, and **cosine annealing learning rate schedule** for high-accuracy dermatological image classification.

## Dataset

The default dataset is:

```text
datasets/SKIN_CANCER/archive/hmnist_28_28_RGB.csv
```

It contains 10,015 RGB samples at 28x28 resolution. The supplied CSV is split into 70% train, 15% validation, and 15% test using stratified sampling. PCA and standardisation for the quantum circuit are fitted exclusively on training features.

## Data Preparation

Run from the repository root:

```powershell
python -m ml.skin_cancer.data.audit_dataset
python -m ml.skin_cancer.data.detect_duplicates
python -m ml.skin_cancer.data.split_dataset
```

Reports are written to `reports/skin_cancer/`.

## Quantum Hybrid Architecture

The quantum classification pipeline implements the 2025 state-of-the-art hybrid QML architecture:

1. **Feature Extraction:** Pre-trained CNN backbone (`DermisNova` / EfficientNet-B0) extracts high-dimensional representations from dermatoscopic images.
2. **Dimension Reduction:** Standardisation + 16-component PCA projects features into a compact representation while capturing maximum variance.
3. **Data Normalisation & Angle Scaling:** Features pass through `BatchNorm1d` and `tanh` scaling to map inputs into $[-\pi, \pi]$ rotation angles.
4. **Variational Quantum Circuit (VQC):**
   - **Qubits:** 10 qubits (12 for `QuantumDermaX`).
   - **Layers:** 4 variational layers (5 for `QSkin-Vortex`).
   - **Ansatz:** `StronglyEntanglingLayers` for maximum entangling capability across all qubit pairs.
   - **Data Re-uploading:** Features are re-encoded at the start of *every* variational layer, significantly increasing circuit expressivity and universality.
   - **Measurement:** Pauli-Z expectation values $\langle Z_i \rangle$ are measured on all qubits.
5. **Post-Quantum MLP:** `LayerNorm` + 2-layer GELU multilayer perceptron maps quantum expectation values to class logits.
6. **Classical Residual Shortcut:** Direct linear residual path from inputs to logits ensures smooth gradient propagation and prevents barren plateau stalls.
7. **Loss & Optimisation:** Multi-class **Focal Loss** ($\gamma = 2.0$) with class weighting and label smoothing (0.1) handles HAM10000 class imbalance, optimised with **AdamW + CosineAnnealingWarmRestarts**.

## Training the Quantum Model

### Primary Quantum Model (QuantumDerma)

```powershell
python -m ml.skin_cancer.training.train_quantum --model QuantumDerma
```

### Full Quantum Pipeline (all variants)

```powershell
python -m ml.skin_cancer.training.run_pipeline --full
```

Available quantum models:
- **`QuantumDerma`**: 10 qubits, 4 layers, strongly entangling, data re-uploading (recommended).
- **`QuantumDermaX`**: 12 qubits, 4 layers, extended Hilbert space.
- **`QSkin-Vortex`**: 10 qubits, 5 layers, deep variational form.
- **`VitaQ-Derm`**: 10 qubits, 4 layers with raw-feature learned projection.

### Artifacts

Trained weights and evaluations are saved to:

```text
models/skin_cancer/quantum/<ModelName>/best.pt
models/skin_cancer/quantum/<ModelName>/metrics.json
models/skin_cancer/quantum/<ModelName>/calibration.json
reports/skin_cancer/<ModelName>/
```

## API & Inference

Start the API:

```powershell
uvicorn backend.app.main:app --reload
```

Endpoint:

```text
POST /api/v1/skin-cancer/predict
```

## Evaluation & Metrics

The pipeline computes:
- Accuracy, Macro F1, Weighted F1
- Multi-class ROC AUC (One-vs-Rest) & PR AUC
- Per-class Sensitivity, Specificity, Precision, Recall
- Temperature calibration & Expected Calibration Error (ECE)
- Confusion Matrix

> **Medical Notice:** This software is designed for research decision support and is not a certified diagnostic device. Clinical evaluation by a licensed dermatologist is mandatory.
