from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from backend.app.core.security import get_current_user
from backend.app.db.repository import DatabaseRepository
from ml.digital_twin.digital_twin import DigitalTwinEngine

router = APIRouter(prefix="/api/v1/digital-twin", tags=["2D Digital Twin"])

_TWIN_ENGINE = DigitalTwinEngine()

# Temporal visit history archive fallback
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
    current_user: dict = Depends(get_current_user),
):
    """Returns 2D Digital Twin physiological parameters, CRS score, organ heatmaps, and timeline scrubber data.
    Populates dynamically from real SQLite diagnostic records if present.
    """
    if current_user.get("role") == "doctor":
        raise HTTPException(status_code=403, detail="Digital Twin access is restricted to patients and administrators.")
    records = DatabaseRepository.get_patient_diagnostic_records(patient_id)
    visits = list(_VISITS)

    top_biomarkers = {
        "cardiovascular": "Thalach 138 bpm / Oldpeak 2.1",
        "oncology_breast": "Mean Radius 17.9 / Concavity 0.28",
        "oncology_skin": "Melanocytic Lesion Asymmetry",
        "pulmonary": "Normal Bilateral Parenchyma",
        "metabolic": "Fasting Glucose 112 mg/dL",
    }

    if records:
        # Build dynamic visits from actual database records
        real_visits = []
        for rec in reversed(records[:5]):
            dis = rec.get("disease", "").lower()
            conf = float(rec.get("confidence", 0.5))
            created = str(rec.get("created_at", "2026-09-07")).split(" ")[0]
            
            mod_risks = {
                "cardiovascular": 0.45 if "heart" in dis or "cardio" in dis else 0.20,
                "oncology_breast": conf if "breast" in dis or "cancer" in dis else 0.15,
                "oncology_skin": conf if "skin" in dis or "derma" in dis else 0.12,
                "pulmonary": conf if "pneu" in dis or "lung" in dis else 0.15,
                "metabolic": conf if "diabet" in dis else 0.18,
            }
            real_visits.append({
                "visit_id": rec["id"],
                "date": created,
                "module_risks": mod_risks,
                "notes": f"Diagnostic run: {rec.get('disease')} ({rec.get('prediction_class')})",
            })
            # Extract top biomarkers from explainability if available
            expl = rec.get("explainability", {})
            if isinstance(expl, dict) and "top_features" in expl:
                feats = expl.get("top_features", [])
                if feats and isinstance(feats, list):
                    top_f = feats[0]
                    fname = top_f.get("feature", "Marker") if isinstance(top_f, dict) else str(top_f)
                    if "breast" in dis:
                        top_biomarkers["oncology_breast"] = fname
                    elif "cardio" in dis:
                        top_biomarkers["cardiovascular"] = fname
                    elif "pneu" in dis:
                        top_biomarkers["pulmonary"] = fname

        if real_visits:
            visits = real_visits

    v = visits[visit_index if 0 <= visit_index < len(visits) else -1]

    state = _TWIN_ENGINE.synthesize_twin_state(
        patient_id=patient_id,
        module_risks=v["module_risks"],
        top_biomarkers=top_biomarkers,
        active_view=view,
    )

    state["selected_visit"] = v
    state["timeline_visits"] = [
        {"visit_id": item["visit_id"], "date": item["date"], "crs": _TWIN_ENGINE.compute_composite_risk_score(item["module_risks"])}
        for item in visits
    ]

    return state

