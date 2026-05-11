import { NextRequest, NextResponse } from "next/server";
import { getXStock, USDC_MINT, USDC_DECIMALS } from "@/config/xstocks";

/**
 * GET /api/jupiter/quote?symbol=AAPL&usdcAmount=100&slippageBps=50
 *
 * Returns a Jupiter v6 quote for USDC -> xStock.
 * Slippage default 50bps (0.5%) — bump on the client for thin liquidity.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const usdcAmount = searchParams.get("usdcAmount");
  const slippageBps = searchParams.get("slippageBps") || "50";

  if (!symbol || !usdcAmount) {
    return NextResponse.json({ error: "symbol and usdcAmount required" }, { status: 400 });
  }

  const stock = getXStock(symbol);
  if (!stock) {
    return NextResponse.json({ error: `Unknown xStock: ${symbol}` }, { status: 400 });
  }

  // Convert USDC amount (decimal string like "100.50") to smallest units
  const amountInSmallest = Math.floor(parseFloat(usdcAmount) * 10 ** USDC_DECIMALS);

  const url = new URL(`${process.env.JUPITER_API_BASE}/swap/v1/quote`);
  url.searchParams.set("inputMint", USDC_MINT);
  url.searchParams.set("outputMint", stock.mint);
  url.searchParams.set("amount", amountInSmallest.toString());
  url.searchParams.set("slippageBps", slippageBps);
  // Token-2022 support is automatic on Jupiter v6, but we set restrictIntermediateTokens
  // to avoid weird routes through illiquid Token-2022 hops
  url.searchParams.set("restrictIntermediateTokens", "true");

  const r = await fetch(url.toString());
  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json({ error: `Jupiter ${r.status}: ${text}` }, { status: 502 });
  }
  const quote = await r.json();

  // Format outAmount for display
  const outAmountUi = parseInt(quote.outAmount) / 10 ** stock.decimals;
  const priceImpactPct = parseFloat(quote.priceImpactPct || "0");

  return NextResponse.json({
    quote, // pass full quote object — needed by the swap endpoint
    display: {
      symbol: stock.xSymbol,
      outAmount: outAmountUi,
      priceImpactPct,
      pricePerShare: parseFloat(usdcAmount) / outAmountUi,
    },
  });
}
