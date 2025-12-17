# Shared Package

Shared TypeScript types, Zod schemas, and utilities used across the monorepo.

## Usage

All packages import from `@influencer-platform/shared`:

```typescript
import { InfluencerSchema, CreateInfluencerSchema } from '@influencer-platform/shared';

const influencer = InfluencerSchema.parse(data);
```

## Schemas

- **Influencer** - Profile data
- **Handle** - Social media handles
- **Review** - User reviews with ratings
- **ReviewLabel** - NLP-derived labels
- **InfluencerStats** - Aggregated statistics
