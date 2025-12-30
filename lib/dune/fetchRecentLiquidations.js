export async function fetchRecentLiquidations() {
  const queryId = 5157060;

  const res = await fetch(
    `https://api.dune.com/api/v1/query/${queryId}/results`,
    {
      headers: {
        "X-DUNE-API-KEY": process.env.DUNE_API_KEY,
      },
      // Important for Next.js server caching
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch recent liquidations from Dune");
    return [];
  }

  const json = await res.json();
  return json?.result?.rows || [];
}
