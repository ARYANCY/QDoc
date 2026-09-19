import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Play,
  X,
  Maximize2,
  Video,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Activity,
} from "lucide-react";
import SquareLoader from "../../components/common/SquareLoader.jsx";
import { animateErrorShake } from "../../utils/motion.js";
import { ENDPOINTS } from "../../api/config.js";

export default function EditorialLoginPage({ onLogin, onRegister, loading, error }) {
  const [authMode, setAuthMode] = useState("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideVideoUrl, setGuideVideoUrl] = useState("/videos/user-guide.mp4");
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const modalContainerRef = useRef(null);

  const [registerName, setRegisterName] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("patient");
  const [registerSpecialty, setRegisterSpecialty] = useState("");
  const [registerAffiliation, setRegisterAffiliation] = useState("");

  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  const formContainerRef = useRef(null);
  const narrativeRef = useRef(null);

  useEffect(() => {
    setLoginError("");
    setRegisterError("");
  }, [authMode]);

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

  // Smooth micro-stagger on auth mode toggle
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const isForward = authMode === "register";

    if (formContainerRef.current) {
      const staggerItems = formContainerRef.current.querySelectorAll(".stagger-auth-item");
      if (staggerItems && staggerItems.length > 0) {
        gsap.fromTo(
          staggerItems,
          { opacity: 0, y: isForward ? 10 : -10 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.03,
            duration: 0.3,
            ease: "power2.out",
            clearProps: "all",
          }
        );
      }
    }

    if (narrativeRef.current) {
      gsap.fromTo(
        narrativeRef.current,
        { opacity: 0.5, x: isForward ? -8 : 8 },
        { opacity: 1, x: 0, duration: 0.35, ease: "power2.out", clearProps: "all" }
      );
    }
  }, [authMode]);

  useEffect(() => {
    if ((loginError || registerError || error) && formContainerRef.current) {
      animateErrorShake(formContainerRef.current);
    }
  }, [loginError, registerError, error]);

  function handleSubmit(e) {
    e.preventDefault();
    setLoginError("");
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
    if (!registerName.trim()) {
      setRegisterError("Full name is required.");
      return;
    }
    if (!registerUsername.trim()) {
      setRegisterError("Username is required.");
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(registerUsername.trim())) {
      setRegisterError("Username may only contain letters, numbers, dots, hyphens, and underscores.");
      return;
    }
    if (!registerEmail.trim() || !registerEmail.includes("@")) {
      setRegisterError("Please enter a valid email address.");
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
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#07080B",
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        color: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "clamp(20px, 3.2vw, 42px)",
        overflowX: "hidden",
        position: "relative",
        boxSizing: "border-box",
        fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      }}
    >
      <style>{`
        /* Architectural Swiss Brutalist - Zero Radius, Zero Glow, High Contrast */
        .editorial-input {
          width: 100%;
          min-height: 52px;
          background-color: #0B0E14 !important;
          border: 1px solid #1E2837 !important;
          border-radius: 0px !important;
          padding: 14px 18px;
          font-size: 0.90rem;
          color: #F8FAFC !important;
          outline: none !important;
          box-shadow: none !important;
          transition: border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .editorial-input::placeholder {
          color: #475569 !important;
          font-size: 0.86rem;
        }
        .editorial-input:hover {
          border-color: #38465B !important;
        }
        .editorial-input:focus {
          border-color: #FFFFFF !important;
          background-color: #111722 !important;
          box-shadow: none !important;
        }
        .editorial-input:-webkit-autofill,
        .editorial-input:-webkit-autofill:hover, 
        .editorial-input:-webkit-autofill:focus,
        .editorial-input:-webkit-autofill:active {
          -webkit-text-fill-color: #F8FAFC !important;
          -webkit-box-shadow: 0 0 0px 1000px #0B0E14 inset !important;
          box-shadow: 0 0 0px 1000px #0B0E14 inset !important;
          transition: background-color 5000s ease-in-out 0s;
          caret-color: #F8FAFC;
        }
        .editorial-btn-primary {
          width: 100%;
          min-height: 52px;
          background: #FFFFFF !important;
          color: #000000 !important;
          border: 1px solid #FFFFFF !important;
          border-radius: 0px !important;
          padding: 15px 24px;
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
          box-shadow: none !important;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .editorial-btn-primary:hover:not(:disabled) {
          background: #D9E0EB !important;
          border-color: #D9E0EB !important;
          color: #000000 !important;
        }
        .editorial-btn-primary:hover:not(:disabled) .cta-arrow {
          transform: translateX(5px);
        }
        .editorial-btn-primary:active:not(:disabled) {
          background: #B4C0D1 !important;
          border-color: #B4C0D1 !important;
        }
        .editorial-btn-primary:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .cta-arrow {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .editorial-google-btn {
          width: 100%;
          min-height: 50px;
          padding: 13px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: #0B0E14;
          color: #F8FAFC;
          border: 1px solid #1E2837;
          border-radius: 0px !important;
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: none !important;
          transition: border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease;
        }
        .editorial-google-btn:hover {
          background: #141A26;
          border-color: #FFFFFF;
        }
        .editorial-role-btn {
          min-height: 46px;
          padding: 11px 16px;
          font-size: 0.82rem;
          font-family: inherit;
          font-weight: 600;
          border-radius: 0px !important;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          box-shadow: none !important;
        }
        .editorial-role-btn.active {
          border: 1px solid #FFFFFF !important;
          background: #18202D !important;
          color: #FFFFFF !important;
          font-weight: 700;
        }
        .editorial-role-btn.inactive {
          border: 1px solid #1E2837 !important;
          background: #080B10 !important;
          color: #64748B !important;
        }
        .editorial-role-btn.inactive:hover {
          background: #0E131C !important;
          border-color: #38465B !important;
          color: #CBD5E1 !important;
        }
        .editorial-spec-card {
          padding: 22px 24px;
          background: #0B0E14;
          border: 1px solid #1B2433;
          border-radius: 0px !important;
          box-shadow: none !important;
          transition: border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .editorial-spec-card:hover {
          border-color: #38465B;
        }
      `}</style>

      {/* Top Architectural Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #18202C",
          paddingBottom: "20px",
          gap: "20px",
          flexWrap: "wrap",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontFamily: "var(--font-sans, inherit)",
              fontSize: "1.15rem",
              fontWeight: 800,
              letterSpacing: "0.03em",
              color: "#FFFFFF",
              textTransform: "uppercase",
            }}
          >
            QRakshak
          </span>
          <span style={{ color: "#2B3648", fontSize: "0.95rem" }}>/</span>
          <span
            style={{
              fontSize: "0.74rem",
              color: "#64748B",
              fontFamily: "var(--font-mono, monospace)",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
          >
            Clinical Intelligence Platform
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "7px 14px",
              borderRadius: "0px",
              background: "#0B0E14",
              border: "1px solid #1E2837",
            }}
          >
            <ShieldCheck size={14} color="#94A3B8" />
            <span
              style={{
                fontSize: "0.70rem",
                color: "#94A3B8",
                fontWeight: 600,
                fontFamily: "var(--font-mono, monospace)",
                letterSpacing: "0.05em",
              }}
            >
              HIPAA • DPDP-2023 Certified
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              fontSize: "0.76rem",
              fontWeight: 700,
              background: "transparent",
              border: "1px solid #28364A",
              color: "#F8FAFC",
              cursor: "pointer",
              borderRadius: "0px",
              boxShadow: "none",
              letterSpacing: "0.03em",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FFFFFF";
              e.currentTarget.style.color = "#000000";
              e.currentTarget.style.borderColor = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#F8FAFC";
              e.currentTarget.style.borderColor = "#28364A";
            }}
            title="Open Platform Walkthrough"
          >
            <Play size={12} />
            <span>Platform Guide</span>
          </button>
        </div>
      </header>

      {/* Main Split Grid */}
      <main className="editorial-main-grid">
        {/* Left Column */}
        <div
          ref={narrativeRef}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-sans, inherit)",
                fontSize: "clamp(2.5rem, 4.4vw, 4.2rem)",
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                color: "#FFFFFF",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Clinical Precision. <br />
              <span style={{ color: "#8A99B0" }}>
                Objective Triage.
              </span>
            </h1>
          </div>

          <p
            style={{
              fontSize: "0.96rem",
              lineHeight: 1.7,
              color: "#8B9BB4",
              maxWidth: "560px",
              margin: 0,
            }}
          >
            {authMode === "credentials"
              ? "Fast and reliable clinical triage, verified medical records, and secure doctor consultations."
              : "Create an account to access structured triage, consult doctors, and manage verified health records."}
          </p>

          {/* Spec Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              borderTop: "1px solid #18202C",
              paddingTop: "24px",
            }}
          >
            <div className="editorial-spec-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "0.70rem",
                    color: "#64748B",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Early Detection
                </span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "#CBD5E1",
                    fontWeight: 600,
                    border: "1px solid #2B3648",
                    padding: "2px 7px",
                    borderRadius: "0px",
                  }}
                >
                  ESI 1-5
                </span>
              </div>
              <strong
                style={{
                  display: "block",
                  fontSize: "0.92rem",
                  color: "#FFFFFF",
                  marginTop: "12px",
                  fontWeight: 700,
                }}
              >
                Deterministic Triage
              </strong>
              <span
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  color: "#8B9BB4",
                  marginTop: "5px",
                  lineHeight: 1.5,
                }}
              >
                Standardized priority screening with instant vital sign and anomaly checks.
              </span>
            </div>

            <div className="editorial-spec-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "0.70rem",
                    color: "#64748B",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Secure Records
                </span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "#CBD5E1",
                    fontWeight: 600,
                    border: "1px solid #2B3648",
                    padding: "2px 7px",
                    borderRadius: "0px",
                  }}
                >
                  Verified
                </span>
              </div>
              <strong
                style={{
                  display: "block",
                  fontSize: "0.92rem",
                  color: "#FFFFFF",
                  marginTop: "12px",
                  fontWeight: 700,
                }}
              >
                Protected Health Records
              </strong>
              <span
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  color: "#8B9BB4",
                  marginTop: "5px",
                  lineHeight: 1.5,
                }}
              >
                Tamper-evident medical history, digital prescriptions, and encrypted doctor consults.
              </span>
            </div>
          </div>

          {/* Clean Video Trigger */}
          <div
            onClick={() => setShowGuideModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              background: "#0B0E14",
              border: "1px solid #1E2837",
              borderRadius: "0px",
              cursor: "pointer",
              transition: "border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#FFFFFF";
              e.currentTarget.style.background = "#111622";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#1E2837";
              e.currentTarget.style.background = "#0B0E14";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "0px",
                  background: "#161E2C",
                  border: "1px solid #2B3A4F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  flexShrink: 0,
                }}
              >
                <Play size={14} fill="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#FFFFFF" }}>
                  Platform Walkthrough & Video Guide
                </div>
                <div style={{ fontSize: "0.74rem", color: "#64748B", marginTop: "2px" }}>
                  Watch a quick demonstration of patient and clinician workflows
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: "0.76rem",
                fontWeight: 700,
                color: "#FFFFFF",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              Watch Video ↗
            </span>
          </div>

          {/* Minimalist Verification Indicators */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px", borderTop: "1px solid #141A24", paddingTop: "16px" }}>
            <span style={{ fontSize: "0.72rem", color: "#64748B", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={13} color="#94A3B8" /> Verified Security
            </span>
            <span style={{ fontSize: "0.72rem", color: "#64748B", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Lock size={13} color="#94A3B8" /> Encrypted Data
            </span>
            <span style={{ fontSize: "0.72rem", color: "#64748B", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Cpu size={13} color="#94A3B8" /> Fast Triage
            </span>
          </div>
        </div>

        {/* Right Authentication Cockpit */}
        <div
          ref={formContainerRef}
          style={{
            background: "#0B0E14",
            border: "1px solid #1E2837",
            borderRadius: "0px",
            padding: "clamp(28px, 3.8vw, 42px)",
            position: "relative",
            boxShadow: "none",
            overflow: "hidden",
          }}
        >
          {/* Header Block */}
          <div className="stagger-auth-item" style={{ marginBottom: "22px" }}>
            <span
              style={{
                fontSize: "0.70rem",
                color: "#64748B",
                textTransform: "uppercase",
                fontWeight: 700,
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: "4px",
              }}
            >
              {authMode === "credentials" ? "Account Access" : "Create Account"}
            </span>
            <h2
              style={{
                fontFamily: "var(--font-sans, inherit)",
                fontSize: "1.65rem",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {authMode === "credentials" ? "Sign In" : "Register"}
            </h2>
            <p style={{ fontSize: "0.84rem", color: "#64748B", marginTop: "6px", margin: 0, lineHeight: 1.5 }}>
              {authMode === "credentials"
                ? "Enter your credentials to access your account."
                : "Fill in your details to set up your account."}
            </p>
          </div>

          {/* Clean Segmented Tab Switcher */}
          <div
            className="stagger-auth-item"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              background: "#07090D",
              border: "1px solid #1E2837",
              borderRadius: "0px",
              marginBottom: "22px",
              padding: "4px",
              gap: "4px",
            }}
          >
            <button
              type="button"
              onClick={() => setAuthMode("credentials")}
              style={{
                padding: "11px 16px",
                fontSize: "0.82rem",
                fontWeight: 700,
                borderRadius: "0px",
                border: "none",
                background: authMode === "credentials" ? "#FFFFFF" : "transparent",
                color: authMode === "credentials" ? "#000000" : "#64748B",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              style={{
                padding: "11px 16px",
                fontSize: "0.82rem",
                fontWeight: 700,
                borderRadius: "0px",
                border: "none",
                background: authMode === "register" ? "#FFFFFF" : "transparent",
                color: authMode === "register" ? "#000000" : "#64748B",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              Register
            </button>
          </div>

          {authMode === "credentials" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="stagger-auth-item">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = ENDPOINTS.AUTH_GOOGLE;
                  }}
                  className="editorial-google-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#FFFFFF"/>
                    <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#94A3B8"/>
                    <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#64748B"/>
                    <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#CBD5E1"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", margin: "18px 0 10px 0" }}>
                  <div style={{ flex: 1, height: "1px", background: "#18202C" }} />
                  <span style={{ padding: "0 12px", fontSize: "0.66rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Or continue with credentials
                  </span>
                  <div style={{ flex: 1, height: "1px", background: "#18202C" }} />
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="stagger-auth-item">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
                    <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#94A3B8" }}>
                      Select Role
                    </label>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                    {[
                      { id: "patient", label: "Patient" },
                      { id: "doctor", label: "Clinician" },
                      { id: "admin", label: "Auditor" },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSelectedRole(r.id);
                          setLoginError("");
                        }}
                        className={`editorial-role-btn ${selectedRole === r.id ? "active" : "inactive"}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="stagger-auth-item" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#94A3B8" }}>
                    Username or Email
                  </label>
                  <input
                    type="text"
                    className="editorial-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username or email"
                    required
                  />
                </div>

                <div className="stagger-auth-item" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#94A3B8" }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.72rem",
                        color: "#94A3B8",
                        padding: 0,
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{showPassword ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="editorial-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {(loginError || error) && (
                  <div
                    className="stagger-auth-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "11px 14px",
                      background: "#180D11",
                      border: "1px solid #7F1D1D",
                      borderRadius: "0px",
                      color: "#FCA5A5",
                      fontSize: "0.80rem",
                      fontWeight: 600,
                    }}
                  >
                    <AlertCircle size={15} color="#F87171" style={{ flexShrink: 0 }} />
                    <span>{loginError || error}</span>
                  </div>
                )}

                <div className="stagger-auth-item" style={{ marginTop: "4px" }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="editorial-btn-primary"
                  >
                    {loading ? (
                      <>
                        <SquareLoader size="sm" color="#000000" style={{ padding: 0 }} />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={15} className="cta-arrow" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="stagger-auth-item" style={{ textAlign: "center", marginTop: "6px" }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#475569",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Lock size={11} color="#64748B" />
                  Protected with end-to-end encryption
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="stagger-auth-item">
                <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: "7px" }}>
                  Account Type
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {[
                    { id: "patient", label: "Patient" },
                    { id: "doctor", label: "Clinician" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRegisterRole(r.id)}
                      className={`editorial-role-btn ${registerRole === r.id ? "active" : "inactive"}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="stagger-auth-item" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#94A3B8" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="editorial-input"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="e.g. Dr. Aryan Sharma"
                  required
                />
              </div>

              <div className="stagger-auth-item" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
                  <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#94A3B8" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    className="editorial-input"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="e.g. aryan"
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
                  <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#94A3B8" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="editorial-input"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="e.g. aryan@hospital.org"
                    required
                  />
                </div>
              </div>

              {registerRole === "doctor" && (
                <div className="stagger-auth-item" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
                    <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#94A3B8" }}>
                      Medical Specialty
                    </label>
                    <input
                      type="text"
                      className="editorial-input"
                      value={registerSpecialty}
                      onChange={(e) => setRegisterSpecialty(e.target.value)}
                      placeholder="e.g. Emergency Medicine"
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
                    <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#94A3B8" }}>
                      Hospital Affiliation
                    </label>
                    <input
                      type="text"
                      className="editorial-input"
                      value={registerAffiliation}
                      onChange={(e) => setRegisterAffiliation(e.target.value)}
                      placeholder="e.g. City Hospital"
                    />
                  </div>
                </div>
              )}

              <div className="stagger-auth-item" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#94A3B8" }}>
                  Password
                </label>
                <input
                  type="password"
                  className="editorial-input"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              {(registerError || error) && (
                <div
                  className="stagger-auth-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "11px 14px",
                    background: "#180D11",
                    border: "1px solid #7F1D1D",
                    borderRadius: "0px",
                    color: "#FCA5A5",
                    fontSize: "0.80rem",
                    fontWeight: 600,
                  }}
                >
                  <AlertCircle size={15} color="#F87171" style={{ flexShrink: 0 }} />
                  <span>{registerError || error}</span>
                </div>
              )}

              <div className="stagger-auth-item" style={{ marginTop: "4px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="editorial-btn-primary"
                >
                  {loading ? (
                    <>
                      <SquareLoader size="sm" color="#000000" style={{ padding: 0 }} />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={15} className="cta-arrow" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Fullscreen User Guide Video Modal */}
      {showGuideModal && (
        <div
          ref={modalContainerRef}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(5, 7, 10, 0.96)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(20px, 3.5vw, 36px)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1360px",
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
                  borderRadius: "0px",
                  background: "#161E2C",
                  border: "1px solid #2B3A4F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                }}
              >
                <Video size={18} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 style={{ margin: 0, fontSize: "1.10rem", fontWeight: 800 }}>
                    Platform Video Guide & Walkthrough
                  </h2>
                </div>
                <p style={{ margin: "3px 0 0 0", fontSize: "0.74rem", color: "#64748B" }}>
                  Press ESC or click Close to return
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={toggleFullscreen}
                style={{
                  background: "transparent",
                  border: "1px solid #2B3A4F",
                  color: "#FFFFFF",
                  padding: "8px 16px",
                  borderRadius: "0px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2B3A4F";
                }}
              >
                <Maximize2 size={14} />
                <span>Fullscreen</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                style={{
                  background: "transparent",
                  border: "1px solid #7F1D1D",
                  color: "#FCA5A5",
                  padding: "8px 16px",
                  borderRadius: "0px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#7F1D1D";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#FCA5A5";
                }}
              >
                <X size={15} />
                <span>Close</span>
              </button>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: "1360px",
              flex: 1,
              maxHeight: "calc(100vh - 120px)",
              background: "#000000",
              borderRadius: "0px",
              overflow: "hidden",
              border: "1px solid #222C3D",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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
              HTML5 video playback unsupported.
            </video>

            {videoError && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "36px",
                  textAlign: "center",
                  color: "#FFFFFF",
                  maxWidth: "600px",
                  margin: "auto",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "0px",
                    background: "#111622",
                    border: "1px solid #2B3A4F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "18px",
                  }}
                >
                  <Video size={24} color="#FFFFFF" />
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 8px 0" }}>
                  Platform Video Guide Ready
                </h3>
                <p style={{ fontSize: "0.82rem", color: "#8B9BB4", lineHeight: 1.6, margin: "0 0 20px 0" }}>
                  Place your product video at{" "}
                  <code style={{ background: "#161D29", padding: "3px 8px", borderRadius: "0px", color: "#CBD5E1", fontFamily: "var(--font-mono, monospace)" }}>
                    frontend/public/videos/user-guide.mp4
                  </code>{" "}
                  or load a video source below:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder="Paste video URL"
                      onChange={(e) => {
                        if (e.target.value.trim()) {
                          setGuideVideoUrl(e.target.value.trim());
                          setVideoError(false);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "11px 14px",
                        background: "#0B0E14",
                        border: "1px solid #222C3D",
                        borderRadius: "0px",
                        color: "#FFFFFF",
                        fontSize: "0.82rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "11px 18px",
                      background: "#FFFFFF",
                      color: "#000000",
                      borderRadius: "0px",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                    }}
                  >
                    <Video size={15} />
                    <span>Select Local Video</span>
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
