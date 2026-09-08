# Model Specification & Training Handbook (model.md)
## Q-MedSense — Hybrid Quantum-Classical Model Family
**SIH Problem Statement 26139 | Egreen Quanta**

This document is the single source of truth for **what models to build, on what data, exactly how to train them, exactly how to evaluate them, and what rules govern them.** It complements `SRS.md` (architecture/formulas), `research.md` (competitive grounding), and `feature.md` (feature checklist).

---

## Table of Contents
1. Model Family Overview & Naming
2. Dataset Index (Links + Access Notes)
3. Environment & Repository Setup
4. End-to-End Training Pipeline (Step by Step)
5. Model-by-Model Implementation Detail
6. Hyperparameter Reference Tables
7. Accuracy & Evaluation Process
8. Statistical Validity & Fair Benchmarking Rules
9. Model Versioning & Registry Rules
10. Model Governance — Rules & Regulations (Strict)
11. Failure Modes & Mitigation Rules
12. Deployment Gate Checklist (Go/No-Go)
13. Appendix — Reusable Code Skeletons

---

## 1. Model Family Overview & Naming

Rather than shipping one generic "the model," Q-MedSense ships a **named model family**, each with a clear identity, a clear disease scope, and a clear classical counterpart it must beat or justify itself against. Naming them distinctly also makes the Model Registry (Section 9) and the demo narrative much easier to follow for judges/clinicians.

