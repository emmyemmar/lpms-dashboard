const DUNE_API_KEY = process.env.DUNE_API_KEY;

export async function fetchAaveRates() {
  const url = "https://api.dune.com/api/v1/query/5723213/results?limit=1000";

  const res = await fetch(url, {
    headers: { "X-Dune-Api-Key": DUNE_API_KEY },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Dune error:", await res.text());
    return {
      WETH: { borrowAPY: 0, supplyAPY: 0 },
      wstETH: { borrowAPY: 0, supplyAPY: 0 },
      rETH: { borrowAPY: 0, supplyAPY: 0 },
    };
  }

  const json = await res.json();
  if (!json?.result?.rows) {
    return {
      WETH: { borrowAPY: 0, supplyAPY: 0 },
      wstETH: { borrowAPY: 0, supplyAPY: 0 },
      rETH: { borrowAPY: 0, supplyAPY: 0 },
    };
  }

  const rates = {
    WETH: { borrowAPY: 0, supplyAPY: 0 },
    wstETH: { borrowAPY: 0, supplyAPY: 0 },
    rETH: { borrowAPY: 0, supplyAPY: 0 },
  };

  for (const row of json.result.rows) {
    const collateral = row.Collateral_Type;
    if (rates[collateral]) {
      rates[collateral] = {
        borrowAPY: Number(row.Average_Borrow_APY_variable_pct || 0),
        supplyAPY: Number(row.Average_Supply_APY_pct || 0),
      };
    }
  }

  return rates;
}
