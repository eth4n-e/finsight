import type { OHLCVBar } from '../types/finance.js'

/** Normalise Yahoo `chart` array quotes into OHLCV bars for the API. */
export function chartQuotesToOHLCV(
  quotes: Array<{
    date: Date
    open: number | null
    high: number | null
    low: number | null
    close: number | null
    volume: number | null
  }>,
): OHLCVBar[] {
  return quotes
    .filter((q) => q.open != null && q.high != null && q.low != null && q.close != null)
    .map((q) => ({
      timestamp: q.date.getTime(),
      open: q.open as number,
      high: q.high as number,
      low: q.low as number,
      close: q.close as number,
      volume: q.volume ?? 0,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
}

/** Converts news keywords into query format */
// export function keywordsToQueryFormat(keywords: string[]) {

// }
