import { useEffect, useRef } from "react";
import { animateEntrance } from "../../../utils/motion";

export default function SkinCancerUploader({ onFile, model, setModel }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      animateEntrance(containerRef.current, { y: 12, duration: 0.35 });
    }
  }, []);

  return (
    <div ref={containerRef} className="card-panel" style={{ borderLeft: "3px solid var(--gold)", display: "flex", flexDirection: "column", gap: "12px" }}>
      <span className="step-badge gold">DERMATOSCOPY // LESION TRIAGE</span>
      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>
        Upload Dermatoscopic Lesion Image
      </h3>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => onFile(e.target.files?.[0])}
        style={{ padding: "10px", border: "1px dashed var(--border-default)", background: "var(--bg-surface-alt)" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
          Target Architecture:
        </span>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{ width: "auto", padding: "6px 12px", fontFamily: "var(--font-mono)", fontSize: "0.76rem" }}
        >
          <option>QuantumDerma (10-Qubit VQC)</option>
          <option>DermisNova (Classical Ensemble)</option>
          <option>production (Hybrid SOTA)</option>
        </select>
      </div>
    </div>
  );
}
