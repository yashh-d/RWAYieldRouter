/**
 * Top 10 xStocks for MVP launch.
 *
 * Mints sourced from xStocks Alliance + Backed Finance public docs.
 * Verify each mint against https://docs.xstocks.fi/ before going to mainnet —
 * tokens use Token-2022 (TOKEN_2022_PROGRAM_ID), not classic SPL.
 *
 * `kaminoReserve` is filled in by `npm run bootstrap` which queries
 * GET /v2/kamino-market to find each mint's reserve address.
 */

export interface XStock {
  symbol: string;        // ticker shown to user, e.g. "AAPL"
  xSymbol: string;       // on-chain ticker, e.g. "AAPLx"
  name: string;          // company name
  mint: string;          // SPL token mint address (Token-2022)
  decimals: number;      // typically 8 for xStocks
  kaminoReserve?: string; // populated by bootstrap script
}

export const XSTOCKS: XStock[] = [
  {
    symbol: "AAPL",
    xSymbol: "AAPLx",
    name: "Apple Inc.",
    mint: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
    decimals: 8,
  },
  {
    symbol: "TSLA",
    xSymbol: "TSLAx",
    name: "Tesla Inc.",
    mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
    decimals: 8,
  },
  {
    symbol: "NVDA",
    xSymbol: "NVDAx",
    name: "NVIDIA Corporation",
    mint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LYrGDHcUJqRMV5K",
    decimals: 8,
  },
  {
    symbol: "SPY",
    xSymbol: "SPYx",
    name: "SPDR S&P 500 ETF",
    mint: "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
    decimals: 8,
  },
  {
    symbol: "MSTR",
    xSymbol: "MSTRx",
    name: "MicroStrategy",
    mint: "XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ",
    decimals: 8,
  },
  {
    symbol: "GOOGL",
    xSymbol: "GOOGLx",
    name: "Alphabet Inc.",
    mint: "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN",
    decimals: 8,
  },
  {
    symbol: "META",
    xSymbol: "METAx",
    name: "Meta Platforms",
    mint: "Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu",
    decimals: 8,
  },
  {
    symbol: "COIN",
    xSymbol: "COINx",
    name: "Coinbase Global",
    mint: "Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu",
    decimals: 8,
  },
  {
    symbol: "QQQ",
    xSymbol: "QQQx",
    name: "Invesco QQQ ETF",
    mint: "Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ",
    decimals: 8,
  },
  {
    symbol: "CRCL",
    xSymbol: "CRCLx",
    name: "Circle Internet Group",
    mint: "XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1",
    decimals: 8,
  },
];

// USDC mainnet
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const USDC_DECIMALS = 6;

export function getXStock(symbol: string): XStock | undefined {
  return XSTOCKS.find(
    (s) => s.symbol === symbol || s.xSymbol === symbol
  );
}

export function getXStockByMint(mint: string): XStock | undefined {
  return XSTOCKS.find((s) => s.mint === mint);
}
