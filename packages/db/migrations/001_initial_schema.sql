-- Migration: 001_initial_schema
-- Description: Create initial tables for influencer review platform
-- Created: 2025-01-17

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Disable RLS initially for setup, will be enabled after data migration
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM public;

-- ============================================================================
-- Users Table (auth-managed, linked to Supabase Auth)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- Influencers Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS influencers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  primary_niche VARCHAR(255) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Influencer Handles (social media accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS influencer_handles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('twitter', 'instagram', 'tiktok', 'youtube')),
  username VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(influencer_id, platform)
);

-- ============================================================================
-- Reviews Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  sentiment VARCHAR(50) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  is_anonymous BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'flagged')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- Review Labels (NLP-derived, for future use)
-- ============================================================================
CREATE TABLE IF NOT EXISTS review_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  label_type VARCHAR(50) NOT NULL CHECK (label_type IN ('sentiment', 'topic', 'professionalism', 'authenticity')),
  label_value VARCHAR(100) NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Influencer Stats (Denormalized aggregates, updated by background jobs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS influencer_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID NOT NULL UNIQUE REFERENCES influencers(id) ON DELETE CASCADE,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  sentiment_positive INTEGER DEFAULT 0,
  sentiment_neutral INTEGER DEFAULT 0,
  sentiment_negative INTEGER DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
CREATE INDEX idx_reviews_influencer_id ON reviews(influencer_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_influencer_handles_influencer_id ON influencer_handles(influencer_id);
CREATE INDEX idx_influencer_handles_platform ON influencer_handles(platform);
CREATE INDEX idx_review_labels_review_id ON review_labels(review_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_handles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_stats ENABLE ROW LEVEL SECURITY;

-- Users: Can only view their own profile
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Influencers: All authenticated users can view
CREATE POLICY influencers_select_all ON influencers
  FOR SELECT USING (true);

-- Influencer Handles: All authenticated users can view
CREATE POLICY influencer_handles_select_all ON influencer_handles
  FOR SELECT USING (true);

-- Reviews: Users can view published reviews; can only modify own
CREATE POLICY reviews_select_published ON reviews
  FOR SELECT USING (status = 'published' OR user_id = auth.uid());

CREATE POLICY reviews_insert_own ON reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY reviews_update_own ON reviews
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY reviews_delete_own ON reviews
  FOR DELETE USING (user_id = auth.uid());

-- Review Labels: All authenticated users can view
CREATE POLICY review_labels_select_all ON review_labels
  FOR SELECT USING (true);

-- Influencer Stats: All authenticated users can view
CREATE POLICY influencer_stats_select_all ON influencer_stats
  FOR SELECT USING (true);

-- ============================================================================
-- Functions for Triggers
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER influencers_updated_at
  BEFORE UPDATE ON influencers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER influencer_handles_updated_at
  BEFORE UPDATE ON influencer_handles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
