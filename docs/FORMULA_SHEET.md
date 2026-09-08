# Q-MedSense: Mathematical Formulations & Formula Reference Sheet (`docs/FORMULA_SHEET.md`)

[![Formulas](https://img.shields.io/badge/Mathematics-Peer%20Reviewed%20%26%20Derived-blue.svg)]()
[![Standards](https://img.shields.io/badge/IEEE-830%20%7C%20ISO%2029148-orange.svg)]()
[![SIH PS ID](https://img.shields.io/badge/SIH%20ID-26139-0052CC.svg)]()

> **Target Standard:** IEEE 830 Mathematical Appendix & ISO 29148 Scientific Architecture  
> **Document Identifier:** QMED-MATH-002  

---

## 📑 Table of Contents

1. [Classical Preprocessing & Feature Engineering](#1-classical-preprocessing--feature-engineering)
2. [Quantum State Encodings & Feature Maps](#2-quantum-state-encodings--feature-maps)
3. [Parameterized Quantum Circuits & Unitary Operations](#3-parameterized-quantum-circuits--unitary-operations)
4. [Analytic Quantum Gradients (Parameter-Shift Rule)](#4-analytic-quantum-gradients-parameter-shift-rule)
5. [Quantum Kernel Methods (QSVM)](#5-quantum-kernel-methods-qsvm)
6. [Clinical Loss Functions & Imbalance Correction](#6-clinical-loss-functions--imbalance-correction)
7. [Explainability & Attribution Mathematics (SHAP / Grad-CAM)](#7-explainability--attribution-mathematics-shap--grad-cam)
8. [Statistical Evaluation Metrics & Calibration](#8-statistical-evaluation-metrics--calibration)
9. [Quantum Advantage Score (QAS) Formulation](#9-quantum-advantage-score-qas-formulation)

---

## 1. Classical Preprocessing & Feature Engineering

### 1.1 Quantum Angle Scaling
Transforms continuous clinical features $x \in [x_{\min}, x_{\max}]$ to rotation angle bounds $[0, \pi]$:

$$x' = \left( \frac{x - x_{\min}}{x_{\max} - x_{\min}} \right) \cdot \pi$$

### 1.2 Standardization (Z-Score)
$$z = \frac{x - \mu}{\sigma}, \quad \mu = \frac{1}{N}\sum_{i=1}^N x_i, \quad \sigma = \sqrt{\frac{1}{N-1}\sum_{i=1}^N (x_i - \mu)^2}$$

### 1.3 Principal Component Analysis (PCA to $N_{\text{qubits}}$)
1. Sample Covariance Matrix:
   $$\Sigma = \frac{1}{M-1} X_c^T X_c \quad \text{where } X_c = X - \bar{X}$$
2. Spectral Eigen-decomposition:
   $$\Sigma \mathbf{v}_k = \lambda_k \mathbf{v}_k \quad (\lambda_1 \ge \lambda_2 \ge \dots \ge \lambda_D)$$
3. Projection onto Top $N_{\text{qubits}}$ Eigenvectors:
   $$X_{\text{reduced}} = X_c \cdot V_{N_{\text{qubits}}}$$
4. Cumulative Explained Variance Ratio:
   $$\text{EVR} = \frac{\sum_{k=1}^{N_{\text{qubits}}} \lambda_k}{\sum_{j=1}^D \lambda_j} \ge 0.85$$

### 1.4 Synthetic Minority Over-sampling Technique (SMOTE)
For a minority class sample $x_i$ and its $k$-nearest neighbor $x_{zi}$:
$$x_{\text{syn}} = x_i + \lambda \cdot (x_{zi} - x_i), \quad \lambda \sim \mathcal{U}(0, 1)$$

---

## 2. Quantum State Encodings & Feature Maps

### 2.1 Hardware-Efficient Angle Feature Map
Single-qubit rotation unitary:
$$R_Y(\theta) = \exp\left( -i \frac{\theta}{2} Y \right) = \begin{pmatrix} \cos(\theta/2) & -\sin(\theta/2) \\ \sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$$

State preparation on $N$ qubits:
$$|\psi(x)\rangle = \bigotimes_{k=1}^N R_Y(x_k) |0\rangle^{\otimes N}$$

### 2.2 Dense Amplitude Encoding
$$|\psi(x)\rangle = \sum_{k=0}^{2^N - 1} \tilde{x}_k |k\rangle \quad \text{where } \tilde{x}_k = \frac{x_k}{\|x\|_2}, \; \sum_{k=0}^{2^N-1} |\tilde{x}_k|^2 = 1$$

### 2.3 Non-Linear ZZ Entanglement Map
$$U_{\Phi}(x) = \exp\left( i \sum_{j=1}^N x_j Z_j + i \sum_{j < k}^N (\pi - x_j)(\pi - x_k) Z_j Z_k \right) H^{\otimes N}$$

---

## 3. Parameterized Quantum Circuits & Unitary Operations

### 3.1 Single-Qubit Parameterized Rotations
$$R_Z(\theta) = \begin{pmatrix} e^{-i\theta/2} & 0 \\ 0 & e^{i\theta/2} \end{pmatrix}, \quad R_X(\theta) = \begin{pmatrix} \cos(\theta/2) & -i\sin(\theta/2) \\ -i\sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$$

### 3.2 Two-Qubit Controlled-NOT (CNOT) Entangler
$$\text{CNOT} = |0\rangle\langle 0| \otimes I + |1\rangle\langle 1| \otimes X = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0 \end{pmatrix}$$

### 3.3 Variational Layer Unitary
$$U_l(\boldsymbol{\theta}_l) = \left( \prod_{j=1}^N \text{CNOT}_{(j, (j+1) \bmod N)} \right) \cdot \left( \bigotimes_{j=1}^N R_Z(\theta_{l,j,3}) R_Y(\theta_{l,j,2}) R_Z(\theta_{l,j,1}) \right)$$

---

## 4. Analytic Quantum Gradients (Parameter-Shift Rule)

For a parameterized circuit expectation value $\langle \hat{O} \rangle(\theta) = \langle 0 | U^\dagger(\theta) \hat{O} U(\theta) | 0 \rangle$:

$$\frac{\partial \langle \hat{O} \rangle}{\partial \theta_k} = \frac{\langle \hat{O} \rangle(\theta_k + s) - \langle \hat{O} \rangle(\theta_k - s)}{2 \sin(s)} \quad \text{for } s = \frac{\pi}{2}:$$

$$\frac{\partial \langle \hat{O} \rangle}{\partial \theta_k} = \frac{1}{2} \left( \langle \hat{O} \rangle_{\theta_k + \frac{\pi}{2}} - \langle \hat{O} \rangle_{\theta_k - \frac{\pi}{2}} \right)$$

---

## 5. Quantum Kernel Methods (QSVM)

### 5.1 Quantum Transition Fidelity Kernel
$$K(x_i, x_j) = |\langle \psi(x_i) | \psi(x_j) \rangle|^2 = \text{Tr}\left( \rho(x_i) \rho(x_j) \right)$$

### 5.2 Dual Optimization
$$\max_{\boldsymbol{\alpha}} \sum_{i=1}^M \alpha_i - \frac{1}{2} \sum_{i=1}^M \sum_{j=1}^M \alpha_i \alpha_j y_i y_j K(x_i, x_j) \quad \text{s.t. } 0 \le \alpha_i \le C, \; \sum_{i=1}^M \alpha_i y_i = 0$$

---

## 6. Clinical Loss Functions & Imbalance Correction

### 6.1 Multi-Class Focal Loss with Label Smoothing
For class probability $p_t$ and ground truth target $y$:

$$\mathcal{L}_{\text{Focal}}(p_t) = -\alpha_t (1 - p_t)^\gamma \log(p_t)$$

where:
- $\gamma \ge 0$ is the tunable focusing parameter ($\gamma = 2.0$ default).
- $\alpha_t = \frac{1}{\text{ClassFrequency}_t}$ is the inverse class weight.
- Label Smoothing: $y_{k,\text{smooth}} = (1 - \epsilon) y_k + \frac{\epsilon}{K}$ with $\epsilon = 0.1$.

---

## 7. Explainability & Attribution Mathematics

### 7.1 Perturbation-Based SHAP Attribution
For input feature vector $x$ and baseline reference $\bar{x}$:
$$\phi_i(x) = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|! (|F| - |S| - 1)!}{|F|!} \left[ f(S \cup \{i\}) - f(S) \right]$$

### 7.2 Grad-CAM Feature Map Importance
For convolutional feature map $A^k$ and class score $y^c$:
$$\alpha_k^c = \frac{1}{Z} \sum_{i} \sum_{j} \frac{\partial y^c}{\partial A_{i,j}^k}, \quad L_{\text{Grad-CAM}}^c = \text{ReLU}\left( \sum_k \alpha_k^c A^k \right)$$

---

## 8. Statistical Evaluation Metrics & Calibration

### 8.1 Matthews Correlation Coefficient (MCC)
$$\text{MCC} = \frac{TP \cdot TN - FP \cdot FN}{\sqrt{(TP + FP)(TP + FN)(TN + FP)(TN + FN)}}$$

### 8.2 Expected Calibration Error (ECE)
Grouping $N$ predictions into $M$ confidence bins $B_m$:
$$\text{ECE} = \sum_{m=1}^M \frac{|B_m|}{N} \left| \text{acc}(B_m) - \text{conf}(B_m) \right|$$

### 8.3 Macro F1-Score
$$\text{Macro F1} = \frac{1}{K} \sum_{k=1}^K \frac{2 \cdot \text{Precision}_k \cdot \text{Recall}_k}{\text{Precision}_k + \text{Recall}_k}$$

---

## 9. Quantum Advantage Score (QAS) Formulation

$$\text{QAS} = \left( \frac{\text{Acc}_{\text{quantum}} - \text{Acc}_{\text{classical}}}{\text{Acc}_{\text{classical}}} \right) \cdot \left( \frac{T_{\text{classical}}}{T_{\text{quantum}}} \right)$$

Where $T$ represents inference latency per clinical sample in milliseconds.

---

**© 2026 Q-MedSense Mathematical Sciences Group. SIH Problem Statement ID 26139.**
