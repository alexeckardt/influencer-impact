
-- Create Table
CREATE TABLE user_influencer_views (
  
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    influencer_id UUID NOT NULL REFERENCES influencer(id) ON DELETE CASCADE,

    last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, influencer_id)
);

-- Create index for faster lookups
CREATE INDEX user_influencer_views_user_last_seen_idx
ON user_influencer_views (user_id, last_seen DESC);

-- RLS
ALTER TABLE user_influencer_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their views"
ON user_influencer_views
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users write their views"
ON user_influencer_views
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update their views"
ON user_influencer_views
FOR UPDATE
USING (user_id = auth.uid());