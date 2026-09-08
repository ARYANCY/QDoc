import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Heart,
  Stethoscope,
  Activity,
  CreditCard,
  QrCode,
  Printer,
  Copy,
  RefreshCw,
  X,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
} from "lucide-react";
import { profileApi } from "../../api/profile";
import { clinicalApi } from "../../api/clinical";
import { authApi } from "../../api/auth";
import { animateEntrance } from "../../utils/motion";

export default function UserProfilePage({ currentUser, onProfileUpdated, onProfileDeleted, openCard = false, onCardOpened }) {
  const containerRef = useRef(null);
  const activeUserId = currentUser?.user_id || currentUser?.id || currentUser?.username || "PT-ALEX";

  const [profile, setProfile] = useState({
    user_id: activeUserId,
    username: currentUser?.username || "alex.patient",
    name: currentUser?.name || "",
    role: currentUser?.role || "patient",
    age: 48,
    gender: "Unspecified",
    primary_email: currentUser?.email || "",
    extra_email: "",
    emergency_phone: "",
    emergency_contact_name: "",
    emergency_contact_relation: "",
    phone: "",
    blood_group: "",
    allergies: "",
    active_medications: "",
    medical_history: "",
    abha_id: "",
    organ_donor: false,
    department: "Patient Self-Analysis & Care",
    hospital: "AIIMS Cardiology & Oncology OPD",
    license_id: "PT-REC-89421",
    lab_affiliation: "Quantum Machine Learning Lab - Unit 4",
    compute_cluster: "PennyLane-QPU-Rigetti-Sim",
    clearance_level: "Level 4 (Audit & Governance)",
    compliance_standard: "HIPAA / FDA 21 CFR Part 11 / DPDP Act",
    attending_physician: "",
    notifications_sms: true,
    notifications_email: true,
    notifications_critical_qpu: true,
  });

  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("synced");
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [viewCardOpen, setViewCardOpen] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [cardTheme, setCardTheme] = useState("light");
  const [medicalHistory, setMedicalHistory] = useState([
    { id: "history-1", condition: "", notes: "" },
  ]);
  const [medications, setMedications] = useState([
    { id: "med-1", name: "", dose: "", frequency: "" },
  ]);
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: "contact-1", name: "", relation: "", phone: "", email: "", is_primary: true },
  ]);

  const isDeleteAuthorized = deleteConfirmText.trim().toLowerCase() === "confirm deletion account";

  useEffect(() => {
    fetchProfileData();
    if (containerRef.current) {
      animateEntrance(containerRef.current, { y: 15, duration: 0.35 });
    }
  }, [activeUserId]);

  useEffect(() => {
    if (openCard) {
      setViewCardOpen(true);
      if (onCardOpened) onCardOpened();
    }
  }, [openCard, onCardOpened]);

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
      }
      const clinical = await clinicalApi.getPatientRecord(activeUserId);
      if (clinical.patient) {
        const patient = clinical.patient;
        setMedicalHistory(Array.isArray(patient.medical_history) ? patient.medical_history.map((item, index) => typeof item === "string" ? { id: `history-${index}`, condition: item, notes: "" } : item) : []);
        setMedications(Array.isArray(patient.medications) ? patient.medications : []);
        setEmergencyContacts(Array.isArray(patient.emergency_contacts) ? patient.emergency_contacts.map((item, index) => ({ id: `contact-${index}`, ...item })) : []);
        setProfile((prev) => ({ ...prev, ...patient, user_id: patient.id || prev.user_id }));
      }
    } catch (err) {
      // Retain fallback metadata
    } finally {
      setLoading(false);
    }
  }

  async function autoSaveToDb(updatedProfile) {
    const payload = updatedProfile || profile;
    setSyncStatus("saving");
    try {
      const res = await profileApi.updateProfile(activeUserId, payload);
      await clinicalApi.updatePatientRecord(activeUserId, {
        name: payload.name,
        age: payload.age,
        gender: payload.gender,
        blood_group: payload.blood_group,
        medical_history: medicalHistory,
        medications,
        emergency_contacts: emergencyContacts,
        emergency_contact: emergencyContacts.find((contact) => contact.is_primary)?.phone || payload.emergency_phone,
      });
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

  function updateMedicalHistory(id, field, value) {
    setMedicalHistory((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  function updateMedication(id, field, value) {
    setMedications((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  function updateEmergencyContact(id, field, value) {
    setEmergencyContacts((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : { ...item, is_primary: field === "is_primary" ? false : item.is_primary }));
  }

  function addMedicalHistory() {
    setMedicalHistory((items) => [...items, { id: `history-${Date.now()}`, condition: "", notes: "" }]);
  }

  function addMedication() {
    setMedications((items) => [...items, { id: `med-${Date.now()}`, name: "", dose: "", frequency: "" }]);
  }

  function addEmergencyContact() {
    setEmergencyContacts((items) => [...items, { id: `contact-${Date.now()}`, name: "", relation: "", phone: "", email: "", is_primary: false }]);
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
  const emergencyPortalUrl = typeof window !== "undefined"
    ? `${window.location.origin}/#emergency/${profile.user_id || "PT-ALEX"}`
    : `https://qmedsense.health/#emergency/${profile.user_id || "PT-ALEX"}`;
  const formSteps = [
    { label: "Identity", complete: Boolean(profile.name && profile.primary_email) },
    { label: "Emergency contact", complete: emergencyContacts.some((contact) => contact.name && contact.phone) },
    { label: "Clinical history", complete: medicalHistory.some((item) => item.condition) },
    { label: "Medications", complete: medications.some((item) => item.name && item.dose) },
  ];
  const completedSteps = formSteps.filter((step) => step.complete).length;
  const allergySummary = Array.isArray(profile.allergies)
    ? profile.allergies.map((item) => typeof item === "string" ? item : `${item.allergen || item.name || ""}${item.severity ? ` (${item.severity})` : ""}`).filter(Boolean).join(", ")
    : (typeof profile.allergies === "string" ? profile.allergies : "");
  const medicationSummary = Array.isArray(medications)
    ? medications.filter((item) => item.name).map((item) => `${item.name}${item.dose ? ` ${item.dose}` : ""}${item.frequency ? ` (${item.frequency})` : ""}`).join(" · ")
    : (typeof profile.active_medications === "string" ? profile.active_medications : "");
  const primaryEmergencyContact = emergencyContacts.find((contact) => contact.is_primary) || emergencyContacts[0] || {};
  const emergencyQrUrl = `/api/v1/emergency/${profile.user_id || activeUserId}/qr.png`;

  return (
    <div ref={containerRef} style={{ height: "100%", overflowY: "auto", padding: "14px 18px", background: "var(--bg-canvas)" }}>
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
              EDITION 2026 // MEDICAL DOSSIER & IDENTITY CARD
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
              {profile.name || "Patient Profile & Emergency Dossier"}
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
            Personal clinical data, 24/7 next-of-kin escalation, triage QR pass, and digital health card configuration.
          </p>
        </div>

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
            {syncStatus === "saving" ? "Saving to SQLite..." : "Auto-Saved to DB"}
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
            View & Print Card
          </button>
        </div>
      </div>

      <div
        style={{
          background: "var(--risk-low-bg)",
          border: "1px solid var(--risk-low-border)",
          borderLeft: "4px solid var(--risk-low)",
          padding: "12px 18px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle2 size={18} color="var(--risk-low)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: "0.78rem", color: "var(--risk-low)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>
              ✓ Full Profile Editing Authority Active
            </strong>
            <p style={{ fontSize: "0.70rem", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>
              All fields are completely customizable. Edits auto-sync directly to SQLite and reflect instantly on the printable emergency card and QR triage portal.
            </p>
          </div>
        </div>
        <span style={{ fontSize: "0.62rem", fontWeight: 900, background: "var(--risk-low)", color: "#FFFFFF", padding: "3px 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          LIVE SYNC ENABLED
        </span>
      </div>

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

      <div className="bento-grid-4" style={{ marginBottom: "16px" }}>
        <div className="bento-stat-card" style={{ borderTop: "3px solid var(--primary)" }}>
          <div className="bento-stat-header">
            <span className="bento-stat-label">01 // BLOOD GROUP</span>
            <span className="bento-stat-arrow">↗</span>
          </div>
          <div className="bento-stat-value" style={{ fontSize: "1.25rem", color: "var(--risk-high)", fontWeight: 900 }}>
            {profile.blood_group || "O+"}
          </div>
          <div className="bento-stat-footer">
            <span className="bento-stat-tag">CRITICAL</span>
            <span className="bento-stat-sub">{profile.organ_donor ? "Organ Donor: Consented" : "Non-Donor"}</span>
          </div>
        </div>

        <div className="bento-stat-card" style={{ borderTop: "3px solid #0369A1" }}>
          <div className="bento-stat-header">
            <span className="bento-stat-label">02 // ABHA HEALTH ID</span>
            <span className="bento-stat-arrow">↗</span>
          </div>
          <div className="bento-stat-value" style={{ fontSize: "0.82rem", wordBreak: "break-all", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
            {profile.abha_id || "91-4829-1092-8821"}
          </div>
          <div className="bento-stat-footer">
            <span className="bento-stat-tag">ABDM GATEWAY</span>
            <span className="bento-stat-sub">Verified Identity</span>
          </div>
        </div>

        <div className="bento-stat-card" style={{ borderTop: "3px solid var(--primary)" }}>
          <div className="bento-stat-header">
            <span className="bento-stat-label">03 // 24/7 NEXT OF KIN</span>
            <span className="bento-stat-arrow">↗</span>
          </div>
          <div className="bento-stat-value" style={{ fontSize: "1.05rem", color: "var(--primary)", fontWeight: 900 }}>
            {profile.emergency_phone || "+91 98333 44556"}
          </div>
          <div className="bento-stat-footer">
            <span className="bento-stat-tag">{profile.emergency_contact_name || "Liam Reed"}</span>
            <span className="bento-stat-sub">({profile.emergency_contact_relation || "Next of Kin"})</span>
          </div>
        </div>

        <div className="bento-stat-card" style={{ borderTop: "3px solid var(--accent-teal)" }}>
          <div className="bento-stat-header">
            <span className="bento-stat-label">04 // SEVERE ALLERGIES</span>
            <span className="bento-stat-arrow">↗</span>
          </div>
          <div className="bento-stat-value" style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {allergySummary ? (allergySummary.length > 25 ? allergySummary.slice(0, 25) + "..." : allergySummary) : "None Reported"}
          </div>
          <div className="bento-stat-footer">
            <span className="bento-stat-tag">TRIAGE ALERT</span>
            <span className="bento-stat-sub">Printed on QR card</span>
          </div>
        </div>
      </div>

      <div className="profile-completion-bar" role="status" aria-live="polite">
        <div>
          <strong>Emergency dossier completion</strong>
          <span>{completedSteps} of {formSteps.length} sections ready for the QR triage card</span>
        </div>
        <div className="profile-progress-track" aria-label={`${completedSteps} of ${formSteps.length} profile sections complete`}>
          <span style={{ width: `${(completedSteps / formSteps.length) * 100}%` }} />
        </div>
        <div className="profile-step-list">
          {formSteps.map((step, index) => <span className={step.complete ? "complete" : ""} key={step.label}>{index + 1}. {step.label}</span>)}
        </div>
        <button type="button" className="btn-primary profile-save-button" onClick={() => autoSaveToDb(profile)} disabled={syncStatus === "saving"}>
          <CheckCircle2 size={14} /> {syncStatus === "saving" ? "Saving..." : "Save dossier"}
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div className="panel" style={{ padding: "18px", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="panel-header" style={{ marginBottom: "14px", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} color="var(--primary)" />
                <h3 style={{ fontSize: "0.82rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Section 01 // Demographics & Identifiers
                </h3>
              </div>
              <span className="step-badge">SEC. 01</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={profile.name || ""}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  onBlur={handleFieldBlur}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-default)",
                    fontSize: "0.78rem",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Username / Handle
                </label>
                <input
                  type="text"
                  value={profile.username || currentUser?.username || "alex.patient"}
                  readOnly
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem", background: "var(--bg-canvas)", color: "var(--text-muted)", cursor: "not-allowed" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Age
                </label>
                <input
                  type="number"
                  min="0"
                  max="130"
                  value={profile.age ?? ""}
                  onChange={(e) => handleFieldChange("age", e.target.value === "" ? "" : Number(e.target.value))}
                  onBlur={handleFieldBlur}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem", background: "var(--bg-surface)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Sex
                </label>
                <select
                  value={profile.gender || "Unspecified"}
                  onChange={(e) => handleFieldChange("gender", e.target.value)}
                  onBlur={handleFieldBlur}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem", background: "var(--bg-surface)", color: "var(--text-primary)" }}
                >
                  <option value="Unspecified">Prefer not to say</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Intersex">Intersex</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Primary Email
                </label>
                <input
                  type="email"
                  value={profile.primary_email || ""}
                  onChange={(e) => handleFieldChange("primary_email", e.target.value)}
                  onBlur={handleFieldBlur}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-default)",
                    fontSize: "0.78rem",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Secondary / Family Email
                </label>
                <input
                  type="email"
                  value={profile.extra_email || ""}
                  onChange={(e) => handleFieldChange("extra_email", e.target.value)}
                  onBlur={handleFieldBlur}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-default)",
                    fontSize: "0.78rem",
                    background: "var(--bg-surface)",
                  }}
                  placeholder="family.contact@gmail.com"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Hospital / OPD Center
                </label>
                <input
                  type="text"
                  value={profile.hospital || ""}
                  onChange={(e) => handleFieldChange("hospital", e.target.value)}
                  onBlur={handleFieldBlur}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-default)",
                    fontSize: "0.78rem",
                    background: "var(--bg-surface)",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Department / Ward
                </label>
                <input
                  type="text"
                  value={profile.department || ""}
                  onChange={(e) => handleFieldChange("department", e.target.value)}
                  onBlur={handleFieldBlur}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-default)",
                    fontSize: "0.78rem",
                    background: "var(--bg-surface)",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Medical Record Number (MRN / ID)
                </label>
                <input
                  type="text"
                  value={profile.license_id || "PT-REC-89421"}
                  onChange={(e) => handleFieldChange("license_id", e.target.value)}
                  onBlur={handleFieldBlur}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-default)",
                    fontSize: "0.78rem",
                    fontFamily: "var(--font-mono)",
                    background: "var(--bg-surface)",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  ABHA / Ayushman Bharat Health ID
                </label>
                <input
                  type="text"
                  value={profile.abha_id || ""}
                  onChange={(e) => handleFieldChange("abha_id", e.target.value)}
                  onBlur={handleFieldBlur}
                  placeholder="91-XXXX-XXXX-XXXX"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-default)",
                    fontSize: "0.78rem",
                    fontFamily: "var(--font-mono)",
                    background: "var(--bg-surface)",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                Attending Physician / Care Specialist
              </label>
              <input
                type="text"
                value={profile.attending_physician || ""}
                onChange={(e) => handleFieldChange("attending_physician", e.target.value)}
                onBlur={handleFieldBlur}
                placeholder="Dr. Name (Specialization)"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid var(--border-default)",
                  fontSize: "0.78rem",
                  background: "var(--bg-surface)",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="panel" style={{ padding: "18px", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="panel-header" style={{ marginBottom: "14px", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={14} color="var(--primary)" />
                  <h3 style={{ fontSize: "0.82rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Section 02 // 24/7 Escalation & Next of Kin
                  </h3>
                </div>
                <span className="step-badge">SEC. 02</span>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--primary)", marginBottom: "4px" }}>
                  ⚡ Primary Emergency Phone (Shake-to-Call Target)
                </label>
                <input
                  type="text"
                  value={profile.emergency_phone || ""}
                  onChange={(e) => handleFieldChange("emergency_phone", e.target.value)}
                  onBlur={handleFieldBlur}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-primary-subtle)",
                    fontSize: "0.84rem",
                    fontWeight: 800,
                    color: "var(--primary)",
                    background: "var(--bg-surface)",
                  }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={profile.emergency_contact_name || ""}
                    onChange={(e) => handleFieldChange("emergency_contact_name", e.target.value)}
                    onBlur={handleFieldBlur}
                    placeholder="e.g. Liam Reed"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid var(--border-default)",
                      fontSize: "0.78rem",
                      background: "var(--bg-surface)",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={profile.emergency_contact_relation || ""}
                    onChange={(e) => handleFieldChange("emergency_contact_relation", e.target.value)}
                    onBlur={handleFieldBlur}
                    placeholder="e.g. Brother / Spouse"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid var(--border-default)",
                      fontSize: "0.78rem",
                      background: "var(--bg-surface)",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={emergencyContacts.find((contact) => contact.is_primary)?.email || ""}
                    onChange={(e) => {
                      const primary = emergencyContacts.find((contact) => contact.is_primary);
                      if (primary) updateEmergencyContact(primary.id, "email", e.target.value);
                    }}
                    onBlur={handleFieldBlur}
                    placeholder="name@example.com"
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border-default)", fontSize: "0.78rem", background: "var(--bg-surface)" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Patient Direct Phone
                  </label>
                  <input
                    type="text"
                    value={profile.phone || ""}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    onBlur={handleFieldBlur}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid var(--border-default)",
                      fontSize: "0.78rem",
                      background: "var(--bg-surface)",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Blood Group
                  </label>
                  <select
                    value={profile.blood_group || "O+"}
                    onChange={(e) => {
                      handleFieldChange("blood_group", e.target.value);
                      autoSaveToDb({ ...profile, blood_group: e.target.value });
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid var(--border-default)",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      background: "var(--bg-surface)",
                      color: "var(--risk-high)",
                    }}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.74rem", cursor: "pointer", marginTop: "6px" }}>
                  <input
                    type="checkbox"
                    checked={!!profile.organ_donor}
                    onChange={(e) => handleFieldChange("organ_donor", e.target.checked)}
                  />
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                    Consented Organ Donor (Prints ✓ YES on Emergency ID Card)
                  </span>
                </label>
              </div>
            </div>

            <div className="panel" style={{ padding: "18px", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="panel-header" style={{ marginBottom: "14px", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Activity size={14} color="var(--primary)" />
                  <h3 style={{ fontSize: "0.82rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Section 03 // Clinical History & Triage Alerts
                  </h3>
                </div>
                <span className="step-badge">SEC. 03</span>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--risk-high)", marginBottom: "4px" }}>
                  Severe Allergies (Printed prominently on QR card)
                </label>
                <input
                  type="text"
                  value={typeof profile.allergies === "string" ? profile.allergies : allergySummary}
                  onChange={(e) => handleFieldChange("allergies", e.target.value)}
                  onBlur={handleFieldBlur}
                  placeholder="e.g. Penicillin, Sulfa, Peanuts"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border-default)",
                    fontSize: "0.78rem",
                    background: "var(--bg-surface)",
                  }}
                />
              </div>

              <div className="profile-repeatable-section">
                <div className="profile-repeatable-heading">
                  <label>Medical History</label>
                  <button type="button" className="btn-secondary profile-add-button" onClick={addMedicalHistory}><Plus size={13} /> Add history</button>
                </div>
                {medicalHistory.map((item) => (
                  <div className="profile-repeatable-row" key={item.id}>
                    <input type="text" value={item.condition || ""} onChange={(e) => updateMedicalHistory(item.id, "condition", e.target.value)} placeholder="Condition or previous procedure" />
                    <input type="text" value={item.notes || ""} onChange={(e) => updateMedicalHistory(item.id, "notes", e.target.value)} placeholder="Notes, year, or status" />
                    <button type="button" className="profile-icon-button" aria-label="Remove medical history" onClick={() => setMedicalHistory((items) => items.filter((entry) => entry.id !== item.id))}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <div className="profile-repeatable-section">
                <div className="profile-repeatable-heading">
                  <label>Current Medications</label>
                  <button type="button" className="btn-secondary profile-add-button" onClick={addMedication}><Plus size={13} /> Add medication</button>
                </div>
                {medications.map((item) => (
                  <div className="profile-repeatable-row profile-medication-row" key={item.id}>
                    <input type="text" value={item.name || ""} onChange={(e) => updateMedication(item.id, "name", e.target.value)} placeholder="Medicine name" />
                    <input type="text" value={item.dose || ""} onChange={(e) => updateMedication(item.id, "dose", e.target.value)} placeholder="Dose" />
                    <input type="text" value={item.frequency || ""} onChange={(e) => updateMedication(item.id, "frequency", e.target.value)} placeholder="Frequency" />
                    <button type="button" className="profile-icon-button" aria-label="Remove medication" onClick={() => setMedications((items) => items.filter((entry) => entry.id !== item.id))}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <div className="profile-repeatable-section">
                <div className="profile-repeatable-heading">
                  <label>Emergency Contacts</label>
                  <button type="button" className="btn-secondary profile-add-button" onClick={addEmergencyContact}><Plus size={13} /> Add contact</button>
                </div>
                {emergencyContacts.map((item) => (
                  <div className="profile-repeatable-row profile-contact-row" key={item.id}>
                    <input type="text" value={item.name || ""} onChange={(e) => updateEmergencyContact(item.id, "name", e.target.value)} placeholder="Full name" />
                    <input type="text" value={item.relation || ""} onChange={(e) => updateEmergencyContact(item.id, "relation", e.target.value)} placeholder="Relationship" />
                    <input type="tel" value={item.phone || ""} onChange={(e) => updateEmergencyContact(item.id, "phone", e.target.value)} placeholder="Phone number" />
                    <input type="email" value={item.email || ""} onChange={(e) => updateEmergencyContact(item.id, "email", e.target.value)} placeholder="Email" />
                    <label className="profile-primary-toggle"><input type="radio" name="primary-emergency-contact" checked={!!item.is_primary} onChange={() => setEmergencyContacts((items) => items.map((entry) => ({ ...entry, is_primary: entry.id === item.id })))} /> Primary</label>
                    <button type="button" className="profile-icon-button" aria-label="Remove emergency contact" onClick={() => setEmergencyContacts((items) => items.filter((entry) => entry.id !== item.id))}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>

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

      {deleteConfirmOpen && (
        <div className="modal-overlay" style={{ backdropFilter: "blur(6px)", zIndex: 1000 }}>
          <div
            className="modal-content emergency-card-modal"
            style={{
              maxWidth: "520px",
              padding: "24px",
              border: "2px solid var(--risk-high)",
              background: "#FFFFFF",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            }}
          >
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

      {viewCardOpen && (
        <div className="modal-overlay" onClick={() => setViewCardOpen(false)}>
          <div
            className="modal-content emergency-card-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "680px",
              padding: "24px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
              color: "var(--text-primary)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #1E293B", paddingBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CreditCard size={20} color="#38BDF8" />
                <div>
                  <h3 style={{ fontSize: "0.94rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#F8FAFC", margin: 0 }}>
                    Physical & Virtual Emergency Health Card
                  </h3>
                  <span style={{ fontSize: "0.62rem", color: "#94A3B8", fontFamily: "var(--font-mono)" }}>
                    ISO/IEC 7810 ID-1 (85.6mm × 53.98mm) Standard Layout
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setViewCardOpen(false)}
                  style={{ background: "transparent", border: 0, cursor: "pointer", color: "#94A3B8", padding: "4px" }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="digital-id-card-wrapper" id="printable-emergency-card">
              <div
                className="digital-id-card"
                style={{
                  background: cardTheme === "light" ? "#FFFFFF" : "linear-gradient(135deg, #090D16 0%, #131D2E 50%, #080C14 100%)",
                  border: "2px solid #0284C7",
                  borderRadius: "14px",
                  padding: "18px 20px",
                  color: cardTheme === "light" ? "#0F172A" : "#FFFFFF",
                  boxShadow: cardTheme === "light" ? "0 4px 20px rgba(0,0,0,0.15)" : "0 10px 30px rgba(0,0,0,0.6)",
                  position: "relative",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", borderBottom: cardTheme === "light" ? "1px solid #E2E8F0" : "1px solid rgba(255,255,255,0.12)", paddingBottom: "8px" }}>
                  <div>
                    <div style={{ fontSize: "0.58rem", fontWeight: 900, letterSpacing: "0.14em", color: "#0284C7", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                      Q-MEDSENSE • CRITICAL EMERGENCY PASSPORT
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 900, letterSpacing: "-0.02em", color: cardTheme === "light" ? "#0F172A" : "#FFFFFF", marginTop: "2px", textTransform: "uppercase" }}>
                      {profile.name || "Alexander Reed"}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: cardTheme === "light" ? "#64748B" : "#94A3B8", fontFamily: "var(--font-mono)", marginTop: "1px" }}>
                      MRN: <strong style={{ color: cardTheme === "light" ? "#0F172A" : "#F8FAFC" }}>{profile.license_id || "PT-REC-89421"}</strong> · ABHA: <strong style={{ color: cardTheme === "light" ? "#0284C7" : "#38BDF8" }}>{profile.abha_id || "91-4829-1092-8821"}</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "50px", height: "50px", borderRadius: "10px", background: "#DC2626", border: "2px solid #FCA5A5", color: "#FFFFFF", boxShadow: "0 4px 12px rgba(220,38,38,0.4)" }}>
                    <span style={{ fontSize: "0.50rem", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.95 }}>BLOOD</span>
                    <span style={{ fontSize: "1.25rem", fontWeight: 900, lineHeight: 1 }}>{profile.blood_group || "O+"}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 130px", gap: "14px", alignItems: "center" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.72rem" }}>
                    <div>
                      <div style={{ fontSize: "0.54rem", fontWeight: 800, color: cardTheme === "light" ? "#64748B" : "#94A3B8", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>Next of Kin Hotline</div>
                      <div style={{ fontWeight: 900, color: "#DC2626", marginTop: "1px", fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
                        {primaryEmergencyContact.phone || profile.emergency_phone || "+91 98333 44556"}
                      </div>
                      <div style={{ fontSize: "0.58rem", color: cardTheme === "light" ? "#0284C7" : "#38BDF8", fontWeight: 700 }}>
                        {primaryEmergencyContact.name || profile.emergency_contact_name || "Liam Reed"} ({primaryEmergencyContact.relation || profile.emergency_contact_relation || "Brother"})
                      </div>
                      <div style={{ fontSize: "0.56rem", color: cardTheme === "light" ? "#64748B" : "#94A3B8", marginTop: "2px" }}>
                        {primaryEmergencyContact.email || "No email provided"}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.54rem", fontWeight: 800, color: cardTheme === "light" ? "#64748B" : "#94A3B8", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>Severe Allergies</div>
                      <div style={{ fontWeight: 800, color: "#DC2626", marginTop: "1px", fontSize: "0.70rem" }}>
                        {allergySummary || "Penicillin (Anaphylaxis)"}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.54rem", fontWeight: 800, color: cardTheme === "light" ? "#64748B" : "#94A3B8", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>Organ Donor</div>
                      <div style={{ fontWeight: 900, color: "#16A34A", marginTop: "1px", fontSize: "0.70rem" }}>
                        {profile.organ_donor ? "✓ YES (CONSENTED)" : "NO CONSENT"}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.54rem", fontWeight: 800, color: cardTheme === "light" ? "#64748B" : "#94A3B8", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>Attending Doctor</div>
                      <div style={{ fontWeight: 800, color: cardTheme === "light" ? "#0F172A" : "#F8FAFC", marginTop: "1px", fontSize: "0.68rem" }}>
                        {profile.attending_physician || "AIIMS Cardiology"}
                      </div>
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                      <div style={{ fontSize: "0.54rem", fontWeight: 800, color: cardTheme === "light" ? "#64748B" : "#94A3B8", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>Active Prescriptions</div>
                      <div style={{ fontSize: "0.66rem", color: cardTheme === "light" ? "#334155" : "#CBD5E1", marginTop: "1px", fontWeight: 600 }}>
                        {medicationSummary || profile.active_medications || "No active medication listed"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FFFFFF", padding: "8px", borderRadius: "10px", border: "1px solid #CBD5E1", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <img className="emergency-card-qr" src={emergencyQrUrl} alt={`Scannable emergency portal QR code for ${profile.name || "patient"}`} />
                    <span style={{ fontSize: "0.48rem", fontWeight: 900, color: "#000000", fontFamily: "var(--font-mono)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center" }}>
                      Scan Triage Portal
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", borderTop: cardTheme === "light" ? "1px solid #E2E8F0" : "1px solid rgba(255,255,255,0.1)", paddingTop: "6px" }}>
                  <div style={{ fontSize: "0.50rem", color: cardTheme === "light" ? "#64748B" : "#94A3B8", fontFamily: "var(--font-mono)" }}>
                    PORTAL: {emergencyPortalUrl.replace(/^https?:\/\//, "")}
                  </div>
                  <div style={{ fontSize: "0.52rem", color: "#0284C7", fontWeight: 800, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                    SECURE LIVE TELEMETRY PASS
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "18px", borderTop: "1px solid #1E293B", paddingTop: "14px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    navigator.clipboard?.writeText(emergencyPortalUrl);
                    setCopiedPass(true);
                    setTimeout(() => setCopiedPass(false), 2000);
                  }}
                  style={{ padding: "8px 12px", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "6px", background: "#141C2E", border: "1px solid #334155", color: "#E2E8F0" }}
                >
                  <Copy size={12} />
                  {copiedPass ? "URL Copied!" : "Copy Triage URL"}
                </button>

                <a
                  href={emergencyPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ padding: "8px 12px", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "6px", background: "#141C2E", border: "1px solid #0284C7", color: "#38BDF8", textDecoration: "none", borderRadius: "4px", fontWeight: 700 }}
                >
                  <ExternalLink size={12} />
                  Open Triage App
                </a>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => window.print()}
                  style={{ padding: "8px 16px", fontSize: "0.74rem", display: "flex", alignItems: "center", gap: "6px", background: "#0284C7", border: "1px solid #38BDF8", color: "#FFFFFF", fontWeight: 800 }}
                >
                  <Printer size={13} />
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setViewCardOpen(false)}
                  style={{ padding: "8px 18px", fontSize: "0.74rem", width: "auto", background: "#334155", color: "#FFFFFF", fontWeight: 800 }}
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
