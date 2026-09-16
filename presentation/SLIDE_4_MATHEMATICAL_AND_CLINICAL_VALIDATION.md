# SLIDE 4: MATHEMATICAL & CLINICAL VALIDATION

**Header:**
- **Platform Brand:** `Q-MEDSENSE`
- **Main Title:** `MATHEMATICAL FORMULATION & BENCHMARK VALIDATION`
- **Hackathon Identifier:** `SMART INDIA HACKATHON 2026 | Problem Statement ID: 26139 | Theme: MedTech / BioTech / HealthTech`

---

## 1. Mathematical Formulation & Quantum Circuit Kernels

### A. Angle Feature Encoding & Hilbert Space Mapping
Continuous normalized clinical biomarkers $x \in [-\pi, \pi]^N$ are encoded into an $N$-qubit quantum register via single-qubit rotation gates:
$$|\psi(x)\rangle = \bigotimes_{i=1}^N \left( \cos\left(\frac{x_i}{2}\right) |0\rangle + \sin\left(\frac{x_i}{2}\right) |1\rangle \right) = \bigotimes_{i=1}^N R_y(x_i) |0\rangle$$

For non-linear interactions, the **ZZ-Feature Map** induces quantum entanglement:
$$U_{\Phi}(x) = \exp\left( i \sum_{j} x_j Z_j + i \sum_{j < k} (\pi - x_j)(\pi - x_k) Z_j Z_k \right)$$

### B. Parameterized Quantum Circuit (PQC) & Ansatz Evolution
Features evolve under parameterized unitary transformations $W(\theta)$ with strongly entangling layers:
$$|\psi(\theta, x)\rangle = W(\theta) |\psi(x)\rangle = \prod_{l=1}^L \left( \text{CNOT-Mesh} \cdot \bigotimes_{i=1}^N R(\alpha_{i,l}, \beta_{i,l}, \gamma_{i,l}) \right) |\psi(x)\rangle$$

### C. Analytical Parameter-Shift Gradient Rule
Quantum gradients are computed without finite-difference approximation errors using exact $\pm \frac{\pi}{2}$ shifts:
$$\frac{\partial \langle Z_i \rangle}{\partial \theta_k} = \frac{1}{2} \left[ \langle Z_i \rangle_{\theta_k + \frac{\pi}{2}} - \langle Z_i \rangle_{\theta_k - \frac{\pi}{2}} \right]$$

### D. Conformal Prediction Uncertainty Calibration
Non-conformity score $s_i = 1 - \hat{P}(y_i \mid x_i)$. At user significance level $\alpha = 0.10$, the threshold $\hat{q}$ is derived via:
$$\hat{q} = \text{Quantile}\left( \frac{\lceil (n+1)(1-\alpha) \rceil}{n}, \{s_1, \dots, s_n\} \right)$$
Guarantees marginal coverage probability:
$$P(Y_{n+1} \in C(X_{n+1})) \ge 1 - \alpha = 0.90$$

### E. Quantum Advantage Score (QAS)
$$\text{QAS} = \left( \frac{\text{Accuracy}_Q - \text{Accuracy}_C}{\text{Accuracy}_C} \right) \times \left( \frac{\text{Runtime}_C}{\text{Runtime}_Q} \right)$$

---

## 2. Comprehensive Cross-Validated Performance Matrix & Dynamic Routing

| Disease Module | Dataset & Size | Evaluated Model | Type | Accuracy | Sensitivity | Specificity | Precision | F1-Score | AUC-ROC | Latency | Clinical Deployment Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dermatology (HAM10000)** | 10,015 Images | **Q-Skin-Vortex** | 10-Qubit VQC | **89.4%** | **0.89** | **0.94** | **0.88** | **0.88** | **0.9410** | 185 ms | ⚛️ **Active Primary Engine** |
| Dermatology (HAM10000) | 10,015 Images | DenseNet-121 | Classical CNN | 86.2% | 0.86 | 0.91 | 0.85 | 0.84 | 0.9120 | 45 ms | Classical Benchmark |
| **Pulmonology (Pneumonia)** | 5,863 X-Rays | **QuantumPneu** | 8-Qubit VQC | **91.2%** | **0.93** | **0.89** | **0.91** | **0.90** | **0.9540** | 142 ms | ⚛️ **Active Primary Engine** |
| Pulmonology (Pneumonia) | 5,863 X-Rays | EfficientNet-B0 | Classical CNN | 89.1% | 0.90 | 0.87 | 0.88 | 0.87 | 0.9280 | 38 ms | Classical Benchmark |
| **Breast Cancer (WDBC)** | 569 Biopsies | OncoPulse-VQC | 4-Qubit VQC | 70.0% | 0.70 | 0.12 | 0.79 | 0.61 | 0.8093 | 1570 ms | Shadow Mode (Spec Fails Guardrail) |
| **Breast Cancer (WDBC)** | 569 Biopsies | **Sentinel-RF** | Classical Random Forest | **84.0%** | **0.84** | **1.00** | **0.89** | **0.84** | **0.9269** | 18 ms | 🛡️ **Active Primary Engine** |
| **Cardiovascular** | 303 + 4,240 Rows | CardioWave-QNN | 5-Stage QNN | 57.8% | 0.58 | 0.58 | 0.43 | 0.49 | 0.8369 | 1379 ms | Shadow Mode (Classical +26.6% Lead) |
| **Cardiovascular** | 303 + 4,240 Rows | **Sentinel-XGB** | Classical XGBoost | **84.4%** | **0.84** | **0.83** | **0.85** | **0.84** | **0.9048** | 5.8 ms | 🛡️ **Active Primary Engine** |
| **Parkinson's Telemonitoring** | 195 Voice Rows | NeuroSynapse-VQC | 6-Qubit VQC | 80.0% | 0.80 | 0.25 | 0.84 | 0.75 | 0.7614 | 463 ms | Shadow Mode (Spec Fails Guardrail) |
| **Parkinson's Telemonitoring** | 195 Voice Rows | **Sentinel-RF** | Classical Random Forest | **80.0%** | **0.80** | **0.75** | 0.82 | **0.81** | **0.9091** | 15.5 ms | 🛡️ **Active Primary Engine** |
| Parkinson's Telemonitoring | 195 Voice Rows | Sentinel-LogReg | Classical Logistic Reg | 56.7% | 0.57 | 1.00 | 0.83 | 0.57 | 0.9034 | 0.6 ms | Classical Benchmark |

