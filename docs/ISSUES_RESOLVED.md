# Q-MedSense: Codebase Issue Audit & Resolution Log (`docs/ISSUES_RESOLVED.md`)

**Document Version:** 2.0.0  
**Project:** Q-MedSense — Hybrid Quantum Machine Learning Clinical Decision Support Platform  
**Target Specification:** IEEE 830 SRS Compliant (SIH Problem Statement ID 26139)  
**Date:** September 6, 2026  

---

## 1. Algorithmic, Mathematical & ML Pipeline Issues

### [ISSUE-ML-01] Logistic Regression & MLP Convergence Warnings
- **Status:** RESOLVED
- **Component:** `ml/quantum_engine/classical_baselines.py`
- **Resolution:** Encapsulated classical estimators in scikit-learn `make_pipeline(StandardScaler(), LogisticRegression(...))` ensuring optimal numerical conditioning.

### [ISSUE-ML-02] SMOTE Oversampling Epsilon Guard for Degenerate Clusters
- **Status:** RESOLVED
- **Component:** `ml/data/preprocessing.py` (`smote_oversample`)
- **Resolution:** Added a numerical stability perturbation ($\epsilon = 10^{-7} \cdot \mathcal{N}(0, 1)$) preventing zero-distance collinear synthetic points.

### [ISSUE-ML-03] Quantum State Angle Encoding Clamping
- **Status:** RESOLVED
- **Component:** `ml/quantum_engine/vqc.py`, `ml/quantum_engine/qnn.py`
- **Resolution:** Standardized `minmax_scale(X, feature_range=(-np.pi, np.pi))` in quantum feature encoding pipelines.

---

## 2. Database & Data Persistence Issues

### [ISSUE-DB-01] Persistent Relational Storage for Clinical Records
- **Status:** RESOLVED
- **Component:** `backend/app/db/`
- **Resolution:** Implemented an SQLite relational database (`qmedsense.db`) with structured tables for `users`, `patients`, `diagnostic_records`, `audit_logs`, `consents`, and `early_detection_assessments`.

### [ISSUE-DB-02] Zero Default Metric Enforcement
- **Status:** RESOLVED
- **Component:** `frontend/src/components/`, `frontend/src/features/`
- **Resolution:** Eliminated all hardcoded client-side mock percentages. All unanalyzed states initialize strictly at 0% / 0.00 / Unanalyzed until computed and fetched from the database.

---

## 3. UI, Styling & Accessibility Issues

### [ISSUE-UI-01] Strict Zero Border-Radius Design
- **Status:** RESOLVED
- **Component:** `frontend/src/styles.css` and all 11 JSX components
- **Resolution:** Replaced rounded corners with crisp 0px borders (`border-radius: 0px`) and high-contrast clinical styling.

### [ISSUE-UI-02] Dynamic Role-Based Access Control (RBAC) Navigation
- **Status:** RESOLVED
- **Component:** `frontend/src/features/analysis/UnifiedAnalysisPage.jsx`
- **Resolution:** Dynamically filters visible sidebar sections and navigation views according to the logged-in user's role (`clinician`, `researcher`, `admin`, `patient`).

---

## 4. Verification Summary
- **Pytest Suite:** 21/21 passed (100% pass rate).
- **Vite Production Build:** 1,824 modules transformed with 0 build errors.
