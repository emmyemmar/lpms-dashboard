import fetch from "node-fetch";

export async function fetchLenderDeposits() {
  const API_KEY = process.env.DUNE_API_KEY; 
  const QUERY_ID = 5156890; // Bold deposits query
  const LIMIT = 1000;

  const url = `https://api.dune.com/api/v1/query/${QUERY_ID}/results?limit=${LIMIT}`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-Dune-Api-Key": API_KEY,
      },
    });

    if (!res.ok) {
      console.error("Dune fetch error:", res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    // data.result.rows is usually the array of results
    return data.result?.rows || [];
  } catch (err) {
    console.error("Error fetching lender deposits:", err);
    return [];
  }
}
