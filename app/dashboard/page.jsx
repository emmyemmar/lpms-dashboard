import Image from "next/image";
import PoolCard from "../../components/PoolCard";
import TroveScanner from "../../components/TroveScanner";
import Footer from "../../components/Footer";

import { fetchBoldDeposit } from "../../lib/dune/fetchBoldDeposit";
import { fetchLiquidations } from "../../lib/dune/fetchLiquidations";
import { fetchAverageAPY } from "../../lib/dune/fetchAverageAPY";
import { fetchAllTroves } from "../../lib/dune/fetchAllTroves";
import { fetchRedemptionRisk } from "../../lib/dune/fetchRedemptionRisk";

/**
 * Normalize ETH → WETH everywhere
 */
const normalizeCollateral = (c) => (c === "ETH" ? "WETH" : c);

/**
 * Enforced PoolCard order
 */
const POOLCARD_ORDER = ["wstETH", "WETH", "rETH"];

export default async function DashboardPage() {
  // ===== Fetch data =====
  const depositsRaw = (await fetchBoldDeposit()) || {};
  const liquidationsRaw = (await fetchLiquidations()) || {};
  const apyRaw = (await fetchAverageAPY()) || {};
  const allTroves = (await fetchAllTroves()) || [];
  const redemptionRisksRaw = (await fetchRedemptionRisk()) || {};

  const lastUpdated = new Date().toUTCString();

  // ===== Normalize deposits / liquidation / APY =====
  const deposits = {};
  const liquidations = {};
  const apyValues = {};
  const redemptionRisks = {};

  for (const [k, v] of Object.entries(depositsRaw)) {
    const key = normalizeCollateral(k);
    deposits[key] = (deposits[key] || 0) + v;
  }

  for (const [k, v] of Object.entries(liquidationsRaw)) {
    const key = normalizeCollateral(k);
    liquidations[key] = (liquidations[key] || 0) + v;
  }

  for (const [k, v] of Object.entries(apyRaw)) {
    const key = normalizeCollateral(k);
    apyValues[key] = v;
  }

  for (const [k, v] of Object.entries(redemptionRisksRaw)) {
    const key = normalizeCollateral(k);
    redemptionRisks[key] = v;
  }

  // ===== Normalize troves =====
  const normalizedTroves = allTroves.map((t) => ({
    ...t,
    collateralType: normalizeCollateral(t.collateralType),
  }));

  // ===== Low-CR collateral sum (profitability ratio) =====
  const lowCRCollateral = {};
  POOLCARD_ORDER.forEach((c) => {
    lowCRCollateral[c] = normalizedTroves
      .filter((t) => t.collateralType === c && t.cr < t.requiredCR)
      .reduce((sum, t) => sum + (t.collateralAmount || 0), 0);
  });

  const maxLowCR = Math.max(...Object.values(lowCRCollateral), 1);

  // ===== Build dashboard rows =====
  const data = POOLCARD_ORDER.map((c) => {
    const troves = normalizedTroves.filter((t) => t.collateralType === c);
    const lowCRT = troves.filter((t) => t.cr < t.requiredCR);

    return {
      name: c,
      deposit: deposits[c] || 0,
      liquidationUSD: liquidations[c] || 0,
      apy: apyValues[c] || 0,
      crRisk: troves.length ? (lowCRT.length / troves.length) * 100 : 0,
      redemptionRisk: redemptionRisks[c] || "Minimal",
      collateralAmount: lowCRCollateral[c],
      profitability: lowCRCollateral[c] / maxLowCR,
      lowCRTroves: lowCRT,
      allTroves: troves,
    };
  });

  // ===== Top recommended pool =====
  const topCollateral = data.reduce(
    (best, cur) => (cur.profitability > best.profitability ? cur : best),
    data[0]
  ).name;

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
        <a href="/dashboard">
          <Image src="/Logo.png" alt="LPMS" width={26} height={26} />
        </a>
        <h1 style={{ color: "#fff", marginLeft: 12 }}>LPMS Dashboard</h1>
      </header>

      {/* MAIN */}
      <main style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ color: "#6b7280", fontSize: 12 }}>
          Last updated: {lastUpdated}
        </p>

        <p style={{ color: "#9ca3af", marginTop: 14 }}>
          🔥 <strong>Recommended Stability Pool:</strong>{" "}
          <span style={{ color: "#4ade80" }}>{topCollateral}</span>
        </p>

        {/* POOLS */}
        <section style={{ marginTop: 28 }}>
          <h2 style={{ color: "#4ade80" }}>Stability Pools</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              marginTop: 16,
            }}
          >
            {data.map((item) => (
              <PoolCard
                key={item.name}
                name={item.name}
                deposit={item.deposit}
                liquidation={item.liquidationUSD}
                apy={item.apy}
                crRisk={item.crRisk}
                redemptionRisk={item.redemptionRisk}
                collateralAmount={item.collateralAmount}
                profitability={item.profitability}
                isTop={item.name === topCollateral}
                lowCRTroves={item.lowCRTroves}
                totalCollateral={item.collateralAmount}
              />
            ))}
          </div>
        </section>

        {/* TROVE SCANNER */}
        <section style={{ marginTop: 48 }}>
          <h2 style={{ color: "#4ade80" }}>Trove Scanner</h2>
          <TroveScanner allTroves={normalizedTroves} />
        </section>
      </main>

      <Footer />
    </>
  );
}
