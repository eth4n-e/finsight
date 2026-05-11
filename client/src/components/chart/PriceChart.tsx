import { useEffect, useRef, useState } from 'react'
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts'
import clsx from 'clsx'
import type { OHLCV } from '@/types'

export type PriceChartVariant = 'area' | 'candlestick'

export interface PriceChartProps {
  data: OHLCV[]
  variant?: PriceChartVariant
  className?: string
}

const priceFmt = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
})

function formatChartTime(t: Time): string {
  if (typeof t === 'number') {
    const d = new Date(t * 1000)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  if (typeof t === 'string') return t
  const bd = t as { year: number; month: number; day: number }
  return `${bd.year}-${String(bd.month).padStart(2, '0')}-${String(bd.day).padStart(2, '0')}`
}

function toUtcSeconds(ms: number): UTCTimestamp {
  return Math.floor(ms / 1000) as UTCTimestamp
}

function toCandlestickData(rows: OHLCV[]) {
  return rows.map((d) => ({
    time: toUtcSeconds(d.timestamp),
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }))
}

function toAreaData(rows: OHLCV[]) {
  return rows.map((d) => ({
    time: toUtcSeconds(d.timestamp),
    value: d.close,
  }))
}

type LegendState =
  | {
      kind: 'ohlc'
      timeLabel: string
      open: number
      high: number
      low: number
      close: number
    }
  | { kind: 'close'; timeLabel: string; close: number }

type ChartCtx = {
  chart: IChartApi
  variant: PriceChartVariant
  candle?: ISeriesApi<'Candlestick'>
  area?: ISeriesApi<'Area'>
}

function isOhlcBar(v: unknown): v is { open: number; high: number; low: number; close: number } {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.open === 'number' &&
    typeof o.high === 'number' &&
    typeof o.low === 'number' &&
    typeof o.close === 'number'
  )
}

function isSingleValueBar(v: unknown): v is { value: number } {
  return typeof v === 'object' && v !== null && typeof (v as { value?: unknown }).value === 'number'
}

