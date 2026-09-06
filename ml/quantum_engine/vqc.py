from __future__ import annotations

import time
from typing import Any

import numpy as np
import pennylane as qml
import torch
import torch.nn as nn


class VariationalQuantumClassifier(nn.Module):
    """Variational Quantum Classifier (VQC) per SRS Section 4.3:
    - Angle Feature Encoding |phi(x)> = tensor_i RY(x_i)|0>_i
    - Hardware-Efficient Strongly Entangling Ansatz U(theta)
    - Continuous Data Re-Uploading
    - Measurement expectation value <Z_0>
    - Parameter-shift rule / Autograd gradients
    """

    def __init__(
        self,
        n_qubits: int = 8,
        n_layers: int = 3,
        data_reupload: bool = True,
        device_name: str = "default.qubit",
    ):
        super().__init__()
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        self.data_reupload = data_reupload
        self.dev = qml.device(device_name, wires=n_qubits)

        # Build QNode
        @qml.qnode(self.dev, interface="torch", diff_method="best")
        def _circuit(inputs, weights):
            # inputs shape: (n_qubits,)
            # weights shape: (n_layers, n_qubits, 3)
            for l in range(n_layers):
                if l == 0 or data_reupload:
                    for i in range(n_qubits):
                        qml.RY(inputs[i], wires=i)
                        qml.RZ(inputs[i] * 0.5, wires=i)

                # Strongly entangling unitary block
                for i in range(n_qubits):
                    qml.Rot(weights[l, i, 0], weights[l, i, 1], weights[l, i, 2], wires=i)

                # Circular CNOT entanglement
                for i in range(n_qubits):
                    qml.CNOT(wires=[i, (i + 1) % n_qubits])

            return [qml.expval(qml.PauliZ(i)) for i in range(n_qubits)]

        self.circuit = _circuit
        # Weight shape for Rot rotations: (n_layers, n_qubits, 3)
        self.weights = nn.Parameter(torch.randn(n_layers, n_qubits, 3) * 0.05)
        self.post_linear = nn.Linear(n_qubits, 2)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (batch_size, n_qubits)
        batch_size = x.shape[0]
        expvals = []
        for i in range(batch_size):
            ev = self.circuit(x[i], self.weights)
            # Stack into tensor
            if isinstance(ev, (list, tuple)):
                ev_t = torch.stack(ev)
            else:
                ev_t = ev
            expvals.append(ev_t)

        expvals_tensor = torch.stack(expvals).to(x.device).float()
        logits = self.post_linear(expvals_tensor)
        return logits

    def fit_dataset(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        epochs: int = 15,
        lr: float = 0.02,
        batch_size: int = 16,
    ) -> dict[str, Any]:
        """Trains the VQC using Adam optimizer with BCE / CrossEntropy loss."""
        optimizer = torch.optim.Adam(self.parameters(), lr=lr, weight_decay=1e-4)
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
        probs = torch.softmax(logits, dim=1).cpu().numpy()
        return probs

    def predict(self, X: np.ndarray) -> np.ndarray:
        probs = self.predict_proba(X)
        return probs.argmax(axis=1)
