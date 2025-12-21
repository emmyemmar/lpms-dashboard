export async function fetchLiquidation() {
  const apiKey = process.env.DUNE_API_KEY;
  const res = await fetch(
    `https://api.dune.com/api/v1/query/5157060/results?limit=1000&api_key=${apiKey}`
  );
  const json = await res.json();

  const liquidationByCollateral = {};
  const rows = json.result?.rows || [];

  // Merge ETH into WETH
  rows.forEach(row => {
    const type = row.collateral_type === "ETH" ? "WETH" : row.collateral_type;
    if (!liquidationByCollateral[type]) liquidationByCollateral[type] = 0;
    liquidationByCollateral[type] += Math.abs(row.collateral_change);
  });

  return liquidationByCollateral;
}
