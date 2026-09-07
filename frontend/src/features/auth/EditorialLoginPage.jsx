import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User,
  Activity,
  Lock,
  Cpu,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Stethoscope,
  KeyRound,
  FileCheck,
} from "lucide-react";
import { animateEntrance, animateEditorialHero } from "../../utils/motion";

export default function EditorialLoginPage({ onLogin, loading, error }) {
  const [authMode, setAuthMode] = useState("vip"); // "vip" | "credentials"
  const [username, setUsername] = useState("alex.patient");
  const [password, setPassword] = useState("patient123");
  const [selectedRole, setSelectedRole] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [activePersonaId, setActivePersonaId] = useState("patient");

  const pageRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (pageRef.current) {
      animateEditorialHero(pageRef.current);
    }
    if (cardRef.current) {
      animateEntrance(cardRef.current, { y: 24, duration: 0.5 });
    }
  }, []);

  const personas = [
    {
      role: "patient",
      name: "Alexander Reed",
      username: "alex.patient",
      pass: "patient123",
      label: "PATIENT",
      badge: "VIP PASSPORT",
      icon: User,
      desc: "Full Health Checkup, 3D Twin, Rx & Video Consultations",
      palette: "var(--emerald-couture)",
    },
    {
      role: "doctor",
      name: "Dr. Kavita Rao",
      username: "dr.kavita",
      pass: "doctor123",
      label: "CLINICIAN",
      badge: "CARDIOLOGY MD",
      icon: Stethoscope,
      desc: "Triage Cohort, Tele-Consultations & Prescription Issuer",
      palette: "var(--gold)",
    },
    {
      role: "admin",
      name: "Compliance Officer",
      username: "admin.audit",
      pass: "admin123",
      label: "GOVERNANCE",
      badge: "AUDIT DIRECT",
      icon: ShieldCheck,
      desc: "HIPAA/GDPR Console, RBAC Management & Benchmarks",
      palette: "var(--electric-rose)",
    },
  ];

  function handleSelectPersona(p) {
    setActivePersonaId(p.role);
    setUsername(p.username);
    setPassword(p.pass);
    setSelectedRole(p.role);
    onLogin(p.username, p.pass, p.role);
  }

  function handleRoleChange(role) {
    setSelectedRole(role);
    if (role === "patient") {
      setUsername("alex.patient");
      setPassword("patient123");
    } else if (role === "doctor") {
      setUsername("dr.kavita");
      setPassword("doctor123");
    } else if (role === "admin") {
      setUsername("admin.audit");
      setPassword("admin123");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onLogin(username, password, selectedRole);
  }

  return (
    <div
      ref={pageRef}
      className="editorial-login-page"
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "var(--bg-canvas)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "clamp(16px, 3vw, 36px)",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* ── Top Editorial Folio Bar ── */}
      <header
        className="editorial-reveal login-folio-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border-default)",
          paddingBottom: "14px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.30rem",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ink-primary)",
            }}
          >
            Q-MEDSENSE
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.18em",
              color: "var(--gold)",
              border: "1px solid var(--gold-border)",
              padding: "2px 8px",
              background: "var(--gold-light)",
              fontWeight: 800,
            }}
          >
            ISSUE 2026 // VOL. IV
          </span>
        </div>

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.64rem",
            letterSpacing: "0.14em",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            display: "flex",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <span>PARIS</span>
          <span>•</span>
          <span>BASEL</span>
          <span>•</span>
          <span>NEW YORK</span>
          <span>•</span>
          <span>ZURICH</span>
        </div>
      </header>

      {/* ── Magazine Cover Body (Responsive Split Grid) ── */}
      <main
        className="login-main-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: "clamp(24px, 4vw, 56px)",
          alignItems: "center",
          margin: "32px 0",
          maxWidth: "1440px",
          width: "100%",
          alignSelf: "center",
        }}
      >
        {/* Left Column: Magazine Feature & Manifesto */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="editorial-reveal">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                letterSpacing: "0.24em",
                color: "var(--text-gold)",
                textTransform: "uppercase",
                fontWeight: 800,
                display: "block",
                marginBottom: "8px",
              }}
            >
              COLLECTION CLINIQUE // ARCHIVE NO. 42
            </span>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2.4rem, 4.6vw, 4.2rem)",
                fontWeight: 900,
                lineHeight: 1.04,
                letterSpacing: "-0.03em",
                color: "var(--ink-primary)",
                margin: 0,
              }}
            >
              The Quantum <br />
              <span style={{ fontStyle: "italic", fontWeight: 400, color: "#785E0E" }}>
                Intelligence
              </span>{" "}
              Manifesto.
            </h1>
          </div>

          <p
            className="editorial-reveal"
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.65,
              color: "var(--text-secondary)",
              maxWidth: "560px",
              margin: 0,
            }}
          >
            A high-fashion synthesis of Variational Quantum Classifiers (VQC), autonomous 3D Digital Health Twin telemetry, and zero-knowledge SaMD clinical governance. Engineered for precision medicine.
          </p>

          {/* Live Telemetry Ticker Pills */}
          <div
            className="editorial-reveal"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.64rem",
                padding: "4px 10px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                color: "var(--emerald-couture)",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--emerald-couture)" }} />
              QPU FIDELITY: 99.82%
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.64rem",
                padding: "4px 10px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                color: "var(--text-gold)",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Sparkles size={11} /> 8-QUBIT VQC SOTA
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.64rem",
                padding: "4px 10px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                color: "var(--text-muted)",
                fontWeight: 700,
              }}
            >
              LATENCY: 12 MS
            </span>
          </div>

          {/* Editorial Feature Highlights */}
          <div
            className="editorial-reveal"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              borderTop: "1px solid var(--border-default)",
              paddingTop: "20px",
              marginTop: "4px",
            }}
          >
            <div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "var(--text-muted)", display: "block" }}>
                PILLAR 01
              </span>
              <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.86rem", display: "block", marginTop: "2px" }}>
                VQC 0.947 SOTA
              </strong>
              <span style={{ fontSize: "0.70rem", color: "var(--text-muted)" }}>
                8-Qubit Entanglement
              </span>
            </div>

            <div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "var(--text-muted)", display: "block" }}>
                PILLAR 02
              </span>
              <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.86rem", display: "block", marginTop: "2px" }}>
                3D Digital Twin
              </strong>
              <span style={{ fontSize: "0.70rem", color: "var(--text-muted)" }}>
                Organ Hologram Telemetry
              </span>
            </div>

            <div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "var(--text-muted)", display: "block" }}>
                PILLAR 03
              </span>
              <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.86rem", display: "block", marginTop: "2px" }}>
                Zero-Knowledge
              </strong>
              <span style={{ fontSize: "0.70rem", color: "var(--text-muted)" }}>
                SaMD & FDA Class IIa
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Haute Luxury Auth Card */}
        <div
          ref={cardRef}
          className="login-auth-card"
          style={{
            background: "#FFFFFF",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            padding: "clamp(24px, 3.5vw, 36px)",
            boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.08)",
            position: "relative",
          }}
        >
          {/* Top Gold Corner Accent */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "var(--gold-gradient)",
            }}
          />

          <div style={{ marginBottom: "20px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.60rem",
                letterSpacing: "0.22em",
                color: "var(--text-gold)",
                textTransform: "uppercase",
                fontWeight: 800,
                display: "block",
                marginBottom: "4px",
              }}
            >
              AUTHENTICATION // GATEWAY 04
            </span>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.65rem",
                fontWeight: 800,
                color: "var(--ink-primary)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Access the Sanctuary
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Select a verified backstage persona or enter master cryptographic keys.
            </p>
          </div>

          {/* Mode Switcher Pills: VIP Pass vs Credentials */}
          <div
            style={{
              display: "flex",
              background: "var(--bg-surface-alt)",
              padding: "3px",
              border: "1px solid var(--border-default)",
              marginBottom: "18px",
            }}
          >
            <button
              type="button"
              onClick={() => setAuthMode("vip")}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: "0.72rem",
                fontFamily: "var(--font-mono)",
                fontWeight: authMode === "vip" ? 800 : 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                border: "none",
                background: authMode === "vip" ? "#FFFFFF" : "transparent",
                color: authMode === "vip" ? "var(--ink-primary)" : "var(--text-muted)",
                boxShadow: authMode === "vip" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              ★ 1-Click VIP Passes
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("credentials")}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: "0.72rem",
                fontFamily: "var(--font-mono)",
                fontWeight: authMode === "credentials" ? 800 : 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                border: "none",
                background: authMode === "credentials" ? "#FFFFFF" : "transparent",
                color: authMode === "credentials" ? "var(--ink-primary)" : "var(--text-muted)",
                boxShadow: authMode === "credentials" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Master Keyphrase
            </button>
          </div>

          {/* TAB 1: 1-Click VIP Personas */}
          {authMode === "vip" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "8px" }}>
              {personas.map((p) => {
                const isSelected = activePersonaId === p.role;
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    disabled={loading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: isSelected ? "var(--bg-surface-dark)" : "var(--bg-surface-alt)",
                      color: isSelected ? "#FFFFFF" : "var(--text-primary)",
                      border: isSelected ? "1px solid var(--gold)" : "1px solid var(--border-default)",
                      borderRadius: "var(--radius-xs)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.18s ease",
                      minHeight: "48px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: isSelected ? "var(--gold)" : "var(--border-default)",
                          color: isSelected ? "#000000" : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconComponent size={16} />
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.84rem" }}>
                            {p.name}
                          </strong>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.56rem",
                              padding: "1px 5px",
                              background: isSelected ? "var(--gold)" : "var(--border-default)",
                              color: isSelected ? "#000" : "var(--text-secondary)",
                              fontWeight: 800,
                              letterSpacing: "0.08em",
                            }}
                          >
                            {p.badge}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            color: isSelected ? "#C9C4B7" : "var(--text-muted)",
                            display: "block",
                            marginTop: "2px",
                          }}
                        >
                          {p.desc}
                        </span>
                      </div>
                    </div>

                    <ArrowRight
                      size={16}
                      color={isSelected ? "var(--gold)" : "var(--text-muted)"}
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            /* TAB 2: Direct Credentials Form */
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Role Selection Radio Buttons */}
              <div>
                <label
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.60rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "var(--text-muted)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Target Sanctuary Role
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                  {["patient", "doctor", "admin"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleChange(r)}
                      style={{
                        padding: "8px 4px",
                        fontSize: "0.72rem",
                        fontFamily: "var(--font-mono)",
                        fontWeight: selectedRole === r ? 800 : 600,
                        textTransform: "uppercase",
                        border: selectedRole === r ? "1px solid var(--gold)" : "1px solid var(--border-default)",
                        background: selectedRole === r ? "var(--ink-primary)" : "var(--bg-surface-alt)",
                        color: selectedRole === r ? "var(--gold)" : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.60rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "var(--text-muted)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Access Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. alex.patient"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "0.82rem",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-xs)",
                    fontFamily: "var(--font-sans)",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.60rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "var(--text-muted)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Encrypted Keyphrase
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 36px 10px 12px",
                      fontSize: "0.82rem",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-xs)",
                      fontFamily: "var(--font-sans)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  marginTop: "8px",
                  padding: "12px",
                  fontSize: "0.82rem",
                  width: "100%",
                  background: "var(--ink-primary)",
                  border: "1px solid var(--ink-primary)",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loading ? (
                  <span>Authenticating Q-Keys...</span>
                ) : (
                  <>
                    <span>Enter the Clinical Sanctuary</span>
                    <ArrowRight size={15} color="var(--gold)" />
                  </>
                )}
              </button>
            </form>
          )}

          {error && (
            <div
              style={{
                background: "var(--risk-high-bg)",
                color: "var(--risk-high)",
                border: "1px solid var(--risk-high-border)",
                padding: "8px 12px",
                fontSize: "0.72rem",
                marginTop: "12px",
                fontFamily: "var(--font-mono)",
              }}
            >
              {error}
            </div>
          )}
        </div>
      </main>

      {/* ── Bottom Editorial Ticker Footer ── */}
      <footer
        className="editorial-reveal login-footer-bar"
        style={{
          borderTop: "1px solid var(--border-default)",
          paddingTop: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.62rem",
          color: "var(--text-muted)",
          letterSpacing: "0.08em",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <span>Q-MEDSENSE PROTOCOL © 2026</span>
          <span style={{ margin: "0 10px" }}>•</span>
          <span>FDA CLASS II EXEMPT SaMD</span>
        </div>
        <div>
          <span style={{ color: "var(--gold)" }}>● TELEMETRY ONLINE</span>
          <span style={{ margin: "0 10px" }}>•</span>
          <span>LATENCY: 12.4 MS</span>
        </div>
      </footer>
    </div>
  );
}
