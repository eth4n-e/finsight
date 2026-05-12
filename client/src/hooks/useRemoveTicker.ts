import { useCallback, useState } from 'react'
import { api } from '@/services/api'

type RefreshWatchlist = () => Promise<void>
type RemoveWatchlistItem = (ticker: string) => void

export function useRemoveTicker(
  refreshWatchlist: RefreshWatchlist,
  removeWatchlistItem: RemoveWatchlistItem,
) {
  const [removingTicker, setRemovingTicker] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)

  const onRemoveTicker = useCallback(
    async (ticker: string) => {
      try {
        setRemovingTicker(ticker)
        setRemoveError(null)
        removeWatchlistItem(ticker)
        await api.removeFromWatchlist(ticker)
        await refreshWatchlist()
      } catch (err) {
        setRemoveError(err instanceof Error ? err.message : 'Failed to remove ticker')
        await refreshWatchlist().catch(() => undefined)
        throw err
      } finally {
        setRemovingTicker((currentTicker) => (currentTicker === ticker ? null : currentTicker))
      }
    },
    [refreshWatchlist, removeWatchlistItem],
  )

  return {
    onRemoveTicker,
    removingTicker,
    removeError,
  }
}
