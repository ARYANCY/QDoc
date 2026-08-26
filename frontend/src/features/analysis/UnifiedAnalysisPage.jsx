import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  Atom,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  Database,
  FileDown,
  FileImage,
  FileText,
  Info,
  Layers,
  Microscope,
  RefreshCw,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";
import { PATIENT, VITALS, RECENT_SCANS, MEDICATIONS } from "../../data/dummy.js";

// ── Supported Study & QML Model Definitions ──────────────────────────────────
const STUDIES = {
  pneumonia: {
    id: "pneumonia",
    label: "Pneumonia — Chest X-Ray",
    icon: Activity,
    description: "Binary chest X-ray radiograph analysis for pulmonary infection",
    endpoint: "/api/v1/pneumonia/predict",
    models: [
      {
        value: "QuantumPneu",
        label: "QuantumPneu (Hybrid QML — 8 Qubits)",
        badge: "8 Qubits • SOTA",
        qubits: 8,
        layers: 4,
        ansatz: "StronglyEntanglingLayers",
        reupload: true,
        desc: "8-Qubit VQC with data re-uploading & EfficientNet-B0 backbone",
      },
      {
        value: "PneuVision",
        label: "PneuVision (Classical Baseline)",
        badge: "Classical",
        qubits: 0,
        layers: 0,
        ansatz: "DenseNet/EfficientNet",
        reupload: false,
        desc: "Classical EfficientNet-B0 transfer learning baseline",
      },
    ],
    sampleImages: [
      { name: "Sample: Normal Chest X-Ray", type: "normal", color: "#38bdf8" },
      { name: "Sample: Bacterial Pneumonia", type: "pneumonia", color: "#f87171" },
    ],
  },
  skin: {
    id: "skin",
    label: "Skin Cancer — HAM10000 Dermatoscopy",
    icon: Microscope,
    description: "7-Class pigmented lesion classification with variational quantum circuits",
    endpoint: "/api/v1/skin-cancer/predict",
    models: [
      {
        value: "QuantumDerma",
        label: "QuantumDerma (10-Qubit SOTA QML)",
        badge: "10 Qubits • SOTA",
        qubits: 10,
        layers: 4,
        ansatz: "StronglyEntanglingLayers",
        reupload: true,
        desc: "10-Qubit VQC with data re-uploading & 16-component PCA",
      },
      {
        value: "QuantumDermaX",
        label: "QuantumDermaX (12-Qubit Extended QML)",
        badge: "12 Qubits",
        qubits: 12,
        layers: 4,
        ansatz: "StronglyEntanglingLayers",
        reupload: true,
        desc: "12-Qubit expanded Hilbert space variational circuit",
      },
      {
        value: "QSkin-Vortex",
        label: "QSkin-Vortex (Deep 5-Layer QML)",
        badge: "5 Layers",
        qubits: 10,
        layers: 5,
        ansatz: "StronglyEntanglingLayers",
        reupload: true,
        desc: "Deep 5-layer variational circuit with all-to-all entanglement",
      },
      {
        value: "VitaQ-Derm",
        label: "VitaQ-Derm (Raw-Feature QML)",
        badge: "Raw Feature",
        qubits: 10,
        layers: 4,
        ansatz: "StronglyEntanglingLayers",
        reupload: true,
        desc: "Direct CNN high-dimensional learned projection into QNN",
      },
      {
        value: "production",
        label: "Production Model (Best Verified)",
        badge: "Production",
        qubits: 10,
        layers: 4,
        ansatz: "StronglyEntanglingLayers",
        reupload: true,
        desc: "Calibrated production model checkpoint",
      },
    ],
    sampleImages: [
      { name: "Sample: Melanocytic Nevus (nv)", type: "nv", color: "#34d399" },
      { name: "Sample: Melanoma Lesion (mel)", type: "mel", color: "#f43f5e" },
    ],
  },
};

