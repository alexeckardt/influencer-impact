-- Migration: 004_fix_service_role_policies
-- Description: Fix RLS policies to allow service role to create users properly
-- Created: 2025-12-28

-- First, let's check current policies and recreate them properly
-- Drop the existing service role policy that might not be working
DROP POLICY IF EXISTS "Service role can create users" ON users;

-- Create a proper policy that allows service role to insert users
-- The service role should be able to bypass RLS, but let's be explicit
CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (
        auth.role() = 'service_role'
    )
    WITH CHECK (
        auth.role() = 'service_role'
    );

-- Also ensure service role can update users (for the approval process)
CREATE POLICY "Service role can update users" ON users
    FOR UPDATE USING (
        auth.role() = 'service_role'
    )
    WITH CHECK (
        auth.role() = 'service_role'
    );

-- Make sure the approve_prospect_user function has SECURITY DEFINER
-- This ensures it runs with the privileges of the function owner (which should have service role access)
CREATE OR REPLACE FUNCTION approve_prospect_user(prospect_id UUID, approver_id UUID)
RETURNS UUID AS $$
DECLARE
    prospect_record prospect_users%ROWTYPE;
    new_user_id UUID;
BEGIN
    -- Get the prospect user record
    SELECT * INTO prospect_record FROM prospect_users WHERE id = prospect_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Prospect user not found';
    END IF;
    
    IF prospect_record.status != 'pending' THEN
        RAISE EXCEPTION 'Prospect user has already been reviewed';
    END IF;
    
    -- Generate a new UUID for the user (this will be used in Supabase auth)
    new_user_id := gen_random_uuid();
    
    -- Insert into users table with explicit RLS bypass for this function
    SET row_security = off;
    
    INSERT INTO users (
        id,
        prospect_user_id,
        username,
        email,
        first_name,
        last_name,
        full_name,
        company,
        job_title,
        years_experience,
        linkedin_url,
        approved_at,
        approved_by
    ) VALUES (
        new_user_id,
        prospect_record.id,
        LOWER(prospect_record.first_name || '.' || prospect_record.last_name),
        prospect_record.email,
        prospect_record.first_name,
        prospect_record.last_name,
        prospect_record.first_name || ' ' || prospect_record.last_name,
        prospect_record.company,
        prospect_record.job_title,
        prospect_record.years_experience,
        prospect_record.linkedin_url,
        NOW(),
        approver_id
    );
    
    -- Update prospect user status
    UPDATE prospect_users SET 
        status = 'approved',
        reviewed_at = NOW(),
        reviewed_by = approver_id,
        updated_at = NOW()
    WHERE id = prospect_id;
    
    -- Reset row security
    SET row_security = on;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;