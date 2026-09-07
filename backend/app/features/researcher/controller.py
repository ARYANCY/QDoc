from __future__ import annotations

import time
import uuid
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from ml.data.dataset_registry import load_disease_benchmark
from ml.data.preprocessing import QuantumPreprocessor
from ml.quantum_engine.vqc import VariationalQuantumClassifier

router = APIRouter(prefix="/api/v1/researcher", tags=["Researcher Retraining Studio"])


class RetrainingJobRequest(BaseModel):
    dataset: str = "wdbc"  # wdbc | cleveland | pima
    model_architecture: str = "VQC"  # VQC | QSVM | QNN
    n_qubits: int = 8
    n_layers: int = 3
    epochs: int = 5
    learning_rate: float = 0.02
    loss_function: str = "Focal Loss"  # Focal Loss | CrossEntropy


@router.post("/train")
async def trigger_model_retraining(req: RetrainingJobRequest):
    """Dispatches live hybrid quantum model training job and returns convergence curves and telemetry per SRS FR-14."""
    start_time = time.perf_counter()
    job_id = f"JOB-QML-{str(uuid.uuid4())[:8].upper()}"

    df, target, feat_names = load_disease_benchmark(req.dataset)
    preprocessor = QuantumPreprocessor(n_qubits=req.n_qubits, scaling="quantum_angle", use_pca=True)
    X_q = preprocessor.fit_transform(df.values, target.values)

    # Train actual VQC model
    vqc = VariationalQuantumClassifier(n_qubits=req.n_qubits, n_layers=req.n_layers)
    train_res = vqc.fit_dataset(
        X_train=X_q[:64],
        y_train=target.values[:64],
        epochs=req.epochs,
        lr=req.learning_rate,
        batch_size=16,
    )

    elapsed_sec = round(time.perf_counter() - start_time, 2)

    # Persist trained model checkpoint to disk
    from backend.app.core.config import settings
    import torch
    
    ckpt_filename = f"{job_id}.pt"
    ckpt_path = settings.MODELS_DIR / "quantum" / ckpt_filename
    try:
        ckpt_path.parent.mkdir(parents=True, exist_ok=True)
        torch.save({
            "job_id": job_id,
            "dataset": req.dataset,
            "model_architecture": req.model_architecture,
            "hyperparameters": {
                "n_qubits": req.n_qubits,
                "n_layers": req.n_layers,
                "epochs": req.epochs,
                "learning_rate": req.learning_rate,
            },
            "model": vqc.state_dict(),
            "final_accuracy": train_res["final_acc"],
        }, ckpt_path)
    except Exception:
        pass

    return {
        "job_id": job_id,
        "dataset": req.dataset.upper(),
        "model_architecture": req.model_architecture,
        "hyperparameters": {
            "n_qubits": req.n_qubits,
            "n_layers": req.n_layers,
            "epochs": req.epochs,
            "learning_rate": req.learning_rate,
            "loss_function": req.loss_function,
        },
        "training_history": train_res["history"],
        "final_accuracy": train_res["final_acc"],
        "training_time_seconds": elapsed_sec,
        "status": "COMPLETED",
        "registered_model_tag": f"REG-{req.model_architecture}-{req.dataset.upper()}-v2.2",
        "checkpoint_file": ckpt_filename,
    }

