import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import type { OHLCV, TimeRange } from '@/types'

function dedupeByTimestamp(rows: OHLCV[]): OHLCV[] {
  const map = new Map<number, OHLCV>()
  for (const row of rows) map.set(row.timestamp, row)
  return [...map.values()].sort((a, b) => a.timestamp - b.timestamp)
}

/** Loads OHLCV history for a ticker + preset range (see server `HISTORY_RANGES`). */
export function useTickerHistory(ticker: string | null, range: TimeRange) {
  const [data, setData] = useState<OHLCV[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticker) {
      setData([])
      setError(null)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setData([])
    setIsLoading(true)
    setError(null)

    api
      .getHistory(ticker, range)
      .then((bars) => {
        if (!cancelled) setData(dedupeByTimestamp(bars))
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load history')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [ticker, range])

  return { data, isLoading, error }
}
