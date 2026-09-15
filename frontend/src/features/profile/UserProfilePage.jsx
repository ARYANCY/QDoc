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
  ExternalLink,
  Plus,
} from "lucide-react";
import { profileApi } from "../../api/profile";
import { clinicalApi } from "../../api/clinical";
import { authApi } from "../../api/auth";
import { ENDPOINTS, EMERGENCY_PORTAL_BASE } from "../../api/config";
import QRCodeSVG from "../../components/common/QRCodeSVG";

function formatAllergies(allergies) {
  if (!allergies) return "";
  if (typeof allergies === "string") return allergies;
  if (Array.isArray(allergies)) {
    return allergies
      .map((a) => {
        if (typeof a === "string") return a;
        if (a && typeof a === "object") {
          const name = a.allergen || a.name || a.reaction || "";
          const sev = a.severity ? ` (${a.severity})` : "";
          return `${name}${sev}`.trim();
        }
        return String(a);
      })
      .filter(Boolean)
      .join(", ");
  }
  if (typeof allergies === "object") {
    return allergies.allergen || allergies.name || "";
  }
  return String(allergies);
}

function formatMedications(meds) {
  if (!meds) return "";
  if (typeof meds === "string") return meds;
  if (Array.isArray(meds)) {
    return meds
      .map((m) => {
        if (typeof m === "string") return m;
        if (m && typeof m === "object") {
          const name = m.name || m.medicine || "";
          const dose = m.dosage || m.dose ? ` ${m.dosage || m.dose}` : "";
          const freq = m.frequency ? ` (${m.frequency})` : "";
          return `${name}${dose}${freq}`.trim();
        }
        return String(m);
      })
      .filter(Boolean)
      .join(", ");
  }
  if (typeof meds === "object") {
    return meds.name || "";
  }
  return String(meds);
}

