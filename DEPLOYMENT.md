# Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] TypeScript compiling without errors
- [ ] ESLint passes
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Team reviewed and approved

---

## Frontend Deployment (Cloudflare Pages)

### Why Cloudflare Pages?

- ✅ **FREE** team collaboration (no paid team required)
- ✅ Excellent Next.js support with @cloudflare/next-on-pages
- ✅ Automatic PR preview deployments
- ✅ Fastest global CDN
- ✅ Unlimited bandwidth and requests
- ✅ Free environment variables management

### Initial Setup

1. **Install Cloudflare Adapter**
   ```bash
   pnpm add -D @cloudflare/next-on-pages
   ```

2. **Update package.json Build Script**
   
   In `apps/web/package.json`:
   ```json
   {
     "scripts": {
       "pages:build": "npx @cloudflare/next-on-pages",
       "preview": "npx wrangler pages dev .vercel/output/static",
       "deploy": "pnpm pages:build && wrangler pages deploy .vercel/output/static"
     }
   }
   ```

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/owenlikeocean/influencer-review-platform
   git push -u origin main
   ```

4. **Connect to Cloudflare Pages**
   
   a. Visit [dash.cloudflare.com](https://dash.cloudflare.com)
   
   b. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
   
   c. Authorize GitHub and select your repository
   
   d. Configure build settings:
   ```
   Framework preset: Next.js
   Build command: pnpm turbo run build --filter=web
   Build output directory: apps/web/.vercel/output/static
   Root directory: (leave empty or set to root)
   ```
   
   e. Add build environment variable:
   ```
   NODE_VERSION=20
   ```

5. **Configure Environment Variables**
   
   In Cloudflare Dashboard → Workers & Pages → Your Project → **Settings** → **Environment variables**:
   
   **Production Environment:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... (your anon key)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (mark as encrypted/secret)
   ```
   
   **Preview Environment** (for PRs):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... (can be same as prod or separate staging)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   ```

6. **Enable Automatic Deployments**
   - Push to `main` → Production deployment
   - Open PR → Preview deployment (automatic)
   - Cloudflare builds and validates each deployment

### Environment Variables Strategy

**For Pull Request Validation:**

Create `.github/workflows/pr-check.yml`:

```yaml
name: PR Validation

on:
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Lint
        run: pnpm lint
      
      - name: Type check
        run: pnpm typecheck
      
      # Build validation happens in Cloudflare Pages preview deployment
      # No need to duplicate env vars here
```

**Why this approach?**
- ✅ **Single source of truth**: Env vars only in Cloudflare Pages
- ✅ **PR validation**: Cloudflare automatically builds previews for PRs
- ✅ **Build verification**: Failed builds = failed deployments (visible immediately)
- ✅ **Code quality**: GitHub Actions validates linting and type checking
- ✅ **No duplication**: No need to sync env vars between GitHub and Cloudflare

**If you need build validation in CI:**

Add GitHub Secrets (`Settings` → `Secrets and variables` → `Actions`):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Then update workflow to include build step with env vars.

### Post-Deployment

```bash
# Verify deployment
curl https://your-domain.vercel.app

# Check environment variables are set
# (Should NOT see any errors about missing Supabase)
```

---

## Worker Deployment (Google Cloud Run)

### Preparation

1. **Create Docker Image**
   ```dockerfile
   # Dockerfile (at repo root)
   FROM node:20-alpine
   
   WORKDIR /app
   
   COPY pnpm-lock.yaml .
   COPY . .
   
   RUN npm install -g pnpm
   RUN pnpm install --frozen-lockfile
   
   WORKDIR /app/apps/worker
   RUN pnpm build
   
   CMD ["pnpm", "start"]
   ```

2. **Build Locally**
   ```bash
   docker build -t influencer-worker:latest .
   ```

3. **Test Locally**
   ```bash
   docker run --env-file apps/worker/.env.local influencer-worker:latest
   ```

### Google Cloud Setup

1. **Create Project**
   ```bash
   gcloud projects create influencer-review-platform
   gcloud config set project influencer-review-platform
   ```

2. **Setup Container Registry**
   ```bash
   gcloud auth configure-docker
   
   # Tag image
   docker tag influencer-worker:latest \
     gcr.io/influencer-review-platform/worker:latest
   
   # Push to registry
   docker push gcr.io/influencer-review-platform/worker:latest
   ```

3. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy worker \
     --image gcr.io/influencer-review-platform/worker:latest \
     --platform managed \
     --region us-central1 \
     --set-env-vars \
       SUPABASE_URL=https://your-project.supabase.co,\
       SUPABASE_SB_SECRET=your-service-role-key \
     --no-allow-unauthenticated \
     --memory 512Mi
   ```

4. **Setup Triggers (Optional)**
   
   For scheduled jobs:
   ```bash
   gcloud scheduler jobs create app-engine process-reviews \
     --schedule="0 * * * *" \
     --http-method=POST \
     --uri=https://your-worker-url/process-reviews \
     --oidc-service-account-email=your-sa@project.iam.gserviceaccount.com
   ```

### AWS Lambda Alternative

If using AWS Lambda instead:

1. **Build Deployment Package**
   ```bash
   cd apps/worker
   npm install --production
   zip -r lambda.zip .
   ```

2. **Deploy with SAM or Serverless**
   ```bash
   serverless deploy
   ```

---

## Database Migration (Production)

### Before First Deploy

1. **Create Supabase Project**
   - Visit supabase.com
   - Create new project
   - Note the Project URL and credentials

