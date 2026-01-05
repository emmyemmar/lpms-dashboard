const DUNE_API_KEY = process.env.DUNE_API_KEY;

// Extract 0x address from <a href="..."> HTML
function extractAddress(html) {
  if (!html) return null;
  const match = html.match(/0x[a-fA-F0-9]{40}/);
  return match ? match[0].toLowerCase() : null;
}

export async function fetchLenderDeposits() {
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
    return [];
  }

  const json = await res.json();
  const rows = json?.result?.rows || [];

  return rows.map((row) => ({
    owner: extractAddress(row.depositor),
    collateral_type: row.collateral_type === "ETH" ? "WETH" : row.collateral_type,
    deposit_amount: Number(row.deposited_bold || 0),
    unclaimed_bold: Number(row.unclaimed_bold || 0),
    depositor_age: row.depositor_age,
    last_modified: row.last_modified,
  }));
}
