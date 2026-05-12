import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import type { StockAnalysis, TimeRange } from '@/types'

export function useTickerAnalysis(ticker: string | null, range: TimeRange) {
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticker) {
      setAnalysis(null)
      setError(null)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setAnalysis(null)
    setError(null)
    setIsLoading(true)

    api
      .getAnalysis(ticker, range)
      .then((nextAnalysis) => {
        if (!cancelled) {
          setAnalysis(nextAnalysis)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load analysis')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [ticker, range])

  return { analysis, isLoading, error }
}
