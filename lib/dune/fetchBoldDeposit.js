const DUNE_API_KEY = process.env.DUNE_API_KEY;

// Extract 0x address from <a href="..."> HTML
function extractAddress(html) {
  if (!html) return null;
  const match = html.match(/0x[a-fA-F0-9]{40}/);
  return match ? match[0].toLowerCase() : null;
}

export async function fetchBoldDeposit() {
  const url =
    "https://api.dune.com/api/v1/query/5156890/results?limit=1000";

  const res = await fetch(url, {
    headers: {
      "X-Dune-Api-Key": DUNE_API_KEY,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Dune error:", await res.text());
    return {
      totals: {},
      rows: [],
    };
  }

  const json = await res.json();
  const rows = json?.result?.rows || [];

  const totals = {};
  const parsedRows = [];

  for (const row of rows) {
    let type = row.collateral_type;

    // Normalize ETH → WETH
    if (type === "ETH") type = "WETH";

    const deposited = Number(row.deposited_bold || 0);

    // ===== totals (OLD behavior preserved) =====
    totals[type] = (totals[type] || 0) + deposited;

    // ===== rows (NEW behavior for scanner) =====
    parsedRows.push({
      owner: extractAddress(row.depositor),
      collateral_type: type,
      deposit_amount: deposited,
      unclaimed_bold: Number(row.unclaimed_bold || 0),
      depositor_age: row.depositor_age,          // time
      last_modified: row.last_modified,           // last activity
    });
  }

  return {
    totals, // used by PoolCards
    rows,   // used by TroveScanner
  };
}
