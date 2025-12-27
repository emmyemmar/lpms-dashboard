export function normalizeCollateral(raw) {
  if (!raw) return raw;

  const key = raw.toUpperCase();

  if (key === "ETH" || key === "WETH") {
    return "WETH";
  }

  return key;
}
