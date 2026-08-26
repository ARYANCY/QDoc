from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingWarmRestarts
from torch.utils.data import DataLoader, TensorDataset
from tqdm import tqdm

from ml.skin_cancer.config import load_config
from ml.skin_cancer.constants import HAM10000_LABELS
from ml.skin_cancer.data.dataset_loader import class_weights
from ml.skin_cancer.data.split_dataset import load_manifest
from ml.skin_cancer.evaluation import write_eval_artifacts
from ml.skin_cancer.evaluation.calibration import fit_temperature, save_temperature
from ml.skin_cancer.evaluation.metrics import compute_metrics
from ml.skin_cancer.features.extract_cnn_features import extract_all
from ml.skin_cancer.features.pca_features import fit_pca
from ml.skin_cancer.paths import MODELS_DIR, REPORTS_DIR, ensure_dirs
from ml.skin_cancer.quantum.qskin_vortex import QSkinVortex
from ml.skin_cancer.quantum.quantum_derma import QuantumDerma
from ml.skin_cancer.quantum.quantum_derma_x import QuantumDermaX
from ml.skin_cancer.quantum.quantum_utils import FocalLoss
from ml.skin_cancer.quantum.vitaq_derm import VitaQDerm
from ml.skin_cancer.seed import get_device, set_seed

# ---------------------------------------------------------------------------
# Model registry — quantum hybrid models only
# ---------------------------------------------------------------------------
BUILDERS = {
    "QuantumDerma": QuantumDerma,
    "QuantumDermaX": QuantumDermaX,
    "VitaQ-Derm": VitaQDerm,
    "QSkin-Vortex": QSkinVortex,
}


def _loader(x: np.ndarray, y: np.ndarray, batch: int, shuffle: bool) -> DataLoader:
    ds = TensorDataset(
        torch.tensor(x, dtype=torch.float32),
        torch.tensor(y, dtype=torch.long),
    )
    return DataLoader(ds, batch_size=batch, shuffle=shuffle, pin_memory=False)


