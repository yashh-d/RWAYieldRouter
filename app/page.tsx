"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const { login, ready, authenticated } = usePrivy();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard");
    }
  }, [ready, authenticated, router]);

  const handleLogin = () => {
    setLoading(true);
    login();
  };

  return (
    <>
      <div className="bg-mesh"></div>
      <main className="container">
        <div className="left-panel">
          <h1>
            Own the future of <br />
            <span style={{ color: "var(--accent-color)" }}>tokenized assets</span>
          </h1>
          <p className="subtitle">
            xStocks & Ondo bring the world's most valuable equities and yields on-chain. Buy fractional shares of your favorite companies or US Treasuries, and unlock limitless composability by lending them on Kamino.
          </p>

          <div className="features">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              Fractional Shares & Yields
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              DeFi Integration
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              Institutional Grade
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="signup-card">
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <h2 style={{ fontSize: "1.75rem", marginBottom: "1rem", fontWeight: 600 }}>Get early access</h2>
              <p style={{ color: "#a3a3a3", marginBottom: "2rem" }}>Log in with your email or connect your wallet to start exploring the future of tokenized assets.</p>
              
              <button onClick={handleLogin} disabled={!ready || authenticated} className="submit-btn" style={{ padding: "1rem", fontSize: "1.1rem" }}>
                {!ready ? (
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                     <svg style={{ animation: "spin 1s linear infinite" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                     Loading...
                   </div>
                ) : (
                  "Login / Connect"
                )}
              </button>
              
              <div style={{ marginTop: "2rem" }}>
                <Link href="/dashboard" style={{ color: "#a3a3a3", textDecoration: "none", fontSize: "0.9rem" }}>
                  Or preview the app dashboard →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </>
  );
}