2. **Apply Schema**
   ```sql
   -- Copy and paste from packages/db/migrations/001_initial_schema.sql
   -- Into Supabase SQL Editor
   -- Run
   ```

3. **Verify Tables**
   ```bash
   # In Supabase Dashboard → Table Editor
   # Should see all 6 tables created
   ```

### For Schema Changes

1. **Create Migration**
   ```bash
   # Create new file: packages/db/migrations/002_your_change.sql
   ```

2. **Test Locally**
   ```bash
   # Create local Supabase instance
   supabase start
   supabase db push
   ```

3. **Apply to Production**
   ```bash
   # Copy SQL and run in Supabase dashboard
   # Or use supabase client CLI:
   supabase migration list
   supabase db push --linked
   ```

---

## Environment Variables Setup

### Vercel (Frontend)

Dashboard → Settings → Environment Variables

```
# Production Environment
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
Environments: Production, Preview

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your-anon-key-here
Environments: Production, Preview
```

### Cloud Run (Worker)

Via `gcloud run deploy` or Cloud Console:

```
SUPABASE_URL: https://your-project.supabase.co
SUPABASE_SB_SECRET: your-service-role-key-here
```

### GitHub Actions Secrets

For CI/CD deployments:

```bash
# Set in GitHub → Settings → Secrets
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
GCP_PROJECT_ID
GCP_SERVICE_ACCOUNT_KEY
```

---

## Monitoring & Logging

### Vercel (Frontend)

- Vercel Dashboard → Analytics
- Vercel Dashboard → Logs

### Cloud Run (Worker)

```bash
# View recent logs
gcloud run services describe worker --region us-central1

# Stream logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=worker" \
  --limit 50 \
  --format json
```

### Supabase (Database)

- Supabase Dashboard → Database → Logs
- Supabase Dashboard → Authentication → Users

---

## Health Checks

### Frontend
```bash
# Check status
curl -I https://your-domain.vercel.app

# Should return 200
```

### Worker
```bash
# Check Cloud Run service
gcloud run services describe worker --region us-central1

# Should show "Status: OK"
```

### Database
```bash
# Via Supabase dashboard
# Settings → Database → Connection Status
```

---

## Rollback Procedure

### Frontend

```bash
# Revert to previous deployment
# In Vercel Dashboard → Deployments → Select previous → Promote
```

Or:

```bash
git revert <commit-hash>
git push origin main
# Automatically redeploys
```

### Worker

```bash
# Rollback to previous image
gcloud run deploy worker \
  --image gcr.io/influencer-review-platform/worker:previous-tag \
  --region us-central1
```

### Database

```bash
# Backup exists in Supabase
# Settings → Backups → Restore from backup
# (No data loss, point-in-time recovery)
```

---

## Performance Optimization

### Frontend

```bash
# Analyze bundle
npm run analyze  # (if next/bundle-analyzer configured)

# Monitor Core Web Vitals
# Vercel Dashboard → Analytics
```

### Database

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- All indexes already included in schema
-- Monitor: Settings → Database → Indexing
```

### Worker

```bash
# Monitor Cloud Run metrics
gcloud run services describe worker
# Check: CPU, Memory, Request count

# Scale up if needed
gcloud run services update worker \
  --memory 1Gi \
  --cpu 2
```

---

## Scaling Strategy

### Phase 1: Launch (Up to 1,000 users)
- Vercel default settings ✅
- Supabase free tier ✅
- Cloud Run with 512Mi memory ✅

### Phase 2: Growth (1,000 - 10,000 users)
- Vercel: Pro plan
- Supabase: Standard plan
- Cloud Run: 1-2 GiB memory, auto-scaling

### Phase 3: Scale (10,000+ users)
- Vercel: Enterprise
- Supabase: Business plan
- Cloud Run: Multiple instances
- Add Redis caching
- Add CDN for assets

---

## Disaster Recovery

### Backup Strategy

- **Database**: Supabase (auto backup daily)
- **Code**: GitHub (all history)
- **Secrets**: Use Cloud Key Management

### Recovery Scenarios

**Database Down:**
- Supabase has SLA with auto-failover
- Restore from backup if needed (point-in-time)
- Time to recover: < 1 hour

**Frontend Down:**
- Vercel has multiple regions
- Auto-rollback on failure
- Time to recover: < 5 minutes

**Worker Down:**
- Cloud Run auto-restarts failed instances
- Can redeploy previous version
- Failed jobs retry or queue

---

## Cost Optimization

### Free Tier Limits
- Vercel: 3 deployments/day limit (get Pro)
- Supabase: 500MB storage, 25MB/day bandwidth
- Cloud Run: 180,000 vCPU-seconds/month free

### Cost Control
```bash
# Monitor spending
gcloud billing accounts list

# Set budget alerts
gcloud billing budgets create \
  --billing-account=<account-id> \
  --display-name="Monthly Budget" \
  --budget-amount=100
```

---

## First Deployment Checklist

- [ ] Database schema applied
- [ ] Supabase credentials configured
- [ ] Vercel environment variables set
- [ ] GitHub Actions working
- [ ] Cloud Run image built & pushed
- [ ] Worker Cloud Run service deployed
- [ ] Health checks passing
- [ ] Logs accessible
- [ ] Monitoring configured
- [ ] Team notified of deployment

---

## Support & Documentation

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [GitHub Actions](https://docs.github.com/en/actions)

---

**Ready to deploy?** Follow the checklist above step by step.
