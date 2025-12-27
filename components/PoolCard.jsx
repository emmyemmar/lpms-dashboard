// components/PoolCard.jsx
import Image from "next/image";
import { useState, useMemo } from "react";
import InfoTooltip from "./InfoTooltip";

export default function PoolCard({
  name,
  deposit,
  liquidation,
  profitability, // now expected to already be CR + redemption weighted
  apy,
  isTop,
  troves = [], // pass troves for this collateral later
}) {
  /* =========================
     Stress test slider state
  ========================== */
  const [priceDrop, setPriceDrop] = useState(0);

  /* =========================
     Stress test calculation
     (placeholder logic, safe)
  ========================== */
  const stressLiquidationUSD = useMemo(() => {
    if (!troves.length) return 0;

    return troves.reduce((sum, t) => {
      const newCR = t.cr * (1 - priceDrop / 100);
      if (newCR < 1.1) {
        return sum + (t.collateral_usd || 0);
      }
      return sum;
    }, 0);
  }, [priceDrop, troves]);

  /* =========================
     Slider color logic
  ========================== */
  const sliderColor =
    priceDrop < 10 ? "#22c55e" : priceDrop < 25 ? "#facc15" : "#ef4444";

  return (
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
      {/* ================= TOKEN HEADER ================= */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
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

      {/* ================= CORE METRICS ================= */}
      <p>
        <strong>BOLD Deposited:</strong>
        <br />
        {deposit.toLocaleString()} BOLD
      </p>

      <p>
        <strong>Liquidated Collateral (USD):</strong>
        <br />${liquidation.toLocaleString()}
      </p>

      {/* ================= PROFITABILITY ================= */}
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

        <small style={{ color: "#9ca3af" }}>
          {profitability.toFixed(2)}%
        </small>
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

      {/* ================= STRESS TEST ================= */}
      <div style={{ marginTop: "18px" }}>
        <strong>Price Drop Stress Test</strong>

        <input
          type="range"
          min="0"
          max="50"
          value={priceDrop}
          onChange={(e) => setPriceDrop(Number(e.target.value))}
          style={{
            width: "100%",
            marginTop: "8px",
            accentColor: sliderColor,
          }}
        />

        <div
          style={{
            fontSize: "12px",
            color: "#9ca3af",
            marginTop: "6px",
          }}
        >
          Price drop: {priceDrop}% <br />
          Est. liquidated collateral: $
          {stressLiquidationUSD.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
