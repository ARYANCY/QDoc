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

# Mitigate decompression bomb attacks (CWE-400 / DoS)
Image.MAX_IMAGE_PIXELS = 10_000_000
MAX_BYTES = 10 * 1024 * 1024  # 10 MB limit


def is_valid_dermatoscopy(image: Image.Image) -> bool:
    try:
        import numpy as np
        img_np = np.array(image.convert("RGB"))
        if img_np.ndim < 3 or img_np.shape[2] < 3:
            return False
        h, w, _ = img_np.shape
        if h < 24 or w < 24:
            return False

        r = img_np[:, :, 0].astype(float)
        g = img_np[:, :, 1].astype(float)
        b = img_np[:, :, 2].astype(float)
        
        mean_r = r.mean()
        mean_g = g.mean()
        mean_b = b.mean()
        
        # General biological skin or lesion tone: allow blue-white veils, dark melanomas, and polarized lighting
        # Reject non-biological synthetic solids (e.g. pure neon green/cyan graphics)
        if mean_g > mean_r + 25.0 or mean_b > mean_r + 25.0:
            return False
            
        # Ensure image is not a completely flat/blank single color
        if img_np.std() < 6.0:
            return False
            
        return True
    except Exception:
        return True


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
    
    if not is_valid_dermatoscopy(image):
        raise ValueError("Image is not related to the disease study")

    predictor = get_predictor(model)
    result = predictor.predict_pil(image)
    save_prediction({"filename": filename, "model": model, "result": result})
    return result
