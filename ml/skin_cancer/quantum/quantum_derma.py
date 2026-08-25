from __future__ import annotations

import torch
import torch.nn as nn

from ml.skin_cancer.quantum.quantum_layers import QuantumLayer, angle_scale


class QuantumHead(nn.Module):
    """Trainable quantum classifier on compact classical features."""

    def __init__(
        self,
        num_classes: int,
        n_qubits: int = 8,
        n_layers: int = 2,
        in_dim: int = 8,
        dropout: float = 0.2,
        embedding: str = "angle",
        ansatz: str = "ring",
    ):
        super().__init__()
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        self.projection = nn.Identity() if in_dim == n_qubits else nn.Linear(in_dim, n_qubits)
        self.quantum = QuantumLayer(n_qubits, n_layers, embedding, ansatz)
        self.classifier = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(n_qubits, max(16, num_classes * 4)),
            nn.ReLU(inplace=True),
            nn.Linear(max(16, num_classes * 4), num_classes),
        )
        self.classical_residual = nn.Linear(in_dim, num_classes)

    def quantum_features(self, x: torch.Tensor) -> torch.Tensor:
        x = self.projection(x)
        x = angle_scale(x)
        return self.quantum(x)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        quantum_logits = self.classifier(self.quantum_features(x))
        return quantum_logits + self.classical_residual(x)


class QuantumDerma(QuantumHead):
    pass
