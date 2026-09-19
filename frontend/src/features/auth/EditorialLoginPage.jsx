import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ShieldCheck,
  Lock,
  Play,
  Cpu,
  CheckCircle2
} from "lucide-react";
import { animateErrorShake } from "../../utils/motion.js";

export default function EditorialLoginPage({ onGoogleLogin, loading, error }) {
  const [showGuideModal, setShowGuideModal] = useState(false);
  const modalContainerRef = useRef(null);
  const narrativeRef = useRef(null);
  const formContainerRef = useRef(null);

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

  useEffect(() => {
    if (error && formContainerRef.current) {
      animateErrorShake(formContainerRef.current);
    }
  }, [error]);

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
        .editorial-google-btn {
          width: 100%;
          min-height: 54px;
          padding: 13px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: #FFFFFF;
          color: #000000;
          border: 1px solid #E2E8F0;
          border-radius: 4px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .editorial-google-btn:hover {
          background: #F8FAFC;
          border-color: #00E5A3;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 229, 163, 0.2);
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
        .editorial-main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          margin-top: 40px;
        }
        @media (max-width: 900px) {
          .editorial-main-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
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
        </div>
      </header>

      {/* Main Split Grid */}
      <main className="editorial-main-grid" style={{ flex: 1 }}>
        {/* Left Column Narrative */}
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
            Fast and reliable clinical triage, verified medical records, and secure doctor consultations powered by Quantum AI.
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
                <span style={{ fontSize: "0.70rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                  Early Detection
                </span>
                <span style={{ fontSize: "0.68rem", color: "#CBD5E1", border: "1px solid #2B3648", padding: "2px 7px" }}>
                  ESI 1-5
                </span>
              </div>
              <strong style={{ display: "block", fontSize: "0.92rem", color: "#FFFFFF", marginTop: "12px", fontWeight: 700 }}>
                Deterministic Triage
              </strong>
              <span style={{ display: "block", fontSize: "0.78rem", color: "#8B9BB4", marginTop: "5px", lineHeight: 1.5 }}>
                Standardized priority screening with instant vital sign and anomaly checks.
              </span>
            </div>

            <div className="editorial-spec-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.70rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                  Secure Records
                </span>
                <span style={{ fontSize: "0.68rem", color: "#CBD5E1", border: "1px solid #2B3648", padding: "2px 7px" }}>
                  Verified
                </span>
              </div>
              <strong style={{ display: "block", fontSize: "0.92rem", color: "#FFFFFF", marginTop: "12px", fontWeight: 700 }}>
                Protected Health Records
              </strong>
              <span style={{ display: "block", fontSize: "0.78rem", color: "#8B9BB4", marginTop: "5px", lineHeight: 1.5 }}>
                Tamper-evident medical history, digital prescriptions, and encrypted doctor consults.
              </span>
            </div>
          </div>

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
            padding: "clamp(40px, 5vw, 60px) clamp(28px, 4vw, 42px)",
            position: "relative",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center"
          }}
        >
          <div style={{ marginBottom: "32px" }}>
            <div style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              justifyContent: "center", 
              width: "60px", 
              height: "60px", 
              background: "#111722", 
              border: "1px solid #2B3648", 
              borderRadius: "50%",
              marginBottom: "20px"
            }}>
              <ShieldCheck size={28} color="#00E5A3" />
            </div>
            <h2
              style={{
                fontFamily: "var(--font-sans, inherit)",
                fontSize: "1.8rem",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                margin: "0 0 12px 0",
              }}
            >
              Sign in to Q-RAKSHAK
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#8B9BB4", margin: 0, lineHeight: 1.5, maxWidth: "300px" }}>
              Your Google account secures your clinical workspace.
            </p>
          </div>

          <div style={{ width: "100%", maxWidth: "320px", marginBottom: "30px" }}>
            <button
              type="button"
              onClick={onGoogleLogin}
              disabled={loading}
              className="editorial-google-btn"
            >
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
              </svg>
              <span>{loading ? "Connecting..." : "Sign in with Google"}</span>
            </button>
          </div>

          <div style={{ background: "rgba(0, 229, 163, 0.05)", border: "1px solid rgba(0, 229, 163, 0.2)", borderRadius: "6px", padding: "12px", maxWidth: "320px" }}>
            <p style={{ fontSize: "0.75rem", color: "#00E5A3", margin: 0, lineHeight: 1.5 }}>
              A security notification will be sent to your Gmail upon successful sign-in.
            </p>
          </div>

          {error && (
            <div style={{ marginTop: "20px", color: "#EF4444", fontSize: "0.85rem", fontWeight: 600 }}>
              {error}
            </div>
          )}
        </div>
      </main>

      <footer style={{ marginTop: "40px", borderTop: "1px solid #18202C", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", position: "relative", zIndex: 10 }}>
        <div style={{ fontSize: "0.75rem", color: "#475569" }}>
          &copy; 2026 Q-RAKSHAK Clinical Technology Platform. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <span style={{ fontSize: "0.75rem", color: "#475569", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#94A3B8"} onMouseLeave={e => e.currentTarget.style.color = "#475569"}>Privacy Policy</span>
          <span style={{ fontSize: "0.75rem", color: "#475569", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#94A3B8"} onMouseLeave={e => e.currentTarget.style.color = "#475569"}>Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}
