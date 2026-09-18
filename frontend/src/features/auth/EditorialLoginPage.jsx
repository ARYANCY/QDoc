import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ShieldCheck, Lock, Activity, UserCheck, Stethoscope, ArrowRight, Eye, EyeOff, PlayCircle, X, Maximize2, Video, HelpCircle } from "lucide-react";
import SquareLoader from "../../components/common/SquareLoader.jsx";
import DNAHelixAnimation from "../../components/common/DNAHelixAnimation.jsx";
import { animateErrorShake } from "../../utils/motion.js";

export default function EditorialLoginPage({ onLogin, onRegister, loading, error }) {
  const [authMode, setAuthMode] = useState("credentials"); // "credentials" (Sign In) | "register" (Create Account)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);

  // User Guide Video Modal State
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideVideoUrl, setGuideVideoUrl] = useState("/videos/user-guide.mp4");
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const modalContainerRef = useRef(null);

  // Registration Form State
  const [registerName, setRegisterName] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("patient");
  const [registerSpecialty, setRegisterSpecialty] = useState("General Medicine & Clinical AI");
  const [registerAffiliation, setRegisterAffiliation] = useState("AIIMS Clinical AI OPD");

  // Local form-scoped error state — cleared independently per form, isolated from global error
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  const pageRef = useRef(null);
  const formContainerRef = useRef(null);
  const narrativeRef = useRef(null);

  // Clear errors when switching tabs
  useEffect(() => {
    setLoginError("");
    setRegisterError("");
  }, [authMode]);

  // Listen for Escape key to close the User Guide modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && showGuideModal) {
        setShowGuideModal(false);
      }
    }
    if (showGuideModal) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showGuideModal]);

  // Fullscreen toggle using standard Web Fullscreen API
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (modalContainerRef.current?.requestFullscreen) {
        modalContainerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  // Smooth GSAP Transition between Sign In and Sign Up
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const isForward = authMode === "register";
    const deltaX = isForward ? 18 : -18;

    if (formContainerRef.current) {
      gsap.fromTo(
        formContainerRef.current,
        { opacity: 0, x: deltaX },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          ease: "power2.out",
        }
      );
    }

    if (narrativeRef.current) {
      gsap.fromTo(
        narrativeRef.current,
        { opacity: 0, y: isForward ? 10 : -10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        }
      );
    }
  }, [authMode]);

  // Tactile GSAP attention shake on authentication error (triggers on local errors too)
  useEffect(() => {
    if ((loginError || registerError || error) && formContainerRef.current) {
      animateErrorShake(formContainerRef.current);
    }
  }, [loginError, registerError, error]);

  function handleSubmit(e) {
    e.preventDefault();
    setLoginError("");
    // Client-side validation
    if (!username.trim()) {
      setLoginError("Please enter your username or email.");
      return;
    }
    if (!password) {
      setLoginError("Please enter your password.");
      return;
    }
    onLogin(username.trim(), password, selectedRole);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegisterError("");
    // Client-side validation
    if (!registerName.trim()) {
      setRegisterError("Full name is required.");
      return;
    }
    if (!registerUsername.trim()) {
      setRegisterError("Choose a username.");
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(registerUsername.trim())) {
      setRegisterError("Username can only contain letters, numbers, dots, hyphens, and underscores.");
      return;
    }
    if (!registerEmail.trim() || !registerEmail.includes("@")) {
      setRegisterError("Enter a valid email address.");
      return;
    }
    if (!registerPassword || registerPassword.length < 6) {
      setRegisterError("Password must be at least 6 characters.");
      return;
    }
    await onRegister({
      username: registerUsername.trim(),
      password: registerPassword,
      name: registerName.trim(),
      email: registerEmail.trim(),
      role: registerRole,
      specialty: registerRole === "doctor" ? registerSpecialty : undefined,
      hospital_affiliation: registerRole === "doctor" ? registerAffiliation : undefined,
    });
  }

  return (
    <div
      ref={pageRef}
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#F8FAFC",
        backgroundImage: "radial-gradient(at 0% 0%, rgba(6, 182, 212, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.07) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(8, 127, 140, 0.04) 0px, transparent 60%)",
        color: "#17212B",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "clamp(16px, 3vw, 32px)",
        overflowX: "hidden",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* ── 3D Rotating Blood-Red DNA Helix Background Visual ── */}
      <DNAHelixAnimation />
      {/* ── Background Medical Line-Art: Subtle DNA & Biological Grid ── */}
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.55,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="dnaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#087F8C" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#3B82B6" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path
          d="M -100,200 Q 150,100 400,250 T 900,200 T 1400,280 T 1900,180"
          fill="none"
          stroke="url(#dnaGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <path
          d="M -100,260 Q 150,360 400,210 T 900,260 T 1400,180 T 1900,280"
          fill="none"
          stroke="url(#dnaGrad)"
          strokeWidth="1.5"
        />
        {[200, 360, 520, 680, 840, 1000, 1160, 1320, 1480, 1640].map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={210 + Math.sin(i) * 20}
            x2={x}
            y2={250 - Math.sin(i) * 20}
            stroke="#D9E2EC"
            strokeWidth="1"
            strokeOpacity="0.7"
          />
        ))}
      </svg>

      {/* ── Top Header Navigation ── */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #D9E2EC",
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
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#17212B",
            }}
          >
            QRakshak
          </span>
          <span
            style={{
              fontSize: "0.70rem",
              color: "#075E66",
              fontWeight: 600,
              background: "#EBF8FA",
              padding: "3px 8px",
              borderRadius: "6px",
              border: "1px solid #D9E2EC",
            }}
          >
            Clinical Technology Platform
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#16866A",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "0.72rem",
                color: "#52616B",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
              }}
            >
              HIPAA SAFE HARBOR • DPDP 2023 READY
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              fontSize: "0.76rem",
              fontWeight: 700,
              background: "#FFFFFF",
              borderColor: "#087F8C",
              color: "#087F8C",
              cursor: "pointer",
              borderRadius: "8px",
              boxShadow: "0 1px 4px rgba(8, 127, 140, 0.08)",
              transition: "all 0.15s ease",
            }}
            title="Open Fullscreen User Guide Video Walkthrough"
          >
            <PlayCircle size={15} color="#087F8C" />
            <span>User Guide</span>
          </button>
        </div>
      </header>

      {/* ── Main Two-Column Split Grid ── */}
      <main className="editorial-main-grid">
        {/* Left Column: Clinical Story & Product Context */}
        <div ref={narrativeRef} style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative", zIndex: 10 }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px",
                background: "#EBF8FA",
                border: "1px solid #D9E2EC",
                borderRadius: "999px",
                marginBottom: "14px",
                boxShadow: "0 1px 6px rgba(255, 255, 255, 0.8)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.06em",
                  color: "#087F8C",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Healthcare Technology
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 3.8vw, 3.2rem)",
                fontWeight: 700,
                lineHeight: 1.16,
                letterSpacing: "-0.02em",
                color: "#17212B",
                margin: 0,
                textShadow: "0 1px 4px rgba(255, 255, 255, 0.95), 0 0 18px rgba(255, 255, 255, 0.9)",
              }}
            >
              Clinical precision, <br />
              <span style={{ color: "#087F8C" }}>human-centered care.</span>
            </h1>
          </div>

          <p
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "#334155",
              maxWidth: "500px",
              margin: 0,
              textShadow: "0 1px 3px rgba(255, 255, 255, 0.95), 0 0 12px rgba(255, 255, 255, 0.9)",
            }}
          >
            {authMode === "credentials"
              ? "Access multi-modal clinical intelligence, real-time vital indicators, encrypted doctor consultations, and certified medical documentation."
              : "Register your clinical persona to participate in collaborative consultations, record verified health indicators, and maintain tamper-proof patient records."}
          </p>

          {/* Clinical Pillars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              borderTop: "1px solid #D9E2EC",
              paddingTop: "18px",
            }}
          >
            <div
              style={{
                padding: "14px",
                background: "#FFFFFF",
                border: "1px solid #D9E2EC",
                borderRadius: "10px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.64rem",
                  color: "#087F8C",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                MODALITY 01
              </span>
              <strong
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  color: "#17212B",
                  marginTop: "2px",
                }}
              >
                Early Risk Stratification
              </strong>
              <span
                style={{
                  display: "block",
                  fontSize: "0.74rem",
                  color: "#52616B",
                  marginTop: "2px",
                  lineHeight: 1.4,
                }}
              >
                Multi-organ biomarker screening & clinical explainability.
              </span>
            </div>

            <div
              style={{
                padding: "14px",
                background: "#FFFFFF",
                border: "1px solid #D9E2EC",
                borderRadius: "10px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.64rem",
                  color: "#087F8C",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                MODALITY 02
              </span>
              <strong
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  color: "#17212B",
                  marginTop: "2px",
                }}
              >
                Doctor Consultations
              </strong>
              <span
                style={{
                  display: "block",
                  fontSize: "0.74rem",
                  color: "#52616B",
                  marginTop: "2px",
                  lineHeight: 1.4,
                }}
              >
                Encrypted WebRTC telehealth & verified digital prescriptions.
              </span>
            </div>
          </div>

          {/* User Guide Interactive Video Launch Card */}
          <div
            onClick={() => setShowGuideModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              background: "linear-gradient(135deg, #FFFFFF 0%, #EBF8FA 100%)",
              border: "1px solid #B8E2E8",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(8, 127, 140, 0.08)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#087F8C";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#B8E2E8";
              e.currentTarget.style.transform = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "#087F8C",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  flexShrink: 0,
                  boxShadow: "0 2px 6px rgba(8, 127, 140, 0.3)",
                }}
              >
                <PlayCircle size={22} />
              </div>
              <div>
                <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#17212B" }}>
                  New to QRakshak? Watch User Guide
                </div>
                <div style={{ fontSize: "0.72rem", color: "#52616B", marginTop: "1px" }}>
                  Click to open full-screen video demonstration & clinical walkthrough
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 700,
                color: "#087F8C",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
              }}
            >
              Play Video ↗
            </span>
          </div>
        </div>

        {/* Right Column: Clean Luxury Authentication Form Card */}
        <div
          ref={formContainerRef}
          className="glass-card-luxury glow-border"
          style={{
            borderRadius: "16px",
            padding: "clamp(24px, 3.5vw, 36px)",
            boxShadow: "0 20px 45px -15px rgba(8, 127, 140, 0.12), 0 4px 16px rgba(15, 23, 42, 0.06)",
            position: "relative",
          }}
        >
          {/* Card Header & Mode Switcher */}
          <div style={{ marginBottom: "20px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                color: "#087F8C",
                textTransform: "uppercase",
                fontWeight: 700,
                display: "block",
                marginBottom: "4px",
              }}
            >
              {authMode === "credentials" ? "WORKSPACE ACCESS" : "ACCOUNT ENROLLMENT"}
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#17212B",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {authMode === "credentials" ? "Sign in to QRakshak" : "Create Clinical Account"}
            </h2>
            <p style={{ fontSize: "0.82rem", color: "#52616B", marginTop: "4px", margin: 0 }}>
              {authMode === "credentials"
                ? "Enter your verified credentials to access your care dashboard."
                : "Fill in your profile information to initialize your health identity."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: "flex",
              background: "#F1F5F9",
              padding: "4px",
              borderRadius: "9px",
              marginBottom: "18px",
              gap: "4px",
            }}
          >
            <button
              type="button"
              onClick={() => setAuthMode("credentials")}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "0.80rem",
                fontFamily: "var(--font-sans)",
                fontWeight: authMode === "credentials" ? 600 : 500,
                borderRadius: "7px",
                border: "none",
                background: authMode === "credentials" ? "#FFFFFF" : "transparent",
                color: authMode === "credentials" ? "#087F8C" : "#52616B",
                boxShadow: authMode === "credentials" ? "0 1px 3px rgba(15, 23, 42, 0.08)" : "none",
                cursor: "pointer",
                transition: "all 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "0.80rem",
                fontFamily: "var(--font-sans)",
                fontWeight: authMode === "register" ? 600 : 500,
                borderRadius: "7px",
                border: "none",
                background: authMode === "register" ? "#FFFFFF" : "transparent",
                color: authMode === "register" ? "#087F8C" : "#52616B",
                boxShadow: authMode === "register" ? "0 1px 3px rgba(15, 23, 42, 0.08)" : "none",
                cursor: "pointer",
                transition: "all 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              New Registration
            </button>
          </div>

          {/* SIGN IN VIEW */}
          {authMode === "credentials" ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Account Persona Selector */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Account Persona
                  </label>
                  <span style={{ fontSize: "0.66rem", color: "#087F8C", fontWeight: 600 }}>
                    Tap to auto-fill verified login
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {[
                    { id: "patient", label: "Patient", u: "aryan", p: "patient123" },
                    { id: "doctor", label: "Clinician", u: "dr.aryan", p: "clinician123" },
                    { id: "admin", label: "Auditor", u: "admin.audit", p: "admin123" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(r.id);
                        setUsername(r.u);
                        setPassword(r.p);
                        setLoginError(""); // clear any stale error when switching persona
                      }}
                      style={{
                        padding: "8px 10px",
                        fontSize: "0.78rem",
                        fontFamily: "var(--font-sans)",
                        fontWeight: selectedRole === r.id ? 600 : 500,
                        border: selectedRole === r.id ? "1.5px solid #087F8C" : "1px solid #D9E2EC",
                        borderRadius: "8px",
                        background: selectedRole === r.id ? "#EBF8FA" : "#FFFFFF",
                        color: selectedRole === r.id ? "#087F8C" : "#52616B",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Username Input */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Username or Email</label>
                <input
                  type="text"
                  className="input-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username or email"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="form-label">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.72rem",
                      color: "#087F8C",
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              {(loginError || error) && (
                <div className="clinical-error-banner" style={{ margin: "4px 0 0 0" }}>
                  <div>{loginError || error}</div>
                </div>
              )}


              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: "100%", marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {loading ? (
                  <>
                    <SquareLoader size="sm" color="#FFFFFF" style={{ padding: 0 }} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign In to Workspace"
                )}
              </button>
            </form>
          ) : (
            /* REGISTRATION VIEW */
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="form-label" style={{ marginBottom: "6px" }}>
                  Registering Role
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {[
                    { id: "patient", label: "Patient" },
                    { id: "doctor", label: "Specialist Clinician" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRegisterRole(r.id)}
                      style={{
                        padding: "8px 10px",
                        fontSize: "0.78rem",
                        fontWeight: registerRole === r.id ? 600 : 500,
                        border: registerRole === r.id ? "1.5px solid #087F8C" : "1px solid #D9E2EC",
                        borderRadius: "8px",
                        background: registerRole === r.id ? "#EBF8FA" : "#FFFFFF",
                        color: registerRole === r.id ? "#087F8C" : "#52616B",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="input-control"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="e.g. Aryan Choudhury"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="input-control"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="aryan.patient"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="input-control"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="aryan@health.org"
                    required
                  />
                </div>
              </div>

              {registerRole === "doctor" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Specialty</label>
                    <input
                      type="text"
                      className="input-control"
                      value={registerSpecialty}
                      onChange={(e) => setRegisterSpecialty(e.target.value)}
                      placeholder="e.g. Cardiology OPD"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Hospital Affiliation</label>
                    <input
                      type="text"
                      className="input-control"
                      value={registerAffiliation}
                      onChange={(e) => setRegisterAffiliation(e.target.value)}
                      placeholder="e.g. AIIMS OPD"
                    />
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="input-control"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Create secure password"
                  required
                />
              </div>

              {(registerError || error) && (
                <div className="clinical-error-banner" style={{ margin: "4px 0 0 0" }}>
                  <div>{registerError || error}</div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: "100%", marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {loading ? (
                  <>
                    <SquareLoader size="sm" color="#FFFFFF" style={{ padding: 0 }} />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  "Complete Registration"
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* ── Fullscreen User Guide Video Modal ── */}
      {showGuideModal && (
        <div
          ref={modalContainerRef}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(16px, 3vw, 32px)",
            boxSizing: "border-box",
          }}
        >
          {/* Top Bar inside Fullscreen */}
          <div
            style={{
              width: "100%",
              maxWidth: "1280px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              color: "#FFFFFF",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "#087F8C",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  boxShadow: "0 2px 8px rgba(8, 127, 140, 0.4)",
                }}
              >
                <Video size={20} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
                    QRakshak Platform User Guide & System Walkthrough
                  </h2>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: "rgba(8, 127, 140, 0.3)",
                      border: "1px solid #087F8C",
                      color: "#A5F3FC",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Fullscreen Video
                  </span>
                </div>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.76rem", color: "#94A3B8" }}>
                  Official clinician & patient demonstration • Press <kbd style={{ background: "rgba(255,255,255,0.15)", padding: "1px 6px", borderRadius: "3px", color: "#FFFFFF", fontSize: "0.70rem" }}>ESC</kbd> or click Close to return
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={toggleFullscreen}
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#FFFFFF",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
                title="Toggle browser native fullscreen"
              >
                <Maximize2 size={14} />
                <span>Fullscreen</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                style={{
                  background: "rgba(239, 68, 68, 0.22)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#FCA5A5",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  transition: "all 0.15s ease",
                }}
                title="Close User Guide (Esc)"
              >
                <X size={16} />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Video Container Stage */}
          <div
            style={{
              width: "100%",
              maxWidth: "1280px",
              flex: 1,
              maxHeight: "calc(100vh - 120px)",
              background: "#000000",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Standard HTML5 Video Player */}
            <video
              ref={videoRef}
              src={guideVideoUrl}
              controls
              autoPlay
              playsInline
              onError={() => setVideoError(true)}
              onLoadedData={() => setVideoError(false)}
              style={{
                width: "100%",
                height: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: videoError ? "none" : "block",
              }}
            >
              Your browser does not support HTML5 video streaming.
            </video>

            {/* Video Placeholder / Fallback State */}
            {videoError && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "32px",
                  textAlign: "center",
                  color: "#FFFFFF",
                  maxWidth: "640px",
                  margin: "auto",
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "rgba(8, 127, 140, 0.18)",
                    border: "2px solid #087F8C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "18px",
                  }}
                >
                  <PlayCircle size={36} color="#087F8C" />
                </div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0 0 8px 0" }}>
                  User Guide Video Screen Ready
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#94A3B8", lineHeight: 1.6, margin: "0 0 20px 0" }}>
                  This full-screen video stage is configured for your walkthrough video. You can add your video file to{" "}
                  <code style={{ background: "rgba(255, 255, 255, 0.1)", padding: "3px 8px", borderRadius: "4px", color: "#38BDF8", fontFamily: "var(--font-mono)" }}>
                    frontend/public/videos/user-guide.mp4
                  </code>{" "}
                  or paste a link or choose a video file below:
                </p>

                {/* Quick File Upload / URL test for user */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder="Paste video URL (e.g. https://.../guide.mp4)"
                      onChange={(e) => {
                        if (e.target.value.trim()) {
                          setGuideVideoUrl(e.target.value.trim());
                          setVideoError(false);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                        fontSize: "0.82rem",
                      }}
                    />
                  </div>

                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "10px 18px",
                      background: "#087F8C",
                      color: "#FFFFFF",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                    }}
                  >
                    <Video size={16} />
                    <span>Select Video File to Test Fullscreen</span>
                    <input
                      type="file"
                      accept="video/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setGuideVideoUrl(url);
                          setVideoError(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
