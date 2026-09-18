import React from "react";
import { ArrowRight, ShieldCheck, Activity, Stethoscope, Compass, Cpu, ChartNoAxesCombined, FileText, CheckCircle2 } from "lucide-react";

export default function EditorialHomePage({ onNavigate, currentUser, allowedTabs = [] }) {
  const portals = [
    {
      id: "diagnostic",
      title: "Biomarker Diagnostic Review",
      subtitle: "Multi-Disease Risk Evaluation",
      desc: "Ingest clinical test panels or structured records for quantum-assisted biomarker analysis with SHAP and LIME clinical explainability.",
      badge: "Diagnostic AI",
      icon: Activity,
    },
    {
      id: "twin",
      title: "3D Digital Health Twin",
      subtitle: "Interactive Anatomical Simulation",
      desc: "Explore multi-organ physiological risks mapped directly onto interactive anatomical meshes with synchronized telemetry.",
      badge: "Anatomy 3D",
      icon: Cpu,
    },
    {
      id: "early_detection",
      title: "Longitudinal Risk Trajectories",
      subtitle: "Early Health Progression",
      desc: "Evaluate multi-year progression risks across oncology, cardiovascular, and pulmonary markers with preventative care recommendations.",
      badge: "Trajectories",
      icon: Compass,
    },
    {
      id: "doctor_booking",
      title: "Specialist Telehealth Consults",
      subtitle: "Clinical Video & Digital Rx",
      desc: "Book and launch encrypted WebRTC video consultations with certified specialists and receive cryptographic digital prescriptions.",
      badge: "Telehealth",
      icon: Stethoscope,
    },
    {
      id: "benchmarks",
      title: "Validation Benchmarks",
      subtitle: "Comparative Clinical Models",
      desc: "Review validated diagnostic benchmarks comparing hybrid quantum models against classical baselines with conformal guarantees.",
      badge: "Clinical Validation",
      icon: ChartNoAxesCombined,
    },
    {
      id: "compliance",
      title: "Governance & Audit Logs",
      subtitle: "HIPAA & DPDP Compliance",
      desc: "Inspect immutable WORM cryptographic audit logs, ABAC permissions, and patient consent lifecycles under DPDP Act 2023.",
      badge: "Governance",
      icon: ShieldCheck,
    },
  ];

  const kpis = [
    {
      label: "Diagnostic Confidence",
      value: "98.4%",
      subtext: "Validated on benchmark test cohorts",
      highlightColor: "var(--risk-low)",
    },
    {
      label: "Inference Latency",
      value: "14.8 ms",
      subtext: "Optimized tensor & circuit pipelines",
      highlightColor: "var(--primary)",
    },
    {
      label: "Model Calibration (ECE)",
      value: "< 0.04",
      subtext: "Conformal prediction guarantees",
      highlightColor: "var(--risk-low)",
    },
    {
      label: "Clinical Modalities",
      value: "5 Specialized",
      subtext: "Oncology, Cardiology, Pulmonary, Derma, Metabolism",
      highlightColor: "var(--secondary)",
    },
  ];

  return (
    <div
      className="home-workspace"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "8px 0 40px 0",
        maxWidth: "1280px",
        margin: "0 auto",
        width: "100%",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── Hero Overview Section ── */}
      <section
        style={{
          background: "#FFFFFF",
          border: "1px solid var(--border-default)",
          borderRadius: "14px",
          padding: "clamp(20px, 3vw, 32px)",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          overflow: "hidden",
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
          <div style={{ maxWidth: "720px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "3px 10px",
                background: "var(--primary-soft)",
                borderRadius: "6px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.06em",
                  color: "var(--primary-dark)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Clinical Workspace
              </span>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)",
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                margin: "0 0 8px 0",
              }}
            >
              Intelligent Clinical Decision Support
            </h1>
            <p
              style={{
                fontSize: "0.92rem",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                margin: 0,
              }}
            >
              QRakshak integrates hybrid quantum-classical diagnostic pipelines, 3D anatomical organ simulations, encrypted telehealth rooms, and certified medical documentation for healthcare professionals and patients.
            </p>
          </div>

          {/* Active Operator Status Box */}
          <div
            style={{
              background: "var(--bg-surface-alt)",
              border: "1px solid var(--border-default)",
              padding: "12px 18px",
              borderRadius: "10px",
              textAlign: "right",
              minWidth: "200px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.60rem",
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "block",
                fontWeight: 600,
              }}
            >
              Active Operator
            </span>
            <strong
              style={{
                fontSize: "0.92rem",
                color: "var(--text-primary)",
                display: "block",
                fontWeight: 700,
                marginTop: "2px",
              }}
            >
              {currentUser?.name || "Dr. Practitioner"}
            </strong>
            <span
              style={{
                display: "inline-block",
                fontSize: "0.68rem",
                color: "var(--primary-dark)",
                background: "var(--primary-soft)",
                padding: "2px 8px",
                borderRadius: "4px",
                fontWeight: 600,
                marginTop: "4px",
                textTransform: "uppercase",
                fontFamily: "var(--font-mono)",
              }}
            >
              Role: {currentUser?.role || "GUEST"}
            </span>
          </div>
        </div>
      </section>

      {/* ── Key Clinical Metrics ── */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "14px",
        }}
      >
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--border-default)",
              borderRadius: "12px",
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
                fontSize: "0.66rem",
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
              }}
            >
              {kpi.label}
            </span>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1.15,
                margin: "4px 0 2px 0",
              }}
            >
              {kpi.value}
            </div>
            <span
              style={{
                fontSize: "0.76rem",
                color: kpi.highlightColor,
                fontWeight: 600,
              }}
            >
              {kpi.subtext}
            </span>
          </div>
        ))}
      </section>

      {/* ── Clinical Workspaces Grid ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Clinical Workspaces
            </h2>
            <p style={{ fontSize: "0.80rem", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>
              Direct access to multi-modal health intelligence and patient care tools.
            </p>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.70rem",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            6 Core Modules
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
            const canOpen = allowedTabs.includes(p.id);
            const IconComp = p.icon;
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
                  background: "#FFFFFF",
                  border: "1px solid var(--border-default)",
                  borderRadius: "14px",
                  padding: "22px",
                  cursor: canOpen ? "pointer" : "default",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                  boxShadow: "var(--shadow-card)",
                  opacity: canOpen ? 1 : 0.65,
                  transition: "border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: canOpen ? "var(--primary-soft)" : "var(--bg-surface-alt)",
                          color: canOpen ? "var(--primary)" : "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconComp size={18} />
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.66rem",
                          fontWeight: 700,
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                        }}
                      >
                        {p.badge}
                      </span>
                    </div>

                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.64rem",
                        padding: "2px 8px",
                        background: canOpen ? "var(--risk-low-bg)" : "var(--bg-surface-alt)",
                        border: `1px solid ${canOpen ? "var(--risk-low-border)" : "var(--border-default)"}`,
                        borderRadius: "6px",
                        color: canOpen ? "var(--risk-low)" : "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      {canOpen ? "Authorized" : "Restricted"}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.08rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      margin: "0 0 4px 0",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {p.title}
                  </h3>

                  <div
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--primary)",
                      marginBottom: "8px",
                    }}
                  >
                    {p.subtitle}
                  </div>

                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.55,
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
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: canOpen ? "var(--primary)" : "var(--text-muted)",
                    }}
                  >
                    <span>{canOpen ? "Launch Workspace" : "Restricted Access"}</span>
                    {canOpen && <ArrowRight size={14} />}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Technical Architecture & Validation ── */}
      <section
        style={{
          background: "#FFFFFF",
          color: "var(--text-primary)",
          borderRadius: "14px",
          padding: "24px 28px",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ maxWidth: "860px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.66rem",
              letterSpacing: "0.08em",
              color: "var(--primary)",
              textTransform: "uppercase",
              fontWeight: 700,
              display: "block",
              marginBottom: "4px",
            }}
          >
            Clinical Architecture & Inference Flow
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.35rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              margin: "0 0 8px 0",
              color: "var(--text-primary)",
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
            Clinical markers are de-identified under HIPAA Safe Harbor rules and scaled to parameterized quantum angles. An 8-qubit variational circuit computes expectation values in high-dimensional Hilbert space, calibrated against classical ensembles with SHAP biomarker attributions and automated WORM audit trails.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            borderTop: "1px solid var(--border-default)",
            paddingTop: "16px",
            marginTop: "16px",
          }}
        >
          <div style={{ background: "var(--bg-surface-alt)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-default)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--primary)", fontWeight: 700, display: "block" }}>
              STEP 01
            </span>
            <strong style={{ fontSize: "0.88rem", color: "var(--text-primary)", display: "block", marginTop: "2px" }}>
              Angle Embedding
            </strong>
            <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
              Normalized feature vector mapping [0, π]
            </span>
          </div>

          <div style={{ background: "var(--bg-surface-alt)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-default)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--primary)", fontWeight: 700, display: "block" }}>
              STEP 02
            </span>
            <strong style={{ fontSize: "0.88rem", color: "var(--text-primary)", display: "block", marginTop: "2px" }}>
              Entangled Circuit
            </strong>
            <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
              Strongly entangling layers & CNOT gates
            </span>
          </div>

          <div style={{ background: "var(--bg-surface-alt)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-default)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--primary)", fontWeight: 700, display: "block" }}>
              STEP 03
            </span>
            <strong style={{ fontSize: "0.88rem", color: "var(--text-primary)", display: "block", marginTop: "2px" }}>
              Pauli-Z Expectation
            </strong>
            <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
              Quantum state measurement & probabilities
            </span>
          </div>

          <div style={{ background: "var(--bg-surface-alt)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-default)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--primary)", fontWeight: 700, display: "block" }}>
              STEP 04
            </span>
            <strong style={{ fontSize: "0.88rem", color: "var(--text-primary)", display: "block", marginTop: "2px" }}>
              Explainability & Triage
            </strong>
            <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
              KernelSHAP attribution & WORM audit log
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
