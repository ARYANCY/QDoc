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
  AlertTriangle,
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
  const ecgLineRef = useRef(null);

  useEffect(() => {
    if (pageRef.current) {
      animateEditorialHero(pageRef.current);
    }
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.96, rotateX: 4 },
        { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.7, ease: "power3.out", delay: 0.15 }
      );
    }
    if (personaContainerRef.current) {
      gsap.fromTo(
        personaContainerRef.current.children,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.2)", delay: 0.25 }
      );
    }
    if (ecgLineRef.current) {
      gsap.fromTo(
        ecgLineRef.current,
        { strokeDashoffset: 1200 },
        { strokeDashoffset: 0, duration: 3.5, repeat: -1, ease: "none" }
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
      accent: "#3B82F6",
      accentSoft: "rgba(59, 130, 246, 0.15)",
      accentBorder: "rgba(59, 130, 246, 0.35)",
      accentGlow: "rgba(59, 130, 246, 0.3)",
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
      accent: "#10B981",
      accentSoft: "rgba(16, 185, 129, 0.15)",
      accentBorder: "rgba(16, 185, 129, 0.35)",
      accentGlow: "rgba(16, 185, 129, 0.3)",
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
      accent: "#8B5CF6",
      accentSoft: "rgba(139, 92, 246, 0.15)",
      accentBorder: "rgba(139, 92, 246, 0.35)",
      accentGlow: "rgba(139, 92, 246, 0.3)",
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
        backgroundColor: "#070B14",
        color: "#F8FAFC",
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

      {/* ── Grid Pattern Backdrop ── */}
      <div className="login-ecg-grid" />

      {/* ── Animated Medical ECG Heartbeat Line ── */}
      <svg
        className="login-ecg-heartbeat"
        viewBox="0 0 1200 120"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          ref={ecgLineRef}
          d="M0,60 L200,60 L220,60 L230,20 L240,105 L255,10 L270,85 L285,60 L450,60 L470,60 L480,25 L490,100 L505,15 L520,80 L535,60 L750,60 L770,60 L780,20 L790,105 L805,10 L820,85 L835,60 L1050,60 L1070,60 L1080,25 L1090,100 L1105,15 L1120,80 L1135,60 L1200,60"
          stroke="#3B82F6"
          strokeWidth="2.5"
          strokeDasharray="1200"
          strokeDashoffset="0"
          strokeLinecap="round"
        />
      </svg>

      {/* ── Top Header Bar ── */}
      <header
        className="editorial-reveal login-folio-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "16px",
          gap: "12px",
          flexWrap: "wrap",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #3B82F6, #10B981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontWeight: 900,
              fontSize: "16px",
              boxShadow: "0 0 14px rgba(59, 130, 246, 0.5)",
            }}
          >
            +
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.3rem",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            Q-MEDSENSE
          </span>
          <span
            style={{
              fontSize: "0.68rem",
              color: "#94A3B8",
              fontWeight: 600,
              background: "rgba(255, 255, 255, 0.06)",
              padding: "2px 8px",
              borderRadius: "4px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            Clinical Quantum OS
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="live-status-pulse" />
          <span style={{ fontSize: "0.72rem", color: "#10B981", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
            HIPAA • WORM SECURED
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
                padding: "5px 14px",
                background: "rgba(59, 130, 246, 0.12)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "999px",
                marginBottom: "16px",
                boxShadow: "0 0 14px rgba(59, 130, 246, 0.15)",
              }}
            >
              <Sparkles size={13} color="#60A5FA" />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.66rem",
                  letterSpacing: "0.12em",
                  color: "#93C5FD",
                  textTransform: "uppercase",
                  fontWeight: 800,
                }}
              >
                PRECISION MEDICAL INTELLIGENCE
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.4rem, 4.2vw, 3.8rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
                margin: 0,
              }}
            >
              Precision Medicine. <br />
              <span style={{ fontStyle: "italic", fontWeight: 400, color: "#60A5FA", textShadow: "0 0 24px rgba(96, 165, 250, 0.4)" }}>
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
              color: "#94A3B8",
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
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                padding: "6px 12px",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "6px",
                color: "#34D399",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                boxShadow: "0 0 12px rgba(16, 185, 129, 0.15)",
              }}
            >
              <span className="live-status-pulse" />
              SYSTEM ACTIVE: ONLINE
            </span>

            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                padding: "6px 12px",
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "6px",
                color: "#60A5FA",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 0 12px rgba(59, 130, 246, 0.15)",
              }}
            >
              <Zap size={12} color="#60A5FA" />
              PENNYLANE VQC + CLASSICAL
            </span>

            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                padding: "6px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                color: "#94A3B8",
                fontWeight: 700,
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
              gap: "14px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "20px",
              marginTop: "4px",
            }}
          >
            <div className="feature-stat-box-dark">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#60A5FA", fontWeight: 700 }}>
                MODULE 01
              </span>
              <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.92rem", display: "block", marginTop: "2px", color: "#FFFFFF" }}>
                AI Diagnostics
              </strong>
              <span style={{ fontSize: "0.72rem", color: "#94A3B8", lineHeight: 1.4, display: "block", marginTop: "2px" }}>
                Multi-disease risk analysis & explainability
              </span>
            </div>

            <div className="feature-stat-box-dark">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#34D399", fontWeight: 700 }}>
                MODULE 02
              </span>
              <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.92rem", display: "block", marginTop: "2px", color: "#FFFFFF" }}>
                3D Digital Twin
              </strong>
              <span style={{ fontSize: "0.72rem", color: "#94A3B8", lineHeight: 1.4, display: "block", marginTop: "2px" }}>
                Interactive GLB anatomical simulation
              </span>
            </div>

            <div className="feature-stat-box-dark">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#A78BFA", fontWeight: 700 }}>
                MODULE 03
              </span>
              <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.92rem", display: "block", marginTop: "2px", color: "#FFFFFF" }}>
                Doctor Portal
              </strong>
              <span style={{ fontSize: "0.72rem", color: "#94A3B8", lineHeight: 1.4, display: "block", marginTop: "2px" }}>
                Live WebRTC video, chat & Rx signer
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Aesthetic Glassmorphic Login Card */}
        <div
          ref={cardRef}
          className="login-auth-card login-auth-card-glass"
          style={{
            padding: "clamp(24px, 3.5vw, 36px)",
            position: "relative",
          }}
        >
          {/* Animated Gradient Accent Bar */}
          <div className="login-shimmer-bar" />

          <div style={{ marginBottom: "20px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.64rem",
                letterSpacing: "0.14em",
                color: "#60A5FA",
                textTransform: "uppercase",
                fontWeight: 800,
                display: "block",
                marginBottom: "4px",
                textShadow: "0 0 10px rgba(96, 165, 250, 0.4)",
              }}
            >
              SECURE BIOMETRIC ACCESS &amp; DEMO
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.7rem",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Sign In to Q-MedSense
            </h2>
            <p style={{ fontSize: "0.80rem", color: "#94A3B8", marginTop: "4px" }}>
              Select a 1-click test persona or sign in with clinical credentials.
            </p>
          </div>

          {/* Mode Switcher */}
          <div
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.04)",
              padding: "4px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
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
                fontSize: "0.74rem",
                fontFamily: "var(--font-sans)",
                fontWeight: authMode === "vip" ? 700 : 600,
                borderRadius: "7px",
                border: "none",
                background: authMode === "vip" ? "rgba(59, 130, 246, 0.2)" : "transparent",
                color: authMode === "vip" ? "#93C5FD" : "#94A3B8",
                boxShadow: authMode === "vip" ? "0 0 14px rgba(59, 130, 246, 0.25)" : "none",
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
                fontSize: "0.74rem",
                fontFamily: "var(--font-sans)",
                fontWeight: authMode === "credentials" ? 700 : 600,
                borderRadius: "7px",
                border: "none",
                background: authMode === "credentials" ? "rgba(59, 130, 246, 0.2)" : "transparent",
                color: authMode === "credentials" ? "#93C5FD" : "#94A3B8",
                boxShadow: authMode === "credentials" ? "0 0 14px rgba(59, 130, 246, 0.25)" : "none",
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
                fontSize: "0.74rem",
                fontFamily: "var(--font-sans)",
                fontWeight: authMode === "register" ? 700 : 600,
                borderRadius: "7px",
                border: "none",
                background: authMode === "register" ? "rgba(59, 130, 246, 0.2)" : "transparent",
                color: authMode === "register" ? "#93C5FD" : "#94A3B8",
                boxShadow: authMode === "register" ? "0 0 14px rgba(59, 130, 246, 0.25)" : "none",
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
              {error && (
                <div className="clinical-error-banner" style={{ marginBottom: "10px" }}>
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>{error}</div>
                </div>
              )}
              {personas.map((p) => {
                const isSelected = activePersonaId === p.role;
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    disabled={loading}
                    className={`persona-card-aesthetic-dark ${isSelected ? "active-persona" : ""}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: isSelected ? p.accent : "rgba(255, 255, 255, 0.08)",
                          color: isSelected ? "#FFFFFF" : p.accent,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: isSelected ? `0 0 16px ${p.accentGlow}` : "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.90rem", color: "#FFFFFF" }}>
                            {p.name}
                          </strong>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.58rem",
                              padding: "2px 7px",
                              background: isSelected ? p.accent : "rgba(255, 255, 255, 0.06)",
                              color: isSelected ? "#FFFFFF" : p.accent,
                              borderRadius: "4px",
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              border: `1px solid ${p.accentBorder}`,
                            }}
                          >
                            {p.badge}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "#94A3B8",
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
                        color: p.accent,
                        fontSize: "0.72rem",
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
                <label className="metric-label" style={{ marginBottom: "6px", color: "#94A3B8" }}>
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
                        border: selectedRole === r.id ? "1.5px solid #3B82F6" : "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "6px",
                        background: selectedRole === r.id ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.04)",
                        color: selectedRole === r.id ? "#93C5FD" : "#94A3B8",
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
                <label className="metric-label" style={{ marginBottom: "6px", color: "#94A3B8" }}>
                  USERNAME OR EMAIL
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. alex.patient"
                    required
                    style={{
                      paddingLeft: "36px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#FFFFFF",
                      borderRadius: "8px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                  <User
                    size={15}
                    style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#60A5FA" }}
                  />
                </div>
              </div>

              <div>
                <label className="metric-label" style={{ marginBottom: "6px", color: "#94A3B8" }}>
                  PASSWORD
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    style={{
                      paddingLeft: "36px",
                      paddingRight: "36px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#FFFFFF",
                      borderRadius: "8px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                  <Lock
                    size={15}
                    style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#60A5FA" }}
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
                      color: "#94A3B8",
                      padding: "4px",
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="clinical-error-banner" style={{ marginTop: "4px" }}>
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>{error}</div>
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
                  fontSize: "0.84rem",
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  boxShadow: "0 0 20px rgba(37, 99, 235, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
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
                <label className="metric-label" style={{ marginBottom: "6px", color: "#94A3B8" }}>
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
                        border: registerRole === r.id ? "1.5px solid #3B82F6" : "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "6px",
                        background: registerRole === r.id ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.04)",
                        color: registerRole === r.id ? "#93C5FD" : "#94A3B8",
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
                <label className="metric-label" style={{ marginBottom: "4px", color: "#94A3B8" }}>
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="e.g. Dr. Priya Sharma"
                  required
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="metric-label" style={{ marginBottom: "4px", color: "#94A3B8" }}>
                    USERNAME
                  </label>
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="priya.md"
                    required
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#FFFFFF",
                      borderRadius: "8px",
                    }}
                  />
                </div>
                <div>
                  <label className="metric-label" style={{ marginBottom: "4px", color: "#94A3B8" }}>
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="priya@hospital.org"
                    required
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#FFFFFF",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              </div>

              {registerRole === "doctor" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label className="metric-label" style={{ marginBottom: "4px", color: "#94A3B8" }}>
                      SPECIALTY
                    </label>
                    <input
                      type="text"
                      value={registerSpecialty}
                      onChange={(e) => setRegisterSpecialty(e.target.value)}
                      placeholder="Cardiology / Oncology"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#FFFFFF",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                  <div>
                    <label className="metric-label" style={{ marginBottom: "4px", color: "#94A3B8" }}>
                      AFFILIATION
                    </label>
                    <input
                      type="text"
                      value={registerAffiliation}
                      onChange={(e) => setRegisterAffiliation(e.target.value)}
                      placeholder="Hospital or Clinic"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#FFFFFF",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="metric-label" style={{ marginBottom: "4px", color: "#94A3B8" }}>
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Create secure password"
                  required
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    borderRadius: "8px",
                  }}
                />
              </div>

              {error && (
                <div className="clinical-error-banner" style={{ marginTop: "4px" }}>
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>{error}</div>
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
                  fontSize: "0.84rem",
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  boxShadow: "0 0 20px rgba(37, 99, 235, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
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
