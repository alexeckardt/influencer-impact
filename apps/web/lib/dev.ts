/**
 * Development helpers and setup
 * Not needed for production
 */

import type { Influencer } from '@influencer-platform/shared';

/**
 * Mock data for local development
 */
export const MOCK_INFLUENCERS: Influencer[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Alex Chen',
    bio: 'Tech creator and educator',
    primary_niche: 'Technology',
    verified: true,
    profile_image_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Jordan Lee',
    bio: 'Fashion and lifestyle',
    primary_niche: 'Fashion',
    verified: false,
    profile_image_url:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Setup guide for local development
 */
export const DEVELOPMENT_GUIDE = `
# Local Development Setup

## 1. Database
- Create Supabase project at supabase.com
- Apply schema from packages/db/migrations/001_initial_schema.sql
- Note Project URL and keys

## 2. Environment Variables
- Copy .env.local.example to .env.local (create if needed)
- Fill in Supabase credentials

## 3. Run Services
- Frontend: cd apps/web && pnpm dev
- Worker: cd apps/worker && pnpm dev
- Meilisearch: cd infra/meilisearch && docker-compose up

## 4. Test
- Frontend: http://localhost:3000
- Worker: Logs in terminal
- Meilisearch: http://localhost:7700
`;
