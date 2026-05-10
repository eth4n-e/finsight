import { useCallback, useEffect, useMemo, useState } from 'react'
import type { WatchlistItem } from '@/types'

export function useWatchlistSelection(watchlist: WatchlistItem[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)

  // TODO: return to this to filter by name / fuzzy matching
  const filteredWatchlist = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return watchlist
    return watchlist.filter((item) => item.ticker.toLowerCase().includes(q))
  }, [watchlist, searchQuery])

  useEffect(() => {
    if (filteredWatchlist.length === 0) {
      setSelectedTicker(null)
      return
    }
    const stillVisible = filteredWatchlist.some((w) => w.ticker === selectedTicker)
    if (!selectedTicker || !stillVisible) {
      setSelectedTicker(filteredWatchlist[0].ticker)
    }
  }, [filteredWatchlist, selectedTicker])

  const selectTicker = useCallback((ticker: string) => {
    setSelectedTicker(ticker)
  }, [])

  const selectedIndex = useMemo(() => {
    if (!selectedTicker) return -1
    return filteredWatchlist.findIndex((w) => w.ticker === selectedTicker)
  }, [filteredWatchlist, selectedTicker])

  return {
    searchQuery,
    setSearchQuery,
    filteredWatchlist,
    selectedTicker,
    selectTicker,
    selectedIndex,
  }
}
