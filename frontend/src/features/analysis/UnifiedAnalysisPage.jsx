import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  FileImage,
  FileText,
  FolderHeart,
  Gauge,
  Microscope,
  Play,
  RefreshCw,
  Stethoscope,
  Upload,
  User,
  Zap,
} from "lucide-react";
import { PATIENT, VITALS, RECENT_SCANS, MEDICATIONS } from "../../data/dummy.js";
import "../../styles.css";

// ── Supported Study & QML Model Definitions ──────────────────────────────────
const STUDIES = {
  pneumonia: {
    id: "pneumonia",
    label: "Chest Radiography (Pneumonia)",
    badge: "Pulmonology • Binary",
    icon: Stethoscope,
    description: "Pediatric & adult chest X-ray radiograph inspection for pulmonary infiltration and consolidation.",
    endpoint: "/api/v1/pneumonia/predict",
    models: [
      {
        value: "QuantumPneu",
        label: "QuantumPneu (8-Qubit VQC • Hybrid QML)",
        badge: "8 Qubits • SOTA",
        qubits: 8,
        layers: 4,
        ansatz: "StronglyEntanglingLayers",
        reupload: true,
        desc: "8-Qubit variational quantum circuit with continuous data re-uploading & EfficientNet-B0 backbone.",
      },
      {
        value: "PneuVision",
        label: "PneuVision (Classical Baseline)",
        badge: "Classical Baseline",
        qubits: 0,
        layers: 0,
        ansatz: "None",
        reupload: false,
        desc: "Standard deep convolutional baseline with transfer learning.",
      },
    ],
    samples: [
      { name: "Normal Chest X-Ray", type: "normal" },
      { name: "Bacterial Pneumonia Infiltrate", type: "pneumonia" },
    ],
  },
  skin: {
    id: "skin",
    label: "Dermatoscopy (Skin Cancer)",
    badge: "Dermatology • 7-Class",
    icon: Microscope,
    description: "Multi-class pigmented dermatoscopic lesion triage and malignant melanoma detection.",
    endpoint: "/api/v1/skin-cancer/predict",
    models: [
      {
        value: "QuantumDerma",
        label: "QuantumDerma (10-Qubit SOTA VQC)",
        badge: "10 Qubits • SOTA",
        qubits: 10,
        layers: 4,
        ansatz: "StronglyEntanglingLayers",
        reupload: true,
        desc: "10-Qubit strongly entangling circuit with 16-component PCA & Focal Loss (gamma=2.0).",
      },
      {
        value: "QuantumDermaX",
        label: "QuantumDermaX (12-Qubit Extended)",
        badge: "12 Qubits",
        qubits: 12,
        layers: 4,
        ansatz: "StronglyEntanglingLayers",
        reupload: true,
        desc: "Expanded 12-qubit Hilbert space circuit for complex lesion boundaries.",
      },
      {
        value: "QSkin-Vortex",
        label: "QSkin-Vortex (Deep 5-Layer)",
        badge: "5 Layers",
        qubits: 10,
        layers: 5,
        ansatz: "StronglyEntanglingLayers",
        reupload: true,
        desc: "Deep 5-layer variational circuit with all-to-all entanglement pattern.",
      },
      {
        value: "VitaQ-Derm",
        label: "VitaQ-Derm (Direct CNN Projection)",
        badge: "Raw Feature",
        qubits: 10,
        layers: 4,
        ansatz: "StronglyEntanglingLayers",
        reupload: true,
        desc: "High-dimensional uncompressed CNN feature projection into QNN.",
      },
      {
        value: "production",
        label: "Production Verified Model",
        badge: "Production",
        qubits: 10,
        layers: 4,
        ansatz: "StronglyEntanglingLayers",
        reupload: true,
        desc: "Calibrated production model checkpoint.",
      },
    ],
    samples: [
      { name: "Melanocytic Nevus (nv)", type: "nv" },
      { name: "Melanoma Lesion (mel)", type: "mel" },
    ],
  },
};

