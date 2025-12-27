// app/dashboard/page.jsx

import Image from "next/image";
import PoolCard from "../../components/PoolCard";
import RiskSummaryCard from "../../components/RiskSummaryCard";
import TroveScanner from "../../components/TroveScanner";
import Footer from "../../components/Footer";

import { fetchBoldDeposit } from "../../lib/dune/fetchBoldDeposit";
import { fetchLiquidations } from "../../lib/dune/fetchLiquidations";
import { fetchAverageAPY } from "../../lib/dune/fetchAverageAPY";
import { fetchAllTroves } from "../../lib/dune/fetchAllTroves";

// -------------------- CONFIG --------------------
const LOW_CR_THRESHOLD = 150;

// redemption interest rates (TEMP – replace with query 5156857 later)
const LAST_REDEMPTION_RATE = {
  wstETH: 4,
  WETH: 2.6,
  rETH: 0.5,
};

const RISK_COLORS = {
  wstETH: "#1C1D4F",
  WETH: "#63D77D",
  rETH: "#F1C91E",
};

// -------------------- HELPERS --------------------
function getCollateralTroves(allTroves, collateral) {
  return allTroves.filter((t) => t.collateral_type === collateral);
}

function calculateCRRisk(troves) {
  if (!troves.length) return { percent: 0, collateralUSD: 0 };

  const lowCR = troves.filter((t) => t.cr < LOW_CR_THRESHOLD);

  const percent = (lowCR.length / troves.length) * 100;
  const collateralUSD = lowCR.reduce(
    (sum, t) => sum + (t.collateral_usd || 0),
    0
  );

  return { percent, collateralUSD };
}

function calculateRedemptionRisk(troves, lastRedemptionRate) {
  if (!troves.length || !lastRedemptionRate) return "Minimal Redemption Risk";

  const closeRateTroves = troves.filter(
    (t) => Math.abs(t.interest_rate - lastRedemptionRate) <= 0.5
  );

  const ratio = closeRateTroves.length / troves.length;

  if (ratio > 0.5) return "High Redemption Risk";
  if (ratio > 0.25) return "Moderate Redemption Risk";
  return "Minimal Redemption Risk";
}

function redemptionRiskScore(label) {
  if (label === "High Redemption Risk") return 80;
  if (label === "Moderate Redemption Risk") return 50;
  return 20;
}

function calculateProfitability(crRiskPercent, redemptionLabel) {
  const crScore = Math.min(crRiskPercent, 100);
  const redScore = redemptionRiskScore(redemptionLabel);

  return crScore * 0.6 + redScore * 0.4;
}

// stress test: sum collateral liquidated at X% price drop
function stressTestLiquidation(troves, priceDropPct) {
  const dropFactor = 1 - priceDropPct / 100;

  return troves
    .filter((t) => t.cr * dropFactor < LOW_CR_THRESHOLD)
    .reduce((sum, t) => sum + (t.collateral_usd || 0), 0);
}

// -------------------- PAGE --------------------
export default async function DashboardPage() {
  // ===== Stability Pool data =====
  const deposits = await fetchBoldDeposit();
  const liquidations = await fetchLiquidations();
  const apyValues = await fetchAverageAPY();

  // ===== Trove data (cached 24h) =====
  const allTroves = await fetchAllTroves();

  // Timestamp
  const lastUpdated = new Date().toUTCString();

  const collaterals = Array.from(
    new Set([
      ...Object.keys(deposits),
      ...Object.keys(liquidations),
      ...Object.keys(apyValues),
    ])
  );

  // ===== Build full dataset =====
  const data = collaterals.map((c) => {
    const troves = getCollateralTroves(allTroves, c);

    const crRisk = calculateCRRisk(troves);
    const redemptionLabel = calculateRedemptionRisk(
      troves,
      LAST_REDEMPTION_RATE[c]
    );

    const profitability = calculateProfitability(
      crRisk.percent,
      redemptionLabel
    );

    return {
      name: c,
      deposit: deposits[c] || 0,
      liquidationUSD: liquidations[c] || 0,
      apy: apyValues[c] || 0,
      profitability,
      crRisk,
      redemptionLabel,
      troves,
    };
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

      {/* ================= MAIN ================= */}
      <main style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
        <p style={{ color: "#6b7280", fontSize: "12px" }}>
          Last updated: {lastUpdated}
        </p>

        <p style={{ color: "#9ca3af", marginTop: "14px" }}>
          🔥 <strong>Recommended Stability Pool:</strong>{" "}
          <span style={{ color: "#4ade80" }}>{topCollateral}</span>
        </p>

        {/* ===== TOP RISK CARDS ===== */}
        <section style={{ marginTop: "28px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {data.map((item) => (
              <RiskSummaryCard
                key={item.name}
                collateral={item.name}
                crRiskPercent={item.crRisk.percent}
                lowCrCollateralUSD={item.crRisk.collateralUSD}
                redemptionRiskLabel={item.redemptionLabel}
                bgColor={RISK_COLORS[item.name] || "#111827"}
              />
            ))}
          </div>
        </section>

        {/* ===== STABILITY POOLS ===== */}
        <section style={{ marginTop: "36px" }}>
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
                stressTestFn={(pct) =>
                  stressTestLiquidation(item.troves, pct)
                }
              />
            ))}
          </div>
        </section>

        {/* ===== TROVE SCANNER ===== */}
        <section style={{ marginTop: "48px" }}>
          <h2 style={{ color: "#4ade80" }}>Trove Scanner</h2>
          <TroveScanner allTroves={allTroves} />
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <Footer />
    </>
  );
}
