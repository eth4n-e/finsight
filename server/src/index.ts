import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { setupWebSocket } from './ws/priceSocket.js'
import stockRoutes from './routes/stocks.js'
import watchlistRoutes from './routes/watchlist.js'
import libraryRoutes from './routes/library.js'

const app = express()
const httpServer = createServer(app)

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/stocks', stockRoutes)
app.use('/api/watchlist', watchlistRoutes)
app.use('/api/library', libraryRoutes)

setupWebSocket(httpServer)

const PORT = process.env.SERVER_PORT ?? 3001
httpServer.listen(PORT, () => {
  console.log(`Finsight server running on http://localhost:${PORT}`)
})
