# Environment Variables Guide

Each File which should have a `.env.local` file will have a corresponding `.env.example` file. You can copy the file and rename it to create the `.env.local` file. Do NOT push secrets in the `.env.local`.

⚠️ **IMPORTANT**: 
- `NEXT_PUBLIC_*` vars are exposed to frontend (use anon key)
- `SUPABASE_SERVICE_ROLE_KEY` is backend-only (never expose to frontend)

---

## Frontend (apps/web)

### Required Variables

```env
# Supabase Configuration (Public - safe for frontend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional Variables

```env
# Meilisearch (optional, for search feature)
NEXT_PUBLIC_MEILISEARCH_URL=http://localhost:7700
NEXT_PUBLIC_MEILISEARCH_KEY=dev-key-12345
```

## Worker (apps/worker)

### Required Variables

```env
# Supabase Configuration (Private - backend only)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```



## Getting Credentials

### Supabase

1. Go to [supabase.com](https://supabase.com) → Your Project
2. Settings > API
3. Copy:
   - **Project URL** → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

### Environment File Locations

```
repo/
├── apps/web/.env.local          # Frontend vars
├── apps/worker/.env.local       # Worker vars
└── .env.local (optional)        # Root shared vars
```

## Security Rules
- ✅ `NEXT_PUBLIC_*` can be in frontend code
- ❌ Never commit `.env.local` files
- ❌ Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend
- ✅ Use `.env.local` for local development
- ✅ Use CI/CD platform secrets for production

## Development vs Production

### Local Development
Use `.env.local` files with development credentials.

### Vercel (Frontend)
Set in Vercel dashboard → Settings > Environment Variables

### Cloud Run / Lambda (Worker)
Set in service configuration or secrets manager
