# Q-MedSense: Quantum Machine Learning Algorithms & Mathematical Formulations (`docs/QUANTUM_ALGORITHMS.md`)

This document provides mathematical formulations, ansatz architectures, encoding schemes, and training mechanics implemented across the **Q-MedSense** Quantum Machine Learning engine.

---

## 1. Variational Quantum Classifier (VQC)

### State Angle Encoding
For an $N$-dimensional normalized biomarker vector $x \in [-\pi, \pi]^N$, the input quantum state $|\psi(x)\rangle$ is prepared on an $n$-qubit register using single-qubit rotation gates:

$$|\psi_0(x)\rangle = \bigotimes_{i=1}^n R_y(x_i) |0\rangle^{\otimes n}$$

### Strongly Entangling Ansatz
The parameterised variational ansatz $U(\theta)$ applies $L$ entangling layers. In layer $l$, each qubit undergoes general rotations followed by circular CNOT entanglement:

$$U_l(\theta) = \left( \prod_{i=1}^n \text{CNOT}_{(i, (i+1) \bmod n)} \right) \cdot \left( \bigotimes_{i=1}^n R_z(\theta_{l,i,3}) R_y(\theta_{l,i,2}) R_z(\theta_{l,i,1}) \right)$$

The final state after $L$ layers is:
$$|\psi(x, \theta)\rangle = \prod_{l=1}^L U_l(\theta) |\psi_0(x)\rangle$$

### Measurement & Expectation Value
The classification decision is derived from the expectation value of the Pauli-Z operator on the readout qubit:

$$\langle Z_0 \rangle = \langle \psi(x, \theta) | Z_0 | \psi(x, \theta) \rangle \in [-1, 1]$$

The class probability is obtained via the Sigmoid/Softmax activation:
$$P(y = 1 | x) = \frac{1 + \langle Z_0 \rangle}{2}$$

---

## 2. Quantum Support Vector Machine (QSVM)

### Quantum Fidelity Kernel
The QSVM projects clinical feature vectors into a high-dimensional Hilbert space and computes the pairwise kernel matrix elements as the transition fidelity between quantum states:

$$K(x_i, x_j) = |\langle \psi(x_i) | \psi(x_j) \rangle|^2 = \text{Tr}\left( \rho(x_i) \rho(x_j) \right)$$

### Optimization Dual
The dual optimization problem solves for Lagrange multipliers $\alpha$:

$$\max_\alpha \sum_{i=1}^M \alpha_i - \frac{1}{2} \sum_{i,j=1}^M \alpha_i \alpha_j y_i y_j K(x_i, x_j)$$
subject to $0 \le \alpha_i \le C$ and $\sum_{i=1}^M \alpha_i y_i = 0$.

---

## 3. Quantum Neural Network (QNN) Multi-Class

For multi-class clinical targets (e.g. 7-class dermatoscopy or 3-class staging), expectation values across all $n$ qubits are mapped through a trainable linear head:

$$\hat{y} = \text{Softmax}\left( W \cdot \left[ \langle Z_1 \rangle, \langle Z_2 \rangle, \dots, \langle Z_n \rangle \right]^T + b \right)$$

---

## 4. Quantum Advantage Score (QAS)

Per SRS Section 4.6, the standardized Quantum Advantage Score evaluates statistical superiority over classical baselines penalized by inference latency:

$$\text{QAS} = \left( \frac{\text{Acc}_q - \text{Acc}_c}{\text{Acc}_c} \right) \cdot \left( \frac{T_c}{T_q} \right)$$

Where:
- $\text{Acc}_q$: Quantum model test accuracy
- $\text{Acc}_c$: Top classical baseline test accuracy (Random Forest)
- $T_q$: Quantum simulation latency per sample
- $T_c$: Classical baseline inference latency per sample
