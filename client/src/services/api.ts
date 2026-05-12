import type { OHLCV, StockAnalysis, StockDto, TickerSearchResult, WatchlistItem } from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)

  if (res.status === 204) {
    return undefined as T
  }

  return res.json()
}

export const api = {
  // Watchlist
  getWatchlist: () => request<WatchlistItem[]>('/api/watchlist'),
  addToWatchlist: (stock: StockDto) =>
    request('/api/watchlist', { method: 'POST', body: JSON.stringify({ ticker: stock.ticker, name: stock.name }) }),
  removeFromWatchlist: (ticker: string) =>
    request<void>(`/api/watchlist/${ticker}`, { method: 'DELETE' }),

  // Stocks
  getQuote: (ticker: string) => request(`/api/stocks/${ticker}/quote`),
  getHistory: (ticker: string, range: string) =>
    request<OHLCV[]>(
      `/api/stocks/${encodeURIComponent(ticker)}/history?range=${encodeURIComponent(range)}`,
    ),
  getAnalysis: (ticker: string, range: string) => 
    request<StockAnalysis>(
      `/api/stocks/${encodeURIComponent(ticker)}/analysis?range=${encodeURIComponent(range)}`
    ),
  // TODO: add a method to also search for a ticker by name - leverage both in useTickerSearch hook
  searchTickers: (ticker: string) =>
    request<TickerSearchResult[]>(`/api/stocks/search?ticker=${encodeURIComponent(ticker.toUpperCase())}`),

  // Simulator
  getPortfolio: () => request('/api/simulator/portfolio'),
  buyStock: (ticker: string, shares: number) =>
    request('/api/simulator/buy', { method: 'POST', body: JSON.stringify({ ticker, shares }) }),
  sellStock: (ticker: string, shares: number) =>
    request('/api/simulator/sell', { method: 'POST', body: JSON.stringify({ ticker, shares }) }),

  // Library
  getTopics: () => request('/api/library/topics'),
  streamExplanation: (topicId: string): EventSource =>
    new EventSource(`${BASE_URL}/api/library/explain/${topicId}`),
}
