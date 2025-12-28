import Image from "next/image";
import PoolCard from "../../components/PoolCard";
import TroveScanner from "../../components/TroveScanner";
import Footer from "../../components/Footer";

import { fetchBoldDeposit } from "../../lib/dune/fetchBoldDeposit";
import { fetchLiquidations } from "../../lib/dune/fetchLiquidations";
import { fetchAverageAPY } from "../../lib/dune/fetchAverageAPY";
import { fetchAllTroves } from "../../lib/dune/fetchAllTroves";
import { fetchRedemptionRisk } from "../../lib/dune/fetchRedemptionRisk";

// Normalize ETH → WETH
const normalizeCollateral = (c) => (c === "ETH" ? "WETH" : c);

// Enforced PoolCard order
const POOLCARD_ORDER = ["wstETH", "WETH", "rETH"];

// CR thresholds for risk summary
const CR_RISK_THRESHOLD = {
  WETH: 1.5,
  wstETH: 1.6,
  rETH: 1.6,
};

// Min CR for stress bar
const MIN_CR_STRESS = {
  WETH: 1.1,
  wstETH: 1.2,
  rETH: 1.2,
};

export default async function DashboardPage() {
  const depositsRaw = (await fetchBoldDeposit()) || {};
  const liquidationsRaw = (await fetchLiquidations()) || {};
  const apyRaw = (await fetchAverageAPY()) || {};
  const allTrovesRaw = (await fetchAllTroves()) || [];
  const redemptionRisksRaw = (await fetchRedemptionRisk()) || {};

  const lastUpdated = new Date().toUTCString();

  // Normalize deposits/liquidations/APY
  const deposits = {};
  const liquidations = {};
  const apyValues = {};
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

  // Normalize troves
  const allTroves = allTrovesRaw.map((t) => ({
    ...t,
    collateralType: normalizeCollateral(t.collateral_type),
    collateral_ratio: t.collateral_ratio,
    collateral: t.collateral,
  }));

  // Compute total collateral for profitability
  const totalCollateralSum = {};
  POOLCARD_ORDER.forEach((c) => {
    totalCollateralSum[c] = allTroves
      .filter((t) => t.collateralType === c)
      .reduce((sum, t) => sum + t.collateral, 0);
  });
  const maxCollateral = Math.max(...Object.values(totalCollateralSum), 1);

  // Build dashboard rows
  const data = POOLCARD_ORDER.map((c) => {
    const troves = allTroves.filter((t) => t.collateralType === c);
    const minCRStress = MIN_CR_STRESS[c] || 1.1;
    const crRiskThreshold = CR_RISK_THRESHOLD[c] || 1.4;

    // Stress bar now considers all troves for dynamic price drop simulation
    const lowCRTroves = troves; // all troves considered

    // Risk summary based on threshold
    const crRiskTroves = troves.filter((t) => t.collateral_ratio <= crRiskThreshold);

    return {
      name: c,
      deposit: deposits[c] || 0,
      liquidationUSD: liquidations[c] || 0,
      apy: apyValues[c] || 0,
      lowCRTroves,
      crRisk: crRiskTroves.length
        ? (crRiskTroves.length / troves.length) * 100
        : 0,
      totalCollateral: totalCollateralSum[c] || 0,
      redemptionRisk: redemptionRisksRaw[c] || "Minimal",
      profitability: totalCollateralSum[c] / maxCollateral / 2,
      crRiskThreshold, // risk summary display
      minCRStress,     // stress bar minCR
    };
  });

  const topCollateral = data.reduce(
    (best, cur) => (cur.totalCollateral > best.totalCollateral ? cur : best),
    data[0]
  ).name;

  return (
    <>
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

      <main style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ color: "#6b7280", fontSize: 12 }}>Last updated: {lastUpdated}</p>

        <p style={{ color: "#9ca3af", marginTop: 14 }}>
          🔥 <strong>Recommended Stability Pool:</strong>{" "}
          <span style={{ color: "#4ade80" }}>{topCollateral}</span>
        </p>

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
                crRiskThreshold={item.crRiskThreshold}
                redemptionRisk={item.redemptionRisk}
                collateralAmount={item.totalCollateral}
                profitability={item.profitability}
                isTop={item.name === topCollateral}
                lowCRTroves={item.lowCRTroves}
                totalCollateral={item.totalCollateral}
                minCRRequirement={item.minCRStress}  // for stress bar
              />
            ))}
          </div>
        </section>

        <section style={{ marginTop: 48 }}>
          <h2 style={{ color: "#4ade80" }}>Trove Scanner</h2>
          <TroveScanner allTroves={allTroves} />
        </section>
      </main>

      <Footer />
    </>
  );
}
