import numpy as np
import pytest
from backend.app.features.clinical.hybrid_router import ClinicalHybridRouter
from ml.quantum_engine.benchmarks import find_optimal_clinical_threshold, recommend_clinical_engine


def test_find_optimal_clinical_threshold():
    # 20 samples: 10 negative, 10 positive
    y_true = np.array([0] * 10 + [1] * 10)
    # Simulated uncalibrated probabilities skewed high
    y_prob = np.array([0.45, 0.48, 0.52, 0.55, 0.60, 0.62, 0.65, 0.70, 0.72, 0.75,
                       0.80, 0.82, 0.85, 0.88, 0.90, 0.92, 0.94, 0.95, 0.97, 0.99])

    # Uncalibrated 0.5 threshold would predict positive for 18/20 samples -> specificity = 2/10 = 0.20!
    uncalibrated_preds = (y_prob >= 0.5).astype(int)
    assert np.sum((y_true == 0) & (uncalibrated_preds == 0)) == 2

    # Calibrated threshold with min_specificity = 0.80
    thresh, metrics = find_optimal_clinical_threshold(y_true, y_prob, min_specificity=0.80)
    assert thresh >= 0.75
    assert metrics["specificity"] >= 0.80


def test_recommend_clinical_engine_safety_override():
    # When quantum specificity is low (e.g. 0.12) and classical is high (1.00)
    decision = recommend_clinical_engine(
        qas=-0.0083,
        quantum_accuracy=0.70,
        classical_accuracy=0.84,
        quantum_specificity=0.12,
        classical_specificity=1.00,
        min_specificity=0.80,
    )
    assert decision["recommended_engine"] == "classical"
    assert decision["safety_guardrail_applied"] is True
    assert "Safety Override" in decision["rationale"]


def test_recommend_clinical_engine_quantum_win():
    # When quantum has higher accuracy and positive QAS (e.g. Dermatology)
    decision = recommend_clinical_engine(
        qas=0.0090,
        quantum_accuracy=0.894,
        classical_accuracy=0.862,
        quantum_specificity=0.94,
        classical_specificity=0.91,
        min_specificity=0.80,
    )
    assert decision["recommended_engine"] == "quantum"
    assert decision["safety_guardrail_applied"] is False
    assert "Quantum Advantage Verified" in decision["rationale"]


def test_clinical_hybrid_router_routing_policies():
    router = ClinicalHybridRouter()

    # 1. Dermatology: Quantum Active
    derma_policy = router.decide_routing_policy("dermatology")
    assert derma_policy["active_engine"] == "quantum"
    assert "Q-Skin-Vortex" in derma_policy["recommended_quantum_model"]

    # 2. Pulmonology: Quantum Active
    pulm_policy = router.decide_routing_policy("pulmonology")
    assert pulm_policy["active_engine"] == "quantum"
    assert "QuantumPneu" in pulm_policy["recommended_quantum_model"]

    # 3. Breast Cancer: Classical Active (due to specificity 0.12 and accuracy lead)
    bc_policy = router.decide_routing_policy("breast_cancer")
    assert bc_policy["active_engine"] == "classical"
    assert "Sentinel-RF" in bc_policy["recommended_classical_model"]
    assert bc_policy["safety_override_triggered"] is True

    # 4. Cardiovascular: Classical Active (due to 26.6% accuracy lead)
    cardio_policy = router.decide_routing_policy("cardiovascular")
    assert cardio_policy["active_engine"] == "classical"
    assert "Sentinel-XGB" in cardio_policy["recommended_classical_model"]

    # 5. Parkinson's: Classical Active (due to specificity 0.25)
    park_policy = router.decide_routing_policy("parkinsons")
    assert park_policy["active_engine"] == "classical"
    assert "Sentinel-RF" in park_policy["recommended_classical_model"]
    assert park_policy["safety_override_triggered"] is True


def test_clinical_hybrid_router_arbitrate():
    router = ClinicalHybridRouter()
    class_labels = ["Malignant (High Risk)", "Benign (Non-malignant)"]

    q_probs = np.array([0.72, 0.28])
    c_probs = np.array([0.88, 0.12])

    arbitration = router.arbitrate(
        disease="breast_cancer",
        q_probs=q_probs,
        c_probs=c_probs,
        class_labels=class_labels,
        q_latency_ms=1570.0,
        c_latency_ms=18.0,
    )

    assert arbitration["active_engine"] == "classical"
    assert arbitration["primary_model"] == "Sentinel-RF"
    assert arbitration["primary_label"] == "Malignant (High Risk)"
    assert arbitration["primary_confidence"] == 0.88
    assert arbitration["safety_override_triggered"] is True
    assert "quantum_prediction" in arbitration
    assert "classical_prediction" in arbitration
    assert arbitration["consensus_agreement"] is True
