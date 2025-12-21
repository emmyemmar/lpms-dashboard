export async function fetchBoldDeposit() {
  const apiKey = process.env.DUNE_API_KEY;
  const res = await fetch(
    `https://api.dune.com/api/v1/query/5156890/results?limit=1000&api_key=${apiKey}`
  );
  const json = await res.json();

  const depositsByCollateral = {};
  const rows = json.result?.rows || [];

  // Merge ETH into WETH
  rows.forEach(row => {
    const type = row.collateral_type === "ETH" ? "WETH" : row.collateral_type;
    if (!depositsByCollateral[type]) depositsByCollateral[type] = 0;
    depositsByCollateral[type] += row.deposited_bold;
  });

  return depositsByCollateral;
}
