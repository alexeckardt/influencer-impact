# tRPC Implementation Guide

## Overview

This project now uses **tRPC** for type-safe API calls. This ensures that:
- 🎯 **Types are synchronized** between client and server automatically
- ✅ **Breaking changes are caught** at compile time, not runtime
- 📝 **No manual documentation** needed - types ARE the documentation
- 🔒 **Runtime validation** with Zod schemas
- 🚀 **Better DX** with autocomplete and inline errors

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Client)                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Components use trpc.routerName.procedure.useQuery │    │
│  │  - Full TypeScript autocomplete                     │    │
│  │  - Automatic caching & refetching                   │    │
│  │  - No manual fetch() calls                          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓↑ HTTP /api/trpc
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Server)                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Routers define procedures with:                    │    │
│  │  - Input validation (Zod schemas)                   │    │
│  │  - Business logic                                   │    │
│  │  - Output typing                                    │    │
│  │  - Auth middleware (protectedProcedure, adminProc)  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  Shared Package (@influencer-platform/shared)│
│  - Zod schemas for validation                               │
│  - TypeScript types exported from schemas                   │
│  - Reusable across client and server                        │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
apps/web/
├── app/
│   ├── api/
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts          # tRPC HTTP handler
│   └── layout.tsx                    # TRPCProvider wrapper
├── lib/
│   └── trpc/
│       ├── init.ts                   # tRPC instance & procedures
│       ├── context.ts                # Request context (auth, supabase)
│       ├── client.ts                 # React tRPC client
│       ├── provider.tsx              # React Query provider
│       └── routers/
│           ├── index.ts              # Main app router
│           ├── review-reports.ts     # Review reports API
│           └── reviews.ts            # Reviews API
└── components/
    └── *.tsx                         # Use trpc hooks

packages/shared/
└── src/
    └── schemas/
        └── api.ts                    # Zod validation schemas
```

## Creating a New API Endpoint

### 1. Define Schemas (in `packages/shared/src/schemas/api.ts`)

```typescript
import { z } from 'zod';

// Input validation
export const createCommentInputSchema = z.object({
  reviewId: z.string().uuid(),
  content: z.string().min(10).max(1000),
});

// Output type (optional but recommended)
export const commentSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export type Comment = z.infer<typeof commentSchema>;
```

### 2. Create Router (in `apps/web/lib/trpc/routers/`)

```typescript
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../init';
import { 
  createCommentInputSchema,
  commentSchema 
} from '@influencer-platform/shared';

export const commentsRouter = router({
  // GET endpoint
  getByReviewId: publicProcedure
    .input(z.object({ reviewId: z.string().uuid() }))
    .output(z.object({ comments: z.array(commentSchema) }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('comments')
        .select('*, author:users(*)')
        .eq('review_id', input.reviewId);

      if (error) throw new Error('Failed to fetch comments');
      
      return { comments: data || [] };
    }),

  // POST endpoint (requires auth)
  create: protectedProcedure
    .input(createCommentInputSchema)
    .output(z.object({ 
      success: z.boolean(), 
      commentId: z.string() 
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('comments')
        .insert({
          review_id: input.reviewId,
          user_id: ctx.user.id, // Available from protectedProcedure
          content: input.content,
        })
        .select('id')
        .single();

      if (error) throw new Error('Failed to create comment');

      return { 
        success: true, 
        commentId: data.id 
      };
    }),
});
```

### 3. Add to Main Router (in `apps/web/lib/trpc/routers/index.ts`)

```typescript
import { router } from '../init';
import { reviewReportsRouter } from './review-reports';
import { reviewsRouter } from './reviews';
import { commentsRouter } from './comments'; // Add import

export const appRouter = router({
  reviewReports: reviewReportsRouter,
  reviews: reviewsRouter,
  comments: commentsRouter, // Add router
});

export type AppRouter = typeof appRouter;
```

### 4. Use in Components

```typescript
'use client';

import { trpc } from '@/lib/trpc/client';

export function CommentList({ reviewId }: { reviewId: string }) {
  // 🎯 TYPE-SAFE QUERY - input and output fully typed!
  const { data, isLoading, error } = trpc.comments.getByReviewId.useQuery({
    reviewId, // TypeScript validates this matches the schema
  });

  // 🎯 TYPE-SAFE MUTATION
  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      // Automatically refetch comments
      utils.comments.getByReviewId.invalidate({ reviewId });
    },
  });

  const handleSubmit = (content: string) => {
    createComment.mutate({
      reviewId,
      content, // TypeScript validates this
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // data is fully typed as { comments: Comment[] }
  return (
    <div>
      {data.comments.map(comment => (
        <div key={comment.id}>
          <p>{comment.content}</p>
          <span>{comment.author.name}</span>
        </div>
      ))}
    </div>
  );
}
```

## Procedure Types

### `publicProcedure`
- No authentication required
- Use for public data (search, public profiles, etc.)
- `ctx.user` will be `null` if not logged in

### `protectedProcedure`
- Requires authentication
- Automatically throws `UNAUTHORIZED` if not logged in
- `ctx.user` is guaranteed to be non-null
- Use for user-specific data

### `adminProcedure`
- Requires authentication AND admin role
- Automatically throws `FORBIDDEN` if not admin
- `ctx.userData.role` is guaranteed to be `'admin'`
- Use for admin-only endpoints

## Context Available in All Procedures

```typescript
interface Context {
  supabase: SupabaseClient;  // Authenticated Supabase client
  user: User | null;         // Supabase auth user (null if not logged in)
  userData: UserData | null; // Full user data from database (null if not logged in)
}

// In protectedProcedure/adminProcedure, user & userData are guaranteed non-null
```

## Benefits Over Traditional API Routes

### Before (Traditional API Route)
```typescript
// ❌ No type safety
const response = await fetch('/api/reviews', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ influencerId, rating: 5 }), // typo will fail at runtime
});

