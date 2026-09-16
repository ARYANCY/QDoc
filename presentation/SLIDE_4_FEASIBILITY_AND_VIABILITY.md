# SLIDE 4: FEASIBILITY AND VIABILITY

## Official SIH 2026 Header
- **Problem Statement ID:** `26139`
- **Topic:** `Feasibility, Viability and Technical Risk Management`
- **Theme:** `MedTech / BioTech / HealthTech` | **Organization:** `Egreen Quanta`

---

## 1. Technical Feasibility in the NISQ Era

Our platform is engineered around the physical realities of current Noisy Intermediate-Scale Quantum (NISQ) devices, rejecting impractical assumptions of fault-tolerant hardware:

1. **Hybrid Partitioning Reduces Fault-Tolerant Dependence:**
   Complex non-quantum workloads (data ingestion, artifact stripping, convolutional feature extraction, gradient backpropagation) remain on robust classical hardware ($x86\_64$ / ARM). Quantum execution is isolated to low-depth parameterized circuits ($L \le 5$, 8–12 qubits).
2. **Simulator-First Development with Hardware Queues:**
   Full pipeline development and hyperparameter tuning run deterministically on **PennyLane statevector simulators** (`default.qubit`). Cloud hardware queues (Qiskit / IBM Quantum Runtime) are treated as physical execution targets for batch verification rather than real-time latency blockers.
3. **Dimensionality Reduction Matches Qubit Budgets:**
   High-dimensional biomedical vectors (10,000+ features) are compressed via supervised PCA into 8 to 16 orthogonal principal components, completely eliminating input-size bottlenecks before state preparation.
4. **Evidence-Based Baseline Benchmarking:**
   The system never presumes quantum superiority. It benchmarks hybrid models against tuned classical baselines (Random Forest, XGBoost, DenseNet-121, Logistic Regression) on identical test splits.
5. **Deterministic Fallback & High Availability:**
   If quantum simulator threads or hardware queues experience timeout, classical baseline heads automatically fulfill diagnostic requests with zero interruption to clinician workflow.

---

## 2. Technical Risk Management & Mitigation Matrix

