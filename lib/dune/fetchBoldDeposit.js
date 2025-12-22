const DUNE_API_KEY = process.env.DUNE_API_KEY;

export async function fetchBoldDeposit() {
  const url =
    "https://api.dune.com/api/v1/query/5156890/results?limit=1000";

  const res = await fetch(url, {
    headers: {
      "X-Dune-Api-Key": DUNE_API_KEY,
    },

    // ✅ Cache this request for 24 hours (86400 seconds)
    next: {
      revalidate: 86400,
    },
  });

  if (!res.ok) {
    console.error("Dune error (fetchBoldDeposit):", await res.text());
    return {};
  }

  const json = await res.json();

  if (!json?.result?.rows) return {};

  const totals = {};

  for (const row of json.result.rows) {
    let type = row.collateral_type;
    const amount = Number(row.deposited_bold || 0);

    // Combine ETH into WETH
    if (type === "ETH") type = "WETH";

    totals[type] = (totals[type] || 0) + amount;
  }

  return totals;
}
