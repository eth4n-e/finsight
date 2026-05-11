/** Normalise Yahoo `chart` array quotes into OHLCV bars for the API. */
export function chartQuotesToOHLCV(quotes) {
    return quotes
        .filter((q) => q.open != null && q.high != null && q.low != null && q.close != null)
        .map((q) => ({
        timestamp: q.date.getTime(),
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
        volume: q.volume ?? 0,
    }))
        .sort((a, b) => a.timestamp - b.timestamp);
}
