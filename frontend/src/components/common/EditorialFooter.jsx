import React from "react";

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
          Q-RAKSHAK Clinical Platform © 2026
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <a href="mailto:care@Q-Rakshak.health">care@Q-Rakshak.health</a>
        <span>Secure clinical session</span>
      </div>
    </footer>
  );
}
