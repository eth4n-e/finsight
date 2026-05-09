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
  if (range === '1D' || range === '1W') return '1d'
  if (range === '1M' || range === '3M') return '1wk'
  return '1mo'
}

export function rangeToPeriod1(range: string): Date {
  const d = new Date()
  switch (range) {
    case '1D':  d.setDate(d.getDate() - 1);        break
    case '1W':  d.setDate(d.getDate() - 7);        break
    case '3M':  d.setMonth(d.getMonth() - 3);      break
    case '1Y':  d.setFullYear(d.getFullYear() - 1); break
    default:    d.setMonth(d.getMonth() - 1);       break  // 1M
  }
  return d
}
