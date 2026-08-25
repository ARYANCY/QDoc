from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

from ml.skin_cancer.paths import MODELS_DIR, REPORTS_DIR, ensure_dirs


def fit_pca(model_name: str = "DermisNova", n_components: int = 8) -> Path:
    ensure_dirs()
    feat_dir = REPORTS_DIR / "features" / model_name
    x_train = np.load(feat_dir / "train_x.npy")
    scaler = StandardScaler()
    z = scaler.fit_transform(x_train)
    pca = PCA(n_components=n_components, random_state=42)
    pca.fit(z)
    out = MODELS_DIR / "quantum" / "QuantumDerma"
    out.mkdir(parents=True, exist_ok=True)
    joblib.dump(scaler, out / "scaler.pkl")
    joblib.dump(pca, out / "pca.pkl")
    meta = {
        "explained_variance_ratio": pca.explained_variance_ratio_.tolist(),
        "n_components": n_components,
        "source_model": model_name,
    }
    (out / "pca_meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    for split in ("train", "val", "test"):
        x = np.load(feat_dir / f"{split}_x.npy")
        p = pca.transform(scaler.transform(x))
        np.save(feat_dir / f"{split}_pca.npy", p)
    return out


if __name__ == "__main__":
    fit_pca()
