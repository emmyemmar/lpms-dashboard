"use client";

import Image from "next/image";
import { useState } from "react";
import InfoTooltip from "./InfoTooltip";

export default function PoolCard({
  name,
  deposit = 0,
  liquidation = 0,
  apy = 0,
  isTop = false,
  crRisk = 0,                  // % of troves under low CR
  crRiskThreshold = 1.4,       // Risk summary CR threshold
  redemptionRisk = "Minimal",
  lowCRTroves = [],            // troves for stress bar
  totalCollateral = 0,         // total collateral sum for stress bar
  crRiskCollateralSum = 0,     // total collateral sum for risk summary
  minCRRequirement = 1.1,      // stress bar CR
  profitability = 0,           // 0-1 ratio
}) {
  const [priceDrop, setPriceDrop] = useState(0);

  // ===== Stress Test Calculation =====
  const liquidatedCollateral = lowCRTroves
    .filter(
      (t) =>
        t.collateral_ratio * (1 - priceDrop / 100) < minCRRequirement
    )
    .reduce((sum, t) => sum + (t.collateral || 0), 0);

  const stressBarWidth = totalCollateral
    ? (liquidatedCollateral / totalCollateral) * 100
    : 0;

  const stressColor =
    stressBarWidth > 50
      ? "#f87171"
      : stressBarWidth > 25
      ? "#facc15"
      : "#4ade80";

  const topCardColors = {
    wstETH: "#1C1D4F",
    WETH: "#63D77D",
    rETH: "#F1C91E",
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {/* ================= Risk Summary ================= */}
      <div
        style={{
          backgroundColor: topCardColors[name] || "#1f2937",
          padding: 12,
          borderRadius: 12,
          color: "#fff",
          marginBottom: 8,
          transition: "transform 0.2s",
        }}
        className="hover:scale-[1.02]"
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>{name} Risk Summary</strong>
          <span>{redemptionRisk} Redemption Risk</span>
        </div>

        <div style={{ marginTop: 6 }}>
          <small>
            {crRisk.toFixed(4)}% of troves under low CR (≤ {crRiskThreshold}),
            collateral sum:{" "}
            {crRiskCollateralSum.toLocaleString()} {name}
          </small>
        </div>
      </div>

      {/* ================= Pool Card ================= */}
      <div
        className="card"
        style={{
          border: isTop ? "2px solid #4ade80" : "1px solid #1f2937",
          boxShadow: isTop
            ? "0 0 12px rgba(74, 222, 128, 0.4)"
            : "none",
          padding: 16,
          borderRadius: 12,
          backgroundColor: "#0b1220",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
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

        {/* Deposited */}
        <p>
          <strong>BOLD Deposited:</strong>
          <br />
          {deposit.toLocaleString()} BOLD
        </p>

        {/* Liquidated */}
        <p>
          <strong>Liquidated Collateral:</strong>
          <br /> $
          {liquidation.toLocaleString()} 
        </p>

        {/* Profitability Bar */}
        <div style={{ marginTop: 14 }}>
          <strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Profitability
            <InfoTooltip learnMoreUrl="https://docs.liquity.org" />
          </strong>

          <div
            style={{
              marginTop: 6,
              background: "#1f2937",
              borderRadius: 10,
              height: 14,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${profitability * 100}%`,
                height: "100%",
                background: isTop ? "#22c55e" : "#4ade80",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Average APY */}
        <div style={{ marginTop: 14 }}>
          <strong>Average APY</strong>
          <div
            style={{
              marginTop: 6,
              background: "#1f2937",
              borderRadius: 10,
              height: 14,
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
      </div>

      {/* ================= Stress Test ================= */}
      <div
        style={{
          marginTop: 12,
          padding: 12,
          backgroundColor: "#1f2937",
          borderRadius: 12,
        }}
      >
        <label style={{ display: "block", marginBottom: 6 }}>
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
          {priceDrop}% price drop → estimated liquidated collateral:{" "}
          {liquidatedCollateral.toLocaleString()} {name}
        </small>
      </div>
    </div>
  );
}
