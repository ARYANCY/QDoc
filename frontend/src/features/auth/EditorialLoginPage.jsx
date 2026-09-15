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
  Layers,
  HeartPulse,
  Radio,
  Zap,
} from "lucide-react";
import { animateEntrance, animateEditorialHero } from "../../utils/motion";
import gsap from "gsap";

export default function EditorialLoginPage({ onLogin, onRegister, loading, error }) {
  const [authMode, setAuthMode] = useState("vip"); // "vip" (quick test) | "credentials" | "register"
  const [username, setUsername] = useState("alex.patient");
  const [password, setPassword] = useState("patient123");
  const [selectedRole, setSelectedRole] = useState("patient");
  const [registerName, setRegisterName] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("patient");
  const [registerSpecialty, setRegisterSpecialty] = useState("General Medicine & Clinical AI");
  const [registerAffiliation, setRegisterAffiliation] = useState("AIIMS Clinical AI OPD");
  const [showPassword, setShowPassword] = useState(false);
  const [activePersonaId, setActivePersonaId] = useState("patient");

  const pageRef = useRef(null);
  const cardRef = useRef(null);
  const personaContainerRef = useRef(null);

  useEffect(() => {
    if (pageRef.current) {
      animateEditorialHero(pageRef.current);
    }
    if (cardRef.current) {
      animateEntrance(cardRef.current, { y: 20, duration: 0.5 });
    }
    if (personaContainerRef.current) {
      gsap.fromTo(
        personaContainerRef.current.children,
        { opacity: 0, y: 16, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08, ease: "power2.out", delay: 0.1 }
      );
    }
  }, [authMode]);

  const personas = [
    {
      role: "patient",
      name: "Alexander Reed",
      username: "alex.patient",
      pass: "patient123",
      label: "PATIENT",
      badge: "PATIENT PORTAL",
      icon: User,
      desc: "3D Health Twin, Vitals Monitoring, AI Health Score & Telehealth",
      accent: "var(--accent-blue)",
      accentSoft: "var(--accent-blue-soft)",
      accentBorder: "rgba(37, 99, 235, 0.25)",
      accentGlow: "rgba(37, 99, 235, 0.15)",
    },
    {
      role: "doctor",
      name: "Dr. Kavita Rao, MD",
      username: "dr.kavita",
      pass: "doctor123",
      label: "CLINICIAN",
      badge: "PHYSICIAN CONSOLE",
      icon: Stethoscope,
      desc: "Clinical Triage, WebRTC Consultations, E-Prescriptions & Override Hub",
      accent: "var(--emerald-couture)",
      accentSoft: "var(--emerald-soft)",
      accentBorder: "rgba(5, 150, 105, 0.25)",
      accentGlow: "rgba(5, 150, 105, 0.15)",
    },
    {
      role: "admin",
      name: "Compliance Officer",
      username: "admin.audit",
      pass: "admin123",
      label: "GOVERNANCE",
      badge: "AUDIT & SECURITY",
      icon: ShieldCheck,
      desc: "HIPAA/DPDP Audit Trail, RBAC Administration & Benchmark Matrix",
      accent: "var(--accent-violet)",
      accentSoft: "var(--accent-violet-soft)",
      accentBorder: "rgba(124, 58, 237, 0.25)",
      accentGlow: "rgba(124, 58, 237, 0.15)",
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

  async function handleRegister(e) {
    e.preventDefault();
    await onRegister({
      username: registerUsername,
      password: registerPassword,
      name: registerName,
      email: registerEmail,
      role: registerRole,
      specialty: registerRole === "doctor" ? registerSpecialty : undefined,
      hospital_affiliation: registerRole === "doctor" ? registerAffiliation : undefined,
    });
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
      {/* ── Background Ambient Light Gradient Orbs ── */}
      <div className="login-ambient-orb orb-1" />
      <div className="login-ambient-orb orb-2" />
      <div className="login-ambient-orb orb-3" />

      {/* ── Top Header Bar ── */}
      <header
        className="editorial-reveal login-folio-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border-default)",
          paddingBottom: "16px",
          gap: "12px",
          flexWrap: "wrap",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "var(--ink-primary)",
            }}
          >
            Q-MEDSENSE
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            Clinical Platform
          </span>
        </div>
      </header>

      {/* ── Magazine Cover Body (Responsive Split Grid) ── */}
      <main
        className="login-main-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "clamp(24px, 4.5vw, 64px)",
          alignItems: "center",
          margin: "32px 0",
          maxWidth: "1400px",
          width: "100%",
          alignSelf: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Left Column: Hero Title & Feature Highlights */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="editorial-reveal">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px",
                background: "var(--accent-blue-soft)",
                border: "1px solid rgba(37, 99, 235, 0.2)",
                borderRadius: "999px",
                marginBottom: "16px",
              }}
            >
              <Sparkles size={13} color="var(--accent-blue)" />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.64rem",
                  letterSpacing: "0.10em",
                  color: "var(--accent-blue)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                NEXT-GEN QUANTUM CLINICAL INTELLIGENCE
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.4rem, 4.2vw, 3.8rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                color: "var(--ink-primary)",
                margin: 0,
              }}
            >
              Precision Medicine. <br />
              <span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--accent-blue)" }}>
                3D Digital Twin
              </span>{" "}
              & AI Diagnostics.
            </h1>
          </div>

          <p
            className="editorial-reveal"
            style={{
              fontSize: "0.98rem",
              lineHeight: 1.65,
              color: "var(--text-secondary)",
              maxWidth: "540px",
              margin: 0,
            }}
          >
            An integrated clinical workspace pairing 3D Digital Health Twin organ simulation with multi-disease risk analytics, WebRTC telehealth consultations, and automated health records.
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
              className="telemetry-pill-live"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                padding: "5px 12px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xs)",
                color: "var(--emerald-couture)",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <span className="live-status-pulse" />
              SYSTEM ACTIVE: ONLINE
            </span>

            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                padding: "5px 12px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xs)",
                color: "var(--text-secondary)",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <Zap size={12} color="var(--accent-blue)" />
              PENNYLANE VQC + CLASSICAL
            </span>

            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                padding: "5px 12px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xs)",
                color: "var(--text-muted)",
                fontWeight: 700,
                boxShadow: "var(--shadow-sm)",
              }}
            >
              LATENCY: &lt; 15 MS
            </span>
          </div>

          {/* Feature Pillars */}
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
            <div className="feature-stat-box">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--accent-blue)", fontWeight: 700 }}>
                MODULE 01
              </span>
              <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.90rem", display: "block", marginTop: "2px", color: "var(--ink-primary)" }}>
                AI Diagnostics
              </strong>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "2px" }}>
                Multi-disease risk analysis & explainability
              </span>
            </div>

            <div className="feature-stat-box">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--emerald-couture)", fontWeight: 700 }}>
                MODULE 02
              </span>
              <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.90rem", display: "block", marginTop: "2px", color: "var(--ink-primary)" }}>
                3D Digital Twin
              </strong>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "2px" }}>
                Interactive GLB anatomical simulation
              </span>
            </div>

            <div className="feature-stat-box">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--accent-violet)", fontWeight: 700 }}>
                MODULE 03
              </span>
              <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.90rem", display: "block", marginTop: "2px", color: "var(--ink-primary)" }}>
                Doctor Portal
              </strong>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4, display: "block", marginTop: "2px" }}>
                Live WebRTC video, chat & Rx signer
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Aesthetic Glassmorphic Login Card */}
        <div
          ref={cardRef}
          className="login-auth-card login-auth-card-elevated"
          style={{
            background: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: "clamp(24px, 3.5vw, 36px)",
            boxShadow: "var(--shadow-modal), 0 0 0 1px rgba(255, 255, 255, 0.8) inset",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Animated Gradient Accent Bar */}
          <div className="login-shimmer-bar" />

          <div style={{ marginBottom: "20px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                letterSpacing: "0.14em",
                color: "var(--accent-blue)",
                textTransform: "uppercase",
                fontWeight: 800,
                display: "block",
                marginBottom: "4px",
              }}
            >
              AUTHENTICATION & INSTANT DEMO ACCESS
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.65rem",
                fontWeight: 800,
                color: "var(--ink-primary)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Sign In to Q-MedSense
            </h2>
            <p style={{ fontSize: "0.80rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Select a 1-click test persona or sign in with registered credentials.
            </p>
          </div>

          {/* Mode Switcher */}
          <div
            style={{
              display: "flex",
              background: "var(--bg-surface-alt)",
              padding: "4px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-default)",
              marginBottom: "20px",
              gap: "4px",
            }}
          >
            <button
              type="button"
              onClick={() => setAuthMode("vip")}
              style={{
                flex: 1,
                padding: "8px 10px",
                fontSize: "0.72rem",
                fontFamily: "var(--font-sans)",
                fontWeight: authMode === "vip" ? 700 : 600,
                borderRadius: "var(--radius-xs)",
                border: "none",
                background: authMode === "vip" ? "var(--bg-surface)" : "transparent",
                color: authMode === "vip" ? "var(--ink-primary)" : "var(--text-muted)",
                boxShadow: authMode === "vip" ? "var(--shadow-sm)" : "none",
                cursor: "pointer",
                transition: "all 0.16s ease",
              }}
            >
              ★ 1-Click Personas
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("credentials")}
              style={{
                flex: 1,
                padding: "8px 10px",
                fontSize: "0.72rem",
                fontFamily: "var(--font-sans)",
                fontWeight: authMode === "credentials" ? 700 : 600,
                borderRadius: "var(--radius-xs)",
                border: "none",
                background: authMode === "credentials" ? "var(--bg-surface)" : "transparent",
                color: authMode === "credentials" ? "var(--ink-primary)" : "var(--text-muted)",
                boxShadow: authMode === "credentials" ? "var(--shadow-sm)" : "none",
                cursor: "pointer",
                transition: "all 0.16s ease",
              }}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              style={{
                flex: 1,
                padding: "8px 10px",
                fontSize: "0.72rem",
                fontFamily: "var(--font-sans)",
                fontWeight: authMode === "register" ? 700 : 600,
                borderRadius: "var(--radius-xs)",
                border: "none",
                background: authMode === "register" ? "var(--bg-surface)" : "transparent",
                color: authMode === "register" ? "var(--ink-primary)" : "var(--text-muted)",
                boxShadow: authMode === "register" ? "var(--shadow-sm)" : "none",
                cursor: "pointer",
                transition: "all 0.16s ease",
              }}
            >
              Register
            </button>
          </div>

          {/* TAB 1: 1-Click Test Demo Personas */}
          {authMode === "vip" ? (
            <div ref={personaContainerRef} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "8px" }}>
              {personas.map((p) => {
                const isSelected = activePersonaId === p.role;
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    disabled={loading}
                    className="persona-card-aesthetic"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      background: isSelected ? p.accentSoft : "var(--bg-surface)",
                      color: "var(--text-primary)",
                      border: isSelected ? `1.5px solid ${p.accent}` : "1px solid var(--border-default)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: isSelected ? `0 4px 14px ${p.accentGlow}` : "var(--shadow-sm)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: isSelected ? p.accent : "var(--bg-surface-alt)",
                          color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.18s ease",
                        }}
                      >
                        <IconComponent size={18} />
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", color: "var(--ink-primary)" }}>
                            {p.name}
                          </strong>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.58rem",
                              padding: "2px 6px",
                              background: isSelected ? p.accent : "var(--bg-surface-alt)",
                              color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                              borderRadius: "var(--radius-xs)",
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                            }}
                          >
                            {p.badge}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                            display: "block",
                            marginTop: "2px",
                            lineHeight: 1.35,
                          }}
                        >
                          {p.desc}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: isSelected ? p.accent : "var(--text-muted)",
                        fontSize: "0.70rem",
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        flexShrink: 0,
                      }}
                    >
                      <span className="launch-text">LAUNCH</span>
                      <ArrowRight size={14} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : authMode === "credentials" ? (
            /* TAB 2: Direct Credentials Form */
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Role Selector Pills */}
              <div>
                <label className="metric-label" style={{ marginBottom: "6px" }}>
                  ACCOUNT PERSONA
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {[
                    { id: "patient", label: "Patient" },
                    { id: "doctor", label: "Doctor" },
                    { id: "admin", label: "Admin" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleChange(r.id)}
                      style={{
                        padding: "8px",
                        fontSize: "0.74rem",
                        fontFamily: "var(--font-sans)",
                        fontWeight: selectedRole === r.id ? 700 : 600,
                        border: selectedRole === r.id ? "1.5px solid var(--accent-blue)" : "1px solid var(--border-default)",
                        borderRadius: "var(--radius-xs)",
                        background: selectedRole === r.id ? "var(--accent-blue-soft)" : "var(--bg-surface)",
                        color: selectedRole === r.id ? "var(--accent-blue)" : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="metric-label" style={{ marginBottom: "6px" }}>
                  USERNAME OR EMAIL
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. alex.patient"
                    required
                    style={{ paddingLeft: "36px" }}
                  />
                  <User
                    size={15}
                    style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                  />
                </div>
              </div>

              <div>
                <label className="metric-label" style={{ marginBottom: "6px" }}>
                  PASSWORD
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    style={{ paddingLeft: "36px", paddingRight: "36px" }}
                  />
                  <Lock
                    size={15}
                    style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
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
                      padding: "4px",
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="alert-banner danger" style={{ marginTop: "4px" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: "100%",
                  marginTop: "6px",
                  padding: "12px",
                  fontSize: "0.82rem",
                }}
              >
                {loading ? "Authenticating..." : "Sign In to Workspace"}
                <ArrowRight size={15} />
              </button>
            </form>
          ) : (
            /* TAB 3: New Account Registration */
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="metric-label" style={{ marginBottom: "6px" }}>
                  REGISTERING AS
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {[
                    { id: "patient", label: "Patient" },
                    { id: "doctor", label: "Specialist Doctor" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRegisterRole(r.id)}
                      style={{
                        padding: "8px",
                        fontSize: "0.74rem",
                        fontWeight: registerRole === r.id ? 700 : 600,
                        border: registerRole === r.id ? "1.5px solid var(--accent-blue)" : "1px solid var(--border-default)",
                        borderRadius: "var(--radius-xs)",
                        background: registerRole === r.id ? "var(--accent-blue-soft)" : "var(--bg-surface)",
                        color: registerRole === r.id ? "var(--accent-blue)" : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="metric-label" style={{ marginBottom: "4px" }}>
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="e.g. Dr. Priya Sharma"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="metric-label" style={{ marginBottom: "4px" }}>
                    USERNAME
                  </label>
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="priya.md"
                    required
                  />
                </div>
                <div>
                  <label className="metric-label" style={{ marginBottom: "4px" }}>
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="priya@hospital.org"
                    required
                  />
                </div>
              </div>

              {registerRole === "doctor" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label className="metric-label" style={{ marginBottom: "4px" }}>
                      SPECIALTY
                    </label>
                    <input
                      type="text"
                      value={registerSpecialty}
                      onChange={(e) => setRegisterSpecialty(e.target.value)}
                      placeholder="Cardiology / Oncology"
                    />
                  </div>
                  <div>
                    <label className="metric-label" style={{ marginBottom: "4px" }}>
                      AFFILIATION
                    </label>
                    <input
                      type="text"
                      value={registerAffiliation}
                      onChange={(e) => setRegisterAffiliation(e.target.value)}
                      placeholder="Hospital or Clinic"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="metric-label" style={{ marginBottom: "4px" }}>
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Create secure password"
                  required
                />
              </div>

              {error && (
                <div className="alert-banner danger">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: "100%",
                  marginTop: "4px",
                  padding: "12px",
                  fontSize: "0.82rem",
                }}
              >
                {loading ? "Creating Account..." : "Complete Registration"}
                <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