const data = await response.json(); // data is 'any'
if (!response.ok) {
  // Manual error handling
}
```

### After (tRPC)
```typescript
// ✅ Full type safety
const createReview = trpc.reviews.create.useMutation();

createReview.mutate({
  influencerId,
  rating: 5, // TypeScript error if wrong type or missing required field
});

// data is typed as { success: boolean, reviewId: string }
// Automatic error handling, loading states, caching, etc.
```

## Migration Strategy

You can migrate incrementally:

1. **Keep existing API routes** - They work alongside tRPC
2. **Migrate high-value endpoints first** - Start with frequently used/complex ones
3. **Update components gradually** - Replace `fetch()` with `trpc` hooks
4. **Eventually deprecate old routes** - Once all consumers use tRPC

## Common Patterns

### Optimistic Updates
```typescript
const utils = trpc.useUtils();

const updateStatus = trpc.reviewReports.updateReportStatus.useMutation({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await utils.reviewReports.getReports.cancel();
    
    // Snapshot previous value
    const previous = utils.reviewReports.getReports.getData();
    
    // Optimistically update
    utils.reviewReports.getReports.setData({ showAll: false }, (old) => ({
      ...old,
      reports: old.reports.map(r => 
        r.id === newData.reportId ? { ...r, status: newData.status } : r
      ),
    }));
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    utils.reviewReports.getReports.setData({ showAll: false }, context.previous);
  },
  onSettled: () => {
    // Refetch after mutation
    utils.reviewReports.getReports.invalidate();
  },
});
```

### Infinite Queries (Pagination)
```typescript
const { data, fetchNextPage, hasNextPage } = trpc.reviews.list.useInfiniteQuery(
  { limit: 20 },
  {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  }
);
```

### Dependent Queries
```typescript
const { data: user } = trpc.user.getCurrent.useQuery();

const { data: reviews } = trpc.reviews.getByUser.useQuery(
  { userId: user?.id },
  { enabled: !!user?.id } // Only run when user is loaded
);
```

## Testing

tRPC makes testing easier:

```typescript
import { appRouter } from '@/lib/trpc/routers';
import { createContext } from '@/lib/trpc/context';

// Create test caller
const caller = appRouter.createCaller(await createContext());

// Test with full type safety
const result = await caller.reviews.create({
  influencerId: 'test-id',
  rating: 5,
  // ... other fields
});

expect(result.success).toBe(true);
```

## Troubleshooting

### "Type instantiation is excessively deep"
- Split large routers into smaller sub-routers
- Use `z.lazy()` for recursive schemas

### "Property does not exist on type"
- Ensure `AppRouter` type is exported from `routers/index.ts`
- Restart TypeScript server

### "UNAUTHORIZED" errors
- Check if procedure is using correct middleware
- Verify Supabase session is valid
- Check network tab for cookie/auth header

## Resources

- [tRPC Docs](https://trpc.io)
- [Zod Docs](https://zod.dev)
- [React Query Docs](https://tanstack.com/query/latest)

## Next Steps

1. Migrate existing API routes to tRPC routers
2. Update components to use tRPC hooks
3. Add more Zod schemas for validation
4. Remove old API routes once migration is complete
