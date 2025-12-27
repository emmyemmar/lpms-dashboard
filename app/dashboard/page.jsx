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
  const deposits = await fetchBoldDeposit();
  const liquidations = await fetchLiquidations();
  const apyValues = await fetchAverageAPY();
  const allTroves = await fetchAllTroves();

  const lastUpdated = new Date().toUTCString();

  const collaterals = Array.from(
    new Set([...Object.keys(deposits), ...Object.keys(liquidations), ...Object.keys(apyValues)])
  );

  const redemptionRates = await fetchRedemptionRisk();

  const data = collaterals.map((c) => {
    const deposit = deposits[c] || 0;
    const liquidationUSD = liquidations[c] || 0;
    const apy = apyValues[c] || 0;

    const lowCRTroves = allTroves[c]?.filter(t => t.collateralRatio < t.minCR) || [];
    const crRisk = lowCRTroves.length
      ? (lowCRTroves.length / allTroves[c].length) * 100
      : 0;
    const totalCollateral = lowCRTroves.reduce((sum, t) => sum + t.collateralAmount, 0);

    // Redemption risk based on last redemption interest rate
    let redemptionRisk = "Minimal";
    const lastRate = redemptionRates[c] || 0;
    const closeTroves = allTroves[c]?.filter(t => Math.abs(t.interestRate - lastRate) < 0.01) || [];
    const avgRate = closeTroves.reduce((sum, t) => sum + t.interestRate, 0) / (closeTroves.length || 1);
    if (avgRate > 0.15) redemptionRisk = "High";
    else if (avgRate > 0.07) redemptionRisk = "Moderate";

    const minCRRequirement = Math.min(...allTroves[c].map(t => t.minCR));

    return { name: c, deposit, liquidationUSD, apy, lowCRTroves, totalCollateral, crRisk, redemptionRisk, minCRRequirement };
  });

  const topCollateral = data.reduce(
    (best, cur) => (cur.totalCollateral > best.totalCollateral ? cur : best),
    { totalCollateral: -Infinity }
  ).name;

  return (
    <>
      <header style={{ position: "sticky", top: 0, backgroundColor: "#0b1220", zIndex: 1000, padding: "12px 24px", borderBottom: "1px solid #1f2937", display: "flex", alignItems: "center" }}>
        <a href="/dashboard" style={{ display: "flex", alignItems: "center" }}>
          <Image src="/Logo.png" alt="Liquity BOLD" width={26} height={26} priority />
        </a>
        <h1 style={{ color: "#ffffff", marginLeft: "12px", fontSize: "18px" }}>LPMS Dashboard</h1>
      </header>

      <main style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
        <p style={{ color: "#6b7280", fontSize: "12px" }}>Last updated: {lastUpdated}</p>
        <p style={{ color: "#9ca3af", marginTop: "14px" }}>🔥 <strong>Recommended Stability Pool:</strong> <span style={{ color: "#4ade80" }}>{topCollateral}</span></p>

        <section style={{ marginTop: "28px" }}>
          <h2 style={{ color: "#4ade80" }}>Stability Pools</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginTop: "16px" }}>
            {data.map((item) => (
              <PoolCard
                key={item.name}
                name={item.name}
                deposit={item.deposit}
                liquidation={item.liquidationUSD}
                apy={item.apy}
                crRisk={item.crRisk}
                redemptionRisk={item.redemptionRisk}
                lowCRTroves={item.lowCRTroves}
                totalCollateral={item.totalCollateral}
                isTop={item.name === topCollateral}
                minCRRequirement={item.minCRRequirement}
              />
            ))}
          </div>
        </section>

        <section style={{ marginTop: "48px" }}>
          <h2 style={{ color: "#4ade80" }}>Trove Scanner</h2>
          <TroveScanner allTroves={allTroves} />
        </section>
      </main>

      <Footer />
    </>
  );
}
