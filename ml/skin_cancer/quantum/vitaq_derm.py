from __future__ import annotations

import torch.nn as nn

from ml.skin_cancer.quantum.quantum_layers import QuantumLayer, angle_scale


class VitaQDerm(nn.Module):
    def __init__(self, num_classes: int, n_qubits: int = 8, n_layers: int = 2, in_dim: int = 128):
        super().__init__()
        self.projection = nn.Linear(in_dim, n_qubits)
        self.quantum = QuantumLayer(n_qubits, n_layers)
        self.mlp = nn.Sequential(
            nn.Linear(n_qubits, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(64, num_classes),
        )

    def forward(self, x):
        q = self.quantum(angle_scale(self.projection(x)))
        return self.mlp(q)
