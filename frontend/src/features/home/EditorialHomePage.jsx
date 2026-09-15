import React from "react";
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Activity,
  BarChart3,
  Stethoscope,
  HeartPulse,
} from "lucide-react";

export default function EditorialHomePage({ onNavigate, currentUser, allowedTabs = [] }) {
  const portals = [
    {
      id: "diagnostic",
      title: "AI Medical Diagnosis",
      subtitle: "Multi-Disease Risk Analysis",
      desc: "Upload clinical indicators, lab tests, and imaging scans (X-rays, dermoscopy) for multi-disease risk evaluation with explainable confidence intervals.",
      badge: "AI Diagnostics",
      icon: Activity,
    },
    {
      id: "twin",
      title: "3D Health Twin",
      subtitle: "Interactive Anatomical Model",
      desc: "Explore an interactive 3D digital twin with real-time organ indicators, vital projections, and personalized clinical hotspots.",
      badge: "3D Twin",
      icon: HeartPulse,
    },
    {
      id: "early_detection",
      title: "Early Health Risks",
      subtitle: "Longitudinal Risk Trajectories",
      desc: "Examine multi-year risk projections across cardiovascular, oncology, and pulmonary pathways with proactive clinical recommendations.",
      badge: "Risk Pathway",
      icon: BarChart3,
    },
    {
      id: "doctor_booking",
      title: "Doctor Consultations",
      subtitle: "Tele-Health & Video Rooms",
      desc: "Schedule and join encrypted WebRTC video consultations with certified specialists and receive signed digital prescriptions.",
      badge: "Tele-Health",
      icon: Stethoscope,
    },
    {
      id: "benchmarks",
      title: "Benchmark Matrix",
      subtitle: "Model Validation & Performance",
      desc: "Compare Quantum and AI classifier metrics against classical baselines across sensitivity, specificity, calibration, and latency.",
      badge: "Validation",
      icon: Cpu,
    },
    {
      id: "compliance",
      title: "Compliance & Security",
      subtitle: "Audit Trails & Access Control",
      desc: "Verify cryptographic audit ledgers, ABAC permission policies, patient consent logs, and clinical governance records.",
      badge: "Governance",
      icon: ShieldCheck,
    },
  ];

  const kpis = [
    {
      label: "Diagnostic Sensitivity",
      value: "98.4%",
      subtext: "+3.2% vs. Classical Baselines",
      subtextColor: "var(--risk-low)",
    },
    {
      label: "Inference Latency",
      value: "14.8 ms",
      subtext: "Optimized Processing Pipeline",
      subtextColor: "var(--text-muted)",
    },
    {
      label: "Circuit Fidelity",
      value: "99.8%",
      subtext: "Error Mitigation Active",
      subtextColor: "var(--risk-low)",
    },
    {
      label: "Supported Modalities",
      value: "5 Modalities",
      subtext: "Oncology, Cardiology, Pulmonary, Dermatology, Metabolism",
      subtextColor: "var(--text-muted)",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "8px 0 32px 0",
        maxWidth: "1320px",
        margin: "0 auto",
        width: "100%",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── Top Header Section ── */}
      <section
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-sm)",
          padding: "24px 28px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                color: "var(--accent-blue)",
                textTransform: "uppercase",
                fontWeight: 700,
                display: "block",
                marginBottom: "4px",
              }}
            >
              Clinical Intelligence Platform
            </span>
            <h1
              style={{
                fontSize: "1.85rem",
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                color: "var(--ink-primary)",
                margin: 0,
              }}
            >
              Intelligent Clinical Decision Support
            </h1>
          </div>

          <div
            style={{
              background: "var(--bg-surface-alt)",
              border: "1px solid var(--border-default)",
              padding: "10px 16px",
              borderRadius: "var(--radius-sm)",
              textAlign: "right",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "block",
              }}
            >
              Active Operator
            </span>
            <strong
              style={{
                fontSize: "0.90rem",
                color: "var(--ink-primary)",
                display: "block",
                fontWeight: 700,
              }}
            >
              {currentUser?.name || "Dr. Practitioner"}
            </strong>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                color: "var(--accent-blue)",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Role: {currentUser?.role || "GUEST"}
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: "0.92rem",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            maxWidth: "920px",
            margin: 0,
          }}
        >
          Q-MedSense is an intelligent clinical platform bridging AI and Quantum diagnostic models, interactive 3D Digital Health Twin projections, encrypted tele-consultations, and privacy-compliant patient record management.
        </p>
      </section>

      {/* ── Key Clinical Metrics ── */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "14px",
        }}
      >
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              padding: "18px 20px",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.64rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 700,
              }}
            >
              {kpi.label}
            </span>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.65rem",
                fontWeight: 800,
                color: "var(--ink-primary)",
                lineHeight: 1.2,
                margin: "4px 0 2px 0",
              }}
            >
              {kpi.value}
            </div>
            <span
              style={{
                fontSize: "0.74rem",
                color: kpi.subtextColor,
                fontWeight: 600,
              }}
            >
              {kpi.subtext}
            </span>
          </div>
        ))}
      </section>

      {/* ── Clinical Workspaces Grid ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "var(--ink-primary)",
              margin: 0,
            }}
          >
            Clinical Workspaces
          </h2>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            6 Operational Modules
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "16px",
          }}
        >
          {portals.map((p) => {
            const Icon = p.icon;
            const canOpen = allowedTabs.includes(p.id);
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={canOpen ? 0 : -1}
                aria-disabled={!canOpen}
                onClick={() => canOpen && onNavigate(p.id)}
                onKeyDown={(event) => {
                  if (canOpen && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    onNavigate(p.id);
                  }
                }}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-sm)",
                  padding: "20px",
                  cursor: canOpen ? "pointer" : "default",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                  boxShadow: "var(--shadow-card)",
                  opacity: canOpen ? 1 : 0.65,
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "var(--radius-xs)",
                          background: "var(--accent-blue-soft)",
                          color: "var(--accent-blue)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.64rem",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        {p.badge}
                      </span>
                    </div>

                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.62rem",
                        padding: "2px 8px",
                        background: "var(--bg-surface-alt)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius-xs)",
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      {canOpen ? "Active" : "Restricted"}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "var(--ink-primary)",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {p.title}
                  </h3>

                  <div
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--accent-blue)",
                      marginBottom: "6px",
                    }}
                  >
                    {p.subtitle}
                  </div>

                  <p
                    style={{
                      fontSize: "0.80rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {p.desc}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--border-default)",
                    paddingTop: "12px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      color: canOpen ? "var(--accent-blue)" : "var(--text-muted)",
                    }}
                  >
                    <span>{canOpen ? "Open Workspace" : "Restricted Access"}</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Technical Architecture & Specifications ── */}
      <section
        style={{
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
          borderRadius: "var(--radius-sm)",
          padding: "24px 26px",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ maxWidth: "900px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.08em",
              color: "var(--accent-blue)",
              textTransform: "uppercase",
              fontWeight: 700,
              display: "block",
              marginBottom: "4px",
            }}
          >
            Technical Architecture & Specifications
          </span>
          <h2
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              letterSpacing: "-0.01em",
              margin: "0 0 8px 0",
              color: "var(--ink-primary)",
            }}
          >
            Hybrid Quantum-Classical Diagnostic Pipeline
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Clinical features are normalized and angle-encoded into parameterized rotational quantum gates (Rx, Ry, Rz). An 8-qubit entangled Bell-state circuit evaluates Hilbert space interactions before state-vector measurement, calibrated against classical benchmarks (PneuVision CNN, XGBoost) with SHAP and LIME explainability.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            borderTop: "1px solid var(--border-default)",
            paddingTop: "16px",
            marginTop: "16px",
          }}
        >
          <div style={{ background: "var(--bg-surface-alt)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "var(--accent-blue)", fontWeight: 700, display: "block" }}>
              STEP 01
            </span>
            <strong style={{ fontSize: "0.84rem", color: "var(--ink-primary)", display: "block", marginTop: "2px" }}>
              Angle Embedding
            </strong>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Normalized feature vector map
            </span>
          </div>

          <div style={{ background: "var(--bg-surface-alt)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "var(--accent-blue)", fontWeight: 700, display: "block" }}>
              STEP 02
            </span>
            <strong style={{ fontSize: "0.84rem", color: "var(--ink-primary)", display: "block", marginTop: "2px" }}>
              Entangled VQC Ansatz
            </strong>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              CZ & CNOT multi-qubit gates
            </span>
          </div>

          <div style={{ background: "var(--bg-surface-alt)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "var(--accent-blue)", fontWeight: 700, display: "block" }}>
              STEP 03
            </span>
            <strong style={{ fontSize: "0.84rem", color: "var(--ink-primary)", display: "block", marginTop: "2px" }}>
              Pauli-Z Expectation
            </strong>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Log-likelihood projection
            </span>
          </div>

          <div style={{ background: "var(--bg-surface-alt)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "var(--accent-blue)", fontWeight: 700, display: "block" }}>
              STEP 04
            </span>
            <strong style={{ fontSize: "0.84rem", color: "var(--ink-primary)", display: "block", marginTop: "2px" }}>
              Explainability & Triage
            </strong>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Feature attribution & clinician notes
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
