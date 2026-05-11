// ---------------------------------------------------------------------------
// Normalised types — these are what the rest of the codebase sees.
// Routes and the simulator never touch yahoo-finance2 types directly.
// ---------------------------------------------------------------------------

export interface QuoteResult {
  ticker: string
  name: string
  price: number
  open: number
  high: number
  low: number
  previousClose: number
  change: number
  changePct: number
  volume: number
  marketCap?: number
  currency: string
}

export interface OHLCVBar {
  timestamp: number   // Unix ms
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface SearchResult {
  ticker: string
  name: string
  exchange: string
  type: string
}
