from __future__ import annotations

import numpy as np
import pytest
import torch

from ml.quantum.backends import QuantumBackendFactory
from ml.quantum.hybrid import HybridQNNClassifier
from ml.quantum.kernels import QuantumKernelEngine, QuantumSupportVectorMachine
from ml.quantum.noise import NoiseTelemetry
from ml.quantum.vqc import VariationalQuantumClassifier


def test_quantum_kernel_and_qsvm():
    X = np.random.uniform(0, np.pi, size=(6, 4)).astype(np.float32)
    y = np.array([0, 1, 0, 1, 0, 1])

    engine = QuantumKernelEngine(n_qubits=4, feature_map="angle")
    sim = engine.compute_similarity(X[0], X[0])
    assert np.isclose(sim, 1.0, atol=1e-3)

    qsvm = QuantumSupportVectorMachine(n_qubits=4, feature_map="angle")
    fit_res = qsvm.fit(X, y)
    assert fit_res["kernel_dim"] == [6, 6]
    preds = qsvm.predict(X[:2])
    assert len(preds) == 2


def test_vqc_forward_and_gradient_telemetry():
    X = np.random.uniform(0, np.pi, size=(4, 8)).astype(np.float32)
    y = np.array([0, 1, 0, 1])

    vqc = VariationalQuantumClassifier(n_qubits=8, n_layers=2, data_reupload=True)
    probs = vqc.predict_proba(X)
    assert probs.shape == (4, 2)
    assert np.allclose(probs.sum(axis=1), 1.0, atol=1e-3)

    # Train 1 epoch to verify gradient telemetry
    res = vqc.fit_dataset(X, y, epochs=1, lr=0.01, batch_size=4)
    assert "history" in res
    assert len(res["history"]) == 1
    assert "grad_var" in res["history"][0]


def test_hybrid_qnn_multiclass():
    X = np.random.uniform(0, np.pi, size=(4, 4)).astype(np.float32)
    hqnn = HybridQNNClassifier(num_classes=3, n_qubits=4, n_layers=2)
    probs = hqnn.predict_proba(X)
    assert probs.shape == (4, 3)
    assert np.allclose(probs.sum(axis=1), 1.0, atol=1e-3)


def test_quantum_telemetry_and_noise():
    backend_telemetry = QuantumBackendFactory.get_telemetry(n_qubits=8, depth=3, shots=2048, backend="default.qubit")
    assert backend_telemetry["qubits"] == 8
    assert backend_telemetry["single_qubit_gates"] == 72

    noise = NoiseTelemetry()
    profile = noise.get_noise_profile(n_qubits=8, depth=2)
    assert 0.0 <= profile["estimated_circuit_fidelity"] <= 1.0
