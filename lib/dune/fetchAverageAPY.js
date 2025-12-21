const DUNE_API_KEY = process.env.DUNE_API_KEY;

export async function fetchAverageAPY() {
  const url = "https://api.dune.com/api/v1/query/4412077/results?limit=1000";

  const res = await fetch(url, {
    headers: { "X-Dune-Api-Key": DUNE_API_KEY },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Dune error:", await res.text());
    return {};
  }

  const json = await res.json();
  if (!json?.result?.rows) return {};

  const apyByCollateral = {};

  for (const row of json.result.rows) {
    const type = row.collateral_type;
    const apy = Number(row.apr_two || 0).toFixed(2);

    // Only take the first/top row for each collateral
    if (!(type in apyByCollateral)) {
      apyByCollateral[type] = parseFloat(apy);
    }
  }

  return apyByCollateral;
}
