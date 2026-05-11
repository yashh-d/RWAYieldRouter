import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { XSTOCKS, getXStockByMint } from "@/config/xstocks";
import { getMarket } from "@/lib/reserves";

/**
 * GET /api/positions?wallet=...
 *
 * Returns:
 *   - spot: xStock balances in the wallet (Token-2022)
 *   - collateral: Kamino obligation deposits in the xStocks Market
 */
export async function GET(req: NextRequest) {
  const wallet = new URL(req.url).searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  const conn = new Connection(process.env.SOLANA_RPC!, "confirmed");
  const owner = new PublicKey(wallet);

  // 1. Spot balances — xStocks are Token-2022, NOT classic SPL
  // This is the #1 footgun: getTokenAccountsByOwner with TOKEN_PROGRAM_ID
  // returns nothing for xStocks. You MUST use TOKEN_2022_PROGRAM_ID.
  const tokenAccounts = await conn.getParsedTokenAccountsByOwner(owner, {
    programId: TOKEN_2022_PROGRAM_ID,
  });

  const spot = tokenAccounts.value
    .map((acc) => {
      const info = acc.account.data.parsed.info;
      const stock = getXStockByMint(info.mint);
      if (!stock) return null;
      const uiAmount = info.tokenAmount.uiAmount || 0;
      if (uiAmount === 0) return null;
      return {
        symbol: stock.symbol,
        xSymbol: stock.xSymbol,
        name: stock.name,
        balance: uiAmount,
        mint: stock.mint,
      };
    })
    .filter(Boolean);

  // 2. Kamino obligations
  const market = getMarket();
  let collateral: any[] = [];
  try {
    const r = await fetch(
      `${process.env.KAMINO_API_BASE}/kamino-market/${market}/users/${wallet}/obligations`
    );
    if (r.ok) {
      const obligations = await r.json();
      // Flatten all deposits across obligations into a single list
      for (const ob of obligations) {
        for (const d of ob.deposits || []) {
          const stock = getXStockByMint(d.mintAddress || d.mint);
          if (stock) {
            collateral.push({
              symbol: stock.symbol,
              xSymbol: stock.xSymbol,
              amount: d.amount || d.depositAmount,
              valueUsd: d.marketValueUsd || d.valueUsd,
            });
          }
        }
      }
    }
  } catch (e) {
    // Don't fail the whole response if Kamino is briefly down
    console.error("Kamino obligation fetch failed:", e);
  }

  return NextResponse.json({ spot, collateral });
}
