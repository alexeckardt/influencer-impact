# tRPC API Quick Reference

## Available APIs

### 🔴 Review Reports (`trpc.reviewReports.*`)

#### `checkReportStatus` (Query)
Check if current user has reported a review.
```typescript
const { data } = trpc.reviewReports.checkReportStatus.useQuery({
  reviewId: 'uuid',
});
// Returns: { hasReported: boolean }
```

#### `createReport` (Mutation)
Create a new review report.
```typescript
const createReport = trpc.reviewReports.createReport.useMutation();
createReport.mutate({
  reviewId: 'uuid',
  reasons: ['Spam or Fake', 'Offensive Content'],
  additionalInfo: 'Optional details',
});
// Returns: { success: boolean, reportId: string }
```

#### `getReports` (Query) - Admin Only
Get all review reports with optional filtering.
```typescript
const { data } = trpc.reviewReports.getReports.useQuery({
  status: 'open',     // optional: 'open' | 'investigating' | 'closed'
  showAll: false,     // optional: show all statuses
});
// Returns: { reports: ReviewReport[] }
```

#### `updateReportStatus` (Mutation) - Admin Only
Update a report's status.
```typescript
const updateStatus = trpc.reviewReports.updateReportStatus.useMutation();
updateStatus.mutate({
  reportId: 'uuid',
  status: 'investigating', // 'open' | 'investigating' | 'closed'
});
// Returns: { success: boolean }
```

---

### 📝 Reviews (`trpc.reviews.*`)

#### `create` (Mutation)
Create a new review for an influencer.
```typescript
const createReview = trpc.reviews.create.useMutation();
createReview.mutate({
  influencerId: 'uuid',
  professionalismRating: 5,
  communicationRating: 4,
  contentQualityRating: 5,
  roiRating: 4,
  reliabilityRating: 5,
  pros: 'Great communication...',
  cons: 'Could improve...',
  advice: 'Would recommend...',
  wouldWorkAgain: true,
});
// Returns: { success: boolean, reviewId: string, message: string }
```

#### `getById` (Query)
Get a specific review with full details.
```typescript
const { data } = trpc.reviews.getById.useQuery({
  reviewId: 'uuid',
});
// Returns: Full review object with influencer and reviewer details
```

#### `checkUserReview` (Query)
Check if current user has reviewed an influencer.
```typescript
const { data } = trpc.reviews.checkUserReview.useQuery({
  influencerId: 'uuid',
});
// Returns: { hasReviewed: boolean, reviewId: string | null }
```

---

## Type Imports

```typescript
// Import tRPC client
import { trpc } from '@/lib/trpc/client';

// Import types
import type {
  ReviewReport,
  CreateReviewInput,
  ReportStatus,
  RouterOutput,
} from '@/lib/trpc/types';

// Or import directly from shared
import type {
  createReviewInputSchema,
} from '@influencer-platform/shared';
```

---

## Common Patterns

### Basic Query
```typescript
const { data, isLoading, error, refetch } = trpc.reviews.getById.useQuery({
  reviewId: 'uuid',
});
```

### Mutation with Success Handler
```typescript
const createReview = trpc.reviews.create.useMutation({
  onSuccess: (data) => {
    console.log('Review created:', data.reviewId);
    // Redirect or show success message
  },
  onError: (error) => {
    console.error('Failed to create review:', error.message);
  },
});

// Trigger mutation
createReview.mutate({ /* input */ });

// Check mutation state
const { isLoading, isError, error } = createReview;
```

### Invalidate Queries After Mutation
```typescript
const utils = trpc.useUtils();

const updateStatus = trpc.reviewReports.updateReportStatus.useMutation({
  onSuccess: () => {
    // Refetch all reports after status update
    utils.reviewReports.getReports.invalidate();
  },
});
```

### Conditional Query (Don't Run Until Ready)
```typescript
const { data: user } = trpc.user.getCurrent.useQuery();

const { data: reviews } = trpc.reviews.checkUserReview.useQuery(
  { influencerId: user?.id },
  { enabled: !!user?.id } // Only run when we have user ID
);
```

---

## Error Handling

All tRPC procedures throw `TRPCError` with specific codes:

- `UNAUTHORIZED` (401) - Not logged in
- `FORBIDDEN` (403) - Insufficient permissions (e.g., not admin)
- `BAD_REQUEST` (400) - Invalid input (Zod validation failed)
- `NOT_FOUND` (404) - Resource doesn't exist
- `INTERNAL_SERVER_ERROR` (500) - Server error

```typescript
const createReport = trpc.reviewReports.createReport.useMutation({
  onError: (error) => {
    if (error.data?.code === 'UNAUTHORIZED') {
      // Redirect to login
    } else if (error.data?.code === 'FORBIDDEN') {
      // Show access denied message
    } else {
      // Show generic error
      console.error(error.message);
    }
  },
});
```

---

## Validation

All inputs are validated using Zod schemas. TypeScript will show errors for:
- Missing required fields
- Wrong types
- Invalid enum values
- String length constraints
- Number ranges

Example:
```typescript
createReview.mutate({
  influencerId: 'not-a-uuid', // ❌ TypeScript error: must be valid UUID
  professionalismRating: 6,    // ❌ TypeScript error: must be 1-5
  pros: 'short',               // ❌ Zod validation error: min 10 chars
});
```

---

## Available Report Reasons

```typescript
type ReportReason =
  | 'Spam or Fake'
  | 'Offensive Content'
  | 'Inaccurate Information'
  | 'Conflict of Interest'
  | 'Duplicate Review'
  | 'Inappropriate Language'
  | 'Other';
```

## Available Report Statuses

```typescript
type ReportStatus = 'open' | 'investigating' | 'closed';
```

---

## Adding New APIs

See [TRPC_GUIDE.md](./TRPC_GUIDE.md) for detailed instructions on:
1. Creating new routers
2. Adding procedures
3. Writing Zod schemas
4. Testing APIs
