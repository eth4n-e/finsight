import { Router } from 'express'
import { massive } from '../services/massive.js'
import { getRangeParams } from '../middleware/rangeParams.js'

const router = Router()

/*
 * KEEP IN MIND: stocks serves both the marketplace + watchlist - think of the stock as a resource and allow frontend to render as necessary
 */

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q || typeof q !== 'string') return res.status(400).json({ error: 'Missing query' })
    const data = await massive.searchTickers(q)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Search failed' })
  }
})

router.get('/:ticker/quote', async (req, res) => {
  try {
    const data = await massive.getSnapshot(req.params.ticker)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Quote fetch failed' })
  }
})

router.get('/:ticker/history', async (req, res) => {
  try {
    const { from, to, multiplier, timespan } = getRangeParams(req.query.range as string)
    const data = await massive.getAggregates(req.params.ticker, from, to, multiplier, timespan)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'History fetch failed' })
  }
})

export default router