| # | IDENTIFIED TECHNICAL RISK | POTENTIAL IMPACT | PLATFORM MITIGATION STRATEGY | IMPLEMENTATION STATUS |
| :- | :--- | :--- | :--- | :--- |
| **R1** | **Limited Qubit Count** (NISQ devices restricted to 5–127 qubits) | Cannot directly encode thousands of genes or pixels into quantum states. | **Supervised PCA & Bottleneck Projections:** Compresses features into 8–16 components. Feature re-uploading re-encodes data across circuit layers without increasing physical qubit count. | **Verified:** 8-qubit (`QuantumPneu`) and 10-qubit (`Q-Skin-Vortex`) pipelines running in production. |
| **R2** | **Quantum Noise & Decoherence** (Gate errors, readout fidelity loss) | Distorted quantum expectations and gradient degradation. | **Variational Error Mitigation:** Parameter-shift analytic gradient rule avoids finite-difference noise; statevector validation precedes hardware execution; shallow circuit depths ($D \le 18$). | **Verified:** Differentiable circuits tested across 100% of unit tests (`test_quantum_pipeline.py`). |
| **R3** | **High-Dimensional Biomedical Features** | Curse of dimensionality, memory bloat, model overfitting. | **Classical Deep Feature Extractors:** DenseNet-121 and EfficientNet-B0 extract compact latent vectors before PCA compression, preserving spatial and clinical invariants. | **Verified:** Dual-phase feature reduction validated on HAM10000 and Kermany cohorts. |
| **R4** | **Quantum Circuit Execution Cost & Latency** | High cloud compute costs and cloud network dependency. | **Local Embedded Simulation:** Offline statevector execution runs locally on clinician laptops ($<1.2\text{ GB RAM}$, $<200\text{ ms}$ latency), completely decoupled from expensive cloud quantum queues. | **Verified:** Zero-cloud dependency mode enabled via local FastAPI microservice. |
| **R5** | **Potential Absence of Quantum Advantage** | Quantum circuit underperforms simpler classical baselines. | **Transparent Benchmarking & QAS Metric:** Strict reporting of Quantum Advantage Score ($\text{QAS}$). The platform treats classical baselines as first-class citizens, never hiding negative advantage scores. | **Verified:** Exact scores documented in `models/registry.json` (e.g. Parkinson's: $+0.0206$, WDBC: $-0.0083$). |

---

## 3. Operational & Commercial Viability

- **Low Computational Footprint:** Entire edge software operates within a compact $<150\text{ MB}$ standalone binary requiring $<1.2\text{ GB}$ system RAM. Deployable on existing Primary Health Center (PHC) laptops without specialized GPU hardware.
- **Air-Gapped Privacy Compliance:** Zero external network calls required during local inference. Fully compliant with India's **DPDP Act 2023** (Section 6 & 9 consent) and **HIPAA Safe Harbor** (45 CFR § 164.514).
- **Graceful Failure Tolerance:** Embedded SQLite 3 database with Write-Ahead Logging (WAL) survives sudden rural power loss without transactional corruption.
- **Tamper-Evident Auditability:** Every inference transaction, clinician override, and consent grant is sealed into an immutable SHA-256 chained WORM ledger.

---

## 4. Visual Diagram & Image Generation Specifications

### Heading: Technical Risk Mitigation & Operational Feasibility Matrix Diagram
**Visual Diagram Prompt:**
> A clean, corporate-grade technical feasibility infographic on a dark slate background (`#0F172A`):
> - Center: A sturdy interlocking 2x2 shield diagram showing the four core pillars of feasibility: 'Hybrid Architecture', 'Simulation-First Testing', 'Classical Pre-Reduction', and 'Graceful Fallback'.
> - Surrounding Callouts: Five highlighted risk-mitigation capsules detailing:
>   1. Limited Qubit Count $\rightarrow$ Supervised PCA-8/16 Compression
>   2. Quantum Noise $\rightarrow$ Parameter-Shift Analytic Differentiation
>   3. Feature Sparsity $\rightarrow$ Classical Deep Transfer Backbones
>   4. Cloud Queue Latency $\rightarrow$ Local Statevector Execution Engine
>   5. Unverified Advantage Claims $\rightarrow$ Evidence-Based Classical Baseline Matrix
> - Aesthetic: Crisp corporate engineering graphics, glowing teal (`#06B6D4`) and emerald (`#10B981`) accents, clean tabular layout, high legibility.

**JSON Prompt to Create Image:**
```json
{
  "title": "Technical Feasibility and Risk Mitigation Matrix Infographic",
  "prompt": "Clean professional corporate engineering infographic on technical feasibility and risk mitigation for quantum medical AI. Central shield motif displaying four operational feasibility pillars: Hybrid Architecture, Simulation-First Verification, Dimensionality Reduction, and Fail-Safe Classical Fallback. Radiating connection lines pointing to five structured risk-mitigation cards: Limited Qubit Count, Quantum Noise Mitigation, High-Dimensional Features, Cloud Cost Control, and Transparent Baseline Benchmarking. Dark slate navy background (#0F172A), sharp mint green and cyan vector lines, clean corporate presentation aesthetic, ultra-sharp typography, 8k resolution.",
  "style": "executive engineering infographic, risk mitigation flowchart",
  "aspect_ratio": "16:9",
  "color_palette": ["#0F172A", "#1E293B", "#06B6D4", "#10B981", "#F59E0B", "#F8FAFC"],
  "composition": "balanced radial layout with central feasibility shield and surrounding structured mitigation cards",
  "lighting": "subtle edge luminescence, clean presentation slide illumination",
  "negative_prompt": "cluttered, messy handwriting, broken boxes, cartoonish, low resolution, 3d distortion"
}
```
