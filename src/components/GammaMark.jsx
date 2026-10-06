import React from "react";

// Simbolo della funzione gamma di Eulero Γ
export default function GammaMark({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 5 L6 5 L6 19" />
    </svg>
  );
}