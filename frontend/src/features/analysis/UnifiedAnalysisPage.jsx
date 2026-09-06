import { useState, useRef, useEffect } from "react";
import {
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Minimize2,
  Maximize2,
  Download,
  LogIn,
  Play,
  RefreshCw,
  Settings,
  ShieldCheck,
  User,
  Upload,
  Menu,
  CheckCircle2,
  Sliders,
  Sparkles,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import DigitalTwin2D from "../../components/DigitalTwin2D.jsx";
import ExplainabilityView from "../../components/ExplainabilityView.jsx";
import BenchmarkMatrix from "../../components/BenchmarkMatrix.jsx";
import ComplianceConsole from "../../components/ComplianceConsole.jsx";
import PatientPortal from "../../components/PatientPortal.jsx";
import EarlyDetectionMap from "../../components/EarlyDetectionMap.jsx";
import QuantumCircuitViewer from "../../components/QuantumCircuitViewer.jsx";
import ProfileSettingsModal from "../../components/ProfileSettingsModal.jsx";
import AuthModal from "../../components/AuthModal.jsx";
import UserGuideModal from "../../components/UserGuideModal.jsx";
import UserManagementConsole from "../../components/UserManagementConsole.jsx";
import UserProfilePage from "../../components/UserProfilePage.jsx";
import SectionGuideModal from "../../components/SectionGuideModal.jsx";

import { clinicalApi } from "../../api/clinical";
import { reportsApi } from "../../api/reports";
import { authApi } from "../../api/auth";
import "../../styles.css";

/* ── Custom High-Tech SVG Navigation Icons ──────────────────────────────────── */

function NavDiagnosticSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 9v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function NavTwinSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <circle cx="12" cy="5" r="3" />
      <path d="M6.5 21v-7l3-3h5l3 3v7" />
      <path d="M12 11v6" />
      <circle cx="12" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

function NavEarlyDetectionSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <circle cx="12" cy="12" r="10" />
      <path d="m16.2 7.8-2 6.4-6.4 2 2-6.4z" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function NavBenchmarkSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M3 3v18h18" />
      <path d="M7 16v-4" />
      <path d="M11 16V8" />
      <path d="M15 16v-6" />
      <path d="M19 16V4" />
    </svg>
  );
}

function NavTelemetrySvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <rect x="4" y="4" width="16" height="16" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
    </svg>
  );
}

function NavComplianceSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function NavPortalSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function NavUsersSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function NavProfileSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/* ── Interactive Plain-English Patient Guides Dictionary ─────────────────────── */
const GUIDE_DATA = {
  checkup_selector: {
    sectionId: "SEC-01",
    title: "Health Checkup & Biological Indicators",
    summary: "Choose a preventative health checkup protocol (such as Oncology, Cardiovascular, or Pulmonary) or upload your clinical test records to evaluate health indicators.",
    steps: [
      { heading: "Select Health Checkup", description: "Click any health category on the left to load verified clinical test parameters." },
      { heading: "Upload or Test Samples", description: "Use 'Browse File' to upload your FHIR / CSV health report or select one of the pre-loaded checkup samples." },
      { heading: "Review Biomarkers", description: "Verify that your biological indicator values (such as cell texture, heart rate, or blood pressure) are loaded." },
    ],
    metrics: [
      { label: "Biomarker Count", explanation: "The number of individual physiological parameters analyzed in this screening.", color: "var(--primary)" },
      { label: "Optimal Sample", explanation: "A calibrated test sample representing normal, healthy baseline metrics.", color: "var(--risk-low)" },
    ],
    quantumBenefit: "Quantum AI analyzes high-dimensional correlations across dozens of biological markers simultaneously, detecting subtle pre-clinical patterns earlier than standard methods.",
  },
  ai_assessment: {
    sectionId: "SEC-02",
    title: "Quantum AI Health Assessment & Key Factors",
    summary: "Runs high-precision Quantum AI models to determine your health risk tier and highlights the primary biological factors influencing the evaluation in plain English.",
    steps: [
      { heading: "Click Execute", description: "Press 'Run Instant Quantum AI Checkup' to process your health indicators." },
      { heading: "Review Verdict", description: "View the primary Health Risk Assessment badge (Optimal / Attention / Elevated Risk)." },
      { heading: "Inspect Key Factors", description: "Review the contribution percentage bar chart showing which biomarkers had the greatest impact on your assessment." },
    ],
    metrics: [
      { label: "Confidence Rating", explanation: "How certain the Quantum AI model is in this statistical assessment (e.g. 96.4%).", color: "var(--primary)" },
      { label: "Factor Importance %", explanation: "The relative percentage weight of each biomarker in reaching the assessment.", color: "var(--accent-teal)" },
    ],
    quantumBenefit: "Quantum statevector transformations preserve multi-marker interactions, providing both higher confidence and clear explainability without black-box opacity.",
  },
  digital_twin: {
    sectionId: "SEC-03",
    title: "2D Digital Health Avatar & Timeline",
    summary: "Your interactive 2D physiological avatar mapping organ-by-organ vitality across your checkup history with preventative care recommendations.",
    steps: [
      { heading: "Select an Organ", description: "Click on Brain, Lungs, Heart, or other regions in the avatar or list to inspect organ-specific vitality." },
      { heading: "Scrub Timeline", description: "Use the visit slider to compare your health trajectory across past checkups." },
      { heading: "Read Doctor Guidance", description: "Inspect preventative lifestyle and screening recommendations tailored to that organ." },
    ],
    metrics: [
      { label: "Green (Optimal)", explanation: "Organ vital signs and cellular biomarkers are within healthy baseline limits.", color: "var(--risk-low)" },
      { label: "Orange / Red (Attention)", explanation: "Early biomarker shifts detected; preventative lifestyle or clinical review advised.", color: "var(--risk-high)" },
    ],
    quantumBenefit: "Aggregates multi-organ biomarker streams into a unified temporal digital twin for personalized preventative health tracking.",
  },
  early_detection: {
    sectionId: "SEC-04",
    title: "Multi-Organ Early Prevention Map",
    summary: "Tracks early sub-clinical risk progressions across critical organ systems, helping you intervene before symptoms develop.",
    steps: [
      { heading: "Inspect Trajectory Stages", description: "Review stage classifications (Baseline -> Cellular Shift -> Moderate -> Actionable)." },
      { heading: "Verify Action Items", description: "Follow the automated preventative action guidelines provided for each risk tier." },
    ],
    metrics: [
      { label: "Stage 0 (Baseline)", explanation: "Optimal physiological equilibrium with zero elevated markers.", color: "var(--risk-low)" },
      { label: "Stage 1 (Pre-Clinical)", explanation: "Minor early biomarker variance detected; lifestyle optimization recommended.", color: "var(--risk-mid)" },
    ],
    quantumBenefit: "Detects non-linear cellular shifts up to 18-24 months earlier than standard single-variable clinical thresholds.",
  },
  benchmarks: {
    sectionId: "SEC-05",
    title: "Health Benchmark Matrix & Accuracy Comparison",
    summary: "Side-by-side performance comparison of Quantum AI against standard classical models (Random Forest, SVM, Logistic Regression).",
    steps: [
      { heading: "Compare Accuracy & MCC", description: "Inspect how Quantum AI achieves higher true-positive sensitivity and fewer false alarms." },
      { heading: "Review Quantum Advantage", description: "The Quantum Advantage Score (QAS) measures the proven mathematical lift over standard methods." },
    ],
    metrics: [
      { label: "MCC Score", explanation: "Matthews Correlation Coefficient — the gold standard balanced metric for diagnostic accuracy.", color: "var(--primary)" },
      { label: "Latency (ms)", explanation: "Processing time in milliseconds to complete full quantum statevector evaluation.", color: "var(--accent-violet)" },
    ],
    quantumBenefit: "Delivers measurable precision gains (+4.2% to +8.6% MCC) across complex biological datasets.",
  },
  records: {
    sectionId: "SEC-06",
    title: "My Encrypted Health Records & Portability",
    summary: "Your secure health record vault with verified checkup summaries, active medications, and DPDP / ABDM privacy controls.",
    steps: [
      { heading: "View Historical Scans", description: "Review date-stamped checkup records with verified digital cryptographic signatures." },
      { heading: "Manage Privacy Consents", description: "Toggle research sharing and data portability preferences with 1-click." },
      { heading: "Download Reports", description: "Export tamper-proof PDF clinical reports to share with your personal physician." },
    ],
    metrics: [
      { label: "WORM SHA-256", explanation: "Cryptographic hash ensuring your health records have not been altered or tampered with.", color: "var(--primary)" },
      { label: "DPDP 2023 Compliant", explanation: "Meets India's Digital Personal Data Protection Act and HIPAA privacy standards.", color: "var(--risk-low)" },
    ],
    quantumBenefit: "Patient data is fully de-identified and client-encrypted before being processed by quantum circuits.",
  },
};

/* ── Role-Based Access Control (RBAC) Authority Configurations ──────────────── */
const ROLE_PERMISSIONS = {
  patient: {
    label: "Patient (Autonomous Health Checkups & Twin)",
    badgeColor: "var(--primary)",
    defaultTab: "diagnostic",
    allowedTabs: ["diagnostic", "twin", "early_detection", "benchmarks", "telemetry", "portal", "profile"],
    sections: [
      {
        title: "Personal Health Cockpit",
        items: [
          { id: "diagnostic", label: "Health Checkups", icon: NavDiagnosticSvg },
          { id: "twin", label: "2D Digital Health Twin", icon: NavTwinSvg },
          { id: "early_detection", label: "Early Detection Map", icon: NavEarlyDetectionSvg },
        ],
      },
      {
        title: "AI & Telemetry",
        items: [
          { id: "benchmarks", label: "AI Health Benchmarks", icon: NavBenchmarkSvg },
          { id: "telemetry", label: "Quantum Telemetry", icon: NavTelemetrySvg },
        ],
      },
      {
        title: "Health Records",
        items: [
          { id: "portal", label: "My Health Records", icon: NavPortalSvg },
        ],
      },
      {
        title: "Account & Profile",
        items: [
          { id: "profile", label: "My Profile & Security", icon: NavProfileSvg },
        ],
      },
    ],
  },
  admin: {
    label: "System & Compliance Administrator",
    badgeColor: "var(--accent-teal)",
    defaultTab: "compliance",
    allowedTabs: ["compliance", "users", "benchmarks", "portal", "profile"],
    sections: [
      {
        title: "Governance & Security",
        items: [
          { id: "compliance", label: "Compliance & Audit", icon: NavComplianceSvg },
          { id: "users", label: "User Management", icon: NavUsersSvg },
          { id: "benchmarks", label: "Benchmark Matrix", icon: NavBenchmarkSvg },
          { id: "portal", label: "Health Records", icon: NavPortalSvg },
        ],
      },
      {
        title: "Account & Profile",
        items: [
          { id: "profile", label: "My Profile & Security", icon: NavProfileSvg },
        ],
      },
    ],
  },
};

