# Q-MedSense Security, Privacy & Regulatory Compliance Specification

**Document Identifier:** QMED-SEC-001  
**Target Standards:** IEEE 830, DPDP Act 2023 (India), ABDM, HIPAA (US), GDPR (EU), ISO 27001  
**Status:** Approved & Implemented  

---

## 1. Regulatory Framework Mapping

| Regulatory Body / Act | Jurisdiction | Platform Implementation Status | Technical Mechanism |
| :--- | :--- | :--- | :--- |
| **Digital Personal Data Protection Act (DPDP), 2023** | India | **100% Implemented** | Explicit granular consent modal, Purpose Limitation, Immutable Audit Logs, Right to Revoke Consent |
| **Ayushman Bharat Digital Mission (ABDM)** | India | **100% Implemented** | Standard HL7 FHIR Bundle Ingestion, Health ID compatibility, Encrypted exchange |
| **HIPAA Safe Harbor (45 CFR § 164.514)** | United States | **100% Implemented** | Automated stripping of all 18 Protected Health Identifiers prior to ML pipeline entry |
| **General Data Protection Regulation (GDPR)** | European Union | **100% Implemented** | Privacy-by-design, cryptographic pseudonymization, AES-256 at rest, TLS 1.3 in transit |

---

## 2. HIPAA Safe Harbor 18 De-Identification Protocol

Before any biomedical record enters the Quantum or Classical ML processing pipelines, the automated `deidentify_dataframe` engine in `ml/data/preprocessing.py` scans and removes:

1. Names and full aliases
2. All geographic subdivisions smaller than a state
3. All elements of dates (birth date, admission date, discharge date, date of death)
4. Telephone numbers
5. Fax numbers
6. Electronic mail addresses
7. Social Security / National Identity Numbers
8. Medical Record Numbers (MRN) — masked in UI, audited on click-to-reveal
9. Health plan beneficiary numbers
10. Account numbers
11. Certificate / license numbers
12. Vehicle identifiers and serial numbers
13. Device identifiers and serial numbers
14. Web Universal Resource Locators (URLs)
15. Internet Protocol (IP) address numbers
16. Biometric identifiers (voiceprints, fingerprints)
17. Full face photographic images
18. Any other unique identifying number, characteristic, or code

---

## 3. Cryptographic and Access Control Standards

- **Data in Transit:** TLS 1.3 encrypted over HTTPS / WSS.
- **Data at Rest:** AES-256 encryption using AWS KMS or HSM key hierarchy.
- **Access Control:** Role-Based Access Control (RBAC) with token-based JSON Web Tokens (JWT) and Attribute-Based Access Control (ABAC) isolating patient cohorts to their respective care teams.
- **Audit Logging:** Every PHI view, MRN reveal, model execution, and consent update writes to an append-only, tamper-evident audit store (`/api/v1/compliance/audit-logs`).
