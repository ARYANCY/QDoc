import React from "react";
import { ShieldCheck } from "lucide-react";

export default function EditorialFooter() {
  return (
    <footer
      className="editorial-footer"
      style={{
        borderTop: "1px solid var(--border-default)",
        backgroundColor: "var(--bg-surface)",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        zIndex: 30,
        fontSize: "0.72rem",
        color: "var(--text-muted)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
          Q-MedSense Clinical Platform © 2026
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <ShieldCheck size={14} color="var(--emerald-couture)" />
        <span>Secure &amp; Encrypted Healthcare Session</span>
      </div>
    </footer>
  );
}
