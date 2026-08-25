from __future__ import annotations

import uuid
import time
from functools import lru_cache

import torch
from PIL import Image

from ml.pneumonia.classical import PneuVision
from ml.pneumonia.paths import MODELS_DIR
from ml.pneumonia.preprocessing.transforms import eval_transform


class PneumoniaPredictor:
    def __init__(self):
        checkpoint_path = MODELS_DIR / "best.pt"
        if not checkpoint_path.exists():
            raise FileNotFoundError("Pneumonia model is not trained")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        checkpoint = torch.load(checkpoint_path, map_location=self.device, weights_only=False)
        self.image_size = checkpoint.get("image_size", 224)
        self.threshold = float(checkpoint.get("decision_threshold", 0.5))
        self.model = PneuVision().to(self.device)
        self.model.load_state_dict(checkpoint["model"])
        self.model.eval()

    @torch.no_grad()
    def predict(self, image: Image.Image) -> dict:
        started_at = time.perf_counter()
        tensor = eval_transform(self.image_size)(image.convert("RGB")).unsqueeze(0).to(self.device)
        probability = float(self.model(tensor).softmax(1)[0, 1])
        label = "PNEUMONIA" if probability >= self.threshold else "NORMAL"
        return {
            "request_id": str(uuid.uuid4()),
            "status": "completed",
            "inference_ms": round((time.perf_counter() - started_at) * 1000, 2),
            "model": {"name": "PneuVision", "version": "1.0.0"},
            "pipeline": "EfficientNet-B0 chest X-ray classifier",
            "prediction": {"class": label, "confidence": probability if label == "PNEUMONIA" else 1 - probability},
            "probabilities": {"NORMAL": 1 - probability, "PNEUMONIA": probability},
            "review_required": True,
            "disclaimer": "This AI result is not a diagnosis. Professional radiologist review is required.",
        }


@lru_cache(maxsize=1)
def get_predictor() -> PneumoniaPredictor:
    return PneumoniaPredictor()