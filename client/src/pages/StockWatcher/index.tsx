import { useEffect, useRef } from 'react'
import { WatchlistSidebar } from '@/components/watchlist/WatchlistSidebar'
import { api } from '@/services/api'
import { useTickerSearch } from '@/hooks/useTickerSearch'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useWatchlistSelection } from '@/hooks/useWatchlistSelection'

export default function StockWatcher() {
  const { watchlist, isLoading, error, refreshWatchlist } = useWatchlist()
  const {
    searchQuery,
    setSearchQuery,
    filteredWatchlist,
    selectedTicker,
    selectTicker,
    selectedIndex,
  } = useWatchlistSelection(watchlist)
  const { results: searchResults, isSearching, searchError } = useTickerSearch(searchQuery)

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedTicker || !listRef.current) return
    const el = listRef.current.querySelector(`[data-ticker="${CSS.escape(selectedTicker)}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedTicker, filteredWatchlist.length])

  async function handleSearchResultAdd(ticker: string) {
    await api.addToWatchlist(ticker)
    await refreshWatchlist()
    selectTicker(ticker.toUpperCase())
  }

  function handleSearchResultSelect(ticker: string) {
    setSearchQuery(ticker.toUpperCase())
    selectTicker(ticker.toUpperCase())
  }

  return (
    <div className="flex min-h-[calc(100vh-5.5rem)] flex-col gap-4">
      <header className="shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-white">Stock Watcher</h1>
        <p className="text-sm text-slate-400">Home to your favorite stocks</p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-5">
        <div className="min-h-[280px] lg:col-span-1 lg:min-h-0">
          <WatchlistSidebar
            scrollContainerRef={listRef}
            items={filteredWatchlist}
            selectedTicker={selectedTicker}
            selectedIndex={selectedIndex}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectTicker={selectTicker}
            isLoading={isLoading}
            error={error}
            onRefresh={refreshWatchlist}
            searchResults={searchResults}
            isSearching={isSearching}
            searchError={searchError}
            onSearchResultSelect={handleSearchResultSelect}
            onSearchResultAdd={handleSearchResultAdd}
          />
        </div>

        <section
          aria-label="Stock performance chart"
          className="flex min-h-[240px] flex-col rounded-xl border border-border bg-surface-1/80 p-4 lg:col-span-2 lg:min-h-0"
        >
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Performance</h2>
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-surface-2/50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-400">Chart area</p>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {selectedTicker
                ? `Price history for ${selectedTicker} will appear here.`
                : 'Select a ticker from your watchlist to preview its performance.'}
            </p>
          </div>
        </section>

        <section
          aria-label="Recent performance analysis"
          className="flex min-h-[200px] flex-col rounded-xl border border-border bg-surface-1/80 p-4 lg:col-span-1 lg:min-h-0"
        >
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Analysis</h2>
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-surface-2/50 px-4 py-6 text-center">
            <p className="text-sm font-medium text-slate-400">Summary</p>
            <p className="mt-1 text-xs text-slate-500">
              A short summary of recent moves and context will show here.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
