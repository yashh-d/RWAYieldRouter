"use client";

import { useEffect, useState } from "react";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import Link from "next/link";

interface SpotPosition {
  symbol: string;
  xSymbol: string;
  name: string;
  balance: number;
  mint: string;
}

interface CollateralPosition {
  symbol: string;
  xSymbol: string;
  amount: string;
  valueUsd?: number;
}

export default function PositionsPage() {
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0];

  const [spot, setSpot] = useState<SpotPosition[]>([]);
  const [collateral, setCollateral] = useState<CollateralPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string>("");

  async function load() {
    if (!wallet) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/positions?wallet=${wallet.address}`);
      const data = await r.json();
      setSpot(data.spot || []);
      setCollateral(data.collateral || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [wallet?.address]);

  async function lend(symbol: string, amount: number) {
    if (!wallet) return;
    setBusy(symbol);
    try {
      const r = await fetch("/api/kamino/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          amount: amount.toString(),
          userPublicKey: wallet.address,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);

      const txBuf = Buffer.from(data.transaction, "base64");
      const tx = VersionedTransaction.deserialize(txBuf);
      const signed = await wallet.signTransaction(tx);

      const conn = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!, "confirmed");
      const sig = await conn.sendRawTransaction(signed.serialize(), { maxRetries: 3 });
      const latest = await conn.getLatestBlockhash();
      await conn.confirmTransaction({ signature: sig, ...latest }, "confirmed");

      // Refetch positions
      await load();
      alert(`Deposited! ${sig}`);
    } catch (e: any) {
      alert(`Failed: ${e.message}`);
    } finally {
      setBusy("");
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
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <Link href="/">← Back</Link>
      <h1 style={{ fontSize: 24, marginTop: 16 }}>My positions</h1>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>In wallet</h2>
        {loading ? (
          <p>Loading...</p>
        ) : spot.length === 0 ? (
          <p style={{ color: "#666" }}>
            No xStocks yet. <Link href="/buy">Buy some →</Link>
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {spot.map((p) => (
              <div key={p.mint} style={row}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.xSymbol}</div>
                  <div style={{ fontSize: 13, color: "#666" }}>{p.name}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontVariantNumeric: "tabular-nums" }}>
                    {p.balance.toFixed(6)}
                  </div>
                  <button
                    onClick={() => lend(p.symbol, p.balance)}
                    disabled={busy === p.symbol}
                    style={btnSmall}
                  >
                    {busy === p.symbol ? "..." : "Lend on Kamino"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18 }}>Deposited as collateral on Kamino</h2>
        {collateral.length === 0 ? (
          <p style={{ color: "#666" }}>Nothing deposited yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {collateral.map((p, i) => (
              <div key={i} style={row}>
                <div style={{ fontWeight: 600 }}>{p.xSymbol}</div>
                <div style={{ fontVariantNumeric: "tabular-nums" }}>
                  {p.amount}
                  {p.valueUsd && (
                    <span style={{ color: "#666", marginLeft: 8 }}>
                      ${p.valueUsd.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 12,
  background: "#f4f4f4",
  borderRadius: 8,
};
const btnSmall: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  background: "#000",
  color: "#fff",
  fontSize: 14,
  cursor: "pointer",
};
