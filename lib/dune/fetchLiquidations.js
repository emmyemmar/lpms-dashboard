const DUNE_API_KEY = process.env.DUNE_API_KEY;

const normalizeCollateral = (c) => (c === "ETH" ? "WETH" : c);

export async function fetchLiquidations() {
  const url = "https://api.dune.com/api/v1/query/6298842/results?limit=5000";

  const res = await fetch(url, {
    headers: {
      "X-Dune-Api-Key": DUNE_API_KEY,
    },
    next: { revalidate: 3600 }, // cache 1h
  });

  if (!res.ok) {
    console.error("Dune liquidation fetch error:", await res.text());
    return {};
  }

  const json = await res.json();
  const rows = json?.result?.rows || [];

  // Normalize and sum per collateral type
  const liquidations = {};
  rows.forEach((r) => {
    const key = normalizeCollateral(r.collateral);
    liquidations[key] = (liquidations[key] || 0) + (r.liquidatedUSD || 0);
  });

  return liquidations;
}
