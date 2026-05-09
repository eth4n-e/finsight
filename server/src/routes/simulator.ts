import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { massive } from '../services/massive.js'

const router = Router()
const prisma = new PrismaClient()

async function getOrCreateBalance() {
  return prisma.simulatorBalance.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton', cash: 100000 },
  })
}

router.get('/portfolio', async (_req, res) => {
  const [positions, balance] = await Promise.all([
    prisma.portfolioPosition.findMany({ where: { closed: false } }),
    getOrCreateBalance(),
  ])
  res.json({ positions, cash: balance.cash })
})

router.post('/buy', async (req, res) => {
  const { ticker, shares } = req.body
  if (!ticker || !shares) return res.status(400).json({ error: 'ticker and shares required' })
  try {
    const snapshot: any = await massive.getSnapshot(ticker)
    const price: number = snapshot?.ticker?.day?.c ?? snapshot?.ticker?.lastTrade?.p
    if (!price) return res.status(400).json({ error: 'Could not fetch price' })

    const cost = price * shares
    const balance = await getOrCreateBalance()
    if (balance.cash < cost) return res.status(400).json({ error: 'Insufficient funds' })

    const [position] = await prisma.$transaction([
      prisma.portfolioPosition.create({
        data: { ticker: ticker.toUpperCase(), shares, purchasePrice: price },
      }),
      prisma.simulatorBalance.update({
        where: { id: 'singleton' },
        data: { cash: { decrement: cost } },
      }),
    ])
    res.status(201).json(position)
  } catch {
    res.status(500).json({ error: 'Buy failed' })
  }
})

router.post('/sell', async (req, res) => {
  const { ticker, shares } = req.body
  const positions = await prisma.portfolioPosition.findMany({
    where: { ticker: ticker.toUpperCase(), closed: false },
  })
  const totalShares = positions.reduce((sum, p) => sum + p.shares, 0)
  if (totalShares < shares) return res.status(400).json({ error: 'Not enough shares' })

  const snapshot: any = await massive.getSnapshot(ticker)
  const price: number = snapshot?.ticker?.day?.c ?? snapshot?.ticker?.lastTrade?.p
  if (!price) return res.status(400).json({ error: 'Could not fetch price' })

  await prisma.$transaction([
    prisma.portfolioPosition.updateMany({
      where: { ticker: ticker.toUpperCase(), closed: false },
      data: { closed: true, closedAt: new Date(), closePrice: price },
    }),
    prisma.simulatorBalance.update({
      where: { id: 'singleton' },
      data: { cash: { increment: price * shares } },
    }),
  ])
  res.json({ ok: true })
})

export default router
