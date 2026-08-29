from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

try:
    from ml.pneumonia.inference.predictor import get_predictor
except Exception as exc:  # pragma: no cover - defensive import guard
    get_predictor = None
    _MODEL_IMPORT_ERROR = exc
else:
    _MODEL_IMPORT_ERROR = None
from ml.pneumonia.paths import MODELS_DIR

router = APIRouter(prefix="/api/v1/pneumonia", tags=["pneumonia"])


def is_valid_xray(image: Image.Image) -> bool:
    import numpy as np
    img_np = np.array(image.convert("RGB"))
    if img_np.ndim < 3 or img_np.shape[2] < 3:
        return False
    
    # 1. Grayscale check
    diff_rg = np.abs(img_np[:, :, 0].astype(float) - img_np[:, :, 1].astype(float))
    diff_gb = np.abs(img_np[:, :, 1].astype(float) - img_np[:, :, 2].astype(float))
    mean_diff = (diff_rg.mean() + diff_gb.mean()) / 2.0
    if mean_diff > 15.0:
        return False
        
    # 2. X-ray dark borders check (corners must be dark)
    h, w, _ = img_np.shape
    corner_h = max(int(h * 0.08), 1)
    corner_w = max(int(w * 0.08), 1)
    
    tl = img_np[0:corner_h, 0:corner_w].mean()
    tr = img_np[0:corner_h, w-corner_w:w].mean()
    bl = img_np[h-corner_h:h, 0:corner_w].mean()
    br = img_np[h-corner_h:h, w-corner_w:w].mean()
    
    # If the corners are bright (average of corners > 85), it's not a standard X-ray (e.g. document/diagram)
    if (tl + tr + bl + br) / 4.0 > 85.0:
        return False
        
    # 3. Center density check (X-rays should have content in the center, not just flat color)
    center_y1, center_y2 = int(h * 0.35), int(h * 0.65)
    center_x1, center_x2 = int(w * 0.35), int(w * 0.65)
    center_mean = img_np[center_y1:center_y2, center_x1:center_x2].mean()
    if center_mean < 25.0:
        return False
        
    return True


@router.post("/predict")
async def predict(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Unsupported image type")
    if get_predictor is None:
        raise HTTPException(status_code=503, detail=f"Pneumonia model pipeline is unavailable: {_MODEL_IMPORT_ERROR}")
    try:
        img = Image.open(BytesIO(await image.read()))
        if not is_valid_xray(img):
            raise HTTPException(status_code=400, detail="Image is not related to the disease study")
        result = get_predictor().predict(img)
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="Invalid image") from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail="Pneumonia model is not available") from exc
    return result


@router.get("/health")
def health():
    return {"status": "ok", "model_available": (MODELS_DIR / "best.pt").exists()}