-- Cleanup reviews table - remove duplicate and legacy columns
-- Migration 008 added reviewer_id, professionalism_rating, etc.
-- This migration removes the old user_id, title, content, rating, sentiment columns

-- Step 1: Ensure all data from user_id is copied to reviewer_id (if any rows have user_id but not reviewer_id)
UPDATE reviews 
SET reviewer_id = user_id 
WHERE reviewer_id IS NULL AND user_id IS NOT NULL;

-- Step 2: Make reviewer_id NOT NULL since it's now the primary user reference
ALTER TABLE reviews 
ALTER COLUMN reviewer_id SET NOT NULL;

-- Step 3: Drop old RLS policies that reference user_id
DROP POLICY IF EXISTS "reviews_select_published" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can view published reviews" ON reviews;

-- Step 4: Drop the old index on user_id
DROP INDEX IF EXISTS idx_reviews_user_id;

-- Step 5: Drop the old user_id column
ALTER TABLE reviews 
DROP COLUMN IF EXISTS user_id;

-- Step 6: Create index on reviewer_id for performance
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);

-- Step 7: Recreate RLS policies using reviewer_id
-- All authenticated users can view reviews
CREATE POLICY "Authenticated users can view reviews" ON reviews
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can create their own reviews
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE
  USING (auth.uid() = reviewer_id);

-- Step 8: Drop legacy columns that are no longer used
ALTER TABLE reviews 
DROP COLUMN IF EXISTS title,
DROP COLUMN IF EXISTS content,
DROP COLUMN IF EXISTS rating,
DROP COLUMN IF EXISTS sentiment,
DROP COLUMN IF EXISTS is_anonymous,
DROP COLUMN IF EXISTS helpful_count,
DROP COLUMN IF EXISTS unhelpful_count,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS deleted_at;

-- Step 9: Add comment to document the cleanup
COMMENT ON TABLE reviews IS 'User reviews of influencers with detailed ratings. Cleaned up in migration 012 to remove legacy columns.';
