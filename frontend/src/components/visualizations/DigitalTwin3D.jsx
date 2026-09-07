import { useEffect, useRef, useState } from "react";
import { Activity, Sparkles, Shield, RefreshCw } from "lucide-react";
import { clinicalApi } from "../../api/clinical";
import { animateEntrance } from "../../utils/motion";
import { DigitalTwinViewer, useTwinStore, DISEASE_TO_ORGAN } from "../../features/digitalTwin3D";

export default function DigitalTwin3D({ patientId = "PT-89421", analysisResult = null }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [patientRecord, setPatientRecord] = useState(null);
  const [loadingRecord, setLoadingRecord] = useState(false);

  const setPatientAnalysis = useTwinStore((state) => state.setPatientAnalysis);
  const patientAnalysis = useTwinStore((state) => state.patientAnalysis);
  const setSelectedAnatomy = useTwinStore((state) => state.setSelectedAnatomy);
  const updateInvolvement = useTwinStore((state) => state.updateInvolvement);

  // Synchronize incoming analysisResult prop to twinStore
  useEffect(() => {
    if (analysisResult) {
      setPatientAnalysis(analysisResult, patientId);
    }
  }, [analysisResult, patientId, setPatientAnalysis]);

  // Load patient baseline record if no active analysis has been run yet
  useEffect(() => {
    if (!analysisResult && !patientAnalysis) {
      let isMounted = true;
      setLoadingRecord(true);
      clinicalApi.getPatientRecord(patientId)
        .then((res) => {
          if (!isMounted || !res?.patient) return;
          const p = res.patient;
          setPatientRecord(p);

          // Infer primary target organ from patient diagnosed conditions
          const conditions = (p.conditions || []).join(" ").toLowerCase();
          let target = "HEART";
          let diseaseName = "Cardiovascular Telemetry";
          let riskClass = "Normal Baseline";
          let topFeat = [];

          if (conditions.includes("breast") || conditions.includes("cancer") || conditions.includes("oncology")) {
            target = "BREAST_LEFT";
            diseaseName = "Breast Oncology";
            riskClass = "Monitored Mammography";
            topFeat = [{ feature: "Tissue Symmetry", value: 1.0 }, { feature: "FNA Nuclear Margin", value: "Regular" }];
          } else if (conditions.includes("diabetes") || conditions.includes("glycemia")) {
            target = "PANCREAS";
            diseaseName = "Endocrine / Diabetes";
            riskClass = "Monitored Glucose";
            topFeat = [{ feature: "HbA1c", value: "5.8%" }, { feature: "Fasting Glucose", value: "108 mg/dL" }];
          } else if (conditions.includes("parkinson") || conditions.includes("neuro")) {
            target = "BRAIN";
            diseaseName = "Neurological Monitoring";
            riskClass = "Voice Telemetry Monitored";
            topFeat = [{ feature: "Jitter (local)", value: "0.003" }, { feature: "Shimmer", value: "0.02" }];
          } else {
            // Default heart/cardiovascular
            const bp = p.baseline_vitals?.blood_pressure || "120/80";
            const hr = p.baseline_vitals?.heart_rate_bpm || 72;
            topFeat = [
              { feature: "Blood Pressure", value: bp },
              { feature: "Resting Heart Rate", value: `${hr} BPM` },
            ];
          }

          setPatientAnalysis({
            patient_id: patientId,
            disease: diseaseName,
            prediction: {
              class: `${riskClass} (${p.conditions?.[0] || "Stable Baseline"})`,
              confidence: 0.94,
              severity: "normal",
            },
            explainability: {
              top_features: topFeat,
              clinical_narrative: `Synchronized physiological baseline for Patient ${patientId}. Monitoring active conditions: ${(p.conditions || []).join(", ") || "No acute anomalies"}.`,
            },
            quantum_telemetry: {
              qubits: 8,
              entanglement: "Circular CNOT",
            },
          }, patientId);
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoadingRecord(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [patientId, analysisResult, patientAnalysis, setPatientAnalysis]);

  useEffect(() => {
    if (containerRef.current) {
      animateEntrance(containerRef.current, { y: 10, duration: 0.3 });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="digital-twin-pure-workspace"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "0px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        position: "relative",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
      }}
    >
      {/* Sleek Minimalist Studio Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 14px",
          background: "var(--bg-canvas)",
          borderBottom: "1px solid var(--border-default)",
          fontSize: "0.74rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              display: "inline-block",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: patientAnalysis?.severity === "danger" ? "var(--rose-couture)" : "var(--emerald-couture)",
              boxShadow: patientAnalysis?.severity === "danger" ? "0 0 8px rgba(225, 29, 72, 0.5)" : "0 0 8px rgba(15, 118, 110, 0.4)",
            }}
          />
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink-primary)" }}>
            PATIENT TWIN // {patientId}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.66rem",
              color: "var(--text-muted)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {patientAnalysis ? patientAnalysis.disease : "3D Light Studio Active"}
          </span>
          <span
            className="step-badge"
            style={{
              padding: "2px 6px",
              fontSize: "0.62rem",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              color: "var(--ink-secondary)",
              fontWeight: 700,
            }}
          >
            WebGL 3D
          </span>
        </div>
      </div>

      {/* Pure 3D WebGL Canvas Viewport */}
      <div
        className="twin-3d-pure-viewport"
        style={{
          width: "100%",
          height: "520px",
          position: "relative",
          background: "#F9F8F5",
        }}
      >
        <DigitalTwinViewer canvasRef={canvasRef} />
      </div>
    </div>
  );
}
