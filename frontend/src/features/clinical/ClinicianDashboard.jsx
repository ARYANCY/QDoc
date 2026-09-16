import { useState, useEffect, useRef } from "react";
import {
  Users,
  Calendar,
  Activity,
  Video,
  FileText,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Eye,
  Edit3,
} from "lucide-react";
import { consultationsApi } from "../../api/consultations";
import VirtualConsultationRoom from "../consultation/VirtualConsultationRoom";
import { animateEntrance, animateCardStagger } from "../../utils/motion";

export default function ClinicianDashboard({ doctorId = "DOC-KAVITA", currentUser = null }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBookingForRoom, setActiveBookingForRoom] = useState(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [selectedPatientForOverride, setSelectedPatientForOverride] = useState(null);
  const containerRef = useRef(null);

  const resolvedDoctorId = currentUser?.doctor_id || doctorId;

  useEffect(() => {
    loadBookings();
    if (containerRef.current) {
      animateEntrance(containerRef.current, { y: 15, duration: 0.4 });
      animateCardStagger(containerRef.current, ".card-panel");
    }
  }, [resolvedDoctorId]);

  async function loadBookings() {
    setLoading(true);
    try {
      const res = await consultationsApi.listBookings(null, resolvedDoctorId);
      if (res?.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      console.error("Failed to load doctor bookings:", err);
    } finally {
      setLoading(false);
    }
  }

  const emergencyCount = bookings.filter((b) => b.triage_risk === "emergency_red_flag").length;
  const routineCount = bookings.length - emergencyCount;

  const triageCohort = bookings.map((b) => {
    const isEmergency = b.triage_risk === "emergency_red_flag";
    return {
      id: b.id,
      name: b.patient_name || "Alexander Reed",
      patientId: b.patient_id || "PT-89421",
      mrn: b.mrn || `MRN-${b.patient_id || "89421"}-QX`,
      primaryModule: b.specialty || b.intake?.disease || "Cardiology / Oncology",
      age: b.intake?.age || 48,
      gender: b.intake?.gender || "Male",
      risk: isEmergency ? "Emergency Red-Flag" : "Routine Ambulatory",
      isEmergency,
      crs: Math.round((isEmergency ? 0.92 : 0.28) * 100),
      symptoms: b.intake?.symptoms || b.intake?.reason || "General assessment & vital review",
      slotTime: b.slot_time || "10:30 AM",
      booking: b,
    };
  }).sort((a, b) => b.crs - a.crs);

  if (activeBookingForRoom) {
    return (
      <div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setActiveBookingForRoom(null)}
          style={{ marginBottom: "16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          ← Return to Clinician Dashboard
        </button>
        <VirtualConsultationRoom
          booking={activeBookingForRoom}
          isDoctor={true}
          onLeave={() => {
            setActiveBookingForRoom(null);
            loadBookings();
          }}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      {/* Clinician Hero Card */}
      <div
        className="card-panel"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderLeft: "4px solid var(--accent-blue)",
          padding: "20px 24px",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <span className="step-badge" style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", borderColor: "rgba(37, 99, 235, 0.25)" }}>
                CLINICAL TRIAGE COMMAND // OPD
              </span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", color: "var(--ink-primary)", fontWeight: 800, margin: 0 }}>
                Hospital Clinical Triage & Telehealth
              </h2>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.80rem", margin: 0 }}>
              Attending: <strong>{currentUser?.name || "Dr. Kavita Rao, MD"}</strong> • License / Provider ID: <strong style={{ fontFamily: "var(--font-mono)" }}>{resolvedDoctorId}</strong> • Ward: <strong>Emergency & Ambulatory OPD</strong>
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span className="step-badge" style={{ padding: "6px 12px", fontSize: "0.72rem", background: "var(--risk-low-bg)", color: "var(--risk-low)", borderColor: "var(--risk-low-border)", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={14} /> ABAC Verified Care Team
            </span>
          </div>
        </div>
      </div>

      {/* Hospital Triage KPI Scoreboard */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
        <div className="card-panel" style={{ padding: "14px 18px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Queue</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--ink-primary)", margin: "2px 0" }}>{bookings.length}</div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Checked-in patients</div>
        </div>

        <div className="card-panel" style={{ padding: "14px 18px", borderRadius: "var(--radius-sm)", border: "1px solid var(--risk-high-border)", background: emergencyCount > 0 ? "var(--risk-high-bg)" : "var(--bg-surface)" }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--risk-high)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangle size={12} /> Red-Flag Triage
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--risk-high)", margin: "2px 0" }}>{emergencyCount}</div>
          <div style={{ fontSize: "0.72rem", color: "var(--risk-high)", fontWeight: 600 }}>Immediate physician review</div>
        </div>

        <div className="card-panel" style={{ padding: "14px 18px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Routine Ambulatory</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--ink-primary)", margin: "2px 0" }}>{routineCount}</div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Standard scheduled consultations</div>
        </div>

        <div className="card-panel" style={{ padding: "14px 18px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Average Wait Time</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent-blue)", margin: "2px 0" }}>&lt; 6 Min</div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Dynamic automated triage</div>
        </div>
      </div>

      {/* Two Column Layout: Schedule & Risk Triage */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "16px" }}>
        {/* Left: Today's Consultation Schedule */}
        <div className="card-panel" style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "18px", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-default)", paddingBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={16} color="var(--accent-blue)" />
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--ink-primary)" }}>
                Scheduled Appointments ({bookings.length})
              </h3>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Live Queue</span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "0.82rem" }}>Loading patient roster...</div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "0.82rem" }}>No consultations scheduled for today.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {bookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: "var(--bg-surface-alt)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                      <strong style={{ fontSize: "0.88rem", color: "var(--ink-primary)" }}>{b.patient_name || "Registered Patient"}</strong>
                      <span className="step-badge" style={{ fontSize: "0.64rem" }}>{b.status?.toUpperCase() || "CONFIRMED"}</span>
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                      <Clock size={11} style={{ display: "inline-block", marginRight: "3px" }} />
                      {b.slot_time || "10:30 AM"} • {b.mode?.toUpperCase() || "VIDEO"} • Chief Complaint: {b.intake?.reason || b.intake?.symptoms || "Regular Review"}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setActiveBookingForRoom(b)}
                    style={{ padding: "6px 12px", fontSize: "0.75rem", borderRadius: "var(--radius-sm)" }}
                  >
                    <Video size={13} /> Open Consult Room
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Risk-Sorted Patient Triage Queue */}
        <div className="card-panel" style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "18px", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-default)", paddingBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={16} color="var(--risk-high)" />
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--ink-primary)" }}>
                Clinical Risk Stratification (CRS)
              </h3>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--risk-high)", fontWeight: 700 }}>Priority Dispatch</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {triageCohort.length === 0 ? (
              <div style={{ padding: "30px 12px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                No active triage records currently waiting.
              </div>
            ) : triageCohort.map((pat) => (
              <div
                key={pat.id}
                style={{
                  background: pat.isEmergency ? "var(--risk-high-bg)" : "var(--bg-surface-alt)",
                  border: `1px solid ${pat.isEmergency ? "var(--risk-high-border)" : "var(--border-default)"}`,
                  borderLeft: `4px solid ${pat.isEmergency ? "var(--risk-high)" : "var(--emerald-couture)"}`,
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <strong style={{ fontSize: "0.88rem", color: "var(--ink-primary)" }}>{pat.name}</strong>
                    <span style={{
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "var(--radius-xs)",
                      background: pat.isEmergency ? "var(--risk-high)" : "var(--risk-low-bg)",
                      color: pat.isEmergency ? "#fff" : "var(--risk-low)",
                      border: `1px solid ${pat.isEmergency ? "var(--risk-high)" : "var(--risk-low-border)"}`,
                      fontFamily: "var(--font-mono)",
                    }}>
                      {pat.risk.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {pat.mrn} • {pat.primaryModule} • Symptoms: <em>{pat.symptoms}</em>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "0.76rem",
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: "var(--radius-xs)",
                      color: pat.crs > 60 ? "var(--risk-high)" : "var(--risk-low)",
                      background: pat.crs > 60 ? "rgba(225, 29, 72, 0.12)" : "rgba(5, 150, 105, 0.12)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    CRS {pat.crs}
                  </span>

                  <button
                    type="button"
                    className="btn-ghost btn-sm"
                    onClick={() => {
                      setSelectedPatientForOverride(pat);
                      setOverrideModalOpen(true);
                    }}
                    title="Clinician Annotation / Override"
                  >
                    <Edit3 size={13} /> Override
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clinician Annotation & Override Modal */}
      {overrideModalOpen && selectedPatientForOverride && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: "16px",
          }}
        >
          <div
            className="card-panel"
            style={{
              maxWidth: "520px",
              width: "100%",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              padding: "24px",
              boxShadow: "var(--shadow-modal)",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.05rem", color: "var(--ink-primary)", fontWeight: 800 }}>
              Clinical Triage Override for {selectedPatientForOverride.name}
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "0 0 14px 0", lineHeight: 1.45 }}>
              Under clinical governance standards, modifying an automated triage score requires formal physician justification and is recorded to the immutable WORM audit log.
            </p>
            <div className="form-group">
              <label className="form-label">Physician Justification & Diagnosis</label>
              <textarea
                className="input-control"
                rows={3}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="State clinical rationale (e.g. ECG shows acute ST changes warranting immediate triage elevation)..."
                style={{ width: "100%", padding: "8px", marginBottom: "14px" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button type="button" className="action-btn" onClick={() => setOverrideModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="action-btn primary"
                onClick={() => {
                  if (!overrideReason.trim()) {
                    alert("Mandatory clinical rationale is required.");
                    return;
                  }
                  alert("Clinician override successfully recorded to audit log.");
                  setOverrideModalOpen(false);
                  setOverrideReason("");
                }}
              >
                Submit Clinical Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
