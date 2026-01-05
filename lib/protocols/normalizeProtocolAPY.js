export function normalizeProtocolAPY(pools) {
  const protocols = [];

  for (const p of pools) {
    if (p.chain !== "Ethereum") continue;
    if (!["WETH", "ETH"].includes(p.symbol)) continue;

    protocols.push({
      protocol: p.project,
      symbol: p.symbol,
      lendAPY: p.apyBase || 0,
      borrowAPY: p.apyBorrow || null,
    });
  }

  return protocols;
}
