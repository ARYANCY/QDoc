# Software Requirements Specification (SRS)
## Hybrid Quantum Machine Learning Platform for Early Disease Detection
**Q-MedSense — Quantum-Enhanced Clinical Decision Support Platform**

| Field | Value |
|---|---|
| SIH Problem Statement ID | 26139 |
| Organization | Egreen Quanta |
| Category | Software |
| Theme | MedTech / BioTech / HealthTech |
| Document Version | 1.0 |
| Standard Followed | IEEE 830-1998 / ISO/IEC/IEEE 29148-2018 |
| Prepared For | Smart India Hackathon 2026 |

---

## Table of Contents
1. Introduction
2. Overall Description
3. System Architecture
4. Algorithms & Mathematical Formulation
5. Data Pipeline & Datasets
6. Explainability Module
7. 2D Digital Twin Module
8. UI/UX Design System
9. Security, Privacy & Regulatory Compliance
10. Functional Requirements
11. Non-Functional Requirements
12. Technology Stack
13. Deliverables Table
14. Testing Strategy (Bug/Error Prevention)
15. Rules & Regulations Checklist
16. SIH Scoring Rubric — Steps to 10/10
17. Unique Differentiators
18. Implementation Roadmap
19. Appendices (Formula Sheet, Glossary, References)

---

## 1. Introduction

### 1.1 Purpose
This SRS defines the complete functional, algorithmic, architectural, security, and design requirements for **Q-MedSense**, a hybrid quantum-classical machine learning software platform for early detection of cancer, cardiovascular disease, and neurological disorders from high-dimensional biomedical data (genomics, imaging-derived features, EHR/tabular clinical data).

### 1.2 Scope
Q-MedSense ingests biomedical data → applies classical preprocessing/feature engineering → encodes reduced features into quantum states → trains hybrid quantum-classical classifiers (VQC / QNN / QSVM) on simulators (Qiskit Aer / PennyLane) and optionally near-term hardware (IBM Quantum, IonQ via cloud) → produces predictions with confidence, explainability, and a 2D digital twin visualization of the patient's physiological/risk state → benchmarks against classical baselines (Logistic Regression, Random Forest, XGBoost, classical SVM, MLP).

### 1.3 Intended Audience
SIH evaluators, clinicians, hospital IT administrators, data scientists, quantum computing engineers, and end-patients (via a simplified patient portal).

### 1.4 Definitions & Acronyms
- **QML** – Quantum Machine Learning
- **VQC** – Variational Quantum Classifier
- **QNN** – Quantum Neural Network
- **QSVM** – Quantum Support Vector Machine
- **NISQ** – Noisy Intermediate-Scale Quantum (current-era hardware)
- **PQC** – Parameterized Quantum Circuit
- **EHR** – Electronic Health Record
- **RBAC** – Role-Based Access Control
- **DPDP Act** – Digital Personal Data Protection Act, 2023 (India)

---

## 2. Overall Description

### 2.1 Product Perspective
Standalone, cloud-deployable web platform with three portals: **Clinician Dashboard**, **Patient Portal**, and **Admin/Compliance Console**. A backend inference engine runs the hybrid quantum-classical pipeline; a lightweight quantum-circuit simulator (or hardware queue submission) executes the quantum layer.

### 2.2 User Classes
| Role | Access Level | Key Actions |
|---|---|---|
| Patient | Own record only | View reports, digital twin, consent management |
| Clinician/Doctor | Assigned patients | Upload data, run predictions, view explainability, annotate |
| Lab Technician | Data entry only | Upload lab/genomic/imaging data |
| Hospital Admin | Org-wide, no PHI content | Manage users, audit logs, license |
| Data Scientist/Researcher | De-identified/aggregate | Model retraining, benchmarking, dataset curation |
| System/Compliance Auditor | Read-only logs | Audit trails, breach reports |

### 2.3 Operating Environment
Web application (responsive, PWA-capable), containerized backend (Docker/Kubernetes), cloud-agnostic (AWS/Azure/GCP or on-prem for hospitals with data-residency constraints), quantum execution via Qiskit Aer/IBM Quantum Runtime or PennyLane/Lightning simulators.

### 2.4 Assumptions & Constraints
- NISQ hardware has limited qubits (~5–25 usable qubits reliably); hence feature dimensionality must be reduced classically before quantum encoding.
- Quantum layer operates on ≤ 12–16 features per patient record after dimensionality reduction (PCA/Autoencoder) to remain simulator/hardware feasible.
- All PHI (Protected Health Information) must be encrypted at rest and in transit; system must be deployable in DPDP Act / HIPAA-aligned configurations.

---

## 3. System Architecture

### 3.1 High-Level Architecture (Layered)

