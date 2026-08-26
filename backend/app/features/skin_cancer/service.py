from __future__ import annotations

from io import BytesIO

from PIL import Image, UnidentifiedImageError

from backend.app.features.skin_cancer.repository import save_prediction

try:
    from ml.skin_cancer.inference.predictor import get_predictor
except Exception as exc:  # pragma: no cover - defensive import guard
    get_predictor = None
    _MODEL_IMPORT_ERROR = exc
else:
    _MODEL_IMPORT_ERROR = None

MAX_BYTES = 8 * 1024 * 1024


def predict_image(data: bytes, filename: str, model: str, content_type: str | None) -> dict:
    if len(data) > MAX_BYTES:
        raise ValueError("File too large")
    if content_type and not content_type.startswith("image/"):
        raise ValueError("Unsupported image type")
    if get_predictor is None:
        raise RuntimeError(f"Skin cancer model pipeline is unavailable: {_MODEL_IMPORT_ERROR}")
    try:
        image = Image.open(BytesIO(data)).convert("RGB")
    except UnidentifiedImageError as exc:
        raise ValueError("Invalid image file") from exc
    predictor = get_predictor(model)
    result = predictor.predict_pil(image)
    save_prediction({"filename": filename, "model": model, "result": result})
    return result
