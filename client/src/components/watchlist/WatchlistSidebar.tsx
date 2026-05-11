import type { Ref } from 'react'
import type { StockDto, TickerSearchResult, WatchlistItem } from '@/types'
import { WatchlistTickerCard } from './WatchlistTickerCard'

type Props = {
  items: WatchlistItem[]
  selectedTicker: string | null
  selectedIndex: number
  searchQuery: string
  onSearchChange: (value: string) => void
  onSelectTicker: (ticker: string) => void
  isLoading: boolean
  error: string | null
  onRefresh: () => void
  scrollContainerRef?: Ref<HTMLDivElement>
  searchResults: TickerSearchResult[]
  isSearching: boolean
  searchError: string | null
  onSearchResultSelect: (ticker: string) => void
  onSearchResultAdd: (stock: StockDto) => void
}

// TODO: list does not seem to be scrollable - grows uncontained
export function WatchlistSidebar({
  items,
  selectedTicker,
  selectedIndex,
  searchQuery,
  onSearchChange,
  onSelectTicker,
  isLoading,
  error,
  onRefresh,
  scrollContainerRef,
  searchResults,
  isSearching,
  searchError,
  onSearchResultSelect,
  onSearchResultAdd,
}: Props) {
  const normalizedSearchQuery = searchQuery.trim()

  // TODO: Integrate fuzzy search + searching by canonical name opposed to just ticker
  return (
    <aside className="flex min-h-0 flex-col gap-3">
      <div className="shrink-0 space-y-2">
        <label htmlFor="watchlist-search" className="sr-only">
          Search watchlist
        </label>
        <input
          id="watchlist-search"
          type="search"
          autoComplete="off"
          placeholder="Search tickers…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/40"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Watched</span>
          <button
            type="button"
            onClick={onRefresh}
            className="text-slate-400 underline-offset-2 hover:text-slate-300 hover:underline"
          >
            Refresh
          </button>
        </div>
        {normalizedSearchQuery.length >= 2 && (
          <div className="max-h-44 overflow-y-auto rounded-lg border border-border bg-surface-2">
            {isSearching ? (
              <p className="px-3 py-2 text-xs text-slate-400">Searching tickers...</p>
            ) : searchError ? (
              <p className="px-3 py-2 text-xs text-red-300">{searchError}</p>
            ) : searchResults.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-500">No symbols found.</p>
            ) : (
              <ul>
                {searchResults.map((result) => (
                  <li key={`${result.ticker}-${result.exchange}`} className="border-b border-border last:border-b-0">
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => onSearchResultSelect(result.ticker)}
                        className="min-w-0 text-left"
                      >
                        <p className="text-sm font-medium text-slate-200">{result.ticker}</p>
                        <p className="truncate text-xs text-slate-500">{result.name}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSearchResultAdd({ticker: result.ticker, name: result.name})}
                        className="rounded border border-border px-2 py-1 text-xs text-slate-300 hover:bg-surface-3"
                      >
                        Add
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-1 pr-1 [-webkit-overflow-scrolling:touch]"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 12px, black calc(100% - 12px), transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 12px, black calc(100% - 12px), transparent 100%)',
        }}
      >
        {isLoading ? (
          <p className="px-1 py-4 text-sm text-slate-500">Loading watchlist…</p>
        ) : error ? (
          <p className="rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-2 text-sm text-red-300">{error}</p>
        ) : items.length === 0 ? (
          <p className="px-1 py-4 text-sm text-slate-500">
            {searchQuery.trim() ? 'No tickers match your search.' : 'Your watchlist is empty.'}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item, index) => {
              const distance =
                selectedIndex >= 0 ? Math.abs(index - selectedIndex) : Math.max(0, index)
              return (
                <li key={item.id} className="list-none" data-ticker={item.ticker}>
                  <WatchlistTickerCard
                    item={item}
                    distanceFromSelected={distance}
                    isSelected={item.ticker === selectedTicker}
                    onSelect={() => onSelectTicker(item.ticker)}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
