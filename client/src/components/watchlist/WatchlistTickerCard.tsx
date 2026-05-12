import { useState } from 'react'
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
  onRemove: () => void
  isRemoving?: boolean
}

export function WatchlistTickerCard({
  item,
  distanceFromSelected,
  isSelected,
  onSelect,
  onRemove,
  isRemoving = false,
}: Props) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocusedWithin, setIsFocusedWithin] = useState(false)
  const { opacity, scale, blur } = focusStyles(distanceFromSelected)
  const isEmphasized = isHovered || isFocusedWithin
  const visualOpacity = isEmphasized ? 1 : opacity
  const visualScale = isEmphasized ? 1.015 : scale
  const visualBlur = isEmphasized ? 0 : blur

  return (
    <div
      className={clsx(
        'group relative transition-all duration-200 ease-out',
        isEmphasized && 'z-10'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocusedWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocusedWithin(false)
        }
      }}
      style={{
        opacity: visualOpacity,
        transform: `scale(${visualScale})`,
        filter: visualBlur > 0 ? `blur(${visualBlur}px)` : undefined,
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        className={clsx(
          'w-full rounded-xl border text-left transition-all duration-200 ease-out',
          'px-4 py-3 pr-16 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/60',
          isSelected
            ? 'border-accent-blue/50 bg-surface-3 ring-1 ring-accent-blue/30'
            : 'border-border bg-surface-2 hover:border-slate-500/50',
          isEmphasized && 'border-slate-400/70 bg-surface-3/90 shadow-lg shadow-slate-950/30'
        )}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className={clsx('font-semibold tracking-tight', isSelected ? 'text-white' : 'text-slate-200')}>
            {item.ticker} - <span className={clsx('font-normal')}>{item.name}</span>
          </span>
        </div>
      </button>

      <button
        type="button"
        aria-label={`Remove ${item.ticker} from watchlist`}
        onClick={onRemove}
        disabled={isRemoving}
        className={clsx(
          'absolute right-2 top-1/2 -translate-y-1/2 rounded-md border px-2 py-1 text-[11px] font-medium transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red/60',
          isEmphasized
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none translate-x-1 opacity-0',
          isRemoving
            ? 'cursor-wait border-border bg-surface-1 text-slate-500'
            : 'border-2 border-slate-500/50 text-slate-200 drop-shadow-md hover:border-red-400/70 hover:bg-red-900/70 hover:text-red-100'
        )}
      >
        {isRemoving ? '...' : 'Remove'}
      </button>
    </div>
  )
}
