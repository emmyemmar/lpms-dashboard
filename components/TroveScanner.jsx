"use client";

import { useState } from "react";

/* ---------- Utilities ---------- */

function getPercentileRank(value, allValues) {
  if (!allValues || !allValues.length) return 0;
  const sorted = [...allValues].sort((a, b) => b - a);
  const rank = sorted.findIndex((v) => value >= v);
  return rank === -1
    ? 100
    : Math.round(((rank + 1) / sorted.length) * 100);
}

function recommendation(value, allValues, verb = "Increase") {
  if (!allValues || !allValues.length) return null;
  const sorted = [...allValues].sort((a, b) => b - a);
  const target = sorted[Math.floor(sorted.length * 0.1)] || sorted[0];
  if (value >= target) return null;
  return `${verb} ${(target - value).toFixed(2)} to join top 10%`;
}

function RankCircle({ percent }) {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        border: "3px solid #4ade80",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
        marginRight: 12,
        flexShrink: 0,
      }}
    >
      Top {percent}%
    </div>
  );
}

/* ---------- Component ---------- */

export default function TroveScanner({
  allTroves = [],
  lenderDeposits = [],
  comparisonAPY = {}, // Aave rates from Dune
}) {
  const [address, setAddress] = useState("");
  const [borrowerResults, setBorrowerResults] = useState([]);
  const [lenderResults, setLenderResults] = useState([]);

  function scan() {
    if (!address) {
      setBorrowerResults([]);
      setLenderResults([]);
      return;
    }

    const input = address.toLowerCase().trim();

    setBorrowerResults(
      allTroves.filter((t) => t.owner_full?.toLowerCase() === input)
    );

    setLenderResults(
      lenderDeposits.filter((d) => d.owner?.toLowerCase() === input)
    );
  }

  /* ---------- Stats ---------- */

  const collateralTypes = ["wstETH", "WETH", "rETH"];
  const borrowerStats = {};
  const lenderStats = {};

  collateralTypes.forEach((c) => {
    borrowerStats[c] = allTroves
      .filter((t) => t.collateralType === c)
      .map((t) => Number(t.collateral_ratio));

    lenderStats[c] = lenderDeposits
      .filter((d) => d.collateralType === c)
      .map((d) => Number(d.depositAmount));
  });

  /* ---------- Comparison helpers (Aave) ---------- */

  function getBorrowComparisons(collateral, userRate) {
    if (!userRate || !comparisonAPY[collateral]) return [];

    const pool = comparisonAPY[collateral]; // { borrowAPY, supplyAPY }
    if (pool.borrowAPY == null) return [];

    return [
      {
        protocol: "Aave", // ✅ protocol name
        borrowAPY: pool.borrowAPY,
        delta: userRate - pool.borrowAPY,
      },
    ];
  }

  function getLendComparisons(collateral, userAPY) {
    if (!comparisonAPY[collateral]) return [];

    const pool = comparisonAPY[collateral]; // { borrowAPY, supplyAPY }
    if (pool.supplyAPY == null) return [];

    return [
      {
        protocol: "Aave", // ✅ protocol name
        supplyAPY: pool.supplyAPY,
        delta: pool.supplyAPY - userAPY,
      },
    ];
  }

  /* ---------- Render ---------- */

  return (
    <div
      style={{
        marginTop: 48,
        padding: 24,
        border: "1px solid #1f2937",
        borderRadius: 12,
      }}
    >
      <h2>🔍 Position Scanner (Borrow & Lend)</h2>

      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter wallet address"
        style={{
          width: "100%",
          padding: 10,
          marginTop: 12,
          borderRadius: 8,
          background: "#020617",
          border: "1px solid #1f2937",
          color: "#fff",
        }}
      />

      <button
        onClick={scan}
        style={{
          marginTop: 12,
          padding: "10px 16px",
          borderRadius: 8,
          background: "#2563eb",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Scan Positions
      </button>

      {/* ---------- Borrowers ---------- */}
      {borrowerResults.length > 0 && (
        <>
          <h3 style={{ marginTop: 28, color: "#4ade80" }}>
            Borrower Troves
          </h3>

          {borrowerResults.map((t, i) => {
            const values = borrowerStats[t.collateralType] || [];
            const percentile = getPercentileRank(
              Number(t.collateral_ratio),
              values
            );
            const rec = recommendation(
              Number(t.collateral_ratio),
              values,
              "Increase CR by"
            );

            const userRate = Number(t.interest_rate || 0);
            const borrowComparisons = getBorrowComparisons(
              t.collateralType,
              userRate
            );

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 10,
                  background: "#020617",
                  border: "1px solid #1f2937",
                }}
              >
                <RankCircle percent={percentile} />

                <div style={{ flex: 1 }}>
                  <strong>{t.collateralType}</strong>
                  <p>Collateral: {Number(t.collateral).toLocaleString()} ETH</p>
                  <p>Debt: {Number(t.bold_debt).toLocaleString()} BOLD</p>
                  <p>CR: {(t.collateral_ratio * 100).toFixed(2)}%</p>
                  <p>Borrow Interest: {userRate}%</p>
                  <p>Trove Age: {t.trove_age}</p>

                  {rec && <p style={{ color: "#3b82f6" }}>{rec}</p>}

                  {borrowComparisons.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {borrowComparisons.map((p, idx) => (
                        <p
                          key={idx}
                          style={{
                            color: p.delta > 0 ? "#f87171" : "#4ade80",
                          }}
                        >
                          {p.delta > 0
                            ? `⚠️ ${p.protocol} is cheaper by ${p.delta.toFixed(2)}%`
                            : `✅ ${p.protocol} is ${Math.abs(p.delta).toFixed(
                                2
                              )}% more expensive`}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ---------- Lenders ---------- */}
      {lenderResults.length > 0 && (
        <>
          <h3 style={{ marginTop: 28, color: "#3b82f6" }}>
            Lender Deposits
          </h3>

          {lenderResults.map((d, i) => {
            const values = lenderStats[d.collateralType] || [];
            const percentile = getPercentileRank(
              Number(d.depositAmount),
              values
            );
            const rec = recommendation(
              Number(d.depositAmount),
              values,
              "Increase deposit by"
            );

            const userAPY = Number(d.apy || 0);
            const lendComparisons = getLendComparisons(
              d.collateralType,
              userAPY
            );

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 10,
                  background: "#020617",
                  border: "1px solid #1f2937",
                }}
              >
                <RankCircle percent={percentile} />

                <div style={{ flex: 1 }}>
                  <strong>{d.collateralType}</strong>
                  <p>Deposit: {Number(d.depositAmount).toLocaleString()} BOLD</p>
                  <p>Unclaimed Rewards: {Number(d.unclaimedBold).toFixed(2)} BOLD</p>
                  <p>Depositor Age: {d.depositorAge}</p>
                  <p>Last Modified: {d.lastModified}</p>

                  {rec && <p style={{ color: "#4ade80" }}>{rec}</p>}

                  {lendComparisons.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {lendComparisons.map((p, idx) => (
                        <p
                          key={idx}
                          style={{
                            color: p.delta > 0 ? "#facc15" : "#9ca3af",
                          }}
                        >
                          {p.delta > 0
                            ? `💡 ${p.protocol} earns +${p.delta.toFixed(2)}% more`
                            : `${p.protocol} earns ${Math.abs(p.delta).toFixed(
                                2
                              )}% less`}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
