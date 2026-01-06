import Image from "next/image";
import PoolCard from "../../components/PoolCard";
import TroveScanner from "../../components/TroveScanner";
import Footer from "../../components/Footer";
import RecentLiquidationsTable from "../../components/RecentLiquidationsTable";

import { fetchBoldDeposit } from "../../lib/dune/fetchBoldDeposit";
import { fetchLenderDeposits } from "../../lib/dune/fetchLenderDeposits";
import { fetchLiquidations } from "../../lib/dune/fetchLiquidations";
import { fetchAverageAPY } from "../../lib/dune/fetchAverageAPY";
import { fetchAllTroves } from "../../lib/dune/fetchAllTroves";
import { fetchRedemptionRisk } from "../../lib/dune/fetchRedemptionRisk";
import { fetchRecentLiquidations } from "../../lib/dune/fetchRecentLiquidations";

// ✅ DefiLlama rates
import { fetchDefiLlamaAPY } from "../../lib/defillama/fetchLendingAPY";

// ✅ Aave rates (server-only)
import { fetchAaveRates } from "../../lib/dune/fetchAaveRates";

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
  // ===== Fetch data =====
  const depositsRaw = (await fetchBoldDeposit()) || {};
  const lenderDepositsRaw = (await fetchLenderDeposits()) || [];
  const liquidationsRaw = (await fetchLiquidations()) || {};
  const apyRaw = (await fetchAverageAPY()) || {};
  const allTrovesRaw = (await fetchAllTroves()) || [];
  const redemptionRisksRaw = (await fetchRedemptionRisk()) || {};
  const recentLiquidationsRaw = (await fetchRecentLiquidations()) || [];

  // ===== External APY data =====
  const defiLlamaAPY = (await fetchDefiLlamaAPY()) || {};
  const aaveRates = (await fetchAaveRates()) || {};

  const lastUpdated = new Date().toUTCString();

  // ===== Normalize deposits / liquidations / APY =====
  const deposits = {};
  const liquidations = {};
  const apyValues = {};

  for (const [k, v] of Object.entries(depositsRaw)) {
    const key = normalizeCollateral(k);
    deposits[key] = (deposits[key] || 0) + Number(v || 0);
  }

  for (const [k, v] of Object.entries(liquidationsRaw)) {
    const key = normalizeCollateral(k);
    liquidations[key] = (liquidations[key] || 0) + Number(v || 0);
  }

  for (const [k, v] of Object.entries(apyRaw)) {
    const key = normalizeCollateral(k);
    apyValues[key] = Number(v || 0);
  }

  // ===== Normalize troves =====
  const allTroves = allTrovesRaw.map((t) => ({
    ...t,
    collateralType: normalizeCollateral(t.collateral_type),
    collateral_ratio: Number(t.collateral_ratio),
    collateral: Number(t.collateral),
  }));

  // ===== Normalize lender deposits =====
  const lenderDeposits = lenderDepositsRaw.map((d) => ({
    owner: d.owner,
    collateralType: normalizeCollateral(d.collateral_type),
    depositAmount: Number(d.deposit_amount || 0),
    unclaimedBold: Number(d.unclaimed_bold || 0),
    depositorAge: d.depositor_age,
    lastModified: d.last_modified,
  }));

  // ===== Total collateral per pool =====
  const totalCollateralSum = {};
  POOLCARD_ORDER.forEach((c) => {
    totalCollateralSum[c] = allTroves
      .filter((t) => t.collateralType === c)
      .reduce((sum, t) => sum + t.collateral, 0);
  });

  const maxCollateral = Math.max(...Object.values(totalCollateralSum), 1);

  // ===== PoolCard data =====
  const data = POOLCARD_ORDER.map((c) => {
    const troves = allTroves.filter((t) => t.collateralType === c);
    const risky = troves.filter(
      (t) => t.collateral_ratio <= CR_RISK_THRESHOLD[c]
    );

    return {
      name: c,
      deposit: deposits[c] || 0,
      liquidationUSD: liquidations[c] || 0,
      apy: apyValues[c] || 0,
      lowCRTroves: troves,
      crRisk: troves.length ? (risky.length / troves.length) * 100 : 0,
      crRiskCollateralSum: risky.reduce((s, t) => s + t.collateral, 0),
      totalCollateral: totalCollateralSum[c],
      redemptionRisk: redemptionRisksRaw[c] || "Minimal",
      profitability: totalCollateralSum[c] / maxCollateral / 2,
      crRiskThreshold: CR_RISK_THRESHOLD[c],
      minCRStress: MIN_CR_STRESS[c],
    };
  });

  const topCollateral = data.reduce(
    (best, cur) =>
      cur.totalCollateral > best.totalCollateral ? cur : best,
    data[0]
  ).name;

  // ===== Recent liquidations =====
  const recentLiquidations = recentLiquidationsRaw.map((l) => ({
    time: l.block_time,
    ownerHtml: l.owner,
    troveId: l.trove_id,
    collateralType: normalizeCollateral(l.collateral_type),
    collateralAmount: Math.abs(Number(l.collateral_change || 0)),
    collateralPrice: Number(l.collateral_price || 0),
    debt: Math.abs(Number(l.debt_change || 0)),
    txHash: l.tx_hash,
  }));

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "#0b1220",
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
        <h1 style={{ color: "#fff", marginLeft: 12 }}>
          LPMS Dashboard
        </h1>
      </header>

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
                {...item}
                isTop={item.name === topCollateral}
              />
            ))}
          </div>
        </section>

        {/* TROVE SCANNER */}
        <section style={{ marginTop: 48 }}>
          <TroveScanner
            allTroves={allTroves}
            lenderDeposits={lenderDeposits}
            comparisonAPY={{ ...defiLlamaAPY, ...aaveRates }}
          />
        </section>

        {/* RECENT LIQUIDATIONS */}
        <section style={{ marginTop: 48 }}>
          <h2 style={{ color: "#9ca3af" }}>Recent Liquidations</h2>
          <RecentLiquidationsTable rows={recentLiquidations} />
        </section>
      </main>

      <Footer />
    </>
  );
}
