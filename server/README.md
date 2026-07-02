# Finsight Server — Code Organization

Reference for where code belongs and how layers interact.

## Layer overview

```
routes  →  services  →  infra  →  lib  →  external packages
              ↓
            utils / types
```

| Directory | Purpose | Answers |
|-----------|---------|---------|
| `lib/` | Instantiate and export shared external clients | *How do we connect?* |
| `infra/` | Cross-cutting primitives with no domain knowledge | *What reusable plumbing exists?* |
| `services/` | Domain-facing APIs over external systems | *What does the app need?* |
| `routes/` | HTTP handlers — validation, status codes, delegation | *What does this endpoint do?* |
| `utils/` | Pure helpers (transforms, date ranges, formatting) | *How do we shape this data?* |
| `types/` | Shared TypeScript types | *What is the shape of this data?* |
| `ws/` | WebSocket setup and event handling | *How do real-time connections work?* |
| `generated/` | Prisma-generated client (do not edit) | — |

## Rules of thumb

### `lib/` — connection wiring only

- Create singleton clients here (env vars, adapters, config).
- Export the raw client or a thin connection — no business logic.
- **Examples:** `lib/prisma.ts`, `lib/cache.ts`

```ts
// lib/cache.ts — connection only
export const cache = Client.create(process.env.CACHE_SERVER!)
```

### `infra/` — generic glue

- Operations that any feature might use: cache get/set, logging, metrics.
- No domain nouns in keys or logic (no tickers, watchlists, prompts).
- Imports from `lib/`, exported to `services/`.
- **Examples:** `infra/cache/` — `get`, `set`, `remove` with serialization/TTL defaults

```ts
// infra/cache — generic key/value, no domain meaning
await cacheSet('some-key', value, 60)
```

### `services/` — domain boundary

- Define how the app talks to the outside world in **domain language**.
- Own prompts, key naming, TTL choices, and response mapping.
- Routes import from here — not from `lib/`, `infra/`, or SDKs directly.
- **Examples:** `market.getQuote()`, `llm.analyzePerformance()`

```ts
// services/yahooFinance.ts — domain API
export const market = {
  async getQuote(ticker: string): Promise<QuoteResult> { ... }
}
```

### `routes/` — thin HTTP layer

- Parse request, call a service, return JSON/status.
- No direct SDK calls, no cache key construction, no Prisma queries inline when avoidable.

## Import direction

```
routes  →  services  →  infra  →  lib
```

Avoid:

- `routes/` → `lib/` or `infra/` (skip the domain layer)
- `infra/` → `services/` (inverts dependency)
- `lib/` → anything above it

## Pragmatic exceptions

Not everything needs to be split on day one.

| Pattern | When it's fine |
|---------|----------------|
| Client + service in one file (`services/yahooFinance.ts`, `services/llm.ts`) | Single owner, domain-specific config, no shared client elsewhere |
| Prisma used directly in routes | Small handlers; prefer `services/` as routes grow |
| Extract to `lib/` | Client is shared, setup is non-trivial, or you need one lifecycle point |

Refactor toward the full split when you hit friction: testing, swapping providers, or multiple consumers.

## Where caching fits

```
lib/cache.ts          memjs client singleton
infra/cache/          generic get, set, remove
services/*.ts         domain keys + TTL (e.g. quote:AAPL, 60s)
routes/               no cache imports
```

## Quick decision guide

| I'm building… | Put it in… |
|---------------|------------|
| `new PrismaClient({ adapter })` | `lib/` |
| `cache.get` / `cache.set` wrapper | `infra/` |
| `getQuote` with Yahoo + cache | `services/` |
| `GET /api/stocks/:ticker/quote` | `routes/` |
| OHLCV bar transform | `utils/` |
| `QuoteResult` type | `types/` |
