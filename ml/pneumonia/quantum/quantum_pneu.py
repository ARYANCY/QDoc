import torch.nn as nn

from ml.skin_cancer.quantum.quantum_layers import QuantumLayer, angle_scale


class QuantumPneu(nn.Module):
    def __init__(self, in_dim: int, n_qubits: int = 4, n_layers: int = 2):
        super().__init__()
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        self.projection = nn.Linear(in_dim, n_qubits)
        self.quantum = QuantumLayer(n_qubits, n_layers)
        self.classifier = nn.Linear(n_qubits, 2)

    def forward(self, features):
        return self.classifier(self.quantum(angle_scale(self.projection(features))))