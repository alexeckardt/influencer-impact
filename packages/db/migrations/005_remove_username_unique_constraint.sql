-- Migration: 005_remove_username_unique_constraint
-- Description: Remove unique constraint from username field since usernames aren't critical
-- Created: 2025-12-28

-- Drop the unique constraint on username
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;

-- Also drop the unique index if it exists
DROP INDEX IF EXISTS users_username_key;

-- Fix RLS policies to allow service role to insert/update users
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Service role can update users" ON users;
DROP POLICY IF EXISTS "Service role can create users" ON users;

-- Create a comprehensive policy for service role
CREATE POLICY "Service role full access" ON users
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Also ensure authenticated role can read users for auth context
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);