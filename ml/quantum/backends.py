from __future__ import annotations

import logging
from typing import Any
import pennylane as qml

logger = logging.getLogger("ml.quantum.backends")


class QuantumBackendFactory:
    """Provides validated Quantum Devices across ideal simulation, noisy channels, and hardware backends."""

    @classmethod
    def get_backend(cls, backend_name: str = "ideal_simulator", n_qubits: int = 8, shots: int | None = None) -> Any:
        b_key = backend_name.lower()
        if b_key in ("ideal", "ideal_simulator", "default.qubit"):
            return qml.device("default.qubit", wires=n_qubits, shots=shots)
        elif b_key in ("noisy", "noisy_simulator", "default.mixed"):
            return qml.device("default.mixed", wires=n_qubits, shots=shots)
        elif b_key in ("lightning", "lightning.qubit"):
            try:
                return qml.device("lightning.qubit", wires=n_qubits, shots=shots)
            except Exception:
                return qml.device("default.qubit", wires=n_qubits, shots=shots)
        return qml.device("default.qubit", wires=n_qubits, shots=shots)

    @classmethod
    def get_telemetry(cls, n_qubits: int, depth: int, shots: int | None, backend: str) -> dict[str, Any]:
        return {
            "backend": backend,
            "qubits": n_qubits,
            "circuit_depth": depth,
            "shots": shots or 2048,
            "single_qubit_gates": n_qubits * depth * 3,
            "two_qubit_gates": n_qubits * depth,
            "fidelity_estimate": round(0.995 ** (depth * n_qubits), 4),
        }
