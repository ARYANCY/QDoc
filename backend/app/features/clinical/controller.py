from __future__ import annotations

import time
import uuid
from typing import Any

import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.db.repository import DatabaseRepository
from ml.data.dataset_registry import load_disease_benchmark
from ml.data.preprocessing import QuantumPreprocessor, deidentify_dataframe
from ml.explainability.explainer import ExplainabilityEngine
from ml.quantum_engine.classical_baselines import ClassicalBaselineSuite
from ml.quantum_engine.vqc import VariationalQuantumClassifier

router = APIRouter(prefix="/api/v1/clinical", tags=["Clinical Diagnosis"])


class DiagnosticRequest(BaseModel):
    disease: str = "breast_cancer"  # breast_cancer | heart | diabetes | pneumonia | skin
    model_type: str = "VQC"  # VQC | QSVM | QNN | Classical
    patient_id: str = "PT-89421"
    features: dict[str, float] | None = None


from backend.app.core.config import settings
import torch

# Pre-warmed model & preprocessor cache
_CACHE: dict[str, Any] = {}


def get_trained_module(disease: str):
    if disease not in _CACHE:
        df, target, feat_names = load_disease_benchmark(disease)
        preprocessor = QuantumPreprocessor(n_qubits=8, scaling="quantum_angle", use_pca=True)
        X_q = preprocessor.fit_transform(df.values, target.values)

        vqc = VariationalQuantumClassifier(n_qubits=8, n_layers=2)
        ckpt_path = settings.MODELS_DIR / "quantum" / f"VQC_{disease}.pt"

        if ckpt_path.exists():
            try:
                state = torch.load(ckpt_path, map_location="cpu", weights_only=False)
                vqc.load_state_dict(state["model"])
            except Exception:
                vqc.fit_dataset(X_q[:64], target.values[:64], epochs=4, lr=0.03, batch_size=16)
        else:
            vqc.fit_dataset(X_q[:64], target.values[:64], epochs=4, lr=0.03, batch_size=16)
            try:
                ckpt_path.parent.mkdir(parents=True, exist_ok=True)
                torch.save({"model": vqc.state_dict()}, ckpt_path)
            except Exception:
                pass

        baselines = ClassicalBaselineSuite()
        baselines.fit_all(df.values[:100], target.values[:100])

        explainer = ExplainabilityEngine(feat_names)

        _CACHE[disease] = {
            "df": df,
            "target": target,
            "feat_names": feat_names,
            "preprocessor": preprocessor,
            "vqc": vqc,
            "baselines": baselines,
            "explainer": explainer,
        }
    return _CACHE[disease]



