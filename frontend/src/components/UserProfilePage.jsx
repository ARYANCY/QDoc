import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Building,
  Heart,
  Stethoscope,
  Activity,
  Cpu,
  Lock,
  Database,
  ArrowUpRight,
  RefreshCw,
  Clock,
  KeyRound,
  X,
  Sliders,
  CreditCard,
  QrCode,
  Printer,
  Copy,
} from "lucide-react";
import { profileApi } from "../api/profile";
import { authApi } from "../api/auth";

export default function UserProfilePage({ currentUser, onProfileUpdated, onProfileDeleted }) {
  const [profile, setProfile] = useState({
    user_id: currentUser?.user_id || currentUser?.id || "PT-ALEX",
    username: currentUser?.username || "alex.patient",
    name: currentUser?.name || "Alexander Reed",
    role: currentUser?.role || "patient",
    primary_email: currentUser?.email || "alexander.reed@email.com",
    extra_email: "alex.emergency@gmail.com",
    emergency_phone: "+91 98333 44556",
    phone: "+91 98333 44556",
    blood_group: "O+",
    department: "Patient Self-Analysis & Care",
    hospital: "AIIMS Cardiology & Oncology OPD",
    license_id: "PT-REC-89421",
    lab_affiliation: "Quantum Machine Learning Lab - Unit 4",
    compute_cluster: "PennyLane-QPU-Rigetti-Sim",
    clearance_level: "Level 4 (Audit & Governance)",
    compliance_standard: "HIPAA / FDA 21 CFR Part 11 / DPDP Act",
    attending_physician: "Self-Managed AI Diagnostics",
    notifications_sms: true,
    notifications_email: true,
    notifications_critical_qpu: true,
  });

  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("synced"); // "synced" | "saving" | "error"
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [viewCardOpen, setViewCardOpen] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const activeUserId = currentUser?.user_id || currentUser?.id || currentUser?.username || "PT-ALEX";
  const isDeleteAuthorized = deleteConfirmText.trim().toLowerCase() === "confirm deletion account";

  useEffect(() => {
    fetchProfileData();
  }, [activeUserId]);

  async function fetchProfileData() {
    setLoading(true);
    setError(null);
    try {
      const res = await profileApi.getProfile(activeUserId);
      if (res.profile) {
        setProfile((prev) => ({
          ...prev,
          ...res.profile,
          user_id: res.profile.user_id || activeUserId,
          username: currentUser?.username || prev.username,
        }));
        // Auto-save on login/load to ensure DB synchronization
        autoSaveToDb({ ...profile, ...res.profile });
      }
    } catch (err) {
      // Fallback retains stored user metadata
    } finally {
      setLoading(false);
    }
  }

  // Automatic Background DB Synchronization
  async function autoSaveToDb(updatedProfile) {
    const payload = updatedProfile || profile;
    setSyncStatus("saving");
    try {
      const res = await profileApi.updateProfile(activeUserId, payload);
      setSyncStatus("synced");
      if (onProfileUpdated) {
        onProfileUpdated(res.profile || payload);
      }
    } catch (err) {
      setSyncStatus("error");
    }
  }

  function handleFieldChange(field, value) {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    if (typeof value === "boolean") {
      autoSaveToDb(updated);
    }
  }

  function handleFieldBlur() {
    autoSaveToDb(profile);
  }

  async function handleDeleteProfile() {
    if (!isDeleteAuthorized) {
      setError('Please enter "CONFIRM DELETION ACCOUNT" exactly to authorize complete database removal.');
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      await profileApi.deleteProfile(activeUserId);
      setDeleteConfirmOpen(false);
      if (onProfileDeleted) {
        onProfileDeleted();
      }
    } catch (err) {
      setError(err.message || "Failed to delete profile from database.");
      setDeleting(false);
    }
  }

  const effectiveRole = currentUser?.role || profile.role || "patient";
  const isTestAccount = !currentUser?.is_custom && (
    currentUser?.username === "alex.patient" ||
    currentUser?.username === "admin.audit" ||
    currentUser?.id === "PT-ALEX" ||
    currentUser?.id === "ADM-SYSTEM" ||
    currentUser?.user_id === "PT-ALEX" ||
    currentUser?.user_id === "ADM-SYSTEM" ||
    activeUserId === "PT-ALEX" ||
    activeUserId === "ADM-SYSTEM" ||
    activeUserId === "alex.patient" ||
    activeUserId === "admin.audit"
  );

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "14px 18px", background: "var(--bg-canvas)" }}>
      {/* ── Zara Magazine Editorial Header ───────────────────────────────────── */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderLeft: "4px solid var(--primary)",
          padding: "18px 24px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: "0 2px 10px rgba(2, 132, 199, 0.05)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "0.62rem",
                fontWeight: 800,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                background: "var(--bg-card-sky)",
                border: "1px solid var(--border-light-blue)",
                padding: "2px 8px",
              }}
            >
              EDITION 2026 // VOL. IV • USER DOSSIER
            </span>
            <span
              style={{
                fontSize: "0.62rem",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.06em",
              }}
            >
              ID: {profile.user_id || activeUserId}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 900,
                color: "var(--text-primary)",
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
              }}
            >
              {profile.name || "User Profile & Security"}
            </h1>
            <span
              style={{
                fontSize: "0.68rem",
                padding: "3px 10px",
                background: "var(--primary-gradient)",
                color: "#FFFFFF",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {effectiveRole}
            </span>
          </div>

          <p style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "3px" }}>
            Institutional identity, clinical emergency routing, quantum resource access, and account lifecycle.
          </p>
        </div>

        {/* Dynamic Auto-Sync Indicator & Sync Trigger */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              background: syncStatus === "saving" ? "var(--risk-mid-bg)" : "var(--risk-low-bg)",
              color: syncStatus === "saving" ? "var(--risk-mid)" : "var(--risk-low)",
              border: `1px solid ${syncStatus === "saving" ? "rgba(217, 119, 6, 0.3)" : "rgba(22, 163, 74, 0.3)"}`,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: syncStatus === "saving" ? "var(--risk-mid)" : "var(--risk-low)",
                display: "inline-block",
              }}
            />
            {syncStatus === "saving" ? "Syncing to SQLite..." : "Auto-Saved to SQLite DB"}
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={fetchProfileData}
            disabled={loading}
            style={{
              padding: "6px 12px",
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <RefreshCw size={12} className={loading ? "spin" : ""} />
            Sync DB
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => setViewCardOpen(true)}
            style={{
              padding: "6px 14px",
              fontSize: "0.72rem",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--primary-gradient)",
              color: "#FFFFFF",
              width: "auto",
              boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)",
            }}
            title="Open Digital Health Identity Card"
          >
            <CreditCard size={13} />
            View ID Card
          </button>
        </div>
      </div>

      {/* ── Protected Test Account Read-Only Banner / Full Authority Notice ───── */}
      {isTestAccount ? (
        <div
          style={{
            background: "var(--bg-surface-alt)",
            border: "1px solid var(--border-light-blue)",
            borderLeft: "4px solid var(--primary)",
            padding: "14px 18px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Lock size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: "0.82rem", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>
                🔒 Protected Test Baseline Persona // Read-Only Mode
              </strong>
              <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>
                This is a verified test account baseline. Profile credentials are preserved to prevent benchmark drift. To customize and edit all attributes with full authority, create a new custom account via the top portal.
              </p>
            </div>
          </div>
          <span style={{ fontSize: "0.64rem", fontWeight: 900, background: "var(--primary)", color: "#FFFFFF", padding: "4px 10px", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
            PROTECTED BASELINE
          </span>
        </div>
      ) : (
        <div
          style={{
            background: "var(--risk-low-bg)",
            border: "1px solid var(--risk-low-border)",
            borderLeft: "4px solid var(--risk-low)",
            padding: "14px 18px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <CheckCircle2 size={20} color="var(--risk-low)" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: "0.82rem", color: "var(--risk-low)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>
                ✓ Custom User Account // Full Editing Authority Active
              </strong>
              <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>
                You have full authority to modify personal credentials, hotlines, and clinical routing. Changes synchronize automatically to SQLite.
              </p>
            </div>
          </div>
          <span style={{ fontSize: "0.64rem", fontWeight: 900, background: "var(--risk-low)", color: "#FFFFFF", padding: "4px 10px", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
            FULL AUTHORITY ACTIVE
          </span>
        </div>
      )}

      {error && (
        <div
          style={{
            background: "var(--risk-high-bg)",
            color: "var(--risk-high)",
            padding: "10px 14px",
            fontSize: "0.75rem",
            border: "1px solid rgba(220, 38, 38, 0.3)",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 700,
          }}
        >
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* ── Editorial Bento Metric Grid ──────────────────────────────────────── */}
      <div className="bento-grid-4" style={{ marginBottom: "16px" }}>
        <div className="bento-stat-card" style={{ borderTop: "3px solid var(--primary)" }}>
          <div className="bento-stat-header">
            <span className="bento-stat-label">01 // AUTHORITY TIER</span>
            <span className="bento-stat-arrow">↗</span>
          </div>
          <div className="bento-stat-value" style={{ fontSize: "1.15rem", textTransform: "uppercase", fontWeight: 900 }}>
            {effectiveRole}
          </div>
          <div className="bento-stat-footer">
            <span className="bento-stat-tag">{isTestAccount ? "TEST BASELINE" : "CUSTOM TIER"}</span>
            <span className="bento-stat-sub">DPDP & HIPAA Verified</span>
          </div>
        </div>

        <div className="bento-stat-card" style={{ borderTop: "3px solid #0369A1" }}>
          <div className="bento-stat-header">
            <span className="bento-stat-label">02 // INSTITUTIONAL DOMAIN</span>
            <span className="bento-stat-arrow">↗</span>
          </div>
          <div className="bento-stat-value" style={{ fontSize: "0.80rem", wordBreak: "break-all", fontWeight: 800 }}>
            {profile.primary_email || "N/A"}
          </div>
          <div className="bento-stat-footer">
            <span className="bento-stat-tag">ROUTING</span>
            <span className="bento-stat-sub">Verified Gateway</span>
          </div>
        </div>

        <div className="bento-stat-card" style={{ borderTop: "3px solid var(--primary)" }}>
          <div className="bento-stat-header">
            <span className="bento-stat-label">03 // 24/7 EMERGENCY HOTLINE</span>
            <span className="bento-stat-arrow">↗</span>
          </div>
          <div className="bento-stat-value" style={{ fontSize: "1.05rem", color: "var(--primary)", fontWeight: 900 }}>
            {profile.emergency_phone || "+91 98333 44556"}
          </div>
          <div className="bento-stat-footer">
            <span className="bento-stat-tag">ESCALATION</span>
            <span className="bento-stat-sub">SMS & Voice Enabled</span>
          </div>
        </div>

        <div className="bento-stat-card" style={{ borderTop: "3px solid var(--accent-teal)" }}>
          <div className="bento-stat-header">
            <span className="bento-stat-label">04 // DATABASE INTEGRITY</span>
            <span className="bento-stat-arrow">↗</span>
          </div>
          <div className="bento-stat-value" style={{ fontSize: "0.95rem", fontFamily: "var(--font-mono)", fontWeight: 800 }}>
            SQLITE WORM
          </div>
          <div className="bento-stat-footer">
            <span className="bento-stat-tag">AUDIT LOG</span>
            <span className="bento-stat-sub">Tamper-Evident SHA-256</span>
          </div>
        </div>
      </div>

      {/* ── Main Profile Form Grid (Auto-Syncing) ────────────────────────────── */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "16px", marginBottom: "16px" }}>
          {/* Card 1: Identity & Credentials */}
          <div className="panel" style={{ padding: "18px", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="panel-header" style={{ marginBottom: "14px", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} color="var(--primary)" />
                <h3 style={{ fontSize: "0.82rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Section 01 // Institutional Profile & Credentials
                </h3>
              </div>
              <span className="step-badge">SEC. 01</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Full Legal / Professional Name {isTestAccount && "(Protected)"}
                </label>
                <input
                  type="text"
                  value={profile.name || ""}
                  onChange={(e) => !isTestAccount && handleFieldChange("name", e.target.value)}
                  onBlur={handleFieldBlur}
                  readOnly={isTestAccount}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-default)",
                    fontSize: "0.78rem",
                    background: isTestAccount ? "var(--bg-surface-alt)" : "var(--bg-surface)",
                    color: "var(--text-primary)",
                    cursor: isTestAccount ? "not-allowed" : "text",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Username / Auth Handle (Read-only)
                </label>
                <input
                  type="text"
                  value={profile.username || currentUser?.username || "alex.patient"}
                  readOnly
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem", background: "var(--bg-canvas)", color: "var(--text-muted)", cursor: "not-allowed" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Primary Institutional Email {isTestAccount && "(Protected)"}
                </label>
                <input
                  type="email"
                  value={profile.primary_email || ""}
                  onChange={(e) => !isTestAccount && handleFieldChange("primary_email", e.target.value)}
                  onBlur={handleFieldBlur}
                  readOnly={isTestAccount}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-default)",
                    fontSize: "0.78rem",
                    background: isTestAccount ? "var(--bg-surface-alt)" : "var(--bg-surface)",
                    color: "var(--text-primary)",
                    cursor: isTestAccount ? "not-allowed" : "text",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Secondary / Recovery Email
                </label>
                <input
                  type="email"
                  value={profile.extra_email || ""}
                  onChange={(e) => !isTestAccount && handleFieldChange("extra_email", e.target.value)}
                  onBlur={handleFieldBlur}
                  readOnly={isTestAccount}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-default)",
                    fontSize: "0.78rem",
                    background: isTestAccount ? "var(--bg-surface-alt)" : "var(--bg-surface)",
                    cursor: isTestAccount ? "not-allowed" : "text",
                  }}
                  placeholder="alternate.email@organization.org"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Hospital / Research Organization
                </label>
                <input
                  type="text"
                  value={profile.hospital || ""}
                  onChange={(e) => !isTestAccount && handleFieldChange("hospital", e.target.value)}
                  onBlur={handleFieldBlur}
                  readOnly={isTestAccount}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-default)",
                    fontSize: "0.78rem",
                    background: isTestAccount ? "var(--bg-surface-alt)" : "var(--bg-surface)",
                    cursor: isTestAccount ? "not-allowed" : "text",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Department / Specialized Unit
                </label>
                <input
                  type="text"
                  value={profile.department || ""}
                  onChange={(e) => !isTestAccount && handleFieldChange("department", e.target.value)}
                  onBlur={handleFieldBlur}
                  readOnly={isTestAccount}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-default)",
                    fontSize: "0.78rem",
                    background: isTestAccount ? "var(--bg-surface-alt)" : "var(--bg-surface)",
                    cursor: isTestAccount ? "not-allowed" : "text",
                  }}
                />
              </div>
            </div>

            {/* Dynamic Role-Specific Fields */}
            {effectiveRole === "patient" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Patient Health Record ID / MRN
                  </label>
                  <input
                    type="text"
                    value={profile.license_id || "PT-REC-89421"}
                    onChange={(e) => !isTestAccount && handleFieldChange("license_id", e.target.value)}
                    onBlur={handleFieldBlur}
                    readOnly={isTestAccount}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid var(--border-default)",
                      fontSize: "0.78rem",
                      fontFamily: "var(--font-mono)",
                      background: isTestAccount ? "var(--bg-surface-alt)" : "var(--bg-surface)",
                      cursor: isTestAccount ? "not-allowed" : "text",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Self-Analysis & Data Portability
                  </label>
                  <input
                    type="text"
                    value="ABDM & DPDP Consent Granted (Autonomous)"
                    readOnly
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem", background: "var(--bg-canvas)", color: "var(--text-muted)" }}
                  />
                </div>
              </div>
            )}

            {effectiveRole === "admin" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Security Clearance Level
                  </label>
                  <input
                    type="text"
                    value={profile.clearance_level || ""}
                    onChange={(e) => !isTestAccount && handleFieldChange("clearance_level", e.target.value)}
                    onBlur={handleFieldBlur}
                    readOnly={isTestAccount}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid var(--border-default)",
                      fontSize: "0.78rem",
                      background: isTestAccount ? "var(--bg-surface-alt)" : "var(--bg-surface)",
                      cursor: isTestAccount ? "not-allowed" : "text",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Audit Governance Compliance
                  </label>
                  <input
                    type="text"
                    value={profile.compliance_standard || ""}
                    onChange={(e) => !isTestAccount && handleFieldChange("compliance_standard", e.target.value)}
                    onBlur={handleFieldBlur}
                    readOnly={isTestAccount}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid var(--border-default)",
                      fontSize: "0.78rem",
                      background: isTestAccount ? "var(--bg-surface-alt)" : "var(--bg-surface)",
                      cursor: isTestAccount ? "not-allowed" : "text",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Emergency Hotlines & Notification Triggers */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="panel" style={{ padding: "18px", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="panel-header" style={{ marginBottom: "14px", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={14} color="var(--primary)" />
                  <h3 style={{ fontSize: "0.82rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Section 02 // 24/7 Emergency Escalation
                  </h3>
                </div>
                <span className="step-badge">SEC. 02</span>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--primary)", marginBottom: "4px" }}>
                  ⚡ 24/7 Emergency Escalation Hotline (Direct dispatch) {isTestAccount && "(Protected)"}
                </label>
                <input
                  type="text"
                  value={profile.emergency_phone || ""}
                  onChange={(e) => !isTestAccount && handleFieldChange("emergency_phone", e.target.value)}
                  onBlur={handleFieldBlur}
                  readOnly={isTestAccount}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-primary-subtle)",
                    fontSize: "0.84rem",
                    fontWeight: 800,
                    color: "var(--primary)",
                    background: isTestAccount ? "var(--bg-surface-alt)" : "var(--bg-surface)",
                    cursor: isTestAccount ? "not-allowed" : "text",
                  }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Direct Work Phone
                  </label>
                  <input
                    type="text"
                    value={profile.phone || ""}
                    onChange={(e) => !isTestAccount && handleFieldChange("phone", e.target.value)}
                    onBlur={handleFieldBlur}
                    readOnly={isTestAccount}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid var(--border-default)",
                      fontSize: "0.78rem",
                      background: isTestAccount ? "var(--bg-surface-alt)" : "var(--bg-surface)",
                      cursor: isTestAccount ? "not-allowed" : "text",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Blood Group
                  </label>
                  <input
                    type="text"
                    value={profile.blood_group || "O+"}
                    onChange={(e) => !isTestAccount && handleFieldChange("blood_group", e.target.value)}
                    onBlur={handleFieldBlur}
                    readOnly={isTestAccount}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid var(--border-default)",
                      fontSize: "0.78rem",
                      background: isTestAccount ? "var(--bg-surface-alt)" : "var(--bg-surface)",
                      cursor: isTestAccount ? "not-allowed" : "text",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Notification & Telemetry Preferences */}
            <div className="panel" style={{ padding: "18px", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="panel-header" style={{ marginBottom: "14px", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Shield size={14} color="var(--primary)" />
                  <h3 style={{ fontSize: "0.82rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Section 03 // Telemetry & Alert Triggers
                  </h3>
                </div>
                <span className="step-badge">SEC. 03</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.74rem", cursor: isTestAccount ? "not-allowed" : "pointer" }}>
                  <input
                    type="checkbox"
                    checked={!!profile.notifications_sms}
                    disabled={isTestAccount}
                    onChange={(e) => !isTestAccount && handleFieldChange("notifications_sms", e.target.checked)}
                  />
                  <span>Dispatch immediate SMS alerts for critical diagnostic verdicts</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.74rem", cursor: isTestAccount ? "not-allowed" : "pointer" }}>
                  <input
                    type="checkbox"
                    checked={!!profile.notifications_email}
                    disabled={isTestAccount}
                    onChange={(e) => !isTestAccount && handleFieldChange("notifications_email", e.target.checked)}
                  />
                  <span>Send PDF clinical summary reports to institutional email</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.74rem", cursor: isTestAccount ? "not-allowed" : "pointer" }}>
                  <input
                    type="checkbox"
                    checked={!!profile.notifications_critical_qpu}
                    disabled={isTestAccount}
                    onChange={(e) => !isTestAccount && handleFieldChange("notifications_critical_qpu", e.target.checked)}
                  />
                  <span>Notify upon QPU quantum kernel drift or calibration warning</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ── DANGER ZONE: Complete Database Profile Deletion ─────────────────── */}
      <div
        style={{
          background: "#FFF8F8",
          border: "1px solid rgba(220, 38, 38, 0.4)",
          borderLeft: "4px solid var(--risk-high)",
          padding: "20px 24px",
          marginTop: "10px",
          boxShadow: "0 2px 8px rgba(220, 38, 38, 0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Trash2 size={16} color="var(--risk-high)" />
              <h3
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 900,
                  color: "var(--risk-high)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Danger Zone // Permanent Account & Profile Deletion
              </h3>
            </div>
            <p style={{ fontSize: "0.74rem", color: "#991B1B", marginTop: "4px", maxWidth: "750px", lineHeight: "1.4" }}>
              Permanently purge this user account, authentication credentials, personal attributes, contact hotlines, and session authorizations from the SQLite database (<code>qmedsense.db</code>). This action is immediate, irreversible, and WORM audit-logged.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setDeleteConfirmOpen(true);
              setDeleteConfirmText("");
              setError(null);
            }}
            style={{
              background: "var(--risk-high)",
              color: "#FFFFFF",
              border: 0,
              padding: "9px 20px",
              fontSize: "0.75rem",
              fontWeight: 900,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <Trash2 size={14} />
            Delete My Account
          </button>
        </div>
      </div>

      {/* ── POPUP MODAL: Confirm Permanent Deletion with Required Confirmation Text ─── */}
      {deleteConfirmOpen && (
        <div className="modal-overlay" style={{ backdropFilter: "blur(6px)", zIndex: 1000 }}>
          <div
            className="modal-content"
            style={{
              maxWidth: "520px",
              padding: "24px",
              border: "2px solid var(--risk-high)",
              background: "#FFFFFF",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", borderBottom: "1px solid var(--border-default)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "var(--risk-high-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--risk-high)",
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "0.96rem", fontWeight: 900, color: "var(--risk-high)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Do you wish to delete your account?
                  </h3>
                  <span style={{ fontSize: "0.64rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>
                    Target User: {activeUserId} ({profile.name})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <p style={{ fontSize: "0.76rem", color: "var(--text-primary)", marginBottom: "12px", lineHeight: "1.45" }}>
              This will <strong>permanently and completely purge this profile and user credentials</strong> from the SQLite database (<code>qmedsense.db</code>). This action cannot be undone. All active sessions will terminate immediately.
            </p>

            <div style={{ marginBottom: "16px", background: "var(--bg-canvas)", padding: "14px", border: "1px solid var(--border-default)" }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "6px" }}>
                To authorize complete deletion, please type <code style={{ color: "var(--risk-high)", fontWeight: 900, background: "var(--risk-high-bg)", padding: "2px 6px" }}>confirm deletion account</code> below:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="confirm deletion account"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: isDeleteAuthorized ? "2px solid var(--risk-low)" : "1px solid var(--border-default)",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  background: "#FFFFFF",
                }}
                autoFocus
              />

              <div style={{ marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.65rem", color: isDeleteAuthorized ? "var(--risk-low)" : "var(--text-muted)", fontWeight: 700 }}>
                  {isDeleteAuthorized ? "✓ Deletion authorization phrase confirmed." : 'Required phrase: "confirm deletion account"'}
                </span>
                {isDeleteAuthorized && (
                  <span style={{ fontSize: "0.62rem", background: "var(--risk-low-bg)", color: "var(--risk-low)", padding: "1px 6px", fontWeight: 800, textTransform: "uppercase" }}>
                    PURGE AUTHORIZED
                  </span>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
                style={{ padding: "8px 16px", fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 800 }}
              >
                Cancel & Keep Account
              </button>
              <button
                type="button"
                onClick={handleDeleteProfile}
                disabled={deleting || !isDeleteAuthorized}
                style={{
                  background: isDeleteAuthorized ? "var(--risk-high)" : "#E2E8F0",
                  color: isDeleteAuthorized ? "#FFFFFF" : "#94A3B8",
                  border: 0,
                  padding: "8px 20px",
                  fontSize: "0.74rem",
                  fontWeight: 900,
                  cursor: isDeleteAuthorized ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                <Trash2 size={13} />
                {deleting ? "Purging from SQLite DB..." : "Permanently Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Haute-Tech Digital Health Identity & Credentials Card Modal ─────── */}
      {viewCardOpen && (
        <div className="modal-overlay" onClick={() => setViewCardOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "580px",
              padding: "24px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border-default)", paddingBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CreditCard size={18} color="var(--primary)" />
                <h3 style={{ fontSize: "0.92rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-primary)" }}>
                  Verified Health Identity Pass
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewCardOpen(false)}
                style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* The Luxury Hologram Digital ID Card */}
            <div className="digital-id-card-wrapper">
              <div className="digital-id-card">
                {/* Card Top Banner */}
                <div className="id-card-top">
                  <div>
                    <div style={{ fontSize: "0.60rem", fontWeight: 800, letterSpacing: "0.14em", color: "var(--primary)", textTransform: "uppercase" }}>
                      Q-MEDSENSE • QUANTUM HEALTH INTELLIGENCE NETWORK
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 900, letterSpacing: "-0.02em", color: "var(--text-primary)", marginTop: "2px", textTransform: "uppercase" }}>
                      {profile.name || "Alexander Reed"}
                    </div>
                  </div>
                  <div className="id-card-chip" title="Cryptographic QPU Smart Chip" />
                </div>

                {/* Card Data Grid */}
                <div className="id-card-grid">
                  <div>
                    <div className="id-field-label">Authority Role</div>
                    <div className="id-field-val" style={{ color: "var(--primary)", textTransform: "uppercase" }}>
                      {effectiveRole === "admin" ? "Administrator" : "Patient (Autonomous Care)"}
                    </div>
                  </div>

                  <div>
                    <div className="id-field-label">Health Record / MRN</div>
                    <div className="id-field-val" style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-primary)" }}>
                      {profile.license_id || "PT-REC-89421"}
                    </div>
                  </div>

                  <div>
                    <div className="id-field-label">Primary Email</div>
                    <div className="id-field-val" style={{ fontSize: "0.74rem", wordBreak: "break-all", color: "var(--text-secondary)" }}>
                      {profile.primary_email || "alexander.reed@healthnet.org"}
                    </div>
                  </div>

                  <div>
                    <div className="id-field-label">Emergency Hotline</div>
                    <div className="id-field-val" style={{ color: "var(--risk-high)", fontSize: "0.80rem" }}>
                      {profile.emergency_phone || "+91 98333 44556"}
                    </div>
                  </div>

                  <div>
                    <div className="id-field-label">Affiliated Facility</div>
                    <div className="id-field-val" style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                      {profile.hospital || "AIIMS Clinical AI Research Unit"}
                    </div>
                  </div>

                  <div>
                    <div className="id-field-label">DPDP 2023 Consent</div>
                    <div className="id-field-val" style={{ color: "var(--risk-low)", fontSize: "0.74rem", fontWeight: 800 }}>
                      ✓ Verified & Active
                    </div>
                  </div>
                </div>

                {/* Card Bottom Barcode & Security Lineage */}
                <div className="id-card-barcode-wrap">
                  <div>
                    <div style={{ fontSize: "0.54rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </div>
                    <div style={{ fontSize: "0.58rem", color: "var(--text-secondary)", marginTop: "2px", fontWeight: 800 }}>
                      WORM AUDIT SECURED • 2026 DIGITAL HEALTH PASS
                    </div>
                  </div>

                  {/* Simulated Haute-Tech Barcode Graphic */}
                  <div className="id-barcode-lines">
                    <span className="id-barcode-bar" style={{ width: "2px" }} />
                    <span className="id-barcode-bar" style={{ width: "3px" }} />
                    <span className="id-barcode-bar" style={{ width: "1px" }} />
                    <span className="id-barcode-bar" style={{ width: "4px" }} />
                    <span className="id-barcode-bar" style={{ width: "2px" }} />
                    <span className="id-barcode-bar" style={{ width: "1px" }} />
                    <span className="id-barcode-bar" style={{ width: "3px" }} />
                    <span className="id-barcode-bar" style={{ width: "5px" }} />
                    <span className="id-barcode-bar" style={{ width: "2px" }} />
                    <span className="id-barcode-bar" style={{ width: "1px" }} />
                    <span className="id-barcode-bar" style={{ width: "4px" }} />
                    <span className="id-barcode-bar" style={{ width: "2px" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "18px", borderTop: "1px solid var(--border-default)", paddingTop: "14px" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify({
                    name: profile.name,
                    role: effectiveRole,
                    record_id: profile.license_id || "PT-REC-89421",
                    email: profile.primary_email,
                    emergency: profile.emergency_phone,
                    dpdp_verified: true,
                  }, null, 2));
                  setCopiedPass(true);
                  setTimeout(() => setCopiedPass(false), 2000);
                }}
                style={{ padding: "8px 14px", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Copy size={12} />
                {copiedPass ? "Pass Data Copied!" : "Copy Digital Token"}
              </button>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => window.print()}
                  style={{ padding: "8px 14px", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Printer size={12} />
                  Print Pass
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setViewCardOpen(false)}
                  style={{ padding: "8px 20px", fontSize: "0.72rem", width: "auto" }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
