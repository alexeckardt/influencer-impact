-- Migration: 002_auth_setup.sql
-- Description: Add prospect_users table and update users table for Supabase auth integration

-- Create prospect_users table
CREATE TABLE prospect_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- This will be hashed
    company VARCHAR(255),
    job_title VARCHAR(255),
    years_experience VARCHAR(50),
    linkedin_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID
);

-- Create index for email lookups
CREATE UNIQUE INDEX prospect_users_email_idx ON prospect_users(email);

-- Add new columns to users table for better Supabase integration
ALTER TABLE users 
    ADD COLUMN prospect_user_id UUID REFERENCES prospect_users(id),
    ADD COLUMN first_name VARCHAR(255),
    ADD COLUMN last_name VARCHAR(255),
    ADD COLUMN company VARCHAR(255),
    ADD COLUMN job_title VARCHAR(255),
    ADD COLUMN years_experience VARCHAR(50),
    ADD COLUMN linkedin_url VARCHAR(500),
    ADD COLUMN is_active BOOLEAN DEFAULT true,
    ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN approved_by UUID;

-- Update existing users table to make first_name and last_name required for new users
-- (existing data will need manual cleanup if any)

-- Enable RLS on all tables
ALTER TABLE prospect_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_handles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Prospect Users Policies
-- Users can insert their own prospect application
CREATE POLICY "Users can create prospect applications" ON prospect_users
    FOR INSERT WITH CHECK (true);

-- Only authenticated users can view prospect applications (admin use)
CREATE POLICY "Authenticated users can view prospect applications" ON prospect_users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can update prospect applications
CREATE POLICY "Admins can update prospect applications" ON prospect_users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'moderator')
        )
    );

-- Users Table Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Only admins can insert new users (approval process)
CREATE POLICY "Admins can create users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'moderator')
        )
    );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'moderator')
        )
    );

-- Influencers Table Policies
-- All authenticated users can view influencers
CREATE POLICY "Authenticated users can view influencers" ON influencers
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage influencers
CREATE POLICY "Admins can manage influencers" ON influencers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'moderator')
        )
    );

-- Influencer Handles Policies
-- All authenticated users can view influencer handles
CREATE POLICY "Authenticated users can view influencer handles" ON influencer_handles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage influencer handles
CREATE POLICY "Admins can manage influencer handles" ON influencer_handles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'moderator')
        )
    );

-- Reviews Table Policies
-- All authenticated users can view reviews
CREATE POLICY "Authenticated users can view reviews" ON reviews
    FOR SELECT USING (auth.role() = 'authenticated');

-- Users can create reviews
CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
    );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews" ON reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'moderator')
        )
    );

-- Create a function to handle user approval process
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
    
    -- Insert into users table
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
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to reject prospect users
CREATE OR REPLACE FUNCTION reject_prospect_user(prospect_id UUID, approver_id UUID, reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE prospect_users SET 
        status = 'rejected',
        rejection_reason = reason,
        reviewed_at = NOW(),
        reviewed_by = approver_id,
        updated_at = NOW()
    WHERE id = prospect_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Prospect user not found or already reviewed';
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;