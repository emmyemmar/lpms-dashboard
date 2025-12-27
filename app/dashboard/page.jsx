// app/dashboard/page.jsx

import Image from "next/image";
import PoolCard from "../../components/PoolCard";
import TroveScanner from "../../components/TroveScanner";
import Footer from "../../components/Footer";

import { fetchBoldDeposit } from "../../lib/dune/fetchBoldDeposit";
import { fetchLiquidations } from "../../lib/dune/fetchLiquidations";
import { fetchAverageAPY } from "../../lib/dune/fetchAverageAPY";
import { fetchAllTroves } from "../../lib/dune/fetchAllTroves";
import { fetchRedemptionRisk } from "../../lib/dune/fetchRedemptionRisk";

export default async function DashboardPage() {
  // ================= FETCH DATA =================
  const deposits = (await fetchBoldDeposit()) ?? {};
  const liquidations = (await fetchLiquidations()) ?? {};
  const apyValues = (await fetchAverageAPY()) ?? {};
  const allTroves = (await fetchAllTroves()) ?? [];
  const redemptionRisks = (await fetchRedemptionRisk()) ?? {};

  const lastUpdated = new Date().toUTCString();

  // ================= COLLATERAL TYPES =================
  const collaterals = Array.from(
    new Set(allTroves.map((t) => t.collateralType))
  );

  // ================= LOW CR COLLATERAL SUM =================
  const lowCRCollateralSum = {};
  const lowCRCounts = {};
  const totalCounts = {};

  for (const c of collaterals) {
    const troves = allTroves.filter((t) => t.collateralType === c);
    totalCounts[c] = troves.length;

    const lowCRTroves = troves.filter(
      (t) => Number(t.cr) < Number(t.requiredCR)
    );

    lowCRCounts[c] = lowCRTroves.length;

    lowCRCollateralSum[c] = lowCRTroves.reduce(
      (sum, t) => sum + Number(t.collateralAmount || 0),
      0
    );
  }

  const maxLowCRCollateral = Math.max(
    ...Object.values(lowCRCollateralSum),
    1
  );

  // ================= BUILD DASHBOARD DATA =================
  const data = collaterals.map((c) => {
    const deposit = deposits[c] ?? 0;
    const liquidationUSD = liquidations[c] ?? 0;
    const apy = apyValues[c] ?? 0;

    const crRiskPct =
      totalCounts[c] > 0
        ? (lowCRCounts[c] / totalCounts[c]) * 100
        : 0;

    return {
      name: c,
      deposit,
      liquidationUSD,
      apy,
      crRisk: crRiskPct,
      redemptionRisk: redemptionRisks[c] ?? "Minimal",
      collateralAmount: lowCRCollateralSum[c] ?? 0,

      // Ratio (0–1) for bar fill
      profitabilityRatio:
        (lowCRCollateralSum[c] ?? 0) / maxLowCRCollateral,
    };
  });

  const topCollateral =
    data.reduce(
      (best, cur) =>
        cur.profitabilityRatio > best.profitabilityRatio ? cur : best,
      { profitabilityRatio: -1 }
    )?.name ?? "N/A";

  // ================= RENDER =================
  return (
    <>
      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "#0b1220",
          zIndex: 1000,
          padding: "12px 24px",
          borderBottom: "1px solid #1f2937",
          display: "flex",
          alignItems: "center",
        }}
      >
        <a href="/dashboard" style={{ display: "flex", alignItems: "center" }}>
          <Image src="/Logo.png" alt="Liquity BOLD" width={26} height={26} />
        </a>

        <h1 style={{ color: "#fff", marginLeft: "12px", fontSize: "18px" }}>
          LPMS Dashboard
        </h1>
      </header>

      {/* MAIN */}
      <main style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
        <p style={{ color: "#6b7280", fontSize: "12px" }}>
          Last updated: {lastUpdated}
        </p>

        <p style={{ color: "#9ca3af", marginTop: "14px" }}>
          🔥 <strong>Recommended Stability Pool:</strong>{" "}
          <span style={{ color: "#4ade80" }}>{topCollateral}</span>
        </p>

        {/* POOLS */}
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
                {...item}
                isTop={item.name === topCollateral}
                allTroves={allTroves}
              />
            ))}
          </div>
        </section>

        {/* TROVE SCANNER */}
        <section style={{ marginTop: "48px" }}>
          <h2 style={{ color: "#4ade80" }}>Trove Scanner</h2>
          <TroveScanner allTroves={allTroves} />
        </section>
      </main>

      <Footer />
    </>
  );
}
