import { useCallback, useEffect, useState } from 'react'
import { api } from '@/services/api'
import type { WatchlistItem } from '@/types'

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWatchlist = useCallback(async () => {
    try {
      setError(null)
      const items = await api.getWatchlist()
      setWatchlist(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load watchlist')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWatchlist()
  }, [loadWatchlist])

  const removeWatchlistItem = useCallback((ticker: string) => {
    setWatchlist((currentWatchlist) =>
      currentWatchlist.filter((item) => item.ticker !== ticker.toUpperCase()),
    )
  }, [])

  return {
    watchlist,
    isLoading,
    error,
    refreshWatchlist: loadWatchlist,
    removeWatchlistItem,
  }
}
