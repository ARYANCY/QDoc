from ml.skin_cancer.quantum.quantum_derma import QuantumHead


class QSkinVortex(QuantumHead):
    def __init__(self, num_classes: int, n_qubits: int = 8, n_layers: int = 4, **kwargs):
        super().__init__(
            num_classes=num_classes,
            n_qubits=n_qubits,
            n_layers=n_layers,
            ansatz="strongly",
            **kwargs,
        )
