from __future__ import annotations

import pennylane as qml
import torch


def ring_entangle(n_qubits: int) -> None:
    for i in range(n_qubits):
        qml.CNOT(wires=[i, (i + 1) % n_qubits])


def ring_ansatz(weights: torch.Tensor, n_qubits: int) -> None:
    n_layers = int(weights.shape[0])
    for layer in range(n_layers):
        for i in range(n_qubits):
            qml.RY(weights[layer, i, 0], wires=i)
            qml.RZ(weights[layer, i, 1], wires=i)
        ring_entangle(n_qubits)


def strongly_entangling(weights: torch.Tensor, n_qubits: int) -> None:
    qml.StronglyEntanglingLayers(weights, wires=range(n_qubits))


def basic_entangler(weights: torch.Tensor, n_qubits: int) -> None:
    qml.BasicEntanglerLayers(weights, wires=range(n_qubits))
