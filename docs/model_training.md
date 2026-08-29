# QDoc Model Training — Skin Cancer (QuantumDerma) & Pneumonia (QuantumPneu)

Complete, PowerShell-safe guide for training **both** hybrid quantum-classical
models in the QDoc project:

- **PART A — Skin Cancer (QuantumDerma family):** 7-class HAM10000, 4 quantum variants.
- **PART B — Pneumonia (QuantumPneu):** Binary chest X-ray (NORMAL / PNEUMONIA).

---

## Contents

| Shared / Part | Section |
|---|---|
| **Shared** | [🏁 One Command — Train BOTH Tasks End-to-End](#-one-command--train-both-tasks-end-to-end) |
| **Shared** | [⚠️ Class-Imbalance + Collapse Overview](#-class-imbalance--collapse-overview) |
| **Shared** | [🚨 PowerShell Critical Gotcha](#-powershell-critical-gotcha-the-bug-you-just-hit) |
| **Shared** | [0. Prerequisites (run once per machine)](#0-prerequisites-run-once-per-machine) |
| **PART A** | [Skin Cancer — 1. Dataset Preparation](#part-a--skin-cancer--quantumderma-family) → [2. P0 Baseline Reproduction](#a2--phase-0--reproduce-the-protected-baseline-p0-first) → [3–11. Ablations + Final Validation](#a3-phase-1--label-smoothing-ablation-one-var---label-smoothing) → [Artifacts / Flags](#a14-where-results-are-written) |
| **PART B** | [Pneumonia — 1. Dataset Preparation](#part-b--pneumonia--quantumpneu) → [2. Classical Backbone (feature extractor)](#b2-train-the-classical-backbone-first-pneuvision) → [3. Quantum P0 Baseline Reproduction](#b3-phase-0--quantumpneu-baseline-reproduction-p0) → [4–11. Ablations + Final Validation](#b4-phase-1--focal-gamma-ablation-one-var) → [Artifacts / Flags](#b12-where-results-are-written) |
| **Shared** | [Flag Reference Tables](#appendix-1--cli-flag-reference) |
| **Shared** | [Common Recipe Cheatsheet](#appendix-2--common-recipe-cheatsheet) |

---

## 🏁 ONE COMMAND — Train BOTH Tasks End-to-End

No script to create. Copy-paste either block below into a PowerShell prompt
inside the activated conda/venv at the repo root. Uses protected P0
hyperparameters for **both** models (Skin Cancer QuantumDerma + Pneumonia
QuantumPneu) with explicit PowerShell array splatting and `;` sequential
chaining (PowerShell 5 doesn't support `&&`).

---

### ✅ Option A — One-shot inline (recommended, fully visible)

```powershell
# ============================================================
# P0 PROTECTED BASELINE — BOTH TASKS (sequential)
# Order: Skin data prep → Skin QuantumDerma P0 →
#        Pneumonia backbone 8-epoch → Pneumonia QuantumPneu P0
# ============================================================

$ErrorActionPreference = "Stop"   # bail on first non-zero exit

# --- Skin Cancer (7-class HAM10000) ---
python -m ml.skin_cancer.data.audit_dataset       ; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
python -m ml.skin_cancer.data.detect_duplicates   ; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
python -m ml.skin_cancer.data.split_dataset       ; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$P0_SKIN = @(
  "--model",           "QuantumDerma"
  "--seed",            "42"
  "--pca-components",  "16"
  "--focal-gamma",     "2.0"
  "--label-smoothing", "0.0"
  "--lr",              "0.0005"
  "--weight-decay",    "0.01"
  "--scheduler",       "cosine_restarts"
  "--cosine-T0",       "10"
  "--epochs",          "30"
  "--batch-size",      "64"
  "--max-grad-norm",   "1.0"
  "--patience",        "10"
  "--scaler-type",     "standard"
  "--post-norm",       "none"
  "--no-resume"
)
python -m ml.skin_cancer.training.train_quantum @P0_SKIN --experiment-name "BOTH_P0_skin_s42" ; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# --- Pneumonia (binary chest X-ray) ---
python -m ml.pneumonia.data.audit_dataset --root datasets/PNEUMONIA ; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
python -m ml.pneumonia.training.train  --epochs 8 --batch-size 32 --root datasets/PNEUMONIA ; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$P0_PNEU = @(
  "--config", "quantum.yaml"
  "--root",   "datasets/PNEUMONIA"
)
python -m ml.pneumonia.training.train_quantum @P0_PNEU ; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== BOTH TASKS DONE ===" -ForegroundColor Green
Write-Host "Skin results: models/skin_cancer/quantum/QuantumDerma/ + reports/"
Write-Host "Pneu results: models/pneumonia/ + reports/pneumonia/"
```

**What it runs, in order:**
1. Skin: audit → dedupe → stratified 70/15/15 split
2. Skin: QuantumDerma P0 (16-PCA, Focal γ=2.0, LS=0.0, CosineRestarts)
3. Pneumonia: audit ImageFolder
4. Pneumonia: PneuVision backbone 8-epoch warm-start (head-only → unfreeze)
5. Pneumonia: QuantumPneu P0 (8-qubit × 4-layer, StandardScaler→PCA(8) fit train-only, weighted Focal γ=2.0, val-tuned decision threshold)

Total wall-time estimate (desktop RTX): **~45–90 min** (skin ~20–40 min +
pneumonia backbone ~10 min + pneumonia quantum ~15–40 min). CPU-only will
be 5–10× longer.

---

### ✅ Option B — Save as reusable script `train_both.ps1` (for overnight runs)

```powershell
# Save this file in the repo root as:   .\train_both.ps1
# Run it with:                          .\train_both.ps1
#
# Optional: pass a custom root for the pneumonia dataset:
#   .\train_both.ps1 -PneuRoot "D:\data\chest_xray" -SkinEpochs 100 -PneuEpochs 50
#
# Prereq: env activated, deps OK (see §0 in this document)
[CmdletBinding()]
param(
  [string]$SkinModel      = "QuantumDerma",
  [string]$PneuConfig     = "quantum.yaml",
  [string]$PneuRoot       = "datasets/PNEUMONIA",
  [int]$Seed              = 42,
  [int]$SkinEpochs        = 30,
  [int]$PneuBackboneEpochs = 8,
  [string]$ExperimentTag  = (Get-Date -Format "yyyyMMdd_HHmm")
)

$ErrorActionPreference = "Stop"

function run($cmd) {
  Write-Host "`n>>> $cmd" -ForegroundColor Cyan
  & pwsh -NoProfile -NonInteractive -Command $cmd
  if ($LASTEXITCODE -ne 0) { throw "FAILED (exit=$LASTEXITCODE): $cmd" }
}

# ---------- Skin Cancer ----------
run "python -m ml.skin_cancer.data.audit_dataset"
run "python -m ml.skin_cancer.data.detect_duplicates"
run "python -m ml.skin_cancer.data.split_dataset"

$skinArgs = @(
  "--model",           $SkinModel
  "--seed",            "$Seed"
  "--pca-components",  "16"
  "--focal-gamma",     "2.0"
  "--label-smoothing", "0.0"
  "--lr",              "0.0005"
  "--weight-decay",    "0.01"
  "--scheduler",       "cosine_restarts"
  "--cosine-T0",       "10"
  "--epochs",          "$SkinEpochs"
  "--batch-size",      "64"
  "--max-grad-norm",   "1.0"
  "--patience",        "10"
  "--scaler-type",     "standard"
  "--post-norm",       "none"
  "--no-resume"
)
# Use a here-string so PowerShell re-layers the args array correctly via python -c
$expName = "BOTH_${ExperimentTag}_skin_s${Seed}"
run "python -m ml.skin_cancer.training.train_quantum $($skinArgs -join ' ') --experiment-name `"$expName`""

# ---------- Pneumonia ----------
run "python -m ml.pneumonia.data.audit_dataset --root `"$PneuRoot`""
run "python -m ml.pneumonia.training.train  --epochs $PneuBackboneEpochs --batch-size 32 --root `"$PneuRoot`""
run "python -m ml.pneumonia.training.train_quantum --config `"$PneuConfig`" --root `"$PneuRoot`""

Write-Host "`n=== BOTH TASKS COMPLETED (tag=$ExperimentTag, seed=$Seed) ===" -ForegroundColor Green
Write-Host "Skin : models/skin_cancer/quantum/$SkinModel/ + reports/"
Write-Host "Pneu : models/pneumonia/ + reports/pneumonia/"
```

Then execute:
```powershell
# Default (P0 settings, 30 epochs skin + 8 + 30 epochs pneu)
.\train_both.ps1

# Overnight run — longer final training on both:
.\train_both.ps1 -SkinEpochs 100 -ExperimentTag "overnight_final"
```

---

### 📋 Post-run acceptance check (BOTH tasks)

After the one-shot finishes, run this to print both task summaries in one line:

```powershell
python -c "
import json, pathlib as P
sm = P.Path('models/skin_cancer/quantum/QuantumDerma/final_metrics.json')
pm = P.Path('models/pneumonia/quantum/QuantumPneu/metrics.json')
pm2= P.Path('models/pneumonia/quantum_metrics.json')
if not pm.exists() and pm2.exists(): pm = pm2
s = json.loads(sm.read_text()) if sm.exists() else {}
p = json.loads(pm.read_text())  if pm.exists()  else {}
def g(d, *ks):
    for k in ks:
        if k in d: return d[k]
        for v in d.values():
            if isinstance(v, dict) and k in v: return v[k]
    return 'N/A'
print(f'SKIN    Macro F1     = {g(s,\"macro_f1\",\"val_macro_f1\",\"test_macro_f1\")}')
print(f'SKIN    Balanced Acc = {g(s,\"balanced_accuracy\",\"val_balanced_accuracy\",\"test_balanced_accuracy\")}')
print(f'SKIN    ROC-AUC      = {g(s,\"roc_auc\",\"val_roc_auc\",\"test_roc_auc\")}')
print(f'PNEU    Test Macro F1= {g(p,\"macro_f1\",\"test_macro_f1\",\"macro_f1_test\")}')
print(f'PNEU    Sensitivity  = {g(p,\"sensitivity\",\"recall_1\",\"test_sensitivity\")}')
print(f'PNEU    Specificity  = {g(p,\"specificity\",\"specificity_test\",\"test_specificity\")}')
print(f'PNEU    ROC-AUC      = {g(p,\"roc_auc\",\"test_roc_auc\",\"roc_auc_test\")}')
print(f'PNEU    Threshold    = {g(p,\"decision_threshold\",\"threshold\",\"best_threshold\")}')
"
```

Compare against:
- **Skin P0 bar:** Macro F1 ≥ ~0.39, all 7 classes F1 > 0 (acceptance table §A.2.3)
- **Pneu P0 bar:** Test Macro F1 ≥ ~0.95, Sensitivity ≥ 0.94, threshold ≠ 0.5 (acceptance table §B.3.3)

---

---

## ⚠️ Class-Imbalance + Collapse Overview

Both datasets are imbalanced. Failure mode if mishandled: the model always
predicts the majority class, Macro F1 collapses, and the optimizer ends up
in a bad local minimum within the first ~6 epochs.

| Dataset | Classes | Majority class | Approx imbalance ratio | Baseline imbalance defense |
|---|---|---|---|---|
| **HAM10000 (Skin)** | 7 (akiec, bcc, bkl, df, **nv**, vasc, mel) | `nv` ≈ 67% | ~ 65 : 1 (nv vs df) | FocalLoss γ=2.0 alone (P0 default); sampler + class-weights as ablations |
| **Chest X-ray (Pneumonia)** | 2 (**NORMAL**, PNEUMONIA) | `PNEUMONIA` (usually ~70–75% of train) | ~ 3 : 1 or worse | Class weights **always on** + FocalLoss γ=2.0; threshold-tuned at end |

**Hard P0 recovery rule (applies to BOTH models):**
1. Reproduce the protected baseline first (Skin ≈ 0.39 Macro F1; Pneu ≈ 0.95 Macro F1) with **exactly one config** before any ablation.
2. One variable changes per ablation experiment.
3. Never optimize / select by raw accuracy alone. Always optimize **Macro F1** (primary) → Balanced Accuracy (secondary) → ROC-AUC (tertiary).

---

## 🚨 PowerShell Critical Gotcha (the bug you just hit)

❌ **DO NOT** write the baseline args as one flat string:
```powershell
# WRONG — argparse sees one giant unrecognised token
$p0 = "--model QuantumDerma --seed 42 ..."
python -m ml.skin_cancer.training.train_quantum ... $p0
```

✅ **ALWAYS** use a **PowerShell array** (`@(...)`) with one token per element,
then **splat** it with `@arrname` (or just `$arrname`; arrays enumerate
automatically for external commands):
```powershell
# CORRECT — each element is its own argv token
$p0 = @(
  "--model", "QuantumDerma"
  "--seed",  "42"
  "--no-resume"
)
python -m ml.skin_cancer.training.train_quantum --experiment-name "X" @p0
```
Every example below follows this pattern. Copy-paste verbatim.

---

## 0. Prerequisites (run once per machine)

### 0.1 Activate environment & verify deps

```powershell
.\.venv\Scripts\Activate.ps1
python -c "import pennylane as qml; import torch; import sklearn; import joblib; import yaml; import tqdm; import torchvision; print('deps OK')"
```

Expected output: `deps OK`. If any import fails, `pip install -r` the
project's requirements file.

### 0.2 Verify device (CUDA / CPU)

```powershell
python -c "import torch; print('cuda' if torch.cuda.is_available() else 'cpu')"
```

- `cuda` → GPU used (fast, recommended)
- `cpu` → CPU (slow, still correct)

### 0.3 (Optional) Full CLI help

```powershell
python -m ml.skin_cancer.training.train_quantum --help   # Skin Cancer
python -m ml.pneumonia.training.train_quantum --help      # Pneumonia (quantum)
python -m ml.pneumonia.training.train --help              # Pneumonia (classical backbone)
```

Per-task flag tables are at the bottom: [Appendix 1](#appendix-1--cli-flag-reference).

---

---

# PART A — SKIN CANCER (QuantumDerma Family)

7-class classification on HAM10000 MNIST-CSV (`akiec, bcc, bkl, df, nv, vasc, mel`).
Four quantum model builders: **QuantumDerma**, **QuantumDermaX**, **VitaQ-Derm**, **QSkin-Vortex**.

---

## A.1. Dataset Preparation (run ONCE, ever)

These are **idempotent** — safe to re-run, they only rebuild if the output
manifest is missing.

```powershell
# 1a. Audit → reports/dataset_audit.json + class_distribution.csv/.png
python -m ml.skin_cancer.data.audit_dataset

# 1b. Hash-based duplicate detection
python -m ml.skin_cancer.data.detect_duplicates

# 1c. Stratified 70 / 15 / 15 split (class-balanced per fold)
python -m ml.skin_cancer.data.split_dataset
```

Verify the split distribution with:
```powershell
python -c "
from ml.skin_cancer.data.split_dataset import load_manifest
df = load_manifest()
print(df.groupby(['split','class_id']).size().unstack(fill_value=0))
"
```
You should see ~70/15/15 per split, with every class present in train/val/test.

---

## A.2. 🛑 PHASE 0 — Reproduce the Protected Baseline (P0) FIRST

**DO NOT SKIP THIS STEP.** Every optimization phase below starts from a
known-good point. If P0 does not reach **~0.39 Macro F1** by epoch ~30, stop
the ablations and read the collapse banner / logits stats / prediction
distribution first.

### A.2.1 Define the P0 baseline array

```powershell
# P0 — exact known-good hyperparameters (matches protected baseline)
$P0_SKIN = @(
  "--model",           "QuantumDerma"
  "--seed",            "42"
  "--pca-components",  "16"
  "--focal-gamma",     "2.0"
  "--label-smoothing", "0.0"          # ⚠️ KEEP 0.0 until P0 passes
  "--lr",              "0.0005"
  "--weight-decay",    "0.01"
  "--scheduler",       "cosine_restarts"
  "--cosine-T0",       "10"
  "--epochs",          "30"           # enough to confirm upward trend
  "--batch-size",      "64"
  "--max-grad-norm",   "1.0"
  "--patience",        "10"
  "--scaler-type",     "standard"
  "--post-norm",       "none"
  # Sampler + class weights OFF in P0: use focal gamma alone
  # (enable only as explicit ablation experiments below)
  "--no-resume"
)
```

### A.2.2 Run P0

```powershell
python -m ml.skin_cancer.training.train_quantum @P0_SKIN --experiment-name "P0_reproduce_baseline_s42"
```

### A.2.3 P0 acceptance criteria (must ALL be true)

| Criterion | Pass value |
|---|---|
| Val **Macro F1** (best) | ≥ **0.38** (target ~0.3945 at epoch ~26) |
| Val **Accuracy** (best) | ≈ 0.65 (do NOT use for selection) |
| Val **ROC-AUC** (best) | ≈ 0.83 |
| Per-class val F1 | **All 7 classes > 0.0** (akiec, bcc, bkl, df, nv, vasc, mel) |
| Collapse banner | Must NOT appear after epoch ~5–6 |
| `[predicted]` line per epoch | Non-zero counts for ≥ 6 classes; `nv` majority but < 80% |
| `[logits_val]` stats | `std > 0` (no constant-logits saturation) |
| `qgrad_norm` per epoch | `> 0` and varies (no fully dead quantum path) |

**If P0 fails → STOP.** Re-check diagnostics before changing anything. The
most common fix: confirm `--label-smoothing 0.0`, delete
`models/quantum/QuantumDerma/last.pt`, and rerun with `--no-resume`.

---

## A.3. PHASE 1 — Label Smoothing Ablation (one var: `--label-smoothing`)

**ONLY after P0 ≥ 0.39 Macro F1.** Change exactly one variable from P0.

```powershell
# Exp 1 — LS=0.0 (sanity-check, same as P0)
python -m ml.skin_cancer.training.train_quantum @P0_SKIN --label-smoothing 0.00 --experiment-name "EXP1_ls_0.00"

# Exp 2 — LS=0.05 (ONLY change from Exp 1)
python -m ml.skin_cancer.training.train_quantum @P0_SKIN --label-smoothing 0.05 --experiment-name "EXP2_ls_0.05"

# Exp 3 — LS=0.10 (ONLY change from Exp 1)
python -m ml.skin_cancer.training.train_quantum @P0_SKIN --label-smoothing 0.10 --experiment-name "EXP3_ls_0.10"
```

Pick the `LS` with **highest validation Macro F1**.

---

## A.4. PHASE 2 — Focal Gamma Ablation (one var: `--focal-gamma`)

Reuse `@P0_SKIN`; change only `--focal-gamma`.

```powershell
# Exp 4 — γ=1.0 (ONLY change)
python -m ml.skin_cancer.training.train_quantum @P0_SKIN --focal-gamma 1.0 --experiment-name "EXP4_gamma_1.0"

# Exp 5 — γ=2.0 (sanity-check, same as P0)
python -m ml.skin_cancer.training.train_quantum @P0_SKIN --focal-gamma 2.0 --experiment-name "EXP5_gamma_2.0"

# Exp 6 — γ=3.0 (ONLY change; watch for training instability)
python -m ml.skin_cancer.training.train_quantum @P0_SKIN --focal-gamma 3.0 --experiment-name "EXP6_gamma_3.0"
```

Pick the `γ` with **highest validation Macro F1**.

---

## A.5. PHASE 3 — Sampling / Class-Weight Ablation

These two are **mutually exclusive** in the code (the guard at
`train_quantum.py` line ~361 sets `weights=None` whenever `balanced_sampling`
is on — to avoid double-correcting the imbalance). Run as separate
single-variable ablations against P0.

```powershell
# Exp 7 — Balanced WeightedRandomSampler = ON, class weights = OFF
#   (ONLY change from P0: add --balanced-sampling)
python -m ml.skin_cancer.training.train_quantum @P0_SKIN --balanced-sampling --experiment-name "EXP7_balanced_sampler_no_w"

# Exp 8 — Sampler = OFF, mild inverse-freq class weights = ON in FocalLoss
#   (ONLY change from P0: add --use-class-weights)
python -m ml.skin_cancer.training.train_quantum @P0_SKIN --use-class-weights --experiment-name "EXP8_normal_sampler_mild_w"
```

> ⚠️ `--balanced-sampling` is a **store_true** flag. There is **no such
> syntax as `--balanced-sampling False`**. To turn it off, simply **omit the
> flag** (defaults to `false` per `quantum.yaml`). Same pattern for
> `--use-class-weights`, `--no-resume`, `--skip-leaderboard`.

---

## A.6. PHASE 4–8 — One-Variable Sweeps (LR, WD, PCA, Capacity, Interface)

All change exactly **one** variable vs `@P0_SKIN`.

```powershell
# PHASE 4 — LR
foreach ($lr in @(0.0001, 0.00025, 0.0004, 0.0005, 0.00075)) {
  python -m ml.skin_cancer.training.train_quantum @P0_SKIN --lr $lr --experiment-name "EXP_lr_$lr"
}

# PHASE 5 — Weight Decay
foreach ($wd in @(0.0, 0.0001, 0.001, 0.005, 0.01, 0.02)) {
  python -m ml.skin_cancer.training.train_quantum @P0_SKIN --weight-decay $wd --experiment-name "EXP_wd_$wd"
}

# PHASE 6 — PCA components
foreach ($pca in @(8, 12, 16, 20, 24, 32)) {
  python -m ml.skin_cancer.training.train_quantum @P0_SKIN --pca-components $pca --experiment-name "EXP_pca_$pca"
}
```

> **PCA leakage safety**: `fit_pca` refits scaler+PCA on **train only** when
> any of `pca_components / scaler_type / post_norm` change, so these runs
> are provably leakage-free.

```powershell
# PHASE 7a — Qubit sweep (layers fixed at P0 baseline 4)
foreach ($q in @(4, 6, 8, 10)) {
  python -m ml.skin_cancer.training.train_quantum @P0_SKIN --qubits $q --layers 4 --experiment-name "EXP_q_${q}"
}

# PHASE 7b — Layer sweep (qubits fixed at P0 baseline 10)
foreach ($l in @(1, 2, 3, 4)) {
  python -m ml.skin_cancer.training.train_quantum @P0_SKIN --qubits 10 --layers $l --experiment-name "EXP_l_${l}"
}
```

> **One variable at a time.** Never sweep qubits AND layers in the same run.

```powershell
# PHASE 8 — Scaler + Post-PCA Norm (3 scalers × 2 norms = 6 configs)
foreach ($s in @('standard','minmax','none')) {
  foreach ($n in @('none','l2')) {
    python -m ml.skin_cancer.training.train_quantum @P0_SKIN `
      --scaler-type $s --post-norm $n `
      --experiment-name "EXP_sca_${s}__pn_${n}"
  }
}
```

---

## A.7. PHASE 9 — Statistical Validation (MANDATORY, 3 seeds)

Once you have a **single best configuration** from the leaderboard
(highest Macro F1 → Balanced Acc → ROC-AUC tiebreaks):

```powershell
# Put the winning config here (example shown = P0 baseline)
$BEST_SKIN = @(
  "--model",           "QuantumDerma"
  "--pca-components",  "16"
  "--focal-gamma",     "2.0"
  "--label-smoothing", "0.0"
  "--lr",              "0.0005"
  "--weight-decay",    "0.01"
  "--scheduler",       "cosine_restarts"
  "--cosine-T0",       "10"
  "--epochs",          "100"
  "--batch-size",      "64"
  "--max-grad-norm",   "1.0"
  "--patience",        "10"
  "--scaler-type",     "standard"
  "--post-norm",       "none"
  "--no-resume"
)

python -m ml.skin_cancer.training.train_quantum @BEST_SKIN --seed 42   --experiment-name "FINAL_s42"
python -m ml.skin_cancer.training.train_quantum @BEST_SKIN --seed 123  --experiment-name "FINAL_s123"
python -m ml.skin_cancer.training.train_quantum @BEST_SKIN --seed 2026 --experiment-name "FINAL_s2026"
```

Report **mean ± std of Macro F1 across 3 seeds**. Never claim a config is
superior on only 1 seed.

---

## A.8. Skin Cancer Quick Ablation Leaderboard

| Experiment | What changed from P0 | Macro F1 | Balanced Acc | ROC-AUC | Best epoch |
|---|---|---|---|---|---|
| P0_reproduce_baseline_s42 | *(baseline — all vars frozen)* | (fill) | (fill) | (fill) | (fill) |
| EXP1_ls_0.00              | `--label-smoothing 0.00` (sanity) | (fill) | (fill) | (fill) | (fill) |
| EXP2_ls_0.05              | `--label-smoothing 0.05` | (fill) | (fill) | (fill) | (fill) |
| EXP3_ls_0.10              | `--label-smoothing 0.10` | (fill) | (fill) | (fill) | (fill) |
| EXP4_gamma_1.0            | `--focal-gamma 1.0` | (fill) | (fill) | (fill) | (fill) |
| EXP5_gamma_2.0            | `--focal-gamma 2.0` (sanity) | (fill) | (fill) | (fill) | (fill) |
| EXP6_gamma_3.0            | `--focal-gamma 3.0` | (fill) | (fill) | (fill) | (fill) |
| EXP7_balanced_sampler_no_w| `--balanced-sampling` | (fill) | (fill) | (fill) | (fill) |
| EXP8_normal_sampler_mild_w| `--use-class-weights` | (fill) | (fill) | (fill) | (fill) |

**Selection rule (enforced in code + leaderboard):**
1. PRIMARY: highest **Macro F1** (validation)
2. SECONDARY: highest **Balanced Accuracy** among ties
3. TERTIARY: higher **ROC-AUC**, lower **ECE**
4. NEVER select by accuracy alone (nv ≈ 67% → accuracy is not a signal)

---

## A.9. Full Pipeline — All 4 Skin Cancer Quantum Variants

Once P0 is reproduced for QuantumDerma, optionally run the same
hyperparameters across **all four quantum model variants**:

```powershell
python -m ml.skin_cancer.training.run_pipeline --full `
  --seed 42 `
  --pca-components 16 `
  --focal-gamma 2.0 `
  --label-smoothing 0.0 `
  --lr 0.0005 `
  --weight-decay 0.01 `
  --scheduler cosine_restarts `
  --cosine-T0 10 `
  --epochs 100 `
  --batch-size 64 `
  --patience 10 `
  --scaler-type standard `
  --post-norm none `
  --no-resume
```

---

## A.14. Where Results Are Written (Skin Cancer)

Artifacts written to two trees after each run:

| Artifact | Path under `models/skin_cancer/quantum/QuantumDerma/` | Path under `reports/` |
|---|---|---|
| Best Macro F1 checkpoint | `best_macro_f1.pt` / `best.pt` | — |
| Best Balanced Acc checkpoint | `best_balanced_accuracy.pt` | — |
| Best ROC-AUC checkpoint | `best_roc_auc.pt` | — |
| Resume state | `last.pt` | — |
| Hparams + experiment metadata | `experiment.json`, `config.json` | — |
| Final metrics (leaderboard row) | `final_metrics.json`, `metrics.json` | `reports/<model>/metrics.json` |
| Training history (per-epoch diagnostics) | `training_history.json` | `reports/<model>/training_history.json` |
| Train/val/LR curves | — | `train_loss.png`, `val_macro_f1.png`, `val_accuracy.png`, `learning_rate.png` |
| Confusion matrix (raw + normalized) | — | `confusion_matrix.png`, `confusion_matrix_normalized.png` |
| ROC / PR curves | — | `roc_curve.png`, `pr_curve.png` |
| Calibration | `calibration.json` | `calibration.png` |
| Per-class F1 / recall | — | `per_class_f1.png`, `per_class_recall.png` |
| Per-sample predictions + errors | — | `predictions.csv` (+ error analysis) |
| **Auto-ranked leaderboard (JSON)** | — | `reports/experiments/leaderboard.json` |
| **Auto-ranked leaderboard (Markdown)** | `docs/quick_experiments_leaderboard.md` | `reports/experiments/quick_experiments_leaderboard.md` |

The markdown leaderboard is sorted **by Macro F1 descending** (never
accuracy). Refresh the file after each experiment.

---

---

# PART B — PNEUMONIA (QuantumPneu)

Binary chest X-ray classification: class `0 = NORMAL`, class `1 = PNEUMONIA`.

> ⚠️ **Key differences vs Skin Cancer:**
> 1. QuantumPneu uses the default `ImageFolder` layout. Dataset must live
>    under `datasets/PNEUMONIA/{train,val,test}/` where each split folder
>    contains `NORMAL/` and `PNEUMONIA/` sub-folders. If `val/` is absent,
>    a deterministic 90/10 split is created automatically from train.
> 2. **Classical backbone (PneuVision) MUST be trained first.** It's the CNN
>    feature extractor. The quantum step auto-trains it if the checkpoint
>    is missing, but it's faster and more reproducible to do Step B.2
>    explicitly.
> 3. Class weights + Focal Loss are **always on** in the quantum pipeline
>    (imbalance is typically ~ 3:1 or worse for `PNEUMONIA : NORMAL`).
> 4. Decision threshold is **tuned on val** at the end and stored in the
>    checkpoint — never use the naive 0.5 default.
> 5. Only ONE quantum builder (`QuantumPneu`) — no 4-model family sweep.

---

## B.1. Dataset Preparation (run ONCE, ever)

### B.1.1 Expected directory layout

Ensure the dataset matches:
```text
datasets/PNEUMONIA/
├── train/
│   ├── NORMAL/      (class 0)
│   └── PNEUMONIA/   (class 1)
├── val/              (optional; if absent, 10% of train is used)
│   ├── NORMAL/
│   └── PNEUMONIA/
└── test/
    ├── NORMAL/
    └── PNEUMONIA/
```
Supported extensions: `.jpg`, `.jpeg`, `.png`. Metadata artifacts
(`__MACOSX`, `.DS_Store`, `Thumbs.db`, `._*` files) are auto-excluded.

### B.1.2 Audit + verify

```powershell
# Dataset audit → reports/pneumonia/dataset_audit.json
python -m ml.pneumonia.data.audit_dataset --root datasets/PNEUMONIA
```

Expected: the JSON report shows `NORMAL` and `PNEUMONIA` counts for every
split. Typical imbalance: `train` has 2–4× more `PNEUMONIA` than `NORMAL`
(Kaggle standard Chest-XRay dataset is ~ 3883 NORMAL / 1341 PNEUMONIA in
test, train is much heavier toward PNEUMONIA).

---

## B.2. Train the Classical Backbone First (PneuVision)

PneuVision is the EfficientNet-B0 feature extractor that feeds quantum PCA.
Train it explicitly for reproducibility (the quantum step auto-launches this
if `models/pneumonia/best.pt` is missing, but doing it separately lets you
inspect backbone metrics).

```powershell
# 8 epochs; batch 32; image 224; seed 42 hard-coded inside train()
python -m ml.pneumonia.training.train --epochs 8 --batch-size 32 --root datasets/PNEUMONIA
```

Artifacts written:
- `models/pneumonia/best.pt` — best PneuVision checkpoint (required by quantum step)
- `models/pneumonia/metrics.json` — final test metrics (Macro F1, ROC-AUC, decision threshold)

Acceptance threshold for the backbone:
- **Test Macro F1 ≥ 0.93**, **ROC-AUC ≥ 0.97** on a standard Chest-XRay dataset.

---

## B.3. 🛑 PHASE 0 — QuantumPneu Baseline Reproduction (P0)

Reproduce the default config FIRST before any ablation. Change NO variables.

### B.3.1 The P0 baseline (PowerShell array)

```powershell
$P0_PNEU = @(
  "--config", "quantum.yaml"
  "--root",   "datasets/PNEUMONIA"
)
```

> Unlike skin cancer, QuantumPneu is config-driven YAML-first. Overrides are
> done by **editing `ml/pneumonia/configs/quantum.yaml`** (see Phase 1+ below)
> or by passing a **different `--config` file** per experiment.

### B.3.2 Run P0

```powershell
python -m ml.pneumonia.training.train_quantum @P0_PNEU
```

What this does end-to-end (see [train_quantum_pneu()](file:///f:/Hackathon/SIH(2026)/QDoc/ml/pneumonia/training/train_quantum.py#L93-L282)):
1. Loads PneuVision `best.pt` (auto-trains 8-epoch backbone if missing)
2. Extracts CNN features on train / val / test
3. Fits **StandardScaler → PCA(8)** on **train features only** (no leakage), saves `.pkl`
4. Builds `QuantumPneu` (8 qubits, 4 variational layers, angle embedding, strongly entangling ansatz, data re-uploading)
5. Trains with **FocalLoss γ=2.0 + inverse-freq class weights + label smoothing 0.1**, AdamW (lr=5e-4, WD=1e-5), CosineAnnealingWarmRestarts, patience=8 early stop on Macro F1
6. At end: **tunes optimal decision threshold** on val (threshold search 0.15–0.85, step 0.01, best Macro F1)
7. Evaluates test set with that threshold → sensitivity/specificity/MacroF1/ROC-AUC

### B.3.3 P0 acceptance criteria

| Criterion | Pass value |
|---|---|
| **Val best Macro F1** | ≥ 0.94 |
| **Test Macro F1** (with tuned threshold) | ≥ 0.95 |
| **Test ROC-AUC** | ≥ 0.975 |
| **Test Sensitivity (Recall PNEUMONIA)** | ≥ 0.94 (failing to catch pneumonia is medically dangerous) |
| **Test Specificity (TN rate on NORMAL)** | ≥ 0.88 |
| **Decision threshold** | ≠ 0.5 (tuner is working; if exactly 0.5 rerun with broader range) |
| Per-epoch val Macro F1 | Monotonically rising for first ~5–10 epochs (no collapse to all-1s or all-0s) |

**If P0 fails → STOP.** Most common fixes:
1. Re-verify dataset class folders match the expected layout.
2. Check class counts in audit JSON (if NORMAL is ≤ 5% of train the imbalance-ratio is too extreme — either use a stronger sampler or upsample NORMAL offline).
3. Ensure backbone `models/pneumonia/best.pt` Macro F1 ≥ 0.93 (bad backbone = bad quantum features).

---

## B.4. PHASE 1 — Focal Gamma Ablation (one var)

Pneumonia defaults to weighted-Focal γ=2.0. Sweep γ against P0.

**Workflow (YAML-copy-per-experiment, reproducible):**

```powershell
# For each experiment, copy YAML → patch ONE key → run with --config
$configs = @(
  @{ name = "P1_gamma_1.0"; patch = @{ quantum = @{ focal_gamma = 1.0 } } },
  @{ name = "P1_gamma_2.0"; patch = @{ quantum = @{ focal_gamma = 2.0 } } },  # P0 sanity
  @{ name = "P1_gamma_3.0"; patch = @{ quantum = @{ focal_gamma = 3.0 } } }
)

foreach ($exp in $configs) {
  $cfg_path = "ml/pneumonia/configs/_exp_$($exp.name).yaml"

  # Start from quantum.yaml base, apply patch, save as experiment config
  @"
seed: 42
dataset:
  root: datasets/PNEUMONIA
  image_size: 224
training:
  epochs: 30
  batch_size: 32
  num_workers: 0
  lr: 5.0e-4
  weight_decay: 1.0e-5
  patience: 8
  label_smoothing: 0.1
  cosine_T0: 8
  max_grad_norm: 1.0
quantum:
  qubits: 8
  layers: 4
  pca_components: 8
  embedding: angle
  ansatz: strongly
  data_reupload: true
  dropout: 0.2
  focal_gamma: $($exp.patch.quantum.focal_gamma)
model:
  name: QuantumPneu
  backbone: PneuVision
"@ | Set-Content -Encoding utf8 $cfg_path

  python -m ml.pneumonia.training.train_quantum --config $cfg_path --root datasets/PNEUMONIA
}
```

Pick the γ with **highest test Macro F1**.

---

## B.5. PHASE 2 — Label Smoothing Ablation

Binary imbalance + smoothing: LS = 0.0 sometimes helps minority precision;
0.1 is standard. Sweep as one-variable change.

```powershell
$vals = @(0.0, 0.05, 0.1, 0.15)
foreach ($ls in $vals) {
  $safeLs = $ls.ToString().Replace('.', '_')
  $cfg_path = "ml/pneumonia/configs/_exp_P2_ls_$safeLs.yaml"
  @"
seed: 42
dataset:
  root: datasets/PNEUMONIA
  image_size: 224
training:
  epochs: 30
  batch_size: 32
  num_workers: 0
  lr: 5.0e-4
  weight_decay: 1.0e-5
  patience: 8
  label_smoothing: $ls
  cosine_T0: 8
  max_grad_norm: 1.0
quantum:
  qubits: 8
  layers: 4
  pca_components: 8
  embedding: angle
  ansatz: strongly
  data_reupload: true
  dropout: 0.2
  focal_gamma: 2.0
model:
  name: QuantumPneu
  backbone: PneuVision
"@ | Set-Content -Encoding utf8 $cfg_path
  python -m ml.pneumonia.training.train_quantum --config $cfg_path --root datasets/PNEUMONIA
}
```

---

## B.6. PHASE 3 — LR + Weight Decay

```powershell
# LR sweep (WD fixed at P0 default 1e-5)
foreach ($lr in @(1e-4, 2.5e-4, 5e-4, 7.5e-4, 1e-3)) {
  $safe = $lr.ToString().Replace('.', '_')
  $cfg_path = "ml/pneumonia/configs/_exp_P3_lr_$safe.yaml"
  @"
seed: 42
dataset: { root: datasets/PNEUMONIA, image_size: 224 }
training:
  epochs: 30; batch_size: 32; num_workers: 0
  lr: $lr; weight_decay: 1.0e-5; patience: 8
  label_smoothing: 0.1; cosine_T0: 8; max_grad_norm: 1.0
quantum:
  qubits: 8; layers: 4; pca_components: 8
  embedding: angle; ansatz: strongly; data_reupload: true
  dropout: 0.2; focal_gamma: 2.0
model: { name: QuantumPneu, backbone: PneuVision }
"@ | Set-Content -Encoding utf8 $cfg_path
  python -m ml.pneumonia.training.train_quantum --config $cfg_path --root datasets/PNEUMONIA
}

# WD sweep (LR fixed at P0 default 5e-4)
foreach ($wd in @(0.0, 1e-6, 1e-5, 1e-4, 1e-3)) {
  $safe = $wd.ToString().Replace('.', '_')
  $cfg_path = "ml/pneumonia/configs/_exp_P3_wd_$safe.yaml"
  @"
seed: 42
dataset: { root: datasets/PNEUMONIA, image_size: 224 }
training:
  epochs: 30; batch_size: 32; num_workers: 0
  lr: 5.0e-4; weight_decay: $wd; patience: 8
  label_smoothing: 0.1; cosine_T0: 8; max_grad_norm: 1.0
quantum:
  qubits: 8; layers: 4; pca_components: 8
  embedding: angle; ansatz: strongly; data_reupload: true
  dropout: 0.2; focal_gamma: 2.0
model: { name: QuantumPneu, backbone: PneuVision }
"@ | Set-Content -Encoding utf8 $cfg_path
  python -m ml.pneumonia.training.train_quantum --config $cfg_path --root datasets/PNEUMONIA
}
```

---

## B.7. PHASE 4 — PCA Dimensionality

```powershell
foreach ($pca in @(4, 6, 8, 12, 16, 24)) {
  $cfg_path = "ml/pneumonia/configs/_exp_P4_pca_$pca.yaml"
  @"
seed: 42
dataset: { root: datasets/PNEUMONIA, image_size: 224 }
training:
  epochs: 30; batch_size: 32; num_workers: 0
  lr: 5.0e-4; weight_decay: 1.0e-5; patience: 8
  label_smoothing: 0.1; cosine_T0: 8; max_grad_norm: 1.0
quantum:
  qubits: 8; layers: 4; pca_components: $pca
  embedding: angle; ansatz: strongly; data_reupload: true
  dropout: 0.2; focal_gamma: 2.0
model: { name: QuantumPneu, backbone: PneuVision }
"@ | Set-Content -Encoding utf8 $cfg_path
  python -m ml.pneumonia.training.train_quantum --config $cfg_path --root datasets/PNEUMONIA
}
```

---

## B.8. PHASE 5 — Quantum Circuit Capacity

**One variable at a time (never both qubits + layers in one run).**

```powershell
# 5a. Qubit sweep (layers = 4 fixed)
foreach ($q in @(4, 6, 8, 10, 12)) {
  $cfg_path = "ml/pneumonia/configs/_exp_P5_q_$q.yaml"
  @"
seed: 42
dataset: { root: datasets/PNEUMONIA, image_size: 224 }
training:
  epochs: 30; batch_size: 32; num_workers: 0
  lr: 5.0e-4; weight_decay: 1.0e-5; patience: 8
  label_smoothing: 0.1; cosine_T0: 8; max_grad_norm: 1.0
quantum:
  qubits: $q; layers: 4; pca_components: 8
  embedding: angle; ansatz: strongly; data_reupload: true
  dropout: 0.2; focal_gamma: 2.0
model: { name: QuantumPneu, backbone: PneuVision }
"@ | Set-Content -Encoding utf8 $cfg_path
  python -m ml.pneumonia.training.train_quantum --config $cfg_path --root datasets/PNEUMONIA
}

# 5b. Layer sweep (qubits = 8 fixed)
foreach ($l in @(1, 2, 3, 4, 6, 8)) {
  $cfg_path = "ml/pneumonia/configs/_exp_P5_l_$l.yaml"
  @"
seed: 42
dataset: { root: datasets/PNEUMONIA, image_size: 224 }
training:
  epochs: 30; batch_size: 32; num_workers: 0
  lr: 5.0e-4; weight_decay: 1.0e-5; patience: 8
  label_smoothing: 0.1; cosine_T0: 8; max_grad_norm: 1.0
quantum:
  qubits: 8; layers: $l; pca_components: 8
  embedding: angle; ansatz: strongly; data_reupload: true
  dropout: 0.2; focal_gamma: 2.0
model: { name: QuantumPneu, backbone: PneuVision }
"@ | Set-Content -Encoding utf8 $cfg_path
  python -m ml.pneumonia.training.train_quantum --config $cfg_path --root datasets/PNEUMONIA
}
```

> ⚠️ **PennyLane `default.qubit` cost scaling:** simulating q qubits with L
> strongly-entangling layers is O(2^q · L). q=12 → ~4096 amplitudes, OK;
> q≥16 will become very slow on CPU — keep ≤ 12 unless you have a GPU
> statevector simulator.

---

## B.9. PHASE 6 — Image Size (backbone must be RETRAINED if changed)

If you want to try image_size ≠ 224:
1. Retrain PneuVision first: `python -m ml.pneumonia.training.train --epochs 8 --batch-size 32` with image_size handled via the classical config.
2. Then create an experiment YAML setting `dataset.image_size: <size>` and run quantum.

---

## B.10. PHASE 7 — Statistical Validation (MANDATORY, 3 seeds)

Once you have a single best YAML from the ablation phases (`$best_cfg`), run
it on **3 seeds** and report mean ± std:

```powershell
$best_cfg = "ml/pneumonia/configs/quantum.yaml"   # replace with your winner YAML

# Helper: create a seeded copy of the YAML and run
foreach ($s in @(42, 123, 2026)) {
  $seeded = "ml/pneumonia/configs/_FINAL_seed_$s.yaml"
  $text = Get-Content -Raw $best_cfg
  if ($text -match '(?m)^seed:\s*\d+') {
    $text = $text -replace '(?m)^seed:\s*\d+', "seed: $s"
  } else {
    $text = "seed: $s`n" + $text
  }
  $text | Set-Content -Encoding utf8 $seeded
  python -m ml.pneumonia.training.train_quantum --config $seeded --root datasets/PNEUMONIA
}
```

**Selection rule for pneumonia (medical priority order; differs slightly from skin):**
1. **Sensitivity ≥ target first** (≥ 0.94) — false negatives (missed pneumonia) are the most dangerous.
2. Among configs passing sensitivity target → **highest Macro F1** (val, then test).
3. Tiebreak → highest **Specificity**, then highest **ROC-AUC**.

---

## B.11. Pneumonia Ablation Leaderboard

| Experiment | What changed from P0 | Test Sensitivity | Test Specificity | Test Macro F1 | Test ROC-AUC | Threshold |
|---|---|---|---|---|---|---|
| P0_reproduce_baseline_s42 | *(baseline)* | (fill) | (fill) | (fill) | (fill) | (fill) |
| P1_gamma_1.0 | `focal_gamma: 1.0` | (fill) | (fill) | (fill) | (fill) | (fill) |
| P1_gamma_2.0 | `focal_gamma: 2.0` (sanity) | (fill) | (fill) | (fill) | (fill) | (fill) |
| P1_gamma_3.0 | `focal_gamma: 3.0` | (fill) | (fill) | (fill) | (fill) | (fill) |
| P2_ls_0.0 | `label_smoothing: 0.0` | (fill) | (fill) | (fill) | (fill) | (fill) |
| P2_ls_0.05 | `label_smoothing: 0.05` | (fill) | (fill) | (fill) | (fill) | (fill) |
| P2_ls_0.10 | `label_smoothing: 0.10` (sanity) | (fill) | (fill) | (fill) | (fill) | (fill) |
| P2_ls_0.15 | `label_smoothing: 0.15` | (fill) | (fill) | (fill) | (fill) | (fill) |
| P3_lr_X | `training.lr: X` | (fill) | (fill) | (fill) | (fill) | (fill) |
| P3_wd_X | `training.weight_decay: X` | (fill) | (fill) | (fill) | (fill) | (fill) |
| P4_pca_N | `quantum.pca_components: N` | (fill) | (fill) | (fill) | (fill) | (fill) |
| P5_q_N | `quantum.qubits: N` | (fill) | (fill) | (fill) | (fill) | (fill) |
| P5_l_N | `quantum.layers: N` | (fill) | (fill) | (fill) | (fill) | (fill) |
| FINAL_s42 / s123 / s2026 | (winner YAML, 3 seeds) | (mean±std) | (mean±std) | (mean±std) | (mean±std) | — |

---

## B.12. Where Results Are Written (Pneumonia)

| Artifact | Path (under `models/pneumonia/`) | Path (under `reports/pneumonia/`) |
|---|---|---|
| Classical backbone (PneuVision) best checkpoint | `best.pt` | — |
| Classical backbone metrics | `metrics.json` | — |
| Quantum best checkpoint + saved threshold + test metrics | `quantum/QuantumPneu/best.pt` | — |
| Quantum scaler + PCA | `quantum/QuantumPneu/scaler.pkl`, `quantum/QuantumPneu/pca.pkl` (also mirrored at root: `scaler.pkl`, `pca.pkl`) | — |
| Quantum test metrics JSON | `quantum/QuantumPneu/metrics.json` (also mirrored: `quantum_metrics.json`) | — |
| Quantum training history | `quantum/QuantumPneu/training_history.json` | — |
| Dataset audit JSON | — | `dataset_audit.json` |

Key thing: the final `best.pt` for quantum contains `decision_threshold` and
`test_metrics` keys written after threshold tuning — inference code
(predictor / FastAPI endpoint) loads them directly.

---

---

# APPENDIX 1 — CLI Flag Reference

## A1.1 Skin Cancer (QuantumDerma)

All flags match [train_quantum.py main()](file:///f:/Hackathon/SIH(2026)/QDoc/ml/skin_cancer/training/train_quantum.py#L959-L1030).

| Flag | Type / choices | P0 default | Purpose |
|---|---|---|---|
| `--model` | {QuantumDerma, QuantumDermaX, VitaQ-Derm, QSkin-Vortex} | QuantumDerma | Model builder |
| `--config` | string filename in `configs/` | `quantum.yaml` | YAML base config |
| `--no-resume` | **store_true flag** (omit = off) | OFF | Always epoch 1, ignore `last.pt` |
| `--experiment-name` | string | auto | Leaderboard slug |
| `--seed` | int | 42 | All RNGs |
| `--pca-components` | int | 16 | PCA dims; refitted on change |
| `--qubits` / `--layers` | int / int | 10 / 4 | Quantum variational capacity |
| `--dropout` | float | 0.2 | Classifier-head dropout |
| `--focal-gamma` | float | **2.0** | Focal-Loss focusing γ |
| `--label-smoothing` | float | **0.0** (P0 recovery) | CE label smoothing |
| `--lr` | float | 5e-4 | AdamW LR |
| `--weight-decay` | float | 1e-2 | AdamW weight decay |
| `--scheduler` | {cosine, cosine_restarts, plateau} | cosine_restarts | LR schedule |
| `--cosine-T0` | int | 10 | Warm-restart period |
| `--epochs` | int | 30 (P0) / 100 (final) | Max epochs |
| `--batch-size` | int | 64 | Batch size |
| `--balanced-sampling` | **store_true** (omit = off) | OFF | WeightedRandomSampler |
| `--use-class-weights` | **store_true** (omit = off) | OFF | α-weights in FocalLoss |
| `--max-grad-norm` | float | 1.0 | Gradient clipping |
| `--patience` | int | 10 | Early-stop patience |
| `--early-stopping-on` | {macro_f1, balanced_accuracy, roc_auc} | macro_f1 | Early-stop metric |
| `--scaler-type` | {standard, minmax, none} | standard | Pre-PCA scaler |
| `--post-norm` | {none, l2} | none | Post-PCA normalization |
| `--skip-leaderboard` | **store_true** (omit = off) | OFF | Debug only — skip leaderboard |

## A1.2 Pneumonia (QuantumPneu)

Flags are minimal — most config is YAML-driven. See
[train_quantum_pneu()](file:///f:/Hackathon/SIH(2026)/QDoc/ml/pneumonia/training/train_quantum.py#L93-L282).

| Flag | Type | Default | Purpose |
|---|---|---|---|
| `--config` | YAML filename under `ml/pneumonia/configs/` or absolute path | `quantum.yaml` | Full training config |
| `--root` | Path to dataset root (containing train/val/test folders) | `datasets/PNEUMONIA` (from `paths.DATASET_ROOT`) | Override dataset location |

> To sweep any hyperparameter for pneumonia, create a per-experiment copy of
> `quantum.yaml` with the single key changed and pass `--config
> _exp_NAME.yaml`. The Phase 1–6 examples above do this for you.

## A1.3 Pneumonia (Classical Backbone — PneuVision)

| Flag | Type | Default | Purpose |
|---|---|---|---|
| `--root` | Path | auto-discover | Dataset root |
| `--epochs` | int | 8 | Epochs (2 frozen head-only then 6 unfrozen) |
| `--batch-size` | int | 32 | Batch size |

---

# APPENDIX 2 — Common Recipe Cheatsheet

Works for **Skin Cancer** (swap module names for Pneumonia as noted).

### ❗ 2-epoch sanity-check (no leaderboard pollution, skin only)
```powershell
python -m ml.skin_cancer.training.train_quantum --epochs 2 --no-resume --skip-leaderboard
```

### ✅ Resume a crashed run (no flag needed — auto-loads `last.pt`)
```powershell
# Skin cancer
python -m ml.skin_cancer.training.train_quantum --model QuantumDerma

# Pneumonia (just rerun same quantum.yaml; last.pt doesn't exist so it starts fresh — future work)
python -m ml.pneumonia.training.train_quantum --config quantum.yaml
```

### ✅ Force fresh start
```powershell
# Skin cancer
python -m ml.skin_cancer.training.train_quantum --model QuantumDerma --no-resume

# Pneumonia: delete best checkpoint(s) then rerun
# Remove-Item models/pneumonia/best.pt, models/pneumonia/quantum/QuantumPneu/best.pt -ErrorAction SilentlyContinue
python -m ml.pneumonia.training.train_quantum --config quantum.yaml
```

### ✅ Alternative schedulers (skin cancer, one at a time)
```powershell
python -m ml.skin_cancer.training.train_quantum @P0_SKIN --scheduler cosine  --experiment-name "alt_sched_cosine"
python -m ml.skin_cancer.training.train_quantum @P0_SKIN --scheduler plateau --experiment-name "alt_sched_plateau"
```

### ✅ Early-stop on Balanced Accuracy or ROC-AUC (skin cancer)
```powershell
python -m ml.skin_cancer.training.train_quantum @P0_SKIN --early-stopping-on balanced_accuracy --experiment-name "es_balacc"
python -m ml.skin_cancer.training.train_quantum @P0_SKIN --early-stopping-on roc_auc         --experiment-name "es_roc"
```

---

## Protected Baseline Reference Card

### Skin Cancer (QuantumDerma P0)
| Hyperparameter | Value |
|---|---|
| Seed | 42 |
| PCA components | 16 |
| Sampling | Normal (no WeightedRandomSampler) |
| Loss | FocalLoss |
| Focal gamma | 2.0 |
| Label smoothing | **0.00 (P0 recovery)** |
| LR | 5.0 × 10⁻⁴ |
| Weight decay | 1.0 × 10⁻² |
| Scheduler | CosineAnnealingWarmRestarts |
| Qubits / Layers | 10 / 4 |
| Max epochs | 30 (P0) / 100 (final) |
| Patience | 10 |
| Scaler / Post-norm | StandardScaler / none |
| Best protected: **Val Macro F1 = 0.39448** @ epoch 26 | |

### Pneumonia (QuantumPneu P0, default `quantum.yaml`)
| Hyperparameter | Value |
|---|---|
| Seed | 42 |
| Image size | 224 |
| PCA components | 8 |
| Class weights | **Always ON** (inverse-freq 2-class) |
| Loss | FocalLoss (weighted) |
| Focal gamma | 2.0 |
| Label smoothing | 0.1 |
| LR / Weight decay | 5.0 × 10⁻⁴ / 1.0 × 10⁻⁵ |
| Scheduler | CosineAnnealingWarmRestarts |
| Qubits / Layers | 8 / 4 |
| Max epochs / Patience | 30 / 8 |
| Grad clip norm | 1.0 |
| Data re-uploading | true |
| Threshold tuning | 0.15 → 0.85 step 0.01, best Macro F1 on val |

---

> **Medical disclaimer:** These models are for research decision support
> only and do not constitute a medical diagnosis. All outputs must be
> reviewed by a qualified clinician.
