import fetch from "node-fetch";

const normalizeCollateral = (c) => (c === "ETH" ? "WETH" : c);

export async function fetchRedemptionRisk() {
  const res = await fetch(
    "https://api.dune.com/api/v1/query/5156857/results/latest",
    {
      headers: { "X-Dune-Api-Key": process.env.DUNE_API_KEY },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    console.error("Dune redemption risk fetch error:", await res.text());
    return {};
  }

  const json = await res.json();
  const rows = json?.result?.rows || [];

  const redemptionRisk = {};
  rows.forEach((r) => {
    const key = normalizeCollateral(r.collateral);
    const rate = parseFloat(r.last_redemption_rate) || 0;
    if (rate > 5) redemptionRisk[key] = "High";
    else if (rate > 2) redemptionRisk[key] = "Moderate";
    else redemptionRisk[key] = "Minimal";
  });

  return redemptionRisk;
}
