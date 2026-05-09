const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)
  return res.json()
}

export const api = {
  // Watchlist
  getWatchlist: () => request('/api/watchlist'),
  addToWatchlist: (ticker: string) =>
    request('/api/watchlist', { method: 'POST', body: JSON.stringify({ ticker }) }),
  removeFromWatchlist: (ticker: string) =>
    request(`/api/watchlist/${ticker}`, { method: 'DELETE' }),

  // Stocks
  getQuote: (ticker: string) => request(`/api/stocks/${ticker}/quote`),
  getHistory: (ticker: string, range: string) =>
    request(`/api/stocks/${ticker}/history?range=${range}`),
  searchTickers: (query: string) =>
    request(`/api/stocks/search?q=${encodeURIComponent(query)}`),

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
