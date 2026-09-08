from __future__ import annotations

import numpy as np
import pytest

from ml.evaluation.bootstrap import compute_bootstrap_ci
from ml.evaluation.calibration import TemperatureScaler, compute_expected_calibration_error
from ml.evaluation.metrics import compute_quantum_advantage_score, evaluate_clinical_metrics
from ml.evaluation.statistical_tests import delong_roc_test, mcnemar_paired_test


def test_clinical_metrics_and_qas():
    y_true = np.array([0, 0, 1, 1, 1])
    y_pred = np.array([0, 0, 1, 1, 0])
    y_prob = np.array([[0.9, 0.1], [0.8, 0.2], [0.1, 0.9], [0.2, 0.8], [0.6, 0.4]])

    metrics = evaluate_clinical_metrics(y_true, y_pred, y_prob, inference_time_sec=0.015)
    assert metrics["accuracy"] == 0.8
    assert "auc_roc" in metrics
    assert "brier_score" in metrics
    assert "calibration_error" in metrics
    assert metrics["inference_time_ms"] == 15.0

    qas = compute_quantum_advantage_score(
        acc_quantum=0.95, acc_classical=0.90, t_classical_sec=0.005, t_quantum_sec=0.020
    )
    assert qas > 0.0


def test_temperature_calibration():
    logits = np.array([[2.0, -2.0], [1.5, -1.0], [-2.0, 2.0], [-1.5, 1.5]])
    y_val = np.array([0, 0, 1, 1])

    scaler = TemperatureScaler()
    scaler.fit(logits, y_val)
    assert scaler.is_fitted
    cal_probs = scaler.transform(logits)
    assert cal_probs.shape == (4, 2)
    assert np.allclose(cal_probs.sum(axis=1), 1.0)


def test_bootstrap_ci_and_delong_mcnemar():
    y_true = np.array([0, 0, 0, 1, 1, 1, 0, 1])
    y_prob_a = np.array([0.1, 0.2, 0.3, 0.8, 0.9, 0.7, 0.2, 0.85])
    y_prob_b = np.array([0.2, 0.3, 0.4, 0.7, 0.8, 0.6, 0.3, 0.75])

    ci = compute_bootstrap_ci(y_true, y_prob_a, n_bootstraps=50)
    assert "mean" in ci
    assert "ci_lower" in ci
    assert "ci_upper" in ci

    delong = delong_roc_test(y_true, y_prob_a, y_prob_b)
    assert "p_value" in delong
    assert "z_score" in delong

    mcnemar = mcnemar_paired_test(y_true, (y_prob_a > 0.5).astype(int), (y_prob_b > 0.5).astype(int))
    assert "statistic" in mcnemar
