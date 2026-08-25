# Medical AI QML Platform

This repository contains independent medical-imaging research modules built around classical deep learning, hybrid quantum machine learning, reproducible evaluation, FastAPI inference, and a React interface.

Predictions are not diagnoses and require professional review.

## Project overview

| Module | Task | Dataset | Documentation |
| --- | --- | --- | --- |
| Skin Cancer | Seven-class lesion classification with classical and hybrid QML models | HAM10000 RGB CSV | [Skin Cancer module](docs/skin_cancer.md) |
| Pneumonia | Binary chest X-ray classification: `NORMAL` vs `PNEUMONIA` | Pediatric chest X-ray archive | [Pneumonia module](docs/pneumonia.md) |

The modules remain logically independent. Shared API infrastructure is registered in `backend/app/main.py`, while disease-specific data, models, training, and inference remain under their respective module paths. Dataset archive metadata such as `__MACOSX`, `._*`, `.DS_Store`, and `Thumbs.db` is ignored by the Pneumonia loader.

## Shared setup

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1      
python -m pip install -r requirements.txt
```

If PowerShell blocks scripts, use `\.venv\Scripts\python.exe` directly or enable the policy for the current user.

## Quick start

Run the module-specific commands in the linked documentation. To start the shared API:

```powershell
uvicorn backend.app.main:app --reload
```

To start the React interface:

```powershell
Set-Location frontend
npm install
npm run dev
```

## Model graphs

The backend graph service uses Matplotlib to generate disease-wise comparisons from measured metric artifacts. It creates charts for available accuracy, macro F1, weighted F1, ROC AUC, PR AUC, sensitivity, specificity, and calibration metrics.

Generate graphs after training:

```powershell
python -m backend.graphs.generate_graphs
```

Generated files are stored under `backend/graphs/generated/`. The API lists available graphs at `GET /api/v1/graphs` and serves each PNG through the returned URL. Models that have not produced metrics yet are omitted without preventing graphs for the other disease.

## Research and safety

Use sensitivity, specificity, macro F1, ROC AUC, calibration, and per-class results alongside accuracy. Keep test data isolated during preprocessing and tuning. The platform is research decision support only and has not received independent clinical validation.

References: [PyTorch transfer learning](https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html) and [Torchvision EfficientNet](https://docs.pytorch.org/vision/stable/models/efficientnet.html).
