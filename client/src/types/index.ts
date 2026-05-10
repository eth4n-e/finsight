export interface Stock {
  ticker: string
  name: string
  price: number
  change: number
  changePct: number
  volume: number
  marketCap?: number
}

export interface OHLCV {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface WatchlistItem {
  id: string
  ticker: string
  addedAt: string
}

export interface TickerSearchResult {
  ticker: string
  name: string
  exchange: string
  type: string
}

export interface PortfolioPosition {
  id: string
  ticker: string
  shares: number
  purchasePrice: number
  purchaseDate: string
  currentPrice?: number
}

export interface LibraryTopic {
  id: string
  title: string
  description: string
  category: string
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y'
