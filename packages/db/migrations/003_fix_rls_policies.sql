-- Migration: 003_fix_rls_policies
-- Description: Fix circular dependency in RLS policies that causes infinite recursion
-- Created: 2025-12-28

-- Drop the problematic policies that cause circular references
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage influencers" ON influencers;
DROP POLICY IF EXISTS "Admins can manage influencer handles" ON influencer_handles;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;

-- Create a function to check if a user is an admin without querying the users table directly
-- This function will be called with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Temporarily disable RLS for this function to avoid circular dependency
    SET row_security = off;
    
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id 
        AND role IN ('admin', 'moderator')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset row security
SELECT set_config('row_security', 'on', false);

-- Users Table Policies (fixed)
-- Keep the existing "Users can view own profile" policy as it doesn't cause recursion
-- Users can view own profile
-- CREATE POLICY "Users can view own profile" ON users
--     FOR SELECT USING (auth.uid() = id);

-- Allow service role to create users (used during approval process)
CREATE POLICY "Service role can create users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Users can update their own profile (limited fields)
-- Keep existing policy as it doesn't cause recursion
-- CREATE POLICY "Users can update own profile" ON users
--     FOR UPDATE USING (auth.uid() = id)
--     WITH CHECK (auth.uid() = id);

-- Admins can view all users (using the helper function)
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND is_admin_user(auth.uid())
    );

-- Allow admins to update users (using the helper function)
CREATE POLICY "Admins can update users" ON users
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND is_admin_user(auth.uid())
    );

-- Influencers Table Policies (fixed)
-- Keep the existing "Authenticated users can view influencers" policy
-- CREATE POLICY "Authenticated users can view influencers" ON influencers
--     FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage influencers (using the helper function)
CREATE POLICY "Admins can manage influencers" ON influencers
    FOR ALL USING (
        auth.uid() IS NOT NULL AND is_admin_user(auth.uid())
    );

-- Influencer Handles Policies (fixed)
-- Keep the existing "Authenticated users can view influencer handles" policy
-- CREATE POLICY "Authenticated users can view influencer handles" ON influencer_handles
--     FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage influencer handles (using the helper function)
CREATE POLICY "Admins can manage influencer handles" ON influencer_handles
    FOR ALL USING (
        auth.uid() IS NOT NULL AND is_admin_user(auth.uid())
    );

-- Reviews Table Policies (fixed)
-- Keep existing policies that don't cause recursion:
-- - "Authenticated users can view reviews"
-- - "Users can create reviews"
-- - "Users can update own reviews"  
-- - "Users can delete own reviews"

-- Admins can manage all reviews (using the helper function)
CREATE POLICY "Admins can manage all reviews" ON reviews
    FOR ALL USING (
        auth.uid() IS NOT NULL AND is_admin_user(auth.uid())
    );