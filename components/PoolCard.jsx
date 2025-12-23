// components/PoolCard.jsx
import Image from "next/image";
import InfoTooltip from "./InfoTooltip";

export default function PoolCard({
  name,
  deposit,
  liquidation,
  profitability,
  apy,
  isTop,
}) {
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
      {/* Token Logo + Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <Image
          src={`/tokens/${name}.png`} // Logo filename must match collateral name
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

        <small style={{ color: "#9ca3af" }}>
          {profitability.toFixed(2)}%
        </small>
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
              background: "#3b82f6", // Blue
              transition: "width 0.4s ease",
            }}
          />
        </div>

        <small style={{ color: "#9ca3af" }}>{apy}%</small>
      </div>
    </div>
  );
}
