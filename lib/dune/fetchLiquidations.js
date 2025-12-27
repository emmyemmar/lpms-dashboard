const DUNE_API_KEY = process.env.DUNE_API_KEY;

export async function fetchLiquidations() {
  const url =
    "https://api.dune.com/api/v1/query/5157060/results?limit=1000";

  const res = await fetch(url, {
    headers: {
      "X-Dune-Api-Key": DUNE_API_KEY,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Dune error:", await res.text());
    return {};
  }

  const json = await res.json();
  if (!json?.result?.rows) return {};

  const totalsUSD = {};

  for (const row of json.result.rows) {
    const type = row.collateral_type;

    const collateralAmount = Math.abs(
      Number(row.collateral_change || 0)
    );

    const priceUSD = Number(row.collateral_price || 0);

    // ✅ Convert collateral to USD value
    const liquidationUSD = collateralAmount * priceUSD;

    totalsUSD[type] = (totalsUSD[type] || 0) + liquidationUSD;
  }

  return totalsUSD;
}
