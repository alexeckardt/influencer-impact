# Supabase Authentication Setup

This document outlines the authentication system implemented for the Influencer Review Platform.

## Overview

The authentication system uses Supabase with a manual approval workflow:

1. **Signup** → Saves to `prospect_users` table (no Supabase auth user created)
2. **Manual Review** → Admin reviews applications in `/admin` dashboard  
3. **Approval** → Creates Supabase auth user + entry in `users` table
4. **Login** → Standard Supabase authentication against approved users only

## Database Schema

### prospect_users
- Stores signup applications
- Contains hashed passwords and user details
- Status: pending/approved/rejected

### users  
- Approved users linked to Supabase auth
- Contains role (user/moderator/admin)
- RLS policies protect all data access

## Row Level Security (RLS)

All tables have RLS enabled with policies requiring authentication:

- **Prospect Users**: Only authenticated admins can view/manage
- **Users**: Can view own profile, admins can view all
- **Influencers**: Authenticated users can view, admins can manage
- **Reviews**: Users can CRUD their own, view others

## Setup Steps

### 1. Database Migration

Run the migration to set up tables and RLS policies:

```sql
-- Run packages/db/migrations/002_auth_setup.sql in Supabase
```

### 2. Environment Variables

Set up your environment variables:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SB_SECRET`

### 3. Create First Admin

Create an initial admin user to access the dashboard:

```bash
# Using Node.js (after setting up env vars)
node scripts/create-admin.js admin@yourcompany.com password123 Admin User
```

Or manually in Supabase:

```sql
-- 1. Create auth user in Supabase Auth dashboard
-- 2. Then run this SQL with the auth user ID:

INSERT INTO users (
    id, username, email, first_name, last_name, 
    full_name, role, is_verified, approved_at
) VALUES (
    'auth-user-id-here',
    'admin.user',
    'admin@yourcompany.com', 
    'Admin',
    'User',
    'Admin User',
    'admin',
    true,
    NOW()
);
```

### 4. Configure Supabase Auth

In your Supabase dashboard:

1. **Authentication > Settings**:
   - Disable "Enable email confirmations" (we handle approval manually)
   - Set secure site URL
   
2. **Authentication > URL Configuration**:
   - Site URL: `http://localhost:3000` (development)
   - Redirect URLs: Add your production domain

## Usage

### For Users
1. Go to `/register` and fill out application
2. Wait for admin approval
3. Once approved, login at `/login` with the same credentials

### For Admins  
1. Login and go to `/admin`
2. Review pending applications
3. Approve/reject users as needed
4. Approved users receive Supabase auth accounts

## Security Features

- **No direct signup**: Users can't create accounts without approval
- **RLS protection**: All database access requires authentication
- **Role-based access**: Admin/moderator/user roles with different permissions
- **Active user check**: Middleware verifies user is active before accessing protected routes
- **Session management**: Automatic session refresh and validation

## Protected Routes

Routes requiring authentication:
- `/search` - Search influencers
- `/influencer/*` - View influencer profiles
- `/admin` - Admin dashboard (admin role required)

Authentication-related routes (redirect if logged in):
- `/login` - Login page
- `/register` - Registration/application page

## API Endpoints

- `POST /api/admin/approve-prospect` - Approve user application (admin only)
- `POST /api/admin/reject-prospect` - Reject user application (admin only)

## Components

- `AuthProvider` - Context provider for auth state
- `ProtectedPage` - HOC for protecting pages
- `Login` - Login form with Supabase auth
- `Register` - Application form (saves to prospect_users)

## Middleware

The middleware (`middleware.ts`) handles:
- Automatic session refresh
- Route protection
- User status validation
- Redirects for unauthorized access

## Troubleshooting

**Users can't login after approval**:
- Check if user exists in both Supabase Auth and `users` table
- Verify user `is_active` is true
- Check RLS policies allow user access

**Admin can't access dashboard**:
- Verify user role is 'admin' in `users` table
- Check `SUPABASE_SB_SECRET` is set correctly

**Registration not working**:
- Check database connection
- Verify RLS policies allow prospect_users INSERT
- Check browser console for errors