| Codename | Type | Disease Module | Dataset(s) | Classical Rival It Must Benchmark Against |
|---|---|---|---|---|
| **OncoPulse-VQC** | Variational Quantum Classifier | Breast Cancer (Onco) | Wisconsin Diagnostic Breast Cancer (WDBC) | `Sentinel-RF` (Random Forest) |
| **OncoPulse-QSVM** | Quantum Support Vector Machine | Breast Cancer (Onco) | WDBC | `Sentinel-SVM` (classical SVM, RBF kernel) |
| **CardioWave-VQC** | Variational Quantum Classifier | Cardiovascular | Cleveland Heart Disease | `Sentinel-XGB` (XGBoost) |
| **CardioWave-QNN** | Quantum Neural Network (multi-class staging) | Cardiovascular (severity 0–4) | Cleveland Heart Disease | `Sentinel-MLP` (classical Multi-Layer Perceptron) |
| **NeuroSynapse-VQC** | Variational Quantum Classifier | Neurological (Parkinson's) | Parkinson's Telemonitoring | `Sentinel-LogReg` (Logistic Regression) |
| **NeuroSynapse-QSVM** | Quantum Support Vector Machine | Neurological (Alzheimer's biomarker track, stretch) | ADNI (subset, tabular biomarkers) | `Sentinel-GBM` (Gradient Boosted Trees) |
| **GenomeEntangle-QNN** | Quantum Neural Network (stretch/P2) | Oncogenomics | TCGA (PCA-reduced) | `Sentinel-DeepMLP` |
| **Sentinel-*** family | Classical baselines (RF/SVM/XGB/MLP/LogReg/GBM) | All modules | Same as paired quantum model | — (these *are* the rivals) |
| **FallbackGuard** | Not a model — the automatic classical-fallback routing logic | All modules | N/A | Ensures zero downtime if quantum backend fails (see `SRS.md` Section 9.3) |

**Naming rationale (useful to state in your pitch):** "Pulse," "Wave," "Synapse," and "Entangle" each metaphorically match the organ/domain (heartbeat → Wave, brain → Synapse, DNA → Entangle) while "Sentinel" signals the classical baselines' role as the vigilant, trusted control group your quantum models must outperform or justify against — not a strawman.

---

## 2. Dataset Index (Links + Access Notes)

| Dataset | Link | License/Access | Used By |
|---|---|---|---|
| Wisconsin Diagnostic Breast Cancer (WDBC) | https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic | Open, UCI license | OncoPulse-VQC, OncoPulse-QSVM |
| Cleveland Heart Disease | https://archive.ics.uci.edu/dataset/45/heart+disease | Open, UCI license | CardioWave-VQC, CardioWave-QNN |
| Framingham Heart Study | https://www.kaggle.com/datasets/aasheesh200/framingham-heart-study-dataset | Kaggle open dataset (check dataset card for terms) | CardioWave validation/cross-dataset test |
| Parkinson's Disease Telemonitoring | https://archive.ics.uci.edu/dataset/174/parkinsons | Open, UCI license | NeuroSynapse-VQC |
| ADNI (Alzheimer's Disease Neuroimaging Initiative) | https://adni.loni.usc.edu/ | Requires Data Use Agreement (apply for access) | NeuroSynapse-QSVM (stretch) |
| The Cancer Genome Atlas (TCGA) | https://portal.gdc.cancer.gov/ | Open (controlled-tier data needs dbGaP approval) | GenomeEntangle-QNN (stretch) |
| MIMIC-III / MIMIC-IV | https://physionet.org/content/mimiciii/ | Credentialed access via PhysioNet (CITI training required) | Future general-EHR module (not in MVP) |
| PIMA Indian Diabetes | https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database | Open, Kaggle | Pipeline smoke-test dataset (before scaling to real modules) |

**Build order recommendation:** PIMA (smoke test) → WDBC (OncoPulse) → Cleveland (CardioWave) → Parkinson's (NeuroSynapse) → Framingham (cross-validation of CardioWave) → TCGA/ADNI/MIMIC only if time remains (they require materially more preprocessing and, for ADNI/MIMIC, access-approval lead time you should request on Day 1 even if you don't use them yet).

---

## 3. Environment & Repository Setup

### 3.1 Core Dependencies
```bash
python -m venv qmedsense-env
source qmedsense-env/bin/activate

pip install qiskit qiskit-machine-learning qiskit-aer
pip install pennylane pennylane-lightning
pip install scikit-learn xgboost imbalanced-learn shap
pip install pandas numpy matplotlib seaborn
pip install pytest mypy black
```

### 3.2 Repository Layout (Model-Training Specific)
```
q-medsense/
├── data/
│   ├── raw/                     # untouched downloaded datasets
│   ├── processed/                # after cleaning/imputation/normalization
│   └── reduced/                  # after PCA/feature-selection, ready for quantum encoding
├── models/
│   ├── onco_pulse/
│   │   ├── vqc.py
│   │   ├── qsvm.py
│   │   └── sentinel_baselines.py
│   ├── cardio_wave/
│   ├── neuro_synapse/
│   └── genome_entangle/
├── training/
│   ├── train_pipeline.py         # shared pipeline entrypoint
│   ├── config/                   # YAML hyperparameter configs per model
│   └── registry_writer.py        # writes to Model Registry (Section 9)
├── evaluation/
│   ├── metrics.py
│   ├── benchmark_runner.py       # runs quantum + all Sentinel baselines together
│   └── reports/
├── explainability/
│   ├── shap_module.py
│   └── quantum_perturbation.py
└── tests/
```

---

## 4. End-to-End Training Pipeline (Step by Step)

This exact sequence applies to every model in the family; only hyperparameters and dataset differ.

### Step 1 — Data Loading & Validation
- Load raw dataset (Section 2 links).
- Validate schema (column count, types, label distribution).
- Log a data-lineage record: dataset name, version/download date, row count, source URL (feeds the Model Registry, Section 9).

### Step 2 — Cleaning & Imputation
- Drop or impute missing values (KNN-imputer for numeric features).
- Detect outliers via IQR method; flag (do not silently drop) for clinical review.

### Step 3 — Class Balance Check
- Compute class distribution. If minority class < 35%, apply SMOTE (formula in `SRS.md` Section 4.1) on the **training split only** (never on validation/test — this is a hard rule, see Section 8).

### Step 4 — Normalization
- Min-Max scale all features into `[0, π]` for angle encoding (formula: `x' = (x−x_min)/(x_max−x_min) × π`).
- Store the fitted scaler object — it must be reused identically at inference time (never refit on test/production data).

### Step 5 — Feature Selection
- Compute Mutual Information score per feature against the label.
- Rank and retain the top-N features (N chosen per model, Section 6).

### Step 6 — Dimensionality Reduction to Qubit Budget
- Apply PCA to reduce to exactly the target qubit count (8–12 depending on model, Section 6).
- Record explained-variance-ratio — must be ≥ 85% retained variance or flag for review (a hard quality gate).

### Step 7 — Train/Validation/Test Split
- Stratified split: 70% train / 15% validation / 15% test.
- **Fixed random seed** (`random_state=42`) logged in the Model Registry for reproducibility.
- Test set is locked and touched exactly once, at the very end (Section 8 rule).

### Step 8 — Quantum Encoding
- Apply the chosen feature map (angle encoding default; ZZ feature map for QSVM kernel models) to the training/validation/test splits independently, using the parameters fit only on training data where applicable.

### Step 9 — Model Training
- **VQC/QNN models:** initialize circuit parameters θ randomly (fixed seed); train via COBYLA (gradient-free, robust to noise) or Adam with parameter-shift gradients (formula in `SRS.md` Section 4.3); track training/validation loss per epoch; apply early stopping (patience = 15 epochs on validation loss).
- **QSVM models:** compute the quantum kernel matrix on the training set; solve the classical SVM dual problem using that kernel (formula in `SRS.md` Section 4.4); tune `C` via validation-set grid search.
- **Sentinel classical baselines:** train in parallel, same train/validation split, standard scikit-learn/XGBoost fit calls, hyperparameter-tuned via the same validation set (never test set).

### Step 10 — Validation-Set Model Selection
- Select the best checkpoint/hyperparameter configuration purely on **validation-set** performance (AUC-ROC as primary selection metric, since it's threshold-independent).

### Step 11 — Final Test-Set Evaluation (One-Time)
- Run the selected model exactly once on the locked test set.
- Compute the full metric suite (Section 7).
- This number — and only this number — is reported as the model's official accuracy. Re-running on the test set to "improve" a number is a governance violation (Section 10).

### Step 12 — Explainability Pass
- Generate SHAP values for the classical/pre-quantum feature layer.
- Generate quantum perturbation importance for the quantum-encoded features.
- Store both against this exact model version.

### Step 13 — Benchmark Report Generation
- Auto-generate the hybrid-vs-classical comparison table + ROC overlay + Quantum Advantage Score (formula in `SRS.md` Section 4.6).

### Step 14 — Model Registry Write
- Log: model codename, version, dataset + version, hyperparameters, random seed, all test-set metrics, explainability artifact links, training date, trainer identity.

### Step 15 — Deployment Gate Check
- Run the checklist in Section 12 before promoting the model from "trained" to "production-serving" status.

---

## 5. Model-by-Model Implementation Detail

### 5.1 OncoPulse-VQC (Breast Cancer)
- **Input:** 30 WDBC features → MI-ranked top 12 → PCA to 8 components.
- **Qubits:** 8.
- **Encoding:** Angle encoding (`RY` rotation per qubit).
- **Ansatz:** Hardware-efficient, 3 repetition layers, `RY`+`RZ` rotations with linear-entanglement CNOT chain.
- **Optimizer:** COBYLA, max 200 iterations (gradient-free, robust for early prototyping); Adam + parameter-shift as a follow-up refinement pass.
- **Loss:** Binary cross-entropy + L2 regularization (`λ = 0.01`).
- **Expected outcome to report honestly:** state the actual number your run produces — do not assume or fabricate a result in advance; literature on this exact dataset/qubit range (Section 2, `research.md` row 2) reports mixed-but-competitive results relative to classical baselines, so treat your own measured number as the real finding.

### 5.2 OncoPulse-QSVM (Breast Cancer, kernel variant)
- **Encoding:** ZZ feature map, 2 repetitions.
- **Kernel:** Fidelity-based quantum kernel, computed via `qiskit_machine_learning.kernels.QuantumKernel`.
- **Classical solver:** `sklearn.svm.SVC(kernel="precomputed")` fed the quantum kernel matrix.
- **C tuning:** grid search over `[0.1, 1, 10, 100]` on validation set.

### 5.3 CardioWave-VQC (Heart Disease, binary: disease present/absent)
- **Input:** 14 Cleveland features → all retained (already low-dimensional) → PCA to 8 components if needed, or direct 10-qubit angle encoding if qubit budget allows.
- **Qubits:** 10.
- **Ansatz:** 4 repetition layers, full entanglement (all-to-all CNOT within each layer) — heart-disease feature interactions (e.g., cholesterol × age × max heart rate) benefit from richer entanglement per the correlation structure in this dataset.
- **Optimizer:** SPSA (Simultaneous Perturbation Stochastic Approximation) — well-suited to noisy quantum loss landscapes, 150 iterations.

### 5.4 CardioWave-QNN (Multi-class severity staging, 0–4 scale)
- **Output layer:** 5-class softmax over multiple qubit expectation values (formula in `SRS.md` Section 4.5).
- **Loss:** Categorical cross-entropy.
- **Note:** multi-class quantum staging is harder and noisier than binary — report per-class sensitivity/specificity, not just overall accuracy, since overall accuracy can hide poor performance on rare severe-stage classes.

### 5.5 NeuroSynapse-VQC (Parkinson's, voice biomarkers)
- **Input:** 22 voice-measure features → MI-ranked top 10 → PCA to 6–8 components (voice biomarkers are naturally low-dimensional and highly NISQ-friendly per the survey literature in `research.md` Section 2).
- **Qubits:** 6.
- **Ansatz:** 2 repetition layers (smaller circuit is sufficient and more NISQ-robust for this cleaner, lower-dimensional dataset).

### 5.6 GenomeEntangle-QNN (TCGA, stretch/P2)
- **Input:** thousands of genomic features → mandatory autoencoder pre-reduction (classical) to ~50 latent dims → PCA to final 10–12 qubit budget.
- **Flag clearly to judges:** this module is explicitly **P2/stretch** per `feature.md`; do not overstate its readiness if time runs out — an honest "designed but not yet trained due to TCGA access/preprocessing lead time" is a stronger answer than a rushed, unvalidated number.

---

## 6. Hyperparameter Reference Tables

| Model | Qubits | Ansatz Layers | Optimizer | Max Iterations | Learning Rate (if Adam) | Regularization λ |
|---|---|---|---|---|---|---|
| OncoPulse-VQC | 8 | 3 | COBYLA → Adam refine | 200 | 0.01 | 0.01 |
| OncoPulse-QSVM | 8 (kernel) | 2 (ZZ feature map reps) | SVC dual (C grid search) | — | — | — |
| CardioWave-VQC | 10 | 4 | SPSA | 150 | — | 0.01 |
| CardioWave-QNN | 10 | 4 | Adam | 250 | 0.005 | 0.02 |
| NeuroSynapse-VQC | 6 | 2 | COBYLA | 150 | — | 0.01 |
| GenomeEntangle-QNN | 12 | 5 | Adam | 300 | 0.003 | 0.03 |

| Sentinel Baseline | Key Hyperparameters (tuned via validation-set grid search) |
|---|---|
| Sentinel-RF (Random Forest) | `n_estimators`: [100, 300, 500], `max_depth`: [5, 10, None] |
| Sentinel-SVM | `kernel`: rbf, `C`: [0.1, 1, 10, 100], `gamma`: [scale, auto] |
| Sentinel-XGB | `n_estimators`: [100, 300], `max_depth`: [3, 6, 9], `learning_rate`: [0.01, 0.1, 0.3] |
| Sentinel-MLP | hidden layers: [(64,), (64,32), (128,64,32)], `alpha`: [0.0001, 0.001] |
| Sentinel-LogReg | `C`: [0.01, 0.1, 1, 10], `penalty`: l2 |
| Sentinel-GBM | `n_estimators`: [100, 200], `max_depth`: [3, 5] |

---

## 7. Accuracy & Evaluation Process

### 7.1 Metric Suite (computed identically for every quantum model and its Sentinel rival)
```
Accuracy    = (TP + TN) / (TP + TN + FP + FN)
Sensitivity (Recall) = TP / (TP + FN)
Specificity = TN / (TN + FP)
Precision   = TP / (TP + FP)
F1-Score    = 2 × (Precision × Sensitivity) / (Precision + Sensitivity)
AUC-ROC     = area under the ROC curve across all thresholds
MCC         = (TP·TN − FP·FN) / √((TP+FP)(TP+FN)(TN+FP)(TN+FN))
Training Time, Inference Time (per sample, ms) — logged for the Quantum Advantage Score
```

### 7.2 Quantum Advantage Score (QAS)
```
QAS = ( (Acc_quantum − Acc_classical) / Acc_classical ) × ( T_classical / T_quantum )
```
Reported alongside raw accuracy so a small accuracy edge achieved at huge time cost is not misrepresented as a clear win — and conversely, a comparable-accuracy result achieved with a smaller/simpler model is still shown as valuable.

### 7.3 Evaluation Procedure (Exact Order)
1. Train all models (quantum + Sentinel rivals) on the identical training split.
2. Select hyperparameters using the identical validation split.
3. Freeze all models.
4. Run the **locked test set once** through every model.
5. Compute the full metric suite for every model in the same run/session (same random seed environment) so results are directly comparable.
6. Generate the benchmark report: side-by-side metrics table + ROC curve overlay + QAS.
7. Run a statistical significance check (Section 8.3) before claiming "the quantum model outperforms the classical model."
8. Publish results with full methodology attached — never publish a bare accuracy number without the dataset, split method, and seed disclosed.

### 7.4 Cross-Validation (Robustness Check, Recommended Before Final Claims)
- In addition to the single train/val/test split, run 5-fold stratified cross-validation on the training+validation pool for each model.
- Report mean ± standard deviation of AUC-ROC across folds — a model with high mean but high variance is flagged as less reliable, even if its single-split number looked good.

---

## 8. Statistical Validity & Fair Benchmarking Rules

1. **No test-set leakage, ever.** No preprocessing statistic (scaler, PCA components, imputation values, SMOTE synthesis) may be fit on validation or test data — fit only on training data, then transform the rest.
2. **No test-set peeking.** The test set is evaluated exactly once per model version. If you must "improve" the model afterward, that is a new model version, re-validated from Step 7 of Section 4 onward — not a re-run of the same test set.
3. **Same split, same seed, across quantum and classical models being compared.** A quantum model cannot be compared fairly to a classical model trained on a different split.
4. **Report confidence intervals, not just point estimates**, where feasible (bootstrap resampling of the test set, 1000 iterations, report 95% CI on AUC-ROC).
5. **State simulator vs. hardware explicitly.** Never let a reader assume a simulator result was produced on real quantum hardware.
6. **Disclose qubit count, circuit depth, and shot count** (number of measurement repetitions) for every quantum result — these materially affect result quality and reproducibility.
7. **Report both wins and losses.** If a Sentinel classical baseline outperforms its quantum counterpart on a given dataset, report that honestly and explain via the QAS/complexity trade-off rather than hiding or cherry-picking the comparison.

---

## 9. Model Versioning & Registry Rules

- **Version format:** `<Codename>-v<major>.<minor>` (e.g., `OncoPulse-VQC-v1.0`).
- Every registry entry must contain: dataset name + source URL + download date, preprocessing steps applied, random seed, hyperparameters, full metric suite (test set), explainability artifact references, trainer identity, training date, and simulator/hardware backend used.
- A model **cannot** be promoted to "production-serving" status without a complete registry entry — incomplete entries block deployment (enforced by the Deployment Gate Checklist, Section 12).
- Superseded versions are archived, never deleted — full lineage must remain queryable for audit and rollback.

---

## 10. Model Governance — Rules & Regulations (Strict)

These rules govern **every** model in the family, without exception:

1. **Decision-support only.** No model output may be presented to a patient without a clinician review step. Every prediction screen must carry a persistent "this is a decision-support estimate, not a diagnosis" disclaimer (per `SRS.md` Section 9.3).
2. **No autonomous alerting.** The system must never autonomously notify a patient of a serious finding (e.g., "you may have cancer") without a clinician first reviewing and approving that communication.
3. **Mandatory explainability.** No model may be deployed without an attached explainability method (SHAP + quantum perturbation) — a black-box-only model is not permitted in this platform, matching the direct lesson from the IBM Watson for Oncology failure documented in `research.md` Section 3.
4. **Mandatory data lineage.** No model may be trained on a dataset without a recorded, real, cited source — synthetic or unverifiable training data (the root cause of the Watson for Oncology failure) is explicitly disallowed.
5. **Bias/fairness audit before release.** Every model version must have subgroup performance (age, sex, and any other ethically/legally appropriate demographic split available in the dataset) evaluated and recorded before production promotion.
6. **Drift monitoring is mandatory in production.** Rolling-window validation metrics must be recomputed on new data; if AUC-ROC drops more than 5% relative to the registered baseline, the model is auto-flagged for retraining review and reverts to `FallbackGuard` classical mode in the interim.
7. **Fail-safe default.** On any quantum-backend timeout, error, or unavailability, the system must automatically and transparently fall back to the paired Sentinel classical model, with a visible "fallback mode" indicator — clinical workflow must never halt due to a quantum-layer failure.
8. **No test-set re-use for tuning (Section 8, rule 2)** is a governance rule, not just a best practice — violating it invalidates the model's reported metrics for registry purposes.
9. **Reproducibility requirement.** Any registered model must be re-trainable from its logged configuration (seed, hyperparameters, dataset version) to within statistical noise of its reported metrics — non-reproducible results are not eligible for production promotion.
10. **Consent-scoped training data only.** A patient record may only be used in model training/retraining if the "use-for-research" consent scope (per `SRS.md`/`feature.md` consent model) is active for that record at the time of training-data extraction.
11. **Regulatory alignment.** All model training/inference pipelines must operate within the data-handling rules of `SRS.md` Section 9.2 (DPDP Act 2023, IT Rules 2011, HIPAA/GDPR where applicable, ABDM standards for Indian public-health deployments).
12. **Human override is always possible and logged.** A clinician overriding a model's prediction must supply a reason, and that override is itself logged and periodically reviewed as a model-quality signal (frequent overrides on a specific pattern indicate a needed retrain).
13. **No marketing overclaim.** The team/platform may not describe any Sentinel-beating result as "proof of quantum advantage" without the Quantum Advantage Score, confidence interval, and simulator/hardware disclosure attached (Section 8, rule 5–6) — matching the caution the survey literature itself raises about overclaiming (`research.md` Section 2, row 7).

---

## 11. Failure Modes & Mitigation Rules

| Failure Mode | Mitigation Rule |
|---|---|
| Quantum backend timeout/unavailable | Automatic fallback to Sentinel classical model (`FallbackGuard`), visible indicator, logged event |
| Overfitting on small quantum-friendly feature sets | Mandatory validation-set early stopping + L2 regularization + 5-fold CV robustness check |
| Class imbalance skewing sensitivity/specificity | Mandatory SMOTE on training split only; sensitivity/specificity reported separately, never masked by aggregate accuracy alone |
| Barren plateaus (vanishing gradients in deep PQCs) | Keep ansatz depth conservative (2–5 layers per Section 6); monitor gradient norm during training; fall back to gradient-free COBYLA/SPSA if Adam gradients vanish |
| Simulator-to-hardware performance gap | Explicitly test and report both where hardware access is available; never assume simulator results transfer 1:1 to NISQ hardware |
| Silent model staleness in production | Mandatory drift monitoring (Governance rule 6) |
| Dataset shift across hospitals/populations | Cross-dataset validation (e.g., CardioWave trained on Cleveland, spot-validated on Framingham) before broad deployment claims |

---

## 12. Deployment Gate Checklist (Go/No-Go Before Production-Serving Status)
- [ ] Complete Model Registry entry (Section 9) present.
- [ ] Test-set metrics computed exactly once, per Section 7.3 procedure.
- [ ] Bias/fairness audit completed and reviewed.
- [ ] Explainability artifacts (SHAP + quantum perturbation) generated and linked.
- [ ] Cross-validation robustness check completed (mean ± std reported).
- [ ] Fallback-to-classical path tested end-to-end (simulate a quantum-backend failure and confirm graceful handoff).
- [ ] Consent-scope check confirmed on all training data used.
- [ ] Drift-monitoring hook wired to the new model version before go-live.
- [ ] Data lineage and simulator/hardware disclosure documented in the benchmark report.
- [ ] Sign-off recorded (trainer + reviewing clinician/domain expert, per Governance rule 9 reproducibility + rule 12 human oversight).

---

## 13. Appendix — Reusable Code Skeletons

### 13.1 Preprocessing Skeleton
```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
from imblearn.over_sampling import SMOTE
import numpy as np

def preprocess(X, y, n_qubits=8, seed=42):
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, stratify=y, random_state=seed)
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, stratify=y_temp, random_state=seed)

    # SMOTE — training split only
    if np.bincount(y_train).min() / len(y_train) < 0.35:
        X_train, y_train = SMOTE(random_state=seed).fit_resample(X_train, y_train)

    scaler = MinMaxScaler(feature_range=(0, np.pi))
    X_train = scaler.fit_transform(X_train)
    X_val = scaler.transform(X_val)
    X_test = scaler.transform(X_test)

    pca = PCA(n_components=n_qubits, random_state=seed)
    X_train = pca.fit_transform(X_train)
    X_val = pca.transform(X_val)
    X_test = pca.transform(X_test)

    print(f"Explained variance retained: {pca.explained_variance_ratio_.sum():.3f}")
    return X_train, X_val, X_test, y_train, y_val, y_test, scaler, pca
```

### 13.2 VQC Skeleton (Qiskit Machine Learning)
```python
from qiskit.circuit.library import ZFeatureMap, RealAmplitudes
from qiskit_machine_learning.algorithms.classifiers import VQC
from qiskit_algorithms.optimizers import COBYLA

feature_map = ZFeatureMap(feature_dimension=8, reps=1)
ansatz = RealAmplitudes(num_qubits=8, reps=3, entanglement="linear")
optimizer = COBYLA(maxiter=200)

vqc = VQC(feature_map=feature_map, ansatz=ansatz, optimizer=optimizer)
vqc.fit(X_train, y_train)
val_score = vqc.score(X_val, y_val)
test_score = vqc.score(X_test, y_test)   # run exactly once
```

### 13.3 Benchmark Runner Skeleton
```python
from sklearn.metrics import (accuracy_score, recall_score, precision_score,
                              f1_score, roc_auc_score, matthews_corrcoef, confusion_matrix)
import time

def evaluate(model, X_test, y_test, name):
    start = time.time()
    y_pred = model.predict(X_test)
    elapsed = time.time() - start
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    return {
        "model": name,
        "accuracy": accuracy_score(y_test, y_pred),
        "sensitivity": recall_score(y_test, y_pred),
        "specificity": tn / (tn + fp),
        "precision": precision_score(y_test, y_pred),
        "f1": f1_score(y_test, y_pred),
        "auc_roc": roc_auc_score(y_test, y_pred),
        "mcc": matthews_corrcoef(y_test, y_pred),
        "inference_time_sec": elapsed,
    }

def quantum_advantage_score(acc_q, acc_c, t_c, t_q):
    return ((acc_q - acc_c) / acc_c) * (t_c / t_q)
```

---

*End of Document — Q-MedSense Model Specification & Training Handbook v1.0, companion to `SRS.md`, `research.md`, and `feature.md`, for SIH Problem Statement 26139.*