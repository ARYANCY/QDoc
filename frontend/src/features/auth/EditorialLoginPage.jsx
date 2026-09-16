import { useState, useEffect, useRef } from "react";
import { animateEntrance, animateEditorialHero } from "../../utils/motion";
import gsap from "gsap";

export default function EditorialLoginPage({ onLogin, onRegister, loading, error }) {
  const [authMode, setAuthMode] = useState("credentials"); // "credentials" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("patient");
  const [registerName, setRegisterName] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("patient");
  const [registerSpecialty, setRegisterSpecialty] = useState("General Medicine & Clinical AI");
  const [registerAffiliation, setRegisterAffiliation] = useState("AIIMS Clinical AI OPD");
  const [showPassword, setShowPassword] = useState(false);

  const pageRef = useRef(null);
  const cardRef = useRef(null);

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
  }, [authMode]);



  function handleRoleChange(role) {
    setSelectedRole(role);
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
        backgroundColor: "#F0F7FF",
        color: "#0F172A",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "clamp(16px, 3vw, 36px)",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* ── Top Header Bar ── */}
      <header
        className="editorial-reveal login-folio-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #BFDBFE",
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
              background: "#025997",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontWeight: 900,
              fontSize: "16px",
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
              color: "#0F172A",
            }}
          >
            Q-RAKSHAK
          </span>
          <span
            style={{
              fontSize: "0.68rem",
              color: "#64748B",
              fontWeight: 600,
              background: "#E0F2FE",
              padding: "2px 8px",
              borderRadius: "4px",
              border: "1px solid #CBD5E1",
            }}
          >
            Care workspace
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="live-status-pulse" />
          <span style={{ fontSize: "0.72rem", color: "#025997", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
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
                background: "#E0F2FE",
                border: "1px solid #BFDBFE",
                borderRadius: "999px",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.66rem",
                  letterSpacing: "0.12em",
                  color: "#025997",
                  textTransform: "uppercase",
                  fontWeight: 800,
                }}
              >
                CLEAR HEALTH GUIDANCE
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.4rem, 4.2vw, 3.8rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                color: "#0F172A",
                margin: 0,
              }}
            >
              Precision Medicine. <br />
              <span style={{ fontStyle: "italic", fontWeight: 400, color: "#025997" }}>
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
              color: "#025997",
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
                color: "#025997",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                boxShadow: "0 0 12px rgba(16, 185, 129, 0.15)",
              }}
            >
              <span className="live-status-pulse" />
              SERVICE READY
            </span>

            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                padding: "6px 12px",
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "6px",
                color: "#025997",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 0 12px rgba(59, 130, 246, 0.15)",
              }}
            >
              EVIDENCE-BASED ANALYSIS
            </span>

            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                padding: "6px 12px",
                background: "#F8FAFC",
                border: "1px solid #CBD5E1",
                borderRadius: "6px",
                color: "#64748B",
                fontWeight: 700,
              }}
            >
              QUICK RESPONSE
            </span>
          </div>

          {/* Feature Pillars */}
          <div
            className="editorial-reveal"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
                borderTop: "1px solid #CBD5E1",
              paddingTop: "20px",
              marginTop: "4px",
            }}
          >
            <div className="feature-stat-box-dark">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#025997", fontWeight: 700 }}>
                MODULE 01
              </span>
                <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.92rem", display: "block", marginTop: "2px", color: "#0F172A" }}>
                AI Diagnostics
              </strong>
                <span style={{ fontSize: "0.72rem", color: "#64748B", lineHeight: 1.4, display: "block", marginTop: "2px" }}>
                Multi-disease risk analysis & explainability
              </span>
            </div>

            <div className="feature-stat-box-dark">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#025997", fontWeight: 700 }}>
                MODULE 02
              </span>
                <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.92rem", display: "block", marginTop: "2px", color: "#0F172A" }}>
                3D Digital Twin
              </strong>
                <span style={{ fontSize: "0.72rem", color: "#64748B", lineHeight: 1.4, display: "block", marginTop: "2px" }}>
                Interactive GLB anatomical simulation
              </span>
            </div>

            <div className="feature-stat-box-dark">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#025997", fontWeight: 700 }}>
                MODULE 03
              </span>
                <strong style={{ fontFamily: "var(--font-display)", fontSize: "0.92rem", display: "block", marginTop: "2px", color: "#0F172A" }}>
                Doctor Portal
              </strong>
                <span style={{ fontSize: "0.72rem", color: "#64748B", lineHeight: 1.4, display: "block", marginTop: "2px" }}>
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
          <div className="login-card-rule" />

          <div style={{ marginBottom: "20px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.64rem",
                letterSpacing: "0.14em",
                color: "#025997",
                textTransform: "uppercase",
                fontWeight: 800,
                display: "block",
                marginBottom: "4px",
              }}
            >
              SECURE HOSPITAL ACCESS
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.7rem",
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Sign In to Q-RAKSHAK
            </h2>
            <p style={{ fontSize: "0.80rem", color: "#64748B", marginTop: "4px" }}>
              Sign in with your clinical credentials to access the portal.
            </p>
          </div>

          {/* Mode Switcher */}
          <div
            style={{
              display: "flex",
              background: "#F8FAFC",
              padding: "4px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              marginBottom: "20px",
              gap: "4px",
            }}
          >

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
                background: authMode === "credentials" ? "#E0F2FE" : "transparent",
                color: authMode === "credentials" ? "#025997" : "#475569",
                cursor: "pointer",
                transition: "all 0.16s ease",
              }}
            >
              Login
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
                background: authMode === "register" ? "#E0F2FE" : "transparent",
                color: authMode === "register" ? "#025997" : "#475569",
                cursor: "pointer",
                transition: "all 0.16s ease",
              }}
            >
              Register
            </button>
          </div>

          {authMode === "credentials" ? (
            /* TAB 2: Direct Credentials Form */
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Role Selector Pills */}
              <div>
                <label className="metric-label" style={{ marginBottom: "6px", color: "#64748B" }}>
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
                        border: selectedRole === r.id ? "1.5px solid #025997" : "1px solid #CBD5E1",
                        borderRadius: "6px",
                        background: selectedRole === r.id ? "#E0F2FE" : "#F8FAFC",
                        color: selectedRole === r.id ? "#025997" : "#475569",
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
                <label className="metric-label" style={{ marginBottom: "6px", color: "#64748B" }}>
                  USERNAME OR EMAIL
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{
                      paddingLeft: "36px",
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      color: "#0F172A",
                      borderRadius: "8px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="metric-label" style={{ marginBottom: "6px", color: "#64748B" }}>
                  PASSWORD
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      paddingLeft: "36px",
                      paddingRight: "36px",
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      color: "#0F172A",
                      borderRadius: "8px",
                      width: "100%",
                      boxSizing: "border-box",
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
                      color: "#64748B",
                      padding: "4px",
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="clinical-error-banner" style={{ marginTop: "4px" }}>
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
                  background: "#025997",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loading ? "Authenticating..." : "Sign In to Workspace"}
              </button>
            </form>
          ) : (
            /* TAB 3: New Account Registration */
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="metric-label" style={{ marginBottom: "6px", color: "#64748B" }}>
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
                        border: registerRole === r.id ? "1.5px solid #025997" : "1px solid #CBD5E1",
                        borderRadius: "6px",
                        background: registerRole === r.id ? "#E0F2FE" : "#F8FAFC",
                        color: registerRole === r.id ? "#025997" : "#475569",
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
                <label className="metric-label" style={{ marginBottom: "4px", color: "#64748B" }}>
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    color: "#0F172A",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="metric-label" style={{ marginBottom: "4px", color: "#64748B" }}>
                    USERNAME
                  </label>
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      color: "#0F172A",
                      borderRadius: "8px",
                    }}
                  />
                </div>
                <div>
                  <label className="metric-label" style={{ marginBottom: "4px", color: "#64748B" }}>
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      color: "#0F172A",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              </div>

              {registerRole === "doctor" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label className="metric-label" style={{ marginBottom: "4px", color: "#64748B" }}>
                      SPECIALTY
                    </label>
                    <input
                      type="text"
                      value={registerSpecialty}
                      onChange={(e) => setRegisterSpecialty(e.target.value)}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        color: "#0F172A",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                  <div>
                    <label className="metric-label" style={{ marginBottom: "4px", color: "#64748B" }}>
                      AFFILIATION
                    </label>
                    <input
                      type="text"
                      value={registerAffiliation}
                      onChange={(e) => setRegisterAffiliation(e.target.value)}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        color: "#0F172A",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="metric-label" style={{ marginBottom: "4px", color: "#64748B" }}>
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    color: "#0F172A",
                    borderRadius: "8px",
                  }}
                />
              </div>

              {error && (
                <div className="clinical-error-banner" style={{ marginTop: "4px" }}>
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
                  background: "#025997",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loading ? "Creating Account..." : "Complete Registration"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
