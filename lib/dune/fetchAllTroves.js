// lib/dune/fetchAllTroves.js

const DUNE_API_KEY = process.env.DUNE_API_KEY;

export async function fetchAllTroves() {
  const url =
    "https://api.dune.com/api/v1/query/6298827/results?limit=5000";

  const res = await fetch(url, {
    headers: {
      "X-Dune-Api-Key": DUNE_API_KEY,
    },
    // Cache on Vercel for 24 hours
    next: {
      revalidate: 86400,
    },
  });

  if (!res.ok) {
    console.error("Dune trove fetch error:", await res.text());
    return [];
  }

  const json = await res.json();
  const rows = json?.result?.rows || [];

  // 🔹 NORMALIZE DATA FOR FRONTEND
  return rows.map((row) => ({
    collateralType: row.collateral_type ?? row.collateral,
    cr: Number(row.collateral_ratio ?? row.cr),
    requiredCR: Number(row.required_cr ?? row.min_cr ?? 1.1),
    collateralAmount: Number(row.collateral_amount ?? row.collateral),
  }));
}
