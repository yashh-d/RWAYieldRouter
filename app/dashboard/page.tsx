"use client";

import { useState, useMemo, Fragment } from "react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft, Info } from "lucide-react";

type Tab = "portfolio" | "buy" | "deploy";

const ASSETS = [
  { id: "TSLAx", symbol: "TSLAx", name: "Tokenized Tesla", price: 175.25, change: "+2.19%", changeAmount: "+$3.75", supply: "$5.23M", volume: "$1.12M", icon: "🚗" },
  { id: "SPYx", symbol: "SPYx", name: "Tokenized S&P 500", price: 512.40, change: "+0.16%", changeAmount: "+$0.82", supply: "$5.16M", volume: "$2.34M", icon: "📈" },
  { id: "QQQx", symbol: "QQQx", name: "Tokenized Nasdaq", price: 438.15, change: "+0.08%", changeAmount: "+$0.35", supply: "$3.27M", volume: "$950K", icon: "📊" },
  { id: "AAPLx", symbol: "AAPLx", name: "Tokenized Apple", price: 168.30, change: "-0.45%", changeAmount: "-$0.76", supply: "$8.45M", volume: "$3.41M", icon: "🍎" },
  { id: "ONDO_USY", symbol: "ONDO_USY", name: "Ondo USY", price: 1.00, change: "+0.01%", changeAmount: "+$0.01", supply: "$25.1M", volume: "$12.5M", icon: "💵" },
];

