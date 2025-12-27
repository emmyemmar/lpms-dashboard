<<<<<<< HEAD
// components/PoolCard.jsx
"use client";
=======
"use client";

>>>>>>> 40ffa32 (Add risk summary PoolCard, CR & redemption risk, and stress test slider)
import Image from "next/image";
import { useState } from "react";
import InfoTooltip from "./InfoTooltip";

export default function PoolCard({
  name,
  deposit,
  liquidation,
  profitability,
  apy,
  isTop,
  crRisk = 0,               // optional: percentage of low CR troves
  redemptionRisk = "Minimal", // optional: "High", "Moderate", "Minimal"
}) {
  // Slider state for stress test
  const [priceDrop, setPriceDrop] = useState(0);

  // Calculate collateral liquidation for stress test
  const stressLiquidation = (liquidation * priceDrop) / 100;

  // Determine slider color based on risk
  let sliderColor = "#4ade80"; // green low risk
  if (priceDrop >= 20) sliderColor = "#facc15"; // yellow
  if (priceDrop >= 40) sliderColor = "#f87171"; // red

  return (
    <div
      className="card"
      style={{
        border: isTop ? "2px solid #4ade80" : "1px solid #1f2937",
        boxShadow: isTop ? "0 0 12px rgba(74, 222, 128, 0.4)" : "none",
        padding: "16px",
        borderRadius: "12px",
        backgroundColor: "#0b1220",
        marginBottom: "16px",
      }}
    >
      {/* === Token Logo + Name + CR & Redemption Risk === */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Image
            src={`/tokens/${name}.png`}
            alt={name}
            width={24}
            height={24}
            priority
          />
          <h3 style={{ color: "#4ade80", margin: 0 }}>
            {name} {isTop && "🔥"}
          </h3>
        </div>

        <div style={{ fontSize: "12px", color: "#facc15" }}>
          CR Risk: {crRisk.toFixed(0)}% | Redemption Risk: {redemptionRisk}
        </div>
      </div>

      {/* BOLD Deposited */}
      <p>
        <strong>BOLD Deposited:</strong>
        <br />
        {deposit.toLocaleString()} BOLD
      </p>

      {/* Liquidated Collateral */}
      <p>
        <strong>Liquidated Collateral (USD):</strong>
        <br />${liquidation.toLocaleString()}
      </p>

      {/* Profitability Section */}
      <div style={{ marginTop: "14px" }}>
        <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          Profitability
          <InfoTooltip learnMoreUrl="https://docs.liquity.org" />
        </strong>

        <div
          style={{
            marginTop: "6px",
            background: "#1f2937",
            borderRadius: "10px",
            height: "14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.min(profitability, 100)}%`,
              height: "100%",
              background: isTop ? "#22c55e" : "#4ade80",
              transition: "width 0.4s ease",
            }}
          />
        </div>

        <small style={{ color: "#9ca3af" }}>{profitability.toFixed(2)}%</small>
      </div>

      {/* Average APY Section */}
      <div style={{ marginTop: "14px" }}>
        <strong>Average APY</strong>
        <div
          style={{
            marginTop: "6px",
            background: "#1f2937",
            borderRadius: "10px",
            height: "14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.min(apy, 100)}%`,
              height: "100%",
              background: "#3b82f6",
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <small style={{ color: "#9ca3af" }}>{apy}%</small>
      </div>

      {/* Stress Test Slider */}
      <div style={{ marginTop: "14px" }}>
        <label style={{ fontSize: "12px" }}>Price Drop Stress Test: {priceDrop}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={priceDrop}
          onChange={(e) => setPriceDrop(Number(e.target.value))}
          style={{
            width: "100%",
            accentColor: sliderColor,
            marginTop: "4px",
          }}
        />
        <small style={{ color: "#9ca3af" }}>
          Collateral at risk: ${stressLiquidation.toLocaleString()}
        </small>
      </div>
    </div>
  );
}
