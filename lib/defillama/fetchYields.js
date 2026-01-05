export async function fetchDefiLlamaYields() {
  const res = await fetch("https://yields.llama.fi/pools", {
    next: { revalidate: 1800 }, // 30 mins cache
  });

  if (!res.ok) {
    throw new Error("Failed to fetch DefiLlama yields");
  }

  const json = await res.json();
  return json.data || [];
}
