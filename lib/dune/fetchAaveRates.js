const DUNE_API_KEY = process.env.DUNE_API_KEY;

export async function fetchAaveRates() {
  const url = "https://api.dune.com/api/v1/query/5723213/results?limit=1000";

  try {
    const res = await fetch(url, {
      headers: { "X-Dune-Api-Key": DUNE_API_KEY },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Dune error:", await res.text());
      return {};
    }

    const json = await res.json();
    if (!json?.result?.rows) return {};

    // Map rows to collateral → { protocol, borrowAPY, supplyAPY_pct }
    const rates = {};

    for (const row of json.result.rows) {
      const collateral = row.Collateral_Type; // e.g., WETH, wstETH, rETH
      if (!rates[collateral]) rates[collateral] = [];

      rates[collateral].push({
        protocol: "Aave",
        borrowAPY: Number(row.Average_Borrow_APY_variable_pct || 0),
        supplyAPY_pct: Number(row.Average_Supply_APY_pct || 0),
      });
    }

    return rates; // { WETH: [{protocol:'Aave', borrowAPY:..., supplyAPY_pct:...}], ... }
  } catch (err) {
    console.error("Error fetching Aave rates:", err);
    return {};
  }
}