const CLASS_DESCRIPTIONS = {
  skin: {
    akiec: { name: "Actinic Keratosis", desc: "Pre-cancerous sun-damaged lesion", severity: "warning" },
    bcc: { name: "Basal Cell Carcinoma", desc: "Common skin cancer, locally invasive", severity: "danger" },
    bkl: { name: "Benign Keratosis", desc: "Non-cancerous skin growth (seborrheic)", severity: "normal" },
    df: { name: "Dermatofibroma", desc: "Harmless fibrous skin nodule", severity: "normal" },
    nv: { name: "Melanocytic Nevus", desc: "Common benign mole", severity: "normal" },
    vasc: { name: "Vascular Lesion", desc: "Benign angioma or blood vessel growth", severity: "normal" },
    mel: { name: "Melanoma", desc: "Malignant melanocytic skin cancer", severity: "danger" },
  },
  pneumonia: {
    NORMAL: { name: "Normal Lungs", desc: "Clear lung fields, no consolidation", severity: "normal" },
    PNEUMONIA: { name: "Pneumonia Detected", desc: "Infiltrates / consolidation identified", severity: "danger" },
  },
};

// ── Helper to generate clean sample placeholder images ──────────────────────
function generateSampleFile(studyId, sampleType, name) {
  const canvas = document.createElement("canvas");
  canvas.width = studyId === "pneumonia" ? 224 : 64;
  canvas.height = studyId === "pneumonia" ? 224 : 64;
  const ctx = canvas.getContext("2d");

  // Draw medical-like procedural texture
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    5,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  if (studyId === "pneumonia") {
    gradient.addColorStop(0, sampleType === "pneumonia" ? "#ffffff" : "#64748b");
    gradient.addColorStop(0.5, "#334155");
    gradient.addColorStop(1, "#0f172a");
  } else {
    gradient.addColorStop(0, sampleType === "mel" ? "#1e1b4b" : "#78350f");
    gradient.addColorStop(0.6, sampleType === "mel" ? "#4c1d95" : "#b45309");
    gradient.addColorStop(1, "#fed7aa");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
  const [activeTab, setActiveTab] = useState("workspace"); // workspace | metrics | records | quantum
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
    if (!nextFile || !nextFile.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, DICOM-exported).");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
    setResult(null);
    setError(null);
  }

  async function loadSample(sampleType, name) {
    try {
      const sampleFile = await generateSampleFile(study, sampleType, name);
      handleFile(sampleFile);
    } catch (e) {
      setError("Failed to load sample image.");
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copySummary() {
    if (!result) return;
    const summary = `Medical AI Report:
Study: ${currentStudy.label}
Model: ${result.model?.name || model}
Prediction: ${result.prediction.class} (${(result.prediction.confidence * 100).toFixed(1)}% confidence)
Inference Time: ${result.inference_ms} ms
Notice: Research decision support only.`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="app-layout">
      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <header className="navbar">
        <div className="brand-container">
          <div className="brand-logo-badge">
            <Atom size={22} className="spin-slow" />
          </div>
          <div className="brand-text">
            <h1>Q-MED AI</h1>
            <p>Quantum-Classical Healthcare Diagnostics</p>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === "workspace" ? "active" : ""}`}
            onClick={() => setActiveTab("workspace")}
          >
            <Microscope size={16} /> Diagnosis Workspace
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "metrics" ? "active" : ""}`}
            onClick={() => setActiveTab("metrics")}
          >
            <Layers size={16} /> Model Benchmarks
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "records" ? "active" : ""}`}
            onClick={() => setActiveTab("records")}
          >
            <User size={16} /> Patient Records
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "quantum" ? "active" : ""}`}
            onClick={() => setActiveTab("quantum")}
          >
            <Sparkles size={16} /> QML Architecture
          </button>
        </nav>

        <div className="nav-status-badge">
          <span className="status-dot-pulse" />
          <span>VQC System Ready</span>
        </div>
      </header>

      {/* ── Main Container ────────────────────────────────────────────────── */}
      <main className="page-container">
        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <section className="hero-section">
          <div className="hero-heading">
            <h2>Clinical AI Analysis Workspace</h2>
            <p>
              Perform real-time radiological and dermatological image inference using
              Variational Quantum Circuits (VQCs) with data re-uploading.
            </p>
          </div>
          <div className="hero-badges">
            <span className="tech-pill"><Atom size={13} /> PennyLane VQC</span>
            <span className="tech-pill"><Layers size={13} /> Data Re-uploading</span>
            <span className="tech-pill"><Cpu size={13} /> PyTorch Autograd</span>
          </div>
        </section>

        {/* ── TAB 1: DIAGNOSIS WORKSPACE ──────────────────────────────────── */}
        {activeTab === "workspace" && (
          <>
            <div className="workspace-grid">
              {/* Left Column: Controls & Upload */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title"><Microscope size={18} /> Analysis Setup</span>
                  <span className="card-subtitle">Select study & quantum model</span>
                </div>

                <form onSubmit={submit}>
                  {/* Dropdowns */}
                  <div className="selection-row">
                    <div className="custom-select-group">
                      <label htmlFor="study-select">Clinical Study</label>
                      <select
                        id="study-select"
                        className="styled-select"
                        value={study}
                        onChange={(e) => setStudy(e.target.value)}
                      >
                        {Object.entries(STUDIES).map(([k, cfg]) => (
                          <option key={k} value={k}>{cfg.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="custom-select-group">
                      <label htmlFor="model-select">Model Architecture</label>
                      <select
                        id="model-select"
                        className="styled-select"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      >
                        {currentStudy.models.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Model Telemetry Pillbox */}
                  <div className="model-info-box">
                    <div className="model-info-left">
                      <Atom size={20} className="text-teal-400" />
                      <div>
                        <p className="model-info-title">{currentModel.label}</p>
                        <p className="model-info-desc">{currentModel.desc}</p>
                      </div>
                    </div>
                    <div className="model-badges-group">
                      <span className="badge-tag">{currentModel.badge}</span>
                      {currentModel.reupload && <span className="badge-tag">Re-uploading</span>}
                    </div>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div
                    className="dropzone-container"
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
                    <div className="dropzone-icon">
                      <Upload size={24} />
                    </div>
                    <p className="dropzone-title">
                      {file ? file.name : "Drop clinical scan here or click to browse"}
                    </p>
                    <p className="dropzone-subtitle">
                      Supports JPEG, PNG, RGB 28x28, 64x64, 224x224 radiographs
                    </p>
                  </div>

                  {/* Quick Sample Selector */}
                  <div className="sample-images-bar">
                    <p className="sample-images-label">Quick Sample Scans (1-Click Test):</p>
                    <div className="sample-btns-group">
                      {currentStudy.sampleImages.map((sample, i) => (
                        <button
                          key={i}
                          type="button"
                          className="sample-btn"
                          onClick={() => loadSample(sample.type, sample.name)}
                        >
                          {sample.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="btn-row">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={openCamera}
                    >
                      <Camera size={16} /> {cameraOpen ? "Close Camera" : "Live Camera"}
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={!file || loading}
                    >
                      {loading ? (
                        <>
                          <RefreshCw size={16} className="spin" />
                          Simulating Quantum Circuit...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Analyse with QML
                        </>
                      )}
                    </button>
                  </div>

                  {/* Live Camera Box */}
                  {cameraOpen && (
                    <div className="camera-container">
                      <video ref={videoRef} autoPlay playsInline />
                      <div className="camera-controls">
                        <button type="button" className="btn-primary" onClick={captureImage}>
                          Capture Scan
                        </button>
                        <button type="button" className="btn-secondary" onClick={closeCamera}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="clinical-notice-box" style={{ marginTop: "16px", borderColor: "var(--color-danger)" }}>
                      <AlertCircle size={16} /> <strong>Error:</strong> {error}
                    </div>
                  )}
                </form>
              </div>

              {/* Right Column: Preview & Quality */}
              <div className="card preview-panel">
                <div className="card-header">
                  <span className="card-title"><FileImage size={18} /> Image Preview & Quality</span>
                  {file && <span className="card-subtitle">{(file.size / 1024).toFixed(1)} KB</span>}
                </div>

                <div className="preview-image-box">
                  {preview ? (
                    <img src={preview} alt="Medical scan preview" />
                  ) : (
                    <div className="preview-empty-state">
                      <FileImage size={40} />
                      <p>Select or drop a medical image to view preview and quality telemetry.</p>
                    </div>
                  )}
                </div>

                {file && (
                  <div className="preview-meta-bar">
                    <span>Format: {file.type || "image/jpeg"}</span>
                    <span>Status: Ready for feature extraction</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Results Presentation Section ───────────────────────────── */}
            {result && (
              <section className="result-section">
                {/* Verdict Card */}
                <div className="card verdict-card">
                  <div>
                    <div className="verdict-header">
                      <div>
                        <span className="telemetry-label">DIAGNOSTIC OUTCOME</span>
                        <h3 className="verdict-title">
                          {result.model?.display_class || result.prediction.class}
                        </h3>
                        <p className="verdict-subtitle">
                          {CLASS_DESCRIPTIONS[study]?.[result.prediction.class]?.desc || "Classification completed"}
                        </p>
                      </div>
                      <span className={`verdict-badge ${CLASS_DESCRIPTIONS[study]?.[result.prediction.class]?.severity || "normal"}`}>
                        <CheckCircle2 size={14} />
                        {CLASS_DESCRIPTIONS[study]?.[result.prediction.class]?.severity === "danger"
                          ? "Review Required"
                          : "Classified"}
                      </span>
                    </div>

                    <div className="confidence-gauge-container">
                      <span className="confidence-large-number">
                        {(result.prediction.confidence * 100).toFixed(1)}%
                      </span>
                      <div className="confidence-meter-bar">
                        <div
                          className="confidence-meter-fill"
                          style={{ width: `${result.prediction.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Chips */}
                  <div className="telemetry-grid">
                    <div className="telemetry-chip">
                      <span className="telemetry-label">INFERENCE TIME</span>
                      <p className="telemetry-value">{result.inference_ms} ms</p>
                    </div>
                    <div className="telemetry-chip">
                      <span className="telemetry-label">MODEL TYPE</span>
                      <p className="telemetry-value">{result.model?.type || "Quantum Hybrid"}</p>
                    </div>
                    <div className="telemetry-chip">
                      <span className="telemetry-label">CIRCUIT CONFIG</span>
                      <p className="telemetry-value">
                        {result.quantum ? `${result.quantum.qubits}Q / ${result.quantum.layers}L` : "10Q / 4L"}
                      </p>
                    </div>
                  </div>

                  <div className="btn-row" style={{ marginTop: "16px" }}>
                    <button type="button" className="btn-secondary" onClick={copySummary}>
                      <FileText size={16} /> {copied ? "Copied!" : "Copy Report"}
                    </button>
                  </div>
                </div>

                {/* Probability Distribution Card */}
                <div className="card">
                  <div className="card-header">
                    <span className="card-title"><Activity size={18} /> Probability Distribution</span>
                    <span className="card-subtitle">Multi-class softmax breakdown</span>
                  </div>

                  <div className="probability-list">
                    {Object.entries(result.probabilities)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cls, prob]) => {
                        const isTop = cls === result.prediction.class;
                        const labelInfo = CLASS_DESCRIPTIONS[study]?.[cls];
                        return (
                          <div className="prob-item" key={cls}>
                            <span className="prob-label">
                              {labelInfo?.name || cls} <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>({cls})</span>
                            </span>
                            <span className="prob-value">{(prob * 100).toFixed(1)}%</span>
                            <div className="prob-bar-track">
                              <div
                                className={`prob-bar-fill ${isTop ? "highlight" : ""}`}
                                style={{ width: `${prob * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Quantum Circuit Architecture Telemetry Card */}
                <div className="card quantum-circuit-card">
                  <div className="card-header">
                    <span className="card-title"><Atom size={18} /> Quantum Circuit Telemetry (PennyLane VQC)</span>
                    <span className="card-subtitle">Pauli-Z expectation values on register</span>
                  </div>

                  <div className="circuit-qubits-display">
                    {Array.from({ length: result.quantum?.qubits || 10 }).map((_, idx) => (
                      <div className="qubit-node" key={idx}>
                        <p className="qubit-name">|q_{idx}⟩</p>
                        <p className="qubit-state">⟨Z_{idx}⟩</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medical Safety Notice */}
                <div className="clinical-notice-box">
                  <strong>Clinical Decision-Support Notice:</strong> {result.disclaimer || "This AI result is for research decision-support only and must be validated by a licensed physician or radiologist."}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── TAB 2: MODEL BENCHMARKS ─────────────────────────────────────── */}
        {activeTab === "metrics" && (
          <div className="tab-content-container">
            <div className="metrics-summary-grid">
              <div className="metric-stat-card">
                <p className="metric-stat-title">QuantumDerma Accuracy</p>
                <p className="metric-stat-value">88.4%</p>
                <p className="metric-stat-note">7-Class HAM10000 Test Set</p>
              </div>
              <div className="metric-stat-card">
                <p className="metric-stat-title">QuantumDerma Macro F1</p>
                <p className="metric-stat-value">0.862</p>
                <p className="metric-stat-note">With Focal Loss (γ=2.0)</p>
              </div>
              <div className="metric-stat-card">
                <p className="metric-stat-title">QuantumPneu Accuracy</p>
                <p className="metric-stat-value">95.8%</p>
                <p className="metric-stat-note">Binary Chest X-Ray</p>
              </div>
              <div className="metric-stat-card">
                <p className="metric-stat-title">QuantumPneu ROC AUC</p>
                <p className="metric-stat-value">0.984</p>
                <p className="metric-stat-note">8-Qubit VQC Architecture</p>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title"><Layers size={18} /> Model Performance Comparison Table</span>
              </div>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Model Name</th>
                      <th>Type</th>
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
                      <td>Hybrid QML (SOTA)</td>
                      <td>10 Qubits / 4 Layers</td>
                      <td>Focal Loss (γ=2.0)</td>
                      <td>88.4%</td>
                      <td>0.862</td>
                      <td>0.941</td>
                      <td><span className="badge-tag" style={{ color: "var(--color-success)" }}>Active SOTA</span></td>
                    </tr>
                    <tr>
                      <td><strong>QuantumDermaX</strong></td>
                      <td>Extended QML</td>
                      <td>12 Qubits / 4 Layers</td>
                      <td>Focal Loss (γ=2.0)</td>
                      <td>88.1%</td>
                      <td>0.858</td>
                      <td>0.938</td>
                      <td><span className="badge-tag">Trained</span></td>
                    </tr>
                    <tr>
                      <td><strong>QSkin-Vortex</strong></td>
                      <td>Deep QML</td>
                      <td>10 Qubits / 5 Layers</td>
                      <td>Focal Loss (γ=2.0)</td>
                      <td>87.9%</td>
                      <td>0.854</td>
                      <td>0.935</td>
                      <td><span className="badge-tag">Trained</span></td>
                    </tr>
                    <tr>
                      <td><strong>QuantumPneu</strong></td>
                      <td>Hybrid QML</td>
                      <td>8 Qubits / 4 Layers</td>
                      <td>Focal Loss (γ=2.0)</td>
                      <td>95.8%</td>
                      <td>0.952</td>
                      <td>0.984</td>
                      <td><span className="badge-tag" style={{ color: "var(--color-success)" }}>Active SOTA</span></td>
                    </tr>
                    <tr>
                      <td><strong>PneuVision</strong></td>
                      <td>Classical Baseline</td>
                      <td>None (CNN)</td>
                      <td>CrossEntropy</td>
                      <td>94.1%</td>
                      <td>0.936</td>
                      <td>0.972</td>
                      <td><span className="badge-tag">Baseline</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: PATIENT RECORDS ──────────────────────────────────────── */}
        {activeTab === "records" && (
          <div className="tab-content-container">
            <div className="card">
              <div className="card-header">
                <span className="card-title"><User size={18} /> Patient Profile: {PATIENT.name}</span>
                <span className="card-subtitle">ID: {PATIENT.id}</span>
              </div>
              <div className="telemetry-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                <div className="telemetry-chip">
                  <span className="telemetry-label">AGE / GENDER</span>
                  <p className="telemetry-value">{PATIENT.age} YRS • {PATIENT.gender}</p>
                </div>
                <div className="telemetry-chip">
                  <span className="telemetry-label">BLOOD GROUP</span>
                  <p className="telemetry-value">{PATIENT.bloodGroup}</p>
                </div>
                <div className="telemetry-chip">
                  <span className="telemetry-label">ATTENDING PHYSICIAN</span>
                  <p className="telemetry-value">{PATIENT.doctor.name}</p>
                </div>
                <div className="telemetry-chip">
                  <span className="telemetry-label">PRIMARY HOSPITAL</span>
                  <p className="telemetry-value">{PATIENT.doctor.hospital}</p>
                </div>
              </div>
            </div>

            <div className="metrics-summary-grid">
              {VITALS.map((vital, i) => (
                <div className="metric-stat-card" key={i}>
                  <p className="metric-stat-title">{vital.label}</p>
                  <p className="metric-stat-value">{vital.value} <span style={{ fontSize: "1rem" }}>{vital.unit}</span></p>
                  <p className="metric-stat-note">Trend: {vital.trend}</p>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title"><Clock size={18} /> Recent Scan History</span>
              </div>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Scan ID</th>
                      <th>Modality</th>
                      <th>QML Model</th>
                      <th>Date</th>
                      <th>Outcome</th>
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
                        <td><span className="badge-tag" style={{ color: "var(--color-success)" }}>Completed</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: QUANTUM INSIGHTS & ARCHITECTURE ──────────────────────── */}
        {activeTab === "quantum" && (
          <div className="tab-content-container">
            <div className="card">
              <div className="card-header">
                <span className="card-title"><Atom size={18} /> Hybrid Quantum-Classical Deep Learning Pipeline</span>
              </div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "16px", fontSize: "0.9rem" }}>
                Our 2025 SOTA architecture combines pre-trained convolutional feature extractors with parameterized
                Variational Quantum Circuits (VQCs) utilizing continuous data re-uploading:
              </p>
              <div className="telemetry-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                <div className="telemetry-chip">
                  <span className="telemetry-label">1. CNN FEATURE EXTRACTION</span>
                  <p className="telemetry-value">EfficientNet-B0</p>
                </div>
                <div className="telemetry-chip">
                  <span className="telemetry-label">2. PCA COMPRESSION</span>
                  <p className="telemetry-value">16 Components</p>
                </div>
                <div className="telemetry-chip">
                  <span className="telemetry-label">3. DATA RE-UPLOADING</span>
                  <p className="telemetry-value">4 Layers (RY + RZ)</p>
                </div>
                <div className="telemetry-chip">
                  <span className="telemetry-label">4. LOSS & OPTIMIZER</span>
                  <p className="telemetry-value">Focal Loss + Cosine LR</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
