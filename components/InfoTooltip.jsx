"use client";

import { useState } from "react";

export default function InfoTooltip({ learnMoreUrl }) {
  const [open, setOpen] = useState(false);

  return (
    <span style={{ position: "relative", marginLeft: "6px" }}>
      {/* (i) icon */}
      <span
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          backgroundColor: "#1f2937",
          color: "#9ca3af",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        i
      </span>

      {/* Tooltip */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "22px",
            left: "0",
            width: "260px",
            backgroundColor: "#020617",
            border: "1px solid #1f2937",
            borderRadius: "8px",
            padding: "12px",
            color: "#e5e7eb",
            fontSize: "13px",
            zIndex: 999,
          }}
        >
          <p style={{ marginBottom: "8px" }}>
            <strong>Profitability</strong> estimates how effective a Stability
            Pool is by comparing liquidation value captured versus total
            deposits.
          </p>

          <p style={{ marginBottom: "8px" }}>
            <strong>APR</strong> shows reward rate only, while profitability
            reflects real liquidation performance.
          </p>

          <a
            href={learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#4ade80",
              textDecoration: "underline",
              fontWeight: "500",
            }}
          >
            Learn more →
          </a>
        </div>
      )}
    </span>
  );
}
