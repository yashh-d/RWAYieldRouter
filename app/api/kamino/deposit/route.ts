import { NextRequest, NextResponse } from "next/server";
import { getXStock } from "@/config/xstocks";
import { getMarket, getReserveForSymbol } from "@/lib/reserves";

/**
 * POST /api/kamino/deposit
 * Body: { symbol: "AAPL", amount: "0.5", userPublicKey: "..." }
 *
 * Deposits xStock as collateral on Kamino's xStocks Market.
 * In Story C this just opens/grows an obligation — no borrow yet.
 *
 * Returns base64-encoded transaction for Privy to sign.
 */
export async function POST(req: NextRequest) {
  const { symbol, amount, userPublicKey } = await req.json();

  if (!symbol || !amount || !userPublicKey) {
    return NextResponse.json(
      { error: "symbol, amount, userPublicKey required" },
      { status: 400 }
    );
  }

  const stock = getXStock(symbol);
  if (!stock) {
    return NextResponse.json({ error: `Unknown xStock: ${symbol}` }, { status: 400 });
  }

  const market = getMarket();
  const reserve = getReserveForSymbol(stock.symbol);

  // Convert amount to smallest units (xStocks are 8 decimals)
  const amountSmallest = BigInt(Math.floor(parseFloat(amount) * 10 ** stock.decimals));

  // Call Kamino KTX. Field names below follow the published OpenAPI;
  // if they shift, point your IDE at https://api.kamino.finance/ktx/documentation/json
  const r = await fetch(`${process.env.KAMINO_API_BASE}/ktx/klend/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: userPublicKey,
      market,
      reserve,
      amount: amountSmallest.toString(),
      // VanillaObligation tag — standard cross-mode obligation
      obligationType: "vanilla",
    }),
  });

  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json(
      { error: `Kamino KTX ${r.status}: ${text}` },
      { status: 502 }
    );
  }

  const data = await r.json();
  // KTX returns a serialized transaction. Field name may be `transaction` or `tx` —
  // normalize so the frontend always reads `transaction`.
  const tx = data.transaction || data.tx || data.serializedTransaction;
  if (!tx) {
    return NextResponse.json(
      { error: "Kamino response missing transaction field", raw: data },
      { status: 502 }
    );
  }

  return NextResponse.json({ transaction: tx });
}
