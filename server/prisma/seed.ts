import { PrismaClient } from './generated/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import dotenv from 'dotenv';
dotenv.config();

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter})

const SEED_ITEMS = [
  {'ticker': 'AAPL', 'name': 'Apple'},  // Apple
  {'ticker': 'MSFT', 'name': 'Microsoft'},
  {'ticker': 'GOOGL', 'name': 'Alphabet'},
  {'ticker': 'AMZN', 'name': 'Amazon'},
  {'ticker': 'NVDA', 'name': 'NVIDIA'},
  {'ticker': 'META', 'name': 'Meta'},
  {'ticker': 'TSLA', 'name': 'Tesla'},
] as const;

async function main() {
  console.log('Seeding watchlist...')

  for (const item of SEED_ITEMS) {
    await prisma.watchlistItem.upsert({
      where:  { ticker: item.ticker },
      update: {},
      create: { ticker: item.ticker, name: item.name },
    })
    console.log(`  ✓ ${item.ticker}`)
  }

  await prisma.simulatorBalance.upsert({
    where:  { id: 'singleton' },
    update: {},
    create: { id: 'singleton', cash: 100000 },
  })
  console.log('  ✓ Simulator balance initialised ($100,000)')

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })