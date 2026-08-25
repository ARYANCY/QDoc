# Pneumonia Module

## Scope

The Pneumonia module is an independent research workflow for binary chest X-ray classification:

- `NORMAL`
- `PNEUMONIA`

It includes recursive dataset discovery, archive-metadata filtering, X-ray preprocessing, an EfficientNet-B0 baseline, a compact quantum head, validation threshold selection, and FastAPI inference.

## Dataset

The supplied data is under:

```text
datasets/PNEUMONIA/
```

The implementation discovers the extracted `train/` and `test/` folders recursively. It ignores macOS and Windows archive artifacts such as `__MACOSX`, `._*`, `.DS_Store`, and `Thumbs.db`. If no `val/` directory exists, training creates a deterministic 10% validation subset from `train/`.

The dataset is pediatric and requires external validation before any broader clinical use.

## Audit

Run from the repository root:

```powershell
conda activate QML
python -m ml.pneumonia.data.audit_dataset --root datasets/PNEUMONIA
```

The report is written to:

```text
reports/pneumonia/dataset_audit.json
```

The audit reports the discovered root, split counts, image dimensions, and invalid images.

## Training

Install the project dependencies in `QML`, then train the baseline:

```powershell
python -m pip install -r requirements.txt
python -m ml.pneumonia.training.train --root datasets/PNEUMONIA --epochs 8
```

The trainer uses:

- pretrained EfficientNet-B0;
- grayscale-to-three-channel X-ray conversion;
- 224px model-compatible crops;
- mild training augmentation;
- class-weighted cross-entropy;
- staged backbone fine-tuning;
- validation-based learning-rate scheduling;
- validation-only threshold selection.

Artifacts:

```text
models/pneumonia/best.pt
models/pneumonia/metrics.json
```

## API

Start the API from the repository root:

```powershell
uvicorn backend.app.main:app --reload
```

Endpoint:

```text
POST /api/v1/pneumonia/predict
```

The model must be trained before prediction requests can be served.

## Evaluation and safety

Report accuracy together with macro F1, ROC AUC, sensitivity, specificity, calibration, and the selected decision threshold. Do not tune against the test set.

This is research decision support, not a diagnosis. The dataset population is limited and the model has no independent clinical validation in this repository. Professional radiologist review is required.
