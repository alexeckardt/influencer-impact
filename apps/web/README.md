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

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Features

- Supabase Auth (email/password)
- Influencer profile viewing
- Review submission and display
- Meilisearch integration for discovery
