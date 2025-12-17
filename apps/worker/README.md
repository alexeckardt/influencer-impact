# Background Worker

Node.js TypeScript worker for async jobs: processing reviews, aggregating stats, and future NLP tasks.

## Running Locally

```bash
cd apps/worker
pnpm install
pnpm dev
```

## Environment Variables

Create `.env.local`:

```
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**⚠️ Security**: `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to frontend. Use only in backend/worker.

## Features

- ✓ Review processing (sentiment extraction placeholder)
- ✓ Influencer stats aggregation
- ✓ Database integration via `@influencer-platform/db`
- 🔮 Future: Queue integration (Google Pub/Sub, AWS SQS)
- 🔮 Future: NLP sentiment analysis
- 🔮 Future: Topic extraction

## Architecture

Designed to run independently:
- Cloud Run (Google Cloud)
- AWS Lambda
- Self-hosted via Docker

Listens for events/jobs and processes them asynchronously.
