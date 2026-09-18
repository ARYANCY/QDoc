import React from "react";

/**
 * DNAHelixAnimation Component
 * 3D rotating double-helix with 24 base pair links.
 * Styled in blood-red tones over a pure white backdrop.
 */
export default function DNAHelixAnimation({ className = "", style = {} }) {
  const TOTAL_LINKS = 42;
  const links = Array.from({ length: TOTAL_LINKS });

  return (
    <div
      className={`dna-viewport-wrap ${className}`}
      style={style}
      aria-hidden="true"
    >
      <div className="dna">
        {links.map((_, index) => (
          <div
            key={index}
            className="link"
            style={{ "--iad": `${-index * 0.625}s` }}
          >
            <div></div>
            <div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
