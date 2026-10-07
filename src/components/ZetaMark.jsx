import React from "react";

// Simbolo della funzione Zeta di Riemann ζ(s)
export default function ZetaMark({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <text
        x="12"
        y="18"
        textAnchor="middle"
        fontSize="22"
        fontFamily="'Instrument Serif', Georgia, serif"
        fontStyle="italic"
        fontWeight="400"
        fill="currentColor"
      >
        ζ
      </text>
    </svg>
  );
}