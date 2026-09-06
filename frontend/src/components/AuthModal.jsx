import { useState } from "react";
import { Lock, User, Shield, X, CheckCircle2, Eye, EyeOff, KeyRound, LogIn, Sparkles, UserPlus } from "lucide-react";
import { authApi } from "../api/auth";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState("cards"); // 'cards' | 'login' | 'register'
  const [username, setUsername] = useState("alex.patient");
  const [password, setPassword] = useState("patient123");
  const [role, setRole] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New Registration State
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("patient");
  const [regPhone, setRegPhone] = useState("+91 98765 43210");
  const [regAffiliation, setRegAffiliation] = useState("AIIMS Clinical AI OPD");

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
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    if (e) e.preventDefault();
    if (!regUsername || !regPassword || !regName || !regEmail) {
      setError("Please fill in all required fields to register your account.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.register({
        username: regUsername.trim().toLowerCase(),
        password: regPassword,
        name: regName.trim(),
        email: regEmail.trim(),
        role: regRole,
        emergency_phone: regPhone,
        hospital_affiliation: regAffiliation,
        license_number: regRole === "admin" ? `ADM-SEC-${Math.floor(1000 + Math.random() * 9000)}` : `PT-REC-${Math.floor(10000 + Math.random() * 90000)}`,
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
      setError(err.message || "Role switch failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "620px",
          padding: "24px 28px",
          borderRadius: 0,
          border: "1px solid var(--border-default)",
          borderTop: "4px solid var(--primary)",
          boxShadow: "0 20px 50px rgba(2, 132, 199, 0.16)",
          background: "var(--bg-surface)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border-default)", paddingBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", background: "var(--primary-gradient)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <KeyRound size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.58rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                SECURITY & IDENTITY GATEWAY
              </div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--text-primary)", margin: "2px 0 0 0", letterSpacing: "-0.02em", textTransform: "uppercase" }}>
                Access Authority Portal
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px", marginBottom: "16px", background: "var(--bg-canvas)", padding: "3px", border: "1px solid var(--border-default)" }}>
          <button
            type="button"
            onClick={() => setAuthMode("cards")}
            style={{
              padding: "8px 10px",
              background: authMode === "cards" ? "var(--primary)" : "transparent",
              color: authMode === "cards" ? "#FFFFFF" : "var(--text-secondary)",
              border: 0,
              fontSize: "0.70rem",
              fontWeight: 800,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              transition: "all 0.15s ease",
            }}
          >
            ⚡ Test Personas
          </button>

          <button
            type="button"
            onClick={() => setAuthMode("login")}
            style={{
              padding: "8px 10px",
              background: authMode === "login" ? "var(--primary)" : "transparent",
              color: authMode === "login" ? "#FFFFFF" : "var(--text-secondary)",
              border: 0,
              fontSize: "0.70rem",
              fontWeight: 800,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              transition: "all 0.15s ease",
            }}
          >
            🔑 Sign In
          </button>

          <button
            type="button"
            onClick={() => setAuthMode("register")}
            style={{
              padding: "8px 10px",
              background: authMode === "register" ? "var(--primary)" : "transparent",
              color: authMode === "register" ? "#FFFFFF" : "var(--text-secondary)",
              border: 0,
              fontSize: "0.70rem",
              fontWeight: 800,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <Sparkles size={11} /> Create Account
          </button>
        </div>

        {/* MODE 1: 1-Click Persona Cards */}
        {authMode === "cards" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {/* Patient */}
              <div
                onClick={() => quickSwitch("alex.patient", "patient123", "patient")}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderLeft: "3px solid var(--primary)",
                  padding: "14px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  transition: "all 0.15s ease",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 900, color: "var(--primary)", display: "flex", alignItems: "center", gap: "5px", textTransform: "uppercase" }}>
                    <User size={15} /> Patient
                  </span>
                  <span style={{ fontSize: "0.58rem", background: "var(--risk-low-bg)", color: "var(--risk-low)", border: "1px solid var(--risk-low-border)", padding: "1px 6px", fontWeight: 800, textTransform: "uppercase" }}>
                    BASELINE
                  </span>
                </div>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>Alexander Reed</strong>
                <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.3 }}>
                  Personal Health Checkups, 2D Health Avatar, Early Detection Map & Digital ID.
                </p>
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "6px", marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <code style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    alex.patient
                  </code>
                  <span style={{ fontSize: "0.62rem", color: "var(--primary)", fontWeight: 800 }}>CLICK TO AUTH ↗</span>
                </div>
              </div>

              {/* Admin */}
              <div
                onClick={() => quickSwitch("admin.audit", "admin123", "admin")}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderLeft: "3px solid var(--accent-violet)",
                  padding: "14px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  transition: "all 0.15s ease",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 900, color: "var(--accent-violet)", display: "flex", alignItems: "center", gap: "5px", textTransform: "uppercase" }}>
                    <Shield size={15} /> Administrator
                  </span>
                  <span style={{ fontSize: "0.58rem", background: "var(--accent-violet-soft)", color: "var(--accent-violet)", border: "1px solid var(--accent-violet)", padding: "1px 6px", fontWeight: 800, textTransform: "uppercase" }}>
                    BASELINE
                  </span>
                </div>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>Audit & Security Admin</strong>
                <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.3 }}>
                  Compliance Console, User Management, Benchmark Matrix & Tamper-Evident Logs.
                </p>
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "6px", marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <code style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    admin.audit
                  </code>
                  <span style={{ fontSize: "0.62rem", color: "var(--accent-violet)", fontWeight: 800 }}>CLICK TO AUTH ↗</span>
                </div>
              </div>
            </div>

            <div style={{ padding: "10px 12px", background: "var(--bg-card-sky)", border: "1px solid var(--border-light-blue)", fontSize: "0.68rem", color: "var(--primary-dark)" }}>
              🔒 <strong>Note:</strong> Baseline test personas are protected and read-only. To customize details, select <strong>Create Account</strong>.
            </div>
          </div>
        )}

        {/* MODE 2: Direct Credentials Form */}
        {authMode === "login" && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                Username / Account Handle
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alex.patient or your.handle"
                style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem" }}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                Password / Security Token
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  style={{ width: "100%", padding: "8px 36px 8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem" }}
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
              <label style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                Authority Role Access
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem" }}
              >
                <option value="patient">Patient (Autonomous Health Checkups & Twin)</option>
                <option value="admin">Administrator (Audit & Security Governance)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "10px", marginTop: "4px", minHeight: "40px" }}
            >
              <LogIn size={15} />
              <span>{loading ? "Authenticating Authority Token..." : `Sign In as ${role.toUpperCase()}`}</span>
            </button>
          </form>
        )}

        {/* MODE 3: Create New Account (Full Editing Authority) */}
        {authMode === "register" && (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                  Username / Handle *
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="maya.lin"
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="maya.lin@domain.org"
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                  Security Password *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                  Account Authority Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                >
                  <option value="patient">Patient (Autonomous Health & Twin)</option>
                  <option value="admin">Administrator (Audit & Security)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                  Emergency Contact Phone
                </label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--border-default)", fontSize: "0.76rem" }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "10px", marginTop: "4px", minHeight: "40px" }}
            >
              <UserPlus size={15} />
              <span>{loading ? "Creating Account & Authorizing..." : "Create Account & Sign In (Full Authority)"}</span>
            </button>
          </form>
        )}

        {error && (
          <div style={{ background: "var(--risk-high-bg)", color: "var(--risk-high)", border: "1px solid rgba(220, 38, 38, 0.4)", padding: "10px 12px", fontSize: "0.74rem", marginTop: "12px", fontWeight: 700 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