```
┌──────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                           │
│  Clinician Dashboard | Patient Portal | Admin Console | 2D Twin  │
└──────────────────────────────────────────────────────────────────┘
                              │  HTTPS/REST + WebSocket (live twin)
┌──────────────────────────────────────────────────────────────────┐
│                     API GATEWAY / BFF LAYER                      │
│  AuthN/AuthZ (OAuth2+JWT+RBAC) | Rate limiting | Audit logging    │
└──────────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────────┐
│                     APPLICATION SERVICE LAYER                    │
│  Ingestion Svc | Preprocessing Svc | Explainability Svc |        │
│  Model Registry | Inference Orchestrator | Report Generator      │
└──────────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────────┐
│               HYBRID QUANTUM-CLASSICAL ML ENGINE                 │
│  Classical Preprocessor → Feature Encoder → PQC (Quantum Layer)  │
│  → Classical Optimizer (COBYLA/Adam) → Classical Post-processor  │
└──────────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────────┐
│                     EXECUTION BACKENDS                           │
│  Qiskit Aer Simulator | PennyLane Lightning | IBM Quantum Cloud  │
│  (optional) | Classical GPU cluster (fallback/baseline models)   │
└──────────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────────┐
│                     DATA & STORAGE LAYER                         │
│  Encrypted PHI DB (PostgreSQL+pgcrypto) | Object Store (imaging) │
│  | Feature Store | Audit Log Store (immutable/WORM) | Vault (KMS)│
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Component Responsibilities
1. **Ingestion Service** – accepts CSV/EHR (FHIR/HL7), genomic (VCF), imaging-derived tabular features; validates schema; de-identifies on entry.
2. **Preprocessing Service** – imputation, normalization, outlier handling, class-imbalance correction (SMOTE), dimensionality reduction.
3. **Feature Encoder** – maps classical features to quantum states (angle/amplitude encoding).
4. **Quantum Layer (PQC)** – variational circuit with trainable parameters θ.
5. **Classical Optimizer** – updates θ using gradient-based (parameter-shift rule) or gradient-free (COBYLA, SPSA) methods.
6. **Inference Orchestrator** – routes requests to simulator/hardware, handles retries/timeouts, caches results.
7. **Explainability Service** – SHAP for classical part, quantum feature-importance via perturbation/Shapley on encoded features.
8. **Digital Twin Renderer** – generates the patient's real-time 2D physiological/risk avatar.
9. **Report Generator** – PDF/HTML clinical report with prediction, confidence, explanation, recommended next steps.
10. **Audit & Compliance Engine** – logs every data access/prediction event immutably.

### 3.3 Hybrid Pipeline Flow (Sequence)
```
Raw Data → Validation → De-identification → Missing-value Imputation
   → Normalization (Min-Max/Standard) → Feature Selection (MI/ANOVA/PCA)
   → Dimensionality Reduction to n_qubits features
   → Quantum Feature Map (encoding) → Variational Circuit (ansatz)
   → Measurement (expectation values) → Classical Readout Layer (dense/softmax)
   → Loss Computation → Classical Optimizer updates θ (training loop)
   → [Inference] Prediction + Confidence → Explainability → Digital Twin → Report
