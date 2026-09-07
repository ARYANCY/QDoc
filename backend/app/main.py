from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.security import SecurityHeadersMiddleware
from backend.app.features.admin.controller import router as admin_router
from backend.app.features.auth.controller import router as auth_router
from backend.app.features.benchmarks.controller import router as benchmarks_router
from backend.app.features.clinical.controller import router as clinical_router
from backend.app.features.compliance.controller import router as compliance_router
from backend.app.features.digital_twin.controller import router as digital_twin_router
from backend.app.features.early_detection.controller import router as early_detection_router
from backend.app.features.graphs.controller import router as graphs_router
from backend.app.features.pneumonia.controller import router as pneumonia_router
from backend.app.features.profile.controller import router as profile_router
from backend.app.features.quantum_telemetry.controller import router as quantum_telemetry_router
from backend.app.features.reports.controller import router as reports_router
from backend.app.features.researcher.controller import router as researcher_router
from backend.app.features.skin_cancer.controller import router as skin_cancer_router
from backend.app.features.consultations.controller import router as consultations_router
from backend.app.features.notifications.controller import router as notifications_router



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
    title="Q-MedSense — Quantum Clinical Decision Support API",
    description="Hybrid Quantum Machine Learning Platform for Early Disease Detection (SIH 26139).",
    version="2.0.0",
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Feature Routers per SRS Architecture
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(profile_router)
app.include_router(clinical_router)
app.include_router(early_detection_router)
app.include_router(researcher_router)
app.include_router(quantum_telemetry_router)
app.include_router(benchmarks_router)
app.include_router(digital_twin_router)
app.include_router(compliance_router)
app.include_router(reports_router)
app.include_router(skin_cancer_router)
app.include_router(pneumonia_router)
app.include_router(graphs_router)
app.include_router(consultations_router)
app.include_router(notifications_router)



@app.get("/")
def root():
    return {
        "platform": "Q-MedSense",
        "version": "2.0.0",
        "sih_problem_id": "26139",
        "status": "online",
        "quantum_engine": "PennyLane + Qiskit Aer",
        "docs": "/docs",
    }
