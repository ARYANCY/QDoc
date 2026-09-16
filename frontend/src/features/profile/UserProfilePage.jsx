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

  const [activeTab, setActiveTab] = useState("identity"); // "identity", "records", "pass", "security"
  const [allergiesList, setAllergiesList] = useState(() => {
    return [
      { id: "alg-1", allergen: "Penicillin", severity: "HIGH", reaction: "Anaphylaxis / Severe Bronchospasm" },
      { id: "alg-2", allergen: "Sulfonamides", severity: "MODERATE", reaction: "Cutaneous Rash / Erythema" },
    ];
  });
  const [newAllergen, setNewAllergen] = useState("");
  const [newAllergySev, setNewAllergySev] = useState("HIGH");
  const [newAllergyRxn, setNewAllergyRxn] = useState("");

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

  function addAllergy() {
    if (!newAllergen.trim()) return;
    const updated = [
      ...allergiesList,
      { id: `alg-${Date.now()}`, allergen: newAllergen.trim(), severity: newAllergySev, reaction: newAllergyRxn.trim() || "Sensitivity" }
    ];
    setAllergiesList(updated);
    setNewAllergen("");
    setNewAllergyRxn("");
    const formatted = updated.map(a => `${a.allergen} (${a.severity})`).join(", ");
    handleFieldChange("allergies", formatted);
    autoSaveToDb({ ...profile, allergies: formatted });
  }

  function removeAllergy(id) {
    const updated = allergiesList.filter(a => a.id !== id);
    setAllergiesList(updated);
    const formatted = updated.map(a => `${a.allergen} (${a.severity})`).join(", ");
    handleFieldChange("allergies", formatted);
    autoSaveToDb({ ...profile, allergies: formatted });
  }

  const effectiveRole = currentUser?.role || profile.role || "patient";
  const emergencyPortalUrl = typeof window !== "undefined"
    ? `${window.location.origin}/#emergency/${profile.user_id || "PT-ALEX"}`
    : `${EMERGENCY_PORTAL_BASE}/${profile.user_id || "PT-ALEX"}`;
  const emergencyQrUrl = ENDPOINTS.EMERGENCY_QR_PNG(profile.user_id || activeUserId);

  return (
    <div ref={containerRef} style={{ height: "100%", overflowY: "auto", padding: "20px 24px", background: "var(--bg-canvas)", fontFamily: "var(--font-sans)" }}>
      {/* ── Top Clean Header ── */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
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

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              fontSize: "0.74rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "var(--radius-sm)",
              background: syncStatus === "saving" ? "var(--risk-mid-bg)" : "var(--risk-low-bg)",
              color: syncStatus === "saving" ? "var(--risk-mid)" : "var(--risk-low)",
              border: `1px solid ${syncStatus === "saving" ? "var(--risk-mid-border)" : "var(--risk-low-border)"}`,
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: syncStatus === "saving" ? "var(--risk-mid)" : "var(--risk-low)",
              }}
            />
            {syncStatus === "saving" ? "Saving Changes..." : "All Changes Saved to Cloud"}
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={fetchProfileData}
            disabled={loading}
            style={{
              padding: "8px 14px",
              fontSize: "0.78rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
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
              padding: "8px 16px",
              fontSize: "0.78rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <CreditCard size={15} />
            View Digital Pass
          </button>
        </div>
      </div>

      {error && (
        <div className="clinical-error-banner" style={{ marginBottom: "16px" }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Modern Segmented Tabs ── */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          background: "var(--bg-surface-alt)",
          padding: "5px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-default)",
          marginBottom: "20px",
          overflowX: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("identity")}
          style={{
            flex: 1,
            minWidth: "150px",
            padding: "8px 14px",
            fontSize: "0.80rem",
            fontWeight: activeTab === "identity" ? 700 : 600,
            color: activeTab === "identity" ? "var(--accent-blue)" : "var(--text-secondary)",
            background: activeTab === "identity" ? "var(--bg-surface)" : "transparent",
            border: activeTab === "identity" ? "1px solid var(--border-default)" : "1px solid transparent",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            boxShadow: activeTab === "identity" ? "0 1px 3px rgba(15, 23, 42, 0.06)" : "none",
            transition: "all 0.15s ease",
          }}
        >
          <User size={15} /> Identity & Demographics
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("records")}
          style={{
            flex: 1,
            minWidth: "150px",
            padding: "8px 14px",
            fontSize: "0.80rem",
            fontWeight: activeTab === "records" ? 700 : 600,
            color: activeTab === "records" ? "var(--accent-blue)" : "var(--text-secondary)",
            background: activeTab === "records" ? "var(--bg-surface)" : "transparent",
            border: activeTab === "records" ? "1px solid var(--border-default)" : "1px solid transparent",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            boxShadow: activeTab === "records" ? "0 1px 3px rgba(15, 23, 42, 0.06)" : "none",
            transition: "all 0.15s ease",
          }}
        >
          <Activity size={15} /> Clinical Records & Meds
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pass")}
          style={{
            flex: 1,
            minWidth: "150px",
            padding: "8px 14px",
            fontSize: "0.80rem",
            fontWeight: activeTab === "pass" ? 700 : 600,
            color: activeTab === "pass" ? "var(--accent-blue)" : "var(--text-secondary)",
            background: activeTab === "pass" ? "var(--bg-surface)" : "transparent",
            border: activeTab === "pass" ? "1px solid var(--border-default)" : "1px solid transparent",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            boxShadow: activeTab === "pass" ? "0 1px 3px rgba(15, 23, 42, 0.06)" : "none",
            transition: "all 0.15s ease",
          }}
        >
          <CreditCard size={15} /> Emergency ID Pass
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          style={{
            flex: 1,
            minWidth: "150px",
            padding: "8px 14px",
            fontSize: "0.80rem",
            fontWeight: activeTab === "security" ? 700 : 600,
            color: activeTab === "security" ? "var(--accent-blue)" : "var(--text-secondary)",
            background: activeTab === "security" ? "var(--bg-surface)" : "transparent",
            border: activeTab === "security" ? "1px solid var(--border-default)" : "1px solid transparent",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            boxShadow: activeTab === "security" ? "0 1px 3px rgba(15, 23, 42, 0.06)" : "none",
            transition: "all 0.15s ease",
          }}
        >
          <Shield size={15} /> Security & Account
        </button>
      </div>

      {/* ── TAB 1: IDENTITY & DEMOGRAPHICS ── */}
      {activeTab === "identity" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "20px", marginBottom: "20px" }}>
          {/* Left: Demographics Box */}
          <div className="panel" style={{ padding: "20px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", borderBottom: "1px solid var(--border-default)", paddingBottom: "10px" }}>
              <User size={18} color="var(--accent-blue)" />
              <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--ink-primary)", margin: 0 }}>
                Patient Legal Identity & Contacts
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <div className="form-group">
                <label className="form-label">Full Legal Name</label>
                <input
                  type="text"
                  className="input-control"
                  value={profile.name || ""}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  onBlur={handleFieldBlur}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username / System ID</label>
                <input
                  type="text"
                  className="input-control"
                  value={profile.username || currentUser?.username || "alex.patient"}
                  readOnly
                  style={{ background: "var(--bg-surface-alt)", color: "var(--text-muted)", cursor: "not-allowed" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  min="0"
                  max="130"
                  className="input-control"
                  value={profile.age ?? ""}
                  onChange={(e) => handleFieldChange("age", e.target.value === "" ? "" : Number(e.target.value))}
                  onBlur={handleFieldBlur}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Biological Sex</label>
                <select
                  className="select-control"
                  value={profile.gender || "Unspecified"}
                  onChange={(e) => handleFieldChange("gender", e.target.value)}
                  onBlur={handleFieldBlur}
                >
                  <option value="Unspecified">Prefer not to say</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Intersex">Intersex</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <div className="form-group">
                <label className="form-label">Primary Email</label>
                <input
                  type="email"
                  className="input-control"
                  value={profile.primary_email || ""}
                  onChange={(e) => handleFieldChange("primary_email", e.target.value)}
                  onBlur={handleFieldBlur}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Direct Phone</label>
                <input
                  type="text"
                  className="input-control"
                  value={profile.phone || ""}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  onBlur={handleFieldBlur}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  className="select-control"
                  value={profile.blood_group || "O+"}
                  onChange={(e) => {
                    handleFieldChange("blood_group", e.target.value);
                    autoSaveToDb({ ...profile, blood_group: e.target.value });
                  }}
                  style={{ fontWeight: 800, color: "var(--risk-high)" }}
                >
                  <option value="A+">A+ (A Positive)</option>
                  <option value="A-">A- (A Negative)</option>
                  <option value="B+">B+ (B Positive)</option>
                  <option value="B-">B- (B Negative)</option>
                  <option value="AB+">AB+ (AB Positive)</option>
                  <option value="AB-">AB- (AB Negative)</option>
                  <option value="O+">O+ (O Positive)</option>
                  <option value="O-">O- (O Negative)</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", paddingTop: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.80rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={!!profile.organ_donor}
                    onChange={(e) => handleFieldChange("organ_donor", e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: 700, color: "var(--ink-primary)" }}>
                    Consented Organ Donor
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Hospital Identifiers */}
          <div className="panel" style={{ padding: "20px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", borderBottom: "1px solid var(--border-default)", paddingBottom: "10px" }}>
              <Shield size={18} color="var(--accent-teal)" />
              <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--ink-primary)", margin: 0 }}>
                Healthcare Identifiers & Primary Facility
              </h3>
            </div>

            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label">ABHA Health ID (Ayushman Bharat)</label>
              <input
                type="text"
                className="input-control"
                value={profile.abha_id || ""}
                onChange={(e) => handleFieldChange("abha_id", e.target.value)}
                onBlur={handleFieldBlur}
                placeholder="91-XXXX-XXXX-XXXX"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label">Medical Record Number (MRN)</label>
              <input
                type="text"
                className="input-control"
                value={profile.license_id || "PT-REC-89421"}
                onChange={(e) => handleFieldChange("license_id", e.target.value)}
                onBlur={handleFieldBlur}
                style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label">Hospital / Tertiary Center</label>
              <input
                type="text"
                className="input-control"
                value={profile.hospital || ""}
                onChange={(e) => handleFieldChange("hospital", e.target.value)}
                onBlur={handleFieldBlur}
                placeholder="e.g. AIIMS Cardiology & Oncology OPD"
              />
            </div>

            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label">Department / Ward</label>
              <input
                type="text"
                className="input-control"
                value={profile.department || ""}
                onChange={(e) => handleFieldChange("department", e.target.value)}
                onBlur={handleFieldBlur}
                placeholder="e.g. Clinical Inpatient Ward 4B"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Attending Physician</label>
              <input
                type="text"
                className="input-control"
                value={profile.attending_physician || ""}
                onChange={(e) => handleFieldChange("attending_physician", e.target.value)}
                onBlur={handleFieldBlur}
                placeholder="Dr. Physician Name (Department)"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: CLINICAL RECORDS & MEDS ── */}
      {activeTab === "records" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          {/* Left: Allergies & Contraindications Manager */}
          <div className="panel" style={{ padding: "20px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", borderBottom: "1px solid var(--border-default)", paddingBottom: "10px" }}>
              <AlertTriangle size={18} color="#DC2626" />
              <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--ink-primary)", margin: 0 }}>
                Known Allergies & Contraindications
              </h3>
            </div>

            {/* List of active allergy chips */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              {allergiesList.map((alg) => (
                <div
                  key={alg.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: alg.severity === "HIGH" ? "var(--risk-high-bg)" : "var(--risk-mid-bg)",
                    border: `1px solid ${alg.severity === "HIGH" ? "var(--risk-high-border)" : "var(--risk-mid-border)"}`,
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "0.84rem", color: alg.severity === "HIGH" ? "var(--risk-high)" : "var(--risk-mid)" }}>
                        {alg.allergen}
                      </strong>
                      <span
                        style={{
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: alg.severity === "HIGH" ? "#DC2626" : "#D97706",
                          color: "#FFFFFF",
                        }}
                      >
                        {alg.severity} RISK
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                      {alg.reaction}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAllergy(alg.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94A3B8",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    title="Remove Allergy"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {allergiesList.length === 0 && (
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                  No known allergies documented.
                </p>
              )}
            </div>

            {/* Add New Allergy Form */}
            <div style={{ background: "var(--bg-surface-alt)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", padding: "12px" }}>
              <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--ink-primary)", marginBottom: "8px" }}>
                Add New Allergy / Drug Sensitivity
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "8px", marginBottom: "8px" }}>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Allergen (e.g. Sulfa, Peanuts)"
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                />
                <select
                  className="select-control"
                  value={newAllergySev}
                  onChange={(e) => setNewAllergySev(e.target.value)}
                >
                  <option value="HIGH">HIGH</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: "8px" }}>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Expected reaction (e.g. Anaphylaxis)"
                  value={newAllergyRxn}
                  onChange={(e) => setNewAllergyRxn(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={addAllergy}
                  style={{ padding: "6px 12px", fontSize: "0.74rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                >
                  <Plus size={13} /> Add
                </button>
              </div>
            </div>

            {/* Medical History Conditions */}
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink-primary)" }}>Medical Diagnoses & History</label>
                <button type="button" className="btn-secondary" onClick={addMedicalHistory} style={{ padding: "4px 8px", fontSize: "0.70rem" }}><Plus size={12} /> Add Condition</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {medicalHistory.map((item) => (
                  <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 32px", gap: "8px", alignItems: "center" }}>
                    <input type="text" className="input-control" value={item.condition || ""} onChange={(e) => updateMedicalHistory(item.id, "condition", e.target.value)} placeholder="Condition / Diagnosis" />
                    <input type="text" className="input-control" value={item.notes || ""} onChange={(e) => updateMedicalHistory(item.id, "notes", e.target.value)} placeholder="Year or notes" />
                    <button type="button" onClick={() => setMedicalHistory((items) => items.filter((entry) => entry.id !== item.id))} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Active Medications Manager */}
          <div className="panel" style={{ padding: "20px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", borderBottom: "1px solid var(--border-default)", paddingBottom: "10px" }}>
              <Stethoscope size={18} color="var(--accent-blue)" />
              <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--ink-primary)", margin: 0 }}>
                Active Pharmacotherapy & Prescriptions
              </h3>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                Current ongoing medications, dosage, and intake frequency:
              </span>
              <button type="button" className="btn-secondary" onClick={addMedication} style={{ padding: "5px 10px", fontSize: "0.72rem" }}>
                <Plus size={13} /> Add Med
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {medications.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 0.8fr 1fr 32px",
                    gap: "8px",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "var(--bg-surface-alt)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <input
                    type="text"
                    className="input-control"
                    value={item.name || ""}
                    onChange={(e) => updateMedication(item.id, "name", e.target.value)}
                    placeholder="Medication name"
                  />
                  <input
                    type="text"
                    className="input-control"
                    value={item.dose || ""}
                    onChange={(e) => updateMedication(item.id, "dose", e.target.value)}
                    placeholder="Dose (e.g. 20mg)"
                  />
                  <input
                    type="text"
                    className="input-control"
                    value={item.frequency || ""}
                    onChange={(e) => updateMedication(item.id, "frequency", e.target.value)}
                    placeholder="Frequency (OD/BD)"
                  />
                  <button
                    type="button"
                    onClick={() => setMedications((items) => items.filter((entry) => entry.id !== item.id))}
                    style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: "4px" }}
                    title="Remove Medication"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Emergency Contacts Section */}
            <div style={{ marginTop: "24px", borderTop: "1px solid var(--border-default)", paddingTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={15} color="#DC2626" />
                  <strong style={{ fontSize: "0.80rem", color: "var(--ink-primary)" }}>Emergency Contacts & Next of Kin</strong>
                </div>
                <button type="button" className="btn-secondary" onClick={addEmergencyContact} style={{ padding: "4px 8px", fontSize: "0.70rem" }}>
                  <Plus size={12} /> Add Contact
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 32px", gap: "8px", alignItems: "center" }}>
                    <input type="text" className="input-control" value={contact.name || ""} onChange={(e) => updateEmergencyContact(contact.id, "name", e.target.value)} placeholder="Full Name" />
                    <input type="text" className="input-control" value={contact.relation || ""} onChange={(e) => updateEmergencyContact(contact.id, "relation", e.target.value)} placeholder="Relation (Brother/Spouse)" />
                    <input type="text" className="input-control" value={contact.phone || ""} onChange={(e) => updateEmergencyContact(contact.id, "phone", e.target.value)} placeholder="Phone number" />
                    <button type="button" onClick={() => setEmergencyContacts((items) => items.filter((entry) => entry.id !== contact.id))} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: EMERGENCY ID PASS PREVIEW ── */}
      {activeTab === "pass" && (
        <div className="panel" style={{ padding: "24px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border-default)", paddingBottom: "12px" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--ink-primary)", margin: 0 }}>
                Digital Health Identity Pass (ISO/IEC 7810 ID-1 Standard)
              </h3>
              <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                Permanent patient pass with scannable dynamic QR resolving directly to live emergency telemetry.
              </span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(emergencyPortalUrl);
                  setCopiedPass(true);
                  setTimeout(() => setCopiedPass(false), 2000);
                }}
              >
                <Copy size={13} /> {copiedPass ? "Copied Link!" : "Copy Triage Link"}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => window.print()}
              >
                <Printer size={13} /> Print Medical ID
              </button>
            </div>
          </div>

          {/* Render both cards side-by-side cleanly */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center", alignItems: "center", padding: "10px 0" }}>
            {/* Front Card */}
            <div
              style={{
                width: "380px",
                maxWidth: "100%",
                aspectRatio: "85.6 / 53.98",
                background: "#FFFFFF",
                border: "1.5px solid #CBD5E1",
                borderRadius: "10px",
                padding: "14px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #E2E8F0", paddingBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "18px", height: "18px", background: "#DC2626", color: "#FFFFFF", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px" }}>+</div>
                  <div>
                    <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "#2563EB", letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 1 }}>Q-RAKSHAK • CRITICAL EMERGENCY PASSPORT</div>
                    <div style={{ fontSize: "0.48rem", color: "#64748B", fontWeight: 600 }}>ISO/IEC 7810 ID-1 Standard</div>
                  </div>
                </div>
                <div style={{ background: "#DC2626", color: "#FFFFFF", padding: "2px 7px", borderRadius: "5px", textAlign: "center", lineHeight: 1 }}>
                  <span style={{ fontSize: "0.44rem", fontWeight: 700, textTransform: "uppercase", display: "block" }}>BLOOD</span>
                  <strong style={{ fontSize: "0.88rem", fontWeight: 900, display: "block" }}>{profile.blood_group || "O+"}</strong>
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0F172A", margin: "2px 0 0 0" }}>PATIENT {profile.name?.toUpperCase() || "ALEXANDER REED"}</h2>
                <div style={{ fontSize: "0.54rem", color: "#475569", fontFamily: "var(--font-mono)", marginTop: "1px" }}>
                  MRN: <strong>{profile.license_id || "PT-REC-89421"}</strong> • ABHA: <strong>{profile.abha_id || "91-4829-1092-8821"}</strong>
                </div>
              </div>

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
                  <strong style={{ color: "#059669" }}>{profile.organ_donor ? "YES (CONSENTED)" : "NO"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontSize: "0.48rem", fontWeight: 700, textTransform: "uppercase", display: "block" }}>ATTENDING DOCTOR</span>
                  <strong style={{ color: "#0F172A" }}>{profile.hospital || "AIIMS Cardiology"}</strong>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "3px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.48rem", color: "#64748B" }}>
                <div style={{ maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <strong>RX: </strong>{formatMedications(profile.active_medications || profile.medications) || "Atorvastatin 20mg (OD)"}
                </div>
                <div style={{ fontWeight: 700, color: "#2563EB", textTransform: "uppercase" }}>LIVE TELEMETRY PASS</div>
              </div>
            </div>

            {/* Back Card (QR) */}
            <div
              style={{
                width: "380px",
                maxWidth: "100%",
                aspectRatio: "85.6 / 53.98",
                background: "#F8FAFC",
                border: "1.5px solid #CBD5E1",
                borderRadius: "10px",
                padding: "14px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #E2E8F0", paddingBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Shield size={14} color="#2563EB" />
                  <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#0F172A", textTransform: "uppercase" }}>EMERGENCY TRIAGE ACCESS</span>
                </div>
                <span style={{ fontSize: "0.48rem", fontWeight: 700, color: "#059669", background: "#ECFDF5", padding: "1px 5px", borderRadius: "3px" }}>PERMANENT PASS</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 88px", gap: "8px", alignItems: "center", margin: "2px 0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "0.52rem", color: "#475569", lineHeight: 1.25 }}>
                  <div>
                    <strong style={{ color: "#0F172A" }}>Instructions for First Responders:</strong>
                    <p style={{ margin: "2px 0 0 0" }}>
                      Scan the QR code with any camera for immediate clinical history, drug interactions, and emergency contacts.
                    </p>
                  </div>
                  <div>
                    <span>Permanent ID: </span>
                    <strong style={{ color: "#2563EB", fontFamily: "var(--font-mono)" }}>{profile.user_id || activeUserId}</strong>
                  </div>
                  <div style={{ color: "#94A3B8", fontSize: "0.46rem", fontFamily: "var(--font-mono)" }}>
                    SHA-256: e3b0c442...991b7852 • WORM Ledger
                  </div>
                </div>

                <div style={{ width: "88px", height: "88px", background: "#FFFFFF", border: "1.5px solid #CBD5E1", borderRadius: "6px", padding: "4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <QRCodeSVG value={emergencyPortalUrl} size={66} fgColor="#0F172A" bgColor="#FFFFFF" />
                  <span style={{ fontSize: "0.42rem", fontWeight: 800, color: "#2563EB", textTransform: "uppercase", marginTop: "2px" }}>SCAN TRIAGE</span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "3px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.46rem", color: "#64748B" }}>
                <span>Portal: {emergencyPortalUrl.replace(/^https?:\/\//, '')}</span>
                <span>Q-RAKSHAK Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: SECURITY & ACCOUNT MANAGEMENT ── */}
      {activeTab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px", margin: "0 auto 20px auto" }}>
          <div className="panel" style={{ padding: "20px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", borderBottom: "1px solid var(--border-default)", paddingBottom: "10px" }}>
              <Shield size={18} color="var(--accent-blue)" />
              <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--ink-primary)", margin: 0 }}>
                Data Security & Audit Controls
              </h3>
            </div>

            <p style={{ fontSize: "0.80rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "14px" }}>
              Your electronic health records and biometric measurements are protected under immutable audit logging (WORM) and AES-256 encryption at rest.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--bg-surface-alt)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)" }}>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink-primary)" }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Secures medical data using hardware or app-based OTP</div>
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#059669", background: "#ECFDF5", padding: "3px 8px", borderRadius: "4px" }}>ACTIVE</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--bg-surface-alt)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)" }}>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink-primary)" }}>Public Emergency Pass Access</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Permits authorized first responders to scan your triage pass</div>
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-blue)", background: "var(--accent-blue-soft)", padding: "3px 8px", borderRadius: "4px" }}>ENABLED</span>
              </div>
            </div>
          </div>

          <div className="panel" style={{ padding: "20px", background: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#DC2626" }}>
              <AlertTriangle size={18} />
              <h3 style={{ fontSize: "0.92rem", fontWeight: 800, margin: 0 }}>
                Danger Zone: Delete Patient Account
              </h3>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#9F1239", lineHeight: 1.5, marginBottom: "14px" }}>
              Permanently purge all patient profile data, telemetry history, diagnostic inferences, and emergency passes from the database. This action is irreversible.
            </p>
            <button
              type="button"
              className="btn-danger"
              onClick={() => setDeleteConfirmOpen(true)}
              style={{ fontSize: "0.78rem", padding: "8px 16px" }}
            >
              <Trash2 size={14} /> Delete Patient Account
            </button>
          </div>
        </div>
      )}


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
                          Q-RAKSHAK • CRITICAL EMERGENCY PASSPORT
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
                      <strong style={{ color: "#059669" }}>{profile.organ_donor ? "YES (CONSENTED)" : "NO"}</strong>
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
                    <span>Q-RAKSHAK Verified</span>
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
          <strong>Q-RAKSHAK Emergency Medical ID Card (ISO/IEC 7810 ID-1 Standard)</strong>
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
                  <div className="id-card-title">Q-RAKSHAK • EMERGENCY PASSPORT</div>
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
                <span className="id-card-cell-value success">{profile.organ_donor ? "YES (CONSENTED)" : "NO"}</span>
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
              <span>Q-RAKSHAK Verified</span>
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
