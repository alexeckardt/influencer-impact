# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Users / Browsers                             │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ HTTPS
             │
   ┌─────────▼──────────┐
   │   Vercel/CDN       │
   │  (Frontend: Next.js)◄─────── GitHub: main branch
   │   apps/web         │
   │                    │
   │ ✓ Auth UI          │
   │ ✓ Reviews UI       │
   │ ✓ Profile UI       │
   └─────────┬──────────┘
             │
             │ RPC / REST API
             │
   ┌─────────▼──────────────────────┐
   │  Supabase                       │
   │  ┌─────────────────────────────┤
   │  │ PostgreSQL Database         │
   │  │ ┌──────────────────────────┤
   │  │ │ Tables (6):              │
   │  │ │ • users                  │
   │  │ │ • influencers            │
   │  │ │ • influencer_handles     │
   │  │ │ • reviews                │
   │  │ │ • review_labels          │
   │  │ │ • influencer_stats       │
   │  │ └──────────────────────────┤
   │  │                             │
   │  │ Row Level Security (RLS)   │
   │  │ • Per-user data access     │
   │  │ • Published reviews visible│
   │  └─────────────────────────────┤
   │                                 │
   │ Authentication                  │
   │ • Email/Password                │
   │ • Session management            │
   └────────┬──────────────────────┘
            │
            │ Service Role Access (Backend Only)
            │
   ┌────────▼──────────────────────┐
   │ Cloud Run / Lambda             │
   │ Background Worker              │
   │ apps/worker                    │
   │                                │
   │ ✓ Process new reviews         │
   │ ✓ Extract sentiment (NLP)     │
   │ ✓ Generate labels             │
   │ ✓ Aggregate statistics        │
   │ ✓ Update influencer_stats     │
   └────────────────────────────────┘
```

---

## Data Flow

### User Review Submission
```
User Browser
    │
    ├─► Submit Review
    │        │
    │        ▼
    │   Next.js Frontend
    │   (apps/web)
    │        │
    │        ├─ Validate with Zod
    │        │
    │        ▼
    │   Supabase Client
    │   (Anon Key)
    │        │
    │        ▼
    │   PostgreSQL
    │   INSERT review
    │        │
    │        ▼ (RLS Policy)
    │   Review stored
    │   (user_id = auth.uid())
    │
    └─── Success Response
```

### Background Processing
```
New Review Created
    │
    ▼
Worker Polls DB
(Cloud Run)
    │
    ├─ Fetch unprocessed reviews
    │
    ├─ Extract sentiment (NLP)
    │
    ├─ Generate review_labels
    │
    ├─ Recalculate stats
    │
    ▼
UPDATE influencer_stats
(Service Role Access)
    │
    ▼
Updated Stats Available
(Frontend reads via RLS)
```

---

## Monorepo Dependencies

```
apps/web (Frontend)
├── Depends on:
│   ├── @influencer-platform/shared (Zod schemas)
│   └── Direct Supabase client
│
├── Exports:
│   └── UI Components & Pages

apps/worker (Background Jobs)
├── Depends on:
│   ├── @influencer-platform/shared (Schemas)
│   ├── @influencer-platform/db (Helpers)
│   └── Supabase client
│
├── Exports:
│   └── Job processors

packages/shared (Schemas)
├── Depends on:
│   └── zod (Validation)
│
├── Exports:
│   ├── InfluencerSchema
│   ├── HandleSchema
│   ├── ReviewSchema
│   ├── ReviewLabelSchema
│   ├── InfluencerStatsSchema
│   └── Utilities

packages/db (Database)
├── Depends on:
│   ├── @influencer-platform/shared (Types)
│   └── @supabase/supabase-js (Client)
│
├── Exports:
│   ├── Database helpers
│   └── Query functions
│
├── Files:
│   └── migrations/001_initial_schema.sql
```

---

## Security Boundaries

```
┌──────────────────────────────────────────────────────────┐
│ PUBLIC (Browser)                                         │
│                                                          │
│  NEXT_PUBLIC_SUPABASE_URL    ✅ OK (public)             │
│  NEXT_PUBLIC_SUPABASE_ANON_KEY ✅ OK (limited scope)    │
│                                                          │
└──────────────────┬───────────────────────────────────────┘
                   │ RLS Policies
                   │
┌──────────────────▼───────────────────────────────────────┐
│ DATABASE (Supabase Postgres)                            │
│                                                          │
│  • Users: Can read/write own profile only               │
│  • Reviews: Can read published, write own               │
│  • Influencers: Can read only                           │
│  • Stats: Can read only                                 │
│                                                          │
└──────────────────┬───────────────────────────────────────┘
                   │ Service Role Access
                   │
