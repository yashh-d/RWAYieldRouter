"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "portfolio" | "buy" | "borrow" | "deploy";

const ASSETS = [
  { id: "TSLAx", symbol: "TSLAx", name: "Tokenized Tesla", price: 175.25, change: "+2.19%", supply: "$5.23M", volume: "$1.12M", icon: "🚗" },
  { id: "SPYx", symbol: "SPYx", name: "Tokenized S&P 500", price: 512.40, change: "+0.16%", supply: "$5.16M", volume: "$2.34M", icon: "📈" },
  { id: "QQQx", symbol: "QQQx", name: "Tokenized Nasdaq", price: 438.15, change: "+0.08%", supply: "$3.27M", volume: "$950K", icon: "📊" },
  { id: "AAPLx", symbol: "AAPLx", name: "Tokenized Apple", price: 168.30, change: "-0.45%", supply: "$8.45M", volume: "$3.41M", icon: "🍎" },
  { id: "ONDO_USY", symbol: "ONDO_USY", name: "Ondo USY", price: 1.00, change: "+0.01%", supply: "$25.1M", volume: "$12.5M", icon: "💵" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("buy"); // Default to buy to show off the new UI
  const [toastMessage, setToastMessage] = useState("");

  // Simulated User State
  const [balances, setBalances] = useState<Record<string, number>>({
    USDC: 10000,
    TSLAx: 0,
    SPYx: 0,
    QQQx: 0,
    AAPLx: 0,
    ONDO_USY: 0,
  });
  
  const [collateral, setCollateral] = useState<Record<string, number>>({
    TSLAx: 0,
    SPYx: 0,
    QQQx: 0,
    AAPLx: 0,
    ONDO_USY: 0,
  });

  const [debtUSDC, setDebtUSDC] = useState(0);
  const [deployedUSDC, setDeployedUSDC] = useState(0);

  // Buy Modal State
  const [buyModalAsset, setBuyModalAsset] = useState<string | null>(null);
  const [buyAmount, setBuyAmount] = useState("");

  // Borrow/Deploy States
  const [borrowAmount, setBorrowAmount] = useState("");
  const [collateralAsset, setCollateralAsset] = useState<string>("AAPLx");
  const [deployAmount, setDeployAmount] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyModalAsset) return;
    
    const amount = parseFloat(buyAmount);
    if (isNaN(amount) || amount <= 0 || amount > balances.USDC) return;

    const assetDetails = ASSETS.find(a => a.id === buyModalAsset);
    if (!assetDetails) return;

    setBalances(prev => ({
      ...prev,
      USDC: prev.USDC - amount,
      [buyModalAsset]: prev[buyModalAsset] + (amount / assetDetails.price),
    }));
    setBuyAmount("");
    setBuyModalAsset(null);
    showToast(`Bought ${buyModalAsset} successfully!`);
  };

  const handleBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(borrowAmount);
    const assetDetails = ASSETS.find(a => a.id === collateralAsset);
    if (!assetDetails) return;

    const collateralValue = balances[collateralAsset] * assetDetails.price;
    if (isNaN(amount) || amount <= 0 || amount > collateralValue / 2) return;

    setBalances(prev => ({
      ...prev,
      [collateralAsset]: 0, 
      USDC: prev.USDC + amount,
    }));
    setCollateral(prev => ({
      ...prev,
      [collateralAsset]: prev[collateralAsset] + balances[collateralAsset],
    }));
    setDebtUSDC(prev => prev + amount);
    setBorrowAmount("");
    showToast(`Borrowed ${amount} USDC against ${collateralAsset}!`);
  };

  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(deployAmount);
    if (isNaN(amount) || amount <= 0 || amount > balances.USDC) return;

    setBalances(prev => ({
      ...prev,
      USDC: prev.USDC - amount,
    }));
    setDeployedUSDC(prev => prev + amount);
    setDeployAmount("");
    showToast(`Deployed ${amount} USDC into Delta Neutral Strategy!`);
  };

  const calculateTotalValue = () => {
    let total = balances.USDC + deployedUSDC - debtUSDC;
    for (const asset of ASSETS) {
      total += (balances[asset.id] + collateral[asset.id]) * asset.price;
    }
    return total;
  };

  return (
    <>
      <div className="bg-mesh"></div>
      <main className="dashboard-layout">
        <header className="dashboard-header" style={{ marginBottom: "2rem" }}>
          <h1>xStocks & Ondo <span style={{ color: "var(--accent-color)", fontSize: "1rem", verticalAlign: "middle", marginLeft: "1rem" }}>Simulated Env</span></h1>
          <nav className="dashboard-nav">
            <button className={`tab-btn ${activeTab === "portfolio" ? "active" : ""}`} onClick={() => setActiveTab("portfolio")}>Portfolio</button>
            <button className={`tab-btn ${activeTab === "buy" ? "active" : ""}`} onClick={() => setActiveTab("buy")}>Markets</button>
            <button className={`tab-btn ${activeTab === "borrow" ? "active" : ""}`} onClick={() => setActiveTab("borrow")}>Borrow</button>
            <button className={`tab-btn ${activeTab === "deploy" ? "active" : ""}`} onClick={() => setActiveTab("deploy")}>Strategies</button>
          </nav>
        </header>

        {activeTab === "buy" && (
          <div style={{ animation: "fade-in 0.5s ease-out" }}>
            <div className="market-header">
              <div>
                <h2 style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>Markets</h2>
                <p style={{ color: "#8b949e" }}>Purchase tokenized real-world assets securely.</p>
              </div>
              <div className="market-header-stats">
                <div>
                  <span className="stat-label">Market Size</span>
                  <span className="stat-value">$27,271,354</span>
                </div>
                <div>
                  <span className="stat-label">24h Volume</span>
                  <span className="stat-value">$8,010,760</span>
                </div>
              </div>
            </div>

            <div className="filter-bar">
              <button className="filter-chip">
                <span>SOL</span>
              </button>
              <button className="filter-chip active">
                <span>xStocks</span>
                <span className="filter-chip-badge">+4</span>
              </button>
              <button className="filter-chip">
                <span>BTC</span>
              </button>
              <button className="filter-chip">
                <span>LSTs</span>
              </button>
              <button className="filter-chip">
                <span>RWA</span>
                <span className="filter-chip-badge">+8</span>
              </button>
            </div>

            <div className="defi-table-container">
              <div className="section-label">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-color)" }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  <h3>xStocks Market</h3>
                </div>
                <div className="section-badge">Live Prices</div>
              </div>

              <div className="defi-table-header">
                <div>Asset</div>
                <div>Oracle Price</div>
                <div>Total Supply</div>
                <div>24h Volume</div>
                <div style={{ textAlign: "right" }}>Action</div>
              </div>

              {ASSETS.map(asset => (
                <div className="defi-table-row" key={asset.id}>
                  <div className="asset-cell">
                    <div className="asset-logo">{asset.icon}</div>
                    <div>
                      <div className="asset-symbol">{asset.symbol}</div>
                      <div className="data-cell subtext">{asset.name}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="data-cell">${asset.price.toFixed(2)}</div>
                    <div className={`data-cell subtext ${asset.change.startsWith('+') ? 'green' : ''}`}>
                      {asset.change}
                    </div>
                  </div>

                  <div>
                    <div className="data-cell">{asset.supply}</div>
                  </div>

                  <div>
                    <div className="data-cell">{asset.volume}</div>
                  </div>

                  <div className="action-cell">
                    <button 
                      className="btn-table"
                      onClick={() => setBuyModalAsset(asset.id)}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Inline Buy Modal Simulation */}
            {buyModalAsset && (
              <div style={{
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
              }}>
                <div className="action-card" style={{ maxWidth: "400px", width: "100%", background: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <h2 style={{ margin: 0 }}>Buy {buyModalAsset}</h2>
                    <button onClick={() => setBuyModalAsset(null)} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem" }}>×</button>
                  </div>
                  <form onSubmit={handleBuy}>
                    <div className="form-group">
                      <label>Amount (USDC)</label>
                      <div style={{ position: "relative" }}>
                        <input 
                          type="number" 
                          value={buyAmount} 
                          onChange={(e) => setBuyAmount(e.target.value)}
                          placeholder="0.00"
                          min="1"
                          step="0.01"
                          max={balances.USDC}
                          required
                          autoFocus
                        />
                        <button 
                          type="button" 
                          onClick={() => setBuyAmount(balances.USDC.toString())}
                          style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "var(--accent-color)", cursor: "pointer", fontWeight: 600 }}
                        >
                          MAX
                        </button>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>Available: {balances.USDC.toLocaleString()} USDC</div>
                    </div>
                    <button type="submit" className="submit-btn" style={{ background: "#4f46e5" }}>Confirm Trade</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Keeping Portfolio, Borrow, Deploy logic similarly structured but unchanged for brevity, unless needed. */}
        {activeTab === "portfolio" && (
          <div className="dashboard-grid">
            <div className="stat-card">
              <h3>Total Net Worth</h3>
              <div className="value">${calculateTotalValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="stat-card">
              <h3>Yield Generating</h3>
              <div className="value">${deployedUSDC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>

            <div className="action-card" style={{ gridColumn: "1 / -1" }}>
              <h2>Your Assets</h2>
              
              <div className="asset-row">
                <div className="asset-info">
                  <div className="asset-logo">💵</div>
                  <div>
                    <div style={{ fontWeight: 500 }}>USDC</div>
                    <div style={{ fontSize: "0.85rem", color: "#a3a3a3" }}>Cash</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600 }}>${balances.USDC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div style={{ fontSize: "0.85rem", color: "#a3a3a3" }}>{balances.USDC.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC</div>
                </div>
              </div>

              {ASSETS.map(asset => {
                const bal = balances[asset.id];
                if (bal <= 0) return null;
                return (
                  <div className="asset-row" key={asset.id}>
                    <div className="asset-info">
                      <div className="asset-logo">{asset.icon}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{asset.symbol}</div>
                        <div style={{ fontSize: "0.85rem", color: "#a3a3a3" }}>{asset.name}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 600 }}>${(bal * asset.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div style={{ fontSize: "0.85rem", color: "#a3a3a3" }}>{bal.toLocaleString(undefined, { maximumFractionDigits: 4 })} {asset.symbol}</div>
                    </div>
                  </div>
                )
              })}

              {Object.keys(collateral).some(k => collateral[k] > 0) && (
                <div className="asset-row" style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
                  <div className="asset-info">
                    <div className="asset-logo" style={{ background: "transparent", border: "1px solid var(--accent-color)" }}>🔒</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>Locked Collateral</div>
                      <div style={{ fontSize: "0.85rem", color: "#a3a3a3" }}>Against ${debtUSDC.toLocaleString()} Debt</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600 }}>
                      ${Object.keys(collateral).reduce((acc, k) => acc + (collateral[k] * (ASSETS.find(a => a.id === k)?.price || 0)), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "borrow" && (
          <div className="dashboard-grid">
            <div className="action-card" style={{ gridColumn: "1 / -1", maxWidth: "600px", margin: "0 auto", width: "100%" }}>
              <h2>Borrow against Assets</h2>
              <p style={{ color: "#a3a3a3", marginBottom: "2rem" }}>Deposit your xStocks or Ondo USY to borrow USDC.</p>
              
              <form onSubmit={handleBorrow}>
                <div className="form-group">
                  <label>Select Collateral</label>
                  <select 
                    value={collateralAsset} 
                    onChange={(e) => setCollateralAsset(e.target.value)}
                    style={{ width: "100%", padding: "1rem", background: "var(--input-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontFamily: "inherit" }}
                  >
                    {ASSETS.map(a => (
                      <option value={a.id} key={a.id}>{a.symbol} (Available: {balances[a.id].toFixed(2)})</option>
                    ))}
                  </select>
                  <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>
                    Note: For demo purposes, all available balance of the selected asset will be deposited as collateral.
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Amount to Borrow (USDC)</label>
                  <input 
                    type="number" 
                    value={borrowAmount} 
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    required
                  />
                  <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>
                    Max Borrow: ${((balances[collateralAsset] * (ASSETS.find(a => a.id === collateralAsset)?.price || 0)) / 2).toLocaleString(undefined, { maximumFractionDigits: 2 })} (50% LTV)
                  </div>
                </div>

                <button type="submit" className="submit-btn" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 10px 20px -10px rgba(245, 158, 11, 0.3)" }}>
                  Deposit & Borrow
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "deploy" && (
          <div className="dashboard-grid">
            <div className="action-card" style={{ gridColumn: "1 / -1", maxWidth: "600px", margin: "0 auto", width: "100%" }}>
              <h2>Delta Neutral Strategy</h2>
              <p style={{ color: "#a3a3a3", marginBottom: "2rem" }}>Deploy your USDC into an automated yield strategy on Kamino earning ~15% APY.</p>
              
              <div style={{ padding: "1.5rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "12px", marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#10b981", fontWeight: 600 }}>Expected APY</span>
                  <span style={{ color: "#10b981", fontWeight: 600 }}>15.4%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#a3a3a3" }}>
                  <span>Risk Level</span>
                  <span>Low (Delta Neutral)</span>
                </div>
              </div>

              <form onSubmit={handleDeploy}>
                <div className="form-group">
                  <label>Amount to Deploy (USDC)</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type="number" 
                      value={deployAmount} 
                      onChange={(e) => setDeployAmount(e.target.value)}
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      max={balances.USDC}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setDeployAmount(balances.USDC.toString())}
                      style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "var(--accent-color)", cursor: "pointer", fontWeight: 600 }}
                    >
                      MAX
                    </button>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>Available: {balances.USDC.toLocaleString()} USDC</div>
                </div>

                <button type="submit" className="submit-btn" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 10px 20px -10px rgba(16, 185, 129, 0.3)" }}>
                  Deploy Capital
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
      
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
      
      <div style={{ position: "fixed", bottom: "2rem", left: "2rem", zIndex: 100 }}>
        <Link href="/" className="btn-outline" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}>
          ← Back to Landing
        </Link>
      </div>
    </>
  );
}
