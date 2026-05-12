import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import clsx from 'clsx'
import { PriceChart, type PriceChartVariant } from '@/components/chart/PriceChart'
import { WatchlistSidebar } from '@/components/watchlist/WatchlistSidebar'
import { api } from '@/services/api'
import { useRemoveTicker } from '@/hooks/useRemoveTicker'
import { useTickerHistory } from '@/hooks/useTickerHistory'
import { useTickerAnalysis } from '@/hooks/useTickerAnalysis'
import { useTickerSearch } from '@/hooks/useTickerSearch'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useWatchlistSelection } from '@/hooks/useWatchlistSelection'
import { TIME_RANGES, type TimeRange, StockDto } from '@/types'

export default function StockWatcher() {
  const { watchlist, isLoading, error, refreshWatchlist, removeWatchlistItem } = useWatchlist()
  const {
    searchQuery,
    setSearchQuery,
    filteredWatchlist,
    selectedTicker,
    selectTicker,
    selectedIndex,
  } = useWatchlistSelection(watchlist)
  const { results: searchResults, isSearching, searchError } = useTickerSearch(searchQuery)

  const [chartRange, setChartRange] = useState<TimeRange>('1M')
  const [chartVariant, setChartVariant] = useState<PriceChartVariant>('candlestick')
  const { data: chartData, isLoading: chartLoading, error: chartError } = useTickerHistory(
    selectedTicker,
    chartRange,
  )
  const {
    analysis,
    isLoading: analysisLoading,
    error: analysisError,
  } = useTickerAnalysis(selectedTicker, chartRange)
  const { onRemoveTicker, removingTicker } = useRemoveTicker(refreshWatchlist, removeWatchlistItem)

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedTicker || !listRef.current) return
    const el = listRef.current.querySelector(`[data-ticker="${CSS.escape(selectedTicker)}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedTicker, filteredWatchlist.length])

  async function handleSearchResultAdd(stock: StockDto) {
    await api.addToWatchlist(stock)
    await refreshWatchlist()
    selectTicker(stock.ticker.toUpperCase())
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
            onRemoveTicker={onRemoveTicker}
            removingTicker={removingTicker}
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
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-500">Performance</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-1" role="group" aria-label="Chart style">
                {(
                  [
                    { id: 'candlestick' as const, label: 'Candles' },
                    { id: 'area' as const, label: 'Area' },
                  ] as const
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setChartVariant(id)}
                    className={clsx(
                      'rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
                      chartVariant === id
                        ? 'bg-surface-3 text-slate-200 ring-1 ring-border'
                        : 'text-slate-500 hover:bg-surface-2 hover:text-slate-300',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div
                className="hidden h-4 w-px bg-border sm:block"
                aria-hidden
              />
              <div className="flex flex-wrap gap-1" role="group" aria-label="Chart time range">
                {TIME_RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setChartRange(r)}
                    className={clsx(
                      'rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
                      chartRange === r
                        ? 'bg-accent-blue/20 text-accent-blue'
                        : 'text-slate-500 hover:bg-surface-2 hover:text-slate-300',
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col">
            {!selectedTicker ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-surface-2/50 px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-400">No ticker selected</p>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  Select a ticker from your watchlist to preview its performance.
                </p>
              </div>
            ) : chartError ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-border/80 bg-surface-2/50 px-4 py-6 text-center">
                <p className="text-sm font-medium text-accent-red">Could not load chart</p>
                <p className="mt-1 max-w-md text-xs text-slate-500">{chartError}</p>
              </div>
            ) : (
              <>
                {chartLoading ? (
                  <div
                    className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-surface-2/40"
                    aria-busy="true"
                    aria-label="Loading chart"
                  >
                    <span className="rounded-md bg-surface-2/90 px-3 py-1.5 text-xs text-slate-300">
                      Loading…
                    </span>
                  </div>
                ) : null}
                {chartData.length === 0 && !chartLoading ? (
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/80 bg-surface-2/40 px-4 py-6">
                    <p className="text-center text-xs text-slate-500">No bars returned for this range.</p>
                  </div>
                ) : (
                  <PriceChart data={chartData} variant={chartVariant} />
                )}
              </>
            )}
          </div>
        </section>

        <section
          aria-label="Recent performance analysis"
          className="flex min-h-[200px] flex-col rounded-xl border border-border bg-surface-1/80 p-4 lg:col-span-1 lg:min-h-0"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-500">Analysis</h2>
            {selectedTicker ? (
              <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-slate-400">
                {selectedTicker} · {chartRange}
              </span>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border/80 bg-surface-2/50 px-4 py-4">
            {!selectedTicker ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-slate-400">No ticker selected</p>
                <p className="mt-1 text-xs text-slate-500">
                  Choose a stock from the watchlist to load an AI summary for the selected range.
                </p>
              </div>
            ) : analysisLoading ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-slate-300">Generating analysis...</p>
                <p className="mt-1 text-xs text-slate-500">
                  Pulling recent performance context for {selectedTicker}.
                </p>
              </div>
            ) : analysisError ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-accent-red">Could not load analysis</p>
                <p className="mt-1 text-xs text-slate-500">{analysisError}</p>
              </div>
            ) : !analysis?.trim() ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-slate-400">No analysis available</p>
                <p className="mt-1 text-xs text-slate-500">
                  Try a different ticker or time range to request a new summary.
                </p>
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h3 className="text-base font-semibold text-slate-100" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h4 className="text-sm font-semibold text-slate-100" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h5 className="text-sm font-semibold text-slate-200" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-sm leading-6 text-slate-300" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-300" {...props} />
                  ),
                  li: ({ node, ...props }) => <li className="marker:text-slate-500" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold text-slate-100" {...props} />,
                  a: ({ node, ...props }) => (
                    <a
                      className="text-accent-blue underline decoration-accent-blue/40 underline-offset-2 hover:text-blue-300"
                      target="_blank"
                      rel="noreferrer"
                      {...props}
                    />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-2 border-border pl-4 italic text-slate-400"
                      {...props}
                    />
                  ),
                  code: ({ node, className, children, ...props }) => (
                    <code
                      className={clsx(
                        'rounded bg-surface-1 px-1.5 py-0.5 font-mono text-xs text-slate-200',
                        className,
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  ),
                  pre: ({ node, ...props }) => (
                    <pre
                      className="overflow-x-auto rounded-lg border border-border bg-surface-1 p-3 text-xs text-slate-200"
                      {...props}
                    />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-sm text-slate-300" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => <thead className="border-b border-border text-slate-200" {...props} />,
                  tbody: ({ node, ...props }) => <tbody className="divide-y divide-border/70" {...props} />,
                  tr: ({ node, ...props }) => <tr className="align-top" {...props} />,
                  th: ({ node, ...props }) => <th className="px-3 py-2 font-medium" {...props} />,
                  td: ({ node, ...props }) => <td className="px-3 py-2" {...props} />,
                }}
              >
                {analysis}
              </ReactMarkdown>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
