// lib/dune/fetchAllTroves.js

const DUNE_API_KEY = process.env.DUNE_API_KEY;

// simple in-memory cache (server-side)
let CACHE = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchAllTroves() {
  const now = Date.now();

  // return cached data if still valid
  if (CACHE.data && now - CACHE.timestamp < CACHE_TTL) {
    return CACHE.data;
  }

  const url =
    "https://api.dune.com/api/v1/query/6298827/results?limit=5000";

  const res = await fetch(url, {
    headers: {
      "X-Dune-Api-Key": DUNE_API_KEY,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Dune trove fetch error:", await res.text());
    return [];
  }

  const json = await res.json();

  const rows = json?.result?.rows || [];

  // update cache
  CACHE = {
    data: rows,
    timestamp: now,
  };

  return rows;
}
