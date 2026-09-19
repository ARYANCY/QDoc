import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ShieldCheck,
  Lock,
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  PlayCircle,
  X,
  Maximize2,
  Video,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Cpu,
} from "lucide-react";
import SquareLoader from "../../components/common/SquareLoader.jsx";
import DNAHelixAnimation from "../../components/common/DNAHelixAnimation.jsx";
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

  const pageRef = useRef(null);
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

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const isForward = authMode === "register";
    const deltaX = isForward ? 16 : -16;

    if (formContainerRef.current) {
      gsap.fromTo(
        formContainerRef.current,
        { opacity: 0, x: deltaX },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
      );
    }

    if (narrativeRef.current) {
      gsap.fromTo(
        narrativeRef.current,
        { opacity: 0, y: isForward ? 8 : -8 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
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
        backgroundColor: "#06090F",
        backgroundImage: `
          radial-gradient(circle at 10% 12%, rgba(14, 165, 233, 0.16) 0%, transparent 45%),
          radial-gradient(circle at 90% 88%, rgba(16, 185, 129, 0.14) 0%, transparent 45%),
          radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.10) 0%, transparent 55%),
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 100% 100%, 100% 100%, 48px 48px, 48px 48px",
        color: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "clamp(16px, 2.8vw, 32px)",
        overflowX: "hidden",
        position: "relative",
        boxSizing: "border-box",
        fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif)",
      }}
    >
      <style>{`
        .editorial-cyber-input {
          width: 100%;
          background: rgba(2, 6, 23, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 0.86rem;
          color: #F8FAFC;
          outline: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
          font-family: inherit;
        }
        .editorial-cyber-input::placeholder {
          color: #475569;
        }
        .editorial-cyber-input:focus {
          border-color: #38BDF8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.22), 0 0 16px rgba(56, 189, 248, 0.15);
          background: rgba(2, 6, 23, 0.85);
        }
        .editorial-glow-cta {
          background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #10B981 100%);
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          padding: 12px 18px;
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 20px rgba(6, 182, 212, 0.38), 0 1px 2px rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }
        .editorial-glow-cta:hover:not(:disabled) {
          transform: translateY(-1.5px);
          box-shadow: 0 8px 30px rgba(6, 182, 212, 0.55), 0 2px 6px rgba(0, 0, 0, 0.3);
          filter: brightness(1.06);
        }
        .editorial-glow-cta:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 12px rgba(6, 182, 212, 0.3);
        }
        .editorial-glow-cta:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }
        .editorial-google-btn {
          width: 100%;
          padding: 11px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.04);
          color: #F8FAFC;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 10px;
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(8px);
        }
        .editorial-google-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(56, 189, 248, 0.5);
          box-shadow: 0 4px 20px rgba(56, 189, 248, 0.2);
          transform: translateY(-1px);
        }
        .editorial-role-btn {
          padding: 9px 12px;
          font-size: 0.80rem;
          font-family: inherit;
          font-weight: 600;
          border-radius: 9px;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .editorial-role-btn.active {
          border: 1.5px solid #38BDF8;
          background: rgba(56, 189, 248, 0.14);
          color: #38BDF8;
          box-shadow: 0 0 16px rgba(56, 189, 248, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .editorial-role-btn.inactive {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          color: #94A3B8;
        }
        .editorial-role-btn.inactive:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.16);
          color: #E2E8F0;
        }
      `}</style>

      <DNAHelixAnimation style={{ opacity: 0.35, filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.25))" }} />

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
          opacity: 0.35,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cyberDnaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          d="M -100,200 Q 150,100 400,250 T 900,200 T 1400,280 T 1900,180"
          fill="none"
          stroke="url(#cyberDnaGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <path
          d="M -100,260 Q 150,360 400,210 T 900,260 T 1400,180 T 1900,280"
          fill="none"
          stroke="url(#cyberDnaGrad)"
          strokeWidth="1.5"
        />
        {[200, 360, 520, 680, 840, 1000, 1160, 1320, 1480, 1640].map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={210 + Math.sin(i) * 20}
            x2={x}
            y2={250 - Math.sin(i) * 20}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1"
          />
        ))}
      </svg>

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "16px",
          gap: "14px",
          flexWrap: "wrap",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(56, 189, 248, 0.25)",
            }}
          >
            <Activity size={19} color="#38BDF8" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span
              style={{
                fontFamily: "var(--font-display, inherit)",
                fontSize: "1.32rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
              }}
            >
              <span style={{ color: "#38BDF8" }}>Q</span>Rakshak
            </span>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.68rem",
                color: "#38BDF8",
                fontWeight: 600,
                background: "rgba(14, 165, 233, 0.12)",
                padding: "2px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#10B981",
                  boxShadow: "0 0 8px #10B981",
                  display: "inline-block",
                }}
              />
              <span>Quantum Clinical Platform v3.4</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "5px 12px",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <ShieldCheck size={13} color="#10B981" />
            <span
              style={{
                fontSize: "0.70rem",
                color: "#94A3B8",
                fontWeight: 600,
                fontFamily: "var(--font-mono, monospace)",
                letterSpacing: "0.04em",
              }}
            >
              HIPAA SAFE HARBOR • DPDP 2023 READY
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "7px 15px",
              fontSize: "0.76rem",
              fontWeight: 700,
              background: "rgba(14, 165, 233, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              color: "#38BDF8",
              cursor: "pointer",
              borderRadius: "9px",
              boxShadow: "0 0 14px rgba(14, 165, 233, 0.15)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(14, 165, 233, 0.2)";
              e.currentTarget.style.borderColor = "#38BDF8";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(56, 189, 248, 0.3)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(14, 165, 233, 0.12)";
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.35)";
              e.currentTarget.style.boxShadow = "0 0 14px rgba(14, 165, 233, 0.15)";
              e.currentTarget.style.transform = "none";
            }}
            title="Open Platform Walkthrough and User Guide"
          >
            <PlayCircle size={15} color="#38BDF8" />
            <span>Platform Guide</span>
          </button>
        </div>
      </header>

      <main className="editorial-main-grid">
        <div
          ref={narrativeRef}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "22px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "4px 12px",
                background: "rgba(14, 165, 233, 0.10)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                borderRadius: "999px",
                marginBottom: "16px",
                boxShadow: "0 0 15px rgba(14, 165, 233, 0.12)",
              }}
            >
              <Sparkles size={12} color="#38BDF8" />
              <span
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.08em",
                  color: "#38BDF8",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Next-Gen Healthcare Intelligence
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display, inherit)",
                fontSize: "clamp(2.1rem, 3.8vw, 3.4rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                margin: 0,
              }}
            >
              Clinical precision, <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #38BDF8 0%, #34D399 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                human-centered care.
              </span>
            </h1>
          </div>

          <p
            style={{
              fontSize: "0.94rem",
              lineHeight: 1.65,
              color: "#94A3B8",
              maxWidth: "510px",
              margin: 0,
            }}
          >
            {authMode === "credentials"
              ? "Access quantum multi-modal clinical intelligence, real-time vital indicators, encrypted doctor consultations, and certified tamper-proof medical documentation."
              : "Register your clinical persona to participate in collaborative consultations, record verified health indicators, and maintain immutable cryptographic health records."}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "20px",
            }}
          >
            <div
              style={{
                padding: "16px",
                background: "rgba(15, 23, 42, 0.55)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                backdropFilter: "blur(14px)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.62rem",
                    color: "#38BDF8",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  MODALITY 01
                </span>
                <span
                  style={{
                    fontSize: "0.62rem",
                    color: "#34D399",
                    fontWeight: 700,
                    background: "rgba(16, 185, 129, 0.12)",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                  }}
                >
                  99.4% AUC
                </span>
              </div>
              <strong
                style={{
                  display: "block",
                  fontSize: "0.90rem",
                  color: "#FFFFFF",
                  marginTop: "6px",
                  fontWeight: 700,
                }}
              >
                Early Risk Stratification
              </strong>
              <span
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "#94A3B8",
                  marginTop: "4px",
                  lineHeight: 1.45,
                }}
              >
                Multi-organ biomarker screening & explainable AI diagnostic pathways.
              </span>
            </div>

            <div
              style={{
                padding: "16px",
                background: "rgba(15, 23, 42, 0.55)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                backdropFilter: "blur(14px)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.62rem",
                    color: "#38BDF8",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  MODALITY 02
                </span>
                <span
                  style={{
                    fontSize: "0.62rem",
                    color: "#38BDF8",
                    fontWeight: 700,
                    background: "rgba(14, 165, 233, 0.12)",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                  }}
                >
                  WebRTC E2EE
                </span>
              </div>
              <strong
                style={{
                  display: "block",
                  fontSize: "0.90rem",
                  color: "#FFFFFF",
                  marginTop: "6px",
                  fontWeight: 700,
                }}
              >
                Doctor Consultations
              </strong>
              <span
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "#94A3B8",
                  marginTop: "4px",
                  lineHeight: 1.45,
                }}
              >
                Encrypted peer-to-peer telehealth, digital prescriptions & 3D organ twin.
              </span>
            </div>
          </div>

          <div
            onClick={() => setShowGuideModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "15px 18px",
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(2, 6, 23, 0.85) 100%)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "14px",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#38BDF8";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(56, 189, 248, 0.25)";
              e.currentTarget.style.transform = "translateY(-1.5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.25)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.35)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #0EA5E9 0%, #10B981 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  flexShrink: 0,
                  boxShadow: "0 0 16px rgba(14, 165, 233, 0.4)",
                }}
              >
                <PlayCircle size={22} />
              </div>
              <div>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#FFFFFF" }}>
                  New to QRakshak? Watch Platform Tour
                </div>
                <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: "2px" }}>
                  Interactive fullscreen video demonstration & clinical walkthrough
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: "0.76rem",
                fontWeight: 700,
                color: "#38BDF8",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
              }}
            >
              Play Video ↗
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", opacity: 0.85 }}>
            <span style={{ fontSize: "0.70rem", color: "#64748B", display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <CheckCircle2 size={12} color="#10B981" /> SHA-256 Tamper Proof
            </span>
            <span style={{ fontSize: "0.70rem", color: "#64748B", display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <Lock size={12} color="#38BDF8" /> Zero-Knowledge Access
            </span>
            <span style={{ fontSize: "0.70rem", color: "#64748B", display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <Cpu size={12} color="#A78BFA" /> Quantum Enhanced
            </span>
          </div>
        </div>

        <div
          ref={formContainerRef}
          style={{
            background: "rgba(13, 19, 33, 0.78)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255, 255, 255, 0.10)",
            borderRadius: "20px",
            padding: "clamp(24px, 3.5vw, 36px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(14, 165, 233, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
            position: "relative",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                color: "#38BDF8",
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
                fontFamily: "var(--font-display, inherit)",
                fontSize: "1.55rem",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {authMode === "credentials" ? "Sign in to QRakshak" : "Create Clinical Account"}
            </h2>
            <p style={{ fontSize: "0.82rem", color: "#94A3B8", marginTop: "5px", margin: 0 }}>
              {authMode === "credentials"
                ? "Enter your verified credentials to access your clinical dashboard."
                : "Fill in your profile information to initialize your cryptographic health identity."}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              background: "rgba(2, 6, 23, 0.65)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "4px",
              borderRadius: "12px",
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
                fontWeight: authMode === "credentials" ? 700 : 500,
                borderRadius: "8px",
                border: authMode === "credentials" ? "1px solid rgba(56, 189, 248, 0.45)" : "none",
                background:
                  authMode === "credentials"
                    ? "linear-gradient(135deg, rgba(14, 165, 233, 0.22) 0%, rgba(16, 185, 129, 0.18) 100%)"
                    : "transparent",
                color: authMode === "credentials" ? "#FFFFFF" : "#64748B",
                boxShadow: authMode === "credentials" ? "0 2px 10px rgba(14, 165, 233, 0.2)" : "none",
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
                fontWeight: authMode === "register" ? 700 : 500,
                borderRadius: "8px",
                border: authMode === "register" ? "1px solid rgba(56, 189, 248, 0.45)" : "none",
                background:
                  authMode === "register"
                    ? "linear-gradient(135deg, rgba(14, 165, 233, 0.22) 0%, rgba(16, 185, 129, 0.18) 100%)"
                    : "transparent",
                color: authMode === "register" ? "#FFFFFF" : "#64748B",
                boxShadow: authMode === "register" ? "0 2px 10px rgba(14, 165, 233, 0.2)" : "none",
                cursor: "pointer",
                transition: "all 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              New Registration
            </button>
          </div>

          {authMode === "credentials" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = ENDPOINTS.AUTH_GOOGLE;
                  }}
                  className="editorial-google-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                    <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                    <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                    <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
                  </svg>
                  <span>Sign In with Google</span>
                </button>
                <div style={{ display: "flex", alignItems: "center", margin: "14px 0 8px 0" }}>
                  <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent)" }} />
                  <span style={{ padding: "0 10px", fontSize: "0.66rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700 }}>
                    or clinical credentials
                  </span>
                  <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent)" }} />
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#CBD5E1" }}>
                      Clearance Level
                    </label>
                    <span style={{ fontSize: "0.66rem", color: "#64748B", fontWeight: 600 }}>
                      Select security tier
                    </span>
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

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#CBD5E1" }}>
                    Username or Email
                  </label>
                  <input
                    type="text"
                    className="editorial-cyber-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username or email"
                    required
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#CBD5E1" }}>
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
                        color: "#38BDF8",
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
                    className="editorial-cyber-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>

                {(loginError || error) && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "9px 12px",
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.35)",
                      borderRadius: "8px",
                      color: "#FCA5A5",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    <AlertCircle size={15} color="#F87171" style={{ flexShrink: 0 }} />
                    <span>{loginError || error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="editorial-glow-cta"
                  style={{ width: "100%", marginTop: "4px" }}
                >
                  {loading ? (
                    <>
                      <SquareLoader size="sm" color="#FFFFFF" style={{ padding: 0 }} />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Workspace</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: "2px" }}>
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "#64748B",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Lock size={11} color="#34D399" />
                  Verified login security notice dispatched to your email on sign-in
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#CBD5E1", display: "block", marginBottom: "6px" }}>
                  Registering Persona
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
                      className={`editorial-role-btn ${registerRole === r.id ? "active" : "inactive"}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#CBD5E1" }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  className="editorial-cyber-input"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="e.g. Aryan Choudhury"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#CBD5E1" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    className="editorial-cyber-input"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="aryan.patient"
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#CBD5E1" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="editorial-cyber-input"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="aryan@health.org"
                    required
                  />
                </div>
              </div>

              {registerRole === "doctor" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#CBD5E1" }}>
                      Medical Specialty
                    </label>
                    <input
                      type="text"
                      className="editorial-cyber-input"
                      value={registerSpecialty}
                      onChange={(e) => setRegisterSpecialty(e.target.value)}
                      placeholder="e.g. Cardiology OPD"
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#CBD5E1" }}>
                      Hospital Affiliation
                    </label>
                    <input
                      type="text"
                      className="editorial-cyber-input"
                      value={registerAffiliation}
                      onChange={(e) => setRegisterAffiliation(e.target.value)}
                      placeholder="e.g. AIIMS Clinical OPD"
                    />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#CBD5E1" }}>
                  Password
                </label>
                <input
                  type="password"
                  className="editorial-cyber-input"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Create secure password (min. 6 chars)"
                  required
                />
              </div>

              {(registerError || error) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 12px",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    borderRadius: "8px",
                    color: "#FCA5A5",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}
                >
                  <AlertCircle size={15} color="#F87171" style={{ flexShrink: 0 }} />
                  <span>{registerError || error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="editorial-glow-cta"
                style={{ width: "100%", marginTop: "4px" }}
              >
                {loading ? (
                  <>
                    <SquareLoader size="sm" color="#FFFFFF" style={{ padding: 0 }} />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {showGuideModal && (
        <div
          ref={modalContainerRef}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(2, 6, 23, 0.96)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(16px, 3vw, 32px)",
            boxSizing: "border-box",
          }}
        >
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
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #0EA5E9 0%, #10B981 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  boxShadow: "0 0 16px rgba(14, 165, 233, 0.4)",
                }}
              >
                <Video size={20} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
                    QRakshak Platform User Guide & Walkthrough
                  </h2>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: "rgba(14, 165, 233, 0.2)",
                      border: "1px solid rgba(56, 189, 248, 0.4)",
                      color: "#38BDF8",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Fullscreen Video
                  </span>
                </div>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.76rem", color: "#94A3B8" }}>
                  Official clinician & patient demonstration • Press <kbd style={{ background: "rgba(255,255,255,0.12)", padding: "1px 6px", borderRadius: "3px", color: "#FFFFFF", fontSize: "0.70rem" }}>ESC</kbd> or click Close to return
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={toggleFullscreen}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
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
              >
                <Maximize2 size={14} />
                <span>Fullscreen</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                style={{
                  background: "rgba(239, 68, 68, 0.18)",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
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
              >
                <X size={16} />
                <span>Close</span>
              </button>
            </div>
          </div>

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
                    width: "68px",
                    height: "68px",
                    borderRadius: "50%",
                    background: "rgba(14, 165, 233, 0.15)",
                    border: "2px solid #0EA5E9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "18px",
                  }}
                >
                  <PlayCircle size={36} color="#38BDF8" />
                </div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0 0 8px 0" }}>
                  User Guide Video Screen Ready
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#94A3B8", lineHeight: 1.6, margin: "0 0 20px 0" }}>
                  This full-screen video stage is configured for your walkthrough video. You can add your video file to{" "}
                  <code style={{ background: "rgba(255, 255, 255, 0.1)", padding: "3px 8px", borderRadius: "4px", color: "#38BDF8", fontFamily: "var(--font-mono, monospace)" }}>
                    frontend/public/videos/user-guide.mp4
                  </code>{" "}
                  or paste a link below:
                </p>

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
                      background: "linear-gradient(135deg, #0EA5E9 0%, #10B981 100%)",
                      color: "#FFFFFF",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                    }}
                  >
                    <Video size={16} />
                    <span>Select Local Video File</span>
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
