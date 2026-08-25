from __future__ import annotations

import pennylane as qml
import torch


def angle_encode(features: torch.Tensor, n_qubits: int) -> None:
    qml.AngleEmbedding(features, wires=range(n_qubits), rotation="Y")
    qml.AngleEmbedding(features, wires=range(n_qubits), rotation="Z")


def amplitude_encode(features: torch.Tensor, n_qubits: int) -> None:
    qml.AmplitudeEmbedding(features, wires=range(n_qubits), normalize=True, pad_with=0.0)


def basis_encode(features: torch.Tensor, n_qubits: int) -> None:
    qml.BasisEmbedding(features, wires=range(n_qubits))
