"use client";

import { useState } from "react";

/**
 * Static APY placeholders
 * (later replace with live adapters)
 */
const PROTOCOL_APY = {
  Liquity: {
    borrow: 0.035,
  },
  Aave: {
    borrow: 0.041,
  },
  Compound: {
    borrow: 0.044,
  },
  Spark: {
    borrow: 0.038,
  },
};

export default function TroveScanner({ allTroves }) {
  const [address, setAddress] = useState("");
  const [results, setResults] = useState([]);

  function scan() {
    if (!address || !allTroves?.length) {
      setResults([]);
      return;
    }

    const normalizedInput = address.toLowerCase().trim();

    const userTroves = allTroves.filter((trove) => {
      if (!trove.owner_full) return false;
      return trove.owner_full.toLowerCase() === normalizedInput;
    });

    const enriched = userTroves.map((trove) => {
      const liquityBorrow = PROTOCOL_APY.Liquity.borrow;

      const comparisons = Object.entries(PROTOCOL_APY).map(
        ([protocol, rates]) => ({
          protocol,
          borrow: rates.borrow,
          diff: rates.borrow - liquityBorrow,
        })
      );

      return {
        ...trove,
        comparisons,
      };
    });

    setResults(enriched);
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
      <h2 style={{ color: "#4ade80" }}>🔍 Trove Scanner</h2>

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
        Scan Troves
      </button>

      {address && (
        <p style={{ marginTop: "12px", color: "#9ca3af" }}>
          {results.length === 0
            ? "No troves found for this wallet"
            : `Found ${results.length} trove(s)`}
        </p>
      )}

      {results.map((t, i) => (
        <div
          key={i}
          style={{
            marginTop: "16px",
            padding: "14px",
            borderRadius: "10px",
            background: "#020617",
            border: "1px solid #1f2937",
          }}
        >
          <strong style={{ color: "#e5e7eb" }}>
            {t.collateral_type}
          </strong>

          <p style={{ color: "#9ca3af" }}>
            Collateral:{" "}
            {Number(t.collateral_eth).toLocaleString()} ETH
          </p>

          <p style={{ color: "#9ca3af" }}>
            Debt: {Number(t.bold_debt).toLocaleString()} BOLD
          </p>

          <p style={{ color: "#9ca3af" }}>
            CR: {(Number(t.collateral_ratio) * 100).toFixed(2)}%
          </p>

          <p style={{ color: "#9ca3af" }}>
            Interest Rate: {t.interest_rate}%
          </p>

          <p style={{ color: "#9ca3af" }}>
            Trove Age: {t.trove_age} days
          </p>

          {/* PROTOCOL COMPARISON */}
          <div style={{ marginTop: 14 }}>
            <p
              style={{
                color: "#9ca3af",
                fontSize: 13,
                marginBottom: 6,
              }}
            >
              Borrow Cost Comparison
            </p>

            {t.comparisons.map((c) => (
              <div
                key={c.protocol}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginTop: 4,
                  color:
                    c.protocol === "Liquity"
                      ? "#4ade80"
                      : c.diff < 0
                      ? "#22c55e"
                      : "#f87171",
                }}
              >
                <span>{c.protocol}</span>
                <span>
                  {(c.borrow * 100).toFixed(2)}%
                  {c.protocol !== "Liquity" && (
                    <span style={{ marginLeft: 6 }}>
                      ({c.diff > 0 ? "+" : ""}
                      {(c.diff * 100).toFixed(2)}%)
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
