from __future__ import annotations

import json
import time
import uuid
from pathlib import Path

import joblib
import numpy as np
import torch
from PIL import Image

from ml.skin_cancer.classical import CLASSICAL_BUILDERS
from ml.skin_cancer.constants import HAM10000_DISPLAY
from ml.skin_cancer.data.image_quality import assess_pil
from ml.skin_cancer.paths import MODELS_DIR
from ml.skin_cancer.preprocessing.transforms import pil_eval_transform
from ml.skin_cancer.quantum.quantum_derma import QuantumDerma
from ml.skin_cancer.seed import get_device

ALLOWED_MODELS = {"DermisNova", "DenseNet121", "MelanoVanta", "DermaLumen", "QuantumDerma", "production"}


def resolve_model_name(name: str) -> str:
    if name not in ALLOWED_MODELS:
        raise ValueError("Unknown model")
    if name == "production":
        registry = MODELS_DIR / "production" / "registry.json"
        if registry.exists():
            return json.loads(registry.read_text(encoding="utf-8"))["production"]
        if (MODELS_DIR / "classical" / "DermisNova" / "best.pt").exists():
            return "DermisNova"
        return "QuantumDerma"
    return name


class SkinCancerPredictor:
    def __init__(self, model_name: str = "production"):
        self.device = get_device()
        self.model_name = resolve_model_name(model_name)
        self.classical = None
        self.quantum = None
        self.scaler = None
        self.pca = None
        self.image_size = 64
        self.class_names: list[str] = []
        self.temperature = 1.0
        self._load()

    def _load(self) -> None:
        if self.model_name in {"DermisNova", "DenseNet121", "MelanoVanta", "DermaLumen"}:
            ckpt = torch.load(
                MODELS_DIR / "classical" / self.model_name / "best.pt",
                map_location=self.device,
                weights_only=False,
            )
            self.classical = CLASSICAL_BUILDERS[self.model_name](
                ckpt["num_classes"], dropout=ckpt.get("dropout", 0.3)
            ).to(self.device)
            self.classical.load_state_dict(ckpt["model"])
            self.classical.eval()
            self.image_size = ckpt["image_size"]
            self.class_names = ckpt["class_names"]
            return

        cnn_ckpt = torch.load(
            MODELS_DIR / "classical" / "DermisNova" / "best.pt",
            map_location=self.device,
            weights_only=False,
        )
        self.classical = CLASSICAL_BUILDERS["DermisNova"](
            cnn_ckpt["num_classes"], dropout=cnn_ckpt.get("dropout", 0.3)
        ).to(self.device)
        self.classical.load_state_dict(cnn_ckpt["model"])
        self.classical.eval()
        self.image_size = cnn_ckpt["image_size"]
        qdir = MODELS_DIR / "quantum" / "QuantumDerma"
        qckpt = torch.load(qdir / "best.pt", map_location=self.device, weights_only=False)
        self.quantum = QuantumDerma(
            qckpt["num_classes"],
            n_qubits=int(qckpt["config"]["qubits"]),
            n_layers=int(qckpt["config"]["layers"]),
            in_dim=int(qckpt["in_dim"]),
        ).to(self.device)
        self.quantum.load_state_dict(qckpt["model"])
        self.quantum.eval()
        self.scaler = joblib.load(qdir / "scaler.pkl")
        self.pca = joblib.load(qdir / "pca.pkl")
        self.class_names = qckpt["class_names"]
        cal = qdir / "calibration.json"
        if cal.exists():
            self.temperature = float(json.loads(cal.read_text(encoding="utf-8"))["temperature"])

    @torch.no_grad()
    def predict_pil(self, image: Image.Image) -> dict:
        started_at = time.perf_counter()
        quality = assess_pil(image)
        request_id = str(uuid.uuid4())
        if not quality["valid"]:
            return {
                "request_id": request_id,
                "status": "rejected",
                "quality": quality,
                "reason": quality.get("reason"),
            }
        x = pil_eval_transform(self.image_size)(image.convert("RGB")).unsqueeze(0).to(self.device)
        if self.quantum is None:
            logits = self.classical(x)
        else:
            feats = self.classical.compact_features(x).cpu().numpy()
            pca = self.pca.transform(self.scaler.transform(feats))
            logits = self.quantum(torch.tensor(pca, dtype=torch.float32, device=self.device))
        logits = logits / max(self.temperature, 1e-3)
        prob = torch.softmax(logits, dim=1).cpu().numpy()[0]
        idx = int(prob.argmax())
        label = self.class_names[idx]
        probabilities = {self.class_names[i]: float(prob[i]) for i in range(len(self.class_names))}
        quantum_info = None
        if self.quantum is not None:
            quantum_info = {
                "qubits": self.quantum.n_qubits,
                "layers": self.quantum.n_layers,
            }
        return {
            "request_id": request_id,
            "status": "completed",
            "inference_ms": round((time.perf_counter() - started_at) * 1000, 2),
            "model": {
                "name": self.model_name,
                "version": "1.0.0",
                "display_class": HAM10000_DISPLAY.get(label, label),
            },
            "prediction": {"class": label, "confidence": float(prob[idx])},
            "probabilities": probabilities,
            "quality": quality,
            "quantum": quantum_info,
            "pipeline": "CNN feature extractor -> scaler/PCA -> QuantumDerma" if self.quantum is not None else "Classical CNN classifier",
            "review_required": True,
            "disclaimer": "This AI result is not a diagnosis. Professional evaluation is required.",
        }


_CACHE: dict[str, SkinCancerPredictor] = {}


def get_predictor(model_name: str) -> SkinCancerPredictor:
    key = resolve_model_name(model_name)
    if key not in _CACHE:
        _CACHE[key] = SkinCancerPredictor(key)
    return _CACHE[key]
