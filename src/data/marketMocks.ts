export type IndexQuote = {
  id: string; // stable id for React keys
  name: string; // e.g., "NIFTY 50"
  symbol: string; // e.g., "^NSEI"
  last: number; // current/last price
  change: number; // absolute change
  percent: number; // 0.0..1.0 for 100% or typical 0..100? We use percent points (e.g., -0.84 -> -0.84%)
};

export type TopMover = {
  symbol: string;
  name?: string;
  price: number;
  percent: number; // percent points, e.g., 3.45 -> 3.45%
};

export type MoversData = {
  gainers: TopMover[];
  losers: TopMover[];
};

// PUBLIC_INTERFACE
export function getMockIndices(): IndexQuote[] {
  /** Returns mock quotes for key Indian indices with deterministic values for UI. */
  return [
    { id: "nifty50", name: "NIFTY 50", symbol: "NIFTY50", last: 21450.35, change: -180.25, percent: -0.83 },
    { id: "sensex", name: "SENSEX", symbol: "SENSEX", last: 71325.12, change: 210.5, percent: 0.30 },
    { id: "banknifty", name: "Bank Nifty", symbol: "BANKNIFTY", last: 45210.8, change: -95.7, percent: -0.21 },
  ];
}

// PUBLIC_INTERFACE
export function getMockMovers(): MoversData {
  /** Returns mock lists for top gainers and losers for dashboard placeholders. */
  return {
    gainers: [
      { symbol: "TCS", name: "Tata Consultancy", price: 3865.3, percent: 2.45 },
      { symbol: "INFY", name: "Infosys", price: 1542.8, percent: 1.92 },
      { symbol: "SBIN", name: "SBI", price: 622.35, percent: 1.51 },
      { symbol: "RELIANCE", name: "Reliance", price: 2521.0, percent: 1.27 },
      { symbol: "HDFCBANK", name: "HDFC Bank", price: 1531.9, percent: 1.03 },
    ],
    losers: [
      { symbol: "ITC", name: "ITC", price: 445.6, percent: -2.12 },
      { symbol: "ADANIENT", name: "Adani Ent.", price: 2723.5, percent: -1.95 },
      { symbol: "WIPRO", name: "Wipro", price: 449.2, percent: -1.72 },
      { symbol: "HCLTECH", name: "HCL Tech", price: 1420.1, percent: -1.28 },
      { symbol: "KOTAKBANK", name: "Kotak Bank", price: 1730.7, percent: -1.02 },
    ],
  };
}
