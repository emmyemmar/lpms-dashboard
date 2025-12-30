"use client";

import { useState } from "react";

export default function RecentLiquidationsTable({ rows }) {
  const [pageSize, setPageSize] = useState(10);

  const visibleRows = rows.slice(0, pageSize);

  return (
    <section style={{ marginTop: 48 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "#9ca3af" }}>Recent Liquidations (30 days)</h2>

        {/* Pagination selector */}
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          style={{
            background: "#0b1220",
            color: "#d1d5db",
            border: "1px solid #1f2937",
            borderRadius: 8,
            padding: "6px 10px",
          }}
        >
          <option value={10}>Last 10</option>
          <option value={50}>Last 50</option>
          <option value={100}>Last 100</option>
        </select>
      </div>

      <div
        style={{
          marginTop: 12,
          border: "1px solid #1f2937",
          borderRadius: 12,
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#9ca3af", fontSize: 13 }}>
              {[
                "Owner",
                "Trove ID",
                "Collateral",
                "Price",
                "Debt",
                "Tx",
                "Time",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    borderRight: "1px solid #1f2937",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 16, color: "#6b7280", textAlign: "center" }}>
                  No liquidations in the last 30 days
                </td>
              </tr>
            )}

            {visibleRows.map((l, i) => (
              <tr
                key={i}
                style={{
                  color: "#d1d5db",
                  fontSize: 13,
                  borderTop: "1px solid #1f2937",
                }}
              >
                {/* Owner (already HTML from Dune) */}
                <td
                  style={{ padding: 10, borderRight: "1px solid #1f2937" }}
                  dangerouslySetInnerHTML={{ __html: l.ownerHtml }}
                />

                <td style={{ padding: 10, borderRight: "1px solid #1f2937" }}>
                  {l.troveId}
                </td>

                <td style={{ padding: 10, borderRight: "1px solid #1f2937" }}>
                  {l.collateralAmount.toFixed(4)} {l.collateralType}
                </td>

                <td style={{ padding: 10, borderRight: "1px solid #1f2937" }}>
                  ${l.collateralPrice.toLocaleString()}
                </td>

                <td style={{ padding: 10, borderRight: "1px solid #1f2937" }}>
                  {l.debt.toLocaleString()} BOLD
                </td>

                {/* Tx hash → Etherscan */}
                <td style={{ padding: 10, borderRight: "1px solid #1f2937" }}>
                  <a
                    href={`https://etherscan.io/tx/${l.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#60a5fa" }}
                  >
                    View
                  </a>
                </td>

                <td style={{ padding: 10 }}>
                  {new Date(l.time).toUTCString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
