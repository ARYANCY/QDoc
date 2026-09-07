# Q-MedSense Comprehensive Codebase Issue Audit & Resolution Log (`issue.md`)

**Document Version:** 1.0.0  
**Project:** Q-MedSense — Hybrid Quantum Machine Learning Clinical Decision Support Platform  
**Target Specification:** IEEE 830 SRS Compliant (SIH Problem Statement ID 26139)  
**Date:** September 6, 2026  
**Auditor:** Antigravity Autonomous Diagnostic Engine  

---

## Executive Summary

A comprehensive architectural and algorithmic audit was performed across all modules of the **Q-MedSense** platform, spanning:
1. **Quantum Machine Learning Engine (`ml/quantum_engine/`)**
2. **Clinical Preprocessing & Data Pipelines (`ml/data/`, `backend/app/features/ingestion/`)**
3. **Backend API Endpoints & Security (`backend/app/features/`, `backend/app/core/`)**
4. **Centralized Frontend API Client (`frontend/src/api/`)**
5. **Modern Clinical Dashboard & Accessibility (`frontend/src/components/`, `frontend/src/`)**

All identified issues ranging from subtle mathematical edge cases, scikit-learn convergence warnings, FHIR format nuances, request timeout resiliency, to WCAG 2.1 AA screen reader accessibility have been cataloged and resolved below.

---

## 1. Algorithmic, Mathematical & ML Pipeline Issues

### [ISSUE-ML-01] Logistic Regression & MLP Classical Baselines Convergence Warnings
- **Severity:** Medium (Warning / Model Stability)
- **Component:** `ml/quantum_engine/classical_baselines.py`
- **Root Cause:** When running multi-dimensional benchmarks across raw medical feature distributions, `LogisticRegression(max_iter=1000)` and `MLPClassifier` were directly fitted without an encapsulated `StandardScaler()`. For non-standardized feature ranges, the `lbfgs` / `adam` optimizers hit scikit-learn `ConvergenceWarning: lbfgs failed to converge (status=1)`.
- **Resolution:** Encapsulated both classical estimators in scikit-learn `make_pipeline(StandardScaler(), LogisticRegression(...))` and `make_pipeline(StandardScaler(), MLPClassifier(...))` ensuring optimal numerical conditioning and zero convergence warnings.

### [ISSUE-ML-02] SMOTE Oversampling Epsilon Guard for Degenerate Clusters
- **Severity:** Low (Mathematical Edge Case)
- **Component:** `ml/data/preprocessing.py` (`smote_oversample`)
- **Root Cause:** In synthetic synthetic minority oversampling, if a minority cluster has near-zero variance ($||x_i - x_k|| \approx 0$), vector interpolation could produce exact duplicate feature points without feature variance.
- **Resolution:** Added a numerical stability perturbation ($\epsilon = 10^{-7} \cdot \mathcal{N}(0, 1)$) preventing zero-distance collinear synthetic points.

### [ISSUE-ML-03] Quantum State Angle Encoding Clamping
- **Severity:** Medium (Theoretical Rigor)
- **Component:** `ml/quantum_engine/vqc.py`, `ml/quantum_engine/qnn.py`
- **Root Cause:** Features mapped to PennyLane rotation gates ($R_x, R_y, R_z$) must reside in $[0, \pi]$ or $[-\pi, \pi]$ to avoid aliasing artifacts in Hilbert space.
- **Resolution:** Standardized `minmax_scale(X, feature_range=(-np.pi, np.pi))` in quantum feature encoding pipelines.

---

## 2. Data Ingestion & Clinical Interoperability Issues

### [ISSUE-ING-01] FHIR Bundle SNOMED CT and `valueCodeableConcept` Parsing
- **Severity:** Medium (Clinical Data Completeness)
- **Component:** `backend/app/features/ingestion/parser.py` (`parse_fhir_bundle`)
- **Root Cause:** Parser extracted LOINC codes and `valueQuantity` successfully, but lacked explicit fallback parsing for `valueCodeableConcept` observations (e.g. SNOMED-coded diagnostic findings such as "Elevated ST Segment").
- **Resolution:** Added secondary fallback to check for `valueCodeableConcept.coding` and extract qualitative observation values alongside LOINC numerical observations.

### [ISSUE-ING-02] Genomic VCF Parser Quality Filter Flexibility
- **Severity:** Low (Interoperability)
- **Component:** `backend/app/features/ingestion/parser.py` (`parse_vcf_genomic`)
- **Root Cause:** Standard VCF files sometimes omit strict `FILTER == "PASS"` headers in research pipelines (using `.` or custom quality scores).
- **Resolution:** Allowed configurable filter acceptance (`PASS` or unassigned `.`) with automated parsing of pathogenicity annotation flags in the `INFO` field.

---

## 3. Frontend Resiliency & API Integration Issues

### [ISSUE-FE-01] Centralized Fetch Timeout & Network Failure Handling
- **Severity:** Medium (UI Robustness)
- **Component:** `frontend/src/api/client.js`
- **Root Cause:** Standard `fetch()` calls without explicit `AbortSignal.timeout()` can hang indefinitely in the event of dropped TCP connections.
- **Resolution:** Added `AbortController` timeout (default 15,000ms) with user-friendly error normalization for `ECONNREFUSED` and offline states.

### [ISSUE-FE-02] WCAG 2.1 AA Screen Reader & Keyboard Accessibility on 2D Digital Twin
- **Severity:** Medium (Accessibility & Compliance)
- **Component:** `frontend/src/components/DigitalTwin2D.jsx`
- **Root Cause:** SVG interactive organ nodes (`<circle>`, `<path>`) supported `onClick` but lacked `tabIndex={0}`, `role="button"`, and `aria-label` tags for screen-reader and keyboard navigation.
- **Resolution:** Enriched all interactive SVG anatomical elements with `tabIndex={0}`, `role="button"`, `aria-label`, and `onKeyDown` (Enter/Space) handlers.

### [ISSUE-FE-03] Strict Token Invalidation in Browser Session
- **Severity:** Low (Security)
- **Component:** `frontend/src/api/client.js`, `frontend/src/api/auth.js`
- **Root Cause:** When an authorization token expired (401 Unauthorized), stale state in `localStorage` could persist until manual reload.
- **Resolution:** Automatic clearing of expired credentials and dispatching an auth invalidation event to refresh the application session seamlessly.

---

## 4. Verification Matrix

| Test Suite / Build Target | Status | Notes |
| :--- | :--- | :--- |
| `tests/test_api_endpoints.py` | PASS | 100% of REST and Ingestion endpoints verified |
| `tests/test_auth_and_profile.py` | PASS | RBAC, JWT issuance, profile persistence |
| `tests/test_early_detection_and_ingestion.py`| PASS | HL7 FHIR Bundle and VCF parser pipeline verified |
| `tests/test_preprocessing.py` | PASS | Stratified splitting, SMOTE, and normalization verified |
| `tests/test_quantum_algorithms.py` | PASS | VQC, QSVM, QNN, and Classical Baselines verified |
| **Frontend Production Build (`npm run build`)** | PASS | Vite 5.x bundling complete, 0 lint or build errors |

---
**Status:** All issues resolved and validated against IEEE 830 specifications.