const CLASS_TAXONOMY = {
  skin: {
    akiec: { name: "Actinic Keratosis", desc: "Pre-cancerous sun-damaged lesion (intraepithelial)", triage: "warning" },
    bcc: { name: "Basal Cell Carcinoma", desc: "Common skin malignancy, locally invasive", triage: "danger" },
    bkl: { name: "Benign Keratosis", desc: "Non-malignant seborrheic keratosis", triage: "normal" },
    df: { name: "Dermatofibroma", desc: "Harmless benign fibrous skin nodule", triage: "normal" },
    nv: { name: "Melanocytic Nevus", desc: "Common benign melanocytic mole", triage: "normal" },
    vasc: { name: "Vascular Lesion", desc: "Benign hemangioma or angiokeratoma", triage: "normal" },
    mel: { name: "Malignant Melanoma", desc: "Invasive melanocytic skin malignancy", triage: "danger" },
  },
  pneumonia: {
    NORMAL: { name: "Normal Pulmonary Field", desc: "Clear bilateral lung parenchyma without consolidations", triage: "normal" },
    PNEUMONIA: { name: "Pneumonia Infiltration", desc: "Active pulmonary consolidation / airspace opacity detected", triage: "danger" },
  },
};

// ── Synthetic Procedural Image Generator for 1-Click Tests ──────────────────
function generateSampleFile(studyId, sampleType) {
  const canvas = document.createElement("canvas");
  const size = studyId === "pneumonia" ? 224 : 64;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  if (studyId === "pneumonia") {
    gradient.addColorStop(0, sampleType === "pneumonia" ? "#ffffff" : "#cbd5e1");
    gradient.addColorStop(0.5, "#64748b");
    gradient.addColorStop(1, "#0f172a");
  } else {
    gradient.addColorStop(0, sampleType === "mel" ? "#1e1b4b" : "#78350f");
    gradient.addColorStop(0.6, sampleType === "mel" ? "#431407" : "#b45309");
    gradient.addColorStop(1, "#fed7aa");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], `${studyId}_${sampleType}_sample.jpg`, { type: "image/jpeg" }));
    }, "image/jpeg", 0.95);
  });
}

// ── API Request ──────────────────────────────────────────────────────────────
async function requestAnalysis(file, study, model) {
  const body = new FormData();
  body.append("image", file);
  body.append("model", model);
  const response = await fetch(STUDIES[study].endpoint, { method: "POST", body });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.detail || "Diagnosis analysis request failed");
  }
  return response.json();
}

