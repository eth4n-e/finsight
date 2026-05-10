import clsx from 'clsx'
import type { WatchlistItem } from '@/types'

function focusStyles(distance: number) {
  if (distance <= 0) {
    return {
      opacity: 1,
      scale: 1,
      blur: 0,
    }
  }
  if (distance === 1) {
    return { opacity: 0.88, scale: 0.985, blur: 0.3 }
  }
  if (distance === 2) {
    return { opacity: 0.72, scale: 0.97, blur: 0.6 }
  }
  const t = Math.min(distance, 6) / 6
  return {
    opacity: 0.72 - t * 0.35,
    scale: 0.97 - t * 0.04,
    blur: 0.6 + t * 0.9,
  }
}

type Props = {
  item: WatchlistItem
  distanceFromSelected: number
  isSelected: boolean
  onSelect: () => void
}

export function WatchlistTickerCard({ item, distanceFromSelected, isSelected, onSelect }: Props) {
  const { opacity, scale, blur } = focusStyles(distanceFromSelected)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'w-full rounded-xl border text-left transition-all duration-200 ease-out',
        'px-4 py-3 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/60',
        isSelected
          ? 'border-accent-blue/50 bg-surface-3 ring-1 ring-accent-blue/30'
          : 'border-border bg-surface-2 hover:border-slate-500/50'
      )}
      style={{
        opacity,
        transform: `scale(${scale})`,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className={clsx('font-semibold tracking-tight', isSelected ? 'text-white' : 'text-slate-200')}>
          {item.ticker}
        </span>
        <span className="shrink-0 text-[10px] uppercase tracking-wider text-slate-500">
          {new Date(item.addedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </button>
  )
}
