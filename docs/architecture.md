# Quantum Machine Learning Architecture & Design

## 1. High-Level Architecture Overview

The platform uses a **Hybrid Classical-Quantum Deep Learning (HQCNN)** paradigm. Classical deep neural networks excel at extracting spatial feature representations from high-resolution images, while Variational Quantum Circuits (VQCs) operate on compact latent spaces to model complex, non-linear quantum correlations.

```
+-----------------------------------------------------------------------------------+
|                              INPUT MEDICAL IMAGE                                  |
|            (28x28 Skin Lesion / 224x224 Chest X-Ray / Camera Capture)             |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                           CLASSICAL CNN FEATURE EXTRACTOR                         |
|                    (EfficientNet-B0 / DenseNet121 Backbone)                       |
|         Extracts 1280-dimensional high-level feature representations              |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        DIMENSIONALITY REDUCTION & SCALING                         |
|                 StandardScaler -> Principal Component Analysis (PCA)               |
|            Skin Cancer: 16 components  |  Pneumonia: 8 components                 |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                           QUANTUM EMBEDDING & PREPARATION                         |
|                       BatchNorm1d -> Angle Scaling [-pi, pi]                      |
|                  Dual-Basis Angle Encoding: RY(theta) + RZ(theta)                 |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                    VARIATIONAL QUANTUM CIRCUIT (VQC) WITH DATA RE-UPLOADING        |
|                                                                                   |
|    +-------------------------------------------------------------------------+    |
|    | Layer 1: Encode(x) -> StronglyEntanglingLayers(theta_1)                 |    |
|    +-------------------------------------------------------------------------+    |
|    | Layer 2: Encode(x) -> StronglyEntanglingLayers(theta_2) [Re-uploading]  |    |
|    +-------------------------------------------------------------------------+    |
|    | Layer 3: Encode(x) -> StronglyEntanglingLayers(theta_3) [Re-uploading]  |    |
|    +-------------------------------------------------------------------------+    |
|    | Layer 4: Encode(x) -> StronglyEntanglingLayers(theta_4) [Re-uploading]  |    |
|    +-------------------------------------------------------------------------+    |
|                                         |                                         |
|    Measurement: Pauli-Z expectation values <Z_i> across all qubits               |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
|                       POST-QUANTUM CLASSIFIER & RESIDUAL                          |
|         LayerNorm -> Dropout -> Linear -> GELU -> Dropout -> Linear              |
|                                         +                                         |
|    Non-linear Residual Shortcut (ReLU -> Linear, matching classical head structure) |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                                  OUTPUT & DECISION                                |
|        Calibrated Probabilities (Temperature Scaling) -> Clinical Report          |
+-----------------------------------------------------------------------------------+
```

---

## 2. Why Hybrid QML for Medical Imaging?

1. **Information Bottleneck & NISQ Constraints:** Modern NISQ quantum simulators and physical QPUs support 8–20 qubits with shallow circuit depths. Passing a $224 \times 224 \times 3$ image directly to a quantum circuit requires $150,528$ inputs, which exceeds current quantum capacity. The classical CNN extracts high-level semantic features, and PCA compresses them to the optimal quantum input dimension.
2. **Data Re-Uploading Principle:** Conventional quantum neural networks encode inputs once at the beginning, restricting the mathematical functions the circuit can represent. Data re-uploading (Pérez-Salinas et al.) interleaves feature rotation gates before each variational block, proving that single-qubit or few-qubit circuits can act as universal function approximators.
3. **Barren Plateau Mitigation:**
   - Small Gaussian initialization ($\mathcal{N}(0, 0.01)$) of quantum weights.
   - Batch normalization and angle scaling preventing saturated rotation angles.
   - Non-linear classical residual shortcut provides an unconstrained gradient highway directly back to the optimizer.

---

## 3. Loss & Optimization Strategy

- **Focal Loss:**
  $$\text{FL}(p_t) = -\alpha_t (1 - p_t)^\gamma \log(p_t)$$
  Down-weights well-classified instances ($\gamma = 2.0$) and scales gradients for difficult, rare classes (e.g. vascular lesions and melanoma in HAM10000).
- **Cosine Annealing with Warm Restarts:**
  Performs periodic learning rate boosts to escape local minima in non-convex quantum parameter landscapes.
- **Gradient Clipping:**
  Limits gradient norms to $\le 1.0$, preventing quantum parameter blow-ups during backpropagation.