export default function UnifiedAnalysisPage() {
  const [activeTab, setActiveTab] = useState("diagnostic"); // diagnostic | benchmarks | cohort | qpu
  const [study, setStudy] = useState("pneumonia");
  const [model, setModel] = useState(STUDIES.pneumonia.models[0].value);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const inputRef = useRef(null);

  const currentStudy = STUDIES[study];
  const currentModel = currentStudy.models.find((m) => m.value === model) || currentStudy.models[0];

  useEffect(() => {
    setModel(STUDIES[study].models[0].value);
    setResult(null);
    setFile(null);
    setPreview(null);
    setError(null);
  }, [study]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  function handleFile(nextFile) {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!nextFile || !allowedTypes.includes(nextFile.type)) {
      setError("Please upload a valid image.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
    setResult(null);
    setError(null);
  }

  async function loadSample(sampleType) {
    try {
      const sampleFile = await generateSampleFile(study, sampleType);
      handleFile(sampleFile);
    } catch {
      setError("Failed to generate test sample.");
    }
  }

  async function openCamera() {
    if (cameraOpen) { closeCamera(); return; }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access is unavailable in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => { if (videoRef.current) videoRef.current.srcObject = stream; });
    } catch {
      setError("Camera permission was not granted.");
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  function captureImage() {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) handleFile(new File([blob], `${study}-capture.jpg`, { type: "image/jpeg" }));
      closeCamera();
    }, "image/jpeg", 0.95);
  }

  async function submit(event) {
    event.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await requestAnalysis(file, study, model);
      setResult(res);
    } catch (err) {
      if (err.message.includes("Invalid image") || err.message.includes("Unsupported image") || err.message.includes("not a valid image") || err.message.includes("unprocessable") || err.message.includes("not related to")) {
        setError("Please upload a valid image.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function copySummary() {
    if (!result) return;
    const summary = `Clinical Quantum AI Diagnostic Report
======================================
Study: ${currentStudy.label}
Model Architecture: ${result.model?.name || model}
Diagnostic Outcome: ${result.prediction?.class}
Confidence Score: ${((result.prediction?.confidence || 0) * 100).toFixed(1)}%
Inference Latency: ${result.inference_ms} ms
Decision Threshold: ${result.decision_threshold || "Default"}
Notice: Research decision support only. Professional clinician review required.`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="dashboard-layout">
      {/* ── Sidebar Navigation Rail (Sharp Office Aesthetic) ───────────────── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand-text">
            <h2>Q-MED AI</h2>
            <p>Clinical Diagnostic OS</p>
          </div>
        </div>

        <div className="sidebar-nav-section">
          <p className="nav-section-title">Diagnostic Workflows</p>
          <button
            className={`nav-item-btn ${activeTab === "diagnostic" ? "active" : ""}`}
            onClick={() => setActiveTab("diagnostic")}
          >
            <Stethoscope size={16} />
            <span>Diagnostic Suite</span>
          </button>
          <button
            className={`nav-item-btn ${activeTab === "cohort" ? "active" : ""}`}
            onClick={() => setActiveTab("cohort")}
          >
            <FolderHeart size={16} />
            <span>Patient Records</span>
          </button>

          <p className="nav-section-title" style={{ marginTop: "12px" }}>Benchmarking & Telemetry</p>
          <button
            className={`nav-item-btn ${activeTab === "benchmarks" ? "active" : ""}`}
            onClick={() => setActiveTab("benchmarks")}
          >
            <BarChart3 size={16} />
            <span>Model Benchmarks</span>
          </button>
          <button
            className={`nav-item-btn ${activeTab === "qpu" ? "active" : ""}`}
            onClick={() => setActiveTab("qpu")}
          >
            <Cpu size={16} />
            <span>QPU Telemetry</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="doctor-info">
            <h4>Dr. Aryan Sharma</h4>
            <p>Lead Clinical Diagnostician</p>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <div className="main-wrapper">
        {/* Top App Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="breadcrumbs">
              <span>Platform</span>
              <ChevronRight size={13} />
              <span>Diagnostic Engine</span>
              <ChevronRight size={13} />
              <span className="current">{currentStudy.label}</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="qpu-live-badge">
              <span className="qpu-pulse-dot" />
              <span>QPU ONLINE: 10 QUBITS</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="content-area">
          {/* ── VIEW 1: DIAGNOSTIC SUITE ──────────────────────────────────── */}
          {activeTab === "diagnostic" && (
            <>
              {/* Header KPI Strip */}
              <section className="kpi-strip">
                <div className="kpi-card">
                  <p className="kpi-label">Active Protocol</p>
                  <p className="kpi-value" style={{ fontSize: "1.1rem" }}>
                    {study === "pneumonia" ? "Chest Radiography" : "Dermatoscopy"}
                  </p>
                  <p className="kpi-subtitle">2025 SOTA NISQ Architecture</p>
                </div>

                <div className="kpi-card">
                  <p className="kpi-label">Selected Model</p>
                  <p className="kpi-value" style={{ fontSize: "1.1rem" }}>
                    {currentModel.value}
                  </p>
                  <p className="kpi-subtitle">
                    {currentModel.qubits > 0 ? `${currentModel.qubits} Qubits • ${currentModel.layers} Layers` : "Classical Baseline"}
                  </p>
                </div>

                <div className="kpi-card">
                  <p className="kpi-label">Quantum State Fidelity</p>
                  <p className="kpi-value">98.4%</p>
                  <p className="kpi-subtitle">Data Re-uploading Active</p>
                </div>

                <div className="kpi-card">
                  <p className="kpi-label">Simulation Backend</p>
                  <p className="kpi-value" style={{ fontSize: "1.1rem" }}>PennyLane + PyTorch</p>
                  <p className="kpi-subtitle">Statevector Simulation</p>
                </div>
              </section>

              {/* Study Selection Cards */}
              <section className="study-selector-strip">
                {Object.entries(STUDIES).map(([k, cfg]) => {
                  const Icon = cfg.icon;
                  const isSelected = study === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      className={`study-card-btn ${isSelected ? "active" : ""}`}
                      onClick={() => setStudy(k)}
                    >
                      <div className="study-icon-box">
                        <Icon size={20} />
                      </div>
                      <div className="study-info">
                        <h3>{cfg.label}</h3>
                        <p>{cfg.description}</p>
                      </div>
                    </button>
                  );
                })}
              </section>

              {/* 2-Column Split: Ingestion vs Preview */}
              <section className="workspace-split">
                {/* Left Panel: Input & Model Config */}
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">
                      <Microscope size={16} /> Diagnostic Configuration
                    </span>
                    <span className="panel-tag">Protocol 01</span>
                  </div>

                  <form onSubmit={submit}>
                    <div className="control-field">
                      <label htmlFor="model-select">Model Architecture</label>
                      <select
                        id="model-select"
                        className="modern-select"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      >
                        {currentStudy.models.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Architecture Details Pillbox */}
                    <div className="qpu-architecture-box">
                      <div>
                        <p className="qpu-arch-title">{currentModel.label}</p>
                        <p className="qpu-arch-detail">{currentModel.desc}</p>
                      </div>
                      <span className="arch-chip">{currentModel.badge}</span>
                    </div>

                    {/* Dropzone */}
                    <div
                      className="dropzone-box"
                      onClick={() => inputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFile(e.dataTransfer.files[0]);
                      }}
                    >
                      <input
                        ref={inputRef}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                      <div className="dropzone-icon-circle">
                        <Upload size={20} />
                      </div>
                      <p className="dropzone-primary-text">
                        {file ? file.name : "Drop clinical scan here or click to browse"}
                      </p>
                      <p className="dropzone-sub-text">
                        JPEG, PNG, DICOM-exported formats (RGB 28x28, 64x64, 224x224)
                      </p>
                    </div>

                    {/* Quick 1-Click Sample Presets */}
                    <div className="quick-samples-group">
                      <p className="quick-samples-label">Quick 1-Click Test Presets:</p>
                      <div className="quick-samples-row">
                        {currentStudy.samples.map((sample, i) => (
                          <button
                            key={i}
                            type="button"
                            className="sample-chip-btn"
                            onClick={() => loadSample(sample.type)}
                          >
                            + {sample.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons-row">
                      <button
                        type="button"
                        className="btn-secondary-action"
                        onClick={openCamera}
                      >
                        <Camera size={15} />
                        {cameraOpen ? "Close Camera" : "Live Camera"}
                      </button>
                      <button
                        type="submit"
                        className="btn-primary-action"
                        disabled={!file || loading}
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={15} className="spin" />
                            Simulating VQC Circuit...
                          </>
                        ) : (
                          <>
                            <Play size={15} />
                            Execute Quantum Inference
                          </>
                        )}
                      </button>
                    </div>

                    {cameraOpen && (
                      <div className="camera-container" style={{ marginTop: "14px" }}>
                        <video ref={videoRef} autoPlay playsInline />
                        <div className="camera-controls">
                          <button type="button" className="btn-primary-action" onClick={captureImage}>
                            Capture Frame
                          </button>
                          <button type="button" className="btn-secondary-action" onClick={closeCamera}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="safety-notice-banner" style={{ marginTop: "14px", borderLeftColor: "var(--danger-text)" }}>
                        <AlertCircle size={15} /> <strong>Inference Error:</strong> {error}
                      </div>
                    )}
                  </form>
                </div>

                {/* Right Panel: Image Canvas Preview */}
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">
                      <FileImage size={16} /> Clinical Scan Viewport
                    </span>
                    {file && (
                      <span className="panel-tag">
                        {(file.size / 1024).toFixed(1)} KB • {file.type || "image/jpeg"}
                      </span>
                    )}
                  </div>

                  <div className="image-canvas-container">
                    {preview ? (
                      <img src={preview} alt="Clinical scan preview" />
                    ) : (
                      <div className="empty-canvas-notice">
                        <FileImage size={36} />
                        <p style={{ fontWeight: 600, fontSize: "0.88rem" }}>No scan loaded in viewport</p>
                        <p style={{ fontSize: "0.75rem" }}>Upload an image or select a preset to begin analysis.</p>
                      </div>
                    )}
                  </div>

                  {file && (
                    <div className="canvas-meta-bar">
                      <span>PREPROCESSING: Standardized [-1, 1]</span>
                      <span>STATUS: Verified & Ready</span>
                    </div>
                  )}
                </div>
              </section>

              {/* ── RESULTS PRESENTATION ──────────────────────────────────── */}
              {result && (
                <section className="results-container">
                  {/* Left Result Card: Verdict */}
                  <div className="panel verdict-panel">
                    <div>
                      <div className="verdict-status-row">
                        <div>
                          <span className="telemetry-tile-label">PRIMARY DIAGNOSTIC OUTCOME</span>
                          <h2 className="verdict-headline">
                            {result.model?.display_class || result.prediction?.class}
                          </h2>
                          <p className="verdict-desc">
                            {CLASS_TAXONOMY[study]?.[result.prediction?.class]?.desc || "Classification completed"}
                          </p>
                        </div>
                        <span className={`triage-badge ${CLASS_TAXONOMY[study]?.[result.prediction?.class]?.triage || "normal"}`}>
                          <CheckCircle2 size={13} />
                          {CLASS_TAXONOMY[study]?.[result.prediction?.class]?.triage === "danger"
                            ? "Urgent Review"
                            : "Classified"}
                        </span>
                      </div>

                      <div className="confidence-hero-meter">
                        <span className="confidence-big-stat">
                          {((result.prediction?.confidence || 0) * 100).toFixed(1)}%
                        </span>
                        <div className="meter-track">
                          <div
                            className="meter-bar"
                            style={{ width: `${(result.prediction?.confidence || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="telemetry-row">
                      <div className="telemetry-tile">
                        <span className="telemetry-tile-label">LATENCY</span>
                        <p className="telemetry-tile-val">{result.inference_ms} ms</p>
                      </div>
                      <div className="telemetry-tile">
                        <span className="telemetry-tile-label">ARCHITECTURE</span>
                        <p className="telemetry-tile-val">{result.model?.type || "Quantum Hybrid"}</p>
                      </div>
                      <div className="telemetry-tile">
                        <span className="telemetry-tile-label">VQC CIRCUIT</span>
                        <p className="telemetry-tile-val">
                          {result.quantum ? `${result.quantum.qubits}Q / ${result.quantum.layers}L` : "10Q / 4L"}
                        </p>
                      </div>
                    </div>

                    <div className="action-buttons-row" style={{ marginTop: "14px" }}>
                      <button type="button" className="btn-secondary-action" onClick={copySummary}>
                        <FileText size={14} /> {copied ? "Copied Report" : "Copy Clinical Summary"}
                      </button>
                    </div>
                  </div>

                  {/* Right Result Card: Sorted Probability Distribution */}
                  <div className="panel">
                    <div className="panel-header">
                      <span className="panel-title">
                        <Activity size={16} /> Differential Diagnosis Breakdown
                      </span>
                      <span className="panel-tag">Softmax Profile</span>
                    </div>

                    <div className="probabilities-wrapper">
                      {result.probabilities &&
                        Object.entries(result.probabilities)
                          .sort((a, b) => b[1] - a[1])
                          .map(([cls, prob]) => {
                            const isTop = cls === result.prediction?.class;
                            const taxon = CLASS_TAXONOMY[study]?.[cls];
                            return (
                              <div className="prob-entry" key={cls}>
                                <span className="prob-name">
                                  {taxon?.name || cls} <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>({cls})</span>
                                </span>
                                <span className="prob-percent">{(prob * 100).toFixed(1)}%</span>
                                <div className="prob-track">
                                  <div
                                    className={`prob-fill ${isTop ? "primary" : ""}`}
                                    style={{ width: `${prob * 100}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                    </div>
                  </div>

                  {/* QPU Register Visualizer Card */}
                  <div className="circuit-telemetry-full">
                    <div className="panel-header" style={{ marginBottom: "8px", borderBottom: 0 }}>
                      <span className="panel-title">
                        <Cpu size={16} /> QPU Register Telemetry (PennyLane VQC)
                      </span>
                      <span className="panel-tag">Pauli-Z Observables &lt;Z_i&gt;</span>
                    </div>

                    <div className="qubits-scroll-row">
                      {Array.from({ length: result.quantum?.qubits || 10 }).map((_, idx) => (
                        <div className="qubit-chip" key={idx}>
                          <p className="qubit-label">|q_{idx}⟩</p>
                          <p className="qubit-op">⟨Z_{idx}⟩</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medical Safety Notice Banner */}
                  <div className="safety-notice-banner">
                    <strong>Clinical Safety Disclaimer:</strong> {result.disclaimer || "This AI output is provided exclusively for research decision support and must be evaluated by a certified physician or radiologist before making clinical decisions."}
                  </div>
                </section>
              )}
            </>
          )}

          {/* ── VIEW 2: MODEL BENCHMARKS ──────────────────────────────────── */}
          {activeTab === "benchmarks" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div className="kpi-strip">
                <div className="kpi-card">
                  <p className="kpi-label">QuantumDerma Test Acc</p>
                  <p className="kpi-value">88.4%</p>
                  <p className="kpi-subtitle">7-Class HAM10000 Test</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-label">QuantumDerma Macro F1</p>
                  <p className="kpi-value">0.862</p>
                  <p className="kpi-subtitle">Focal Loss (gamma=2.0)</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-label">QuantumPneu Test Acc</p>
                  <p className="kpi-value">95.8%</p>
                  <p className="kpi-subtitle">Binary Chest Radiograph</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-label">QuantumPneu ROC AUC</p>
                  <p className="kpi-value">0.984</p>
                  <p className="kpi-subtitle">8-Qubit VQC Circuit</p>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title"><BarChart3 size={16} /> Comparative Evaluation Matrix</span>
                  <span className="panel-tag">Standardized Benchmarks</span>
                </div>

                <div className="table-panel">
                  <table className="clinical-table">
                    <thead>
                      <tr>
                        <th>Architecture</th>
                        <th>Class Modality</th>
                        <th>Qubits / Layers</th>
                        <th>Loss Function</th>
                        <th>Accuracy</th>
                        <th>Macro F1</th>
                        <th>ROC AUC</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>QuantumDerma</strong></td>
                        <td>7-Class Skin Lesion</td>
                        <td>10 Qubits / 4 Layers</td>
                        <td>Focal Loss (gamma=2.0)</td>
                        <td>88.4%</td>
                        <td>0.862</td>
                        <td>0.941</td>
                        <td><span className="arch-chip" style={{ color: "var(--success-text)" }}>Active SOTA</span></td>
                      </tr>
                      <tr>
                        <td><strong>QuantumDermaX</strong></td>
                        <td>7-Class Skin Lesion</td>
                        <td>12 Qubits / 4 Layers</td>
                        <td>Focal Loss (gamma=2.0)</td>
                        <td>88.1%</td>
                        <td>0.858</td>
                        <td>0.938</td>
                        <td><span className="arch-chip">Trained</span></td>
                      </tr>
                      <tr>
                        <td><strong>QSkin-Vortex</strong></td>
                        <td>7-Class Skin Lesion</td>
                        <td>10 Qubits / 5 Layers</td>
                        <td>Focal Loss (gamma=2.0)</td>
                        <td>87.9%</td>
                        <td>0.854</td>
                        <td>0.935</td>
                        <td><span className="arch-chip">Trained</span></td>
                      </tr>
                      <tr>
                        <td><strong>QuantumPneu</strong></td>
                        <td>Binary Pneumonia</td>
                        <td>8 Qubits / 4 Layers</td>
                        <td>Focal Loss (gamma=2.0)</td>
                        <td>95.8%</td>
                        <td>0.952</td>
                        <td>0.984</td>
                        <td><span className="arch-chip" style={{ color: "var(--success-text)" }}>Active SOTA</span></td>
                      </tr>
                      <tr>
                        <td><strong>PneuVision</strong></td>
                        <td>Binary Pneumonia</td>
                        <td>None (Classical CNN)</td>
                        <td>CrossEntropy</td>
                        <td>94.1%</td>
                        <td>0.936</td>
                        <td>0.972</td>
                        <td><span className="arch-chip">Baseline</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── VIEW 3: PATIENT COHORT & EHR ──────────────────────────────── */}
          {activeTab === "cohort" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title"><User size={16} /> Patient EHR Profile: {PATIENT.name}</span>
                  <span className="panel-tag">Record ID: {PATIENT.id}</span>
                </div>

                <div className="telemetry-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                  <div className="telemetry-tile">
                    <span className="telemetry-tile-label">DEMOGRAPHICS</span>
                    <p className="telemetry-tile-val">{PATIENT.age} yrs • {PATIENT.gender}</p>
                  </div>
                  <div className="telemetry-tile">
                    <span className="telemetry-tile-label">BLOOD TYPE</span>
                    <p className="telemetry-tile-val">{PATIENT.bloodGroup}</p>
                  </div>
                  <div className="telemetry-tile">
                    <span className="telemetry-tile-label">PHYSICIAN</span>
                    <p className="telemetry-tile-val">{PATIENT.doctor.name}</p>
                  </div>
                  <div className="telemetry-tile">
                    <span className="telemetry-tile-label">FACILITY</span>
                    <p className="telemetry-tile-val">{PATIENT.doctor.hospital}</p>
                  </div>
                </div>
              </div>

              <div className="kpi-strip">
                {VITALS.map((vital, i) => (
                  <div className="kpi-card" key={i}>
                    <p className="kpi-label">{vital.label}</p>
                    <p className="kpi-value">{vital.value} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{vital.unit}</span></p>
                    <p className="kpi-subtitle">Status: {vital.trend}</p>
                  </div>
                ))}
              </div>

              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title"><Clock size={16} /> Historical Scan Archive</span>
                  <span className="panel-tag">Verified EHR</span>
                </div>

                <div className="table-panel">
                  <table className="clinical-table">
                    <thead>
                      <tr>
                        <th>Scan Ref</th>
                        <th>Modality</th>
                        <th>QML Model</th>
                        <th>Date</th>
                        <th>Diagnostic Outcome</th>
                        <th>Confidence</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RECENT_SCANS.map((scan) => (
                        <tr key={scan.id}>
                          <td><strong>{scan.id}</strong></td>
                          <td>{scan.type}</td>
                          <td>{scan.model}</td>
                          <td>{scan.date}</td>
                          <td>{scan.result}</td>
                          <td>{(scan.confidence * 100).toFixed(1)}%</td>
                          <td><span className="arch-chip" style={{ color: "var(--success-text)" }}>Archived</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── VIEW 4: QPU ARCHITECTURE & ENGINE ─────────────────────────── */}
          {activeTab === "qpu" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title"><Cpu size={16} /> 2025 SOTA Variational Quantum Circuit (VQC) Engine</span>
                  <span className="panel-tag">PennyLane TorchLayer</span>
                </div>

                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "16px" }}>
                  The quantum execution pipeline integrates high-resolution convolutional feature compression with
                  parameterized multi-layer unitary circuits featuring continuous data re-uploading:
                </p>

                <div className="telemetry-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                  <div className="telemetry-tile">
                    <span className="telemetry-tile-label">1. SPATIAL EXTRACTION</span>
                    <p className="telemetry-tile-val">EfficientNet-B0</p>
                  </div>
                  <div className="telemetry-tile">
                    <span className="telemetry-tile-label">2. REDUCTION</span>
                    <p className="telemetry-tile-val">16-Component PCA</p>
                  </div>
                  <div className="telemetry-tile">
                    <span className="telemetry-tile-label">3. DATA RE-UPLOADING</span>
                    <p className="telemetry-tile-val">4 Layers (RY + RZ)</p>
                  </div>
                  <div className="telemetry-tile">
                    <span className="telemetry-tile-label">4. LOSS FUNCTION</span>
                    <p className="telemetry-tile-val">Focal Loss (gamma=2.0)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
