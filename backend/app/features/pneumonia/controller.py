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


@router.post("/predict")
async def predict(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Unsupported image type")
    if get_predictor is None:
        raise HTTPException(status_code=503, detail=f"Pneumonia model pipeline is unavailable: {_MODEL_IMPORT_ERROR}")
    try:
        result = get_predictor().predict(Image.open(BytesIO(await image.read())))
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