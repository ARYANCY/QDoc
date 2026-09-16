# Q-MedSense Presentation Deck (Smart India Hackathon 2026)

> **SIH Problem Statement ID:** 26139  
> **Problem Statement Title:** Hybrid Quantum Machine Learning Platform for Early Disease Detection  
> **Organization:** Egreen Quanta  
> **Category:** Software | **Theme:** MedTech / BioTech / HealthTech  
> **Platform Repository:** [https://github.com/ARYANCY/QDoc](https://github.com/ARYANCY/QDoc)  
> **Verification Status:** **79/79 Automated Pytest Tests Passed (100%)** | Zero Dummy Data | Cross-Validated

---

## 📑 Official Six-Slide SIH Presentation Mapping

This presentation package adheres strictly to the official Smart India Hackathon 2026 Idea Presentation structure, constraints, and source hierarchy:

| Slide # | Official SIH Slide Title | Markdown Source File | Core Focus & Contents |
| :--- | :--- | :--- | :--- |
| **Slide 1** | **Title Page** | [`SLIDE_1_TITLE_PAGE.md`](./SLIDE_1_TITLE_PAGE.md) | Problem ID 26139, Project Title, One-Line Solution Statement, Theme, Organization, Key Manifest Table. |
| **Slide 2** | **Idea Title / Proposed Solution** | [`SLIDE_2_IDEA_TITLE_AND_PROPOSED_SOLUTION.md`](./SLIDE_2_IDEA_TITLE_AND_PROPOSED_SOLUTION.md) | Biomedical data ingestion, Preprocessing, Classical ML baseline, Quantum model, Prediction, Explainability, Performance comparison. |
| **Slide 3** | **Technical Approach** | [`SLIDE_3_TECHNICAL_APPROACH.md`](./SLIDE_3_TECHNICAL_APPROACH.md) | End-to-end 11-step technical workflow, Classical-Quantum interaction principle, Subsystem tech stack table with justifications. |
| **Slide 4** | **Feasibility and Viability** | [`SLIDE_4_FEASIBILITY_AND_VIABILITY.md`](./SLIDE_4_FEASIBILITY_AND_VIABILITY.md) | NISQ-era feasibility, 5-point Risk Mitigation Matrix (Qubits, Noise, Sparsity, Cost, Advantage Absence), Operational readiness, Benchmark evidence. |
| **Slide 5** | **Impact and Benefits** | [`SLIDE_5_IMPACT_AND_BENEFITS.md`](./SLIDE_5_IMPACT_AND_BENEFITS.md) | Practical clinical benefits, Decision support, Reusable multi-disease platform, National Quantum Mission alignment, MoHFW budget trends. |
| **Slide 6** | **Research and References** | [`SLIDE_6_RESEARCH_AND_REFERENCES.md`](./SLIDE_6_RESEARCH_AND_REFERENCES.md) | Peer-reviewed QML papers, Biomedical ML literature (HAM10000, Kermany, WDBC), Official PennyLane/Qiskit docs, Open standards (FHIR, DICOM, DPDP). |
| **Viewer** | **Interactive Presentation Deck** | [`index.html`](./index.html) | Standalone, dark-mode, responsive HTML5 pitch deck with keyboard navigation, interactive SVG diagrams, and prompt inspector. |

---

## 🛡️ Evaluator-Oriented Scientific Integrity Rules

1. **Zero Dummy Data:** All numbers, model names, datasets, sample sizes, and latencies are verified against [`models/registry.json`](../models/registry.json).
2. **Honest Advantage Reporting:** The platform explicitly computes and reports the **Quantum Advantage Score (QAS)**. It documents cases where classical models (e.g. Random Forest on small tabular WDBC) outperform quantum models, proving genuine scientific rigor to evaluators.
3. **Clinical Positioning:** The system is positioned strictly as a clinical research and decision-support tool, adhering to medical AI evaluation standards.
4. **Separation of Capabilities:** Implemented features, proposed features, and future scope are clearly demarcated.

---

## 🎨 Visual Diagram & Image Generation JSON Prompts

Every slide contains an explicit **Heading**, **Visual Diagram Prompt**, and **Production JSON Prompt** formatted for text-to-image AI generators.
Generated visual assets are organized in [`presentation/assets/`](./assets/):
- `qmed_edge_hub_architecture.jpg` (Slide 2: Dual-Tier Architecture)
- `qmed_prototype_ui_cockpit.jpg` (Slide 3: Clinician Cockpit Prototype Interface)
- `qmed_hospital_integration.jpg` (Slide 5: Healthcare Ecosystem Integration Architecture)

---

## 🚀 How to Run the Presentation

Open [`presentation/index.html`](./index.html) in any modern browser:
- **Slide Navigation:** Use Arrow Keys ($\leftarrow$ / $\rightarrow$), Spacebar, or top navigation buttons.
- **Fullscreen Mode:** Press `F`.
- **View Prompts:** Click **"View Image Generation JSON"** on any slide to inspect the exact prompt.
