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

// Normalize ETH → WETH
const normalizeCollateral = (c) => (c === "ETH" ? "WETH" : c);

const POOLCARD_ORDER = ["wstETH", "WETH", "rETH"];

const CR_RISK_THRESHOLD = {
  WETH: 1.5,
  wstETH: 1.6,
  rETH: 1.6,
};

const MIN_CR_STRESS = {
  WETH: 1.1,
  wstETH: 1.2,
  rETH: 1.2,
};

export default async function DashboardPage() {
  // ===== Fetch =====
  const depositsRaw = (await fetchBoldDeposit()) || {};
  const lenderDepositsRaw = (await fetchLenderDeposits()) || [];
  const liquidationsRaw = await fetchLiquidations(); // IMPORTANT
  const apyRaw = (await fetchAverageAPY()) || {};
  const allTrovesRaw = (await fetchAllTroves()) || [];
  const redemptionRisksRaw = (await fetchRedemptionRisk()) || {};
  const recentLiquidationsRaw = (await fetchRecentLiquidations()) || [];

  const lastUpdated = new Date().toUTCString();

  // ===== Deposits =====
  const deposits = {};
  for (const [k, v] of Object.entries(depositsRaw)) {
    const key = normalizeCollateral(k);
    deposits[key] = (deposits[key] || 0) + Number(v || 0);
  }

  // ===== 🔥 LIQUIDATIONS (REAL FIX) =====
  const liquidations = {};

  // CASE 1: OLD WORKING FORMAT (OBJECT)
  if (
    liquidationsRaw &&
    !Array.isArray(liquidationsRaw) &&
    typeof liquidationsRaw === "object"
  ) {
    for (const [k, v] of Object.entries(liquidationsRaw)) {
      const key = normalizeCollateral(k);
      liquidations[key] = Number(v || 0);
    }
  }

  // CASE 2: ROW FORMAT (if query ever changes)
  if (Array.isArray(liquidationsRaw)) {
    for (const row of liquidationsRaw) {
      const key = normalizeCollateral(row.collateral_type);

      const usd =
        Number(row.liquidation_usd) ||
        Number(row.liquidated_usd) ||
        Number(row.usd) ||
        0;

      liquidations[key] = (liquidations[key] || 0) + Math.abs(usd);
    }
  }

  // ===== APY =====
  const apyValues = {};
  for (const [k, v] of Object.entries(apyRaw)) {
    apyValues[normalizeCollateral(k)] = Number(v || 0);
  }

  // ===== Troves =====
  const allTroves = allTrovesRaw.map((t) => ({
    ...t,
    collateralType: normalizeCollateral(t.collateral_type),
    collateral_ratio: Number(t.collateral_ratio),
    collateral: Number(t.collateral),
  }));

  // ===== Lender deposits =====
  const lenderDeposits = lenderDepositsRaw.map((d) => ({
    owner: d.owner,
    collateralType: normalizeCollateral(d.collateral_type),
    depositAmount: Number(d.deposit_amount || 0),
    unclaimedBold: Number(d.unclaimed_bold || 0),
    depositorAge: d.depositor_age,
    lastModified: d.last_modified,
  }));

  // ===== Total collateral =====
  const totalCollateralSum = {};
  POOLCARD_ORDER.forEach((c) => {
    totalCollateralSum[c] = allTroves
      .filter((t) => t.collateralType === c)
      .reduce((s, t) => s + t.collateral, 0);
  });

  const maxCollateral = Math.max(...Object.values(totalCollateralSum), 1);

  // ===== PoolCards =====
  const data = POOLCARD_ORDER.map((c) => {
    const troves = allTroves.filter((t) => t.collateralType === c);
    const risky = troves.filter(
      (t) => t.collateral_ratio <= CR_RISK_THRESHOLD[c]
    );

    return {
      name: c,
      deposit: deposits[c] || 0,
      liquidationUSD: liquidations[c] || 0, // ✅ FIXED FOR REAL
      apy: apyValues[c] || 0,
      lowCRTroves: troves,
      crRisk: troves.length
        ? (risky.length / troves.length) * 100
        : 0,
      crRiskCollateralSum: risky.reduce((s, t) => s + t.collateral, 0),
      totalCollateral: totalCollateralSum[c],
      redemptionRisk: redemptionRisksRaw[c] || "Minimal",
      profitability: totalCollateralSum[c] / maxCollateral / 2,
      crRiskThreshold: CR_RISK_THRESHOLD[c],
      minCRStress: MIN_CR_STRESS[c],
    };
  });

  const topCollateral = data.reduce(
    (a, b) => (b.totalCollateral > a.totalCollateral ? b : a),
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
      <header style={{ background: "#0b1220", padding: 16 }}>
        <Image src="/Logo.png" alt="LPMS" width={26} height={26} />
      </header>

      <main style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ color: "#6b7280" }}>Last updated: {lastUpdated}</p>

        <section>
          <h2>Stability Pools</h2>
          <div style={{ display: "grid", gap: 16 }}>
            {data.map((item) => (
              <PoolCard key={item.name} {...item} />
            ))}
          </div>
        </section>

        <TroveScanner
          allTroves={allTroves}
          lenderDeposits={lenderDeposits}
        />

        <RecentLiquidationsTable rows={recentLiquidations} />
      </main>

      <Footer />
    </>
  );
}