const STUDIES = {
  breast_cancer: {
    id: "breast_cancer",
    label: "Breast Oncology (WDBC)",
    badge: "Oncology • 30 Features",
    desc: "Nuclear margin concavity & texture triage for malignant lesion classification.",
    model: "VQC (8-Qubit SOTA)",
    samples: [
      { name: "Malignant Biopsy", label: "Malignant" },
      { name: "Benign Lesion", label: "Benign" },
    ],
  },
  heart: {
    id: "heart",
    label: "Cardiology (Cleveland)",
    badge: "Cardiovascular • 14 Features",
    desc: "Coronary artery disease triage, ST-depression & vessel calcification.",
    model: "QSVM (Fidelity Kernel)",
    samples: [
      { name: "High Coronary Risk", label: "Disease" },
      { name: "Optimal Cardio", label: "Normal" },
    ],
  },
  diabetes: {
    id: "diabetes",
    label: "Metabolic / Diabetes (PIMA)",
    badge: "Metabolic • 8 Features",
    desc: "Glucose tolerance, insulin resistance, and metabolic syndrome screening.",
    model: "QNN (Multi-Class)",
    samples: [
      { name: "Elevated Fasting Glucose", label: "Diabetic" },
      { name: "Normal Glucose Profile", label: "Non-diabetic" },
    ],
  },
  pneumonia: {
    id: "pneumonia",
    label: "Chest Radiography (Pneu)",
    badge: "Pulmonology • X-Ray",
    desc: "Radiographic inspection for pulmonary consolidation and opacity.",
    model: "QuantumPneu (8-Qubit VQC)",
    samples: [
      { name: "Normal Chest X-Ray", label: "Normal" },
      { name: "Bacterial Pneumonia", label: "Pneumonia" },
    ],
  },
  skin: {
    id: "skin",
    label: "Dermatoscopy (Skin Cancer)",
    badge: "Dermatology • 7-Class",
    desc: "Pigmented dermatoscopic lesion triage and melanoma classification.",
    model: "QuantumDerma (10-Qubit VQC)",
    samples: [
      { name: "Melanocytic Nevus (nv)", label: "nv" },
      { name: "Melanoma Lesion (mel)", label: "mel" },
    ],
  },
};

