/**
 * Loads the reserve map produced by `npm run bootstrap`.
 * Throws if the bootstrap hasn't been run yet.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface ReservesConfig {
  market: string;
  marketName: string;
  reserves: Record<string, { reserve: string; symbol: string }>;
  bootstrappedAt: string;
}

let cached: ReservesConfig | null = null;

export function getReserves(): ReservesConfig {
  if (cached) return cached;

  const path = join(process.cwd(), "config", "reserves.json");
  if (!existsSync(path)) {
    throw new Error(
      "reserves.json not found. Run `npm run bootstrap` to populate it from the Kamino API."
    );
  }

  cached = JSON.parse(readFileSync(path, "utf-8"));
  return cached!;
}

export function getReserveForSymbol(symbol: string): string {
  const cfg = getReserves();
  const entry = cfg.reserves[symbol];
  if (!entry) {
    throw new Error(`No Kamino reserve for ${symbol}. Re-run bootstrap or check market support.`);
  }
  return entry.reserve;
}

export function getMarket(): string {
  return getReserves().market;
}
