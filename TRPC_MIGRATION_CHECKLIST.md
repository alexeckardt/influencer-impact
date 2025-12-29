# tRPC Migration Checklist

Use this checklist to migrate your existing API routes to tRPC.

## ✅ Setup Complete

- [x] Install tRPC dependencies
- [x] Create tRPC context and procedures
- [x] Set up React Query provider
- [x] Create example routers (reviews, reviewReports)
- [x] Add Zod validation schemas
- [x] Wrap app in TRPCProvider

## 📋 Migration Roadmap

### Priority 1: High-Traffic APIs (Migrate First)
These are frequently used and will benefit most from type safety:

- [ ] **Reviews API**
  - [x] `POST /api/reviews` → `trpc.reviews.create`
  - [x] `GET /api/reviews/[id]` → `trpc.reviews.getById`
  - [x] `GET /api/reviews/check/[id]` → `trpc.reviews.checkUserReview`
  - [ ] Update ReviewForm component to use tRPC
  - [ ] Update ReviewDetail component to use tRPC

- [ ] **Review Reports API**
  - [x] `GET /api/reviews/[id]/report` → `trpc.reviewReports.checkReportStatus`
  - [x] `POST /api/reviews/[id]/report` → `trpc.reviewReports.createReport`
  - [x] `GET /api/admin/review-reports` → `trpc.reviewReports.getReports`
  - [x] `PATCH /api/admin/review-reports/[id]` → `trpc.reviewReports.updateReportStatus`
  - [ ] Update ReviewReportsTable component to use tRPC
  - [ ] Update ReportReviewModal component to use tRPC

### Priority 2: Admin APIs
Type safety prevents accidental breaking changes in admin features:

- [ ] **Admin Prospects API**
  - [ ] Create `trpc.admin.approveProspect` router
  - [ ] Create `trpc.admin.rejectProspect` router
  - [ ] Create `trpc.admin.getProspects` router
  - [ ] Update ProspectsTable component to use tRPC
  - [ ] Remove old API routes:
    - [ ] `/api/admin/approve-prospect`
    - [ ] `/api/admin/reject-prospect`

### Priority 3: Influencer Search APIs
Complex queries benefit from type safety:

- [ ] **Influencer API**
  - [ ] Create `trpc.influencers.search` router
  - [ ] Create `trpc.influencers.getById` router
  - [ ] Create Zod schemas for search filters
  - [ ] Update SearchInfluencers component to use tRPC
  - [ ] Update InfluencerProfile component to use tRPC
  - [ ] Remove old API routes:
    - [ ] `/api/influencers/search`
    - [ ] `/api/influencers/[id]`

### Priority 4: User Profile APIs
Simple but important for user experience:

- [ ] **User Profile API**
  - [ ] Create `trpc.user.getProfile` router
  - [ ] Create `trpc.user.updateProfile` router
  - [ ] Create `trpc.user.updatePassword` router
  - [ ] Update ProfileSettings component to use tRPC
  - [ ] Remove old API routes:
    - [ ] `/api/user/profile-settings`
    - [ ] `/api/setup-account`

## 📝 Component Migration Template

For each component using fetch, follow this pattern:

### Before (with fetch):
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/endpoint');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### After (with tRPC):
```typescript
const { data, isLoading } = trpc.router.procedure.useQuery({
  // inputs
});
```

## 🧪 Testing Each Migration

For each migrated endpoint:

1. **Test the tRPC endpoint works**
   ```bash
   # Start dev server
   pnpm dev
   
   # Test in browser or with curl
   ```

2. **Update component to use tRPC**
   - Replace useState/useEffect with useQuery/useMutation
   - Remove manual fetch logic
   - Update type imports

3. **Test the component**
   - Verify data loads correctly
   - Test mutations work
   - Check error handling
   - Verify loading states

4. **Check TypeScript errors**
   ```bash
   pnpm typecheck
   ```

5. **Remove old API route** (only after confirming tRPC works)
   - Delete the old route.ts file
   - Search codebase for any remaining references

## 🎯 Success Criteria

- [ ] All API calls are type-safe
- [ ] No more manual fetch() calls
- [ ] TypeScript errors show when API contracts change
- [ ] All old API routes removed
- [ ] Documentation updated
- [ ] Team trained on tRPC usage

## 📚 Resources for Team

- [TRPC_GUIDE.md](./TRPC_GUIDE.md) - Detailed implementation guide
- [TRPC_API_REFERENCE.md](./TRPC_API_REFERENCE.md) - Quick API reference
- [ReviewReportsTable.trpc-example.tsx](./apps/web/components/ReviewReportsTable.trpc-example.tsx) - Real migration example

## 🚀 Next Steps

1. Start with Priority 1 migrations
2. Test each migration thoroughly
3. Update components incrementally
4. Remove old API routes only after confirming tRPC works
5. Document any custom patterns for your team
6. Consider adding more tRPC features:
   - [ ] WebSocket subscriptions for real-time updates
   - [ ] File uploads
   - [ ] Server-sent events
   - [ ] Batch requests optimization
