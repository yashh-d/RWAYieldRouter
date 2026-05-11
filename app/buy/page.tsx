"use client";

import { useState } from "react";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import { XSTOCKS } from "@/config/xstocks";
import Link from "next/link";

export default function BuyPage() {
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0];

  const [symbol, setSymbol] = useState("AAPL");
  const [usdcAmount, setUsdcAmount] = useState("10");
  const [quote, setQuote] = useState<any>(null);
  const [status, setStatus] = useState<string>("");
  const [txSig, setTxSig] = useState<string>("");

  async function getQuote() {
    setStatus("Getting quote...");
    setQuote(null);
    setTxSig("");
    try {
      const r = await fetch(
        `/api/jupiter/quote?symbol=${symbol}&usdcAmount=${usdcAmount}&slippageBps=50`
      );
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setQuote(data);
      setStatus("");
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  }

  async function executeSwap() {
    if (!wallet || !quote) return;
    setStatus("Building swap...");
    try {
      const r = await fetch("/api/jupiter/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote: quote.quote,
          userPublicKey: wallet.address,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);

      // Decode, sign with Privy embedded wallet, send
      const txBuf = Buffer.from(data.swapTransaction, "base64");
      const tx = VersionedTransaction.deserialize(txBuf);

      setStatus("Signing...");
      const signed = await wallet.signTransaction(tx);

      setStatus("Sending...");
      const conn = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!, "confirmed");
      const sig = await conn.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });

      setStatus("Confirming...");
      const latest = await conn.getLatestBlockhash();
      await conn.confirmTransaction(
        { signature: sig, ...latest },
        "confirmed"
      );

      setTxSig(sig);
      setStatus("Done");
      setQuote(null);
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  }

  if (!wallet) {
    return (
      <main style={{ padding: 24 }}>
        <Link href="/">← Back</Link>
        <p style={{ marginTop: 16 }}>Connect a wallet first.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <Link href="/">← Back</Link>
      <h1 style={{ fontSize: 24, marginTop: 16 }}>Buy xStock</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        <label>
          Stock
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            style={input}
          >
            {XSTOCKS.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} — {s.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          USDC amount
          <input
            type="number"
            value={usdcAmount}
            onChange={(e) => setUsdcAmount(e.target.value)}
            style={input}
            min="1"
            step="0.01"
          />
        </label>

        <button onClick={getQuote} style={btnSecondary}>
          Get quote
        </button>

        {quote && (
          <div style={{ padding: 12, background: "#f4f4f4", borderRadius: 8 }}>
            <div>You receive: <strong>{quote.display.outAmount.toFixed(6)} {quote.display.symbol}</strong></div>
            <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
              ${quote.display.pricePerShare.toFixed(4)}/share · {(quote.display.priceImpactPct * 100).toFixed(2)}% impact
            </div>
            <button onClick={executeSwap} style={{ ...btnPrimary, marginTop: 12, width: "100%" }}>
              Buy
            </button>
          </div>
        )}

        {status && <p style={{ color: status.startsWith("Error") ? "red" : "#666" }}>{status}</p>}
        {txSig && (
          <a
            href={`https://solscan.io/tx/${txSig}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 14 }}
          >
            View on Solscan ↗
          </a>
        )}

        <div style={{ marginTop: 24, padding: 12, fontSize: 12, color: "#999", borderTop: "1px solid #eee" }}>
          xStocks are tokenized representations issued by Backed Finance under EU prospectus.
          They are not registered US securities and are not available in restricted jurisdictions.
          Holders do not receive shareholder voting rights.
        </div>
      </div>
    </main>
  );
}

const input: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: 10,
  marginTop: 4,
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: 16,
  boxSizing: "border-box",
};
const btnPrimary: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 8,
  border: "none",
  background: "#000",
  color: "#fff",
  fontSize: 16,
  cursor: "pointer",
};
const btnSecondary: React.CSSProperties = { ...btnPrimary, background: "#f4f4f4", color: "#000" };
