from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend.app.features.skin_cancer.repository import list_predictions
from backend.app.features.skin_cancer.service import predict_image

router = APIRouter(prefix="/api/v1/skin-cancer", tags=["skin-cancer"])


@router.post("/predict")
async def predict(
    image: UploadFile = File(...),
    model: str = Form("QuantumDerma"),
    explain: bool = Form(False),
):
    data = await image.read()
    try:
        return predict_image(data, image.filename or "upload", model, image.content_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail="Requested model is not available") from exc


@router.get("/history")
def history():
    return {"items": list_predictions()}


@router.get("/health")
def health():
    return {"status": "ok"}
