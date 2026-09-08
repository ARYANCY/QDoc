from __future__ import annotations

import logging
import time
from pathlib import Path
from typing import Any

import numpy as np
import pennylane as qml
import torch
import torch.nn as nn

from ml.quantum.feature_maps import angle_feature_map

logger = logging.getLogger("ml.quantum.vqc")


class VariationalQuantumClassifier(nn.Module):
    """Variational Quantum Classifier (VQC) with Barren Plateau Telemetry and Circular CNOT Entanglement."""

    def __init__(
        self,
        n_qubits: int = 8,
        n_layers: int = 2,
        data_reupload: bool = True,
        device_name: str = "default.qubit",
        shots: int | None = None,
    ):
        super().__init__()
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        self.data_reupload = data_reupload
        self.device_name = device_name
        self.shots = shots
        self.entanglement = "circular"

        self.dev = qml.device(device_name, wires=n_qubits, shots=shots)

        # Trainable circuit parameters: (n_layers, n_qubits, 3) for Rot(alpha, beta, gamma)
        self.weights = nn.Parameter(
            torch.randn(n_layers, n_qubits, 3, dtype=torch.float32) * 0.1
        )
        self.bias = nn.Parameter(torch.zeros(2, dtype=torch.float32))

        # Build PennyLane QNode
        @qml.qnode(self.dev, interface="torch", diff_method="backprop")
        def _circuit(inputs, weights):
            for layer in range(self.n_layers):
                if layer == 0 or self.data_reupload:
                    angle_feature_map(inputs, wires=range(self.n_qubits), rotation="Y")

                # Variational Rotations
                for q in range(self.n_qubits):
                    qml.Rot(weights[layer, q, 0], weights[layer, q, 1], weights[layer, q, 2], wires=q)

                # Circular CNOT Entanglement Chain
                for q in range(self.n_qubits):
                    qml.CNOT(wires=[q, (q + 1) % self.n_qubits])

            # Measure Pauli-Z expectation on first two qubits
            return [qml.expval(qml.PauliZ(0)), qml.expval(qml.PauliZ(1))]

        self.qnode = _circuit
        self.gradient_variance_history: list[float] = []

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass over a batch of classical features."""
        if x.ndim == 1:
            x = x.unsqueeze(0)

        outputs = []
        for i in range(x.shape[0]):
            exp_vals = self.qnode(x[i], self.weights)
            # Stack expectation values: shape (2,)
            exp_tensor = torch.stack(exp_vals).float()
            outputs.append(exp_tensor)

        logits = torch.stack(outputs) + self.bias
        return logits

    def compute_gradient_telemetry(self) -> dict[str, float]:
        """Calculates gradient norm and gradient variance across parameters to monitor barren plateaus."""
        if self.weights.grad is None:
            return {"grad_norm": 0.0, "grad_var": 0.0, "barren_plateau_detected": False}

        grad = self.weights.grad.detach().cpu().numpy()
        grad_norm = float(np.linalg.norm(grad))
        grad_var = float(np.var(grad))
        self.gradient_variance_history.append(grad_var)

        # Barren plateau flag: gradient variance collapse below threshold
        is_plateau = grad_var < 1e-6 and len(self.gradient_variance_history) > 5
        return {
            "grad_norm": round(grad_norm, 6),
            "grad_var": round(grad_var, 8),
            "barren_plateau_detected": is_plateau,
        }

    def predict_proba(self, X: np.ndarray | torch.Tensor) -> np.ndarray:
        """Generates calibrated softmax probabilities."""
        self.eval()
        with torch.no_grad():
            if isinstance(X, np.ndarray):
                X_tensor = torch.tensor(X, dtype=torch.float32)
            else:
                X_tensor = X.float()
            logits = self.forward(X_tensor)
            probs = torch.softmax(logits, dim=-1).cpu().numpy()
        return probs

    def predict(self, X: np.ndarray | torch.Tensor) -> np.ndarray:
        probs = self.predict_proba(X)
        return probs.argmax(axis=-1)

    def fit_dataset(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        epochs: int = 10,
        lr: float = 0.02,
        batch_size: int = 16,
    ) -> dict[str, Any]:
        """Trains VQC parameters using Adam optimizer and monitors barren plateau telemetry."""
        self.train()
        optimizer = torch.optim.Adam(self.parameters(), lr=lr, weight_decay=1e-4)
        criterion = nn.CrossEntropyLoss()

        X_t = torch.tensor(X_train, dtype=torch.float32)
        y_t = torch.tensor(y_train, dtype=torch.long)

        n_samples = len(X_train)
        history = []
        start_t = time.perf_counter()

        for epoch in range(epochs):
            permutation = torch.randperm(n_samples)
            epoch_loss = 0.0
            num_batches = 0

            for i in range(0, n_samples, batch_size):
                indices = permutation[i : i + batch_size]
                batch_x, batch_y = X_t[indices], y_t[indices]

                optimizer.zero_grad()
                logits = self.forward(batch_x)
                loss = criterion(logits, batch_y)
                loss.backward()

                telemetry = self.compute_gradient_telemetry()
                optimizer.step()

                epoch_loss += loss.item()
                num_batches += 1

            avg_loss = epoch_loss / max(num_batches, 1)
            history.append({"epoch": epoch + 1, "loss": round(avg_loss, 4), **telemetry})

        elapsed = time.perf_counter() - start_t
        return {
            "epochs": epochs,
            "training_time_sec": round(elapsed, 3),
            "final_loss": history[-1]["loss"] if history else 0.0,
            "history": history,
        }

    def save_checkpoint(self, path: Path | str) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        torch.save(
            {
                "n_qubits": self.n_qubits,
                "n_layers": self.n_layers,
                "data_reupload": self.data_reupload,
                "state_dict": self.state_dict(),
            },
            path,
        )

    def load_checkpoint(self, path: Path | str) -> None:
        ckpt = torch.load(path, map_location="cpu", weights_only=False)
        self.load_state_dict(ckpt.get("state_dict", ckpt.get("model", ckpt)))
