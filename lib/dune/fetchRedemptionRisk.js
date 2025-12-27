// lib/dune/fetchRedemptionRisk.js

export async function fetchRedemptionRisk() {
  const res = await fetch(
    "https://api.dune.com/api/v1/query/5156857/results/latest",
    {
      headers: {
        "X-Dune-Api-Key": process.env.DUNE_API_KEY,
      },
      // Cache for 24h (safe – redemption risk changes slowly)
      next: {
        revalidate: 86400,
      },
    }
  );

  if (!res.ok) {
    console.error("Dune redemption fetch error:", await res.text());
    return {};
  }

  const json = await res.json();
  const rows = json?.result?.rows || [];

  const redemptionRisk = {};

  rows.forEach((row) => {
    const collateral =
      row.collateral_type ?? row.collateral ?? row.token;

    const rate = Number(row.last_redemption_rate ?? row.redemption_rate);

    if (!collateral || isNaN(rate)) return;

    if (rate > 5) redemptionRisk[collateral] = "High";
    else if (rate > 2) redemptionRisk[collateral] = "Moderate";
    else redemptionRisk[collateral] = "Minimal";
  });

  return redemptionRisk;
}