export function PriceChart({ data, variant = 'candlestick', className }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<ChartCtx | null>(null)
  const [legend, setLegend] = useState<LegendState | null>(null)

  useEffect(() => {
    setLegend(null)
  }, [data, variant])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
      layout: {
        attributionLogo: false,
        background: { type: ColorType.Solid, color: '#1e2535' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(42, 51, 71, 0.45)' },
        horzLines: { color: 'rgba(42, 51, 71, 0.45)' },
      },
      width: container.clientWidth,
      height: container.clientHeight,
      rightPriceScale: { borderColor: '#2a3347' },
      timeScale: {
        borderColor: '#2a3347',
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#64748b', width: 1, style: 2, labelBackgroundColor: '#252d3d' },
        horzLine: { color: '#64748b', width: 1, style: 2, labelBackgroundColor: '#252d3d' },
      },
    })

    let ctx: ChartCtx
    if (variant === 'area') {
      const area = chart.addSeries(AreaSeries, {
        lineColor: '#3b82f6',
        topColor: 'rgba(59, 130, 246, 0.35)',
        bottomColor: 'rgba(59, 130, 246, 0)',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
      })
      ctx = { chart, variant, area }
    } else {
      const candle = chart.addSeries(CandlestickSeries, {
        // Bodies: solid fills with strong contrast between up/down
        upColor: '#16a34a',
        downColor: '#dc2626',
        // Borders: match the body color exactly — removing the dark outline
        // eliminates the "box" effect that competes with wicks at small widths
        borderVisible: true,
        borderUpColor: '#16a34a',
        borderDownColor: '#dc2626',
        // Wicks: lighter tint of the body hue — stays associated with candle
        // direction but reads as a separate structure from the filled body
        wickVisible: true,
        wickUpColor: '#4ade80',
        wickDownColor: '#f87171',
        priceLineVisible: false,
      })
      ctx = { chart, variant, candle }
    }

    ctxRef.current = ctx

    const onCrosshairMove = (param: MouseEventParams) => {
      const c = ctxRef.current
      if (!c) return

      if (!param.point || param.time === undefined) {
        setLegend(null)
        return
      }

      if (c.variant === 'candlestick' && c.candle) {
        const bar = param.seriesData.get(c.candle)
        if (isOhlcBar(bar)) {
          setLegend({
            kind: 'ohlc',
            timeLabel: formatChartTime(param.time),
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
          })
          return
        }
      }

      if (c.variant === 'area' && c.area) {
        const bar = param.seriesData.get(c.area)
        if (isSingleValueBar(bar)) {
          setLegend({
            kind: 'close',
            timeLabel: formatChartTime(param.time),
            close: bar.value,
          })
          return
        }
      }

      setLegend(null)
    }

    chart.subscribeCrosshairMove(onCrosshairMove)

    const ro = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = container
      chart.resize(clientWidth, clientHeight)
    })
    ro.observe(container)

    return () => {
      chart.unsubscribeCrosshairMove(onCrosshairMove)
      ro.disconnect()
      chart.remove()
      ctxRef.current = null
      setLegend(null)
    }
  }, [variant])

  useEffect(() => {
    const ctx = ctxRef.current
    if (!ctx || ctx.variant !== variant) return

    if (variant === 'candlestick' && ctx.candle) {
      ctx.candle.setData(toCandlestickData(data))
    } else if (variant === 'area' && ctx.area) {
      ctx.area.setData(toAreaData(data))
    }

    if (data.length > 0) {
      ctx.chart.timeScale().fitContent()
    }
  }, [data, variant])

  return (
    <div
      className={clsx(
        'flex h-full min-h-[200px] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/50 bg-surface-2/30',
        className,
      )}
    >
      <div className="shrink-0 space-y-1 border-b border-border/60 bg-surface-2/90 px-2 py-1.5">
        {variant === 'candlestick' ? (
          <>
            <p className="text-[11px] leading-snug text-slate-500">
              <span className="font-medium text-emerald-400">Green</span> = closed above open.{' '}
              <span className="font-medium text-red-400">Red</span> = closed below open. <span className="text-slate-300">Body</span> = open→close. <span className="text-slate-300">Wicks</span> = period high/low.
            </p>
            {legend?.kind === 'ohlc' ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 font-mono text-[11px] text-slate-200 sm:grid-cols-5">
                <div className="col-span-2 text-slate-400 sm:col-span-1 sm:text-slate-300">
                  {legend.timeLabel}
                </div>
                <div>
                  <dt className="inline text-slate-500">O</dt>{' '}
                  <dd className="inline text-slate-200">{priceFmt.format(legend.open)}</dd>
                </div>
                <div>
                  <dt className="inline text-slate-500">H</dt>{' '}
                  <dd className="inline text-emerald-300/90">{priceFmt.format(legend.high)}</dd>
                </div>
                <div>
                  <dt className="inline text-slate-500">L</dt>{' '}
                  <dd className="inline text-rose-300/90">{priceFmt.format(legend.low)}</dd>
                </div>
                <div>
                  <dt className="inline text-slate-500">C</dt>{' '}
                  <dd className="inline text-slate-100">{priceFmt.format(legend.close)}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-[11px] italic text-slate-500">Hover the chart to show O · H · L · C for that bar.</p>
            )}
          </>
        ) : (
          <>
            <p className="text-[11px] leading-snug text-slate-500">
              Line shows <span className="text-slate-400">close</span> at each step. Crosshair moves freely in both
              directions.
            </p>
            {legend?.kind === 'close' ? (
              <p className="font-mono text-[11px] text-slate-200">
                <span className="text-slate-400">{legend.timeLabel}</span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-slate-500">Close</span> {priceFmt.format(legend.close)}
              </p>
            ) : (
              <p className="text-[11px] italic text-slate-500">Hover the chart for time and close.</p>
            )}
          </>
        )}
      </div>
      <div ref={containerRef} className="min-h-0 w-full flex-1" />
    </div>
  )
}
