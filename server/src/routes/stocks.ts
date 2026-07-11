import { Router } from 'express'
import { financeAdapter } from '../services/adapters/yahooFinance'
import { analysisService } from '../services/orchestrators/analysis'
import { HISTORY_RANGES, validateHistoryRange } from '../utils/historyRange.js'

const router = Router()

router.get('/search', async (req, res) => {
  try {
    const { ticker } = req.query
    if (!ticker || typeof ticker !== 'string') return res.status(400).json({ error: 'Missing query' })
    const data = await financeAdapter.searchTickers(ticker)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Search failed' })
  }
})

router.get('/:ticker/quote', async (req, res) => {
  try {
    console.log("Ticker --chk: ", req.params.ticker);
    const data = await financeAdapter.getQuote(req.params.ticker)
    console.log("Data --chk: ", data);
    res.json(data)
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Quote fetch failed' })
  }
})

router.get('/:ticker/history', async (req, res) => {
  try {
    const { status: isValid, range } = validateHistoryRange(req.query.range);
    if (!isValid) {
      return res.status(400).json({
        error: `Invalid range. Use one of: ${HISTORY_RANGES.join(', ')}`,
      })
    }

    const data = await financeAdapter.getHistory(req.params.ticker, range)
    res.json(data)
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Invalid history range')) {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: 'History fetch failed' })
  }
})

// TODO: figure out why range as query parameter was not seeming to work
router.get('/:ticker/analysis', async (req, res) => {
  try {
    const { status: isValid, range } = validateHistoryRange(req.query.range);
    if (!isValid) {
      return res.status(400).json({
        error: `Invalid range. Use one of: ${HISTORY_RANGES.join(', ')}`,
      })
    }

    const analysis = await analysisService.getAnalysis(req.params.ticker, range);

    res.status(200).json(analysis);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Stock analysis failed' })
  }
})

export default router