const generateMockChartData = (basePrice: number) => {
  const data = [];
  let currentPrice = basePrice * 0.95; // start 5% lower for an upward trend demo
  for (let i = 0; i < 30; i++) {
    currentPrice = currentPrice + (Math.random() - 0.4) * (basePrice * 0.02);
    data.push({
      time: `${30 - i}d ago`,
      price: Number(currentPrice.toFixed(2))
    });
  }
  data.push({ time: 'Now', price: basePrice });
  return data;
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p style={{ color: "#8b949e", fontSize: "0.85rem", marginBottom: "0.25rem" }}>{payload[0].payload.time}</p>
        <p style={{ color: "white", fontWeight: 600, fontSize: "1.1rem" }}>${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("buy");
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
  const [deployedJupiter, setDeployedJupiter] = useState(0);
  const [deployedKamino, setDeployedKamino] = useState(0);
  const [deployedMorpho, setDeployedMorpho] = useState(0);

  // Advanced Trading View State
  const [tradeAsset, setTradeAsset] = useState<string | null>(null);
  const [tradeSegment, setTradeSegment] = useState<"buy" | "sell">("buy");
  const [tradeTimeframe, setTradeTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "ALL">("1D");
  const [tradeAmount, setTradeAmount] = useState("");

  // Borrow/Deploy States
  const [marketInput, setMarketInput] = useState("");
  const [expandedMarketRow, setExpandedMarketRow] = useState<string | null>(null);

  const MARKET_DATA = [
    { id: "TSLAx", icon: "🚗", symbol: "TSLAx", totalSup: "$5.45M", totalBor: "$2.68K", ltv: "65%", supApy: "0.00%", borApy: "3.81%", supTokenApy: "+2.21%" },
    { id: "SPYx", icon: "📈", symbol: "SPYx", totalSup: "$5.21M", totalBor: "$235.84K", ltv: "75%", supApy: "0.16%", borApy: "3.92%", supTokenApy: "+2.21%" },
    { id: "QQQx", icon: "📊", symbol: "QQQx", totalSup: "$3.25M", totalBor: "$74.75K", ltv: "72%", supApy: "0.08%", borApy: "3.87%", supTokenApy: "+2.21%" },
    { id: "NVDAx", icon: "🟩", symbol: "NVDAx", totalSup: "$3.09M", totalBor: "$10.65K", ltv: "65%", supApy: "0.01%", borApy: "3.82%", supTokenApy: "+2.21%" },
    { id: "GOOGLx", icon: "🔍", symbol: "GOOGLx", totalSup: "$2.01M", totalBor: "$0.00", ltv: "70%", supApy: "0.00%", borApy: "-", supTokenApy: "+2.21%" },
    { id: "MSTRx", icon: "💰", symbol: "MSTRx", totalSup: "$1.83M", totalBor: "$0.00", ltv: "40%", supApy: "0.00%", borApy: "-", supTokenApy: "+2.21%" },
    { id: "AAPLx", icon: "🍎", symbol: "AAPLx", totalSup: "$206.31K", totalBor: "$0.00", ltv: "50%", supApy: "-", borApy: "-", supTokenApy: "" },
    { id: "ONDO_USY", icon: "💵", symbol: "ONDO_USY", totalSup: "$59.18K", totalBor: "$0.00", ltv: "40%", supApy: "-", borApy: "-", supTokenApy: "" },
    { id: "USDC", icon: "💲", symbol: "USDC", totalSup: "$6.11M", totalBor: "$4.87M", ltv: "90%", supApy: "3.46%", borApy: "4.86%", supTokenApy: "+2.21%" },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeAsset) return;
    
    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) return;

    const assetDetails = ASSETS.find(a => a.id === tradeAsset);
    if (!assetDetails) return;

    if (tradeSegment === "buy") {
      if (amount > balances.USDC) return;
      setBalances(prev => ({
        ...prev,
        USDC: prev.USDC - amount,
        [tradeAsset]: prev[tradeAsset] + (amount / assetDetails.price),
      }));
      showToast(`Successfully bought ${assetDetails.symbol}!`);
    } else {
      // Sell logic
      if (amount > balances[tradeAsset]) return;
      setBalances(prev => ({
        ...prev,
        [tradeAsset]: prev[tradeAsset] - amount,
        USDC: prev.USDC + (amount * assetDetails.price),
      }));
      showToast(`Successfully sold ${assetDetails.symbol}!`);
    }
    
    setTradeAmount("");
  };

  const handleMarketAction = (action: "supply" | "borrow", assetId: string) => {
    const amount = parseFloat(marketInput);
    if (isNaN(amount) || amount <= 0) return;

    if (action === "supply") {
       if (assetId === "USDC") {
         if (amount > balances.USDC) { showToast("Insufficient balance!"); return; }
         setBalances(prev => ({ ...prev, USDC: prev.USDC - amount }));
         setDeployedJupiter(prev => prev + amount); // we map USDC supply to generic yield
       } else {
         if (amount > (balances[assetId] || 0)) { showToast("Insufficient balance!"); return; }
         setBalances(prev => ({ ...prev, [assetId]: prev[assetId] - amount }));
         setCollateral(prev => ({ ...prev, [assetId]: (prev[assetId] || 0) + amount }));
       }
       showToast(`Successfully supplied ${amount} ${assetId}!`);
    } else if (action === "borrow") {
       if (assetId === "USDC") {
         setBalances(prev => ({ ...prev, USDC: prev.USDC + amount }));
         setDebtUSDC(prev => prev + amount);
       } else {
         setBalances(prev => ({ ...prev, [assetId]: (prev[assetId] || 0) + amount }));
         setDebtUSDC(prev => prev + amount * (ASSETS.find(a => a.id === assetId)?.price || 1));
       }
       showToast(`Successfully borrowed ${amount} ${assetId}!`);
    }
    setMarketInput("");
    setExpandedMarketRow(null);
  };

  const calculateTotalValue = () => {
    let total = balances.USDC + deployedJupiter + deployedKamino + deployedMorpho - debtUSDC;
    for (const asset of ASSETS) {
      total += (balances[asset.id] + collateral[asset.id]) * asset.price;
    }
    return total;
  };

  // Generate chart data only when tradeAsset changes to prevent weird re-renders
  const chartData = useMemo(() => {
    if (!tradeAsset) return [];
    const assetDetails = ASSETS.find(a => a.id === tradeAsset);
    return assetDetails ? generateMockChartData(assetDetails.price) : [];
  }, [tradeAsset, tradeTimeframe]); // Added timeframe just to show it triggers a re-render

  const selectedAssetDetails = tradeAsset ? ASSETS.find(a => a.id === tradeAsset) : null;
  const isPositiveChange = selectedAssetDetails?.change.startsWith("+");
  const chartColor = isPositiveChange ? "#10b981" : "#ef4444";

  return (
    <>
      <div className="bg-mesh"></div>
      <main className="dashboard-layout">
        <header className="dashboard-header" style={{ marginBottom: tradeAsset ? "1rem" : "2rem" }}>
          <h1>xStocks &amp; Ondo <span style={{ color: "var(--accent-color)", fontSize: "1rem", verticalAlign: "middle", marginLeft: "1rem" }}>Simulated Env</span></h1>
          {!tradeAsset && (
            <nav className="dashboard-nav">
              <button className={`tab-btn ${activeTab === "portfolio" ? "active" : ""}`} onClick={() => setActiveTab("portfolio")}>Portfolio</button>
              <button className={`tab-btn ${activeTab === "buy" ? "active" : ""}`} onClick={() => setActiveTab("buy")}>Trade</button>
              <button className={`tab-btn ${activeTab === "deploy" ? "active" : ""}`} onClick={() => setActiveTab("deploy")}>Lend &amp; Borrow</button>
            </nav>
          )}
        </header>

        {tradeAsset && selectedAssetDetails ? (
          <div style={{ animation: "fade-in 0.3s ease-out" }}>
            <button 
              onClick={() => setTradeAsset(null)}
              style={{ background: "transparent", border: "none", color: "#8b949e", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600, padding: 0, marginBottom: "1.5rem", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "white"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#8b949e"}
            >
              <ArrowLeft size={16} /> Back to Markets
            </button>

            <div className="trade-layout">
              <div className="trade-main">
                <div className="trade-header">
                  <div>
                    <h2 style={{ fontSize: "2rem", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {selectedAssetDetails.icon} {selectedAssetDetails.symbol}
                    </h2>
                    <p style={{ color: "#8b949e", fontSize: "1.1rem" }}>{selectedAssetDetails.name}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "white", lineHeight: 1.1 }}>
                      ${selectedAssetDetails.price.toFixed(2)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "flex-end", color: chartColor, fontWeight: 600, marginTop: "0.25rem" }}>
                      {selectedAssetDetails.changeAmount} ({selectedAssetDetails.change}) <span style={{ color: "#8b949e", fontSize: "0.85rem", fontWeight: 400 }}>Today</span>
                    </div>
                  </div>
                </div>

                <div className="timeframe-selector">
                  {["1D", "1W", "1M", "3M", "ALL"].map(tf => (
                    <button 
                      key={tf} 
                      className={`timeframe-btn ${tradeTimeframe === tf ? "active" : ""}`}
                      onClick={() => setTradeTimeframe(tf as any)}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, strokeDasharray: "4 4" }} />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={chartColor} 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="trade-panel">
                <div className="segment-control">
                  <button 
                    className={`segment-btn ${tradeSegment === "buy" ? "active buy" : ""}`}
                    onClick={() => { setTradeSegment("buy"); setTradeAmount(""); }}
                  >
                    Buy
                  </button>
                  <button 
                    className={`segment-btn ${tradeSegment === "sell" ? "active sell" : ""}`}
                    onClick={() => { setTradeSegment("sell"); setTradeAmount(""); }}
                  >
                    Sell
                  </button>
                </div>

                <div className="trade-input-group">
                  <label style={{ fontSize: "0.85rem", color: "#8b949e", fontWeight: 600 }}>Amount ({tradeSegment === "buy" ? "USDC" : selectedAssetDetails.symbol})</label>
                  <div className="trade-input-wrapper">
                    <input 
                      type="number"
                      className="trade-input"
                      placeholder="0.00"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                    <button 
                      className="trade-max-btn"
                      onClick={() => setTradeAmount(tradeSegment === "buy" ? balances.USDC.toString() : balances[tradeAsset].toString())}
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div className="trade-summary-row">
                    <span>Available</span>
                    <span style={{ color: "white", fontWeight: 600 }}>
                      {tradeSegment === "buy" ? `${balances.USDC.toLocaleString(undefined, {maximumFractionDigits: 2})} USDC` : `${balances[tradeAsset].toLocaleString(undefined, {maximumFractionDigits: 4})} ${selectedAssetDetails.symbol}`}
                    </span>
                  </div>
                  <div className="trade-summary-row">
                    <span>Oracle Price</span>
                    <span style={{ color: "white" }}>${selectedAssetDetails.price.toFixed(2)}</span>
                  </div>
                  <div className="trade-summary-row">
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>Network Fee <Info size={12} /></span>
                    <span style={{ color: "#10b981" }}>Free</span>
                  </div>
                  <div className="trade-summary-row" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                    <span style={{ color: "white", fontWeight: 600 }}>You will {tradeSegment === "buy" ? "receive" : "get"}</span>
                    <span style={{ color: "white", fontWeight: 600, fontSize: "1rem" }}>
                      {tradeAmount 
                        ? tradeSegment === "buy" 
                            ? `${(parseFloat(tradeAmount) / selectedAssetDetails.price).toFixed(4)} ${selectedAssetDetails.symbol}` 
                            : `${(parseFloat(tradeAmount) * selectedAssetDetails.price).toFixed(2)} USDC`
                        : "0.00"}
                    </span>
                  </div>
                </div>

                <button 
                  className={`trade-execute-btn ${tradeSegment}`}
                  onClick={handleExecuteTrade}
                  disabled={!tradeAmount || parseFloat(tradeAmount) <= 0 || (tradeSegment === "buy" ? parseFloat(tradeAmount) > balances.USDC : parseFloat(tradeAmount) > balances[tradeAsset])}
                  style={{ opacity: (!tradeAmount || parseFloat(tradeAmount) <= 0 || (tradeSegment === "buy" ? parseFloat(tradeAmount) > balances.USDC : parseFloat(tradeAmount) > balances[tradeAsset])) ? 0.5 : 1 }}
                >
                  {tradeSegment === "buy" ? `Buy ${selectedAssetDetails.symbol}` : `Sell ${selectedAssetDetails.symbol}`}
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === "buy" && (
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
                <div 
                  className="defi-table-row" 
                  key={asset.id} 
                  style={{ cursor: "pointer" }} 
                  onClick={() => setTradeAsset(asset.id)}
                >
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
                      onClick={(e) => { e.stopPropagation(); setTradeAsset(asset.id); }}
                    >
                      Trade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keeping Portfolio, Borrow, Deploy logic similarly structured but unchanged for brevity, unless needed. */}
        {activeTab === "portfolio" && !tradeAsset && (
          <div className="dashboard-grid">
            <div className="stat-card">
              <h3>Total Net Worth</h3>
              <div className="value">${calculateTotalValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="stat-card">
              <h3>Yield Generating</h3>
              <div className="value">${(deployedJupiter + deployedKamino + deployedMorpho).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
              
              {deployedJupiter > 0 && (
                <div className="asset-row">
                  <div className="asset-info">
                    <div className="asset-logo" style={{ background: "#14F195", color: "black", border: "none" }}>J</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>Jupiter Earn</div>
                      <div style={{ fontSize: "0.85rem", color: "#10b981" }}>8.5% APY</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600 }}>${deployedJupiter.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: "0.85rem", color: "#a3a3a3" }}>{deployedJupiter.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC</div>
                  </div>
                </div>
              )}
              {deployedKamino > 0 && (
                <div className="asset-row">
                  <div className="asset-info">
                    <div className="asset-logo" style={{ background: "#f59e0b", color: "white", border: "none" }}>K</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>Kamino Earn</div>
                      <div style={{ fontSize: "0.85rem", color: "#10b981" }}>10.2% APY</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600 }}>${deployedKamino.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: "0.85rem", color: "#a3a3a3" }}>{deployedKamino.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC</div>
                  </div>
                </div>
              )}
              {deployedMorpho > 0 && (
                <div className="asset-row">
                  <div className="asset-info">
                    <div className="asset-logo" style={{ background: "#3b82f6", color: "white", border: "none" }}>M</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>Morpho Vaults</div>
                      <div style={{ fontSize: "0.85rem", color: "#10b981" }}>9.4% APY</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600 }}>${deployedMorpho.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: "0.85rem", color: "#a3a3a3" }}>{deployedMorpho.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC</div>
                  </div>
                </div>
              )}

              {ASSETS.map(asset => {
                const bal = balances[asset.id];
                if (bal <= 0) return null;
                return (
                  <div className="asset-row" key={asset.id} onClick={() => setTradeAsset(asset.id)} style={{ cursor: "pointer" }}>
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

        {activeTab === "deploy" && !tradeAsset && (
          <div className="action-card" style={{ gridColumn: "1 / -1", padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ background: "var(--accent-color)", color: "black", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem" }}>x</div>
                <h2 style={{ margin: 0, fontSize: "1.25rem" }}>xStocks Market</h2>
                <span style={{ fontSize: "0.85rem", color: "var(--accent-color)", background: "rgba(20,241,149,0.1)", padding: "0.25rem 0.5rem", borderRadius: "4px", cursor: "pointer" }}>What are xStocks?</span>
              </div>
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "#a3a3a3", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ padding: "0.25rem 0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                   Collateral <span style={{ color: "white" }}>TSLAx +8</span>
                </div>
                <div style={{ padding: "0.25rem 0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                   Debt <span style={{ color: "white" }}>USDC +1</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.75rem" }}>
                   Borrow APY <span style={{ color: "#f59e0b", fontWeight: 600 }}>4.86%</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.75rem" }}>
                   Market Size <span style={{ color: "white", fontWeight: 600 }}>$27.63M</span>
                </div>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#8b949e", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>Asset</th>
                    <th style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>Total Supply</th>
                    <th style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>Total Borrow</th>
                    <th style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>Liq LTV</th>
                    <th style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>Supply APY</th>
                    <th style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>Borrow APY</th>
                    <th style={{ padding: "1rem 1.5rem", fontWeight: 500 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {MARKET_DATA.map((row) => (
                    <Fragment key={row.id}>
                      <tr 
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s", cursor: "pointer", background: expandedMarketRow === row.id ? "rgba(255,255,255,0.02)" : "transparent" }}
                        onClick={() => setExpandedMarketRow(expandedMarketRow === row.id ? null : row.id)}
                      >
                        <td style={{ padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", fontWeight: 500 }}>
                          <span style={{ fontSize: "1.25rem" }}>{row.icon}</span> {row.symbol}
                        </td>
                        <td style={{ padding: "1rem 1.5rem", borderBottom: "1px dashed rgba(255,255,255,0.2)", display: "table-cell" }}>{row.totalSup}</td>
                        <td style={{ padding: "1rem 1.5rem" }}>{row.totalBor}</td>
                        <td style={{ padding: "1rem 1.5rem" }}>{row.ltv}</td>
                        <td style={{ padding: "1rem 1.5rem" }}>
                          {row.supApy !== "-" ? (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ color: "var(--accent-color)" }}>{row.supApy}</span>
                              {row.supTokenApy && <span style={{ fontSize: "0.75rem", color: "#3b82f6" }}>{row.supTokenApy} JUP</span>}
                            </div>
                          ) : (
                            <span style={{ color: "#a3a3a3" }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: "1rem 1.5rem" }}>
                          {row.borApy !== "-" ? (
                            <span style={{ color: "#f59e0b" }}>{row.borApy}</span>
                          ) : (
                            <span style={{ color: "#a3a3a3" }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: "1rem 1.5rem", textAlign: "right", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button 
                            className="tab-btn" 
                            style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                            onClick={(e) => { e.stopPropagation(); setExpandedMarketRow(row.id); }}
                          >
                            Supply
                          </button>
                          <button 
                            className="tab-btn" 
                            style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                            onClick={(e) => { e.stopPropagation(); setExpandedMarketRow(row.id); }}
                          >
                            Borrow
                          </button>
                        </td>
                      </tr>
                      {expandedMarketRow === row.id && (
                        <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td colSpan={7} style={{ padding: "2rem 1.5rem" }}>
                            <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                              <div style={{ flex: "1 1 300px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                  <h4 style={{ margin: 0, color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span style={{ fontSize: "1.2rem" }}>↓</span> Supply {row.symbol}
                                  </h4>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                                  <input 
                                    type="number" 
                                    placeholder="Amount" 
                                    value={marketInput}
                                    onChange={(e) => setMarketInput(e.target.value)}
                                    style={{ flex: 1, padding: "0.75rem", background: "var(--input-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }}
                                  />
                                  <button 
                                    style={{ padding: "0.75rem 1.5rem", background: "var(--accent-color)", color: "black", fontWeight: 600, borderRadius: "8px", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                                    onClick={() => handleMarketAction("supply", row.id)}
                                  >
                                    Sign &amp; Supply
                                  </button>
                                </div>
                                <div style={{ fontSize: "0.85rem", color: "#a3a3a3", display: "flex", justifyContent: "space-between" }}>
                                  <span>Available to supply</span>
                                  <span style={{ color: "white", cursor: "pointer" }} onClick={() => setMarketInput(row.id === "USDC" ? balances.USDC.toString() : (balances[row.id] || 0).toString())}>
                                    {row.id === "USDC" ? balances.USDC.toLocaleString() : balances[row.id]?.toLocaleString() || 0} {row.symbol}
                                  </span>
                                </div>
                              </div>
                              <div style={{ width: "1px", background: "rgba(255,255,255,0.1)", alignSelf: "stretch", display: "block" }} className="hide-mobile"></div>
                              <div style={{ flex: "1 1 300px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                  <h4 style={{ margin: 0, color: "#f59e0b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span style={{ fontSize: "1.2rem" }}>↑</span> Borrow {row.symbol}
                                  </h4>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                                  <input 
                                    type="number" 
                                    placeholder="Amount" 
                                    style={{ flex: 1, padding: "0.75rem", background: "var(--input-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }}
                                    value={marketInput}
                                    onChange={(e) => setMarketInput(e.target.value)}
                                    disabled={row.borApy === "-"}
                                  />
                                  <button 
                                    style={{ padding: "0.75rem 1.5rem", background: "#f59e0b", color: "white", fontWeight: 600, borderRadius: "8px", border: "none", cursor: row.borApy === "-" ? "not-allowed" : "pointer", opacity: row.borApy === "-" ? 0.5 : 1, whiteSpace: "nowrap" }}
                                    onClick={() => handleMarketAction("borrow", row.id)}
                                    disabled={row.borApy === "-"}
                                  >
                                    Sign &amp; Borrow
                                  </button>
                                </div>
                                <div style={{ fontSize: "0.85rem", color: "#a3a3a3", display: "flex", justifyContent: "space-between" }}>
                                  {row.borApy === "-" ? (
                                    <span style={{ color: "#ef4444" }}>Borrowing not supported for this asset.</span>
                                  ) : (
                                    <>
                                      <span>Available to borrow</span>
                                      <span style={{ color: "white" }}>- {row.symbol}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
      
      {!tradeAsset && (
        <div style={{ position: "fixed", bottom: "2rem", left: "2rem", zIndex: 100 }}>
          <Link href="/" className="btn-outline" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}>
            ← Back to Landing
          </Link>
        </div>
      )}
    </>
  );
}