```

---

## 4. Algorithms & Mathematical Formulation

### 4.1 Classical Preprocessing Formulas

**Min-Max Normalization** (scales features into quantum-encodable range, typically [0, π] for angle encoding):
```
x' = ( (x − x_min) / (x_max − x_min) ) × π
```

**Z-score Standardization:**
```
z = (x − μ) / σ
```

**Principal Component Analysis (dimensionality reduction to n_qubits):**
```
Covariance matrix:  Σ = (1/(n−1)) XᵀX
Eigen-decomposition: Σ v_i = λ_i v_i
Projected feature:  X_reduced = X · V_k   (top-k eigenvectors, k = n_qubits)
```

**Mutual Information (feature selection score):**
```
I(X;Y) = Σ_x Σ_y p(x,y) log( p(x,y) / (p(x) p(y)) )
```

**SMOTE (class imbalance — synthetic minority oversampling):**
```
x_new = x_i + λ × (x_zi − x_i),   λ ∈ [0,1], x_zi = k-nearest minority neighbor
```

### 4.2 Quantum Feature Encoding

**Angle Encoding** (most hardware-efficient for NISQ; maps each classical feature xᵢ to a qubit rotation):
```
|φ(x)⟩ = ⊗ᵢ RY(xᵢ) |0⟩ᵢ      where RY(θ) = [[cos(θ/2), −sin(θ/2)], [sin(θ/2), cos(θ/2)]]
```

**Amplitude Encoding** (encodes 2ⁿ classical values into n qubits — higher information density, harder to implement on NISQ):
```
|φ(x)⟩ = (1/‖x‖) Σᵢ xᵢ |i⟩ ,   requires ‖x‖ normalization
```

**ZZ Feature Map (entangling encoding, captures feature correlations — used in QSVM kernels):**
```
U_Φ(x) = exp( i Σⱼ xⱼ Zⱼ + i Σⱼ<k (π − xⱼ)(π − xₖ) ZⱼZₖ )
|φ(x)⟩ = U_Φ(x) H^⊗n |0⟩^⊗n
```

### 4.3 Variational Quantum Classifier (VQC)

**Ansatz (Hardware-Efficient Layer, repeated L times):**
```
U(θ) = ∏_{l=1}^{L} [ ⊗ᵢ RY(θ_{l,i}) RZ(θ'_{l,i}) ] × [ ⊗_{⟨i,j⟩} CNOT_{i,j} ]
```

**Full circuit:**
```
|ψ(x,θ)⟩ = U(θ) |φ(x)⟩
```

**Measurement / Prediction (expectation value of Pauli-Z on readout qubit):**
```
f(x,θ) = ⟨ψ(x,θ)| Z_0 |ψ(x,θ)⟩ ,   ŷ = sigmoid( f(x,θ) )   for binary classification
```

**Loss Function (Binary Cross-Entropy):**
```
L(θ) = −(1/N) Σᵢ [ yᵢ log(ŷᵢ) + (1−yᵢ) log(1−ŷᵢ) ] + λ‖θ‖²   (L2 regularization)
```

**Parameter-Shift Rule (quantum gradient computation — exact analytic gradient):**
```
∂L/∂θₖ = [ L(θₖ + π/2) − L(θₖ − π/2) ] / 2
```

**Optimizer Update (Adam):**
```
mₜ = β₁mₜ₋₁ + (1−β₁)gₜ
vₜ = β₂vₜ₋₁ + (1−β₂)gₜ²
θₜ = θₜ₋₁ − η · m̂ₜ / (√v̂ₜ + ε)
```

### 4.4 Quantum Support Vector Machine (QSVM)

**Quantum Kernel (fidelity-based, computed on quantum hardware/simulator):**
```
K(xᵢ, xⱼ) = |⟨φ(xᵢ)|φ(xⱼ)⟩|²
```

**Classical SVM dual optimization using the quantum kernel matrix:**
```
maximize  Σᵢ αᵢ − (1/2) ΣᵢΣⱼ αᵢαⱼ yᵢyⱼ K(xᵢ,xⱼ)
subject to  0 ≤ αᵢ ≤ C,   Σᵢ αᵢyᵢ = 0
Decision function: f(x) = sign( Σᵢ αᵢ yᵢ K(xᵢ,x) + b )
```

### 4.5 Quantum Neural Network (QNN) — Multi-class extension
```
Output layer: ŷ_c = softmax( Σ_q w_{c,q} ⟨Z_q⟩ + b_c )   for classes c = 1..C
Categorical Cross-Entropy Loss: L = −Σᵢ Σ_c y_{i,c} log(ŷ_{i,c})
```

### 4.6 Evaluation Metrics (Hybrid vs Classical Benchmarking)

```
Accuracy    = (TP + TN) / (TP + TN + FP + FN)
Sensitivity (Recall) = TP / (TP + FN)
Specificity = TN / (TN + FP)
Precision   = TP / (TP + FP)
F1-Score    = 2 × (Precision × Sensitivity) / (Precision + Sensitivity)
AUC-ROC     = ∫ TPR d(FPR)   over all classification thresholds
Matthews Correlation Coefficient (MCC):
  MCC = (TP·TN − FP·FN) / √((TP+FP)(TP+FN)(TN+FP)(TN+FN))
```

**Quantum Advantage Score (custom benchmarking metric proposed for this platform):**
```
QAS = ( (Acc_quantum − Acc_classical) / Acc_classical ) × ( T_classical / T_quantum )
```
(rewards accuracy gain per unit of relative compute time; used to fairly justify hybrid approach even under simulator latency overhead)

### 4.7 Explainability Formulas

**SHAP value (Shapley value) for feature i on classical/pre-quantum features:**
```
φᵢ = Σ_{S⊆F\{i}} [ |S|!(|F|−|S|−1)! / |F|! ] × [ v(S∪{i}) − v(S) ]
```

**Quantum feature importance (perturbation-based, since gradients through hardware are costly):**
```
Importance(i) = | f(x,θ) − f(x_{i→0},θ) |    (zero-out feature i, measure prediction shift)
```

### 4.8 Digital Twin Risk-Aggregation Formula
```
Composite Risk Score (CRS) = Σ_d w_d × ŷ_d      for each disease-module d (cancer, cardio, neuro)
   where Σ w_d = 1, weights calibrated via clinical prior / Youden's J statistic per module
Youden's J = Sensitivity + Specificity − 1   (used to pick optimal decision threshold per module)
```

---

## 5. Data Pipeline & Datasets

### 5.1 Recommended Benchmark Datasets (Real, Publicly Available)
| Disease Domain | Dataset | Source | Notes |
|---|---|---|---|
| Breast Cancer | Wisconsin Diagnostic Breast Cancer (WDBC) | UCI ML Repository | 30 features, classic QML benchmark |
| Cardiovascular | Cleveland Heart Disease | UCI ML Repository | 14 features, used in most QML cardio papers |
| Cardiovascular | Framingham Heart Study | Kaggle | Larger cohort, longitudinal |
| Neurological | Parkinson's Disease Telemonitoring | UCI ML Repository | Voice biomarkers |
| Neurological | ADNI (Alzheimer's) | ADNI (application-based access) | Imaging + biomarkers, needs DUA |
| Genomics | TCGA (The Cancer Genome Atlas) | NIH GDC Portal | High-dimensional, needs PCA/autoencoder |
| EHR (general) | MIMIC-III / MIMIC-IV | PhysioNet (credentialed access) | Realistic EHR structure, needs de-identification handling |
| Diabetes | PIMA Indian Diabetes Dataset | UCI/Kaggle | Lightweight, good pilot dataset |

### 5.2 Data Ingestion Formats Supported
CSV/TSV, HL7 FHIR JSON, DICOM (feature-extracted, not raw pixel by default), VCF (genomic variants).

### 5.3 Pipeline Stages
1. Schema validation → 2. De-identification (HIPAA Safe Harbor 18 identifiers stripped) → 3. Missing value imputation (KNN-imputer/MICE) → 4. Outlier detection (IQR/Isolation Forest) → 5. Normalization → 6. Feature selection (Mutual Information + Recursive Feature Elimination) → 7. Dimensionality reduction (PCA/Autoencoder to match qubit budget) → 8. Train/Validation/Test split (stratified, 70/15/15) → 9. Quantum encoding → 10. Model training/inference.

---

## 6. Explainability Module

- **Classical Layer:** SHAP (TreeSHAP for baselines, KernelSHAP for hybrid model surrogate), LIME for local instance explanation.
- **Quantum Layer:** Feature perturbation importance (Section 4.7), circuit-level visualization (which qubits/gates most influence output), entanglement-entropy diagnostics to show how much quantum correlation the model actually uses (important to demonstrate genuine "quantum advantage" rather than a classical-equivalent circuit).
- **Clinician-Facing Output:** Natural-language explanation card — "Prediction driven primarily by Feature A (38%) and Feature B (24%); model confidence 91%; comparable classical model confidence 84%."
- **Global Explainability Dashboard:** Feature importance ranking across the full validation cohort, calibration curves, and confusion matrices per disease module.

---

## 7. 2D Digital Twin Module

### 7.1 Concept
A **2D digital twin** is a dynamically-updating, stylized anatomical/physiological silhouette of the patient that visually encodes model outputs and biomarkers in real time — not a literal 3D avatar, but an information-dense 2D SVG/Canvas rendering, favoring clarity and fast load over heavy 3D rendering (appropriate for hospital-grade low-latency displays and mobile).

### 7.2 Visual Encoding Rules
| Signal | Visual Representation |
|---|---|
| Organ/system risk level | Color-coded overlay region (green→amber→red gradient, colorblind-safe) using an accessible sequential palette (e.g., Viridis-inspired but warmed for clinical familiarity) |
| Composite Risk Score (CRS) | Radial gauge at top of twin, 0–100 |
| Trend over time | Sparkline beneath each organ region showing last 5 visits |
| Confidence of prediction | Overlay opacity — low confidence = more translucent, prompting clinician review |
| Explainability hotspot | Pulsing marker on the region tied to top contributing biomarker |

### 7.3 Technical Implementation
- Rendered as layered **SVG** (scalable, accessible, screen-reader labelable via `<title>`/`<desc>` tags) with a **Canvas/WebGL fallback** for animated pulse effects.
- State-driven (React component tree) — twin re-renders reactively when a new lab result or prediction event streams in via WebSocket.
- Twin states are versioned and stored so a clinician can "scrub" a timeline slider to see the twin as it looked at any past visit (temporal digital twin).
- Twin is disease-module-aware: toggle between Cardio View, Onco View, Neuro View — each highlighting the relevant anatomical regions and biomarkers.

### 7.4 Why 2D (not 3D) — Design Justification
2D vector rendering (a) loads in <100ms even on low-bandwidth hospital networks, (b) is fully accessible (screen readers, high-contrast mode), (c) avoids the "uncanny valley" and unnecessary GPU load of 3D avatars for a clinical decision-support context, and (d) is easier to certify/validate visually against clinical ground truth than a 3D deformable mesh.

---

## 8. UI/UX Design System

### 8.1 Design Philosophy
Clinical-grade clarity, calm and trustworthy, **light theme by default** (reduces eye strain in bright hospital environments, aligns with clinical software conventions), generous white space, data-first hierarchy, WCAG 2.1 AA minimum.

### 8.2 Color Palette (Light, Unique, Accessible)
| Token | Hex | Usage |
|---|---|---|
| `--bg-canvas` | `#F7F9FC` | App background |
| `--bg-surface` | `#FFFFFF` | Cards, panels |
| `--bg-surface-alt` | `#EFF3F8` | Secondary panels, hover states |
| `--primary` | `#3457D5` (Quantum Indigo) | Primary actions, active nav |
| `--primary-soft` | `#E4E9FB` | Primary tints, selected chips |
| `--accent-teal` | `#0FB5AE` (Bio Teal) | Secondary accent, positive trend |
| `--accent-violet` | `#7B61FF` (Superposition Violet) | Quantum-layer visual identity, highlights |
| `--risk-low` | `#1FAE6B` | Digital twin — low risk |
| `--risk-mid` | `#F5A623` | Digital twin — moderate risk |
| `--risk-high` | `#E14B4B` | Digital twin — high risk |
| `--text-primary` | `#1B2430` | Headings, primary text |
| `--text-secondary` | `#5B6572` | Body/secondary text |
| `--border-subtle` | `#E1E6ED` | Dividers, card borders |

Rationale: cool indigo/violet evokes "quantum," while teal/green/amber/red risk colors remain within standard clinical-safety color conventions so clinicians are never confused by a novel palette during triage.

### 8.3 Typography
| Role | Font | Weight | Size |
|---|---|---|---|
| Display / Hero | **Fraunces** (or "Newsreader" fallback) — a humanist serif for warmth/trust on landing & report headers | 600 | 32–48px |
| UI Headings | **Inter** | 600 | 20–28px |
| Body Text | **Inter** | 400 | 14–16px |
| Data/Numeric (metrics, risk scores) | **IBM Plex Mono** | 500 | 14–24px (tabular-nums) |
| Micro-labels | **Inter** | 500 (uppercase, letter-spacing 0.04em) | 11–12px |

Rationale: a serif display face paired with a clean grotesque (Inter) signals "clinical + human," while a monospace numeric face for scores/vitals ensures digit alignment in tables — a small but important clinical-software detail (numbers must not visually jitter when values update).

### 8.4 Layout & Grid
- 12-column responsive grid, 24px gutter, 1280px max content width on desktop, single-column stack <768px.
- **Card-based composition**: every clinical unit (a lab result, a prediction, an explanation) is a bordered, softly-shadowed card (`border-radius: 12px`, `box-shadow: 0 1px 3px rgba(16,24,40,0.06)`), never floating raw text — supports the "profile box" pattern requested.
- **Patient Profile Box** (persistent left rail on clinician dashboard): avatar-less identicon (privacy-conscious, no real photo required), name, MRN (masked by default, click-to-reveal with audit log entry), age/sex, active conditions as chips, consent status badge, last-updated timestamp.
- **Sticky top bar**: global search, role switcher (for multi-hospital users), notification bell, session timeout countdown (security visibility).

### 8.5 Core Screens
1. **Login / MFA screen** — light, minimal, quantum-motif line art background (abstract circuit/Bloch-sphere line art, decorative only).
2. **Clinician Dashboard** — patient list, risk-sorted, search/filter, quick-add patient.
3. **Patient Profile Box + 2D Digital Twin (split view)** — twin on right 40%, tabs (Overview / Labs / Predictions / Explainability / History) on left 60%.
4. **Prediction Run Screen** — upload/select data → pipeline progress stepper (Ingest → Preprocess → Quantum Encode → Train/Infer → Explain) → results card.
5. **Explainability Screen** — SHAP bar chart, quantum feature-importance radial chart, natural-language summary.
6. **Benchmark/Compare Screen** — hybrid vs classical model metrics side-by-side table + ROC curve overlay chart.
7. **Admin Console** — user management, audit log viewer, model version registry, consent/compliance dashboard.
8. **Patient Portal (simplified)** — plain-language "Your Health Snapshot," digital twin (simplified, non-clinical labels), appointment/consent management.

### 8.6 Interaction & Motion
- Micro-animations limited to 150–250ms ease-out (no gratuitous motion in a clinical tool).
- Digital twin pulse animation for anomalies only — motion is reserved as a genuine attention signal, not decoration.
- Skeleton loaders (not spinners) for all data-fetching states to reduce perceived latency.

### 8.7 Accessibility
WCAG 2.1 AA contrast ratios (≥4.5:1 body text), full keyboard navigation, ARIA labeling on the SVG digital twin, dyslexia-friendly font toggle (switches body font to Atkinson Hyperlegible), reduced-motion mode.

---

## 9. Security, Privacy & Regulatory Compliance

### 9.1 Data Protection Principles
- **Encryption at rest:** AES-256 for database and object storage; column-level encryption (pgcrypto) for direct identifiers.
- **Encryption in transit:** TLS 1.3 for all client-server and inter-service communication.
- **De-identification:** HIPAA Safe Harbor method — strip all 18 identifier categories before any data reaches the ML pipeline; a separate, access-controlled re-identification key vault links de-identified records back to patients only for authorized clinical use.
- **Key Management:** Hardware Security Module (HSM) or cloud KMS (AWS KMS/Azure Key Vault) for encryption key lifecycle.
- **RBAC + ABAC:** Role-based access combined with attribute-based rules (e.g., a doctor can only view patients under their own care team).
- **Consent Management:** Explicit, granular, revocable patient consent for (a) data storage, (b) use in model training/research, (c) sharing with third parties — logged immutably with timestamp and consent version.
- **Audit Logging:** Every read/write/prediction event logged to an append-only (WORM-style) audit store; logs retained per regulatory minimums (typically 6 years for health records in most jurisdictions — verify local requirement).
- **Data Minimization:** Only the minimum necessary fields are passed into the quantum/classical model; raw PHI never leaves the ingestion boundary.
- **Anonymized Research Export:** Any dataset exported for research/benchmarking is k-anonymized (k≥5) and differential-privacy noise (ε-budget tracked) may be applied for aggregate statistics.

### 9.2 Regulatory Frameworks to Follow (India-first, globally aware)
| Framework | Relevance |
|---|---|
| **Digital Personal Data Protection Act (DPDP), 2023 (India)** | Primary data-protection law; consent, purpose limitation, breach notification |
| **IT Act, 2000 & IT Rules (SPDI Rules), 2011 (India)** | Sensitive personal data handling, reasonable security practices |
| **ABDM (Ayushman Bharat Digital Mission) standards** | Health ID, FHIR-based interoperability, consent manager integration if deployed in Indian public health context |
| **HIPAA (US)** | If deployed/benchmarked against US datasets (MIMIC) — Safe Harbor/Expert Determination de-identification |
| **GDPR (EU)** | If any EU patient data is processed — right to erasure, data portability |
| **ISO/IEC 27001** | Information security management system certification target |
| **ISO 13485 / IEC 62304** | Medical device software lifecycle — relevant if platform is positioned as a Software as a Medical Device (SaMD) |
| **CDSCO Medical Device Rules (India)** | If the platform is marketed as a diagnostic aid, may require regulatory classification/approval before clinical deployment |
| **NIST AI RMF** | AI risk-management best practice reference for model governance |

### 9.3 Model Governance & Clinical Safety Rules (strict)
1. The platform must **always** display itself as a **decision-support tool**, never a replacement for clinician diagnosis — a persistent disclaimer banner on every prediction screen.
2. No autonomous action (e.g., auto-alerting a patient of "cancer") without clinician review and sign-off.
3. Every model version must be logged in a **Model Registry** with training data lineage, hyperparameters, and validation metrics — full reproducibility required.
4. Model drift monitoring: recompute validation metrics on a rolling window of new data; trigger retraining alert if AUC drops beyond a pre-set tolerance (e.g., >5% relative drop).
5. Bias/fairness audits: evaluate sensitivity/specificity across demographic subgroups (age, sex, where ethically and legally appropriate) to detect disparate performance.
6. Fail-safe default: on quantum-hardware/simulator failure or timeout, gracefully fall back to the classical baseline model rather than blocking clinical workflow, with a visible "fallback mode" indicator.

---

## 10. Functional Requirements
| ID | Requirement |
|---|---|
| FR-1 | System shall allow authorized users to ingest biomedical data in CSV, FHIR-JSON, and VCF formats. |
| FR-2 | System shall automatically de-identify PHI prior to ML pipeline processing. |
| FR-3 | System shall perform configurable preprocessing (imputation, normalization, feature selection). |
| FR-4 | System shall reduce feature dimensionality to match the configured qubit budget (default 8–12 qubits). |
| FR-5 | System shall train and run inference using at least one of VQC, QNN, or QSVM models. |
| FR-6 | System shall benchmark hybrid model output against ≥3 classical baselines automatically on every training run. |
| FR-7 | System shall generate SHAP-based and quantum-perturbation-based explainability outputs per prediction. |
| FR-8 | System shall render a 2D digital twin reflecting current risk state per disease module. |
| FR-9 | System shall support role-based dashboards for Clinician, Patient, Admin, Researcher. |
| FR-10 | System shall log every data access and prediction event in an immutable audit trail. |
| FR-11 | System shall allow clinicians to export a PDF clinical report per patient prediction. |
| FR-12 | System shall support consent capture, versioning, and revocation per patient. |
| FR-13 | System shall gracefully fall back to classical-only inference if quantum backend is unavailable. |
| FR-14 | System shall allow model retraining and version comparison from the Admin Console. |
| FR-15 | System shall support timeline-based ("scrub") viewing of a patient's digital twin history. |

## 11. Non-Functional Requirements
| Category | Requirement |
|---|---|
| Performance | Inference response (classical fallback) ≤ 2s; hybrid quantum-simulated inference ≤ 8s for a single patient record. |
| Scalability | Support ≥ 10,000 concurrent patient records; horizontally scalable microservices. |
| Availability | 99.5% uptime target for clinical deployment. |
| Security | AES-256 at rest, TLS 1.3 in transit, RBAC+ABAC, HSM-backed key management. |
| Usability | WCAG 2.1 AA compliance; task completion for a first-time clinician user in <5 minutes without training. |
| Portability | Deployable via Docker/Kubernetes on any major cloud or on-prem hospital infrastructure. |
| Maintainability | Modular microservice architecture; ≥80% unit test coverage on core ML pipeline. |
| Auditability | 100% of PHI access events logged and queryable within 2 seconds. |
| Explainability | Every prediction must ship with a human-readable explanation; no "black-box only" output permitted. |

---

## 12. Technology Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Tailwind CSS (design tokens per Section 8.2/8.3), Recharts/D3 for charts, native SVG for digital twin |
| Backend API | Python (FastAPI) or Node.js (NestJS) — FastAPI recommended for tight integration with the ML/quantum stack |
| Quantum Computing | Qiskit + Qiskit Machine Learning, PennyLane (cross-validated implementations), Qiskit Aer simulator; optional IBM Quantum Runtime for hardware runs |
| Classical ML | scikit-learn (baselines), XGBoost, PyTorch (classical readout layers, autoencoders) |
| Database | PostgreSQL (relational + pgcrypto), MongoDB (flexible EHR documents), Redis (cache/session) |
| Object Storage | S3-compatible (imaging-derived feature blobs, reports) |
| Auth | OAuth2.0 + OpenID Connect, JWT, MFA (TOTP) |
| Infra | Docker, Kubernetes, Helm, Terraform (IaC), NGINX ingress |
| CI/CD | GitHub Actions, automated test + lint + security-scan (Bandit, Trivy) gates |
| Monitoring | Prometheus + Grafana, ELK/OpenSearch for logs, Sentry for error tracking |
| Explainability Libraries | SHAP, LIME, custom quantum-perturbation module |

---

## 13. Deliverables Table (Expected Deliverables)
| # | Deliverable | Format |
|---|---|---|
| 1 | Fully functional hybrid quantum-classical ML platform (web app) | Deployed app + source repo |
| 2 | Data ingestion & preprocessing pipeline | Source code + pipeline docs |
| 3 | Hybrid quantum-classical model implementations (VQC, QSVM, QNN) | Source code (Qiskit/PennyLane) + trained model artifacts |
| 4 | Classical baseline models for benchmarking | Source code + trained artifacts |
| 5 | Benchmark report (accuracy, sensitivity, specificity, AUC, MCC, runtime) | PDF/HTML report + raw metrics CSV |
| 6 | Explainability module (SHAP + quantum feature importance) | Integrated UI module + technical doc |
| 7 | 2D Digital Twin module | Integrated UI module (SVG/Canvas) |
| 8 | Full UI/UX design system & clickable prototype | Figma/design file + design-token spec |
| 9 | This SRS document | Markdown/PDF |
| 10 | Security & compliance documentation (DPDP/HIPAA/GDPR mapping) | PDF |
| 11 | API documentation | OpenAPI/Swagger spec |
| 12 | Test plan & test reports (unit, integration, security) | PDF/HTML |
| 13 | Deployment guide (Docker/Kubernetes) | Markdown/PDF |
| 14 | Demo video & pitch deck | MP4 + PPTX |
| 15 | Source code repository with README, contribution guide, license | Git repository |

---

## 14. Testing Strategy (Bug/Error Prevention)

### 14.1 Testing Pyramid
- **Unit Tests** (≥80% coverage): every preprocessing function, every formula in Section 4, quantum circuit construction, encoder/decoder logic.
- **Integration Tests**: full pipeline run on each benchmark dataset (Section 5.1), verifying shapes/types at every stage boundary.
- **Contract Tests**: API request/response schemas validated against OpenAPI spec (prevents frontend/backend drift).
- **Property-Based Tests**: for numeric formulas (e.g., normalization must always output within [0, π]; kernel matrix must be symmetric and positive semi-definite).
- **Regression Tests**: golden-output snapshots for each model version — any unexpected metric drift fails the CI build.
- **Security Testing**: static analysis (Bandit), dependency scanning (Trivy/Snyk), penetration testing checklist (OWASP Top 10, OWASP ASVS for the API layer).
- **Load/Performance Testing**: k6/Locust scripts simulating concurrent clinician sessions.
- **Accessibility Testing**: axe-core automated scan + manual screen-reader pass on every screen in Section 8.5.
- **Quantum-Specific Testing**: circuit unit tests validate correct gate counts/depth per qubit budget; simulator-vs-hardware consistency checks (statistical comparison of output distributions, not bit-exact, since NISQ hardware is noisy).

### 14.2 Error-Prevention Practices
- Strict input schema validation (Pydantic models) at every API boundary — reject malformed data before it reaches the ML pipeline.
- Type-checked codebase (TypeScript frontend, mypy-enforced Python backend).
- Idempotent ingestion (duplicate uploads detected via content hashing).
- Circuit-breaker pattern around the quantum execution backend (Section 9.3 fail-safe rule).
- Centralized structured logging with correlation IDs across all microservices for fast root-cause tracing.
- Feature flags for any experimental model/UI change, allowing safe rollback without redeploy.

---

## 15. Rules & Regulations Checklist (Strict Compliance Gate)
- [ ] All 18 HIPAA Safe Harbor identifiers stripped before ML processing.
- [ ] DPDP Act, 2023 consent-notice and purpose-limitation clauses implemented and shown to every Indian patient user.
- [ ] Encryption at rest (AES-256) and in transit (TLS 1.3) verified via automated security scan before every release.
- [ ] RBAC/ABAC access matrix documented and unit-tested for every role in Section 2.2.
- [ ] Immutable audit log verified to capture 100% of PHI access events.
- [ ] Every model prediction screen displays the "decision-support only, not a diagnosis" disclaimer.
- [ ] Model registry entry created for every trained model version, with dataset lineage recorded.
- [ ] Bias/fairness audit report generated for every model release.
- [ ] Accessibility audit (WCAG 2.1 AA) passed before UI release.
- [ ] Data breach response plan documented and rehearsed (tabletop exercise) at least once before production go-live.
- [ ] Third-party libraries scanned for known CVEs before each deployment.
- [ ] If positioned as a diagnostic aid, CDSCO/regulatory classification pathway reviewed with legal counsel before clinical marketing claims are made.

---

## 16. SIH Scoring Rubric — Steps to Achieve 10/10

| Evaluation Dimension | What Judges Look For | How This SRS/Platform Addresses It |
|---|---|---|
| **Innovation & Uniqueness** | Genuine novel use of quantum computing, not a rebranded classical model | Explicit Quantum Advantage Score (Section 4.6), entanglement-entropy diagnostics to prove real quantum contribution |
| **Technical Feasibility** | Can it actually run today? | NISQ-realistic qubit budget (8–12), simulator-first design with optional hardware, classical fallback (Section 9.3) |
| **Depth of Research** | Are formulas/algorithms correct and cited from real literature? | Full formula sheet (Section 4), benchmark datasets from established sources (Section 5.1) |
| **Completeness of Solution** | End-to-end, not just a model in a notebook | Full architecture (Section 3), UI/UX (Section 8), security (Section 9), deliverables (Section 13) |
| **Real-World Impact** | Clinically meaningful, deployable | Digital twin for clinician usability, explainability for trust, compliance mapping for real hospital deployment |
| **UI/UX Quality** | Polished, professional, accessible | Dedicated design system with palette/typography rationale, WCAG AA compliance |
| **Security & Ethics** | Patient data protected, ethical AI | Section 9 — encryption, consent, bias audits, fail-safe defaults |
| **Scalability & Robustness** | Works beyond a toy demo | Kubernetes-based microservices, load-tested, drift-monitored |
| **Presentation & Documentation** | Clear, professional SRS and demo | This document + suggested demo video/pitch deck deliverable |
| **Team Execution & Live Demo Readiness** | Working prototype, not just slides | Recommend building a minimal working demo on WDBC/Cleveland datasets first (fastest to a working VQC-vs-classical comparison) before the full platform |

**Priority order for hackathon time-boxing (fastest path to a strong, demoable 10/10):**
1. Working VQC on Wisconsin Breast Cancer dataset vs. classical Logistic Regression/Random Forest, with real accuracy/sensitivity/specificity numbers (Section 4.6) — this alone proves technical depth.
2. Explainability output (SHAP bar chart) tied to that prediction.
3. A basic but polished 2D digital twin (even a single-organ, single-disease version) showing risk color-coding.
4. Clinician dashboard shell with the design system applied (Section 8).
5. One-page security/compliance summary (from Section 9) to show maturity even if full implementation isn't complete by demo day.
6. Rehearsed 3–5 minute live demo narrative: problem → architecture diagram → live prediction → explainability → digital twin → benchmark numbers → compliance slide → roadmap.

---

## 17. Unique Differentiators
1. **Quantum Advantage Score (QAS)** — a novel, transparent metric (Section 4.6) that judges/clinicians can use to see *quantified* justification for the quantum layer, rather than a vague "quantum is better" claim.
2. **Entanglement-diagnostic explainability** — showing how much genuine quantum correlation the circuit uses, guarding against building what is secretly a classical-equivalent circuit.
3. **2D (not 3D) digital twin** — a deliberate, justified design decision (Section 7.4) prioritizing clinical accessibility and load-time over gimmicky 3D visuals.
4. **Graceful classical fallback** — the platform never fails clinically even if the quantum backend is down, which most academic QML prototypes ignore entirely.
5. **India-first regulatory mapping (DPDP Act + ABDM)** combined with global HIPAA/GDPR awareness — most hackathon health-AI projects only mention "HIPAA compliant" generically without a real framework mapping.
6. **Design system built for clinical trust** — cool "quantum" accent colors combined with standard clinical risk-color conventions, so the novelty of quantum computing never compromises clinical usability.
7. **Modular disease views** (Onco/Cardio/Neuro) on one unified twin, rather than three disconnected tools.

---

## 18. Implementation Roadmap
| Phase | Duration (illustrative) | Milestones |
|---|---|---|
| Phase 0 — Research & Data | Week 1 | Finalize datasets, literature review of QML feature maps/ansätze, qubit-budget decision |
| Phase 1 — Core ML Pipeline | Weeks 2–3 | Classical preprocessing, PCA reduction, VQC/QSVM implementation on simulator, baseline classical models |
| Phase 2 — Benchmarking & Explainability | Week 4 | Metrics dashboard, SHAP integration, quantum feature-importance module |
| Phase 3 — Platform & UI | Weeks 5–6 | Design system build-out, clinician dashboard, patient profile box, digital twin v1 |
| Phase 4 — Security & Compliance | Week 7 | Encryption, RBAC, audit logging, consent flows, compliance documentation |
| Phase 5 — Testing & Hardening | Week 8 | Full test suite (Section 14), accessibility audit, load testing |
| Phase 6 — Demo Prep | Final days | Pitch deck, demo video, rehearsed live walkthrough |

---

## 19. Appendices

### Appendix A — Quick Formula Reference Sheet
- Normalization: `x' = (x−x_min)/(x_max−x_min) × π`
- PCA projection: `X_reduced = X·V_k`
- Angle encoding: `RY(xᵢ)` per qubit
- ZZ feature map: `U_Φ(x) = exp(i Σxⱼ Zⱼ + i Σ(π−xⱼ)(π−xₖ)ZⱼZₖ)`
- VQC prediction: `ŷ = sigmoid(⟨Z₀⟩)`
- Parameter-shift gradient: `∂L/∂θₖ = [L(θₖ+π/2) − L(θₖ−π/2)]/2`
- Quantum kernel: `K(xᵢ,xⱼ) = |⟨φ(xᵢ)|φ(xⱼ)⟩|²`
- Accuracy/Sensitivity/Specificity/F1/AUC/MCC — Section 4.6
- Quantum Advantage Score: `QAS = ((Acc_q−Acc_c)/Acc_c) × (T_c/T_q)`
- SHAP value: `φᵢ = Σ_S [|S|!(|F|−|S|−1)!/|F|!] × [v(S∪{i})−v(S)]`
- Composite Risk Score: `CRS = Σ wd·ŷd`

### Appendix B — Glossary
See Section 1.4 for core acronyms. Additional terms should be added as the team finalizes implementation-specific vocabulary.

### Appendix C — Reference Literature Areas (for the team to cite formally in the final submission)
- Variational Quantum Classifiers — foundational papers on hybrid quantum-classical circuit training (parameter-shift rule, hardware-efficient ansätze).
- Quantum Kernel Methods / QSVM — fidelity-based quantum kernels for classification.
- Explainable AI — SHAP (Shapley Additive Explanations) and LIME foundational methodology.
- Clinical ML benchmarking — standard use of UCI Wisconsin Breast Cancer and Cleveland Heart Disease datasets in the ML literature.
*(Teams should retrieve and cite the exact primary sources for each method in their final report; this SRS intentionally avoids fabricated citations.)*

### Appendix D — Suggested Repository Structure
```
q-medsense/
├── frontend/                # React + TypeScript app
├── backend/                 # FastAPI services
│   ├── ingestion/
│   ├── preprocessing/
│   ├── quantum_engine/      # VQC, QSVM, QNN implementations
│   ├── classical_baselines/
│   ├── explainability/
│   ├── digital_twin/
│   └── compliance/
├── infra/                   # Docker, Kubernetes, Terraform
├── tests/
├── docs/
│   └── SRS.md               # this document
└── README.md
```

---

*End of Document — Q-MedSense SRS v1.0 for SIH Problem Statement 26139.*