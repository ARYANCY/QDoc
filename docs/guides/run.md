# Q-MedSense: Complete Step-by-Step Execution Guide (`run.md`)

This guide provides end-to-step instructions for running, testing, and developing the **Q-MedSense** Quantum Clinical Decision Support Platform on Windows, macOS, and Linux.

---

## 1. System Requirements & Prerequisites

### Required Runtimes
- **Python:** 3.10, 3.11, 3.12, 3.13, or 3.14 (64-bit recommended)
- **Node.js:** v18.0.0 or higher (with `npm` v9+)
- **Operating System:** Windows 10/11, macOS (Apple Silicon / Intel), or Ubuntu 22.04+

### Core Dependencies Installed Automatically
- **Backend / QML:** `fastapi`, `uvicorn`, `pennylane`, `torch`, `scikit-learn`, `numpy`, `pandas`, `pydantic`, `pytest`, `python-multipart`
- **Database:** SQLite 3 (built-in standard library with relational schemas and zero external configuration required)
- **Frontend:** `react`, `react-dom`, `vite`, `lucide-react`

---

## 2. Quickstart Execution (PowerShell / Terminal)

### Option A: One-Click Startup Scripts (Windows PowerShell)

In the workspace root directory, launch two terminal windows:

**Terminal 1 — Backend (FastAPI + Quantum Simulator + SQLite):**
```powershell
.\start_backend.ps1
```

**Terminal 2 — Frontend (Vite + React UI):**
```powershell
.\start_frontend.ps1
```

---

### Option B: Manual Step-by-Step Launch

#### Step 1: Backend Environment Setup & Launch
1. Open a terminal in the project root directory:
   ```bash
   cd c:\Users\aryan\OneDrive\Desktop\doc
   ```
2. (Optional) Activate your virtual environment or Anaconda environment:
   ```bash
   # Windows PowerShell (venv)
   .\.venv\Scripts\Activate.ps1

   # Or Anaconda
   conda activate base
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Uvicorn ASGI Server:
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - **Backend URL:** `http://localhost:8000`
   - **Interactive OpenAPI / Swagger Docs:** `http://localhost:8000/docs`
   - **ReDoc Schema:** `http://localhost:8000/redoc`

#### Step 2: Frontend Environment Setup & Launch
1. Open a second terminal window and navigate to `frontend/`:
   ```bash
   cd c:\Users\aryan\OneDrive\Desktop\doc\frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   - **Frontend Web Application:** `http://localhost:5173`

---

## 3. Pre-Configured Test Accounts & Authority Personas

The platform includes 3 pre-seeded personas mapped to Role-Based Access Control (RBAC):

| Persona / Role | Username | Default Password | Primary View & Authorized Features |
| :--- | :--- | :--- | :--- |
| **Patient** (Alex Reed) | `alex.patient` | `patient123` | Autonomous Self-Analysis Cockpit, 2D Digital Twin, Early Detection Map, Benchmark Matrix, Health Records |
| **Researcher** (QML Engineer) | `priya.qml` | `quantum123` | Live Retraining Studio, Hyperparameter Optimizer, Benchmark Matrix, Quantum Telemetry, Validation Cockpit |
| **Administrator** (Compliance) | `admin.audit` | `admin123` | Compliance & Audit Console, User Management, WORM Hash Logs, DPDP Consent Manager |

> **Tip:** You can switch roles instantly in the UI by clicking the user badge at the bottom of the left sidebar or the top-right header button.

---

## 4. Running the Verification Test Suite

### Automated Pytest Suite (21 Comprehensive Tests)
From the project root:
```bash
python -m pytest tests/ -v
```
This tests:
- Hybrid Quantum VQC, QSVM, and QNN inference and statevector encodings.
- Classical baseline classifiers (Random Forest, Logistic Regression, MLP, SVM).
- SQLite Database persistence, patient clinical telemetry, and WORM audit logging.
- HL7 FHIR Bundle and genomic VCF parsing.
- JWT Authentication, RBAC authority tokens, and DPDP consent endpoints.

### Frontend Production Build Test
From the `frontend/` directory:
```bash
cd frontend
npm run build
```
Builds the production bundle into `frontend/dist/` verifying zero lint or compilation errors.

---

## 5. Typical Clinical & Research Workflows

### 1. Running a Live Quantum Diagnosis (Clinician)
1. Open `http://localhost:5173` in your web browser.
2. Under **Diagnostic Protocol** (Column 1), select a clinical module (e.g. *Breast Oncology (WDBC)* or *Cardiology (Cleveland)*).
3. Inspect the normalized live biomarker vector loaded from the database in Column 2.
4. Click **"Execute Quantum Diagnostic Pipeline"**.
5. The system encodes parameters into PennyLane statevectors, executes the VQC ansatz, and displays:
   - Primary Triage (e.g. Malignant / Benign) with quantum confidence.
   - Classical baseline comparison.
   - Real-time probability distributions.
   - SHAP quantum feature perturbation attributions and natural-language narrative.
   - Interactive 2D Digital Twin visualization.
6. Click **"Export Clinical PDF Report"** to download an audit-ready report.

### 2. Live Quantum Retraining & Hyperparameter Tuning (Researcher)
1. Switch role to **Researcher** or click **Researcher Console** in the sidebar.
2. Select target dataset (*WDBC*, *Cleveland*, or *PIMA*), quantum architecture (*VQC*, *QSVM*, or *QNN*), and loss function (*Focal Loss* / *CrossEntropy*).
3. Adjust the interactive hyperparameter sliders: Qubits (4–12), Variational Layers (1–6), Epochs (2–15), Learning Rate.
4. Click **"Run Live Retraining Experiment"**.
5. Monitor live epoch convergence, loss curves, training accuracy, and model registration.

### 3. Compliance & Audit Inspection (Admin)
1. Switch role to **Admin** or navigate to **Compliance & Audit**.
2. View immutable WORM audit logs with SHA-256 digital signatures.
3. Toggle granular DPDP 2023 consent options (Data Storage, Telemetry Sharing, Research Access).
4. Inspect the Model Registry with dataset lineage.

---

## 6. Troubleshooting & FAQ

- **Port 8000 already in use:**
  ```powershell
  # Windows: Check process on port 8000
  netstat -ano | findstr :8000
  # Kill process by PID
  taskkill /PID <PID> /F
  ```
- **Vite host connection error:** Ensure backend is running at `http://localhost:8000`. The Vite development server automatically proxies `/api` to `http://localhost:8000`.
- **Database Reset:** The SQLite database is located at `qmedsense.db` in the root directory. To reset all tables to factory seed state, delete `qmedsense.db` and restart the backend.
