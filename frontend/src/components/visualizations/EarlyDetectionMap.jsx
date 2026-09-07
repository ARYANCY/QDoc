import { useState, useEffect, useRef } from "react";
import { Compass, ShieldAlert, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { earlyDetectionApi } from "../../api/earlyDetection";
import { animateEntrance, animateCardStagger } from "../../utils/motion";

export default function EarlyDetectionMap({ patientId = "PT-89421" }) {
  const containerRef = useRef(null);
  const [selectedDisease, setSelectedDisease] = useState("breast_cancer");
  const [pathway, setPathway] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    earlyDetectionApi.getPathway(selectedDisease)
      .then((res) => setPathway(res))
      .catch(() => {})
      .finally(() => setLoading(false));

    if (containerRef.current) {
      animateEntrance(containerRef.current, { y: 15, duration: 0.35 });
    }
  }, [selectedDisease]);

  const stages = pathway?.stages || [];

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%", overflowY: "auto", padding: "6px" }}>
      {/* Disease Pathway Selector */}
      <div style={{ display: "flex", gap: "6px" }}>
        {[
          { key: "breast_cancer", label: "Breast Oncology Progression" },
          { key: "cardiovascular", label: "Cardiovascular Ischemia" },
          { key: "diabetes", label: "Metabolic Syndrome & Diabetes" },
        ].map((d) => (
          <button
            key={d.key}
            type="button"
            className={`btn-secondary ${selectedDisease === d.key ? "active" : ""}`}
            style={{
              padding: "6px 12px",
              background: selectedDisease === d.key ? "var(--primary)" : "var(--bg-surface)",
              color: selectedDisease === d.key ? "#fff" : "var(--text-secondary)",
              borderColor: selectedDisease === d.key ? "var(--primary)" : "var(--border-default)",
              fontWeight: selectedDisease === d.key ? 700 : 500,
            }}
            onClick={() => setSelectedDisease(d.key)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Pathway Header KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "8px" }}>
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", padding: "10px" }}>
          <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Disease & Organ System</p>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>{pathway?.disease_name}</h3>
          <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{pathway?.organ_system}</p>
        </div>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", padding: "10px" }}>
          <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Early Detection Window</p>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--primary)", fontFamily: "var(--font-mono)" }}>
            {pathway?.early_detection_window_months || 24} Months
          </h3>
          <p style={{ fontSize: "0.72rem", color: "var(--risk-low)", fontWeight: 600 }}>Pre-clinical lead time</p>
        </div>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", padding: "10px" }}>
          <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Quantum Sensitivity Gain</p>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--accent-teal)" }}>
            {pathway?.qml_sensitivity_gain}
          </h3>
          <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>vs Classical Screen</p>
        </div>
      </div>

      {/* Sequential Trajectory Progression Cards */}
      <div className="card-panel">
        <div className="card-header">
          <span className="card-title">
            <Compass size={15} color="var(--primary)" /> Multi-Stage Progression Trajectory & Cellular Biomarkers
          </span>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
            Asymptomatic Stage 0 → Stage II Clinical Intervention
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "8px" }}>
          {stages.map((st, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-canvas)",
                border: "1px solid var(--border-default)",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>
                <strong style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{st.stage}</strong>
                <span style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  padding: "1px 5px",
                  background: st.risk_score > 60 ? "var(--risk-high-bg)" : (st.risk_score > 30 ? "var(--risk-mid-bg)" : "var(--risk-low-bg)"),
                  color: st.risk_score > 60 ? "var(--risk-high)" : (st.risk_score > 30 ? "var(--risk-mid)" : "var(--risk-low)"),
                  border: "1px solid var(--border-default)",
                }}>
                  {st.risk_score}% Risk
                </span>
              </div>

              <div>
                <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Cellular Biomarker:</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{st.cellular_biomarker}</p>
              </div>

              <div>
                <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Clinical Presentation:</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{st.symptoms}</p>
              </div>

              <div>
                <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Detection Method:</p>
                <p style={{ fontSize: "0.72rem", color: "var(--primary)", fontWeight: 600 }}>{st.detection_method}</p>
              </div>

              <div style={{ marginTop: "auto", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", padding: "6px" }}>
                <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--accent-teal)", textTransform: "uppercase" }}>Recommended Protocol:</p>
                <p style={{ fontSize: "0.7rem", color: "var(--text-primary)" }}>{st.recommended_intervention}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preventive Action Guidelines */}
      <div className="card-panel">
        <div className="card-header">
          <span className="card-title">
            <CheckCircle2 size={15} color="var(--risk-low)" /> Research-Backed Clinical Interventions & Preventative Strategy
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
          {pathway?.preventive_actions?.map((act, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.74rem", color: "var(--text-secondary)", background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)", padding: "6px 8px" }}>
              <span style={{ color: "var(--risk-low)", fontWeight: 700 }}>✓</span>
              <span>{act}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
