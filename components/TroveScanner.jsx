"use client";

import { useState } from "react";

// Utility: compute top % ranking
function getPercentileRank(value, allValues) {
  if (!allValues.length) return 0;
  const sorted = [...allValues].sort((a, b) => b - a);
  const rank = sorted.findIndex((v) => value >= v);
  return rank === -1 ? 100 : Math.round(((rank + 1) / sorted.length) * 100);
}

export default function TroveScanner({ allTroves, lenderDeposits }) {
  const [address, setAddress] = useState("");
  const [borrowerResults, setBorrowerResults] = useState([]);
  const [lenderResults, setLenderResults] = useState([]);

  function scan() {
    if (!address) {
      setBorrowerResults([]);
      setLenderResults([]);
      return;
    }

    const normalizedInput = address.toLowerCase().trim();

    // Borrowers
    const matches = allTroves.filter(
      (t) => t.owner_full?.toLowerCase() === normalizedInput
    );
    setBorrowerResults(matches);

    // Lenders
    const lenderMatches = lenderDeposits.filter(
      (d) => d.owner?.toLowerCase() === normalizedInput
    );
    setLenderResults(lenderMatches);
  }

  // Precompute rankings for borrowers and lenders
  const collateralTypes = ["wstETH", "WETH", "rETH"];
  const borrowerStats = {};
  const lenderStats = {};

  collateralTypes.forEach((c) => {
    const borrowerTroves = allTroves
      .filter((t) => t.collateralType === c)
      .map((t) => t.collateral_ratio);
    borrowerStats[c] = borrowerTroves;

    const lenderAmounts = lenderDeposits
      .filter((d) => d.collateral_type === c)
      .map((d) => Number(d.deposit_amount));
    lenderStats[c] = lenderAmounts;
  });

  // Helper to get top 10% recommendation
  function recommendation(value, allValues, type = "add") {
    if (!allValues.length) return null;
    const top10Index = Math.floor(allValues.length * 0.1);
    const sorted = [...allValues].sort((a, b) => b - a);
    const top10Value = sorted[top10Index] || sorted[0];
    if (value >= top10Value) return null;

    return `${type === "add" ? "Add" : "Increase"} ${(top10Value - value).toFixed(
      2
    )} to join top 10%`;
  }

  // Circular rank component
  function RankCircle({ percent }) {
    return (
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          border: "3px solid #4ade80",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 12,
          fontWeight: "bold",
          marginRight: 8,
        }}
      >
        {percent}%
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: "48px",
        padding: "24px",
        border: "1px solid #1f2937",
        borderRadius: "12px",
      }}
    >
      <h2>🔍 Position Scanner (Borrow & Lend)</h2>

      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter wallet address"
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "12px",
          borderRadius: "8px",
          background: "#020617",
          border: "1px solid #1f2937",
          color: "#fff",
        }}
      />

      <button
        onClick={scan}
        style={{
          marginTop: "12px",
          padding: "10px 16px",
          borderRadius: "8px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Scan Positions
      </button>

      {address && (
        <p style={{ marginTop: "12px", color: "#9ca3af" }}>
          {borrowerResults.length + lenderResults.length === 0
            ? "No positions found for this wallet"
            : `Found ${borrowerResults.length} borrower trove(s) & ${lenderResults.length} lender deposit(s)`}
        </p>
      )}

      {/* Borrowers */}
      {borrowerResults.length > 0 && (
        <>
          <h3 style={{ marginTop: 20, color: "#4ade80" }}>Borrower Troves</h3>
          {borrowerResults.map((t, i) => {
            const percentile = getPercentileRank(t.collateral_ratio, borrowerStats[t.collateralType] || []);
            const rec = recommendation(t.collateral_ratio, borrowerStats[t.collateralType] || []);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "16px",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "#020617",
                  border: "1px solid #1f2937",
                }}
              >
                <RankCircle percent={percentile} />
                <div style={{ flex: 1 }}>
                  <strong>{t.collateral_type}</strong>
                  <p>Collateral: {Number(t.collateral_eth).toLocaleString()} ETH</p>
                  <p>Debt: {Number(t.bold_debt).toLocaleString()} BOLD</p>
                  <p>CR: {(Number(t.collateral_ratio) * 100).toFixed(2)}%</p>
                  <p>Interest Rate: {t.interest_rate}%</p>
                  <p>Trove Age: {t.trove_age} days</p>
                  {rec && <p style={{ color: "#3b82f6" }}>{rec}</p>}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Lenders */}
      {lenderResults.length > 0 && (
        <>
          <h3 style={{ marginTop: 20, color: "#3b82f6" }}>Lender Deposits</h3>
          {lenderResults.map((d, i) => {
            const percentile = getPercentileRank(
              Number(d.deposit_amount),
              lenderStats[d.collateral_type] || []
            );
            const rec = recommendation(Number(d.deposit_amount), lenderStats[d.collateral_type] || [], "increase");
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "16px",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "#020617",
                  border: "1px solid #1f2937",
                }}
              >
                <RankCircle percent={percentile} />
                <div style={{ flex: 1 }}>
                  <strong>{d.collateral_type}</strong>
                  <p>Deposit: {Number(d.deposit_amount).toLocaleString()} USD</p>
                  {d.earnings && <p>Rewards Claimed: {Number(d.earnings).toLocaleString()} USD</p>}
                  {rec && <p style={{ color: "#4ade80" }}>{rec}</p>}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
