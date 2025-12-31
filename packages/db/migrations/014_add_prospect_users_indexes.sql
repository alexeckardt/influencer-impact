-- Migration: Add indexes to prospect_users table for better query performance
-- Created: 2025-12-31

-- Index on status column (most queries filter by status)
CREATE INDEX IF NOT EXISTS idx_prospect_users_status 
ON prospect_users(status);

-- Index on created_at for sorting (descending order for recent first)
CREATE INDEX IF NOT EXISTS idx_prospect_users_created_at 
ON prospect_users(created_at DESC);

-- Composite index on status and created_at for common query pattern
CREATE INDEX IF NOT EXISTS idx_prospect_users_status_created_at 
ON prospect_users(status, created_at DESC);

-- Index on reviewed_by for admin audit queries
CREATE INDEX IF NOT EXISTS idx_prospect_users_reviewed_by 
ON prospect_users(reviewed_by) WHERE reviewed_by IS NOT NULL;

-- Index on email for lookups (also ensures uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS idx_prospect_users_email 
ON prospect_users(email);
