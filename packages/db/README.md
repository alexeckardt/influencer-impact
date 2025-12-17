# Database Package

Database schema, migrations, and helpers for the Influencer Review Platform.

## Schema Overview

### Tables

- **users** - Supabase Auth linked user profiles
- **influencers** - Influencer profiles being reviewed
- **influencer_handles** - Social media handles for each influencer
- **reviews** - User-submitted reviews with ratings
- **review_labels** - NLP-derived labels (future use)
- **influencer_stats** - Denormalized aggregate statistics

## Migrations

Migrations are versioned SQL files in `migrations/`:

- `001_initial_schema.sql` - Core tables with RLS policies

## Setup

Apply migrations in Supabase SQL Editor or via CLI:

```sql
-- Copy and paste migration SQL files into Supabase SQL Editor
```

## Security

All tables have Row Level Security (RLS) enabled:

- Users can only view/modify their own profile
- Published reviews are viewable by all authenticated users
- Statistics are read-only for all users

## Helper Functions

Import from `@influencer-platform/db`:

```typescript
import { getInfluencerWithStats, updateInfluencerStats } from '@influencer-platform/db';
```
