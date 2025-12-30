"use client"; // Required for useState

import { useState } from "react";

export default function RecentLiquidationsTable({ rows }) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(rows.length / pageSize);

  const displayedRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (delta) => {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // reset to first page
  };

  return (
    <div>
      <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <label style={{ color: "#9ca3af" }}>
          Show:
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            style={{ marginLeft: 6, padding: "2px 6px" }}
          >
            {[10, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div style={{ color: "#9ca3af" }}>
          Page {currentPage} of {totalPages || 1}
        </div>

        <button
          onClick={() => handlePageChange(-1)}
          disabled={currentPage === 1}
          style={{ padding: "2px 6px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
        >
          Prev
        </button>
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === totalPages || totalPages === 0}
          style={{ padding: "2px 6px", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
        >
          Next
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#9ca3af", fontSize: 13 }}>
          <thead>
            <tr>
              {["Time", "Owner", "Trove ID", "Collateral", "Amount", "Price", "Debt", "Tx"].map((h) => (
                <th
                  key={h}
                  style={{
                    borderLeft: "1px solid #1f2937",
                    padding: "8px 10px",
                    textAlign: "left",
                    fontWeight: 500,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((row, i) => (
              <tr key={i}>
                <td style={{ borderLeft: "1px solid #1f2937", padding: 8 }}>{row.time}</td>
                <td
                  style={{ borderLeft: "1px solid #1f2937", padding: 8 }}
                  dangerouslySetInnerHTML={{ __html: row.ownerHtml }}
                />
                <td style={{ borderLeft: "1px solid #1f2937", padding: 8 }}>{row.troveId}</td>
                <td style={{ borderLeft: "1px solid #1f2937", padding: 8 }}>{row.collateralType}</td>
                <td style={{ borderLeft: "1px solid #1f2937", padding: 8 }}>
                  {row.collateralAmount.toFixed(4)}
                </td>
                <td style={{ borderLeft: "1px solid #1f2937", padding: 8 }}>
                  ${row.collateralPrice.toLocaleString()}
                </td>
                <td style={{ borderLeft: "1px solid #1f2937", padding: 8 }}>
                  ${row.debt.toLocaleString()}
                </td>
                <td style={{ borderLeft: "1px solid #1f2937", padding: 8 }}>
                  {row.txHash ? (
                    <a
                      href={`https://etherscan.io/tx/${row.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#4ade80" }}
                    >
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
