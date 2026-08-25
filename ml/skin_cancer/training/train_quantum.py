from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.optim import AdamW
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
from ml.skin_cancer.quantum.qderma_fusion import QDermaFusion
from ml.skin_cancer.quantum.qskin_vortex import QSkinVortex
from ml.skin_cancer.quantum.quantum_derma import QuantumDerma
from ml.skin_cancer.quantum.quantum_derma_x import QuantumDermaX
from ml.skin_cancer.quantum.vitaq_derm import VitaQDerm
from ml.skin_cancer.seed import get_device, set_seed

BUILDERS = {
    "QuantumDerma": QuantumDerma,
    "QuantumDermaX": QuantumDermaX,
    "VitaQ-Derm": VitaQDerm,
    "QSkin-Vortex": QSkinVortex,
}


def _loader(x: np.ndarray, y: np.ndarray, batch: int, shuffle: bool) -> DataLoader:
    ds = TensorDataset(torch.tensor(x, dtype=torch.float32), torch.tensor(y, dtype=torch.long))
    return DataLoader(ds, batch_size=batch, shuffle=shuffle)


def train_quantum(model_name: str = "QuantumDerma", config_name: str = "quantum.yaml") -> Path:
    ensure_dirs()
    cfg = load_config(config_name)
    set_seed(int(cfg.get("seed", 42)))
    device = get_device()
    qcfg = cfg["quantum"]
    tcfg = cfg["training"]
    backbone = cfg.get("backbone", "DermisNova")
    feat_dir = REPORTS_DIR / "features" / backbone
    classical_ckpt = MODELS_DIR / "classical" / backbone / "best.pt"
    feature_meta = feat_dir / "feature_meta.json"
    features_are_current = False
    if feature_meta.exists() and classical_ckpt.exists():
        meta = json.loads(feature_meta.read_text(encoding="utf-8"))
        classical_meta = torch.load(classical_ckpt, map_location="cpu", weights_only=False)
        features_are_current = (
            meta.get("model") == backbone
            and int(meta.get("image_size", -1)) == int(classical_meta["image_size"])
            and int(meta.get("checkpoint_mtime_ns", -1)) == classical_ckpt.stat().st_mtime_ns
        )
    if not (feat_dir / "train_x.npy").exists() or not features_are_current:
        extract_all(backbone)
        features_are_current = False
    if not (feat_dir / "train_pca.npy").exists() or not features_are_current:
        fit_pca(backbone, int(qcfg["pca_components"]))

    use_raw = model_name == "VitaQ-Derm"
    suffix = "x" if use_raw else "pca"
    x_train, y_train = np.load(feat_dir / f"train_{suffix}.npy"), np.load(feat_dir / "train_y.npy")
    x_val, y_val = np.load(feat_dir / f"val_{suffix}.npy"), np.load(feat_dir / "val_y.npy")
    x_test, y_test = np.load(feat_dir / f"test_{suffix}.npy"), np.load(feat_dir / "test_y.npy")
    num_classes = int(y_train.max()) + 1
    class_names = [HAM10000_LABELS[i] for i in range(num_classes)]

    builder = BUILDERS[model_name]
    if model_name == "VitaQ-Derm":
        model = builder(num_classes, n_qubits=qcfg["qubits"], n_layers=qcfg["layers"], in_dim=x_train.shape[1])
    else:
        model = builder(
            num_classes,
            n_qubits=int(qcfg["qubits"]) if model_name == "QuantumDerma" else (10 if model_name == "QuantumDermaX" else 8),
            n_layers=int(qcfg["layers"]) if model_name != "QSkin-Vortex" else 4,
            in_dim=x_train.shape[1],
            dropout=float(qcfg.get("dropout", 0.2)),
        )
    model.to(device)
    weights = class_weights(y_train, num_classes).to(device)
    criterion = nn.CrossEntropyLoss(weight=weights)
    optimizer = AdamW(model.parameters(), lr=float(tcfg["lr"]), weight_decay=float(tcfg["weight_decay"]))
    train_loader = _loader(x_train, y_train, tcfg["batch_size"], True)
    val_loader = _loader(x_val, y_val, tcfg["batch_size"], False)

    out_dir = MODELS_DIR / "quantum" / model_name.replace("/", "-")
    out_dir.mkdir(parents=True, exist_ok=True)
    best_f1 = -1.0
    history = []
    stale = 0
    for epoch in range(1, int(tcfg["epochs"]) + 1):
        model.train()
        running = 0.0
        n = 0
        start = time.time()
        for x, y in tqdm(train_loader, desc=f"{model_name} epoch {epoch}", leave=False):
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad(set_to_none=True)
            loss = criterion(model(x), y)
            loss.backward()
            optimizer.step()
            running += float(loss.item()) * len(y)
            n += len(y)
        model.eval()
        ys, ps = [], []
        with torch.no_grad():
            for x, y in val_loader:
                prob = torch.softmax(model(x.to(device)), dim=1)
                ys.append(y.numpy())
                ps.append(prob.cpu().numpy())
        yv, pv = np.concatenate(ys), np.concatenate(ps)
        val_metrics = compute_metrics(yv, pv, class_names)
        row = {
            "epoch": epoch,
            "train_loss": running / max(n, 1),
            "val_macro_f1": val_metrics["macro_f1"],
            "val_accuracy": val_metrics["accuracy"],
            "seconds": time.time() - start,
        }
        history.append(row)
        print(row)
        if val_metrics["macro_f1"] > best_f1:
            best_f1 = val_metrics["macro_f1"]
            stale = 0
            torch.save(
                {
                    "model": model.state_dict(),
                    "num_classes": num_classes,
                    "class_names": class_names,
                    "config": qcfg,
                    "in_dim": x_train.shape[1],
                    "use_raw": use_raw,
                    "backbone": backbone,
                },
                out_dir / "best.pt",
            )
        else:
            stale += 1
            if stale >= int(tcfg["patience"]):
                break

    ckpt = torch.load(out_dir / "best.pt", map_location=device, weights_only=False)
    model.load_state_dict(ckpt["model"])
    model.eval()
    with torch.no_grad():
        logits = model(torch.tensor(x_val, dtype=torch.float32, device=device)).cpu().numpy()
        test_logits = model(torch.tensor(x_test, dtype=torch.float32, device=device)).cpu().numpy()
    temperature = fit_temperature(logits, y_val)
    save_temperature(out_dir / "calibration.json", temperature)
    test_prob = torch.softmax(torch.tensor(test_logits) / temperature, dim=1).numpy()
    manifest = load_manifest()
    test_idx = manifest.loc[manifest["split"] == "test", "index"].to_numpy()
    metrics = write_eval_artifacts(
        REPORTS_DIR / model_name,
        y_test,
        test_prob,
        class_names,
        indices=test_idx,
        extra={"model": model_name, "temperature": temperature, "best_val_macro_f1": best_f1},
    )
    (out_dir / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    (out_dir / "training_history.json").write_text(json.dumps(history, indent=2), encoding="utf-8")
    (out_dir / "labels.json").write_text(
        json.dumps({"class_names": class_names, "num_classes": num_classes}, indent=2), encoding="utf-8"
    )
    (out_dir / "config.json").write_text(json.dumps({"name": model_name, **qcfg, "backbone": backbone}, indent=2), encoding="utf-8")
    print(json.dumps({k: metrics[k] for k in ("accuracy", "macro_f1", "roc_auc")}, indent=2))
    return out_dir


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="QuantumDerma")
    parser.add_argument("--config", default="quantum.yaml")
    args = parser.parse_args()
    train_quantum(args.model, args.config)


if __name__ == "__main__":
    main()
