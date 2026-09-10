import React from "react";
import { Shield, Activity, Heart, AlertTriangle, FileText, CheckCircle2, Stethoscope, Sparkles } from "lucide-react";

export default function PatientClinicalDossier({ dossier }) {
  if (!dossier) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.76rem" }}>
        Loading patient clinical dossier...
      </div>
    );
  }

  const vitals = dossier.vitals || {};
  const recentTests = dossier.recent_quantum_diagnoses || [];
  const organStates = dossier.organ_states || [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        height: "100%",
        overflowY: "auto",
        padding: "14px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        boxSizing: "border-box",
      }}
    >
      {/* Context Badge */}
      <div
        style={{
          background: "rgba(212, 175, 55, 0.08)",
          border: "1px solid var(--gold-border)",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Sparkles size={16} color="var(--gold)" />
        <div>
          <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Context Active in Dr. Quantum
          </div>
          <div style={{ fontSize: "0.66rem", color: "var(--text-secondary)" }}>
            These medical records are dynamically primed into Vapi Voice AI for this call.
          </div>
        </div>
      </div>

      {/* Patient Card */}
      <div style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-default)", padding: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>{dossier.name}</h4>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              ID: {dossier.patient_id} • MRN: {dossier.mrn}
            </div>
          </div>
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 800,
              padding: "2px 6px",
              background: "var(--primary-soft)",
              border: "1px solid var(--border-default)",
              color: "var(--primary)",
            }}
          >
            {dossier.blood_group}
          </span>
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "flex", gap: "10px", marginTop: "4px" }}>
          <span>{dossier.age} Yrs ({dossier.gender})</span>
          <span>•</span>
          <span>{dossier.height_cm} cm / {dossier.weight_kg} kg</span>
        </div>
      </div>

      {/* Baseline Vitals */}
      <div>
        <div style={{ fontSize: "0.70rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "6px" }}>
          Baseline Vital Signs
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          <div style={{ background: "var(--bg-surface-alt)", padding: "8px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Blood Pressure</div>
            <div style={{ fontSize: "0.86rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {vitals.blood_pressure || "120/78 mmHg"}
            </div>
          </div>
          <div style={{ background: "var(--bg-surface-alt)", padding: "8px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Heart Rate</div>
            <div style={{ fontSize: "0.86rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {vitals.heart_rate_bpm ? `${vitals.heart_rate_bpm} BPM` : "72 BPM"}
            </div>
          </div>
          <div style={{ background: "var(--bg-surface-alt)", padding: "8px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Blood Oxygen (SpO2)</div>
            <div style={{ fontSize: "0.86rem", fontWeight: 800, color: "var(--risk-low)", fontFamily: "var(--font-mono)" }}>
              {vitals.spo2_percent ? `${vitals.spo2_percent}%` : "98%"}
            </div>
          </div>
          <div style={{ background: "var(--bg-surface-alt)", padding: "8px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Temperature</div>
            <div style={{ fontSize: "0.86rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {vitals.temperature_f ? `${vitals.temperature_f}°F` : "98.6°F"}
            </div>
          </div>
        </div>
      </div>

      {/* 3D Digital Twin Composite Health Status */}
      <div style={{ background: "var(--bg-card-blue)", border: "1px solid var(--border-default)", padding: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>
            3D Digital Twin Composite Risk
          </span>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--accent-teal)" }}>
            {dossier.risk_level || "Optimal"}
          </span>
        </div>
        <div style={{ fontSize: "1.25rem", fontWeight: 900, fontFamily: "var(--font-mono)", color: "var(--primary)" }}>
          {dossier.composite_risk_score} <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>/ 100</span>
        </div>

        {/* Organ Telemetry Mini List */}
        <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {organStates.slice(0, 3).map((org, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.66rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>{org.name}</span>
              <span style={{ fontWeight: 700, color: org.color || "var(--primary)" }}>
                {org.status?.toUpperCase()} ({org.risk_score}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Quantum ML Diagnoses */}
      <div>
        <div style={{ fontSize: "0.70rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "6px" }}>
          Recent Quantum Inferences
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {recentTests.map((t, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--bg-canvas)",
                border: "1px solid var(--border-default)",
                padding: "8px 10px",
                fontSize: "0.72rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginBottom: "2px" }}>
                <span>{t.disease}</span>
                <span style={{ color: "var(--accent-teal)", fontFamily: "var(--font-mono)" }}>
                  {t.confidence_percent}%
                </span>
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>
                Outcome: <strong>{t.prediction}</strong>
              </div>
              <div style={{ fontSize: "0.60rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Model: {t.model}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Medications & Allergies */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ background: "var(--bg-surface-alt)", padding: "8px 10px", border: "1px solid var(--border-default)" }}>
          <div style={{ fontSize: "0.64rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "3px" }}>
            Active Medications
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-primary)" }}>
            {dossier.medications && dossier.medications.length > 0
              ? dossier.medications.join(", ")
              : "None reported"}
          </div>
        </div>

        <div style={{ background: "var(--rose-soft)", border: "1px solid var(--rose-couture)", padding: "8px 10px" }}>
          <div style={{ fontSize: "0.64rem", fontWeight: 800, textTransform: "uppercase", color: "var(--rose-couture)", marginBottom: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
            <AlertTriangle size={12} />
            <span>Documented Allergies</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--rose-couture)", fontWeight: 700 }}>
            {dossier.allergies && dossier.allergies.length > 0
              ? dossier.allergies.join(", ")
              : "No known drug allergies"}
          </div>
        </div>
      </div>
    </div>
  );
}
