// app/dashboard/page.jsx

import Image from "next/image";
import PoolCard from "../../components/PoolCard";
import TroveScanner from "../../components/TroveScanner";
import Footer from "../../components/Footer"; // Footer component

import { fetchBoldDeposit } from "../../lib/dune/fetchBoldDeposit";
import { fetchLiquidations } from "../../lib/dune/fetchLiquidations";
import { fetchAverageAPY } from "../../lib/dune/fetchAverageAPY";
import { fetchAllTroves } from "../../lib/dune/fetchAllTroves";

export default async function DashboardPage() {
  // ===== Stability Pool data =====
  const deposits = await fetchBoldDeposit();
  const liquidations = await fetchLiquidations();
  const apyValues = await fetchAverageAPY();

  // ===== Trove data (cached 24h) =====
  const allTroves = await fetchAllTroves();

  const collaterals = Array.from(
    new Set([
      ...Object.keys(deposits),
      ...Object.keys(liquidations),
      ...Object.keys(apyValues),
    ])
  );

  const data = collaterals.map((c) => {
    const deposit = deposits[c] || 0;
    const liquidationUSD = liquidations[c] || 0;
    const apy = apyValues[c] || 0;

    const profitability =
      deposit > 0 ? (liquidationUSD / deposit) * 100 : 0;

    return { name: c, deposit, liquidationUSD, profitability, apy };
  });

  const topCollateral = data.reduce(
    (best, cur) =>
      cur.profitability > best.profitability ? cur : best,
    { profitability: -Infinity }
  ).name;

  return (
    <>
      {/* ================= HEADER ================= */}
      <header
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "#0b1220",
          zIndex: 1000,
          padding: "12px 24px",           // smaller padding
          borderBottom: "1px solid #1f2937",
          display: "flex",
          alignItems: "center",
        }}
      >
        <a href="/dashboard" style={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/Logo.png"       // capital L
            alt="Liquity BOLD"
            width={26}            // smaller width
            height={26}           // proportional height
            priority
          />
        </a>

        <h1 style={{ color: "#ffffff", marginLeft: "12px", fontSize: "18px" }}>
          LPMS Dashboard
        </h1>
      </header>

      {/* ================= MAIN ================= */}
      <main style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
        <p style={{ color: "#9ca3af", marginTop: "6px" }}>
           🔥<strong>Recommended Stability Pool:</strong>{" "}
          <span style={{ color: "#4ade80" }}>{topCollateral}</span>
        </p>

        {/* ===== Stability Pools ===== */}
        <section style={{ marginTop: "28px" }}>
          <h2 style={{ color: "#4ade80" }}>Stability Pools</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {data.map((item) => (
              <PoolCard
                key={item.name}
                name={item.name}
                deposit={item.deposit}
                liquidation={item.liquidationUSD}
                profitability={item.profitability}
                apy={item.apy}
                isTop={item.name === topCollateral}
              />
            ))}
          </div>
        </section>

        {/* ===== Trove Scanner ===== */}
        <section style={{ marginTop: "48px" }}>
          <h2 style={{ color: "#4ade80" }}>Trove Scanner</h2>
          <TroveScanner allTroves={allTroves} />
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <Footer />  {/* Footer component with clickable links */}
    </>
  );
}
