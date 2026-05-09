import { useEffect, useRef, useState } from 'react'

interface PriceUpdate {
  ticker: string
  price: number
  change: number
  changePct: number
  timestamp: number
}

export function useStockSocket(tickers: string[]) {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({})
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (tickers.length === 0) return

    const ws = new WebSocket(`ws://localhost:3001/ws/prices`)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      ws.send(JSON.stringify({ type: 'subscribe', tickers }))
    }

    ws.onmessage = (event) => {
      const update: PriceUpdate = JSON.parse(event.data)
      setPrices((prev) => ({ ...prev, [update.ticker]: update }))
    }

    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)

    return () => {
      ws.close()
    }
  }, [tickers.join(',')])

  return { prices, connected }
}
