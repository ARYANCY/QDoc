import { useState, useEffect, useRef } from "react";
import { Lock, User, Shield, X, CheckCircle2, Eye, EyeOff, KeyRound, LogIn, Sparkles, UserPlus, Stethoscope } from "lucide-react";
import { authApi } from "../../api/auth";
import { animateModalOpen } from "../../utils/motion";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const [authMode, setAuthMode] = useState("cards"); // 'cards' | 'login' | 'register'
  const [username, setUsername] = useState("alex.patient");
  const [password, setPassword] = useState("patient123");
  const [role, setRole] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Register Form State
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("patient");
  const [regPhone, setRegPhone] = useState("");
  const [regAffiliation, setRegAffiliation] = useState("");
  const [regSpecialty, setRegSpecialty] = useState("General Medicine & Clinical AI");
  const [regFee, setRegFee] = useState("600");
  const [regExp, setRegExp] = useState("6");

  useEffect(() => {
    if (isOpen) {
      animateModalOpen(overlayRef.current, modalRef.current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleLogin(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(username, password, role);
      if (onLoginSuccess) onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || "Sign in failed. Please check your username and password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    if (e) e.preventDefault();
    if (!regUsername || !regPassword || !regName || !regEmail) {
      setError("Please fill in your name, username, email, and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const defaultLicense = regRole === "doctor"
        ? `DOC-LIC-${Math.floor(10000 + Math.random() * 90000)}`
        : regRole === "admin"
        ? `ADM-SEC-${Math.floor(1000 + Math.random() * 9000)}`
        : `PT-REC-${Math.floor(10000 + Math.random() * 90000)}`;

      const data = await authApi.register({
        username: regUsername.trim().toLowerCase(),
        password: regPassword,
        name: regName.trim(),
        email: regEmail.trim(),
        role: regRole,
        emergency_phone: regPhone || "+91 98765 43210",
        hospital_affiliation: regAffiliation || (regRole === "doctor" ? "AIIMS Clinical AI OPD" : "Community Hospital"),
        license_number: defaultLicense,
        specialty: regRole === "doctor" ? (regSpecialty || "General Medicine & Clinical AI") : undefined,
        fee_inr: regRole === "doctor" ? (parseFloat(regFee) || 600.0) : undefined,
        experience_years: regRole === "doctor" ? (parseInt(regExp, 10) || 6) : undefined,
      });
      if (onLoginSuccess) onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || "Registration failed. Username may already be in use.");
    } finally {
      setLoading(false);
    }
  }

  async function quickSwitch(u, p, r) {
    setUsername(u);
    setPassword(p);
    setRole(r);
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(u, p, r);
      if (onLoginSuccess) onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={overlayRef} className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "640px",
          padding: "24px 28px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-default)",
          borderTop: "3px solid var(--gold)",
          boxShadow: "var(--shadow-modal), 0 20px 50px rgba(2, 132, 199, 0.16)",
          background: "var(--bg-surface)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid var(--border-default)", paddingBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", background: "var(--primary-gradient)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <KeyRound size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.60rem", fontWeight: 800, color: "var(--primary)", letterSpacing: "0.10em", textTransform: "uppercase" }}>
                USER ACCOUNT
              </div>
              <h2 id="auth-modal-title" style={{ fontSize: "1.10rem", fontWeight: 800, color: "var(--text-primary)", margin: "2px 0 0 0" }}>
                Sign In or Create Account
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px", marginBottom: "14px", background: "var(--bg-canvas)", padding: "3px", border: "1px solid var(--border-default)" }}>
          <button
            type="button"
            onClick={() => setAuthMode("cards")}
            style={{
              padding: "8px 10px",
              background: authMode === "cards" ? "var(--primary)" : "transparent",
              color: authMode === "cards" ? "#FFFFFF" : "var(--text-secondary)",
              border: 0,
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            ★ Demo Accounts
          </button>

          <button
            type="button"
            onClick={() => setAuthMode("login")}
            style={{
              padding: "8px 10px",
              background: authMode === "login" ? "var(--primary)" : "transparent",
              color: authMode === "login" ? "#FFFFFF" : "var(--text-secondary)",
              border: 0,
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setAuthMode("register")}
            style={{
              padding: "8px 10px",
              background: authMode === "register" ? "var(--primary)" : "transparent",
              color: authMode === "register" ? "#FFFFFF" : "var(--text-secondary)",
              border: 0,
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <Sparkles size={12} /> Create Account
          </button>
        </div>

        {/* MODE 1: 1-Click Demo Persona Cards */}
        {authMode === "cards" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              {/* Patient */}
              <div
                role="button"
                tabIndex={0}
                aria-label="Sign in as Patient demo"
                onClick={() => quickSwitch("alex.patient", "patient123", "patient")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); quickSwitch("alex.patient", "patient123", "patient"); } }}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderTop: "3px solid var(--emerald-couture)",
                  padding: "12px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  transition: "all 0.15s ease",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--emerald-couture)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <User size={14} /> Patient
                  </span>
                </div>
                <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>Alexander Reed</strong>
                <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.3 }}>
                  Health checkups & 3D Digital Twin.
                </p>
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "5px", marginTop: "3px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <code style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>alex.patient</code>
                  <span style={{ fontSize: "0.62rem", color: "var(--emerald-couture)", fontWeight: 800 }}>Sign In ↗</span>
                </div>
              </div>

              {/* Doctor / Clinician */}
              <div
                role="button"
                tabIndex={0}
                aria-label="Sign in as Doctor demo"
                onClick={() => quickSwitch("dr.kavita", "doctor123", "doctor")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); quickSwitch("dr.kavita", "doctor123", "doctor"); } }}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderTop: "3px solid var(--gold)",
                  padding: "12px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  transition: "all 0.15s ease",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--gold)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Stethoscope size={14} /> Doctor
                  </span>
                </div>
                <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>Dr. Kavita Rao</strong>
                <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.3 }}>
                  Patient triage, diagnoses & prescriptions.
                </p>
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "5px", marginTop: "3px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <code style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>dr.kavita</code>
                  <span style={{ fontSize: "0.62rem", color: "var(--gold)", fontWeight: 800 }}>Sign In ↗</span>
                </div>
              </div>

              {/* Admin */}
              <div
                role="button"
                tabIndex={0}
                aria-label="Sign in as Administrator demo"
                onClick={() => quickSwitch("admin.audit", "admin123", "admin")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); quickSwitch("admin.audit", "admin123", "admin"); } }}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderTop: "3px solid var(--accent-violet)",
                  padding: "12px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  transition: "all 0.15s ease",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--accent-violet)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Shield size={14} /> Admin
                  </span>
                </div>
                <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>Compliance Officer</strong>
                <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.3 }}>
                  Security, user accounts & audit logs.
                </p>
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "5px", marginTop: "3px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <code style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>admin.audit</code>
                  <span style={{ fontSize: "0.62rem", color: "var(--accent-violet)", fontWeight: 800 }}>Sign In ↗</span>
                </div>
              </div>
            </div>

            <div style={{ padding: "8px 12px", background: "var(--bg-card-sky)", border: "1px solid var(--border-light-blue)", fontSize: "0.70rem", color: "var(--primary-dark)" }}>
              💡 <strong>Tip:</strong> Click any demo card above to sign in immediately, or switch to <strong>Create Account</strong> to register your own profile.
            </div>
          </div>
        )}

        {/* MODE 2: Sign In Form */}
        {authMode === "login" && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                Username or Registered Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="e.g. alex.patient or user@health.org"
                style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.80rem" }}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                Password
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  style={{ width: "100%", padding: "8px 36px 8px 10px", border: "1px solid var(--border-default)", fontSize: "0.80rem" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "8px", background: "transparent", border: 0, cursor: "pointer", color: "var(--text-muted)" }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                Role (Auto-Detected from Database)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.80rem" }}
              >
                <option value="patient">Patient (Health Checkup & 3D Twin)</option>
                <option value="doctor">Doctor / Clinician (Diagnostics & Tele-OPD)</option>
                <option value="admin">Administrator (Compliance & Governance)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "10px", marginTop: "4px", minHeight: "38px" }}
            >
              <LogIn size={15} />
              <span>{loading ? "Signing In..." : "Sign In to Portal"}</span>
            </button>
          </form>
        )}

        {/* MODE 3: Create Account Form */}
        {authMode === "register" && (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  autoComplete="name"
                  placeholder="e.g. Dr. Maya Patel"
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }}>
                  Username *
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="e.g. maya.patel"
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem" }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="maya@example.com"
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }}>
                  Password *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem" }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }}>
                  I am registering as: *
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem" }}
                >
                  <option value="patient">Patient (Personal Health & Checkups)</option>
                  <option value="doctor">Doctor / Clinician (Clinical Diagnosis & Consultations)</option>
                  <option value="admin">Administrator (Security & Audits)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.70rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }}>
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem" }}
                />
              </div>
            </div>

            {/* Doctor Profile Specific Fields */}
            {regRole === "doctor" && (
              <div style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-default)", borderLeft: "3px solid var(--gold)", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--gold)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  ★ Clinical Practice Details (Appears in Find Doctors & Consultations)
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div>
                    <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "2px" }}>
                      Medical Specialty *
                    </label>
                    <select
                      value={regSpecialty}
                      onChange={(e) => setRegSpecialty(e.target.value)}
                      style={{ width: "100%", padding: "7px 8px", border: "1px solid var(--border-default)", fontSize: "0.74rem" }}
                    >
                      <option value="General Medicine & Clinical AI">General Medicine & Clinical AI</option>
                      <option value="Cardiology & Preventive Medicine">Cardiology & Preventive Medicine</option>
                      <option value="Medical Oncology">Medical Oncology</option>
                      <option value="Pulmonary & Respiratory Medicine">Pulmonary & Respiratory Medicine</option>
                      <option value="Dermatology & Skin Lesions">Dermatology & Skin Lesions</option>
                      <option value="Neurology & Neuro-imaging">Neurology & Neuro-imaging</option>
                      <option value="Endocrinology & Diabetes">Endocrinology & Diabetes</option>
                      <option value="Orthopedics & Joint Care">Orthopedics & Joint Care</option>
                      <option value="Pediatrics & Child Health">Pediatrics & Child Health</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "2px" }}>
                      Hospital / Clinic Affiliation
                    </label>
                    <input
                      type="text"
                      value={regAffiliation}
                      onChange={(e) => setRegAffiliation(e.target.value)}
                      placeholder="e.g. AIIMS Clinical AI OPD"
                      style={{ width: "100%", padding: "7px 8px", border: "1px solid var(--border-default)", fontSize: "0.74rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div>
                    <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "2px" }}>
                      Consultation Fee (INR)
                    </label>
                    <input
                      type="number"
                      value={regFee}
                      onChange={(e) => setRegFee(e.target.value)}
                      placeholder="600"
                      style={{ width: "100%", padding: "7px 8px", border: "1px solid var(--border-default)", fontSize: "0.74rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "2px" }}>
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      value={regExp}
                      onChange={(e) => setRegExp(e.target.value)}
                      placeholder="6"
                      style={{ width: "100%", padding: "7px 8px", border: "1px solid var(--border-default)", fontSize: "0.74rem" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "10px", marginTop: "4px", minHeight: "38px" }}
            >
              <UserPlus size={15} />
              <span>{loading ? "Creating Account..." : `Create ${regRole.toUpperCase()} Account & Sign In`}</span>
            </button>
          </form>
        )}

        {error && (
          <div style={{ background: "var(--risk-high-bg)", color: "var(--risk-high)", border: "1px solid rgba(220, 38, 38, 0.4)", padding: "8px 12px", fontSize: "0.72rem", marginTop: "10px", fontWeight: 600 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
