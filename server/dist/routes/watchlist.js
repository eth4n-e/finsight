import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
const router = Router();
router.get('/', async (_req, res) => {
    const items = await prisma.watchlistItem.findMany({ orderBy: { addedAt: 'desc' } });
    res.json(items);
});
router.post('/', async (req, res) => {
    const { ticker } = req.body;
    if (!ticker)
        return res.status(400).json({ error: 'Ticker required' });
    try {
        const item = await prisma.watchlistItem.create({
            data: { ticker: ticker.toUpperCase() },
        });
        res.status(201).json(item);
    }
    catch {
        res.status(409).json({ error: 'Ticker already in watchlist' });
    }
});
router.delete('/:ticker', async (req, res) => {
    await prisma.watchlistItem.deleteMany({
        where: { ticker: req.params.ticker.toUpperCase() },
    });
    res.status(204).end();
});
export default router;
