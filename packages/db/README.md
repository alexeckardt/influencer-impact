# Database Package

Database schema, migrations, and type-safe query helpers for the Influencer Review Platform.

## Technology Stack

- **Drizzle ORM** - Type-safe schema definition and migrations
- **PostgreSQL** - Via Supabase
- **Migrations** - Auto-generated from TypeScript schema

## Schema Overview

Define your database schema in `src/schema.ts` using Drizzle. Current tables:

- **users** - Supabase Auth linked user profiles
- **influencers** - Influencer profiles being reviewed
- **influencer_handles** - Social media handles for each influencer (twitter, instagram, tiktok, youtube)
- **reviews** - User-submitted reviews with ratings and sentiment
- **review_labels** - NLP-derived labels (sentiment, topic, professionalism, authenticity)
- **influencer_stats** - Denormalized aggregate statistics, updated by background jobs

## Workflow

### 1. Modify Schema

Edit `src/schema.ts` to add/modify tables:

```typescript
export const myTable = pgTable('my_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 2. Generate Migration

Generate SQL migration from your TypeScript schema:

```bash
cd packages/db
pnpm db:generate
```

This creates a new migration file in `migrations/` with auto-generated SQL.

### 3. Apply Migration

Apply migrations to your Supabase database:

```bash
pnpm db:migrate
```

### 4. Use in Code

Import types and query helpers:

```typescript
import { influencers, reviews } from '@influencer-platform/db';
import { getInfluencerWithStats } from '@influencer-platform/db';
```

## Commands

- `pnpm db:generate` - Generate migrations from schema changes
- `pnpm db:migrate` - Apply pending migrations to database
- `pnpm db:studio` - Open Drizzle Studio (visual database explorer)
- `pnpm build` - Compile TypeScript
- `pnpm typecheck` - Type check without emitting

## Environment Variables

Set `DATABASE_URL` in `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

For Supabase, find it in Settings > Database > Connection Pooling.

## Security

All tables have Row Level Security (RLS) enabled in Supabase:

- Users can only view/modify their own profile
- Published reviews are viewable by all authenticated users
- Statistics are read-only for all users

Set up RLS policies in Supabase SQL Editor for production deployments.

## Migrations Folder

Auto-generated SQL migrations are stored in `migrations/`:

```
migrations/
├── 0000_initial_schema.sql
├── 0001_add_new_field.sql
└── ...
```

Do NOT edit these files manually. Instead, modify `src/schema.ts` and regenerate.

## Resources

- [Drizzle Docs](https://orm.drizzle.team)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase Database](https://supabase.com/docs/guides/database)
