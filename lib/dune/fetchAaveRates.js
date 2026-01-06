import { DuneClient } from "dune_client";

const dune = new DuneClient(process.env.DUNE_API_KEY);

export async function fetchAaveRates() {
  try {
    const queryId = 5723213; // your Aave rates query
    const result = await dune.get_latest_result(queryId);

    // We'll build a map for collaterals WETH, wstETH, rETH
    const rates = {
      WETH: {},
      wstETH: {},
      rETH: {},
    };

    if (!result || !result.data || !result.data.rows) return rates;

    result.data.rows.forEach((row) => {
      const collateral = row.Collateral_Type;
      if (rates[collateral]) {
        rates[collateral] = {
          borrowAPY: Number(row.Average_Borrow_APY_variable_pct) || 0,
          supplyAPY: Number(row.Average_Supply_APY_pct) || 0,
        };
      }
    });

    return rates;
  } catch (err) {
    console.error("Failed to fetch Aave rates from Dune", err);
    return {
      WETH: { borrowAPY: 0, supplyAPY: 0 },
      wstETH: { borrowAPY: 0, supplyAPY: 0 },
      rETH: { borrowAPY: 0, supplyAPY: 0 },
    };
  }
}
