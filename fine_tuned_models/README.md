# 🚀 Q-RAKSHAK: Kaggle Fine-Tuning & Evaluation Platform (`fine_tuned_models/`)

This directory contains complete, production-grade training, fine-tuning, and evaluation pipelines for all **Vision**, **Tabular**, and **Quantum Hybrid (VQC / QNN / QSVM)** models used in the **Q-RAKSHAK** clinical operating system.

---

## 📂 Directory Layout

```text
fine_tuned_models/
├── README.md                                # This execution guide & runbook
├── requirements_kaggle.txt                 # Kaggle Python package dependencies
├── export_to_backend.py                     # Sync utility to copy trained weights to models/
│
├── notebooks/                               # Standalone Kaggle-Ready Notebooks (.ipynb)
│   ├── 01_pneumonia_quantum_finetune.ipynb  # Chest X-Ray: EfficientNet-B0 + QuantumPneu
│   ├── 02_skin_cancer_quantum_finetune.ipynb# HAM10000: DenseNet-121 + Q-Skin-Vortex
│   └── 03_tabular_quantum_suite_finetune.ipynb # WDBC, Cleveland, Parkinsons, Diabetes VQC Suite
│
└── pipelines/                               # Modular Python Source Scripts
    ├── common/
    │   ├── quantum_circuits.py              # PennyLane VQC, QSVM, and PyTorch TorchLayer
    │   ├── metrics_evaluator.py             # Sensitivity, Specificity, AUC, MCC, ECE
    │   └── lr_schedulers.py                 # Cosine Annealing with Warmup
    ├── vision/
    │   ├── train_pneumonia.py               # Kermany Pediatric Radiographs pipeline
    │   └── train_skin_cancer.py             # HAM10000 Dermatoscopy pipeline
    └── tabular/
        ├── train_breast_cancer.py           # Wisconsin Diagnostic WDBC (OncoPulse-VQC)
        ├── train_heart_disease.py           # Cleveland & Framingham (CardioWave-VQC)
        ├── train_parkinsons.py              # Voice Acoustics (NeuroSynapse-VQC)
        └── train_diabetes.py                # PIMA Indian Diabetes (Diabetes-VQC)
```

---

## 🛠️ Step-by-Step Kaggle Execution Guide

### Step 1: Create a Kaggle Notebook & Enable GPU
1. Go to [kaggle.com](https://www.kaggle.com/) and click **`+ Create`** -> **`New Notebook`**.
2. In the right-hand panel under **Settings**:
   - **Accelerator:** Select **`GPU T4 x 2`** or **`GPU P100`** (Free 30 hrs/week).
   - **Internet:** Ensure **`Internet on`** is toggled ON.

---

### Step 2: Add Required Datasets on Kaggle

In your Kaggle Notebook, click **`+ Add Input`** in the top right:

| Notebook / Pipeline | Search in Kaggle Add Data | Kaggle Dataset Identifier |
| :--- | :--- | :--- |
| **01. Pneumonia (`QuantumPneu`)** | `chest-xray-pneumonia` | `paultimothymooney/chest-xray-pneumonia` |
| **02. Skin Cancer (`Q-Skin-Vortex`)** | `skin-cancer-mnist-ham10000` | `kmader/skin-cancer-mnist-ham10000` |
| **03. Tabular Quantum Suite** | *(No download needed — auto-loaded or generated)* | Built-in sklearn / standard distribution |

---

### Step 3: Run the Training Notebook

You can either:
1. **Upload the Notebook (`.ipynb`):** In Kaggle, click `File` -> `Upload Notebook` and choose any file from `fine_tuned_models/notebooks/`.
2. **Or Copy-Paste the code:** Copy cells directly from the notebook into Kaggle and click **`Run All`**.

---

### Step 4: Download Fine-Tuned Checkpoint Weights

Once training completes:
1. Go to the right sidebar under **`Output`** -> `/kaggle/working/outputs/`.
2. Download the trained weight files:
   - `QuantumPneu-FineTuned.pt`
   - `Q-Skin-Vortex-FineTuned.pt`
   - `OncoPulse-VQC.pt`
   - `CardioWave-VQC.pt`
   - `NeuroSynapse-VQC.pt`
   - `Diabetes-VQC.pt`

---

### Step 5: Import Weights Back to Local Project in VS Code

Place your downloaded weights into a folder (e.g. `./kaggle_outputs`) and run:

```powershell
python fine_tuned_models/export_to_backend.py --weights-dir ./kaggle_outputs
```

This will automatically copy the models to `models/quantum/` for live inference in your QDoc backend!

---

## 🧪 Local Dry-Run Testing (Verification in VS Code)

You can verify the scripts locally in VS Code with a dry-run test:

```powershell
# 1. Test Tabular Breast Cancer Quantum Pipeline
python fine_tuned_models/pipelines/tabular/train_breast_cancer.py --epochs 3

# 2. Test Tabular Heart Disease Pipeline
python fine_tuned_models/pipelines/tabular/train_heart_disease.py --epochs 3

# 3. Test Vision Pneumonia Pipeline (CPU dry-run)
python fine_tuned_models/pipelines/vision/train_pneumonia.py --epochs 1 --max-samples 16 --cpu
```
