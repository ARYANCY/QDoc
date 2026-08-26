from __future__ import annotations

import torch
import torch.nn as nn

from ml.skin_cancer.quantum.quantum_layers import QuantumLayer, angle_scale


class VitaQDerm(nn.Module):
    """Raw-feature quantum model with data re-uploading.

    Unlike QuantumDerma, VitaQDerm accepts the full (un-PCA'd) compact CNN
    features via a learned projection, then passes them through the quantum
    circuit.  A BatchNorm on the input and a deeper post-quantum MLP improve
    training stability.

    Architecture:
        BatchNorm(in_dim) → Linear(in_dim, n_qubits) → angle_scale →
        QuantumLayer(data_reupload=True) → LayerNorm → MLP(3 layers) → logits
    """

    def __init__(
        self,
        num_classes: int,
        n_qubits: int = 10,
        n_layers: int = 4,
        in_dim: int = 128,
        dropout: float = 0.2,
        data_reupload: bool = True,
    ):
        super().__init__()
        self.bn = nn.BatchNorm1d(in_dim)
        self.projection = nn.Linear(in_dim, n_qubits)
        self.quantum = QuantumLayer(n_qubits, n_layers, data_reupload=data_reupload)

        hidden = max(32, num_classes * 8)
        self.mlp = nn.Sequential(
            nn.LayerNorm(n_qubits),
            nn.Dropout(dropout),
            nn.Linear(n_qubits, hidden),
            nn.GELU(),
            nn.Dropout(dropout * 0.5),
            nn.Linear(hidden, max(16, num_classes * 2)),
            nn.GELU(),
            nn.Linear(max(16, num_classes * 2), num_classes),
        )
        # Classical residual shortcut
        self.residual = nn.Linear(in_dim, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x_norm = self.bn(x)
        q = self.quantum(angle_scale(self.projection(x_norm)))
        return self.mlp(q) + self.residual(x)
