const BASE = 'https://api.polygon.io'
const KEY = () => process.env.POLYGON_API_KEY!

async function massiveFetch<T>(path: string): Promise<T> {
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}apiKey=${KEY()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Massive API error ${res.status}: ${path}`)
  return res.json()
}

export const massive = {
  getQuote: (ticker: string) =>
    massiveFetch(`/v2/last/trade/${ticker.toUpperCase()}`),

  getAggregates: (ticker: string, from: string, to: string, multiplier = 1, timespan = 'day') =>
    massiveFetch(
      `/v2/aggs/ticker/${ticker.toUpperCase()}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=365`
    ),

  getSnapshot: (ticker: string) =>
    massiveFetch(`/v2/snapshot/locale/us/markets/stocks/tickers/${ticker.toUpperCase()}`),

  searchTickers: (query: string) =>
    massiveFetch(`/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&limit=10`),

  getTickerDetails: (ticker: string) =>
    massiveFetch(`/v3/reference/tickers/${ticker.toUpperCase()}`),
}