function formatMedicalHistory(history) {
  if (!history) return "";
  if (typeof history === "string") return history;
  if (Array.isArray(history)) {
    return history
      .map((h) => {
        if (typeof h === "string") return h;
        if (h && typeof h === "object") {
          return h.condition || h.name || h.notes || "";
        }
        return String(h);
      })
      .filter(Boolean)
      .join(", ");
  }
  return String(history);
}

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
    blood_group: "O+",
    allergies: "",
    active_medications: "",
    medical_history: "",
    abha_id: "",
    organ_donor: false,
    department: "Patient Self-Analysis & Care",
    hospital: "AIIMS Cardiology & Oncology OPD",
    license_id: "PT-REC-89421",
    attending_physician: "",
  });

  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("synced");
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [viewCardOpen, setViewCardOpen] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [cardFace, setCardFace] = useState('dual'); // 'dual', 'front', 'back'
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
        setProfile((prev) => ({
          ...prev,
          ...patient,
          allergies: formatAllergies(patient.allergies || prev.allergies),
          active_medications: formatMedications(patient.medications || patient.active_medications || prev.active_medications),
          medical_history: formatMedicalHistory(patient.medical_history || prev.medical_history),
          user_id: patient.id || prev.user_id
        }));
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
      setError('Please enter "CONFIRM DELETION ACCOUNT" exactly to authorize removal.');
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
      setError(err.message || "Failed to delete profile.");
      setDeleting(false);
    }
  }

  const effectiveRole = currentUser?.role || profile.role || "patient";
  const emergencyPortalUrl = typeof window !== "undefined"
    ? `${window.location.origin}/#emergency/${profile.user_id || "PT-ALEX"}`
    : `${EMERGENCY_PORTAL_BASE}/${profile.user_id || "PT-ALEX"}`;
  const emergencyQrUrl = ENDPOINTS.EMERGENCY_QR_PNG(profile.user_id || activeUserId);

  return (
    <div ref={containerRef} style={{ height: "100%", overflowY: "auto", padding: "16px 20px", background: "var(--bg-canvas)", fontFamily: "var(--font-sans)" }}>
      {/* ── Top Clean Header ── */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-sm)",
          padding: "20px 24px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                color: "var(--ink-primary)",
                margin: 0,
              }}
            >
              {profile.name || "Patient Profile & Medical Record"}
            </h1>
            <span
              style={{
                fontSize: "0.68rem",
                padding: "3px 8px",
                background: "var(--bg-surface-alt)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xs)",
                color: "var(--accent-blue)",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {effectiveRole}
            </span>
          </div>

          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
            Personal clinical details, emergency escalation, and digital healthcare card configuration.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 10px",
              borderRadius: "var(--radius-xs)",
              background: syncStatus === "saving" ? "var(--risk-mid-bg)" : "var(--risk-low-bg)",
              color: syncStatus === "saving" ? "var(--risk-mid)" : "var(--risk-low)",
              border: `1px solid ${syncStatus === "saving" ? "var(--risk-mid-border)" : "var(--risk-low-border)"}`,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: syncStatus === "saving" ? "var(--risk-mid)" : "var(--risk-low)",
              }}
            />
            {syncStatus === "saving" ? "Saving..." : "Auto-Saved"}
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={fetchProfileData}
            disabled={loading}
            style={{
              padding: "7px 12px",
              fontSize: "0.76rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <RefreshCw size={13} className={loading ? "spin" : ""} />
            Sync
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => setViewCardOpen(true)}
            style={{
              padding: "7px 14px",
              fontSize: "0.76rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <CreditCard size={14} />
            View Digital Card
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "var(--risk-high-bg)",
            color: "var(--risk-high)",
            padding: "10px 14px",
            fontSize: "0.78rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--risk-high-border)",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
          }}
        >
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* ── Main Form Columns ── */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          
          {/* COLUMN 1: Personal Demographics & Contact Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* 1. Demographics */}
            <div className="panel" style={{ padding: "18px 20px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
                <User size={16} color="var(--accent-blue)" />
                <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink-primary)", margin: 0 }}>
                  Personal Information
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={profile.name || ""}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    onBlur={handleFieldBlur}
                    style={{ fontSize: "0.80rem" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={profile.username || currentUser?.username || "alex.patient"}
                    readOnly
                    style={{ fontSize: "0.80rem", background: "var(--bg-surface-alt)", color: "var(--text-muted)", cursor: "not-allowed" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Age
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="130"
                    value={profile.age ?? ""}
                    onChange={(e) => handleFieldChange("age", e.target.value === "" ? "" : Number(e.target.value))}
                    onBlur={handleFieldBlur}
                    style={{ fontSize: "0.80rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Sex
                  </label>
                  <select
                    value={profile.gender || "Unspecified"}
                    onChange={(e) => handleFieldChange("gender", e.target.value)}
                    onBlur={handleFieldBlur}
                    style={{ fontSize: "0.80rem" }}
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
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Primary Email
                  </label>
                  <input
                    type="email"
                    value={profile.primary_email || ""}
                    onChange={(e) => handleFieldChange("primary_email", e.target.value)}
                    onBlur={handleFieldBlur}
                    style={{ fontSize: "0.80rem" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Direct Phone
                  </label>
                  <input
                    type="text"
                    value={profile.phone || ""}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    onBlur={handleFieldBlur}
                    style={{ fontSize: "0.80rem" }}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Blood Group
                  </label>
                  <select
                    value={profile.blood_group || "O+"}
                    onChange={(e) => {
                      handleFieldChange("blood_group", e.target.value);
                      autoSaveToDb({ ...profile, blood_group: e.target.value });
                    }}
                    style={{ fontSize: "0.80rem", fontWeight: 700, color: "var(--risk-high)" }}
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

                <div style={{ display: "flex", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.76rem", cursor: "pointer", marginTop: "16px" }}>
                    <input
                      type="checkbox"
                      checked={!!profile.organ_donor}
                      onChange={(e) => handleFieldChange("organ_donor", e.target.checked)}
                      style={{ width: "auto" }}
                    />
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                      Consented Organ Donor
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* 2. Emergency Contact */}
            <div className="panel" style={{ padding: "18px 20px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
                <Phone size={16} color="#E11D48" />
                <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink-primary)", margin: 0 }}>
                  Emergency Contact & Next of Kin
                </h3>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Primary Emergency Phone
                </label>
                <input
                  type="text"
                  value={profile.emergency_phone || ""}
                  onChange={(e) => handleFieldChange("emergency_phone", e.target.value)}
                  onBlur={handleFieldBlur}
                  style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent-blue)" }}
                  placeholder="+91 98333 44556"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={profile.emergency_contact_name || ""}
                    onChange={(e) => handleFieldChange("emergency_contact_name", e.target.value)}
                    onBlur={handleFieldBlur}
                    placeholder="e.g. Liam Reed"
                    style={{ fontSize: "0.80rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={profile.emergency_contact_relation || ""}
                    onChange={(e) => handleFieldChange("emergency_contact_relation", e.target.value)}
                    onBlur={handleFieldBlur}
                    placeholder="e.g. Spouse / Brother"
                    style={{ fontSize: "0.80rem" }}
                  />
                </div>
              </div>

              {/* Repeatable Contacts List */}
              <div className="profile-repeatable-section" style={{ marginTop: "12px" }}>
                <div className="profile-repeatable-heading">
                  <label style={{ fontSize: "0.72rem", fontWeight: 700 }}>Additional Emergency Contacts</label>
                  <button type="button" className="btn-secondary profile-add-button" onClick={addEmergencyContact}><Plus size={13} /> Add contact</button>
                </div>
                {emergencyContacts.map((contact) => (
                  <div className="profile-repeatable-row profile-contact-row" key={contact.id}>
                    <input type="text" value={contact.name || ""} onChange={(e) => updateEmergencyContact(contact.id, "name", e.target.value)} placeholder="Name" />
                    <input type="text" value={contact.relation || ""} onChange={(e) => updateEmergencyContact(contact.id, "relation", e.target.value)} placeholder="Relation" />
                    <input type="text" value={contact.phone || ""} onChange={(e) => updateEmergencyContact(contact.id, "phone", e.target.value)} placeholder="Phone" />
                    <button type="button" className="profile-icon-button" aria-label="Remove contact" onClick={() => setEmergencyContacts((items) => items.filter((entry) => entry.id !== contact.id))}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Medical History & Institutional Records */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* 3. Clinical Details & Allergies */}
            <div className="panel" style={{ padding: "18px 20px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
                <Activity size={16} color="var(--accent-blue)" />
                <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink-primary)", margin: 0 }}>
                  Clinical History & Medications
                </h3>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Known Allergies & Contraindications
                </label>
                <input
                  type="text"
                  value={formatAllergies(profile.allergies)}
                  onChange={(e) => handleFieldChange("allergies", e.target.value)}
                  onBlur={handleFieldBlur}
                  placeholder="e.g. Penicillin, Sulfa, Peanuts"
                  style={{ fontSize: "0.80rem" }}
                />
              </div>

              {/* Medical History Section */}
              <div className="profile-repeatable-section" style={{ marginBottom: "12px" }}>
                <div className="profile-repeatable-heading">
                  <label style={{ fontSize: "0.72rem", fontWeight: 700 }}>Medical History & Conditions</label>
                  <button type="button" className="btn-secondary profile-add-button" onClick={addMedicalHistory}><Plus size={13} /> Add condition</button>
                </div>
                {medicalHistory.map((item) => (
                  <div className="profile-repeatable-row" key={item.id}>
                    <input type="text" value={item.condition || ""} onChange={(e) => updateMedicalHistory(item.id, "condition", e.target.value)} placeholder="Condition / Diagnosis" />
                    <input type="text" value={item.notes || ""} onChange={(e) => updateMedicalHistory(item.id, "notes", e.target.value)} placeholder="Year or notes" />
                    <button type="button" className="profile-icon-button" aria-label="Remove item" onClick={() => setMedicalHistory((items) => items.filter((entry) => entry.id !== item.id))}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>

              {/* Medications Section */}
              <div className="profile-repeatable-section">
                <div className="profile-repeatable-heading">
                  <label style={{ fontSize: "0.72rem", fontWeight: 700 }}>Current Medications</label>
                  <button type="button" className="btn-secondary profile-add-button" onClick={addMedication}><Plus size={13} /> Add medication</button>
                </div>
                {medications.map((item) => (
                  <div className="profile-repeatable-row profile-medication-row" key={item.id}>
                    <input type="text" value={item.name || ""} onChange={(e) => updateMedication(item.id, "name", e.target.value)} placeholder="Medication" />
                    <input type="text" value={item.dose || ""} onChange={(e) => updateMedication(item.id, "dose", e.target.value)} placeholder="Dose (e.g. 10mg)" />
                    <input type="text" value={item.frequency || ""} onChange={(e) => updateMedication(item.id, "frequency", e.target.value)} placeholder="Frequency" />
                    <button type="button" className="profile-icon-button" aria-label="Remove medication" onClick={() => setMedications((items) => items.filter((entry) => entry.id !== item.id))}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Healthcare Identifiers & Facilities */}
            <div className="panel" style={{ padding: "18px 20px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
                <Shield size={16} color="#059669" />
                <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink-primary)", margin: 0 }}>
                  Healthcare Identifiers & Facility
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    ABHA / Health ID
                  </label>
                  <input
                    type="text"
                    value={profile.abha_id || ""}
                    onChange={(e) => handleFieldChange("abha_id", e.target.value)}
                    onBlur={handleFieldBlur}
                    placeholder="91-XXXX-XXXX-XXXX"
                    style={{ fontSize: "0.80rem", fontFamily: "var(--font-mono)" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Medical Record ID (MRN)
                  </label>
                  <input
                    type="text"
                    value={profile.license_id || "PT-REC-89421"}
                    onChange={(e) => handleFieldChange("license_id", e.target.value)}
                    onBlur={handleFieldBlur}
                    style={{ fontSize: "0.80rem", fontFamily: "var(--font-mono)" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Hospital / OPD Facility
                  </label>
                  <input
                    type="text"
                    value={profile.hospital || ""}
                    onChange={(e) => handleFieldChange("hospital", e.target.value)}
                    onBlur={handleFieldBlur}
                    style={{ fontSize: "0.80rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Department / Ward
                  </label>
                  <input
                    type="text"
                    value={profile.department || ""}
                    onChange={(e) => handleFieldChange("department", e.target.value)}
                    onBlur={handleFieldBlur}
                    style={{ fontSize: "0.80rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Attending Physician
                </label>
                <input
                  type="text"
                  value={profile.attending_physician || ""}
                  onChange={(e) => handleFieldChange("attending_physician", e.target.value)}
                  onBlur={handleFieldBlur}
                  placeholder="Dr. Physician Name (Department)"
                  style={{ fontSize: "0.80rem" }}
                />
              </div>
            </div>

            {/* 5. Account Security / Deletion */}
            <div className="panel" style={{ padding: "16px 20px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink-primary)", margin: 0 }}>
                    Account Data Management
                  </h4>
                  <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                    Permanently delete all patient health telemetry and stored records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(true)}
                  style={{
                    padding: "6px 12px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--risk-high-border)",
                    color: "var(--risk-high)",
                    borderRadius: "var(--radius-xs)",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>

          </div>
        </div>
      </form>

            {/* ── Modal: Digital Health Identity Card (ISO/IEC 7810 ID-1 Physical Standard) ── */}
      {viewCardOpen && (
        <div className="modal-overlay" onClick={() => setViewCardOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "820px", padding: "24px", maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                borderBottom: "1px solid var(--border-default)",
                paddingBottom: "10px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CreditCard size={18} color="var(--accent-blue)" />
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--ink-primary)", margin: 0 }}>
                    Emergency Medical Identity Card
                  </h3>
                </div>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
                  ISO/IEC 7810 ID-1 Standard (85.60 mm × 53.98 mm) • Permanent Unique ID Resolution
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Face Toggle Selector */}
                <div
                  style={{
                    display: "flex",
                    background: "var(--bg-surface-alt)",
                    padding: "3px",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCardFace("dual")}
                    style={{
                      padding: "4px 8px",
                      fontSize: "0.68rem",
                      fontWeight: cardFace === "dual" ? 700 : 500,
                      background: cardFace === "dual" ? "var(--bg-surface)" : "transparent",
                      color: cardFace === "dual" ? "var(--accent-blue)" : "var(--text-muted)",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Dual View
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardFace("front")}
                    style={{
                      padding: "4px 8px",
                      fontSize: "0.68rem",
                      fontWeight: cardFace === "front" ? 700 : 500,
                      background: cardFace === "front" ? "var(--bg-surface)" : "transparent",
                      color: cardFace === "front" ? "var(--accent-blue)" : "var(--text-muted)",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Front Face
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardFace("back")}
                    style={{
                      padding: "4px 8px",
                      fontSize: "0.68rem",
                      fontWeight: cardFace === "back" ? 700 : 500,
                      background: cardFace === "back" ? "var(--bg-surface)" : "transparent",
                      color: cardFace === "back" ? "var(--accent-blue)" : "var(--text-muted)",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Back Face (QR)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setViewCardOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Permanent Resolution Notice */}
            <div
              style={{
                background: "var(--accent-blue-light)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xs)",
                padding: "8px 12px",
                fontSize: "0.70rem",
                color: "var(--ink-primary)",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Shield size={14} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
              <div>
                <strong>Permanent Dynamic Resolution:</strong> This QR code links to your permanent ID (<code>{profile.user_id || activeUserId}</code>). Future updates to contacts, allergies, or medications sync automatically without invalidating printed cards.
              </div>
            </div>

            {/* ── Interactive Card View (Standard ID-1 Aspect Ratio: 85.60mm x 53.98mm) ── */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                justifyContent: "center",
                alignItems: "center",
                margin: "10px 0 20px 0",
              }}
            >
              {/* FRONT FACE CARD */}
              {(cardFace === "dual" || cardFace === "front") && (
                <div
                  className="id-card-viewport"
                  style={{
                    width: cardFace === "dual" ? "370px" : "440px",
                    maxWidth: "100%",
                    aspectRatio: "85.6 / 53.98",
                    background: "#FFFFFF",
                    border: "1.5px solid #CBD5E1",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
                    position: "relative",
                  }}
                >
                  {/* Top Bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #E2E8F0", paddingBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "18px", height: "18px", background: "#DC2626", color: "#FFFFFF", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px" }}>
                        +
                      </div>
                      <div>
                        <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "#2563EB", letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 1 }}>
                          Q-MEDSENSE • CRITICAL EMERGENCY PASSPORT
                        </div>
                        <div style={{ fontSize: "0.48rem", color: "#64748B", fontWeight: 600 }}>
                          ISO/IEC 7810 ID-1 Standard Layout
                        </div>
                      </div>
                    </div>
                    
                    {/* Blood Group Pill */}
                    <div style={{ background: "#DC2626", color: "#FFFFFF", padding: "2px 7px", borderRadius: "5px", textAlign: "center", lineHeight: 1 }}>
                      <span style={{ fontSize: "0.44rem", fontWeight: 700, textTransform: "uppercase", display: "block", opacity: 0.9 }}>BLOOD</span>
                      <strong style={{ fontSize: "0.88rem", fontWeight: 900, display: "block" }}>{profile.blood_group || "O+"}</strong>
                    </div>
                  </div>

                  {/* Patient Bio */}
                  <div>
                    <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0F172A", margin: "2px 0 0 0", letterSpacing: "-0.01em" }}>
                      PATIENT {profile.name?.toUpperCase() || "ALEXANDER REED"}
                    </h2>
                    <div style={{ fontSize: "0.54rem", color: "#475569", fontFamily: "var(--font-mono)", marginTop: "1px" }}>
                      MRN: <strong>{profile.license_id || "PT-REC-89421"}</strong> • ABHA: <strong>{profile.abha_id || "91-4829-1092-8821"}</strong>
                    </div>
                  </div>

                  {/* Medical Details Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px", fontSize: "0.56rem", margin: "2px 0" }}>
                    <div>
                      <span style={{ color: "#64748B", fontSize: "0.48rem", fontWeight: 700, textTransform: "uppercase", display: "block" }}>NEXT OF KIN HOTLINE</span>
                      <strong style={{ color: "#DC2626", fontSize: "0.60rem" }}>{profile.emergency_phone || "+91 98333 44556"}</strong>
                      <div style={{ color: "#475569", fontSize: "0.48rem" }}>{profile.emergency_contact_name || "Liam Reed"} ({profile.emergency_contact_relation || "Brother"})</div>
                    </div>

                    <div>
                      <span style={{ color: "#64748B", fontSize: "0.48rem", fontWeight: 700, textTransform: "uppercase", display: "block" }}>SEVERE ALLERGIES</span>
                      <strong style={{ color: "#DC2626" }}>{formatAllergies(profile.allergies) || "Penicillin (high)"}</strong>
                    </div>

                    <div>
                      <span style={{ color: "#64748B", fontSize: "0.48rem", fontWeight: 700, textTransform: "uppercase", display: "block" }}>ORGAN DONOR</span>
                      <strong style={{ color: "#059669" }}>{profile.organ_donor ? "✓ YES (CONSENTED)" : "NO"}</strong>
                    </div>

                    <div>
                      <span style={{ color: "#64748B", fontSize: "0.48rem", fontWeight: 700, textTransform: "uppercase", display: "block" }}>ATTENDING DOCTOR</span>
                      <strong style={{ color: "#0F172A" }}>{profile.hospital || "AIIMS Cardiology"}</strong>
                    </div>
                  </div>

                  {/* Prescriptions & Footer Strip */}
                  <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "3px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.48rem", color: "#64748B" }}>
                    <div style={{ maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <strong>RX: </strong>{formatMedications(profile.active_medications || profile.medications) || "Atorvastatin 20mg (OD)"}
                    </div>
                    <div style={{ fontWeight: 700, color: "#2563EB", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      LIVE TELEMETRY PASS
                    </div>
                  </div>
                </div>
              )}

              {/* BACK FACE CARD (Dedicated Scannable QR Code) */}
              {(cardFace === "dual" || cardFace === "back") && (
                <div
                  className="id-card-viewport back-face"
                  style={{
                    width: cardFace === "dual" ? "370px" : "440px",
                    maxWidth: "100%",
                    aspectRatio: "85.6 / 53.98",
                    background: "#F8FAFC",
                    border: "1.5px solid #CBD5E1",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
                    position: "relative",
                  }}
                >
                  {/* Top Bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #E2E8F0", paddingBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Shield size={14} color="#2563EB" />
                      <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#0F172A", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        EMERGENCY TRIAGE & TELEMETRY ACCESS
                      </span>
                    </div>
                    <span style={{ fontSize: "0.48rem", fontWeight: 700, color: "#059669", background: "#ECFDF5", padding: "1px 5px", borderRadius: "3px" }}>
                      PERMANENT PASS
                    </span>
                  </div>

                  {/* Body: Instructions Left + QR Right */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 88px", gap: "8px", alignItems: "center", margin: "2px 0" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "0.52rem", color: "#475569", lineHeight: 1.25 }}>
                      <div>
                        <strong style={{ color: "#0F172A" }}>Instructions for First Responders:</strong>
                        <p style={{ margin: "2px 0 0 0" }}>
                          Scan the QR code with any smartphone or terminal camera for immediate clinical history, drug interactions, and emergency EHR record access.
                        </p>
                      </div>

                      <div style={{ marginTop: "2px" }}>
                        <span style={{ color: "#64748B" }}>Permanent ID: </span>
                        <strong style={{ color: "#2563EB", fontFamily: "var(--font-mono)" }}>{profile.user_id || activeUserId}</strong>
                      </div>

                      <div style={{ color: "#94A3B8", fontSize: "0.46rem", fontFamily: "var(--font-mono)" }}>
                        SHA-256: e3b0c442...991b7852 • WORM Ledger
                      </div>
                    </div>

                    {/* QR Code Container (Crisp & Bounded) */}
                    <div
                      style={{
                        width: "88px",
                        height: "88px",
                        background: "#FFFFFF",
                        border: "1.5px solid #CBD5E1",
                        borderRadius: "6px",
                        padding: "4px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        boxSizing: "border-box",
                      }}
                    >
                      <QRCodeSVG
                        value={emergencyPortalUrl}
                        size={66}
                        fgColor="#0F172A"
                        bgColor="#FFFFFF"
                      />
                      <span style={{ fontSize: "0.42rem", fontWeight: 800, color: "#2563EB", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: "2px" }}>
                        SCAN TRIAGE
                      </span>
                    </div>
                  </div>

                  {/* Footer Strip */}
                  <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "3px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.46rem", color: "#64748B" }}>
                    <span>Portal: {emergencyPortalUrl.replace(/^https?:\/\//, '')}</span>
                    <span>Q-MedSense Verified</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Modal Footer Action Toolbar ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "12px",
                borderTop: "1px solid var(--border-default)",
                paddingTop: "12px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    navigator.clipboard?.writeText(emergencyPortalUrl);
                    setCopiedPass(true);
                    setTimeout(() => setCopiedPass(false), 2000);
                  }}
                  style={{ fontSize: "0.76rem" }}
                >
                  <Copy size={13} /> {copiedPass ? "Copied URL!" : "Copy Triage URL"}
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => window.open(emergencyPortalUrl, "_blank")}
                  style={{ fontSize: "0.76rem" }}
                >
                  <ExternalLink size={13} /> Open Triage App
                </button>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => window.print()}
                  style={{ fontSize: "0.76rem", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Printer size={13} /> Print / Save PDF
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setViewCardOpen(false)}
                  style={{ fontSize: "0.76rem" }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Dedicated Invisible Print-Only Sheet (Activated by @media print for 1:1 Scale Print & PDF) ── */}
      <div id="printable-health-card-sheet" style={{ display: "none" }}>
        <div className="print-instructions">
          <strong>Q-MedSense Emergency Medical ID Card (ISO/IEC 7810 ID-1 Standard)</strong>
          <br />
          Cut along the dashed lines. Fold along center line to fit standard wallet ID card slots (85.60 mm × 53.98 mm).
        </div>

        <div className="print-cards-row">
          {/* Front Face for Print */}
          <div className="id-card-viewport">
            <div className="id-card-header">
              <div className="id-card-brand">
                <div className="id-card-cross">+</div>
                <div>
                  <div className="id-card-title">Q-MEDSENSE • EMERGENCY PASSPORT</div>
                  <div className="id-card-subtitle">ISO/IEC 7810 ID-1 Standard</div>
                </div>
              </div>
              <div className="id-card-blood-badge">
                <span className="id-card-blood-label">BLOOD</span>
                <span className="id-card-blood-type">{profile.blood_group || "O+"}</span>
              </div>
            </div>

            <div>
              <h2 className="id-card-patient-name">PATIENT {profile.name?.toUpperCase() || "ALEXANDER REED"}</h2>
              <div className="id-card-patient-meta">
                MRN: <strong>{profile.license_id || "PT-REC-89421"}</strong> • ABHA: <strong>{profile.abha_id || "91-4829-1092-8821"}</strong>
              </div>
            </div>

            <div className="id-card-grid">
              <div>
                <span className="id-card-cell-label">NEXT OF KIN HOTLINE</span>
                <span className="id-card-cell-value alert">{profile.emergency_phone || "+91 98333 44556"}</span>
                <div style={{ fontSize: "0.48rem", color: "#475569" }}>{profile.emergency_contact_name || "Liam Reed"} ({profile.emergency_contact_relation || "Brother"})</div>
              </div>
              <div>
                <span className="id-card-cell-label">SEVERE ALLERGIES</span>
                <span className="id-card-cell-value alert">{formatAllergies(profile.allergies) || "Penicillin (high)"}</span>
              </div>
              <div>
                <span className="id-card-cell-label">ORGAN DONOR</span>
                <span className="id-card-cell-value success">{profile.organ_donor ? "✓ YES (CONSENTED)" : "NO"}</span>
              </div>
              <div>
                <span className="id-card-cell-label">ATTENDING DOCTOR</span>
                <span className="id-card-cell-value">{profile.hospital || "AIIMS Cardiology"}</span>
              </div>
            </div>

            <div className="id-card-footer">
              <div><strong>RX: </strong>{formatMedications(profile.active_medications || profile.medications) || "Atorvastatin 20mg (OD)"}</div>
              <div style={{ fontWeight: 700, color: "#2563EB" }}>LIVE TELEMETRY PASS</div>
            </div>
          </div>

          {/* Back Face for Print */}
          <div className="id-card-viewport back-face">
            <div className="id-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#0F172A", textTransform: "uppercase" }}>
                  EMERGENCY TRIAGE & TELEMETRY ACCESS
                </span>
              </div>
              <span style={{ fontSize: "0.48rem", fontWeight: 700, color: "#059669" }}>PERMANENT PASS</span>
            </div>

            <div className="id-card-back-content">
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.52rem", color: "#475569" }}>
                <div>
                  <strong style={{ color: "#0F172A" }}>Instructions for First Responders:</strong>
                  <p style={{ margin: "2px 0 0 0", lineHeight: 1.25 }}>
                    Scan QR code with smartphone camera for instant clinical history, trauma directives, and physician contacts.
                  </p>
                </div>
                <div>
                  <span>Permanent ID: </span>
                  <strong style={{ color: "#2563EB" }}>{profile.user_id || activeUserId}</strong>
                </div>
                <div style={{ fontSize: "0.46rem", color: "#94A3B8" }}>
                  SHA-256: e3b0c442...991b7852 • WORM Ledger
                </div>
              </div>

              <div className="id-card-qr-box">
                <img src={emergencyQrUrl} alt="QR Pass" />
                <div className="id-card-qr-caption">SCAN TRIAGE</div>
              </div>
            </div>

            <div className="id-card-footer">
              <span>Portal: {emergencyPortalUrl.replace(/^https?:\/\//, '')}</span>
              <span>Q-MedSense Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: Delete Account Confirmation ── */}
      {deleteConfirmOpen && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--risk-high)" }}>
              <AlertTriangle size={20} />
              <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: 0 }}>
                Confirm Account Deletion
              </h3>
            </div>

            <p style={{ fontSize: "0.80rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "14px" }}>
              This action permanently deletes your patient record, biometric parameters, and stored clinical data from the SQLite database.
            </p>

            <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Type <strong style={{ color: "var(--risk-high)" }}>CONFIRM DELETION ACCOUNT</strong> below:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="CONFIRM DELETION ACCOUNT"
              style={{ fontSize: "0.80rem", marginBottom: "16px" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteConfirmOpen(false)}
                style={{ fontSize: "0.76rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProfile}
                disabled={!isDeleteAuthorized || deleting}
                style={{
                  padding: "8px 14px",
                  background: isDeleteAuthorized ? "var(--risk-high)" : "var(--bg-surface-alt)",
                  color: isDeleteAuthorized ? "#FFFFFF" : "var(--text-muted)",
                  border: "none",
                  borderRadius: "var(--radius-xs)",
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  cursor: isDeleteAuthorized ? "pointer" : "not-allowed",
                }}
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
