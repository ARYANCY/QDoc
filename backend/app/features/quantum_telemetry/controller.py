from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/quantum-telemetry", tags=["Quantum Circuit Telemetry"])


@router.get("/circuit/{model_name}")
async def get_circuit_telemetry(model_name: str = "VQC-8Q"):
    """Returns quantum circuit gate counts, depth, and entanglement connectivity per SRS Section 4.3 & 6."""
    n_qubits = 8 if "8" in model_name else (10 if "10" in model_name else 12)
    n_layers = 3

    single_qubit_gates = n_qubits * (2 + 3) * n_layers  # RY + RZ + Rot
    two_qubit_cnot_gates = n_qubits * n_layers          # Circular CNOTs
    total_trainable_params = n_layers * n_qubits * 3

    return {
        "model_name": model_name,
        "n_qubits": n_qubits,
        "n_layers": n_layers,
        "circuit_depth": n_layers * 4,
        "total_gates": single_qubit_gates + two_qubit_cnot_gates,
        "gate_breakdown": {
            "single_qubit_rotations": single_qubit_gates,
            "two_qubit_cnot_entanglers": two_qubit_cnot_gates,
            "pauli_z_measurements": n_qubits,
        },
        "trainable_parameters_count": total_trainable_params,
        "simulation_backend": "PennyLane lightning.qubit + Qiskit Aer Statevector",
        "entanglement_topology": "Circular Nearest-Neighbor CNOT Ladder",
        "hilbert_space_dimension": 2 ** n_qubits,
        "qubit_registers": [
            {"wire": i, "state": f"|q_{i}⟩", "initial": "|0⟩", "observable": f"⟨Z_{i}⟩"}
            for i in range(n_qubits)
        ],
    }
