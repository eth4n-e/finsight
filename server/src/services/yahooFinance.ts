import YahooFinance from 'yahoo-finance2'
import { 
    toOHLCV,
    rangeToInterval,
} from '../utils/transforms.js'
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
   * OHLCV history for a given time range.
   * Used by: stocks/:ticker/history
   */
  async getHistory(ticker: string, start = '2025-01-30', end = '2026-01-30', interval = '1M'): Promise<OHLCVBar[]> {
    const bars = await yahoo.historical(ticker.toUpperCase(), {
      // TODO: may need to modify rangeToPeriod and create another helper to ensure start and end are in proper date format
      period1:  start,
      period2:  end,
      interval: rangeToInterval(interval),
    })
    return toOHLCV(bars)
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

