import YahooFinance from 'yahoo-finance2'
import { chartQuotesToOHLCV } from '../utils/transforms.js'
import { isHistoryRange, resolveChartWindow, type HistoryRange } from '../utils/historyRange.js'
import type { 
  QuoteResult, 
  OHLCVBar, 
  SearchResult 
} from '../types/yahooFinance.js'

const yahoo = new YahooFinance({
    suppressNotices: ["yahooSurvey"],
});


// ---------------------------------------------------------------------------
// Public interface — same shape the rest of the app expects
// ---------------------------------------------------------------------------

export const market = {
  /**
   * Current quote for a single ticker.
   * Used by: stocks/:ticker/quote, simulator buy/sell
   */
  async getQuote(ticker: string): Promise<QuoteResult> {
    console.log("getQuote ticker --chk: ", ticker);
    const q = await yahoo.quote(ticker.toUpperCase())
    console.log("Q --chk: ", q);
    return {
      ticker:        q.symbol,
      name:          q.longName ?? q.shortName ?? ticker,
      price:         q.regularMarketPrice        ?? 0,
      open:          q.regularMarketOpen         ?? 0,
      high:          q.regularMarketDayHigh      ?? 0,
      low:           q.regularMarketDayLow       ?? 0,
      previousClose: q.regularMarketPreviousClose ?? 0,
      change:        q.regularMarketChange       ?? 0,
      changePct:     q.regularMarketChangePercent ?? 0,
      volume:        q.regularMarketVolume       ?? 0,
      marketCap:     q.marketCap,
      currency:      q.currency                  ?? 'USD',
    }
  },

  /**
   * OHLCV history for a UI range preset (uses Yahoo `chart` for intraday + daily).
   * Used by: stocks/:ticker/history
   */
  async getHistory(ticker: string, range: string): Promise<OHLCVBar[]> {
    const key = range.toUpperCase()
    if (!isHistoryRange(key)) {
      throw new Error(`Invalid history range: ${range}`)
    }
    const { period1, period2, interval } = resolveChartWindow(key as HistoryRange)
    const result = await yahoo.chart(ticker.toUpperCase(), {
      period1,
      period2,
      interval,
      return: 'array',
    });
    const quotes = result.quotes ?? []
    return chartQuotesToOHLCV(quotes)
  },

  /**
   * Ticker search — returns lightweight results for the Marketplace.
   * Used by: stocks/search
   */
  async searchTickers(query: string): Promise<SearchResult[]> {
    const res = await yahoo.search(query)
    return (res.quotes ?? [])
      .filter((q) => q.isYahooFinance)
      .slice(0, 10)
      .map((q) => ({
        ticker:   q.symbol        ?? '',
        name:     q.longname ?? q.shortname ?? q.symbol ?? '',
        exchange: q.exchDisp      ?? '',
        type:     q.typeDisp      ?? '',
      }))
  },
}

