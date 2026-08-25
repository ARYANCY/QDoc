from __future__ import annotations

import math

import pennylane as qml
import torch
import torch.nn as nn

from ml.skin_cancer.quantum.ansatz import ring_ansatz
from ml.skin_cancer.quantum.encodings import angle_encode


def build_qnode(n_qubits: int, n_layers: int, embedding: str = "angle", ansatz: str = "ring"):
    dev = qml.device("default.qubit", wires=n_qubits)

    weight_shapes = {"weights": (n_layers, n_qubits, 2)}
    if ansatz == "strongly":
        weight_shapes = {"weights": (n_layers, n_qubits, 3)}

    @qml.qnode(dev, interface="torch", diff_method="backprop")
    def circuit(inputs, weights):
        if embedding == "angle":
            angle_encode(inputs, n_qubits)
        else:
            qml.AngleEmbedding(inputs, wires=range(n_qubits), rotation="Y")
        if ansatz == "strongly":
            qml.StronglyEntanglingLayers(weights, wires=range(n_qubits))
        else:
            ring_ansatz(weights, n_qubits)
        return [qml.expval(qml.PauliZ(i)) for i in range(n_qubits)]

    return circuit, weight_shapes


class QuantumLayer(nn.Module):
    def __init__(
        self,
        n_qubits: int = 8,
        n_layers: int = 2,
        embedding: str = "angle",
        ansatz: str = "ring",
    ):
        super().__init__()
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        circuit, shapes = build_qnode(n_qubits, n_layers, embedding, ansatz)
        self.qnn = qml.qnn.TorchLayer(circuit, shapes)
        with torch.no_grad():
            for param in self.qnn.parameters():
                param.normal_(0.0, 0.01)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.qnn(x)


def angle_scale(x: torch.Tensor) -> torch.Tensor:
    return math.pi * torch.tanh(x)
