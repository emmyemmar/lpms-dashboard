// components/RiskSummaryCard.jsx

export default function RiskSummaryCard({
  collateral,
  crRiskPercent = 0,
  lowCrCollateralUSD = 0,
  redemptionRiskLabel = "Unknown",
  bgColor = "#1f2937",
}) {
  const redemptionColor =
    redemptionRiskLabel === "High"
      ? "#f87171"
      : redemptionRiskLabel === "Moderate"
      ? "#facc15"
      : "#4ade80";

  return (
    <div
      style={{
        background: bgColor,
        color: "#fff",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <h3 style={{ fontSize: "16px", fontWeight: 600 }}>
        {collateral} Risk Overview
      </h3>

      <p style={{ marginTop: "8px", fontSize: "14px" }}>
        <strong>Low CR Troves:</strong>{" "}
        {Number(crRiskPercent).toFixed(1)}%
      </p>

      <p style={{ fontSize: "14px" }}>
        <strong>Collateral at Risk:</strong>{" "}
        ${Number(lowCrCollateralUSD).toLocaleString()}
      </p>

      <p style={{ fontSize: "14px" }}>
        <strong>Redemption Risk:</strong>{" "}
        <span style={{ color: redemptionColor, fontWeight: 600 }}>
          {redemptionRiskLabel}
        </span>
      </p>
    </div>
  );
}
