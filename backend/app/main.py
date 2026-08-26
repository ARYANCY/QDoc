import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.features.skin_cancer.controller import router
from backend.app.features.pneumonia.controller import router as pneumonia_router
from backend.app.features.graphs.controller import router as graphs_router


def get_allowed_origins() -> list[str]:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    extra = os.getenv("CORS_ALLOWED_ORIGINS", "")
    if extra:
        origins.extend(origin.strip() for origin in extra.split(",") if origin.strip())
    return list(dict.fromkeys(origins))


app = FastAPI(
    title="Skin Cancer QML API",
    description="Research decision-support API. Predictions are not diagnoses.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
app.include_router(pneumonia_router)
app.include_router(graphs_router)


@app.get("/")
def root():
    return {"service": "skin-cancer-qml", "docs": "/docs"}
