export async function fetchDefiLlamaAPY() {
  try {
    const res = await fetch("https://api.llama.fi/yields", {
      next: { revalidate: 300 }, // cache 5 mins
    });

    const json = await res.json();
    const pools = json.data || [];

    const TARGET_ASSETS = ["WETH", "wstETH", "rETH"];
    const TARGET_PROTOCOLS = ["Aave", "Compound", "Spark"];

    const result = {
      WETH: [],
      wstETH: [],
      rETH: [],
    };

    pools.forEach((p) => {
      if (
        TARGET_ASSETS.includes(p.symbol) &&
        TARGET_PROTOCOLS.includes(p.project)
      ) {
        result[p.symbol].push({
          protocol: p.project,
          supplyAPY: p.apyBase ?? 0,
          borrowAPY: p.apyBorrow ?? null,
          tvl: p.tvlUsd ?? 0,
        });
      }
    });

    return result;
  } catch (err) {
    console.error("DefiLlama APY fetch failed", err);
    return { WETH: [], wstETH: [], rETH: [] };
  }
}
