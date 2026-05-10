import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import type { TickerSearchResult } from '@/types'

export function useTickerSearch(query: string) {
  const [results, setResults] = useState<TickerSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    const normalizedQuery = query.trim()
    if (normalizedQuery.length < 2) {
      setResults([])
      setSearchError(null)
      setIsSearching(false)
      return
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearching(true)
        setSearchError(null)
        const searchResults = await api.searchTickers(normalizedQuery)
        setResults(searchResults)
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [query])

  return {
    results,
    isSearching,
    searchError,
  }
}
