// components/PoolCard.jsx
"use client";

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
  crRisk = 0,
  redemptionRisk = "Minimal",
  collateralAmount = 0,
}) {
  const [priceDrop, setPriceDrop] = useState(0);

  const stressColor =
    priceDrop >= 50 ? "#f87171" : priceDrop >= 25 ? "#facc15" : "#4ade80";

  const topCardColors = {
    wstETH: "#1C1D4F",
    WETH: "#63D77D",
    rETH: "#F1C91E",
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Risk Summary Top Card */}
      <div
        style={{
          backgroundColor: topCardColors[name] || "#1f2937",
          padding: "12px",
          borderRadius: "12px",
          color: "#fff",
          marginBottom: "8px",
          transition: "transform 0.2s",
        }}
        className="hover:scale-[1.02]"
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>{name} Risk Summary</strong>
          <span>{redemptionRisk} Redemption Risk</span>
        </div>
        <div style={{ marginTop: "6px" }}>
          <small>
            {crRisk.toFixed(2)}% of troves under low CR, collateral sum:{" "}
            {collateralAmount.toLocaleString()}
          </small>
        </div>
      </div>

      {/* Existing Pool Card */}
      <div
        className="card"
        style={{
          border: isTop ? "2px solid #4ade80" : "1px solid #1f2937",
          boxShadow: isTop ? "0 0 12px rgba(74, 222, 128, 0.4)" : "none",
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
          <strong>BOLD Deposited:</strong>
          <br />
          {deposit.toLocaleString()} BOLD
        </p>

        <p>
          <strong>Liquidated Collateral (USD):</strong>
          <br />${liquidation.toLocaleString()}
        </p>

        <div style={{ marginTop: "14px" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            Profitability
            <InfoTooltip learnMoreUrl="https://docs.liquity.org" />
          </strong>

          <div style={{ marginTop: "6px", background: "#1f2937", borderRadius: "10px", height: "14px", overflow: "hidden" }}>
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

        <div style={{ marginTop: "14px" }}>
          <strong>Average APY</strong>

          <div style={{ marginTop: "6px", background: "#1f2937", borderRadius: "10px", height: "14px", overflow: "hidden" }}>
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

      {/* Stress Test Slider */}
      <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#1f2937", borderRadius: "12px" }}>
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
          {priceDrop}% price drop → estimated liquidated collateral: $
          {(liquidation * (priceDrop / 100)).toLocaleString()}
        </small>
      </div>
    </div>
  );
}
