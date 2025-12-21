"use client";

import { useState } from "react";

export default function TroveScanner({ allTroves }) {
  const [address, setAddress] = useState("");
  const [results, setResults] = useState([]);

  function scan() {
    if (!address || !allTroves?.length) {
      setResults([]);
      return;
    }

    const normalizedInput = address.toLowerCase().trim();

    const matches = allTroves.filter((trove) => {
      if (!trove.owner_full) return false;
      return trove.owner_full.toLowerCase() === normalizedInput;
    });

    setResults(matches);
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
      <h2>🔍 Trove Scanner</h2>

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
          <strong>{t.collateral_type}</strong>
          <p>Collateral: {Number(t.collateral_eth).toLocaleString()} ETH</p>
          <p>Debt: {Number(t.bold_debt).toLocaleString()} BOLD</p>
          <p>CR: {(Number(t.collateral_ratio) * 100).toFixed(2)}%</p>
          <p>Interest Rate: {t.interest_rate}%</p>
          <p>Trove Age: {t.trove_age} days</p>
        </div>
      ))}
    </div>
  );
}
