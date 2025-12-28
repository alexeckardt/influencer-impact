# Frontend (apps/web)

Next.js App Router-based frontend with Supabase authentication.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## Environment Variables

Create `.env.local`:

## Installation of new packages

When adding new packages, run the following command from the monorepo root:

```bash
cd apps/web
pnpm add <package name>
```

Then, restart the development server.

## Features

- Supabase Auth (email/password)
- Influencer profile viewing
- Review submission and display
- Meilisearch integration for discovery
