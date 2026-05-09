# Finsight

A dark, minimalist financial dashboard for visualizing stock data, learning about personal finance, and simulating investments — powered by real-time market data and AI-driven explanations.

---

## Features

- **Stock Watcher** — track a personalized watchlist with interactive price charts, volume bars, and live price updates via WebSocket
- **Library** — an LLM-powered learning center covering topics like real estate, ETFs, loans, bonds, and more, with follow-up Q&A per topic
- **Investment Simulator** — paper-trade stocks using real market prices, track your virtual portfolio's P&L over time
- **Marketplace** — search any ticker, explore company snapshots, and add stocks to your watchlist

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Vite, React Router |
| Styling | Tailwind CSS (dark theme) |
| Charts | Recharts |
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Market data | Polygon.io REST + WebSocket API |
| AI | Anthropic API (Claude) |
| Deployment | Docker + docker-compose |

---

## Project structure

```
finsight/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Shared UI components
│   │   ├── pages/           # Stock Watcher, Library, Simulator, Marketplace
│   │   ├── hooks/           # Custom hooks (useWebSocket, usePortfolio, etc.)
│   │   ├── services/        # API client functions
│   │   └── types/           # Shared TypeScript types
│   └── vite.config.ts
├── server/                  # Express backend
│   ├── src/
│   │   ├── routes/          # REST API routes
│   │   ├── services/        # Polygon.io client, LLM service
│   │   ├── ws/              # WebSocket proxy + event relay
│   │   └── prisma/          # Schema + migrations
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

---

## Getting started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A [Polygon.io](https://polygon.io) free account
- An [Anthropic API](https://console.anthropic.com) key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/finsight.git
cd finsight

# Install dependencies for both client and server
npm install --prefix client
npm install --prefix server
```

### Environment variables

Create a `.env` file in `server/`:

```env
POLYGON_API_KEY=your_polygon_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
DATABASE_URL="file:./dev.db"
PORT=3001
```

Create a `.env` file in `client/`:

```env
VITE_API_BASE_URL=http://localhost:3001
```

### Database setup

```bash
cd server
npx prisma migrate dev --name init
```

### Running locally

```bash
# In one terminal — start the backend
cd server && npm run dev

# In another terminal — start the frontend
cd client && npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Running with Docker

```bash
# Build and start all services
docker-compose up --build

# App available at http://localhost:5173
# API available at http://localhost:3001
```

The `docker-compose.yml` spins up three containers: the React frontend (served via nginx), the Express API, and a PostgreSQL database.

---

## Data sources

**Polygon.io** (free tier) provides:
- End-of-day historical OHLCV data
- 15-minute delayed quotes via REST
- Delayed last-trade WebSocket feed
- Ticker search and company snapshot endpoints

No paid tier is required to run Finsight.

---

## Architecture overview

```
┌─────────────────────────────────────────────┐
│         Frontend — React + TypeScript        │
│  Stock Watcher │ Library │ Simulator │ Mkt  │
└────────────────────┬────────────────────────┘
                     │ REST + WebSocket
┌────────────────────▼────────────────────────┐
│         Backend — Node / Express             │
│  REST API │ WebSocket Proxy │ LLM Service   │
│              Prisma ORM                      │
│         SQLite / PostgreSQL                  │
└──────┬──────────────────────┬───────────────┘
       │                      │
┌──────▼──────┐      ┌────────▼───────┐
│ Polygon.io  │      │ Anthropic API  │
│ REST + WS   │      │ Claude         │
└─────────────┘      └────────────────┘
```

---

## Roadmap

- [ ] User authentication (JWT)
- [ ] Alerts — notify when a stock crosses a price threshold
- [ ] News feed integration per ticker
- [ ] Mobile-responsive layout
- [ ] Export portfolio history to CSV
- [ ] Extended documentation site

---

## License

MIT
