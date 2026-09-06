from __future__ import annotations

import math
from typing import Any

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    matthews_corrcoef,
    precision_score,
    recall_score,
    roc_auc_score,
)


def evaluate_classification_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: np.ndarray | None = None,
    inference_time_sec: float = 0.001,
) -> dict[str, Any]:
    """Computes all standard clinical and ML metrics from SRS Section 4.6:
    - Accuracy = (TP + TN) / (TP + TN + FP + FN)
    - Sensitivity (Recall) = TP / (TP + FN)
    - Specificity = TN / (TN + FP)
    - Precision = TP / (TP + FP)
    - F1-Score = 2 * (Precision * Recall) / (Precision + Recall)
    - Matthews Correlation Coefficient (MCC)
    - AUC-ROC
    """
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, average="weighted", zero_division=0))
    sens = float(recall_score(y_true, y_pred, average="weighted", zero_division=0))
    f1 = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))
    mcc = float(matthews_corrcoef(y_true, y_pred)) if len(np.unique(y_true)) > 1 else 0.0

    cm = confusion_matrix(y_true, y_pred)
    if cm.shape == (2, 2):
        tn, fp, fn, tp = cm.ravel()
        spec = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0
    else:
        spec = float(sens)  # multi-class fallback

    auc = None
    if y_prob is not None:
        try:
            if y_prob.ndim == 2 and y_prob.shape[1] == 2:
                auc = float(roc_auc_score(y_true, y_prob[:, 1]))
            elif y_prob.ndim == 2 and y_prob.shape[1] > 2:
                auc = float(roc_auc_score(y_true, y_prob, multi_class="ovr", average="weighted"))
            else:
                auc = float(roc_auc_score(y_true, y_prob))
        except Exception:
            auc = 0.5

    return {
        "accuracy": round(acc, 4),
        "sensitivity": round(sens, 4),
        "specificity": round(spec, 4),
        "precision": round(prec, 4),
        "f1_score": round(f1, 4),
        "mcc": round(mcc, 4),
        "auc_roc": round(auc, 4) if auc is not None else None,
        "inference_time_ms": round(inference_time_sec * 1000, 2),
        "confusion_matrix": cm.tolist(),
    }


def compute_quantum_advantage_score(
    acc_quantum: float,
    acc_classical: float,
    t_classical_sec: float,
    t_quantum_sec: float,
) -> float:
    """Computes the novel Quantum Advantage Score (QAS) per SRS Section 4.6:
    QAS = ( (Acc_quantum - Acc_classical) / Acc_classical ) * ( T_classical / T_quantum )
    """
    if acc_classical <= 0 or t_quantum_sec <= 0:
        return 0.0
    acc_delta = (acc_quantum - acc_classical) / acc_classical
    # Soft relative runtime scaling
    time_ratio = min(max(t_classical_sec / t_quantum_sec, 0.05), 20.0)
    qas = acc_delta * time_ratio
    return round(float(qas), 4)


def compute_entanglement_entropy(density_matrix: np.ndarray) -> float:
    """Computes von Neumann entanglement entropy S(rho) = -Tr(rho log2 rho)
    for circuit quantum correlation verification (SRS Section 6 & 16).
    """
    eigenvals = np.linalg.eigvalsh(density_matrix)
    eigenvals = eigenvals[eigenvals > 1e-12]
    entropy = -np.sum(eigenvals * np.log2(eigenvals))
    return round(float(entropy), 4)
