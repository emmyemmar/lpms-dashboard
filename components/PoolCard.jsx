
"use client";

import Image from "next/image";
import { useState } from "react";
import InfoTooltip from "./InfoTooltip";

export default function PoolCard({
  name,
  deposit,
  liquidation,
  apy,
  isTop,
  lowCRTroves = [],        // For stress bar calculation
  crRiskTroves = [],       // For RiskSummary CR <= 1.4
  totalCollateral = 0,     
}) {
  const [priceDrop, setPriceDrop] = useState(0);

  // ===== Stress Test Calculation =====
  const requiredCR = 1.1;
  const liquidatedCollateral = lowCRTroves
    .filter((t) => t.collateral_ratio * (1 - priceDrop / 100) < requiredCR)
    .reduce((sum, t) => sum + t.collateral, 0);

  const stressBarWidth = totalCollateral
    ? (liquidatedCollateral / totalCollateral) * 100
    : 0;

  const stressColor =
    stressBarWidth > 50
      ? "#f87171"
      : stressBarWidth > 25
      ? "#facc15"
      : "#4ade80";

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Risk Summary */}
      <div
        style={{
          backgroundColor: "#1f2937",
          padding: "12px",
          borderRadius: "12px",
          color: "#fff",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>{name} Risk Summary</strong>
          <span>
            Low CR ≤1.4:{" "}
            {crRiskTroves.length > 0
              ? ((crRiskTroves.length / totalCollateral) * 100).toFixed(1)
              : 0}
            %
          </span>
        </div>
        <div style={{ marginTop: "6px" }}>
          <small>
            Collateral at risk: $
            {crRiskTroves
              .reduce((sum, t) => sum + t.collateral, 0)
              .toLocaleString()}
          </small>
        </div>
      </div>

      {/* Pool Card */}
      <div
        style={{
          border: isTop ? "2px solid #4ade80" : "1px solid #1f2937",
          padding: "16px",
          borderRadius: "12px",
          backgroundColor: "#0b1220",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
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

        <p>
          <strong>BOLD Deposited:</strong><br />
          {deposit.toLocaleString()} BOLD
        </p>

        <p>
          <strong>Liquidated Collateral (USD):</strong><br />
          ${liquidation.toLocaleString()}
        </p>

        {/* Stress Bar */}
        <div style={{ marginTop: "12px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>
            Price Drop Stress Test (%)
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={priceDrop}
            onChange={(e) => setPriceDrop(Number(e.target.value))}
            style={{ width: "100%", accentColor: stressColor }}
          />
          <small style={{ color: stressColor }}>
            {priceDrop}% drop → ${liquidatedCollateral.toLocaleString()} collateral liquidated
          </small>
        </div>
      </div>
    </div>
  );
}
