# Q-MedSense: Codebase Issue Audit & Resolution Log (`docs/ISSUES_RESOLVED.md`)

[![Issues Resolved](https://img.shields.io/badge/Audit-100%25%20Resolved-brightgreen.svg)]()
[![Tests Passing](https://img.shields.io/badge/Automated%20Tests-43%2F43%20Passing-brightgreen.svg)]()
[![SIH PS ID](https://img.shields.io/badge/SIH%20ID-26139-0052CC.svg)]()

**Document Version:** 2.1.0  
**Target Specification:** IEEE 830 / ISO 29148 SRS Compliant  
**Last Updated:** September 8, 2026  

---

## 📑 Issue Resolution Catalog

| Issue ID | Domain / Component | Root Cause | Engineering Resolution | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **`ISSUE-ENTRY-01`** | Universal Entry Point (`main.py`) | Running `python main.py` at repository root threw file not found because ASGI app was nested under `backend/app/main.py`. | Created root-level `main.py` with CLI argument parsing (`--host`, `--port`, `--mode`, `--reload`), formatted startup banner, and ASGI export. | Verified via `python main.py` and `import main; main.app`. |
| **`ISSUE-GIT-01`** | Git Ignore Strategy (`.gitignore`) | Large binary model weights (`*.pt`, `*.pth`) and local SQLite DBs risked exceeding GitHub 100MB file push limits. | Re-architected `.gitignore` to exclude large binary artifacts while explicitly whitelisting model metadata JSONs, labels, and entry points. | Verified via `git status` and `git ls-files`. |
| **`ISSUE-DEP-01`** | Dependencies (`requirements.txt`) | Fragmented dependency specifications for scoped backend and root virtual environments. | Standardized `requirements.txt` with clear domain categories (API, Quantum, Vision, Utilities, Tests) and created `backend/requirements.txt`. | Verified via clean fresh-environment installation. |
| **`ISSUE-BOM-01`** | Byte Order Marks (BOM) | Files (`config.py`, `logging.py`, `generator.py`) contained UTF-8 BOM (`\ufeff`) causing AST parse errors. | Automated script stripped leading `\xef\xbb\xbf` bytes, converting files to standard UTF-8. | Verified via Python AST parsing and pytest suite. |
| **`ISSUE-ML-01`** | Classical Baselines Convergence | Convergence warnings in Logistic Regression and Multi-Layer Perceptrons on raw features. | Encapsulated classical estimators in scikit-learn `make_pipeline(StandardScaler(), LogisticRegression(...))`. | Unit test `test_classical_baselines` passed. |
| **`ISSUE-ML-02`** | SMOTE Synthetic Degeneracy | Collinear synthetic samples produced zero-distance clustering in degenerate distributions. | Added numerical stability perturbation ($\epsilon = 10^{-7} \cdot \mathcal{N}(0, 1)$). | Unit test `test_smote_oversample` passed. |
| **`ISSUE-ML-03`** | Quantum Feature Angle Clamping | Unclamped features caused phase wrapping outside rotation gate bounds. | Standardized `minmax_scale(X, feature_range=(-np.pi, np.pi))` before angle embedding. | Verified in `test_quantum_preprocessor_scaling_and_pca`. |
| **`ISSUE-DB-01`** | Database Persistence | Ephemeral in-memory mock data did not persist clinical records across server restarts. | Implemented persistent SQLite database (`qmedsense.db`) with full relational schema and context-managed pooling. | Verified in `test_skin_cancer_prediction_sqlite_persistence`. |
| **`ISSUE-DB-02`** | Zero-Default Metric Enforcement | Mock static dummy data rendered on unanalyzed clinical UI pages. | Enforced strict zero initialization (`0%` / `0.00` / `Unanalyzed`) until live computation completes. | Verified in frontend and API response assertions. |
| **`ISSUE-SEC-01`** | Cryptographic Salts & Password Security | Identical passwords yielded correlated hashes without salt randomization. | Enforced PBKDF2-HMAC-SHA256 with 16-byte cryptographically secure random salts per user. | Verified in `test_pbkdf2_unique_salts_for_identical_passwords`. |
| **`ISSUE-SEC-02`** | XSS Protection in Reports | Unescaped HTML payloads in diagnostic reports posed injection vulnerabilities. | Integrated Jinja2 / standard HTML entity escaping across all dynamic clinical report generators. | Verified in `test_report_html_xss_escaping`. |
| **`ISSUE-CONSULT-01`**| Consultation Double Booking | Concurrent patient requests caused race conditions on doctor time slots. | Implemented 5-minute atomic soft-lock hold state (`status='HOLD'`, `lock_expires_at`). | Verified in `test_slot_soft_lock_hold` & `test_booking_lifecycle`. |

---

## 🧪 Comprehensive Verification Summary

- **Automated Pytest Suite:** **43 / 43 tests passed (100% pass rate)**.
  - API & RBAC tests: 19 passed.
  - Doctor consultation & emergency triage tests: 11 passed.
  - Ingestion & multi-modal unit tests: 5 passed.
  - Quantum circuits & algorithm tests: 8 passed.
- **Frontend Production Build:** **1,824 modules transformed with 0 build errors**.
- **Working Tree:** Clean, tracked, and compliant with all SIH 26139 deliverables.

---

**© 2026 Q-MedSense Engineering Team. SIH Problem Statement ID 26139.**
