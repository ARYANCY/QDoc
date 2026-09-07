from __future__ import annotations

import numpy as np
import pytest
import torch

from ml.quantum_engine.benchmarks import compute_entanglement_entropy, compute_quantum_advantage_score, evaluate_classification_metrics
from ml.quantum_engine.classical_baselines import ClassicalBaselineSuite
from ml.quantum_engine.qnn import MultiClassQuantumNeuralNetwork
from ml.quantum_engine.qsvm import QuantumSupportVectorMachine
from ml.quantum_engine.vqc import VariationalQuantumClassifier


def test_vqc_forward_and_prediction():
    X = np.random.uniform(0, np.pi, size=(8, 4)).astype(np.float32)
    vqc = VariationalQuantumClassifier(n_qubits=4, n_layers=2)
    probs = vqc.predict_proba(X)
    assert probs.shape == (8, 2)
    assert np.allclose(probs.sum(axis=1), 1.0, atol=1e-4)


def test_qsvm_kernel_and_fit():
    X = np.random.uniform(0, np.pi, size=(6, 4))
    y = np.array([0, 1, 0, 1, 0, 1])
    qsvm = QuantumSupportVectorMachine(n_qubits=4, feature_map="zz")
    res = qsvm.fit(X, y)
    assert res["kernel_dim"] == (6, 6)
    preds = qsvm.predict(X[:2])
    assert len(preds) == 2


def test_qnn_multiclass():
    X = np.random.uniform(0, np.pi, size=(6, 4)).astype(np.float32)
    qnn = MultiClassQuantumNeuralNetwork(num_classes=3, n_qubits=4, n_layers=2)
    probs = qnn.predict_proba(X)
    assert probs.shape == (6, 3)
    assert np.allclose(probs.sum(axis=1), 1.0, atol=1e-4)


def test_classical_baselines():
    X = np.random.randn(30, 4)
    y = np.random.randint(0, 2, size=30)
    suite = ClassicalBaselineSuite()
    times = suite.fit_all(X, y)
    assert "Random Forest" in times
    assert "Logistic Regression" in times
    preds = suite.predict_all(X[:5])
    assert len(preds["Random Forest"]) == 5


def test_qas_and_metrics():
    y_true = np.array([0, 1, 1, 0, 1])
    y_pred = np.array([0, 1, 1, 0, 0])
    metrics = evaluate_classification_metrics(y_true, y_pred)
    assert metrics["accuracy"] == 0.8
    assert "mcc" in metrics

    qas = compute_quantum_advantage_score(
        acc_quantum=0.95, acc_classical=0.90, t_classical_sec=0.002, t_quantum_sec=0.010
    )
    assert qas > 0.0

    # Entanglement entropy
    rho = np.array([[0.5, 0.0], [0.0, 0.5]])
    entropy = compute_entanglement_entropy(rho)
    assert np.isclose(entropy, 1.0, atol=1e-3)
