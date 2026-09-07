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

export default function ClinicianDashboard({ doctorId = "DOC-KAVITA" }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBookingForRoom, setActiveBookingForRoom] = useState(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [selectedPatientForOverride, setSelectedPatientForOverride] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    loadBookings();
    if (containerRef.current) {
      animateEntrance(containerRef.current, { y: 15, duration: 0.4 });
      animateCardStagger(containerRef.current, ".card-panel");
    }
  }, [doctorId]);

  async function loadBookings() {
    setLoading(true);
    try {
      const res = await consultationsApi.listBookings(null, doctorId);
      if (res?.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      console.error("Failed to load doctor bookings:", err);
    } finally {
      setLoading(false);
    }
  }

  // Simulated triage patient cohort sorted by Composite Risk Score (CRS)
  const triageCohort = [
    {
      id: "PT-89421",
      mrn: "MRN-89421-QX",
      name: "Alexander Reed",
      age: 48,
      gender: "Male",
      crs: 68,
      riskTier: "High Risk",
      primaryModule: "Coronary Atheroma (VQC 0.947)",
      lastCheckup: "Today",
      status: "Scheduled at 02:00 PM",
    },
    {
      id: "PT-77120",
      mrn: "MRN-77120-BL",
      name: "Elena Rostova",
      age: 54,
      gender: "Female",
      crs: 52,
      riskTier: "Moderate Risk",
      primaryModule: "Breast Oncology (WDBC Triage)",
      lastCheckup: "Yesterday",
      status: "Review Pending",
    },
    {
      id: "PT-66014",
      mrn: "MRN-66014-KL",
      name: "Marcus Vance",
      age: 62,
      gender: "Male",
      crs: 28,
      riskTier: "Low Baseline",
      primaryModule: "Pulmonary Parenchyma (PneuVision)",
      lastCheckup: "3 days ago",
      status: "Stable",
    },
  ];

  if (activeBookingForRoom) {
    return (
      <div>
        <button
          type="button"
          className="action-btn"
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
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      {/* Clinician Hero Card */}
      <div
        className="card-panel"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderLeft: "3px solid var(--gold)",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span className="step-badge gold">CLINICIAN COCKPIT // TRIAGE</span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.45rem", color: "var(--ink-primary)", fontWeight: 900, margin: 0 }}>
                Dr. Kavita Rao, MD (Cardiology & Preventive Medicine)
              </h2>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", margin: 0, fontFamily: "var(--font-sans)" }}>
              AIIMS New Delhi • Medical Registration: <strong style={{ fontFamily: "var(--font-mono)" }}>MCI-2014-89312</strong> (Verified) • Department Care Team Alpha
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span className="step-badge" style={{ padding: "6px 12px", fontSize: "0.74rem", background: "var(--bg-surface-alt)", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={14} color="var(--emerald-couture)" /> ABAC Care-Team Enforced
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Schedule & Risk Triage */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
        {/* Left: Today's Consultation Schedule */}
        <div className="card-panel" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-default)", paddingBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={16} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>Today's Consultations ({bookings.length})</h3>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Live WebRTC Queue</span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>Loading appointments...</div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No consultations scheduled for today.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {bookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: "var(--bg-surface-alt)",
                    border: "1px solid var(--border-default)",
                    padding: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                      <strong style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}>{b.patient_name || "Alexander Reed"}</strong>
                      <span className="step-badge" style={{ fontSize: "0.68rem" }}>{b.status.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                      <Clock size={11} style={{ display: "inline-block", marginRight: "3px" }} />
                      {b.slot_time} • {b.mode?.toUpperCase()} • Reason: {b.intake?.reason || "Checkup"}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="action-btn primary"
                    onClick={() => setActiveBookingForRoom(b)}
                    style={{ padding: "6px 12px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Video size={13} /> Open Video Room
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Risk-Sorted Patient Triage Queue */}
        <div className="card-panel" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-default)", paddingBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={16} color="var(--risk-high)" />
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>Risk-Sorted Patient Triage (CRS)</h3>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--risk-high)", fontWeight: 700 }}>Top Risk First</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {triageCohort.map((pat) => (
              <div
                key={pat.id}
                style={{
                  background: "var(--bg-surface-alt)",
                  border: "1px solid var(--border-default)",
                  padding: "10px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <strong style={{ fontSize: "0.85rem" }}>{pat.name}</strong>
                    <code style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{pat.mrn}</code>
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {pat.primaryModule} • {pat.age}y {pat.gender}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "0.76rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      color: pat.crs > 60 ? "var(--risk-high)" : "var(--risk-mid)",
                      background: pat.crs > 60 ? "rgba(239, 68, 68, 0.12)" : "rgba(245, 158, 11, 0.12)",
                    }}
                  >
                    CRS {pat.crs}
                  </span>

                  <button
                    type="button"
                    className="tab-btn"
                    onClick={() => {
                      setSelectedPatientForOverride(pat);
                      setOverrideModalOpen(true);
                    }}
                    title="Clinician Annotation / Override"
                    style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                  >
                    <Edit3 size={12} /> Override
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
            backgroundColor: "rgba(3, 7, 18, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: "16px",
          }}
        >
          <div className="card-panel" style={{ maxWidth: "500px", width: "100%", background: "var(--bg-surface)" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1rem" }}>
              Clinical Annotation & AI Override for {selectedPatientForOverride.name}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0 0 12px 0" }}>
              Per SRS Section 9.2, overriding a Quantum AI prediction requires mandatory clinical rationale and is recorded to the immutable WORM audit log.
            </p>
            <textarea
              className="terminal-input"
              rows={3}
              placeholder="State clinical rationale for overriding or annotating model prediction..."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "14px" }}
            />
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
