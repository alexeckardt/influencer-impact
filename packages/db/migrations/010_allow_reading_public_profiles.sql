-- Migration: 010_allow_reading_public_profiles
-- Description: Allow authenticated users to read public profiles of other users
-- This is needed so that reviews can show reviewer information when public_profile is true

-- First, let's see what policies currently exist and drop the ones we need to replace
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Create a policy that allows users to view:
-- 1. Their own profile
-- 2. Other users' profiles if those users have public_profile = true
CREATE POLICY "Users can view own and public profiles" ON users
    FOR SELECT TO authenticated
    USING (
        auth.uid() = id 
        OR public_profile = true
    );

-- Admins can view all users (using the is_admin_user function to avoid circular dependency)
-- The is_admin_user function was created in migration 003
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT TO authenticated
    USING (
        is_admin_user(auth.uid())
    );

-- Note: Service role already has full access via "Service role full access" policy
-- No changes needed for service role access
