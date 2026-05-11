import { Router } from 'express'
import { market } from '../services/yahooFinance.js'
import { HISTORY_RANGES, isHistoryRange } from '../utils/historyRange.js'

const router = Router()

router.get('/search', async (req, res) => {
  try {
    const { ticker } = req.query
    if (!ticker || typeof ticker !== 'string') return res.status(400).json({ error: 'Missing query' })
    const data = await market.searchTickers(ticker)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Search failed' })
  }
})

router.get('/:ticker/quote', async (req, res) => {
  try {
    console.log("Ticker --chk: ", req.params.ticker);
    const data = await market.getQuote(req.params.ticker)
    console.log("Data --chk: ", data);
    res.json(data)
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Quote fetch failed' })
  }
})

router.get('/:ticker/history', async (req, res) => {
  try {
    const raw = typeof req.query.range === 'string' ? req.query.range : '1M'
    const range = raw.toUpperCase()
    if (!isHistoryRange(range)) {
      return res.status(400).json({
        error: `Invalid range. Use one of: ${HISTORY_RANGES.join(', ')}`,
      })
    }
    const data = await market.getHistory(req.params.ticker, range)
    res.json(data)
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Invalid history range')) {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: 'History fetch failed' })
  }
})

export default router

