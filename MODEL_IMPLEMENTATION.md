# Technical Architecture & Model Implementation Guide (MODEL_IMPLEMENTATION.md)
**Q-MedSense / QDoc Clinical AI System**  
**Specification Reference:** `MODEL.md` / `docs/model.md`  
**Execution Environment:** Conda `sih2026` (Python 3.10)  

---

## 1. System Architecture & Multimodal Data Flow

The QDoc Medical AI engine implements a modular 7-stage architecture designed for zero data leakage, high clinical safety, and fair quantum benchmarking:

```
[Clinical Input (2D Image / 3D CT-MRI / Tabular / Text)]
                     │
                     ▼
      [1. Schema & Integrity Validation] (ml.preprocessing.validation)
                     │
                     ▼
      [2. 11-Modality Router] (ml.models.router)
                     │
        ┌────────────┴─────────────┐
        ▼                          ▼
 [Tabular / Direct]     [Foundation Encoders]
                        - BiomedCLIP (512-dim, Primary)
                        - MedSigLIP (768-dim, Benchmark)
                        - MedGemma (2048-dim, Multimodal)
                        - MedicalNet (512-dim, 3D ResNet)
                        - VISTA3D (512-dim, 3D Segmentation)
                                   │
                                   ▼
      [3. Train-Only Dimensionality Reduction] (ml.preprocessing.reduction)
         (PCA / Mutual Information -> 4, 6, 8 Qubit Budgets)
                                   │
            ┌──────────────────────┴──────────────────────┐
            ▼                                             ▼
 [4A. Classical ML Suite]                     [4B. PennyLane Quantum Stack]
 - Logistic Regression                         - Angle / ZZ Feature Maps
 - SVM (RBF Kernel)                            - Quantum Kernel + QSVM
 - Random Forest                               - 8-Qubit VQC (Circular CNOT)
 - Gradient Boosting / XGBoost                 - Hybrid QNN (TorchLayer)
 - Multi-Layer Perceptron (MLP)                - Barren Plateau Telemetry
            └──────────────────────┬──────────────────────┘
                                   │
                                   ▼
      [5. Uncertainty, OOD Gating & Calibration]
      - Temperature Scaling & Platt Calibration (ECE minimization)
      - Class-Conditional Mahalanobis Distance OOD Detector
      - Inductive Split-Conformal Prediction Sets (Coverage Guarantee)
                                   │
                                   ▼
      [6. Clinical Explainability Pass]
      - Feature Permutation / KernelSHAP
      - Vision Attention Grad-CAM Maps
      - Quantum Parameter & Qubit Sensitivity Analysis
                                   │
                                   ▼
      [7. Phase 17 Unified Output Contract]
```

---

## 2. Model Registry & Factory (`ml.models.registry`)

All foundation models implement the strict `MedicalEncoder` interface:
- `load()`: Idempotent initialization with automatic device placement (CUDA with CPU fallback).
- `preprocess(input_data)`: Validates image size, channels, and transforms into normalized tensors.
- `encode(input_data)`: Generates L2-normalized dense representations without altering model weights.
- `embedding_dimension()`: Returns fixed output vector dimension (512, 768, 2048).
- `metadata()`: Returns provenance dictionary with version, architecture, and licensing notes.

---

## 3. Foundation Model Licenses & Downloader

| Model | HuggingFace / Source | Dimension | Modalities | License & Usage Terms |
|---|---|---|---|---|
| **BiomedCLIP** | `microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224` | 512 | Chest X-Ray, Derm, Histopathology, Text | Microsoft Open Source / Research |
| **MedSigLIP** | `google/medsiglip-448` | 768 | Vision-Language Benchmark | Google Health AI Developer Foundations |
| **MedGemma** | `google/medgemma-4b-it` | 2048 | Clinical Multimodal Reasoning | Google Health AI Developer Foundations |
| **MedicalNet** | `Warvito/MedicalNet-models` | 512 | 3D Volumetric CT/MRI | Open Academic |
| **VISTA3D** | `Project-MONAI/VISTA` | 512 | 3D Segmentation & Anatomical ROI | Apache 2.0 |

### Model Download & Offline Staging:
```bash
python model_lab/scripts/download_models.py --model all
python model_lab/scripts/verify_models.py
```

---

## 4. Zero Data Leakage & Patient-Level Splitting

1. **Patient-Level Grouping**: Multi-sample datasets are partitioned using `PatientGroupedSplitter` with `GroupShuffleSplit` across `patient_id` so no patient appears across both train and test partitions.
2. **Train-Only Transformation Fitting**: Scalers, PCA models, SMOTE, and calibration parameters are fitted **exclusively** on the training partition and transformed on test data.
3. **Leakage Audit Engine**: The `audit_leakage` function systematically verifies zero index or patient-ID overlap between splits before any model training begins.

---

## 5. Quantum Machine Learning Stack (`ml.quantum`)

* **Quantum Kernel Engine (`QuantumKernelEngine`)**: Computes fidelity-based overlap kernels $\kappa(x_i, x_j) = |\langle\phi(x_i)|\phi(x_j)\rangle|^2$ for QSVM.
* **Variational Quantum Classifier (`VariationalQuantumClassifier`)**: Angle feature map + circular entanglement CNOT gates + parameter rotations + Pauli-Z expectation measurements.
* **Barren Plateau Telemetry**: Actively monitors gradient variances across parameter updates, flagging plateaus if $\text{Var}[\partial L / \partial \theta] < 10^{-6}$.

---

## 6. Uncertainty, OOD Detection & Conformal Prediction

1. **Temperature Calibration**: Optimizes temperature scalar $T$ strictly on validation logits to minimize Negative Log-Likelihood and Expected Calibration Error (ECE).
2. **Mahalanobis Distance OOD Filtering**: Fits class centroids and empirical pooled precision matrices on training embeddings to flag out-of-distribution inputs.
3. **Inductive Split-Conformal Prediction Sets**: Guarantees $(1 - \alpha)$ marginal coverage (e.g., 90%) and triggers clinical abstention on multi-class uncertainty sets.

---

## 7. Phase 17 Output Contract Schema

```json
{
  "prediction": {
    "class": "Pneumonia",
    "probability": 0.942
  },
  "alternatives": [
    {
      "class": "Normal",
      "probability": 0.058
    }
  ],
  "uncertainty": {
    "score": 0.041,
    "status": "LOW"
  },
  "ood": {
    "detected": false,
    "score": 0.023
  },
  "model": {
    "encoder": "BiomedCLIP",
    "encoder_version": "1.0.0",
    "classifier": "BiomedCLIP-PennyLane-VQC-Champion",
    "version": "1.0.0"
  },
  "quantum": {
    "enabled": true,
    "method": "VQC",
    "qubits": 8,
    "depth": 2,
    "shots": 2048,
    "backend": "default.qubit"
  },
  "decision": {
    "status": "MODEL_SUPPORTED",
    "human_review_required": false
  }
}
```

---

## 8. Offline Mode & Safety Policy

- Local weight caching in `model_lab/artifacts/weights/` and `models/` guarantees zero network dependency during clinical inference.
- The system is classified as a Clinical Decision Support System (SaMD) and enforces persistent disclaimers with mandatory human-in-the-loop review on high uncertainty or OOD events.
