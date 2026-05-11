"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [formData, setFormData] = useState({ name: "", email: "", company: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
            {submitted ? (
              <div style={{ textAlign: "center", padding: "2rem 0", animation: "fade-in 0.5s ease-out" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(79, 70, 229, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "var(--accent-color)" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>You're on the list!</h2>
                <p style={{ color: "#a3a3a3" }}>We'll be in touch as soon as we launch our private beta.</p>
                <div style={{ marginTop: "2rem" }}>
                  <Link href="/dashboard" className="btn-outline">
                    Preview App Dashboard →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={{ fontSize: "1.75rem", marginBottom: "1.5rem", fontWeight: 600 }}>Get early access</h2>
                
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Work Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    placeholder="Acme Corp"
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <svg style={{ animation: "spin 1s linear infinite" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                      Request Access
                    </div>
                  ) : (
                    "Join Waitlist"
                  )}
                </button>
                <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                  <Link href="/dashboard" style={{ color: "#a3a3a3", textDecoration: "none", fontSize: "0.9rem" }}>
                    Or preview the app dashboard →
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </>
  );
}