def train_quantum(model_name: str = "QuantumDerma", config_name: str = "quantum.yaml") -> Path:
    """Train a quantum hybrid model end-to-end.

    Pipeline:
        1. Load config and ensure output directories exist.
        2. Extract compact CNN features from the classical backbone (cached).
        3. Fit PCA + StandardScaler to the training features (16 components).
        4. Build the quantum model, Focal Loss, AdamW + CosineAnnealingWarmRestarts.
        5. Train with early stopping on val macro-F1.
        6. Temperature-scale the best checkpoint and write full evaluation artifacts.

    Args:
        model_name:  One of ``"QuantumDerma"``, ``"QuantumDermaX"``,
                     ``"VitaQ-Derm"``, ``"QSkin-Vortex"``.
        config_name: YAML config filename (resolved against ``configs/`` dir).

    Returns:
        Path to the directory containing ``best.pt`` and evaluation artefacts.
    """
    ensure_dirs()
    cfg = load_config(config_name)
    set_seed(int(cfg.get("seed", 42)))
    device = get_device()
    qcfg = cfg["quantum"]
    tcfg = cfg["training"]
    backbone = cfg.get("backbone", "DermisNova")

    # ------------------------------------------------------------------
    # Feature extraction (cached when backbone checkpoint is unchanged)
    # ------------------------------------------------------------------
    feat_dir = REPORTS_DIR / "features" / backbone
    classical_ckpt = MODELS_DIR / "classical" / backbone / "best.pt"
    feature_meta = feat_dir / "feature_meta.json"
    features_are_current = False

    if feature_meta.exists() and classical_ckpt.exists():
        meta = json.loads(feature_meta.read_text(encoding="utf-8"))
        try:
            classical_meta = torch.load(classical_ckpt, map_location="cpu", weights_only=False)
            features_are_current = (
                meta.get("model") == backbone
                and int(meta.get("image_size", -1)) == int(classical_meta["image_size"])
                and int(meta.get("checkpoint_mtime_ns", -1))
                == classical_ckpt.stat().st_mtime_ns
            )
        except Exception:
            features_are_current = False

    if not (feat_dir / "train_x.npy").exists() or not features_are_current:
        print(f"[train_quantum] Extracting CNN features from {backbone} ...")
        extract_all(backbone)
        features_are_current = False

    # ------------------------------------------------------------------
    # PCA / feature reduction
    # ------------------------------------------------------------------
    pca_components = int(qcfg.get("pca_components", 16))
    # VitaQ-Derm uses raw compact features (not PCA) because it has its own
    # learned linear projection from in_dim → n_qubits.
    use_raw = model_name == "VitaQ-Derm"
    suffix = "x" if use_raw else "pca"

    if not use_raw:
        if not (feat_dir / "train_pca.npy").exists() or not features_are_current:
            print(f"[train_quantum] Fitting PCA ({pca_components} components) ...")
            fit_pca(backbone, pca_components)

    x_train = np.load(feat_dir / f"train_{suffix}.npy")
    y_train = np.load(feat_dir / "train_y.npy")
    x_val = np.load(feat_dir / f"val_{suffix}.npy")
    y_val = np.load(feat_dir / "val_y.npy")
    x_test = np.load(feat_dir / f"test_{suffix}.npy")
    y_test = np.load(feat_dir / "test_y.npy")

    num_classes = int(y_train.max()) + 1
    class_names = [HAM10000_LABELS[i] for i in range(num_classes)]

    # ------------------------------------------------------------------
    # Model construction
    # ------------------------------------------------------------------
    builder = BUILDERS[model_name]
    n_qubits = int(qcfg.get("qubits", 10))
    n_layers = int(qcfg.get("layers", 4))
    dropout = float(qcfg.get("dropout", 0.2))

    if model_name == "QuantumDermaX":
        n_qubits = max(n_qubits, 12)   # QuantumDermaX is always ≥ 12 qubits
    elif model_name == "QSkin-Vortex":
        n_layers = max(n_layers, 5)    # QSkinVortex uses ≥ 5 layers

    if model_name == "VitaQ-Derm":
        model = builder(
            num_classes,
            n_qubits=n_qubits,
            n_layers=n_layers,
            in_dim=x_train.shape[1],
            dropout=dropout,
            data_reupload=True,
        )
    else:
        model = builder(
            num_classes,
            n_qubits=n_qubits,
            n_layers=n_layers,
            in_dim=x_train.shape[1],
            dropout=dropout,
            data_reupload=True,
        )
    model.to(device)

    # ------------------------------------------------------------------
    # Focal Loss — better than weighted CE for heavily imbalanced HAM10000
    # gamma=2.0: standard focusing parameter (Lin et al., 2017)
    # label_smoothing=0.1: improves quantum model generalisation
    # ------------------------------------------------------------------
    weights = class_weights(y_train, num_classes).to(device)
    criterion = FocalLoss(
        gamma=float(qcfg.get("focal_gamma", 2.0)),
        weight=weights,
        label_smoothing=float(tcfg.get("label_smoothing", 0.1)),
    )

    # ------------------------------------------------------------------
    # Optimiser + LR scheduler
    # CosineAnnealingWarmRestarts: best for quantum circuits — avoids
    # getting stuck in barren plateaus by periodically re-exploring.
    # T_0: initial restart period (epochs), T_mult: period growth factor.
    # ------------------------------------------------------------------
    optimizer = AdamW(
        model.parameters(),
        lr=float(tcfg.get("lr", 5e-4)),
        weight_decay=float(tcfg.get("weight_decay", 1e-5)),
    )
    T_0 = int(tcfg.get("cosine_T0", 10))
    scheduler = CosineAnnealingWarmRestarts(optimizer, T_0=T_0, T_mult=2, eta_min=1e-6)

    train_loader = _loader(x_train, y_train, int(tcfg.get("batch_size", 64)), True)
    val_loader = _loader(x_val, y_val, int(tcfg.get("batch_size", 64)), False)

    out_dir = MODELS_DIR / "quantum" / model_name.replace("/", "-")
    out_dir.mkdir(parents=True, exist_ok=True)

    best_f1 = -1.0
    history: list[dict] = []
    stale = 0
    max_grad_norm = float(tcfg.get("max_grad_norm", 1.0))

    for epoch in range(1, int(tcfg.get("epochs", 50)) + 1):
        # ── Training ──────────────────────────────────────────────────
        model.train()
        running_loss = 0.0
        n_samples = 0
        start = time.time()

        for x_batch, y_batch in tqdm(
            train_loader, desc=f"[{model_name}] epoch {epoch}", leave=False
        ):
            x_batch, y_batch = x_batch.to(device), y_batch.to(device)
            optimizer.zero_grad(set_to_none=True)
            loss = criterion(model(x_batch), y_batch)
            loss.backward()
            # Gradient clipping prevents instability in deep quantum circuits
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=max_grad_norm)
            optimizer.step()
            running_loss += float(loss.item()) * len(y_batch)
            n_samples += len(y_batch)

        scheduler.step()

        # ── Validation ────────────────────────────────────────────────
        model.eval()
        ys, ps = [], []
        with torch.no_grad():
            for x_batch, y_batch in val_loader:
                prob = torch.softmax(model(x_batch.to(device)), dim=1)
                ys.append(y_batch.numpy())
                ps.append(prob.cpu().numpy())

        y_val_arr = np.concatenate(ys)
        p_val_arr = np.concatenate(ps)
        val_metrics = compute_metrics(y_val_arr, p_val_arr, class_names)
        current_lr = optimizer.param_groups[0]["lr"]

        row = {
            "epoch": epoch,
            "train_loss": running_loss / max(n_samples, 1),
            "val_macro_f1": val_metrics["macro_f1"],
            "val_accuracy": val_metrics["accuracy"],
            "lr": current_lr,
            "seconds": round(time.time() - start, 2),
        }
        history.append(row)
        print(row)

        # ── Checkpoint on best val F1 ─────────────────────────────────
        if val_metrics["macro_f1"] > best_f1:
            best_f1 = val_metrics["macro_f1"]
            stale = 0
            torch.save(
                {
                    "model": model.state_dict(),
                    "model_name": model_name,
                    "num_classes": num_classes,
                    "class_names": class_names,
                    "config": qcfg,
                    "in_dim": x_train.shape[1],
                    "n_qubits": n_qubits,
                    "n_layers": n_layers,
                    "use_raw": use_raw,
                    "backbone": backbone,
                    "epoch": epoch,
                    "best_val_macro_f1": best_f1,
                },
                out_dir / "best.pt",
            )
        else:
            stale += 1
            if stale >= int(tcfg.get("patience", 10)):
                print(f"[train_quantum] Early stop at epoch {epoch} (patience={tcfg['patience']})")
                break

    # ------------------------------------------------------------------
    # Final evaluation on test set
    # ------------------------------------------------------------------
    ckpt = torch.load(out_dir / "best.pt", map_location=device, weights_only=False)
    model.load_state_dict(ckpt["model"])
    model.eval()

    with torch.no_grad():
        val_logits = model(
            torch.tensor(x_val, dtype=torch.float32, device=device)
        ).cpu().numpy()
        test_logits = model(
            torch.tensor(x_test, dtype=torch.float32, device=device)
        ).cpu().numpy()

    temperature = fit_temperature(val_logits, y_val)
    save_temperature(out_dir / "calibration.json", temperature)

    test_prob = torch.softmax(
        torch.tensor(test_logits) / temperature, dim=1
    ).numpy()

    manifest = load_manifest()
    test_idx = manifest.loc[manifest["split"] == "test", "index"].to_numpy()

    metrics = write_eval_artifacts(
        REPORTS_DIR / model_name,
        y_test,
        test_prob,
        class_names,
        indices=test_idx,
        extra={
            "model": model_name,
            "temperature": temperature,
            "best_val_macro_f1": best_f1,
            "n_qubits": n_qubits,
            "n_layers": n_layers,
            "data_reupload": True,
        },
    )

    (out_dir / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    (out_dir / "training_history.json").write_text(
        json.dumps(history, indent=2), encoding="utf-8"
    )
    (out_dir / "labels.json").write_text(
        json.dumps({"class_names": class_names, "num_classes": num_classes}, indent=2),
        encoding="utf-8",
    )
    (out_dir / "config.json").write_text(
        json.dumps(
            {
                "name": model_name,
                **qcfg,
                "backbone": backbone,
                "n_qubits": n_qubits,
                "n_layers": n_layers,
                "data_reupload": True,
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    print(json.dumps({k: metrics[k] for k in ("accuracy", "macro_f1", "roc_auc")}, indent=2))
    return out_dir


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Train a quantum hybrid model on HAM10000 skin lesion data."
    )
    parser.add_argument(
        "--model",
        default="QuantumDerma",
        choices=list(BUILDERS),
        help="Quantum model to train (default: QuantumDerma)",
    )
    parser.add_argument(
        "--config",
        default="quantum.yaml",
        help="Config file name (default: quantum.yaml)",
    )
    args = parser.parse_args()
    train_quantum(args.model, args.config)


if __name__ == "__main__":
    main()
