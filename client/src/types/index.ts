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
  name: string
  addedAt: string
}

export interface StockDto {
  ticker: string
  name: string
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

export type StockAnalysis = string
export type LibraryViewMode = 'chat' | 'files' | 'reader'
export type LibraryGraphMode = 'files' | 'graph'

export interface LibraryNoteSummary {
  id: string
  topicId: string
  title: string
  excerpt: string
  createdAt: string
  readTime: string
  tags: string[]
  body: string
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | '2Y' | '5Y'

export const TIME_RANGES: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y', '2Y', '5Y']
