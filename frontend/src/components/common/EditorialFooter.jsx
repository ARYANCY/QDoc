import { ShieldCheck, Cpu, Activity } from "lucide-react";

export default function EditorialFooter({ onOpenCompliance, onOpenGuide }) {
  return (
    <footer
      className="editorial-footer"
      style={{
        borderTop: "1px solid var(--border-default)",
        backgroundColor: "var(--bg-surface)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        zIndex: 30,
        fontFamily: "var(--font-mono)",
        fontSize: "0.62rem",
        color: "var(--text-muted)",
      }}
    >
      {/* Colophon Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <span style={{ fontWeight: 800, color: "var(--ink-primary)" }}>
          Q-MEDSENSE CLINICAL INTELLIGENCE OS
        </span>
        <span>•</span>
        <span>EDITION 2026 // VOL. IV</span>
        <span>•</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <ShieldCheck size={12} color="var(--emerald-couture)" />
          <span>SaMD CLASS II VERIFIED</span>
        </span>
      </div>

      {/* Telemetry Center */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span>VQC FIDELITY: 0.9982</span>
        <span>•</span>
        <span>LATENCY: 14.8 MS</span>
        <span>•</span>
        <span style={{ color: "var(--text-gold)" }}>★ SOTA 0.947 ROC-AUC</span>
      </div>

      {/* Shortcuts Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          type="button"
          onClick={onOpenGuide}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            color: "var(--text-secondary)",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          Patient Guide
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={onOpenCompliance}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            color: "var(--text-secondary)",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          Audit Ledger
        </button>
      </div>
    </footer>
  );
}
