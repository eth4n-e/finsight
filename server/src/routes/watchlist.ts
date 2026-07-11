import { Router } from 'express'
import { prismaClient } from '../lib/prisma.js'

const router = Router()

router.get('/', async (_req, res) => {
  const items = await prismaClient.watchlistItem.findMany({ orderBy: { addedAt: 'desc' } })
  res.json(items)
})

router.post('/', async (req, res) => {
  const { ticker, name } = req.body
  if (!ticker) return res.status(400).json({ error: 'Ticker required' })
  try {
    const item = await prismaClient.watchlistItem.create({
      data: { ticker: ticker.toUpperCase(), name },
    })
    res.status(201).json(item)
  } catch {
    res.status(409).json({ error: 'Ticker already in watchlist' })
  }
})

router.delete('/:ticker', async (req, res) => {
  await prismaClient.watchlistItem.deleteMany({
    where: { ticker: req.params.ticker.toUpperCase() },
  })
  res.status(204).end()
})

export default router