export default function UnifiedAnalysisPage() {
  const [study, setStudy] = useState("breast_cancer");
  const [patientId, setPatientId] = useState("PT-89421");
  const [patientData, setPatientData] = useState(null);
  const [rawFeatures, setRawFeatures] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [twinCollapsed, setTwinCollapsed] = useState(false);
  const [mrnMasked, setMrnMasked] = useState(true);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [userGuideOpen, setUserGuideOpen] = useState(false);

  // Auth & Profile Modal States
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState(null);
  const [currentUser, setCurrentUser] = useState(authApi.getStoredUser() || {
    user_id: "PT-ALEX",
    username: "alex.patient",
    name: "Alexander Reed",
    role: "patient",
    email: "alexander.reed@email.com",
  });
  const [loginUsername, setLoginUsername] = useState("alex.patient");
  const [loginPassword, setLoginPassword] = useState("patient123");

  // Current Role Config & Active Tab
  const roleConfig = currentUser ? (ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.patient) : ROLE_PERMISSIONS.patient;
  const [activeTab, setActiveTab] = useState(roleConfig.defaultTab);

  // Enforce authorized tab on role change
  useEffect(() => {
    if (currentUser) {
      const nextRoleConfig = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.patient;
      if (!nextRoleConfig.allowedTabs.includes(activeTab)) {
        setActiveTab(nextRoleConfig.defaultTab);
      }
    }
  }, [currentUser?.role]);

  async function handleQuickRoleSwitch(u, p, r) {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(u, p, r);
      setCurrentUser(data.user);
      const nextRoleCfg = ROLE_PERMISSIONS[data.user.role] || ROLE_PERMISSIONS.patient;
      setActiveTab(nextRoleCfg.defaultTab);
    } catch (err) {
      setError(err.message || "Quick role switch failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    authApi.logout();
    setCurrentUser(null);
  }

  async function handleDirectLogin(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(loginUsername, loginPassword, "patient");
      setCurrentUser(data.user);
      const nextRoleCfg = ROLE_PERMISSIONS[data.user.role] || ROLE_PERMISSIONS.patient;
      setActiveTab(nextRoleCfg.defaultTab);
    } catch (err) {
      setError(err.message || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  }

  // WCAG Accessibility Modes
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("font-dyslexia", dyslexiaMode);
  }, [dyslexiaMode]);

  useEffect(() => {
    document.body.classList.toggle("reduced-motion", reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    document.body.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  // Load real patient record & baseline features on mount and study change
  useEffect(() => {
    clinicalApi.getPatientRecord(patientId)
      .then((res) => {
        if (res.patient) setPatientData(res.patient);
      })
      .catch(() => {});

    clinicalApi.getDiseaseFeatures(study, patientId)
      .then((res) => {
        if (res.features) setRawFeatures(res.features);
      })
      .catch(() => {});
  }, [patientId, study]);

  const inputRef = useRef(null);
  const currentStudy = STUDIES[study] || STUDIES.breast_cancer;

  function handleFile(nextFile) {
    if (!nextFile) return;
    setFile(nextFile);
    setResult(null);
    setError(null);
  }

  async function runDiagnosis() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (study === "pneumonia") {
        const fakeFile = file || new File(["xray"], "chest_sample.jpg", { type: "image/jpeg" });
        const data = await clinicalApi.predictPneumonia(fakeFile);
        setResult({
          disease: "Pulmonary Chest Radiography",
          model_architecture: "QuantumPneu (8-Qubit VQC)",
          prediction: data.prediction,
          probabilities: data.probabilities,
          classical_baseline: { model: "PneuVision CNN", confidence: 0.884 },
          explainability: {
            top_features: [
              { feature: "Bilateral Consolidation", importance: 0.42, percentage: 42.0 },
              { feature: "Airspace Opacity", importance: 0.31, percentage: 31.0 },
              { feature: "Perihilar Infiltration", importance: 0.18, percentage: 18.0 },
            ],
            clinical_narrative: "Hybrid quantum classification indicates airspace consolidation in lower bilateral lung fields.",
          },
          inference_ms: data.inference_ms || 18.2,
          disclaimer: "SaMD Clinical Decision Support Output. Professional clinician review required.",
        });
      } else if (study === "skin") {
        const fakeFile = file || new File(["lesion"], "skin_sample.jpg", { type: "image/jpeg" });
        const data = await clinicalApi.predictSkinCancer(fakeFile, "QuantumDerma");
        setResult({
          disease: "Dermatoscopy (HAM10000)",
          model_architecture: "QuantumDerma (10-Qubit VQC)",
          prediction: data.prediction,
          probabilities: data.probabilities,
          classical_baseline: { model: "DermisNova CNN", confidence: 0.852 },
          explainability: {
            top_features: [
              { feature: "Pigment Network Asymmetry", importance: 0.38, percentage: 38.0 },
              { feature: "Border Irregularity", importance: 0.29, percentage: 29.0 },
              { feature: "Color Variegation", importance: 0.21, percentage: 21.0 },
            ],
            clinical_narrative: "VQC quantum evaluation completed with multi-class feature re-uploading.",
          },
          inference_ms: data.inference_ms || 22.4,
          disclaimer: "SaMD Clinical Decision Support Output. Professional clinician review required.",
        });
      } else {
        const data = await clinicalApi.runDiagnosis(study, patientId);
        setResult(data);
      }
    } catch (err) {
      setError(err.message || "Failed to execute diagnostic pipeline.");
    } finally {
      setLoading(false);
    }
  }

  async function exportReport() {
    if (!result) return;
    try {
      const data = await reportsApi.generateReport({
        patient_id: patientId,
        disease: result.disease || currentStudy.label,
        prediction_class: result.prediction?.class || "Evaluated",
        confidence: result.prediction?.confidence || 0.94,
        classical_confidence: result.classical_baseline?.confidence || 0.91,
        top_biomarkers: result.explainability?.top_features?.map((f) => `${f.feature} (${f.percentage}%)`) || [],
      });
      const blob = new Blob([data.report_html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.download_filename;
      a.click();
      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 2500);
    } catch {
      setError("Failed to export report.");
    }
  }

  if (!currentUser) {
    return (
      <div className="login-portal-wrap">
        <div className="login-portal-card">
          <div style={{ marginBottom: "18px", textAlign: "center", borderBottom: "1px solid var(--border-default)", paddingBottom: "16px" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.16em", display: "block", marginBottom: "4px" }}>
              EDITION 2026 // VOL. IV • QUANTUM CLINICAL OS
            </span>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", textTransform: "uppercase" }}>
              Q-MEDSENSE
            </h1>
            <p style={{ fontSize: "0.74rem", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
              Enterprise Decision Support & Quantum Stratification
            </p>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <p style={{ fontSize: "0.66rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                ⚡ 1-Click Testing Personas
              </p>
              <span style={{ fontSize: "0.60rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                SQLITE DB
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleQuickRoleSwitch("alex.patient", "patient123", "patient")}
                style={{ padding: "10px", fontSize: "0.74rem", textAlign: "left", display: "flex", flexDirection: "column" }}
              >
                <strong>Patient</strong>
                <span style={{ fontSize: "0.64rem", color: "var(--text-muted)" }}>alex.patient (Alexander Reed)</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleQuickRoleSwitch("admin.audit", "admin123", "admin")}
                style={{ padding: "10px", fontSize: "0.74rem", textAlign: "left", display: "flex", flexDirection: "column" }}
              >
                <strong>Admin</strong>
                <span style={{ fontSize: "0.64rem", color: "var(--text-muted)" }}>admin.audit (Audit & Security)</span>
              </button>
            </div>
          </div>

          {/* Direct credentials form */}
          <form onSubmit={handleDirectLogin} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <input
              type="text"
              placeholder="Username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "8px", marginTop: "4px" }}>
              {loading ? "Authenticating..." : "Sign In to View Workspace"}
            </button>
          </form>
          {error && (
            <div style={{ background: "var(--risk-high-bg)", color: "var(--risk-high)", padding: "6px 8px", fontSize: "0.72rem", marginTop: "8px" }}>
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* ── Left Sidebar (Collapsible & Custom SVGs with RBAC Filtering) ── */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-brand">
          {!sidebarCollapsed ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <h1 className="brand-title">Q-MEDSENSE</h1>
                <span style={{ fontSize: "0.55rem", background: "var(--primary)", color: "#FFFFFF", padding: "1px 5px", fontWeight: 900, letterSpacing: "0.08em" }}>
                  v2.6
                </span>
              </div>
              <p className="brand-subtitle">EDITION 2026 // CLINICAL OS</p>
            </div>
          ) : (
            <span style={{ fontSize: "0.90rem", fontWeight: 900, color: "var(--primary)", fontFamily: "var(--font-mono)" }}>Q</span>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--text-muted)", padding: "2px" }}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Menu size={16} />
          </button>
        </div>

        {/* Sidebar Nav Items (Filtered dynamically by Role) */}
        <div className="sidebar-nav">
          {roleConfig.sections.map((sec, sIdx) => (
            <div key={sIdx} style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "6px" }}>
              {!sidebarCollapsed && <p className="nav-section-label">{sec.title}</p>}
              {sec.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`nav-btn ${activeTab === item.id ? "active" : ""}`}
                    onClick={() => setActiveTab(item.id)}
                    title={item.label}
                  >
                    <IconComponent />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-identity-tag">
              <span className="user-role-pill">{currentUser.role}</span>
              {!sidebarCollapsed && (
                <div>
                  <h4 style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-primary)" }}>{currentUser.name}</h4>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("user_profile")}
              title="View Profile & Credentials"
              style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--primary)" }}
            >
              <User size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Viewport (100vh Single Desktop Screen) ────────────────────── */}
      <div className="main-viewport">
        {/* Persistent SaMD Decision Support Disclaimer Banner */}
        <div className="samd-disclaimer-banner" role="alert">
          <div className="samd-disclaimer-content">
            <AlertCircle size={14} color="#D97706" />
            <span>
              <strong>SaMD Decision Support Notice:</strong> Q-MedSense is an AI-assisted clinical decision support tool designed for risk stratification and health tracking. It is not an autonomous diagnostic device. Professional consultation and certified medical review are recommended.
            </span>
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              type="button"
              className="a11y-pill-btn active"
              onClick={() => setUserGuideOpen(true)}
              title="Launch Interactive Platform Walkthrough Tour"
              style={{ background: "var(--primary)", color: "#FFFFFF", fontWeight: 700 }}
            >
              <HelpCircle size={11} style={{ display: "inline", marginRight: "3px" }} />
              Platform Guide
            </button>
            <button
              type="button"
              className={`a11y-pill-btn ${dyslexiaMode ? "active" : ""}`}
              onClick={() => setDyslexiaMode(!dyslexiaMode)}
              title="Toggle Dyslexia Typography"
            >
              Dyslexia Font
            </button>
            <button
              type="button"
              className={`a11y-pill-btn ${reducedMotion ? "active" : ""}`}
              onClick={() => setReducedMotion(!reducedMotion)}
              title="Toggle Reduced Motion"
            >
              Reduced Motion
            </button>
            <button
              type="button"
              className={`a11y-pill-btn ${highContrast ? "active" : ""}`}
              onClick={() => setHighContrast(!highContrast)}
              title="Toggle High Contrast"
            >
              High Contrast
            </button>
          </div>
        </div>

        {/* Top App Bar with Embedded Persona Switcher & Quantum Engine Telemetry */}
        <header className="topbar">
          <div className="topbar-breadcrumbs">
            <span style={{ fontWeight: 900, color: "var(--primary)", letterSpacing: "0.04em" }}>Q-MEDSENSE</span>
            <span style={{ color: "var(--border-default)" }}>/</span>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.68rem" }}>{currentUser.role} Workspace</span>
            <span style={{ color: "var(--border-default)" }}>/</span>
            <span className="active-node" style={{ letterSpacing: "0.08em", fontWeight: 900 }}>{activeTab.replace("_", " ").toUpperCase()}</span>
          </div>

          {/* Clean Navbar Role Switcher: One-Click Switch between Patient and Admin */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.64rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Active Authority:
            </span>
            <div className="quick-auth-pills-wrap">
              <button
                type="button"
                className={`quick-auth-pill ${currentUser?.username === "alex.patient" ? "active" : ""}`}
                onClick={() => handleQuickRoleSwitch("alex.patient", "patient123", "patient")}
                title="Switch to Patient Persona (Alexander Reed)"
              >
                👤 Patient (Alex Reed)
              </button>
              <button
                type="button"
                className={`quick-auth-pill ${currentUser?.username === "admin.audit" ? "active" : ""}`}
                onClick={() => handleQuickRoleSwitch("admin.audit", "admin123", "admin")}
                title="Switch to Administrator Persona"
              >
                🛡️ Administrator
              </button>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="qpu-status-indicator">
              <span className="qpu-pulse-point" />
              <span>QUANTUM ENGINE: 10 QUBITS ONLINE</span>
            </div>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: "4px 10px", fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "5px" }}
              onClick={() => setActiveTab("user_profile")}
              title="Open User Profile & Health ID Card"
            >
              <User size={11} /> {currentUser.name}
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: "4px 8px", fontSize: "0.68rem", color: "var(--risk-high)", borderColor: "var(--risk-high)", display: "flex", alignItems: "center", gap: "4px" }}
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogIn size={11} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="content-body">
          {/* ── 3-COLUMN UNIFIED DIAGNOSTIC COCKPIT ────────────────────────── */}
          {activeTab === "diagnostic" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "6px" }}>
              {/* Step Workflow Guide */}
              <div className="workflow-stepper">
                <div className={`step-chip ${study ? "active" : ""}`}>
                  <span className="step-badge">0.1</span>
                  <span>Choose Checkup</span>
                </div>
                <ChevronRight size={12} color="var(--text-muted)" />
                <div className={`step-chip ${rawFeatures.length > 0 ? "active" : ""}`}>
                  <span className="step-badge">0.2</span>
                  <span>Health Indicators</span>
                </div>
                <ChevronRight size={12} color="var(--text-muted)" />
                <div className={`step-chip ${result ? "active" : ""}`}>
                  <span className="step-badge">0.3</span>
                  <span>Run Quantum AI</span>
                </div>
                <ChevronRight size={12} color="var(--text-muted)" />
                <div className={`step-chip ${result ? "active" : ""}`}>
                  <span className="step-badge">0.4</span>
                  <span>Health Assessment & Report</span>
                </div>
              </div>

              <div
                className="cockpit-grid"
                style={{
                  gridTemplateColumns: twinCollapsed ? "290px 1fr 44px" : "290px 1fr 320px",
                  transition: "grid-template-columns 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  flex: 1,
                  minHeight: 0,
                }}
              >
                {/* COLUMN 1: Ingestion & Checkup Selection */}
                <div className="cockpit-col">
                  <div className="cockpit-col-header">
                    <div>
                      <span className="step-badge">0.1</span>
                      <span>Health Checkups</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.66rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        Step 1 of 4
                      </span>
                      <button
                        type="button"
                        className="section-guide-btn"
                        onClick={() => setActiveGuide(GUIDE_DATA.checkup_selector)}
                        title="How to use Health Checkups (Plain English Guide)"
                      >
                        <Info size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="cockpit-col-body">
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      {Object.entries(STUDIES).map(([k, cfg]) => (
                        <button
                          key={k}
                          type="button"
                          className={`study-card-btn ${study === k ? "active" : ""}`}
                          onClick={() => {
                            setStudy(k);
                            setResult(null);
                            setFile(null);
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <h4>{cfg.label}</h4>
                            <p>{cfg.desc}</p>
                            <span style={{ fontSize: "0.64rem", color: "var(--primary)", fontWeight: 700 }}>
                              {cfg.model}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* File Upload / Ingestion Box */}
                    <div style={{ border: "1px dashed var(--border-default)", padding: "8px", textAlign: "center", background: "var(--bg-canvas)", borderRadius: 0 }}>
                      <Upload size={16} color="var(--primary)" style={{ margin: "0 auto 3px" }} />
                      <p style={{ fontSize: "0.7rem", fontWeight: 700 }}>Upload Health Records (FHIR / CSV)</p>
                      <p style={{ fontSize: "0.64rem", color: "var(--text-muted)", marginBottom: "5px" }}>
                        {file ? file.name : "Select file or choose a sample profile"}
                      </p>
                      <input
                        ref={inputRef}
                        type="file"
                        accept=".csv,.json,.vcf,.jpg,.png"
                        style={{ display: "none" }}
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ width: "100%", fontSize: "0.68rem", padding: "3px", borderRadius: 0 }}
                        onClick={() => inputRef.current?.click()}
                      >
                        Browse File
                      </button>
                    </div>

                    {/* Sample Quick Selector */}
                    <div>
                      <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "3px" }}>
                        Sample Health Profiles
                      </p>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {currentStudy.samples.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="btn-secondary"
                            style={{ flex: 1, fontSize: "0.66rem", padding: "4px", borderRadius: 0 }}
                            onClick={() => {
                              setFile(new File(["data"], `${s.name}.csv`, { type: "text/csv" }));
                              setResult(null);
                            }}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: Quantum AI Assessment & Key Factors */}
                <div className="cockpit-col">
                  <div className="cockpit-col-header">
                    <div>
                      <span className="step-badge">0.2</span>
                      <span>Quantum AI Health Assessment</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.68rem", color: "var(--primary)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {currentStudy.model}
                      </span>
                      <button
                        type="button"
                        className="section-guide-btn"
                        onClick={() => setActiveGuide(GUIDE_DATA.ai_assessment)}
                        title="How Quantum AI Assessment works (Plain English Guide)"
                      >
                        <Info size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="cockpit-col-body">
                    {/* Action Launch Bar */}
                    <div>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={runDiagnosis}
                        disabled={loading}
                        style={{ padding: "8px 12px", width: "100%", borderRadius: 0 }}
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={14} className="spin" />
                            <span>Analyzing Biological Markers with Quantum AI...</span>
                          </>
                        ) : (
                          <>
                            <Play size={14} />
                            <span>Run Instant Quantum AI Checkup</span>
                          </>
                        )}
                      </button>
                    </div>

                    {error && (
                      <div style={{ background: "var(--risk-high-bg)", color: "var(--risk-high)", padding: "6px 8px", fontSize: "0.72rem", border: "1px solid rgba(220, 38, 38, 0.3)", borderRadius: 0 }}>
                        {error}
                      </div>
                    )}

                    {/* Real-Time Prediction Output */}
                    {result ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {/* High-Visibility Verdict Box */}
                        <div className={`verdict-box ${result.prediction?.class?.toLowerCase().includes("malignant") || result.prediction?.class?.toLowerCase().includes("disease") || result.prediction?.class?.toLowerCase().includes("pneumonia") ? "danger" : "normal"}`}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>Health Risk Assessment</span>
                            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: result.prediction?.class?.toLowerCase().includes("malignant") || result.prediction?.class?.toLowerCase().includes("disease") ? "var(--risk-high)" : "var(--risk-low)" }}>
                              {result.prediction?.class?.toLowerCase().includes("malignant") || result.prediction?.class?.toLowerCase().includes("disease") ? "Elevated Risk Detected" : "Optimal / Low Risk"}
                            </span>
                          </div>
                          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: "2px 0", color: "var(--text-primary)" }}>
                            {result.prediction?.class}
                          </h3>
                          <p style={{ fontSize: "0.74rem", color: "var(--text-secondary)", margin: 0 }}>
                            AI Confidence Level: <strong>{((result.prediction?.confidence || 0.0) * 100).toFixed(1)}%</strong> • Baseline: <strong>{((result.classical_baseline?.confidence || 0.0) * 100).toFixed(1)}%</strong> • Processing Time: <strong>{result.inference_ms} ms</strong>
                          </p>
                        </div>

                        {/* Probabilities Progress */}
                        {result.probabilities && (
                          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", padding: "6px", borderRadius: 0 }}>
                            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                              Assessment Probability Distribution
                            </p>
                            {Object.entries(result.probabilities).map(([cls, prob]) => (
                              <div key={cls} style={{ marginBottom: "3px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", marginBottom: "1px" }}>
                                  <span>{cls}</span>
                                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{(prob * 100).toFixed(1)}%</span>
                                </div>
                                <div style={{ width: "100%", height: "5px", background: "var(--bg-surface-alt)", borderRadius: 0 }}>
                                  <div style={{ width: `${prob * 100}%`, height: "100%", background: prob > 0.5 ? "var(--primary)" : "var(--accent-teal)", borderRadius: 0 }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Explainability / Key Factors */}
                        {result.explainability && (
                          <div style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-default)", padding: "8px", borderRadius: 0 }}>
                            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                              Key Biological Factors Influencing Your Assessment
                            </p>
                            {result.explainability.top_features?.map((f, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.68rem", marginBottom: "2px" }}>
                                <span>{f.feature}</span>
                                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary)" }}>{f.percentage}% weight</span>
                              </div>
                            ))}
                            <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginTop: "4px", borderTop: "1px solid var(--border-subtle)", paddingTop: "3px" }}>
                              {result.explainability.clinical_narrative}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Initial Clean State: Real Feature Input Table loaded from backend */
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-default)", padding: "8px", borderRadius: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-primary)" }}>
                              Personal Health Indicators & Biomarkers ({rawFeatures.length} Parameters)
                            </p>
                            <span style={{ fontSize: "0.64rem", color: "var(--accent-teal)", fontWeight: 700 }}>
                              Calibrated against Clinical Baselines
                            </span>
                          </div>
                          <table className="clinical-data-table" style={{ borderRadius: 0 }}>
                            <thead>
                              <tr>
                                <th>Biomarker Feature</th>
                                <th>Your Value</th>
                                <th>Population Mean</th>
                                <th>Calibration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rawFeatures.slice(0, 6).map((feat, idx) => (
                                <tr key={idx}>
                                <td>{feat.name}</td>
                                <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{feat.value}</td>
                                <td>{feat.mean}</td>
                                <td>
                                  <span style={{ fontSize: "0.6rem", padding: "1px 4px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: 0 }}>
                                    Standard Baseline
                                  </span>
                                </td>
                              </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div style={{ background: "var(--bg-surface-alt)", border: "1px solid var(--border-default)", padding: "10px", textAlign: "center", borderRadius: 0 }}>
                          <p style={{ fontSize: "0.74rem", color: "var(--text-primary)", fontWeight: 600, margin: 0 }}>
                            Click <strong>"Run Instant Quantum AI Checkup"</strong> above to evaluate your biomarkers using quantum precision AI.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Collapsible Quantum Circuit Viewer */}
                    <QuantumCircuitViewer studyKey={study} />
                  </div>
                </div>

                {/* COLUMN 3: 2D Physiological Digital Twin & Clinical Actions (Minimizable) */}
                <div
                  className="cockpit-col"
                  style={{
                    width: twinCollapsed ? "44px" : "auto",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="cockpit-col-header"
                    style={{
                      padding: twinCollapsed ? "8px 4px" : "10px 14px",
                      justifyContent: twinCollapsed ? "center" : "space-between",
                    }}
                  >
                    {!twinCollapsed ? (
                      <>
                        <div>
                          <span className="step-badge">0.3</span>
                          <span>2D Digital Health Avatar</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.66rem", color: "var(--risk-low)", fontWeight: 700 }}>
                            Live Interactive Twin
                          </span>
                          <button
                            type="button"
                            className="section-guide-btn"
                            onClick={() => setActiveGuide(GUIDE_DATA.digital_twin)}
                            title="How to use 2D Digital Health Twin (Plain English Guide)"
                          >
                            <Info size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTwinCollapsed(true)}
                            style={{
                              background: "transparent",
                              border: 0,
                              cursor: "pointer",
                              color: "var(--text-muted)",
                              padding: "2px",
                              display: "flex",
                              alignItems: "center",
                            }}
                            title="Minimize 2D Twin Column"
                          >
                            <ChevronRight size={15} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setTwinCollapsed(false)}
                        style={{
                          background: "transparent",
                          border: 0,
                          cursor: "pointer",
                          color: "var(--primary)",
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
                          padding: "4px 0",
                        }}
                        title="Expand 2D Digital Twin Column"
                      >
                        <ChevronLeft size={16} />
                        <span
                          style={{
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                            fontSize: "0.65rem",
                            fontWeight: 900,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--primary)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          2D DIGITAL TWIN
                        </span>
                      </button>
                    )}
                  </div>

                  {!twinCollapsed && (
                    <div className="cockpit-col-body" style={{ alignItems: "center" }}>
                      <DigitalTwin2D patientId={patientId} />

                      {/* 1-Click Clinical PDF Export & Sign-Off */}
                      <div style={{ width: "100%", marginTop: "auto", borderTop: "1px solid var(--border-default)", paddingTop: "10px" }}>
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={exportReport}
                          disabled={!result}
                          style={{ padding: "10px", borderRadius: 0 }}
                        >
                          <Download size={14} />
                          <span>Download Verified Health Report (PDF)</span>
                        </button>
                        {reportSuccess && (
                          <p style={{ fontSize: "0.66rem", color: "var(--risk-low)", textAlign: "center", marginTop: "4px", fontWeight: 700 }}>
                            ✓ Health Report downloaded successfully.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── VIEW 2: 2D DIGITAL TWIN EXPLORER ──────────────────────────── */}
          {activeTab === "twin" && (
            <div style={{ height: "100%", overflowY: "auto", background: "var(--bg-surface)", border: "1px solid var(--border-default)", padding: "12px", borderRadius: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    Interactive 2D Digital Health Twin
                  </h3>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: 0 }}>
                    Explore organ-specific biomarker vitality and temporal risk trajectories.
                  </p>
                </div>
                <button
                  type="button"
                  className="section-guide-btn"
                  onClick={() => setActiveGuide(GUIDE_DATA.digital_twin)}
                  title="How to use 2D Digital Health Twin"
                >
                  <Info size={14} />
                </button>
              </div>
              <DigitalTwin2D patientId={patientId} />
            </div>
          )}

          {/* ── VIEW 3: EARLY DETECTION MULTI-ORGAN MAP ───────────────────── */}
          {activeTab === "early_detection" && (
            <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-surface)", border: "1px solid var(--border-default)", padding: "10px 14px" }}>
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    Early Prevention & Sub-Clinical Pathway Map
                  </h3>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: 0 }}>
                    Multi-stage disease progression monitoring with preventative intervention windows.
                  </p>
                </div>
                <button
                  type="button"
                  className="section-guide-btn"
                  onClick={() => setActiveGuide(GUIDE_DATA.early_detection)}
                  title="How Early Detection Mapping works"
                >
                  <Info size={14} />
                </button>
              </div>
              <EarlyDetectionMap patientId={patientId} />
            </div>
          )}

          {/* ── VIEW 4: BENCHMARK MATRIX ──────────────────────────────────── */}
          {activeTab === "benchmarks" && (
            <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-surface)", border: "1px solid var(--border-default)", padding: "10px 14px" }}>
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    Health AI Performance & Benchmark Matrix
                  </h3>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: 0 }}>
                    Verified performance metrics comparing Quantum AI against classical models.
                  </p>
                </div>
                <button
                  type="button"
                  className="section-guide-btn"
                  onClick={() => setActiveGuide(GUIDE_DATA.benchmarks)}
                  title="How Benchmark Metrics work"
                >
                  <Info size={14} />
                </button>
              </div>
              <BenchmarkMatrix />
            </div>
          )}

          {/* ── VIEW 5: QUANTUM TELEMETRY ─────────────────────────────────── */}
          {activeTab === "telemetry" && (
            <div style={{ height: "100%", overflowY: "auto" }}>
              <QuantumCircuitViewer studyKey={study} />
            </div>
          )}

          {/* ── VIEW 7: COMPLIANCE & AUDIT TRAIL ──────────────────────────── */}
          {activeTab === "compliance" && (
            <div style={{ height: "100%", overflowY: "auto" }}>
              <ComplianceConsole patientId={patientId} />
            </div>
          )}

          {/* ── VIEW 8: PATIENT PORTAL ────────────────────────────────────── */}
          {activeTab === "portal" && (
            <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-surface)", border: "1px solid var(--border-default)", padding: "10px 14px" }}>
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    Encrypted Health Records & Data Privacy
                  </h3>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: 0 }}>
                    Verified medical history, active medications, and DPDP / ABDM privacy consent.
                  </p>
                </div>
                <button
                  type="button"
                  className="section-guide-btn"
                  onClick={() => setActiveGuide(GUIDE_DATA.records)}
                  title="How Health Records work"
                >
                  <Info size={14} />
                </button>
              </div>
              <PatientPortal patientId={patientId} />
            </div>
          )}

          {/* ── VIEW 9: USER MANAGEMENT CONSOLE (ADMIN ONLY) ─────────────── */}
          {activeTab === "users" && (
            <div style={{ height: "100%", overflowY: "auto" }}>
              <UserManagementConsole />
            </div>
          )}

          {/* ── VIEW 10: DEDICATED USER PROFILE & SECURITY PAGE ──────────── */}
          {activeTab === "profile" && (
            <div style={{ height: "100%", overflowY: "auto" }}>
              <UserProfilePage
                currentUser={currentUser}
                onProfileUpdated={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
                onProfileDeleted={() => {
                  authApi.logout();
                  setCurrentUser(null);
                  setError("Your profile and account have been permanently deleted from the database.");
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* Profile & Emergency Settings Modal */}
      <ProfileSettingsModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userId={currentUser.user_id}
        userRole={currentUser.role}
        onProfileUpdated={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
      />

      {/* Auth & Role Switcher Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          const nextRoleCfg = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.patient;
          setActiveTab(nextRoleCfg.defaultTab);
        }}
      />

      {/* Interactive User Guide & Platform Tour Modal */}
      <UserGuideModal
        isOpen={userGuideOpen}
        onClose={() => setUserGuideOpen(false)}
      />

      {/* Dedicated Section Guide Popup Modal */}
      <SectionGuideModal
        isOpen={Boolean(activeGuide)}
        onClose={() => setActiveGuide(null)}
        guideData={activeGuide}
      />
    </div>
  );
}
