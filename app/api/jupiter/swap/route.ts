import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/jupiter/swap
 * Body: { quote, userPublicKey }
 *
 * Returns a base64-encoded VersionedTransaction that the client signs via Privy
 * and submits to the network.
 */
export async function POST(req: NextRequest) {
  const { quote, userPublicKey } = await req.json();

  if (!quote || !userPublicKey) {
    return NextResponse.json({ error: "quote and userPublicKey required" }, { status: 400 });
  }

  const r = await fetch(`${process.env.JUPITER_API_BASE}/swap/v1/swap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey,
      wrapAndUnwrapSol: true,
      // Auto priority fee — Jupiter handles dynamic priority fees for landing
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: { priorityLevelWithMaxLamports: { priorityLevel: "high", maxLamports: 5_000_000 } },
    }),
  });

  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json({ error: `Jupiter swap ${r.status}: ${text}` }, { status: 502 });
  }

  const data = await r.json();
  // data.swapTransaction is base64-encoded VersionedTransaction
  return NextResponse.json({ swapTransaction: data.swapTransaction });
}
