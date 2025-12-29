"use client";

export default function RecentLiquidationsTable({ liquidations = [] }) {
  return (
    <section style={{ marginTop: 48 }}>
      <h2 style={{ color: "#4ade80", marginBottom: 12 }}>
        Recent Liquidations (Last 30 Days)
      </h2>

      <div
        style={{
          backgroundColor: "#0b1220",
          borderRadius: 12,
          overflowX: "auto",
          border: "1px solid #1f2937",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#9ca3af", fontSize: 13 }}>
              {["Owner", "Trove ID", "Collateral", "Type", "Time"].map(
                (h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      borderRight: i !== 4 ? "1px solid #1f2937" : "none",
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {liquidations.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: 16,
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  No liquidations in the past 30 days
                </td>
              </tr>
            )}

            {liquidations.map((l, i) => (
              <tr key={i} style={{ color: "#d1d5db", fontSize: 13 }}>
                <td
                  style={{
                    padding: "10px 12px",
                    borderRight: "1px solid #1f2937",
                    fontFamily: "monospace",
                  }}
                >
                  {l.owner.slice(0, 6)}…{l.owner.slice(-4)}
                </td>

                <td
                  style={{
                    padding: "10px 12px",
                    borderRight: "1px solid #1f2937",
                  }}
                >
                  {l.trove_id}
                </td>

                <td
                  style={{
                    padding: "10px 12px",
                    borderRight: "1px solid #1f2937",
                  }}
                >
                  {Number(l.collateral).toLocaleString()}
                </td>

                <td
                  style={{
                    padding: "10px 12px",
                    borderRight: "1px solid #1f2937",
                    color: "#9ca3af",
                  }}
                >
                  {l.collateral_type}
                </td>

                <td style={{ padding: "10px 12px", color: "#9ca3af" }}>
                  {new Date(l.block_time).toUTCString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
