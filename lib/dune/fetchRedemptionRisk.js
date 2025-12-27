import { DuneClient } from "dune_client";

const dune = new DuneClient(process.env.DUNE_API_KEY);

export async function fetchRedemptionRisk() {
  const queryId = 5156857; // Last redemption interest rate
  const result = await dune.get_latest_result(queryId);

  // Transform result to { collateralType: lastRedemptionRate }
  const riskMap = {};
  result.rows.forEach(row => {
    riskMap[row.collateral] = parseFloat(row.last_redemption_interest_rate);
  });

  return riskMap;
}
