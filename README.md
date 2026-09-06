# 🚀 CryptoVision Pro

> Institutional Cryptocurrency Intelligence & Market Analytics Platform

CryptoVision Pro is a full-stack, real-time cryptocurrency and DeFi market monitoring platform. The frontend delivers a high-fidelity, glassmorphism-styled dashboard powered by ECharts, while the backend provides typed REST APIs, WebSocket streaming, and persistent storage for users, watchlists, alerts, and portfolio positions.

![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TS-61dafb)
![Backend](https://img.shields.io/badge/Backend-NestJS%20%2B%20TypeScript-e0234e)
![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20TimescaleDB-336791)
![Cache](https://img.shields.io/badge/Cache-Redis%207-dc382d)
![License](https://img.shields.io/badge/License-MIT-8b5cf6)

---

## 📐 Architecture

```
cryptovision-pro/
├── apps/
│   ├── web/                  # React + Vite + TypeScript frontend
│   │   ├── src/
│   │   │   ├── app/          # App shell, routing, providers
│   │   │   ├── components/   # charts/, layout/, features/, auth/, ui/
│   │   │   ├── features/     # market-overview, defi, on-chain, whale-tracker, portfolio
│   │   │   ├── hooks/        # useMarketSocket, usePriceCandles, etc.
│   │   │   ├── store/        # Zustand slices
│   │   │   ├── utils/        # formatters
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── tailwind.config.ts
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/                  # NestJS backend
│       ├── src/
│       │   ├── modules/      # auth, market-data, defi, on-chain, whale-tracker,
│       │   │                 # fear-greed, watchlists, alerts, portfolio, jobs, health
│       │   ├── gateways/     # WebSocket gateways (prices, whales, sentiment)
│       │   ├── common/       # guards, interceptors, filters, middleware, decorators
│       │   ├── integrations/ # CoinGecko, DeFiLlama, Etherscan, Whale Alert clients
│       │   ├── prisma/       # schema.prisma, migrations
│       │   └── main.ts
│       └── package.json
│
├── packages/
│   └── shared-types/         # Typed API contracts shared between web & api
│       └── src/index.ts
│
├── infra/
│   └── docker/
│       ├── Dockerfile.web
│       ├── Dockerfile.api
│       └── docker-compose.yml
│
├── turbo.json
├── package.json
├── .env.example
├── README.md
├── QUICKSTART.md
├── FEATURES.md
├── PROJECT_SUMMARY.md
└── INDEX.md
```

---

## 🛠️ Technology Stack

| Concern | Technology |
|---|---|
| **Frontend framework** | React 18 + TypeScript + Vite |
| **State management** | Zustand (UI state) + TanStack Query (server state/cache) |
| **Charting** | ECharts 5 via `echarts-for-react` |
| **Styling** | Tailwind CSS with custom design tokens |
| **Backend framework** | NestJS (Node.js 20 LTS) |
| **API protocol** | REST (`/api/v1`) + WebSocket (Socket.IO) |
| **Database** | PostgreSQL 16 + TimescaleDB extension |
| **Cache / Queue** | Redis 7 (caching + BullMQ) |
| **ORM** | Prisma |
| **Auth** | JWT (access + refresh) + OAuth2 (Google/GitHub) |
| **Security** | Helmet, class-validator, global exception filter, rate limiting |
| **Build / Monorepo** | Turborepo + npm workspaces |
| **Containerization** | Docker + Docker Compose |

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- npm >= 9
- Docker & Docker Compose (for Postgres/Redis)

### 1. Clone & Install

```bash
git clone <repository-url>
cd cryptovision-pro
npm install
```

### 2. Start Infrastructure

```bash
npm run docker:up
```

This starts:
- PostgreSQL (TimescaleDB) on `localhost:5432`
- Redis on `localhost:6379`

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database URL, JWT secrets, and third-party API keys.

### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

### 5. Start Development Servers

```bash
npm run dev
```

This starts:
- Frontend on `http://localhost:5173`
- Backend API on `http://localhost:4000/api/v1`
- Swagger docs on `http://localhost:4000/api/docs`

### 6. Open the Dashboard

Visit `http://localhost:5173` in your browser.

---

## 📡 API Reference

Base URL: `/api/v1`

### Market Data

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/market/tickers` | Live spot prices + 24h stats | Public |
| `GET` | `/market/candles` | OHLCV candlestick series | Public |
| `GET` | `/market/defi/tvl` | Top DeFi protocols by TVL | Public |
| `GET` | `/market/onchain/metrics` | Tx volume + active addresses | Public |
| `GET` | `/market/whale/transactions` | Recent large transactions | Public |
| `GET` | `/market/sentiment/fear-greed` | Fear & Greed index | Public |

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create account | Public |
| `POST` | `/auth/login` | Password login | Public |
| `POST` | `/auth/refresh` | Refresh access token | Public (refresh token) |
| `POST` | `/auth/logout` | Revoke refresh token | Authenticated |
| `GET` | `/auth/me` | Current user profile | Authenticated |

### User Features

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/watchlists` | List user watchlists | Authenticated |
| `POST` | `/watchlists` | Create watchlist | Authenticated |
| `PATCH` | `/watchlists/:id` | Update watchlist | Authenticated (owner) |
| `DELETE` | `/watchlists/:id` | Delete watchlist | Authenticated (owner) |
| `GET` | `/alerts` | List price/volume alerts | Authenticated |
| `POST` | `/alerts` | Create alert | Authenticated |
| `DELETE` | `/alerts/:id` | Remove alert | Authenticated (owner) |
| `GET` | `/portfolio` | Tracked positions + P&L | Authenticated |
| `POST` | `/portfolio/positions` | Add position | Authenticated |

### Health

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/health` | API health check | Public |

### WebSocket Channels

| Channel | Payload | Frequency |
|---|---|---|
| `prices:ticker` | `{ symbol, price, change24h }[]` | On upstream change, ≤1/sec per symbol |
| `whale:transactions` | Single transaction object | Pushed on ingestion |
| `sentiment:fear-greed` | `{ value, label, timestamp }` | Every 60s |

---

## 🗄️ Database Schema

Managed via Prisma Migrate. Core models:

| Model | Purpose |
|---|---|
| `User` | Accounts, roles (`USER` / `PREMIUM` / `ADMIN`) |
| `RefreshToken` | Rotating refresh tokens (hashed) |
| `Watchlist` | User-curated symbol lists |
| `Alert` | Price/volume alert conditions |
| `Position` | Portfolio holdings + cost basis |
| `Candle` | OHLCV time-series (Timescale hypertable) |
| `WhaleTransaction` | Large on-chain transactions |
| `FearGreedSnapshot` | Historical sentiment readings |

---

## 🎨 Design System

The frontend preserves the original CryptoVision Pro visual language as Tailwind design tokens:

```ts
// tailwind.config.ts (apps/web)
colors: {
  bg: { primary: '#0B0D17', secondary: '#111425', card: 'rgba(17,20,37,0.75)' },
  neon: { cyan: '#00F0FF', purple: '#9D00FF', green: '#00FF66', red: '#FF3366' },
}
```

- **Glassmorphism cards** with backdrop blur
- **Neon glow** shadows for emphasis
- **Tech grid** radial-gradient background
- **Responsive breakpoints**: desktop / laptop / tablet / mobile

---

## 📂 Project Structure (Detailed)

### Frontend (`apps/web`)

```
apps/web/src/
├── app/                    # App shell, router, providers
├── components/
│   ├── charts/             # PriceCandleChart, TVLBarChart, OnChainMetricsChart,
│   │                       # FearGreedGaugeChart, MarketCapTreemapChart
│   ├── layout/             # Header, TickerBanner, WhaleFeed
│   ├── features/           # WatchlistManager, AlertsManager, PortfolioManager
│   └── auth/               # AuthModal
├── hooks/                  # useMarketSocket (WebSocket + React Query bridge)
├── store/                  # Zustand store (currentSymbol, timeframe, activeTab, etc.)
├── utils/                  # formatCurrency, formatLargeNumber, shortenAddress, formatTimeAgo
├── App.tsx                 # Dashboard shell, tab routing, queries
└── main.tsx                # React entry, QueryClient provider
```

### Backend (`apps/api`)

```
apps/api/src/
├── modules/
│   ├── auth/               # JWT strategy, guards, DTOs, register/login/refresh
│   ├── market-data/        # Tickers, candles, TVL, on-chain, whales, fear/greed
│   ├── watchlists/         # CRUD for user watchlists
│   ├── alerts/             # Price/volume alert management
│   ├── portfolio/          # Position tracking
│   ├── jobs/               # BullMQ schedulers (poll CoinGecko, DeFiLlama, etc.)
│   ├── integrations/       # Third-party API clients
│   ├── health/             # Liveness / readiness
│   ├── prisma/             # Prisma service + module
│   └── redis/              # Redis service + module
├── gateways/               # Socket.IO namespaces for real-time streams
├── common/                 # Guards, interceptors, filters, decorators
└── main.ts                 # NestJS bootstrap, CORS, Helmet, Swagger
```

---

## ⚙️ Configuration

### Environment Variables

See `.env.example` for the full list. Key variables:

```bash
# App
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cryptovision
REDIS_URL=redis://localhost:6379

# Auth
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d

# Third-party market data
COINGECKO_API_KEY=
DEFILLAMA_BASE_URL=https://api.llama.fi
ETHERSCAN_API_KEY=
WHALE_ALERT_API_KEY=

# Observability
LOG_LEVEL=info
SENTRY_DSN=
```

### Docker Compose

```bash
# Start only data infrastructure
npm run docker:up

# Stop and remove containers
npm run docker:down
```

Services:
- `postgres` — TimescaleDB on port `5432`
- `redis` — Redis on port `6379`
- `api` — NestJS on port `4000` (built from `infra/docker/Dockerfile.api`)
- `web` — Nginx serving frontend on port `5173` (built from `infra/docker/Dockerfile.web`)

---

## 🧪 Scripts

### Root (Turborepo)

| Script | Description |
|---|---|
| `npm run dev` | Start both web and api in dev mode |
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Run tests across workspaces |
| `npm run docker:up` | Start Postgres + Redis via Docker Compose |
| `npm run docker:down` | Stop Docker Compose services |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run pending Prisma migrations |

### Frontend (`apps/web`)

| Script | Description |
|---|---|
| `npm run dev` | Vite dev server on `http://localhost:5173` |
| `npm run build` | TypeScript check + Vite build |
| `npm run preview` | Preview production build |

### Backend (`apps/api`)

| Script | Description |
|---|---|
| `npm run dev` | NestJS in watch mode |
| `npm run build` | Compile TypeScript |
| `npm run start:prod` | Run compiled `dist/main` |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run Prisma migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run lint` | ESLint with auto-fix |
| `npm run test` | Jest unit tests |
| `npm run test:cov` | Jest with coverage |

---

## 🔐 Security & Production Notes

- **API keys** for CoinGecko, DeFiLlama, Etherscan, and Whale Alert are called **server-side only** — never expose them in frontend code.
- **Refresh tokens** are stored as `httpOnly`, `Secure`, `SameSite=Strict` cookies.
- **JWT access tokens** have a 15-minute TTL; refresh tokens rotate on use.
- **Rate limiting** is enforced via `@nestjs/throttler` (tiered by endpoint).
- **Input validation** uses `class-validator` DTOs on every mutating endpoint.
- **Secrets** must be supplied via environment variables or a secrets manager in production — do not commit `.env`.

---

## 📊 Features

### Implemented
- [x] React dashboard with Tailwind CSS + ECharts
- [x] Multi-currency candlestick chart (BTC, ETH, BNB, SOL, ADA)
- [x] Timeframe switching (1H, 4H, 1D, 1W, 1M)
- [x] DeFi TVL rankings (Top 10)
- [x] On-chain metrics (dual Y-axis: tx volume + active addresses)
- [x] Whale transaction feed with live WebSocket updates
- [x] Fear & Greed semi-circular gauge
- [x] Market cap rankings
- [x] Ticker banner with auto-scrolling prices
- [x] Zustand state management
- [x] TanStack Query caching + refetch intervals
- [x] WebSocket real-time streaming (`prices:ticker`, `whale:transactions`, `sentiment:fear-greed`)
- [x] User authentication (JWT + OAuth2-ready)
- [x] Watchlists, alerts, and portfolio tracking
- [x] Prisma + PostgreSQL (TimescaleDB) persistence
- [x] Redis caching + BullMQ background jobs
- [x] Swagger / OpenAPI docs at `/api/docs`
- [x] Docker Compose local dev environment
- [x] Turborepo monorepo orchestration

### Roadmap
- [ ] Google / GitHub OAuth login flows
- [ ] Premium role gating (custom alerts, advanced portfolio analytics)
- [ ] Technical indicators (MA, MACD, RSI)
- [ ] News feed integration
- [ ] Mobile native apps (iOS / Android)
- [ ] CI/CD pipelines (GitHub Actions)
- [ ] Observability (Sentry, structured logging)

---

## 🐛 Troubleshooting

### Port conflicts
If `5173` or `4000` are in use, stop the conflicting process or override ports in `vite.config.ts` and `.env`.

### Database connection refused
Ensure Postgres is running:
```bash
npm run docker:up
```
Verify `DATABASE_URL` in `.env` matches the Docker service name (`postgres`).

### Redis connection refused
Ensure the Redis container is healthy:
```bash
docker ps
```

### Prisma generate fails
Make sure `npm install` has completed in `apps/api` so `node_modules` exists before running `prisma:generate`.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing TypeScript conventions (`strict: true`)
- Keep shared types in `packages/shared-types`
- Write tests for new backend modules
- Update this README when adding public API endpoints

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 CryptoVision Pro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 📞 Support & Contact

- **Documentation**: See `QUICKSTART.md`, `FEATURES.md`, `PROJECT_SUMMARY.md`, and `INDEX.md`
- **Issues**: [Report Bugs](https://github.com/yourusername/cryptovision-pro/issues)
- **Discussions**: [Community Forum](https://github.com/yourusername/cryptovision-pro/discussions)

---

## 🌟 Acknowledgments

- [ECharts](https://echarts.apache.org/) — Data visualization
- [NestJS](https://nestjs.com/) — Backend framework
- [Prisma](https://www.prisma.io/) — Database ORM
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [React Query](https://tanstack.com/query) — Server state management
- [TimescaleDB](https://www.timescale.com/) — Time-series data

---

<div align="center">

**Built with ❤️ for the Crypto Community**

[⬆ Back to Top](#-cryptovision-pro)

</div>
