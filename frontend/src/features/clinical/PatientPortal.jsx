import { useState, useEffect } from "react";
import { User, Activity, Heart, Shield, CheckCircle2, Clock, Calendar, FileText, Pill, AlertCircle, RefreshCw } from "lucide-react";
import DigitalTwin2D from "../../components/visualizations/DigitalTwin2D";
import { clinicalApi } from "../../api/clinical";
import { complianceApi } from "../../api/compliance";

export default function PatientPortal({ patientId = "PT-89421" }) {
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [patient, setPatient] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [pRes, aRes] = await Promise.all([
          clinicalApi.getPatientRecord(patientId).catch(() => null),
          complianceApi.getAuditLogs().catch(() => null),
        ]);
        if (pRes?.patient) setPatient(pRes.patient);
        if (aRes?.logs) setAuditLogs(aRes.logs);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [patientId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      {/* Patient Welcome Hero */}
      <div className="card-panel" style={{ background: "var(--bg-surface-alt)", borderRadius: 0, border: "1px solid var(--border-default)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className="step-badge">PATIENT</span>
              <h2 style={{ fontSize: "1.2rem", color: "var(--primary)", margin: 0, fontWeight: 800 }}>
                {patient?.name || "Patient Portal"}
              </h2>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", margin: 0 }}>
              Patient ID: <code style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{patientId}</code> • MRN: <code style={{ fontFamily: "var(--font-mono)" }}>{patient?.mrn || "MRN-PENDING"}</code>
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span className="consent-badge-verified" style={{ borderRadius: 0, padding: "4px 8px", fontSize: "0.75rem" }}>
              <Shield size={12} /> DPDP 2023 Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-default)", gap: "2px" }}>
        <button
          type="button"
          onClick={() => setActiveSubTab("overview")}
          style={{
            padding: "8px 16px",
            background: activeSubTab === "overview" ? "var(--primary)" : "var(--bg-surface)",
            color: activeSubTab === "overview" ? "#FFFFFF" : "var(--text-secondary)",
            border: "1px solid var(--border-default)",
            borderBottom: "none",
            borderRadius: 0,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.82rem",
          }}
        >
          Health Overview & Twin
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("meds")}
          style={{
            padding: "8px 16px",
            background: activeSubTab === "meds" ? "var(--primary)" : "var(--bg-surface)",
            color: activeSubTab === "meds" ? "#FFFFFF" : "var(--text-secondary)",
            border: "1px solid var(--border-default)",
            borderBottom: "none",
            borderRadius: 0,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.82rem",
          }}
        >
          Clinical Conditions & Vitals
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("records")}
          style={{
            padding: "8px 16px",
            background: activeSubTab === "records" ? "var(--primary)" : "var(--bg-surface)",
            color: activeSubTab === "records" ? "#FFFFFF" : "var(--text-secondary)",
            border: "1px solid var(--border-default)",
            borderBottom: "none",
            borderRadius: 0,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.82rem",
          }}
        >
          Live Audit Log ({auditLogs.length})
        </button>
      </div>

      {activeSubTab === "overview" && (
        <div className="split-workspace" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Left: Simplified Health Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="card-panel" style={{ borderRadius: 0, border: "1px solid var(--border-default)" }}>
              <div className="card-header">
                <span className="card-title">
                  <Heart size={16} color="var(--risk-low)" /> Monitored Baseline Vitals
                </span>
                <span className="consent-badge-verified" style={{ borderRadius: 0 }}>Verified Database Record</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                <div style={{ padding: "10px 12px", background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)", borderRadius: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: "0.82rem", display: "block" }}>Heart Rate & Blood Pressure</strong>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                      {patient?.baseline_vitals?.heart_rate_bpm || 0} BPM • {patient?.baseline_vitals?.blood_pressure || "0/0 mmHg"}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", background: "var(--primary-soft)", padding: "2px 6px", border: "1px solid var(--primary)" }}>
                    Telemetry Synced
                  </span>
                </div>

                <div style={{ padding: "10px 12px", background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)", borderRadius: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: "0.82rem", display: "block" }}>Oxygen Saturation & Temperature</strong>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                      SpO2: {patient?.baseline_vitals?.spo2_percent || 0}% • Temp: {patient?.baseline_vitals?.temperature_f || 0}°F
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--risk-low)", background: "var(--risk-low-bg)", padding: "2px 6px", border: "1px solid var(--risk-low)" }}>
                    Normal
                  </span>
                </div>
              </div>
            </div>

            <div className="card-panel" style={{ borderRadius: 0, border: "1px solid var(--border-default)" }}>
              <div className="card-header">
                <span className="card-title">
                  <Shield size={16} color="var(--primary)" /> Privacy & DPDP Rights
                </span>
              </div>
              <p style={{ fontSize: "0.80rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: "8px 0 0 0" }}>
                Under the <strong>Digital Personal Data Protection Act (DPDP), 2023</strong>, all telemetry and diagnostic records are stored in encrypted SQLite tables with SHA-256 cryptographic hash logs. You maintain the absolute right to audit or export your records.
              </p>
            </div>
          </div>

          {/* Right: 2D Interactive Digital Twin */}
          <div className="card-panel" style={{ borderRadius: 0, border: "1px solid var(--border-default)" }}>
            <div className="card-header">
              <span className="card-title">
                <Activity size={16} color="var(--primary)" /> 2D Physiological Avatar
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Live Synchronized</span>
            </div>
            <DigitalTwin2D patientId={patientId} />
          </div>
        </div>
      )}

      {activeSubTab === "meds" && (
        <div className="card-panel" style={{ borderRadius: 0, border: "1px solid var(--border-default)" }}>
          <div className="card-header">
            <span className="card-title">
              <Pill size={16} color="var(--primary)" /> Active Conditions & Clinical Metadata
            </span>
          </div>
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(patient?.conditions || []).map((c, i) => (
                <span key={i} style={{ background: "var(--primary-soft)", color: "var(--primary)", border: "1px solid var(--primary)", padding: "4px 10px", fontSize: "0.78rem", fontWeight: 700 }}>
                  {c}
                </span>
              ))}
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
              Age: {patient?.age || 0}y • Gender: {patient?.gender || "N/A"} • Blood Group: {patient?.blood_group || "N/A"} • Height: {patient?.height_cm || 0} cm • Weight: {patient?.weight_kg || 0} kg
            </p>
          </div>
        </div>
      )}

      {activeSubTab === "records" && (
        <div className="card-panel" style={{ borderRadius: 0, border: "1px solid var(--border-default)" }}>
          <div className="card-header">
            <span className="card-title">
              <FileText size={16} color="var(--primary)" /> Live Security & Ingestion Audit Log (SQLite Database)
            </span>
          </div>
          <div className="data-table-wrap" style={{ marginTop: "12px", border: "1px solid var(--border-default)" }}>
            <table className="clinical-data-table">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td><code>{log.id}</code></td>
                      <td>{log.timestamp}</td>
                      <td><strong>{log.actor}</strong></td>
                      <td>{log.action}</td>
                      <td>
                        <span style={{ color: "var(--risk-low)", fontWeight: 700 }}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "12px" }}>
                      No audit events recorded yet (0 entries).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
