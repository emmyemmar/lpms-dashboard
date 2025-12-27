const DUNE_API_KEY = process.env.DUNE_API_KEY;

const normalizeCollateral = (c) => (c === "ETH" ? "WETH" : c);

export async function fetchAverageAPY() {
  const url = "https://api.dune.com/api/v1/query/4412077/results?limit=5000";

  const res = await fetch(url, {
    headers: {
      "X-Dune-Api-Key": DUNE_API_KEY,
    },
    next: { revalidate: 3600 }, // cache 1h
  });

  if (!res.ok) {
    console.error("Dune APY fetch error:", await res.text());
    return {};
  }

  const json = await res.json();
  const rows = json?.result?.rows || [];

  const apy = {};
  rows.forEach((r) => {
    const key = normalizeCollateral(r.collateral);
    apy[key] = r.apy || 0;
  });

  return apy;
}
