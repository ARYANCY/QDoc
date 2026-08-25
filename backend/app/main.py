from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.features.skin_cancer.controller import router
from backend.app.features.pneumonia.controller import router as pneumonia_router
from backend.app.features.graphs.controller import router as graphs_router

app = FastAPI(
    title="Skin Cancer QML API",
    description="Research decision-support API. Predictions are not diagnoses.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
app.include_router(pneumonia_router)
app.include_router(graphs_router)


@app.get("/")
def root():
    return {"service": "skin-cancer-qml", "docs": "/docs"}
