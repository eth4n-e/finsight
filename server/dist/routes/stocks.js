import { Router } from 'express';
import { market } from '../services/yahooFinance.js';
const router = Router();
router.get('/search', async (req, res) => {
    try {
        const { ticker } = req.query;
        if (!ticker || typeof ticker !== 'string')
            return res.status(400).json({ error: 'Missing query' });
        const data = await market.searchTickers(ticker);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});
router.get('/:ticker/quote', async (req, res) => {
    try {
        console.log("Ticker --chk: ", req.params.ticker);
        const data = await market.getQuote(req.params.ticker);
        console.log("Data --chk: ", data);
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Quote fetch failed' });
    }
});
// TODO: yahoo api switched to chart - accepts two date ranges
router.get('/:ticker/history', async (req, res) => {
    try {
        let { interval, start, end } = req.query;
        interval = range ?? '1M';
        const data = await market.getHistory(req.params.ticker, start, end, interval);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: 'History fetch failed' });
    }
});
export default router;
