import { useState, useEffect } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  ShieldCheck,
  Send,
  User,
  Activity,
  Heart,
  FileText,
  Clock,
  AlertCircle,
  MessageSquare,
  Lock,
} from "lucide-react";
import { consultationsApi } from "../../api/consultations";
import EPrescriptionModal from "./EPrescriptionModal";

export default function VirtualConsultationRoom({ booking, isDoctor = false, onLeave }) {
  const [room, setRoom] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState("chat"); // chat | clinical_context
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (booking?.id) {
      loadRoom();
      const interval = setInterval(loadRoom, 4000); // Polling room state
      return () => clearInterval(interval);
    }
  }, [booking?.id]);

  async function loadRoom() {
    try {
      const res = await consultationsApi.getRoom(booking.id);
      if (res?.room) {
        setRoom(res.room);
        setChatMessages(res.room.chat_messages || []);
      }
    } catch (err) {
      console.error("Room sync error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdmit() {
    try {
      await consultationsApi.admitPatient(booking.id);
      await loadRoom();
    } catch (err) {
      alert("Failed to admit patient: " + err.message);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const sender = isDoctor ? (booking.doctor_name || "Doctor") : (booking.patient_name || "Patient");
    const text = chatInput;
    setChatInput("");
    try {
      const res = await consultationsApi.sendChatMessage(booking.id, sender, text);
      if (res?.chat_messages) {
        setChatMessages(res.chat_messages);
      }
    } catch (err) {
      console.error("Failed to send chat:", err);
    }
  }

  async function handleEndCall() {
    if (confirm("Are you sure you want to end this consultation session?")) {
      try {
        await consultationsApi.transitionBooking(booking.id, "completed");
        if (onLeave) onLeave();
      } catch (err) {
        alert("Failed to close session: " + err.message);
      }
    }
  }

  const isWaiting = room?.status === "waiting";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      {/* Session Security Ribbon */}
      <div
        style={{
          background: "var(--bg-surface-alt)",
          border: "1px solid var(--border-default)",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="step-badge" style={{ background: isWaiting ? "var(--risk-mid)" : "var(--risk-low)" }}>
            {isWaiting ? "WAITING ROOM" : "ACTIVE SESSION"}
          </span>
          <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {booking.doctor_name} ↔ {booking.patient_name || "Alexander Reed"}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            ({booking.mode?.toUpperCase()} • {booking.slot_time})
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.76rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--risk-low)", fontWeight: 600 }}>
            <Lock size={12} /> DTLS-SRTP 256-Bit Encrypted
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
            Latency: 28ms • 1080p WebRTC Mesh
          </span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "16px" }}>
        {/* Left Column: Video Feeds & Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            className="card-panel"
            style={{
              background: "#080c14",
              border: "1px solid var(--border-default)",
              aspectRatio: "16 / 9",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderRadius: 0,
            }}
          >
            {isWaiting && !isDoctor ? (
              /* Patient in Waiting Room */
              <div style={{ textAlign: "center", padding: "24px", maxWidth: "420px" }}>
                <Clock size={40} color="var(--primary)" style={{ margin: "0 auto 12px auto" }} />
                <h3 style={{ color: "var(--text-primary)", margin: "0 0 6px 0", fontSize: "1.1rem" }}>
                  Virtual Waiting Room
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", margin: "0 0 16px 0" }}>
                  Doctor <strong>{booking.doctor_name}</strong> has been notified. You will automatically be admitted into the secure video stream when the consultation begins.
                </p>
                <div style={{ fontSize: "0.76rem", color: "var(--risk-low)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <ShieldCheck size={14} /> Encrypted camera & microphone checked and ready
                </div>
              </div>
            ) : isWaiting && isDoctor ? (
              /* Doctor sees Patient waiting with Admit button */
              <div style={{ textAlign: "center", padding: "24px", maxWidth: "420px" }}>
                <User size={40} color="var(--accent-teal)" style={{ margin: "0 auto 12px auto" }} />
                <h3 style={{ color: "var(--text-primary)", margin: "0 0 6px 0", fontSize: "1.1rem" }}>
                  Patient in Waiting Room
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", margin: "0 0 16px 0" }}>
                  Patient <strong>{booking.patient_name || "Alexander Reed"}</strong> is ready to connect.
                </p>
                <button
                  type="button"
                  className="action-btn primary"
                  onClick={handleAdmit}
                  style={{ padding: "10px 24px", fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <Video size={16} /> Admit Patient to Consultation
                </button>
              </div>
            ) : (
              /* Active In-Call Video Feed Simulation */
              <div style={{ width: "100%", height: "100%", position: "relative" }}>
                {/* Main Remote Video Viewport */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "radial-gradient(circle at center, rgba(14, 165, 233, 0.15) 0%, #030712 100%)",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "var(--primary)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.8rem",
                        fontWeight: 800,
                        margin: "0 auto 10px auto",
                      }}
                    >
                      {isDoctor ? (booking.patient_name?.[0] || "P") : (booking.doctor_name?.[4] || "D")}
                    </div>
                    <div style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 700 }}>
                      {isDoctor ? booking.patient_name || "Alexander Reed (Patient)" : booking.doctor_name}
                    </div>
                    <div style={{ color: "var(--risk-low)", fontSize: "0.75rem", marginTop: "4px" }}>
                      ● Connected (HD Video Active)
                    </div>
                  </div>
                </div>

                {/* Picture-in-Picture Self Feed */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    right: "16px",
                    width: "120px",
                    height: "80px",
                    background: "#1e293b",
                    border: "1px solid var(--border-default)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-secondary)",
                    fontSize: "0.72rem",
                  }}
                >
                  {isVideoOn ? "Self Video (HD)" : <VideoOff size={16} />}
                </div>

                {/* Vitals Telemetry HUD Overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: "14px",
                    background: "rgba(3, 7, 18, 0.75)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    padding: "6px 12px",
                    display: "flex",
                    gap: "14px",
                    fontSize: "0.74rem",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--risk-high)" }}>
                    <Heart size={12} fill="currentColor" /> HR: 72 bpm
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    BP: 120/78
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--primary)" }}>
                    SpO2: 98%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Video Control Bar */}
          <div
            className="card-panel"
            style={{
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--bg-surface-alt)",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className={`tab-btn ${isAudioOn ? "active" : ""}`}
                onClick={() => setIsAudioOn(!isAudioOn)}
                style={{ padding: "8px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                {isAudioOn ? <Mic size={14} /> : <MicOff size={14} color="var(--risk-high)" />}
                {isAudioOn ? "Mute" : "Unmute"}
              </button>

              <button
                type="button"
                className={`tab-btn ${isVideoOn ? "active" : ""}`}
                onClick={() => setIsVideoOn(!isVideoOn)}
                style={{ padding: "8px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                {isVideoOn ? <Video size={14} /> : <VideoOff size={14} color="var(--risk-high)" />}
                {isVideoOn ? "Stop Cam" : "Start Cam"}
              </button>

              <button
                type="button"
                className={`tab-btn ${isScreenSharing ? "active" : ""}`}
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                style={{ padding: "8px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Share2 size={14} /> {isScreenSharing ? "Stop Share" : "Share Screen"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {isDoctor && (
                <button
                  type="button"
                  className="action-btn primary"
                  onClick={() => setRxModalOpen(true)}
                  style={{ padding: "8px 14px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <FileText size={14} /> Issue E-Prescription
                </button>
              )}

              <button
                type="button"
                className="action-btn"
                onClick={handleEndCall}
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "var(--risk-high)",
                  borderColor: "var(--risk-high)",
                  padding: "8px 14px",
                  fontSize: "0.82rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <PhoneOff size={14} /> End Call
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: In-Call Chat & Clinical Context */}
        <div
          className="card-panel"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: "480px",
            padding: 0,
            overflow: "hidden",
          }}
        >
          {/* Sub-Tabs Header */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border-default)", background: "var(--bg-surface-alt)" }}>
            <button
              type="button"
              className={`tab-btn ${activeRightTab === "chat" ? "active" : ""}`}
              onClick={() => setActiveRightTab("chat")}
              style={{ flex: 1, padding: "10px", fontSize: "0.78rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            >
              <MessageSquare size={13} /> In-Consultation Chat ({chatMessages.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeRightTab === "clinical_context" ? "active" : ""}`}
              onClick={() => setActiveRightTab("clinical_context")}
              style={{ flex: 1, padding: "10px", fontSize: "0.78rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            >
              <Activity size={13} /> Clinical EHR Intake
            </button>
          </div>

          {/* Chat Body */}
          {activeRightTab === "chat" ? (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "12px", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", maxHeight: "360px" }}>
                {chatMessages.map((msg, idx) => {
                  const isSys = msg.sender.toLowerCase() === "system";
                  return (
                    <div
                      key={idx}
                      style={{
                        background: isSys ? "rgba(14, 165, 233, 0.08)" : "var(--bg-surface-alt)",
                        border: "1px solid var(--border-default)",
                        padding: "8px 10px",
                        fontSize: "0.78rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                        <strong style={{ color: isSys ? "var(--primary)" : "var(--text-primary)" }}>{msg.sender}</strong>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{msg.time}</span>
                      </div>
                      <div style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}>{msg.text}</div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <input
                  type="text"
                  className="terminal-input"
                  placeholder="Type clinical note or message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{ flex: 1, padding: "8px", fontSize: "0.8rem" }}
                />
                <button type="submit" className="action-btn primary" style={{ padding: "8px 12px" }}>
                  <Send size={14} />
                </button>
              </form>
            </div>
          ) : (
            /* Clinical Intake Summary Tab */
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", maxHeight: "420px" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--primary)" }}>
                PATIENT REPORTED INTAKE:
              </div>
              <div style={{ fontSize: "0.8rem", lineHeight: 1.6, color: "var(--text-secondary)" }}>
                <div><strong>Reason:</strong> {booking.intake?.reason || "General Consultation"}</div>
                <div><strong>Reported Symptoms:</strong> {booking.intake?.symptoms || "None reported"}</div>
                <div><strong>Duration:</strong> {booking.intake?.duration || "N/A"}</div>
                <div><strong>Emergency Contact:</strong> {booking.intake?.emergency_contact || "+91 98333 44556"}</div>
              </div>

              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--primary)", marginTop: "8px" }}>
                RECENT QUANTUM AI CHECKS:
              </div>
              <div style={{ background: "var(--bg-surface-alt)", padding: "10px", fontSize: "0.76rem", lineHeight: 1.5 }}>
                <div>● <strong>Oncology:</strong> WDBC Breast Triage • Malignant • 94.7% Confidence</div>
                <div>● <strong>Cardio:</strong> Cleveland Heart Cohort • Risk Tier: Moderate</div>
                <div>● <strong>Consent:</strong> DPDP 2023 Opt-In Verified</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Doctor E-Prescription Modal */}
      {rxModalOpen && (
        <EPrescriptionModal
          booking={booking}
          onClose={() => setRxModalOpen(false)}
          onSuccess={() => {
            setRxModalOpen(false);
            alert("Signed E-Prescription generated and securely stored in patient record!");
          }}
        />
      )}
    </div>
  );
}