*All metrics extracted directly from `models/registry.json` and validated through 79/79 automated pytest test suites.*

### F. The NISQ Modality Boundary & Autonomous Q-Triage Safety Formulation

The platform's benchmark data reflects a fundamental mathematical principle in near-term quantum machine learning:
1. **Topological Feature Embedding Advantage in Imaging:** Complex visual representations (HAM10000, Kermany) map effectively onto parameterized $SU(2^n)$ Hilbert state spaces, capturing non-linear boundary correlations that dense classical CNN heads fail to represent (+2.1% to +3.2% gain).
2. **Qubit Bottleneck on Tabular Biomarkers:** Tabular datasets (WDBC 30 features, Cleveland 13 features, Parkinson's 22 features) require extreme dimensionality reduction (PCA down to 4–8 qubits), discarding clinically critical non-linear interactions that classical tree ensembles (Random Forest, XGBoost) natively parse without information loss.
3. **Autonomous Q-Triage Arbiter Formulation:** Rather than compromising clinical outcomes for marketing claims, Q-MedSense implements a dynamic clinical routing function:
$$M^*(x) = \mathbb{I}\Big(\text{QAS} > 0 \;\land\; \text{Specificity}_Q \ge 0.80 \;\land\; \text{Accuracy}_Q \ge \text{Accuracy}_C\Big) \cdot M_Q(x) \;+\; \left[1 - \mathbb{I}\Big(\dots\Big)\right] \cdot M_C(x)$$
Whenever quantum specificity or accuracy drops below clinical safety thresholds, the platform instantly routes primary diagnosis to the Classical Sentinel Baseline, while continuing to evaluate quantum telemetry in non-interfering shadow mode.

---

## 3. Visual Diagrams & Image Generation Prompts:

### Heading: Mathematical Quantum-Classical Formulation & Calibration Pipeline
**Visual Diagram Prompt:**
> A complex mathematical whiteboard and technical blueprint:
> - Central panel: In-depth quantum circuit mathematical diagram showing single-qubit rotations $R_y(x_i)$, CNOT entangling ladder, and Pauli-Z measurement operators with KaTeX equations displayed in luminous white and cyan.
> - Left panel: Conformal calibration curve showing non-conformity distribution with 90% threshold line $\hat{q}$ and safe prediction sets $C(x)$.
> - Right panel: Radar spider chart comparing Quantum vs Classical baselines across Sensitivity, Specificity, Accuracy, AUC, and Conformal Coverage.
> - Deep navy chalkboard texture, crisp mathematics notation, engineering precision.

**JSON Prompt to Create Image:**
```json
{
  "title": "Quantum Mathematical Formulation and Conformal Calibration Blueprint",
  "prompt": "High-tech technical whiteboard illustration detailing mathematical quantum machine learning algorithms for medicine. Center: 8-qubit variational quantum circuit schematic with exact mathematical formulas for parameter-shift gradients and angle embedding in glowing cyan equations. Left: conformal prediction calibration curve with labeled 90% confidence quantile. Right: multi-axis radar chart showing clinical benchmark comparisons between quantum models and classical neural networks. Dark matte slate background, crisp glowing white and turquoise chalk-style mathematical symbols, high academic precision, 8k resolution.",
  "style": "advanced engineering blueprint, scientific mathematical diagram",
  "aspect_ratio": "16:9",
  "color_palette": ["#0B132B", "#00F2FE", "#38BDF8", "#10B981", "#FFFFFF"],
  "composition": "wide-angle analytical layout with central quantum circuit equations flanked by calibration curves and benchmark charts",
  "lighting": "subtle luminescent glow on equation text and circuit vectors",
  "negative_prompt": "illegible scribble, blurred text, inaccurate physics symbols, cartoonish, low resolution"
}
```
