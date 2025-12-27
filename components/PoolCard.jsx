"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import InfoTooltip from "./InfoTooltip";

export default function PoolCard({
  name,
  deposit = 0,
  liquidation = 0,
  apy = 0,
  isTop = false,

  // ===== Risk summary =====
  crRisk = 0,                 // % of troves under low CR
  redemptionRisk = "Minimal",
  collateralAmount = 0,       // total low-CR collateral (from dashboard)

  // ===== Profitability =====
  profitabilityRatio = 0,     // 0–1 (relative, NOT percentage)

  // ===== Stress test =====
  allTroves = [],
}) {
  const [priceDrop, setPriceDrop] = useState(0);

  // ================= FILTER TROVES BY COLLATERAL =================
  const collateralTroves = useMemo(
    () => allTroves.filter((t) => t.collateralType === name),
    [allTroves, name]
  );

  // ================= STRESS TEST CALCULATION =================
  const liquidatedCollateral = useMemo(() => {
    return collateralTroves
      .filter((t) => {
        const stressedCR = Number(t.cr) * (1 - priceDrop / 100);
        return stressedCR < Number(t.requiredCR);
      })
      .reduce((sum, t) => sum + Number(t.collateralAmount || 0), 0);
  }, [collateralTroves, priceDrop]);

  const stressRatio =
    collateralAmount > 0
      ? liquidatedCollateral / collateralAmount
      : 0;

  const stressColor =
    stressRatio > 0.5
      ? "#f87171"
      : stressRatio > 0.25
      ? "#facc15"
      : "#4ade80";

  // ================= UI COLORS =================
  const topCardColors = {
    wstETH: "#1C1D4F",
    WETH: "#63D77D",
    rETH: "#F1C91E",
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* ================= RISK SUMMARY ================= */}
      <div
        style={{
          backgroundColor: topCardColors[name] || "#1f2937",
          padding: "12px",
          borderRadius: "12px",
          color: "#fff",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>{name} Risk Summary</strong>
          <span>{redemptionRisk} Redemption Risk</span>
        </div>

        <div style={{ marginTop: "6px" }}>
          <small>
            {crRisk.toFixed(2)}% of troves under low CR · Collateral at risk:{" "}
            {collateralAmount.toLocaleString()}
          </small>
        </div>
      </div>

      {/* ================= POOL CARD ================= */}
      <div
        style={{
          border: isTop ? "2px solid #4ade80" : "1px solid #1f2937",
          boxShadow: isTop ? "0 0 12px rgba(74,222,128,.4)" : "none",
          padding: "16px",
          borderRadius: "12px",
          backgroundColor: "#0b1220",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <Image
            src={`/tokens/${name}.png`}
            alt={name}
            width={24}
            height={24}
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

        {/* ================= PROFITABILITY ================= */}
        <div style={{ marginTop: "14px" }}>
          <strong style={{ display: "flex", gap: "6px" }}>
            Profitability
            <InfoTooltip learnMoreUrl="https://docs.liquity.org" />
          </strong>

          <div
            style={{
              marginTop: "6px",
              background: "#1f2937",
              borderRadius: "10px",
              height: "14px",
            }}
          >
            <div
              style={{
                width: `${profitabilityRatio * 100}%`,
                height: "100%",
                background: isTop ? "#22c55e" : "#4ade80",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* ================= APY ================= */}
        <div style={{ marginTop: "14px" }}>
          <strong>Average APY</strong>
          <div
            style={{
              marginTop: "6px",
              background: "#1f2937",
              borderRadius: "10px",
              height: "14px",
            }}
          >
            <div
              style={{
                width: `${Math.min(apy, 100)}%`,
                height: "100%",
                background: "#3b82f6",
              }}
            />
          </div>
          <small style={{ color: "#9ca3af" }}>{apy}%</small>
        </div>
      </div>

      {/* ================= STRESS TEST ================= */}
      <div
        style={{
          marginTop: "12px",
          padding: "12px",
          backgroundColor: "#1f2937",
          borderRadius: "12px",
        }}
      >
        <label>Price Drop Stress Test (%)</label>

        <input
          type="range"
          min={0}
          max={100}
          value={priceDrop}
          onChange={(e) => setPriceDrop(Number(e.target.value))}
          style={{ width: "100%", accentColor: stressColor }}
        />

        <small style={{ color: stressColor }}>
          {priceDrop}% drop → liquidated collateral:{" "}
          {liquidatedCollateral.toLocaleString()}
        </small>
      </div>
    </div>
  );
}
