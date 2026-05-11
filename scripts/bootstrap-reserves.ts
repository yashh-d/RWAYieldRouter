/**
 * Bootstrap: discover Kamino xStocks Market pubkey and per-mint reserve addresses.
 *
 * Run once before first dev session:
 *   npm run bootstrap
 *
 * Reads config/xstocks.ts mints, queries Kamino's public REST API,
 * and writes the resolved addresses to config/reserves.json.
 *
 * This avoids hardcoding addresses that may rotate during Kamino's v2 rollout.
 */

import { writeFileSync } from "fs";
import { join } from "path";
import { XSTOCKS } from "../config/xstocks";

const KAMINO_API = process.env.KAMINO_API_BASE || "https://api.kamino.finance";

interface KaminoMarket {
  lendingMarket: string;
  name: string;
  reserves: Array<{
    reserve: string;
    mint: string;
    symbol?: string;
  }>;
}

async function main() {
  console.log("Fetching Kamino markets...");
  const res = await fetch(`${KAMINO_API}/v2/kamino-market`);
  if (!res.ok) {
    throw new Error(`Kamino API ${res.status}: ${await res.text()}`);
  }
  const markets: KaminoMarket[] = await res.json();

  // Find the market that contains the most xStock mints.
  // Heuristic: the xStocks market should have AAPLx as a reserve.
  const aaplxMint = XSTOCKS.find((s) => s.symbol === "AAPL")!.mint;
  const xstocksMarket = markets.find((m) =>
    m.reserves.some((r) => r.mint === aaplxMint)
  );

  if (!xstocksMarket) {
    console.error(
      "Could not find xStocks market. Available markets:",
      markets.map((m) => ({ name: m.name, pubkey: m.lendingMarket }))
    );
    throw new Error("xStocks market not found — check that AAPLx mint is correct in config/xstocks.ts");
  }

  console.log(`Found market: ${xstocksMarket.name} (${xstocksMarket.lendingMarket})`);

  const reserveMap: Record<string, { reserve: string; symbol: string }> = {};

  for (const stock of XSTOCKS) {
    const reserve = xstocksMarket.reserves.find((r) => r.mint === stock.mint);
    if (reserve) {
      reserveMap[stock.symbol] = {
        reserve: reserve.reserve,
        symbol: stock.xSymbol,
      };
      console.log(`  ✓ ${stock.xSymbol} → ${reserve.reserve}`);
    } else {
      console.log(`  ✗ ${stock.xSymbol} — no reserve in this market yet`);
    }
  }

  // Also resolve USDC reserve in this market for the borrow side later
  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const usdcReserve = xstocksMarket.reserves.find((r) => r.mint === USDC_MINT);
  if (usdcReserve) {
    reserveMap["USDC"] = { reserve: usdcReserve.reserve, symbol: "USDC" };
    console.log(`  ✓ USDC → ${usdcReserve.reserve}`);
  }

  const output = {
    market: xstocksMarket.lendingMarket,
    marketName: xstocksMarket.name,
    reserves: reserveMap,
    bootstrappedAt: new Date().toISOString(),
  };

  const outPath = join(__dirname, "..", "config", "reserves.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${outPath}`);
  console.log(`\nAdd to .env.local:`);
  console.log(`NEXT_PUBLIC_XSTOCKS_MARKET_PUBKEY=${xstocksMarket.lendingMarket}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
