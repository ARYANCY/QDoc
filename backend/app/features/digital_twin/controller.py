from __future__ import annotations

from fastapi import APIRouter
from ml.digital_twin.digital_twin import DigitalTwinEngine

router = APIRouter(prefix="/api/v1/digital-twin", tags=["2D Digital Twin"])

_TWIN_ENGINE = DigitalTwinEngine()

# Temporal visit history archive
_VISITS = [
    {
        "visit_id": "V-2026-01-10",
        "date": "2026-01-10",
        "module_risks": {"cardiovascular": 0.18, "oncology_breast": 0.22, "oncology_skin": 0.10, "pulmonary": 0.15, "metabolic": 0.20},
        "notes": "Annual preventive checkup. Blood pressure within normal limits.",
    },
    {
        "visit_id": "V-2026-04-15",
        "date": "2026-04-15",
        "module_risks": {"cardiovascular": 0.42, "oncology_breast": 0.28, "oncology_skin": 0.12, "pulmonary": 0.20, "metabolic": 0.35},
        "notes": "Follow-up visit. Elevated LDL cholesterol and mild lipidemia noted.",
    },
    {
        "visit_id": "V-2026-09-06",
        "date": "2026-09-06",
        "module_risks": {"cardiovascular": 0.68, "oncology_breast": 0.72, "oncology_skin": 0.25, "pulmonary": 0.28, "metabolic": 0.45},
        "notes": "Current clinical encounter. Coronary calcification and dense breast tissue detected.",
    },
]


@router.get("/state/{patient_id}")
async def get_digital_twin_state(
    patient_id: str,
    visit_index: int = -1,
    view: str = "all",
):
    """Returns 2D Digital Twin physiological parameters, CRS score, organ heatmaps, and timeline scrubber data."""
    if not _VISITS:
        v = {"module_risks": {"cardiovascular": 0.2, "oncology_breast": 0.2, "oncology_skin": 0.1, "pulmonary": 0.1, "metabolic": 0.2}}
    else:
        v = _VISITS[visit_index if 0 <= visit_index < len(_VISITS) else -1]

    top_biomarkers = {
        "cardiovascular": "Thalach 138 bpm / Oldpeak 2.1",
        "oncology_breast": "Mean Radius 17.9 / Concavity 0.28",
        "oncology_skin": "Melanocytic Lesion Asymmetry",
        "pulmonary": "Normal Bilateral Parenchyma",
        "metabolic": "Fasting Glucose 112 mg/dL",
    }

    state = _TWIN_ENGINE.synthesize_twin_state(
        patient_id=patient_id,
        module_risks=v["module_risks"],
        top_biomarkers=top_biomarkers,
        active_view=view,
    )

    state["selected_visit"] = v
    state["timeline_visits"] = [
        {"visit_id": item["visit_id"], "date": item["date"], "crs": _TWIN_ENGINE.compute_composite_risk_score(item["module_risks"])}
        for item in _VISITS
    ]

    return state
