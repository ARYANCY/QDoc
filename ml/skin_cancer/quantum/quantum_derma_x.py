from ml.skin_cancer.quantum.quantum_derma import QuantumHead


class QuantumDermaX(QuantumHead):
    def __init__(self, num_classes: int, n_qubits: int = 10, n_layers: int = 3, **kwargs):
        super().__init__(num_classes=num_classes, n_qubits=n_qubits, n_layers=n_layers, **kwargs)
