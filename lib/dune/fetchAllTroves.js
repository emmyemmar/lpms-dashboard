const DUNE_API_KEY = process.env.DUNE_API_KEY;

/**
 * Normalize ETH → WETH
 */
const normalizeCollateral = (c) => (c === "ETH" ? "WETH" : c);

export async function fetchAllTroves() {
  const url = "https://api.dune.com/api/v1/query/6298827/results?limit=5000";

  const res = await fetch(url, {
    headers: {
      "X-Dune-Api-Key": DUNE_API_KEY,
    },
    next: { revalidate: 86400 }, // cache 24h
  });

  if (!res.ok) {
    console.error("Dune trove fetch error:", await res.text());
    return [];
  }

  const json = await res.json();
  const rows = json?.result?.rows || [];

  // Normalize collateral type
  return rows.map((t) => ({
    ...t,
    collateralType: normalizeCollateral(t.collateralType),
    collateralAmount: t.collateralAmount || 0,
    cr: t.cr || 0,
    requiredCR: t.requiredCR || 1.1,
  }));
}
