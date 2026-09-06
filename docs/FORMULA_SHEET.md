# Q-MedSense Mathematical Formulation & Formula Sheet

**Document Identifier:** QMED-MATH-001  
**Target Specification:** IEEE 830 Section 4 & Appendix A  

---

## 1. Classical Preprocessing & Normalization

### 1.1 Quantum Angle Min-Max Normalization
Scales continuous clinical features into rotation gate bounds $[0, \pi]$:
$$x' = \left( \frac{x - x_{\min}}{x_{\max} - x_{\min}} \right) \cdot \pi$$

### 1.2 Z-Score Standardization
$$z = \frac{x - \mu}{\sigma}$$

### 1.3 Principal Component Analysis (Dimensionality Reduction to $n_{\text{qubits}}$)
Covariance matrix:
$$\Sigma = \frac{1}{n-1} X^T X$$
Eigen-decomposition:
$$\Sigma v_i = \lambda_i v_i$$
Projection into qubit Hilbert subspace:
$$X_{\text{reduced}} = X \cdot V_k \quad (k = n_{\text{qubits}})$$

### 1.4 SMOTE (Synthetic Minority Over-sampling Technique)
$$x_{\text{new}} = x_i + \lambda \cdot (x_{zi} - x_i), \quad \lambda \sim \mathcal{U}(0, 1)$$

---

## 2. Quantum State Feature Encoding

### 2.1 Hardware-Efficient Angle Encoding
$$|\phi(x)\rangle = \bigotimes_{i=1}^N R_Y(x_i)|0\rangle_i, \quad R_Y(\theta) = \begin{pmatrix} \cos(\theta/2) & -\sin(\theta/2) \\ \sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$$

### 2.2 ZZ Entangling Feature Map
$$U_\Phi(x) = \exp\left( i \sum_j x_j Z_j + i \sum_{j < k} (\pi - x_j)(\pi - x_k) Z_j Z_k \right)$$
$$|\phi(x)\rangle = U_\Phi(x) H^{\otimes n} |0\rangle^{\otimes n}$$

---

## 3. Variational Quantum Classifier (VQC) & Optimization

### 3.1 Parameterized Ansatz
$$U(\theta) = \prod_{l=1}^L \left[ \bigotimes_i R_Y(\theta_{l,i}) R_Z(\theta'_{l,i}) \right] \cdot \left[ \bigotimes_{\langle i, j \rangle} \text{CNOT}_{i, j} \right]$$

### 3.2 Readout Expectation & Prediction
$$f(x, \theta) = \langle \psi(x, \theta) | Z_0 | \psi(x, \theta) \rangle, \quad \hat{y} = \sigma(f(x, \theta))$$

### 3.3 Analytic Gradient via Parameter-Shift Rule
$$\frac{\partial \mathcal{L}}{\partial \theta_k} = \frac{\mathcal{L}(\theta_k + \pi/2) - \mathcal{L}(\theta_k - \pi/2)}{2}$$

---

## 4. Quantum Support Vector Machine (QSVM)

### 4.1 Quantum Fidelity Kernel
$$K(x_i, x_j) = |\langle \phi(x_i) | \phi(x_j) \rangle|^2$$

### 4.2 Dual SVM Optimization
$$\max_\alpha \sum_i \alpha_i - \frac{1}{2} \sum_{i, j} \alpha_i \alpha_j y_i y_j K(x_i, x_j) \quad \text{s.t.} \quad 0 \le \alpha_i \le C, \; \sum_i \alpha_i y_i = 0$$

---

## 5. Benchmarking & Quantum Advantage Score (QAS)

$$\text{QAS} = \left( \frac{\text{Acc}_{\text{quantum}} - \text{Acc}_{\text{classical}}}{\text{Acc}_{\text{classical}}} \right) \cdot \left( \frac{T_{\text{classical}}}{T_{\text{quantum}}} \right)$$

$$\text{MCC} = \frac{TP \cdot TN - FP \cdot FN}{\sqrt{(TP+FP)(TP+FN)(TN+FP)(TN+FN)}}$$
