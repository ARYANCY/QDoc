from __future__ import annotations

from io import BytesIO

from PIL import Image, UnidentifiedImageError

from backend.app.features.skin_cancer.repository import save_prediction
from ml.skin_cancer.inference.predictor import get_predictor

MAX_BYTES = 8 * 1024 * 1024


def predict_image(data: bytes, filename: str, model: str, content_type: str | None) -> dict:
    if len(data) > MAX_BYTES:
        raise ValueError("File too large")
    if content_type and not content_type.startswith("image/"):
        raise ValueError("Unsupported image type")
    try:
        image = Image.open(BytesIO(data)).convert("RGB")
    except UnidentifiedImageError as exc:
        raise ValueError("Invalid image file") from exc
    predictor = get_predictor(model)
    result = predictor.predict_pil(image)
    save_prediction({"filename": filename, "model": model, "result": result})
    return result
