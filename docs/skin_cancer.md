# Skin Cancer Module

## Scope

The Skin Cancer module is an independent hybrid classical and quantum machine-learning workflow for seven HAM10000 lesion classes:

```text
akiec, bcc, bkl, df, nv, vasc, mel
```

It includes dataset auditing, stratified splitting, duplicate detection, transfer-learning baselines, compact quantum classification, calibration, evaluation artifacts, and FastAPI inference.

## Dataset

The default dataset is:

```text
datasets/SKIN_CANCER/archive/hmnist_28_28_RGB.csv
```

It contains 10,015 RGB samples at 28x28 resolution. The supplied CSV does not include patient or lesion identifiers, so the current split is stratified by image and cannot guarantee patient-level leakage prevention.

## Data preparation

Run from the repository root:

```powershell
python -m ml.skin_cancer.data.audit_dataset
python -m ml.skin_cancer.data.detect_duplicates
python -m ml.skin_cancer.data.split_dataset
```

Reports are written to:

```text
reports/skin_cancer/
```

The default split is 70% train, 15% validation, and 15% test. PCA and scaling for the quantum branch are fitted on training features only.

## Training

Train the classical baseline:

```powershell
python -c "from ml.skin_cancer.training.common import train_classical; train_classical('DermisNova')"
```

Benchmark the DenseNet121 candidate:

```powershell
python -c "from ml.skin_cancer.training.common import train_classical; train_classical('DenseNet121')"
```

Train the quantum hybrid model:

```powershell
python -m ml.skin_cancer.training.train_quantum --model QuantumDerma
```

The classical workflow supports pretrained EfficientNet and DenseNet121 backbones, staged fine-tuning, class-weighted loss, and early stopping. For the supplied 28x28 CSV, the validated baseline configuration uses 64px inputs. QuantumDerma uses compact CNN features, PCA, an eight-qubit shallow circuit, and a trainable classical residual path.

Artifacts are written under:

```text
models/skin_cancer/
reports/skin_cancer/
```

Use the classical and quantum metrics as a measured comparison. Quantum advantage is not assumed.

## API

Start the API from the repository root:

```powershell
uvicorn backend.app.main:app --reload
```

Endpoint:

```text
POST /api/v1/skin-cancer/predict
```

The model must be trained before prediction requests can be served.

## Evaluation and safety

Report accuracy together with macro F1, weighted F1, sensitivity, specificity, ROC AUC, PR AUC, calibration, and per-class results. Keep the test set untouched until final evaluation.

This is research decision support, not a diagnosis. The current CSV lacks patient identifiers and has severe class imbalance, so results require careful interpretation and external clinical validation.
