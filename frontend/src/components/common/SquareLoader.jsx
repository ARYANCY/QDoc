import React from "react";

/**
 * SquareLoader Component
 * 3x3 Animated Matrix Clinical Loader
 * 
 * @param {string} label - Optional text to display below the loader
 * @param {string} size - "sm" | "normal" | "lg"
 * @param {string} color - Optional custom square color (defaults to Medical Teal var(--primary, #087F8C))
 * @param {boolean} neutral - If true, uses light gray #ddd matching the original spec
 * @param {object} style - Optional inline styles for the wrapper
 */
export default function SquareLoader({
  label = "",
  size = "normal",
  color = null,
  neutral = false,
  style = {},
}) {
  const sizeClass = size === "sm" ? "sm" : size === "lg" ? "lg" : "";
  const neutralClass = neutral ? "neutral" : "";
  const loaderClasses = `loader ${sizeClass} ${neutralClass}`.trim();

  return (
    <div
      className="square-loader-wrapper"
      role="status"
      aria-label={label || "Loading..."}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        gap: "14px",
        ...style,
      }}
    >
      <div
        className={loaderClasses}
        style={color ? { "--square-color": color } : {}}
      >
        <div className="square" id="sq1"></div>
        <div className="square" id="sq2"></div>
        <div className="square" id="sq3"></div>
        <div className="square" id="sq4"></div>
        <div className="square" id="sq5"></div>
        <div className="square" id="sq6"></div>
        <div className="square" id="sq7"></div>
        <div className="square" id="sq8"></div>
        <div className="square" id="sq9"></div>
      </div>
      {label && (
        <span
          style={{
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            fontWeight: 600,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.02em",
            textAlign: "center",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
