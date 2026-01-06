const DUNE_API_KEY = process.env.DUNE_API_KEY;

export async function fetchAaveRates() {
  const url = "https://api.dune.com/api/v1/query/5723213/results?limit=1";

  try {
    const res = await fetch(url, {
      headers: { "X-Dune-Api-Key": DUNE_API_KEY },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Dune error:", await res.text());
      return {
        borrowAPY: 0,
        supplyAPY: 0,
      };
    }

    const json = await res.json();
    if (!json?.result?.rows?.length) {
      return {
        borrowAPY: 0,
        supplyAPY: 0,
      };
    }

    const row = json.result.rows[0];

    return {
      protocol: "Aave",
      borrowAPY: Number(row.Average_Borrow_APY_variable_pct || 0),
      supplyAPY: Number(row.Average_Supply_APY_pct || 0),
    };
  } catch (err) {
    console.error("Error fetching Aave rates:", err);
    return {
      borrowAPY: 0,
      supplyAPY: 0,
    };
  }
}
