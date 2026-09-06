from __future__ import annotations

import time
from typing import Any

import numpy as np
import pennylane as qml
import torch
import torch.nn as nn


class MultiClassQuantumNeuralNetwork(nn.Module):
    """Quantum Neural Network (QNN) for Multi-Class classification per SRS Section 4.5:
    - Output layer: y_hat_c = softmax( sum_q w_{c,q} <Z_q> + b_c )
    - Categorical Cross-Entropy loss
    - Hardware-Efficient multi-qubit measurement
    """

    def __init__(
        self,
        num_classes: int = 2,
        n_qubits: int = 8,
        n_layers: int = 4,
        device_name: str = "default.qubit",
    ):
        super().__init__()
        self.num_classes = num_classes
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        self.dev = qml.device(device_name, wires=n_qubits)

        @qml.qnode(self.dev, interface="torch", diff_method="best")
        def _qnn_circuit(inputs, weights):
            for l in range(n_layers):
                for i in range(n_qubits):
                    qml.RY(inputs[i], wires=i)
                    qml.Rot(weights[l, i, 0], weights[l, i, 1], weights[l, i, 2], wires=i)

                for i in range(n_qubits):
                    qml.CZ(wires=[i, (i + 1) % n_qubits])

            return [qml.expval(qml.PauliZ(i)) for i in range(n_qubits)]

        self.circuit = _qnn_circuit
        self.weights = nn.Parameter(torch.randn(n_layers, n_qubits, 3) * 0.05)
        self.classifier_head = nn.Sequential(
            nn.BatchNorm1d(n_qubits),
            nn.Linear(n_qubits, 32),
            nn.GELU(),
            nn.Linear(32, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        batch_size = x.shape[0]
        expvals = []
        for i in range(batch_size):
            ev = self.circuit(x[i], self.weights)
            if isinstance(ev, (list, tuple)):
                ev_t = torch.stack(ev)
            else:
                ev_t = ev
            expvals.append(ev_t)

        expvals_tensor = torch.stack(expvals).to(x.device).float()
        logits = self.classifier_head(expvals_tensor)
        return logits

    def fit_dataset(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        epochs: int = 15,
        lr: float = 0.015,
        batch_size: int = 16,
    ) -> dict[str, Any]:
        optimizer = torch.optim.AdamW(self.parameters(), lr=lr, weight_decay=1e-3)
        criterion = nn.CrossEntropyLoss()

        X_t = torch.tensor(X_train, dtype=torch.float32)
        y_t = torch.tensor(y_train, dtype=torch.long)

        dataset = torch.utils.data.TensorDataset(X_t, y_t)
        loader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)

        history = []
        start_time = time.perf_counter()
        self.train()
        for epoch in range(epochs):
            epoch_loss = 0.0
            correct = 0
            total = 0
            for bx, by in loader:
                optimizer.zero_grad()
                out = self(bx)
                loss = criterion(out, by)
                loss.backward()
                optimizer.step()

                epoch_loss += loss.item() * bx.size(0)
                preds = out.argmax(dim=1)
                correct += (preds == by).sum().item()
                total += bx.size(0)

            acc = correct / max(total, 1)
            history.append({"epoch": epoch + 1, "loss": epoch_loss / total, "accuracy": acc})

        train_time = time.perf_counter() - start_time
        return {"train_time_sec": train_time, "history": history, "final_acc": history[-1]["accuracy"]}

    @torch.no_grad()
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        self.eval()
        X_t = torch.tensor(X, dtype=torch.float32)
        logits = self(X_t)
        return torch.softmax(logits, dim=1).cpu().numpy()

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.predict_proba(X).argmax(axis=1)
