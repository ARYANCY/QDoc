from __future__ import annotations

import numpy as np
import pytest

from ml.uncertainty.conformal import ConformalPredictor
from ml.uncertainty.ood import IsolationForestOODDetector, MahalanobisOODDetector


def test_mahalanobis_ood_detector():
    rng = np.random.RandomState(42)
    # Class 0 centered at 0, Class 1 centered at 5
    X_train_c0 = rng.randn(30, 8)
    X_train_c1 = rng.randn(30, 8) + 5.0
    X_train = np.vstack([X_train_c0, X_train_c1])
    y_train = np.array([0] * 30 + [1] * 30)

    detector = MahalanobisOODDetector(threshold_percentile=95.0)
    detector.fit(X_train, y_train)

    # In-distribution sample
    in_dist = rng.randn(1, 8)
    in_res = detector.predict_ood(in_dist)
    assert in_res["ood_detected"] is False

    # Extreme Out-of-Distribution sample (centered at 50)
    out_dist = rng.randn(1, 8) + 50.0
    out_res = detector.predict_ood(out_dist)
    assert out_res["ood_detected"] is True
    assert out_res["ood_score"] > 0.8


def test_conformal_prediction_sets():
    rng = np.random.RandomState(42)
    val_probs = np.array([
        [0.9, 0.1],
        [0.85, 0.15],
        [0.1, 0.9],
        [0.15, 0.85],
        [0.95, 0.05],
    ])
    y_val = np.array([0, 0, 1, 1, 0])

    conformal = ConformalPredictor(alpha=0.10)
    conformal.calibrate(val_probs, y_val)
    assert conformal.is_calibrated

    test_probs = np.array([[0.92, 0.08], [0.51, 0.49]])
    sets = conformal.predict_set(test_probs, class_labels=["Normal", "Pathology"])

    assert len(sets) == 2
    # High confidence sample should have set size 1
    assert sets[0]["set_size"] == 1
    assert sets[0]["uncertainty_status"] == "LOW"

    # Ambiguous sample should have set size 2 and HIGH uncertainty
    assert sets[1]["set_size"] == 2
    assert sets[1]["uncertainty_status"] == "HIGH"
