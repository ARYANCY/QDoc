from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from ml.pneumonia.inference.predictor import get_predictor
from ml.pneumonia.paths import MODELS_DIR

router = APIRouter(prefix="/api/v1/pneumonia", tags=["pneumonia"])


@router.post("/predict")
async def predict(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Unsupported image type")
    try:
        result = get_predictor().predict(Image.open(BytesIO(await image.read())))
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="Invalid image") from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail="Pneumonia model is not available") from exc
    return result


@router.get("/health")
def health():
    return {"status": "ok", "model_available": (MODELS_DIR / "best.pt").exists()}