┌──────────────────▼───────────────────────────────────────┐
│ PRIVATE (Backend Only)                                   │
│                                                          │
│  SUPABASE_URL                ❌ NEVER in frontend       │
│  SUPABASE_SERVICE_ROLE_KEY   ❌ NEVER in frontend       │
│  (Only in Cloud Run / Lambda)                           │
│                                                          │
│  Can read/write all data                                │
│  (For stats aggregation, moderation, etc.)              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Build & Deployment Pipeline

```
Developer pushes to GitHub (main or PR)
    │
    ▼
GitHub Actions CI Workflow
    │
    ├─ Install dependencies (pnpm)
    │
    ├─ Run Turbo tasks:
    │  ├─ pnpm lint (ESLint)
    │  ├─ pnpm typecheck (TypeScript)
    │  └─ pnpm build (Compile all)
    │
    ├─ Dependency audit
    │
    └─ On PR: Deploy preview to Vercel
    
    └─ On main: Deploy production
       ├─ Frontend → Vercel
       └─ Worker → Cloud Run (placeholder)
```

---

## Caching Strategy (Turborepo)

```
Turbo Build Cache
├─ Shared across team
├─ Hash-based invalidation
├─ Skips unchanged packages
│
└─ Cache invalidated by:
   ├─ Package source changes
   ├─ Dependencies changes
   ├─ Environment variables
   └─ Rebuild commands (clean)
```

---

## File Access Patterns

```
Frontend Reads
├─ User profile (own only via RLS)
├─ Published reviews (all)
├─ Influencer profiles (all)
└─ Stats (aggregated)

Frontend Writes
├─ Profile updates (own only)
├─ New reviews (draft)
└─ Review edits (own only)

Worker Reads
├─ All reviews (including drafts)
├─ All user data
└─ Current stats

Worker Writes
├─ Review labels
├─ Sentiment updates
└─ Updated stats
```

---

## Environment Isolation

```
Development (.env.local)
├─ Local Supabase URL
├─ Dev project keys
└─ Full access (service role)

Staging (Vercel Preview)
├─ Same as Production
├─ Preview secrets
└─ Read-only data flow

Production
├─ Vercel + Cloud Run
├─ Real Supabase project
└─ Anon key (frontend), Service key (worker)
```

---

## Package Publishing (Internal)

Packages are published to local workspace (not npm):

```
pnpm-workspace.yaml:
  packages:
    - apps/*
    - packages/*

package.json dependencies:
  "@influencer-platform/shared": "workspace:*"
  "@influencer-platform/db": "workspace:*"
```

Benefits:
- Always in sync
- No version management
- Type-safe imports
- Fast installation

---

## Scaling Considerations

### Current Limits
- Supabase free tier: 500MB storage
- Postgres: ~50k concurrent connections
- Vercel: Auto-scaling

### For Growth
- Upgrade Supabase plan
- Add database indexes (already included)
- Implement caching layer
- Add Meilisearch for search
- Scale worker with Cloud Run/Lambda

### Architecture Supports
- Multi-region deployment
- Database replication
- Load balancing
- CDN distribution
- Horizontal scaling

---

## Error Handling Flow

```
User Action
    │
    ▼
Zod Validation (Frontend)
    ├─ ❌ Invalid → Show error
    │
    ▼
Supabase Client
    ├─ ❌ Network error → Retry/offline
    ├─ ❌ Auth error → Redirect to login
    ├─ ❌ RLS violation → Hidden error
    │
    ▼
Database
    ├─ ❌ Constraint violation → User-friendly error
    │
    ▼
Success → Update UI
```

---

## Future Enhancements (Out of Scope)

This foundation supports:
- ✨ Real-time features (Supabase subscriptions)
- 📧 Email notifications
- 🔔 Push notifications
- 📊 Analytics dashboard
- 🤖 Advanced NLP
- 🎯 Recommendation engine
- 🔍 Full-text search (Meilisearch)
- 📱 Mobile app (React Native)

All can be added without rearchitecting.

---

## Architecture Principles

1. **Separation of Concerns**
   - Frontend (UI)
   - Backend (Jobs)
   - Shared (Types)
   - Database (Schema)

2. **Type Safety**
   - Zod validation
   - TypeScript inference
   - Compile-time checks

3. **Security by Default**
   - RLS policies
   - Environment separation
   - Secrets management

4. **Scalability**
   - Denormalized stats
   - Indexed queries
   - Async processing

5. **Developer Experience**
   - Monorepo structure
   - Fast builds
   - Clear documentation

---

This architecture is designed for small teams that scale to enterprise scale.
