-- Add public_profile field to users table
-- This controls whether a user's information is visible on their reviews

ALTER TABLE users
ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT true NOT NULL;

-- Update existing users to have public profiles by default
UPDATE users 
SET public_profile = true
WHERE public_profile IS NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS users_public_profile_idx ON users(public_profile);

-- Comment for clarity
COMMENT ON COLUMN users.public_profile IS 'Whether the user''s profile information (name, company, etc.) is visible on their reviews. If false, reviews will show as anonymous.';
