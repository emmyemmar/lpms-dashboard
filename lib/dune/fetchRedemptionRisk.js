// lib/dune/fetchRedemptionRisk.js
import fetch from "node-fetch";

export async function fetchRedemptionRisk() {
  const res = await fetch("https://api.dune.com/api/v1/query/5156857/results/latest", {
    headers: { "X-Dune-Api-Key": process.env.DUNE_API_KEY },
  });

  const json = await res.json();
  const data = json.result?.rows || [];

  const redemptionRisk = {};
  data.forEach((row) => {
    const rate = parseFloat(row.last_redemption_rate);
    if (rate > 5) redemptionRisk[row.collateral] = "High";
    else if (rate > 2) redemptionRisk[row.collateral] = "Moderate";
    else redemptionRisk[row.collateral] = "Minimal";
  });

  return redemptionRisk;
}
