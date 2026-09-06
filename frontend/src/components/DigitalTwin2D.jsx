import { useState, useEffect } from "react";
import { Clock, Activity, AlertCircle, CheckCircle2, Shield, Zap, Sparkles, Layers, Info } from "lucide-react";
import { twinApi } from "../api/twin";

export default function DigitalTwin2D({ patientId = "PT-89421" }) {
  const [activeView, setActiveView] = useState("all");
  const [twinState, setTwinState] = useState(null);
  const [visitIdx, setVisitIdx] = useState(1);
  const [selectedOrgan, setSelectedOrgan] = useState({
    id: "heart",
    name: "Cardiovascular / Cardiac System",
    risk_score: 68.0,
    status: "high",
    color: "var(--risk-high)",
    top_biomarker: "Coronary Artery ST-depression: 2.1mm",
    cellular_stage: "Stage I (Pre-clinical Calcification)",
    recommendation: "Lipid panel re-evaluation & echocardiogram within 30 days.",
    quantum_confidence: 0.942,
  });

  useEffect(() => {
    twinApi.getTwinState(patientId, visitIdx, activeView)
      .then((data) => {
        if (data) setTwinState(data);
      })
      .catch(() => {});
  }, [patientId, visitIdx, activeView]);

  const crs = twinState?.composite_risk_score || (visitIdx === 0 ? 22.0 : (visitIdx === 1 ? 52.4 : 78.0));

  const ORGAN_DATA = {
    brain: {
      id: "brain",
      name: "Neurological & Cerebral Cortex",
      risk_score: 14.0,
      status: "low",
      color: "var(--risk-low)",
      top_biomarker: "Cognitive latency: 240ms (Optimal)",
      cellular_stage: "Healthy Physiological Baseline",
      recommendation: "Routine annual neurological screening.",
      quantum_confidence: 0.985,
    },
    lungs: {
      id: "lungs",
      name: "Pulmonary & Respiratory Fields",
      risk_score: 24.0,
      status: "low",
      color: "var(--risk-low)",
      top_biomarker: "SpO2: 98% • Radiographic clearance: Normal",
      cellular_stage: "Clear Bilateral Lung Parenchyma",
      recommendation: "Maintain routine preventative pulmonary care.",
      quantum_confidence: 0.961,
    },
    heart: {
      id: "heart",
      name: "Cardiovascular / Cardiac System",
      risk_score: visitIdx === 0 ? 32.0 : (visitIdx === 1 ? 68.0 : 84.0),
      status: visitIdx === 0 ? "low" : "high",
      color: visitIdx === 0 ? "var(--risk-low)" : "var(--risk-high)",
      top_biomarker: "Coronary ST-depression: 2.1mm • Max HR: 142 bpm",
      cellular_stage: "Stage I (Coronary Plaque Calcification)",
      recommendation: "Lipid panel re-evaluation & echocardiogram within 30 days.",
      quantum_confidence: 0.938,
    },
    breast: {
      id: "breast",
      name: "Breast Tissue / Oncology Quadrant",
      risk_score: visitIdx === 0 ? 18.0 : (visitIdx === 1 ? 72.0 : 91.0),
      status: visitIdx === 0 ? "low" : "high",
      color: visitIdx === 0 ? "var(--risk-low)" : "var(--risk-high)",
      top_biomarker: "Nuclear Radius: 17.93 • Concavity: 0.1472",
      cellular_stage: "Malignant Margin Texture Alert",
      recommendation: "Diagnostic mammography & ultrasound-guided biopsy.",
      quantum_confidence: 0.947,
    },
    liver: {
      id: "liver",
      name: "Hepatic & Metabolic Clearance",
      risk_score: 28.0,
      status: "low",
      color: "var(--risk-low)",
      top_biomarker: "ALT: 24 U/L • AST: 22 U/L • Bilirubin: 0.8 mg/dL",
      cellular_stage: "Normal Hepatic Enzymatic Activity",
      recommendation: "Standard metabolic profile review.",
      quantum_confidence: 0.974,
    },
    pancreas: {
      id: "pancreas",
      name: "Pancreas & Fasting Glycemic Control",
      risk_score: visitIdx === 0 ? 25.0 : 45.0,
      status: "moderate",
      color: "var(--risk-mid)",
      top_biomarker: "Fasting Blood Sugar: 112 mg/dL • HbA1c: 5.8%",
      cellular_stage: "Pre-diabetic Metabolic Syndrome",
      recommendation: "Lifestyle dietary modification & glucose tracking.",
      quantum_confidence: 0.929,
    },
  };

  function selectOrganByKey(key) {
    if (ORGAN_DATA[key]) {
      setSelectedOrgan(ORGAN_DATA[key]);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", height: "100%" }}>
      {/* View Switcher Pills */}
      <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
        {[
          { key: "all", label: "Full Body HUD" },
          { key: "cardio", label: "Cardio" },
          { key: "onco", label: "Oncology" },
          { key: "pulmonary", label: "Pulmonary" },
          { key: "metabolic", label: "Metabolic" },
        ].map((v) => (
          <button
            key={v.key}
            type="button"
            className={`view-pill-btn ${activeView === v.key ? "active" : ""}`}
            style={{ borderRadius: 0, padding: "3px 8px", fontSize: "0.68rem" }}
            onClick={() => setActiveView(v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Composite Risk Score Gauge Header */}
      <div style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-default)", padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Composite Risk Score (CRS)
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem", fontWeight: 800, margin: 0, color: crs > 60 ? "var(--risk-high)" : (crs > 30 ? "var(--risk-mid)" : "var(--risk-low)") }}>
              {crs.toFixed(1)}%
            </h2>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: crs > 60 ? "var(--risk-high)" : (crs > 30 ? "var(--risk-mid)" : "var(--risk-low)") }}>
              {crs > 60 ? "Elevated Risk" : (crs > 30 ? "Moderate Attention" : "Optimal Baseline")}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", display: "block" }}>Anatomical Map</span>
          <span style={{ fontSize: "0.66rem", fontWeight: 700, color: "var(--primary)" }}>6 Systems Monitored</span>
        </div>
      </div>

      {/* Layered Interactive 2D Anatomical SVG with HUD Scan Effect */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", background: "var(--bg-canvas)", border: "1px solid var(--border-default)", padding: "10px", minHeight: "220px" }}>
        <svg
          viewBox="0 0 200 320"
          style={{ width: "160px", height: "220px", overflow: "visible" }}
          role="img"
          aria-label="2D Physiological Digital Twin Human Body Map"
        >
          <defs>
            <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="pulseRed">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="pulseGreen">
              <stop offset="0%" stopColor="#16A34A" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          <line x1="10" y1="50" x2="190" y2="50" stroke="var(--border-subtle)" strokeDasharray="2 2" strokeWidth="0.8" />
          <line x1="10" y1="120" x2="190" y2="120" stroke="var(--border-subtle)" strokeDasharray="2 2" strokeWidth="0.8" />
          <line x1="10" y1="190" x2="190" y2="190" stroke="var(--border-subtle)" strokeDasharray="2 2" strokeWidth="0.8" />
          <line x1="100" y1="10" x2="100" y2="310" stroke="var(--border-subtle)" strokeDasharray="2 2" strokeWidth="0.8" />

          {/* Body Silhouette Anatomy */}
          <g id="silhouette" opacity="0.9">
            {/* Head */}
            <circle cx="100" cy="38" r="20" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
            {/* Neck */}
            <rect x="94" y="58" width="12" height="14" fill="#E2E8F0" />
            {/* Torso */}
            <path
              d="M 66 72 C 66 72, 100 68, 134 72 C 144 88, 140 155, 128 180 C 120 190, 80 190, 72 180 C 60 155, 56 88, 66 72 Z"
              fill="#EDF2F7"
              stroke="#94A3B8"
              strokeWidth="1.2"
            />
            {/* Arms */}
            <path d="M 66 74 C 50 100, 46 140, 40 170" stroke="#CBD5E1" strokeWidth="7" strokeLinecap="round" />
            <path d="M 134 74 C 150 100, 154 140, 160 170" stroke="#CBD5E1" strokeWidth="7" strokeLinecap="round" />
            {/* Legs */}
            <path d="M 84 186 C 84 220, 80 265, 78 305" stroke="#CBD5E1" strokeWidth="9" strokeLinecap="round" />
            <path d="M 116 186 C 116 220, 120 265, 122 305" stroke="#CBD5E1" strokeWidth="9" strokeLinecap="round" />
          </g>

          {/* 🧠 BRAIN HOTSPOT */}
          <g
            style={{ cursor: "pointer" }}
            onClick={() => selectOrganByKey("brain")}
            tabIndex={0}
            role="button"
            aria-label="Neurological Brain Region"
          >
            <circle cx="100" cy="38" r="14" fill="var(--risk-low)" opacity={selectedOrgan.id === "brain" ? 0.4 : 0.2} />
            <circle cx="100" cy="38" r="5" fill="var(--risk-low)" />
          </g>

          {/* 🫁 LUNGS HOTSPOT */}
          <g
            style={{ cursor: "pointer" }}
            onClick={() => selectOrganByKey("lungs")}
            tabIndex={0}
            role="button"
            aria-label="Pulmonary Lungs Region"
          >
            <ellipse cx="84" cy="100" rx="9" ry="14" fill="var(--risk-low)" opacity={selectedOrgan.id === "lungs" ? 0.6 : 0.35} />
            <ellipse cx="116" cy="100" rx="9" ry="14" fill="var(--risk-low)" opacity={selectedOrgan.id === "lungs" ? 0.6 : 0.35} />
          </g>

          {/* 🫀 HEART HOTSPOT (Pulsating) */}
          <g
            style={{ cursor: "pointer" }}
            onClick={() => selectOrganByKey("heart")}
            tabIndex={0}
            role="button"
            aria-label="Cardiovascular Heart Region"
          >
            <circle cx="106" cy="104" r="13" fill="var(--risk-high)" opacity="0.35" className="hotspot-pulse" />
            <path
              d="M 106 98 C 102 94, 96 96, 96 102 C 96 108, 106 114, 106 114 C 106 114, 116 108, 116 102 C 116 96, 110 94, 106 98 Z"
              fill="var(--risk-high)"
            />
          </g>

          {/* 🔬 BREAST / ONCOLOGY HOTSPOT */}
          <g
            style={{ cursor: "pointer" }}
            onClick={() => selectOrganByKey("breast")}
            tabIndex={0}
            role="button"
            aria-label="Breast Oncology Region"
          >
            <circle cx="82" cy="116" r="10" fill="var(--risk-high)" opacity="0.4" className="hotspot-pulse" />
            <circle cx="82" cy="116" r="4" fill="var(--risk-high)" />
          </g>

          {/* 🧬 LIVER HOTSPOT */}
          <g
            style={{ cursor: "pointer" }}
            onClick={() => selectOrganByKey("liver")}
            tabIndex={0}
            role="button"
            aria-label="Hepatic Liver Region"
          >
            <path d="M 110 126 C 122 126, 126 138, 116 142 C 108 142, 106 132, 110 126 Z" fill="var(--risk-low)" opacity={selectedOrgan.id === "liver" ? 0.6 : 0.35} />
          </g>

          {/* 🩺 PANCREAS HOTSPOT */}
          <g
            style={{ cursor: "pointer" }}
            onClick={() => selectOrganByKey("pancreas")}
            tabIndex={0}
            role="button"
            aria-label="Pancreas Metabolic Region"
          >
            <rect x="88" y="142" width="18" height="6" fill="var(--risk-mid)" opacity={selectedOrgan.id === "pancreas" ? 0.8 : 0.45} />
          </g>
        </svg>

        {/* Floating Tooltip Instruction */}
        <div style={{ position: "absolute", bottom: "6px", right: "6px", fontSize: "0.62rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.9)", padding: "2px 6px", border: "1px solid var(--border-subtle)" }}>
          💡 Click any organ hotspot
        </div>
      </div>

      {/* Selected Organ Detail Card */}
      {selectedOrgan && (
        <div style={{ padding: "8px 10px", background: "var(--bg-canvas)", border: "1px solid var(--border-default)", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: "0.78rem", color: "var(--text-primary)" }}>{selectedOrgan.name}</strong>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: selectedOrgan.color, background: "var(--bg-surface)", padding: "1px 6px", border: "1px solid var(--border-default)" }}>
              {selectedOrgan.risk_score}% Anomaly Risk
            </span>
          </div>
          <p style={{ fontSize: "0.70rem", color: "var(--text-secondary)", margin: 0 }}>
            <strong>Biomarkers:</strong> {selectedOrgan.top_biomarker}
          </p>
          <p style={{ fontSize: "0.68rem", color: "var(--primary)", margin: 0, fontWeight: 600 }}>
            <strong>Recommendation:</strong> {selectedOrgan.recommendation}
          </p>
        </div>
      )}

      {/* Timeline Historical & Predictive Scrubber */}
      <div className="twin-timeline-scrubber" style={{ borderRadius: 0, border: "1px solid var(--border-default)", padding: "6px 8px" }}>
        <div className="timeline-scrubber-header" style={{ marginBottom: "2px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.68rem", fontWeight: 700 }}>
            <Clock size={11} /> Temporal Trajectory Scrubber
          </span>
          <span style={{ fontSize: "0.66rem", fontFamily: "var(--font-mono)" }}>
            {visitIdx === 0 ? "Past Baseline" : (visitIdx === 1 ? "Current Visit" : "6-Mo Projection")}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          value={visitIdx}
          onChange={(e) => setVisitIdx(parseInt(e.target.value))}
          className="scrubber-slider"
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.64rem", color: "var(--text-muted)", marginTop: "2px" }}>
          <span style={{ fontWeight: visitIdx === 0 ? 700 : 400, color: visitIdx === 0 ? "var(--primary)" : "inherit" }}>-6 Mo Baseline</span>
          <span style={{ fontWeight: visitIdx === 1 ? 700 : 400, color: visitIdx === 1 ? "var(--primary)" : "inherit" }}>2026-09-06 (Today)</span>
          <span style={{ fontWeight: visitIdx === 2 ? 700 : 400, color: visitIdx === 2 ? "var(--primary)" : "inherit" }}>+6 Mo Quantum Model</span>
        </div>
      </div>
    </div>
  );
}