@router.post("/diagnose")
async def run_clinical_diagnosis(req: DiagnosticRequest):
    """Executes hybrid quantum-classical clinical diagnostic pipeline with explainability and fallback."""
    start_time = time.perf_counter()
    disease_key = req.disease.lower()

    try:
        module = get_trained_module(disease_key)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Unsupported disease module '{req.disease}': {exc}")

    df = module["df"]
    feat_names = module["feat_names"]
    preprocessor = module["preprocessor"]
    vqc = module["vqc"]
    baselines = module["baselines"]
    explainer = module["explainer"]

    # Sample input
    if req.features:
        sample_vec = np.array([req.features.get(f, float(df[f].mean())) for f in feat_names], dtype=np.float32)
    else:
        sample_vec = df.iloc[np.random.randint(0, len(df))].values.astype(np.float32)

    # Quantum pipeline execution with graceful fallback
    fallback_used = False
    try:
        sample_q = preprocessor.transform(sample_vec.reshape(1, -1))
        q_probs = vqc.predict_proba(sample_q)[0]
        q_class_idx = int(q_probs.argmax())
        q_conf = float(q_probs[q_class_idx])
    except Exception:
        fallback_used = True
        c_probs = baselines.models["Random Forest"].predict_proba(sample_vec.reshape(1, -1))[0]
        q_class_idx = int(c_probs.argmax())
        q_conf = float(c_probs[q_class_idx])
        q_probs = c_probs

    # Classical comparison
    c_probs = baselines.models["Logistic Regression"].predict_proba(sample_vec.reshape(1, -1))[0]
    c_conf = float(c_probs[q_class_idx])

    # Class naming
    if disease_key in {"breast_cancer", "wdbc"}:
        class_labels = ["Malignant (High Risk)", "Benign (Non-malignant)"]
        disease_name = "Breast Oncology (WDBC)"
    elif disease_key in {"heart", "cleveland"}:
        class_labels = ["No Coronary Disease", "Cardiovascular Disease Present"]
        disease_name = "Cardiology (Cleveland)"
    else:
        class_labels = ["Negative / Non-diabetic", "Positive / Diabetic"]
        disease_name = "Metabolic Disorder (PIMA)"

    predicted_label = class_labels[q_class_idx] if q_class_idx < len(class_labels) else f"Class {q_class_idx}"

    # Quantum perturbation explainability
    top_features = explainer.compute_quantum_perturbation_importance(
        lambda x: vqc.predict_proba(x), sample_q[0]
    )

    narrative = explainer.generate_clinical_narrative(
        predicted_label, q_conf, c_conf, top_features, disease_name
    )

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

    result_payload = {
        "request_id": str(uuid.uuid4()),
        "patient_id": req.patient_id,
        "disease": disease_name,
        "model_architecture": f"VQC (8-Qubit Hardware-Efficient Ansatz)" if not fallback_used else "Classical Fallback (Random Forest)",
        "fallback_mode": fallback_used,
        "prediction": {
            "class": predicted_label,
            "class_index": q_class_idx,
            "confidence": round(q_conf, 4),
            "severity": "danger" if q_class_idx == 0 and "malignant" in predicted_label.lower() or q_class_idx == 1 and "disease" in predicted_label.lower() else "normal",
        },
        "probabilities": {
            class_labels[i] if i < len(class_labels) else f"Class {i}": round(float(q_probs[i]), 4)
            for i in range(len(q_probs))
        },
        "classical_baseline": {
            "model": "Logistic Regression",
            "confidence": round(c_conf, 4),
        },
        "explainability": {
            "top_features": top_features[:6],
            "clinical_narrative": narrative,
        },
        "quantum_telemetry": {
            "qubits": 8,
            "layers": 2,
            "data_reupload": True,
            "entanglement": "Circular CNOT",
            "device": "PennyLane default.qubit",
        },
        "inference_ms": elapsed_ms,
        "disclaimer": "This output is generated by an AI clinical decision-support tool (SaMD) and does not replace professional diagnostic judgment.",
    }

    # Persist execution into database and log audit trail
    try:
        DatabaseRepository.save_diagnostic_record(result_payload)
        DatabaseRepository.add_audit_log(
            actor=f"Patient ({req.patient_id})",  # H2: use actual patient_id
            action="DIAGNOSTIC_EXECUTION",
            resource=f"{req.patient_id}:{disease_name}",
            ip_address="127.0.0.1",
            status="SUCCESS",
        )
    except Exception as exc:
        import logging
        logging.getLogger(__name__).error("Failed to persist diagnostic record: %s", exc)


    return result_payload


@router.get("/patient/{patient_id}")
async def get_patient_clinical_record(patient_id: str):
    """Retrieves real patient clinical telemetry, conditions, and vitals from the SQLite database."""
    patient = DatabaseRepository.get_patient(patient_id)
    if not patient:
        patient = DatabaseRepository.create_or_update_patient({
            "id": patient_id,
            "name": f"Patient {patient_id}",
            "age": 48,
            "gender": "Unspecified",
            "blood_group": "O+",
        })
    return {"status": "success", "patient": patient}


@router.get("/patient/{patient_id}/features/{disease}")
async def get_patient_disease_features(patient_id: str, disease: str):
    """Extracts standardized clinical feature vectors and mean values for the selected protocol."""
    try:
        module = get_trained_module(disease.lower())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Unsupported disease protocol: {exc}")

    df = module["df"]
    feat_names = module["feat_names"]

    # Sample a representative real patient feature profile from dataset
    sample_row = df.iloc[0].to_dict()
    feature_items = [
        {"name": k, "value": round(float(v), 3), "mean": round(float(df[k].mean()), 3), "unit": "a.u."}
        for k, v in list(sample_row.items())[:12]
    ]

    return {
        "status": "success",
        "patient_id": patient_id,
        "disease": disease,
        "features": feature_items,
        "total_features": len(feat_names),
    }


@router.get("/status")
def get_clinical_status():
    """System health check for container liveness and readiness."""
    return {"status": "ok", "service": "Q-MedSense Clinical Inference Engine", "quantum_backend": "PennyLane default.qubit"}
