from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

from ml.skin_cancer.paths import MODELS_DIR, REPORTS_DIR, ensure_dirs


def fit_pca(
    model_name: str = "DermisNova",
    n_components: int = 16,
    quantum_model_name: str = "QuantumDerma",
) -> Path:
    """Fit StandardScaler and PCA on extracted CNN training features.

    Saves transformation artifacts to the feature report directory as well as
    the target quantum model checkpoint directory.

    Args:
        model_name: Backbone feature extractor name (e.g., "DermisNova").
        n_components: Number of principal components (default: 16).
        quantum_model_name: Quantum model name for saving artifacts.

    Returns:
        Path to the primary output directory containing scaler and pca artifacts.
    """
    ensure_dirs()
    feat_dir = REPORTS_DIR / "features" / model_name
    x_train = np.load(feat_dir / "train_x.npy")

    # Adjust n_components if dataset features have lower rank
    max_components = min(x_train.shape[0], x_train.shape[1], n_components)
    scaler = StandardScaler()
    z = scaler.fit_transform(x_train)
    pca = PCA(n_components=max_components, random_state=42)
    pca.fit(z)

    # Save to quantum model folder
    out = MODELS_DIR / "quantum" / quantum_model_name
    out.mkdir(parents=True, exist_ok=True)
    joblib.dump(scaler, out / "scaler.pkl")
    joblib.dump(pca, out / "pca.pkl")

    # Also save to feature dir for general access
    joblib.dump(scaler, feat_dir / "scaler.pkl")
    joblib.dump(pca, feat_dir / "pca.pkl")

    meta = {
        "explained_variance_ratio": pca.explained_variance_ratio_.tolist(),
        "total_explained_variance": float(np.sum(pca.explained_variance_ratio_)),
        "n_components": max_components,
        "source_model": model_name,
    }
    (out / "pca_meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    (feat_dir / "pca_meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")

    for split in ("train", "val", "test"):
        split_file = feat_dir / f"{split}_x.npy"
        if split_file.exists():
            x = np.load(split_file)
            p = pca.transform(scaler.transform(x))
            np.save(feat_dir / f"{split}_pca.npy", p)

    return out


if __name__ == "__main__":
    fit_pca()
