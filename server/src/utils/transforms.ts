import type { OHLCVBar } from "../types/yahooFinance.js"

export function toOHLCV(bars: Awaited<ReturnType<typeof yahoo.historical>>): OHLCVBar[] {
  return bars.map((b) => ({
    timestamp: b.date.getTime(),
    open:   b.open   ?? 0,
    high:   b.high   ?? 0,
    low:    b.low    ?? 0,
    close:  b.close  ?? 0,
    volume: b.volume ?? 0,
  }))
}

export function rangeToInterval(range: string): '1d' | '1wk' | '1mo' {
  range = range.toUpperCase();
  if (range === '1D' || range === '1W') return '1d'
  if (range === '1M' || range === '3M') return '1wk'
  return '1mo'
}

// TODO: add date validation and conversion method
