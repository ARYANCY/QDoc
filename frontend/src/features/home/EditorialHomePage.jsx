import { useEffect, useRef } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Activity,
  UserCheck,
  Video,
  Database,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import {
  animateCounter,
  animateEditorialHero,
  animateCardStagger,
} from "../../utils/motion";

export default function EditorialHomePage({ onNavigate, currentUser, allowedTabs = [] }) {
  const containerRef = useRef(null);
  const kpiSensitivityRef = useRef(null);
  const kpiLatencyRef = useRef(null);
  const kpiFidelityRef = useRef(null);
  const kpiStudiesRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      animateEditorialHero(containerRef.current);
      animateCardStagger(containerRef.current, ".editorial-card");
    }

    animateCounter(kpiSensitivityRef.current, 0, 98.4, 1, "%");
    animateCounter(kpiLatencyRef.current, 0, 14.8, 1, " ms");
    animateCounter(kpiFidelityRef.current, 0, 99.8, 1, "%");
    animateCounter(kpiStudiesRef.current, 0, 5, 0, " Modalities");
  }, []);

  const portals = [
    {
      id: "diagnostic",
      title: "01 / AI Medical Diagnosis",
      subtitle: "Multi-Disease AI Risk Analysis",
      desc: "Upload clinical tests, lab indicators, or medical images (chest X-rays, skin scans) for instant multi-disease risk assessment with explainable AI confidence.",
      badge: "AI DIAGNOSTICS",
      color: "var(--ink-primary)",
      icon: Activity,
    },
    {
      id: "twin",
      title: "02 / 3D Health Twin",
      subtitle: "Interactive Organ & Body Model",
      desc: "Explore an interactive 3D anatomy model with real-time organ health indicators, vital signs, and personalized risk hotspots.",
      badge: "3D MODEL",
      color: "var(--emerald-couture)",
      icon: HeartPulse,
    },
    {
      id: "early_detection",
      title: "03 / Early Health Risks",
      subtitle: "Long-Term Risk Projections",
      desc: "View personalized multi-year health risk forecasts, organ vulnerability rankings, and actionable preventative guidance.",
      badge: "RISK FORECAST",
      color: "var(--text-gold)",
      icon: BarChart3,
    },
    {
      id: "doctor_booking",
      title: "04 / Doctor Consultations",
      subtitle: "Book & Join Virtual Appointments",
      desc: "Connect with verified specialist doctors, join secure video consultations, and receive digital e-prescriptions.",
      badge: "TELE-HEALTH",
      color: "var(--ink-primary)",
      icon: Stethoscope,
    },
    {
      id: "benchmarks",
      title: "05 / AI Performance Matrix",
      subtitle: "Model Accuracy & Benchmarks",
      desc: "Compare AI and Quantum diagnostic models directly against classical baselines across accuracy, sensitivity, and response speed.",
      badge: "98.4% ACCURACY",
      color: "var(--cobalt-couture)",
      icon: Cpu,
    },
    {
      id: "compliance",
      title: "06 / Privacy & Audit Logs",
      subtitle: "Security & Patient Consent",
      desc: "Inspect secure audit logs, patient data privacy settings, and healthcare compliance records.",
      badge: "HIPAA / DPDP",
      color: "var(--ink-primary)",
      icon: ShieldCheck,
    },
  ];

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "40px",
        padding: "8px 0 40px 0",
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* ── Editorial Hero Masthead ── */}
      <section
        style={{
          borderBottom: "1px solid var(--border-default)",
          paddingBottom: "36px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          className="editorial-reveal"
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
                letterSpacing: "0.24em",
                color: "var(--text-gold)",
                textTransform: "uppercase",
                fontWeight: 800,
                display: "block",
                marginBottom: "6px",
              }}
            >
              PROJECT MANIFESTO // VOL. IV • CLINICAL INTELLIGENCE
            </span>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)",
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "var(--ink-primary)",
                margin: 0,
              }}
            >
              The Architecture of <br />
              <span style={{ fontStyle: "italic", fontWeight: 400, color: "#785E0E" }}>
                Autonomous Clinical
              </span>{" "}
              Decision Support.
            </h1>
          </div>

          {/* Quick Welcome Tag */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              padding: "12px 18px",
              borderRadius: "var(--radius-xs)",
              textAlign: "right",
              alignSelf: "flex-end",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                color: "var(--text-muted)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                display: "block",
              }}
            >
              ACTIVE OPERATOR
            </span>
            <strong
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.95rem",
                color: "var(--ink-primary)",
                display: "block",
              }}
            >
              {currentUser?.name || "Dr. Practitioner"}
            </strong>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.60rem",
                color: "var(--gold)",
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              ROLE // {currentUser?.role || "GUEST"}
            </span>
          </div>
        </div>

        <p
          className="editorial-reveal"
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.65,
            color: "var(--text-secondary)",
            maxWidth: "880px",
            margin: 0,
          }}
        >
          Q-MedSense is an haute-tier, end-to-end quantum clinical platform designed to bridge state-of-the-art Variational Quantum Classifiers (VQC), longitudinal 3D Digital Health Twin projections, encrypted tele-consultation networks, and rigorous FDA Class II SaMD compliance.
        </p>

        {/* ── Key Clinical KPI Counters (Animated via GSAP) ── */}
        <div
          className="editorial-reveal"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
            marginTop: "12px",
          }}
        >
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xs)",
              padding: "16px 20px",
              borderLeft: "3px solid var(--gold)",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              DIAGNOSTIC SENSITIVITY
            </span>
            <div
              ref={kpiSensitivityRef}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.85rem",
                fontWeight: 900,
                color: "var(--ink-primary)",
                margin: "4px 0 0 0",
              }}
            >
              98.4%
            </div>
            <span style={{ fontSize: "0.68rem", color: "var(--emerald-couture)", fontWeight: 600 }}>
              +3.2% vs. Classical XGBoost
            </span>
          </div>

          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xs)",
              padding: "16px 20px",
              borderLeft: "3px solid var(--ink-primary)",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              QUANTUM INFERENCE TIME
            </span>
            <div
              ref={kpiLatencyRef}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.85rem",
                fontWeight: 900,
                color: "var(--ink-primary)",
                margin: "4px 0 0 0",
              }}
            >
              14.8 ms
            </div>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
              Optimized QPU Pipeline
            </span>
          </div>

          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xs)",
              padding: "16px 20px",
              borderLeft: "3px solid var(--emerald-couture)",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              CIRCUIT FIDELITY
            </span>
            <div
              ref={kpiFidelityRef}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.85rem",
                fontWeight: 900,
                color: "var(--ink-primary)",
                margin: "4px 0 0 0",
              }}
            >
              99.8%
            </div>
            <span style={{ fontSize: "0.68rem", color: "var(--emerald-couture)", fontWeight: 600 }}>
              Error Mitigation Active
            </span>
          </div>

          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xs)",
              padding: "16px 20px",
              borderLeft: "3px solid #785E0E",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              ACTIVE MODALITIES
            </span>
            <div
              ref={kpiStudiesRef}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.85rem",
                fontWeight: 900,
                color: "var(--ink-primary)",
                margin: "4px 0 0 0",
              }}
            >
              5 Modalities
            </div>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
              Onco, Cardio, Pneu, Derma, Meta
            </span>
          </div>
        </div>
      </section>

      {/* ── Curated Action Portals (Magazine Grid) ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                letterSpacing: "0.18em",
                color: "var(--text-gold)",
                textTransform: "uppercase",
                fontWeight: 800,
              }}
            >
              CURATED SUITES
            </span>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.65rem",
                fontWeight: 800,
                color: "var(--ink-primary)",
                margin: "2px 0 0 0",
              }}
            >
              Explore Clinical Intelligence Modules
            </h2>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              color: "var(--text-muted)",
            }}
          >
            6 OPERATIONAL WORKSPACES
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: "18px",
          }}
        >
          {portals.map((p) => {
            const Icon = p.icon;
            const canOpen = allowedTabs.includes(p.id);
            return (
              <div
                key={p.id}
                className="editorial-card"
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
                  padding: "24px 22px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                  transition: "all 0.22s ease",
                  position: "relative",
                  boxShadow: "var(--shadow-card)",
                  opacity: canOpen ? 1 : 0.58,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--gold)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.transform = "translateY(0px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-card)";
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
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.60rem",
                        fontWeight: 800,
                        letterSpacing: "0.12em",
                        color: "var(--text-gold)",
                      }}
                    >
                      {p.title}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.56rem",
                        padding: "2px 6px",
                        background: "var(--bg-surface-alt)",
                        border: "1px solid var(--border-default)",
                        color: "var(--text-secondary)",
                        fontWeight: 700,
                      }}
                    >
                      {p.badge}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "var(--ink-primary)",
                      margin: "0 0 6px 0",
                    }}
                  >
                    {p.subtitle}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.78rem",
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
                    borderTop: "1px solid var(--border-subtle)",
                    paddingTop: "12px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "var(--ink-primary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    <span>{canOpen ? "Launch Workspace" : "Restricted Workspace"}</span>
                    <ArrowRight size={13} color="var(--gold)" />
                  </span>
                  <Icon size={18} color="var(--text-muted)" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Deep Technical Architecture & SaMD Integrity ── */}
      <section
        style={{
          background: "var(--bg-surface-dark)",
          color: "#FFFFFF",
          borderRadius: "var(--radius-sm)",
          padding: "32px 36px",
          border: "1px solid rgba(212, 175, 55, 0.35)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div style={{ maxWidth: "900px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              color: "var(--gold)",
              textTransform: "uppercase",
              fontWeight: 800,
              display: "block",
              marginBottom: "6px",
            }}
          >
            TECHNICAL ARCHITECTURE & SPECIFICATIONS
          </span>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.8rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              margin: "0 0 12px 0",
              color: "#FFFFFF",
            }}
          >
            Hybrid Quantum-Classical Pipeline
          </h2>
          <p
            style={{
              fontSize: "0.86rem",
              color: "#C9C4B7",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Clinical features are normalized and angle-encoded into parameterized rotational quantum gates \((R_x, R_y, R_z)\). An 8-qubit entangled Bell-state circuit evaluates Hilbert space interactions before state-vector measurement. The output is calibrated against classical benchmarks (PneuVision CNN, XGBoost) with SHAP/LIME clinical explainability.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "24px",
            marginTop: "24px",
          }}
        >
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--gold)", display: "block" }}>
              STEP 01
            </span>
            <strong style={{ fontSize: "0.85rem", display: "block", marginTop: "2px" }}>
              Angle Embedding
            </strong>
            <span style={{ fontSize: "0.70rem", color: "#A1A5B0" }}>
              Normalized feature vector map
            </span>
          </div>

          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--gold)", display: "block" }}>
              STEP 02
            </span>
            <strong style={{ fontSize: "0.85rem", display: "block", marginTop: "2px" }}>
              Entangled VQC Ansatz
            </strong>
            <span style={{ fontSize: "0.70rem", color: "#A1A5B0" }}>
              CZ & CNOT multi-qubit gates
            </span>
          </div>

          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--gold)", display: "block" }}>
              STEP 03
            </span>
            <strong style={{ fontSize: "0.85rem", display: "block", marginTop: "2px" }}>
              Pauli-Z Expectation
            </strong>
            <span style={{ fontSize: "0.70rem", color: "#A1A5B0" }}>
              Log-likelihood projection
            </span>
          </div>

          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--gold)", display: "block" }}>
              STEP 04
            </span>
            <strong style={{ fontSize: "0.85rem", display: "block", marginTop: "2px" }}>
              Explainability & Triage
            </strong>
            <span style={{ fontSize: "0.70rem", color: "#A1A5B0" }}>
              Feature attribution & clinician notes
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
