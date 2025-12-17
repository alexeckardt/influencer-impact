# Influencer Review Platform

A **closed, authenticated monorepo** for a scalable influencer review platform. Built for small teams with production-ready infrastructure.

**Tech Stack**: Next.js • TypeScript • Supabase • Meilisearch • Turborepo • pnpm

---

## 📁 Repository Structure

```
repo/
├── apps/
│   ├── web/                 # Next.js frontend (Vercel)
│   └── worker/              # Node.js background jobs
├── packages/
│   ├── shared/              # Shared Zod schemas & types
│   └── db/                  # Database schema & migrations
├── infra/
│   └── meilisearch/         # Meilisearch Docker config
├── .github/
│   └── workflows/           # CI/CD pipelines
├── turbo.json               # Turborepo config
├── pnpm-workspace.yaml      # pnpm workspace definition
└── package.json             # Root dependencies
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** 9+
- **Supabase** account (free tier works)
- **Vercel** account (for frontend hosting)

### Installation

```bash
git clone <repo-url>
cd influencer-review-platform
pnpm install
```

### Environment Setup
See `ENV.md`.

## 🏃 Running Locally

### Frontend

```bash
cd apps/web
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Worker

```bash
cd apps/worker
pnpm dev
```

### Entire Monorepo (Parallel)

```bash
pnpm dev
```

---

## 🛠️ Development Workflow

### Commands

```bash
pnpm lint           # ESLint across all apps
pnpm typecheck      # TypeScript type checking
pnpm build          # Build all apps
pnpm clean          # Remove all build artifacts
pnpm format         # Format code with Prettier
```

---

## 📦 Apps & Packages

### Apps

#### `apps/web` - Frontend (Next.js)

- Supabase Auth (email/password)
- Influencer profiles
- Review submission
- Meilisearch integration

See [apps/web/README.md](apps/web/README.md)

#### `apps/worker` - Background Jobs

- Process reviews asynchronously
- Calculate influencer statistics
- NLP sentiment extraction (placeholder)
- Generate review labels

See [apps/worker/README.md](apps/worker/README.md)

### Packages

#### `packages/shared`

Zod schemas & TypeScript types:
- `Influencer`, `Handle`, `Review`, `ReviewLabel`, `InfluencerStats`

See [packages/shared/README.md](packages/shared/README.md)

#### `packages/db`

Database schema & helpers:
- SQL migrations for Supabase
- RLS policies
- Helper functions

Tables: `users`, `influencers`, `influencer_handles`, `reviews`, `review_labels`, `influencer_stats`

See [packages/db/README.md](packages/db/README.md)

---

## 🗄️ Database Setup (Supabase)

1. Create project at [supabase.com](https://supabase.com)
2. Copy SQL from [packages/db/migrations/001_initial_schema.sql](packages/db/migrations/001_initial_schema.sql) into Supabase SQL Editor
3. Get credentials: Settings > API
4. Enable Auth: Authentication > Providers > Email/Password

---

## 🔐 Security

- **RLS enabled** on all tables
- **Frontend**: Uses anon key (limited permissions)
- **Worker**: Uses service role key (full permissions, backend-only)
- **No secrets hardcoded**

---

## 🔍 Meilisearch

Optional local setup:

```bash
cd infra/meilisearch
docker-compose up -d
```

Runs on `http://localhost:7700` (dev key: `dev-key-12345`)

---

## 🚢 Deployment

### Frontend (Vercel)

Push to `main` → auto-deploy
PR previews auto-generated

### Worker (Cloud Run / Lambda)

See [.github/workflows/deploy.yml](.github/workflows/deploy.yml) for placeholder setup

---

## 📚 Documentation

- [Frontend](apps/web/README.md)
- [Worker](apps/worker/README.md)  
- [Shared](packages/shared/README.md)
- [Database](packages/db/README.md)
- [Meilisearch](infra/meilisearch/README.md)

---

## ✨ Quick Reference

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Run all apps |
| `pnpm build` | Build all |
| `pnpm lint` | Lint all |
| `pnpm typecheck` | Type check |
| `pnpm clean` | Clean build artifacts |
| `pnpm format` | Format code |

---

**Built by your team** 🚀
