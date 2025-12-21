export default function TroveCard({ trove }) {
  return (
    <div className="card">
      <h4 style={{ color: "#60a5fa" }}>
        {trove.collateral_type} Trove
      </h4>

      <p>
        <strong>Owner:</strong><br />
        <span style={{ fontSize: "12px", wordBreak: "break-all" }}>
          {trove.owner}
        </span>
      </p>

      <p>
        <strong>Collateral:</strong><br />
        {Number(trove.collateral).toFixed(4)}
      </p>

      <p>
        <strong>Debt (BOLD):</strong><br />
        {Number(trove.debt).toLocaleString()}
      </p>

      <p>
        <strong>Collateral Ratio:</strong><br />
        {(Number(trove.collateral_ratio) * 100).toFixed(2)}%
      </p>
    </div>
  );
}
