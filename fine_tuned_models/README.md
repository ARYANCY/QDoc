# 🚀 Q-RAKSHAK: Universal CLI Fine-Tuning & Evaluation Platform (`fine_tuned_models/`)

This directory contains complete, modular Python training and evaluation scripts (pure `.py` architecture, no `.ipynb` required) for all **Classical**, **Hybrid**, and **Quantum** models across all 6 clinical domains in **Q-RAKSHAK**.

---

## 📂 Architecture

```text
fine_tuned_models/
├── train.py                                # Master CLI entry point for all diseases & models
├── evaluate.py                             # Master Benchmark & evaluation CLI
├── export_to_backend.py                     # Sync utility to copy trained weights into models/
├── requirements_kaggle.txt                 # Exact package dependencies for Kaggle
├── README.md                                # This runbook
│
└── pipelines/
    ├── common/
    │   ├── quantum_circuits.py              # Parameterized VQC, QSVM Kernel, and PyTorch TorchLayer
    │   ├── metrics_evaluator.py             # Sensitivity, Specificity, AUC, MCC, ECE
    │   └── lr_schedulers.py                 # Cosine Annealing with Warmup
    ├── vision/
    │   ├── train_pneumonia.py               # Chest X-Ray (EfficientNet-B0 + QuantumPneu)
    │   └── train_skin_cancer.py             # HAM10000 (DenseNet-121 + Q-Skin-Vortex)
    └── tabular/
        ├── train_breast_cancer.py           # WDBC (OncoPulse-VQC & Sentinel-RF)
        ├── train_heart_disease.py           # Cleveland (CardioWave-VQC & Sentinel-XGB)
        ├── train_parkinsons.py              # Vocal Acoustics (NeuroSynapse-VQC & Sentinel-RF)
        └── train_diabetes.py                # PIMA (Diabetes-VQC & Sentinel-RF)
```

---

## 📦 What Datasets to Add in Kaggle Input

In your Kaggle Notebook / Session, click **`+ Add Input`** and attach:

| Domain / Disease | Dataset Search on Kaggle | Exact Kaggle Dataset Slug | Mounted Input Path |
| :--- | :--- | :--- | :--- |
| **1. Pneumonia** | `chest-xray-pneumonia` | `paultimothymooney/chest-xray-pneumonia` | `/kaggle/input/datasets/paultimothymooney/chest-xray-pneumonia` or `/kaggle/input/chest-xray-pneumonia` |
| **2. Skin Cancer** | `skin-cancer-mnist-ham10000` | `kmader/skin-cancer-mnist-ham10000` | `/kaggle/input/datasets/kmader/skin-cancer-mnist-ham10000` or `/kaggle/input/skin-cancer-mnist-ham10000` |
| **3. Breast Cancer** | *(No input required)* | Built-in WDBC | Built-in |
| **4. Heart Disease** | *(Optional)* `heart-disease-uci` | `ronitf/heart-disease-uci` | `/kaggle/input/heart-disease-uci/heart.csv` |
| **5. Parkinson's** | *(Optional)* `parkinsons-data-set` | `vikasukani/parkinsons-disease-data-set` | `/kaggle/input/parkinsons-disease-data-set/parkinsons.data` |
| **6. Diabetes** | *(Optional)* `pima-indians-diabetes` | `uciml/pima-indians-diabetes-database` | `/kaggle/input/pima-indians-diabetes-database/diabetes.csv` |

---

## ⚡ Running on Kaggle via `git clone`

In your Kaggle Notebook code cell or terminal:

```bash
# 1. Clone your repository (or pull latest branch)
!git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
%cd QDoc

# 2. Install Kaggle dependencies
!pip install -r fine_tuned_models/requirements_kaggle.txt

# 3. Run Universal Training CLI:

# Train Pneumonia (Chest X-Ray)
!python fine_tuned_models/train.py --disease pneumonia --epochs 10

# Train Skin Cancer (HAM10000)
!python fine_tuned_models/train.py --disease skin_cancer --epochs 10

# Train All 4 Tabular Quantum Suite models
!python fine_tuned_models/train.py --disease breast_cancer
!python fine_tuned_models/train.py --disease heart_disease
!python fine_tuned_models/train.py --disease parkinsons
!python fine_tuned_models/train.py --disease diabetes

# OR Train the entire medical suite at once:
!python fine_tuned_models/train.py --disease all --epochs 10
```

---

## 🔄 Syncing Weights Back to Local VS Code Project

After training completes on Kaggle:
1. Download the generated `.pt` and `.joblib` checkpoints from `/kaggle/working/outputs/`.
2. Place them into a local folder (e.g. `./kaggle_outputs`) and run:

```powershell
python fine_tuned_models/export_to_backend.py --weights-dir ./kaggle_outputs
```
