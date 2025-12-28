# Quick Reference Card

## Start Here 🚀

```bash
npm install -g pnpm
pnpm install
pnpm dev
```

Visit http://localhost:3000

---

## Essential Commands

| Command | What It Does |
|---------|-------------|
| `pnpm dev` | Run all apps locally |
| `pnpm build` | Build production bundles |
| `pnpm lint` | Check code style |
| `pnpm typecheck` | Verify TypeScript |
| `pnpm format` | Auto-format code |
| `pnpm clean` | Remove build artifacts |

---

## File Locations

| What | Where |
|------|-------|
| Frontend code | `apps/web/app/` |
| Worker code | `apps/worker/src/` |
| Schemas | `packages/shared/src/schemas/` |
| Database | `packages/db/migrations/` |
| Config | Root: `*.json`, `*.config.*` |
| Docs | `README.md`, `ENV.md`, `STRUCTURE.md` |

---

## Environment Setup

1. **Supabase**
   - Sign up at supabase.com
   - Run SQL from `packages/db/migrations/001_initial_schema.sql`

2. **Frontend (.env.local)**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. **Worker (.env.local)**
   ```env
   SUPABASE_URL=...
   SUPABASE_SB_SECRET=...
   ```

See `ENV.md` for complete details.

---

## Package Imports

```typescript
// Schemas
import { InfluencerSchema, ReviewSchema } from '@influencer-platform/shared';

// Database
import { getInfluencerWithStats } from '@influencer-platform/db';
```

---

## Database Tables

- `users` - User profiles
- `influencers` - Influencer profiles
- `influencer_handles` - Social media
- `reviews` - User reviews
- `review_labels` - NLP tags
- `influencer_stats` - Aggregates

Full schema: `packages/db/migrations/001_initial_schema.sql`

---

## Deployment

**Frontend (Vercel)**
- Push to `main` → auto deploys
- Set env vars in Vercel dashboard

**Worker (Cloud Run / Lambda)**
- Docker container ready
- Set SERVICE_ROLE_KEY as secret

---

## Documentation

- `README.md` - Main guide
- `ENV.md` - Environment variables
- `STRUCTURE.md` - Complete reference
- `SETUP_COMPLETE.md` - Setup summary
- `apps/*/README.md` - App-specific docs

---

## Key Files to Know

- `turbo.json` - Build configuration
- `pnpm-workspace.yaml` - Workspace setup
- `packages/shared/src/index.ts` - Schemas
- `packages/db/migrations/001_initial_schema.sql` - Schema
- `.github/workflows/*.yml` - CI/CD

---

## Common Tasks

### Add a new schema
```bash
# 1. Create file in packages/shared/src/schemas/
# 2. Export from packages/shared/src/index.ts
# 3. Use in apps via import
```

### Run worker locally
```bash
cd apps/worker
pnpm dev
```

### Deploy frontend to Vercel
```bash
git push origin main
# Auto-deploys via GitHub Actions
```

### Add a new package
```bash
# 1. Create in packages/
# 2. Add to pnpm-workspace.yaml (auto-detected)
# 3. Reference via @influencer-platform/pkg-name
```

---

## Security Checklist

- [ ] `.env.local` in `.gitignore`
- [ ] `NEXT_PUBLIC_*` only in frontend
- [ ] Service role key only in worker
- [ ] RLS enabled on all tables
- [ ] No secrets in code
- [ ] Environment variables validated

---

## Troubleshooting

**Port already in use?**
```bash
# Frontend uses 3000, worker uses separate process
# Use: pnpm dev -- -p 3001 (for different port)
```

**Can't connect to Supabase?**
- Check `.env.local` credentials
- Verify project is active in Supabase dashboard
- Check firewall/VPN

**TypeScript errors?**
```bash
pnpm typecheck
```

**Build failed?**
```bash
pnpm clean
pnpm install
pnpm build
```

---

## Links

- [Supabase](https://supabase.com)
- [Vercel](https://vercel.com)
- [Next.js](https://nextjs.org)
- [Turborepo](https://turbo.build)
- [Zod](https://zod.dev)
- [Meilisearch](https://meilisearch.com)

---

**Need help?** Check the relevant README file or ask your team lead.

**Ready?** Run `pnpm dev` and start building! 🚀
