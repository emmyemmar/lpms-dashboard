// components/RiskSummaryCard.jsx

export default function RiskSummaryCard({
  collateral,
  crRiskPercent,
  lowCrCollateralUSD,
  redemptionRiskLabel,
  bgColor,
}) {
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
        <strong>Low CR Troves:</strong> {crRiskPercent.toFixed(1)}%
      </p>

      <p style={{ fontSize: "14px" }}>
        <strong>Collateral at Risk:</strong> $
        {lowCrCollateralUSD.toLocaleString()}
      </p>

      <p style={{ fontSize: "14px" }}>
        <strong>Redemption Risk:</strong> {redemptionRiskLabel}
      </p>
    </div>
  );
}
