from __future__ import annotations

import time
from typing import Any

import numpy as np
import pennylane as qml
from sklearn.calibration import CalibratedClassifierCV
from sklearn.svm import SVC


class QuantumSupportVectorMachine:
    """Quantum Support Vector Machine (QSVM) per SRS Section 4.4:
    - Quantum Fidelity Kernel: K(x_i, x_j) = |<phi(x_i) | phi(x_j)>|^2
    - Entangling ZZ Feature Map: U_Phi(x) = exp(i sum x_j Z_j + i sum (pi - x_j)(pi - x_k) Z_j Z_k)
    - Scikit-learn dual SVM solver using quantum kernel matrix.
    """

    def __init__(self, n_qubits: int = 8, c_param: float = 1.0, feature_map: str = "zz"):
        self.n_qubits = n_qubits
        self.c_param = c_param
        self.feature_map = feature_map
        self.dev = qml.device("default.qubit", wires=n_qubits)
        self.clf = SVC(kernel="precomputed", C=c_param)
        self.X_train: np.ndarray | None = None

        @qml.qnode(self.dev)
        def _kernel_qnode(x1, x2):
            # Encode x1
            for i in range(n_qubits):
                qml.Hadamard(wires=i)
                qml.RZ(2.0 * x1[i], wires=i)

            if feature_map == "zz":
                for i in range(n_qubits - 1):
                    qml.CNOT(wires=[i, i + 1])
                    qml.RZ(2.0 * (np.pi - x1[i]) * (np.pi - x1[i + 1]), wires=i + 1)
                    qml.CNOT(wires=[i, i + 1])

            # Invert encoding for x2 (adjoint)
            if feature_map == "zz":
                for i in reversed(range(n_qubits - 1)):
                    qml.CNOT(wires=[i, i + 1])
                    qml.RZ(-2.0 * (np.pi - x2[i]) * (np.pi - x2[i + 1]), wires=i + 1)
                    qml.CNOT(wires=[i, i + 1])

            for i in range(n_qubits):
                qml.RZ(-2.0 * x2[i], wires=i)
                qml.Hadamard(wires=i)

            return qml.probs(wires=range(n_qubits))

        self.kernel_qnode = _kernel_qnode

    def _compute_kernel_matrix(self, A: np.ndarray, B: np.ndarray) -> np.ndarray:
        n_a, n_b = len(A), len(B)
        K = np.zeros((n_a, n_b), dtype=np.float64)
        for i in range(n_a):
            for j in range(n_b):
                if A is B and j < i:
                    K[i, j] = K[j, i]
                else:
                    # |<0| U_dagger(x2) U(x1) |0>|^2 is prob of all-zero state
                    probs = self.kernel_qnode(A[i], B[j])
                    K[i, j] = float(probs[0])
        return K

    def fit(self, X: np.ndarray, y: np.ndarray) -> dict[str, Any]:
        start = time.perf_counter()
        self.X_train = np.asarray(X, dtype=np.float64)
        K_train = self._compute_kernel_matrix(self.X_train, self.X_train)
        self.clf.fit(K_train, y)
        train_time = time.perf_counter() - start
        return {"train_time_sec": train_time, "kernel_dim": K_train.shape}

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        if self.X_train is None:
            raise RuntimeError("QSVM not fitted")
        X_test = np.asarray(X, dtype=np.float64)
        K_test = self._compute_kernel_matrix(X_test, self.X_train)
        df = self.clf.decision_function(K_test)
        # Platt sigmoid scaling: P(y=1) = 1 / (1 + exp(-df))
        p1 = 1.0 / (1.0 + np.exp(-df))
        p0 = 1.0 - p1
        return np.column_stack([p0, p1])

    def predict(self, X: np.ndarray) -> np.ndarray:
        if self.X_train is None:
            raise RuntimeError("QSVM not fitted")
        X_test = np.asarray(X, dtype=np.float64)
        K_test = self._compute_kernel_matrix(X_test, self.X_train)
        return self.clf.predict(K_test)
