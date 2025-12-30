import { DuneClient } from "@duneanalytics/client-sdk";

const dune = new DuneClient(process.env.DUNE_API_KEY);

export async function fetchRecentLiquidations() {
  const result = await dune.getLatestResult(5157060);
  return result?.result?.rows || [];
}
