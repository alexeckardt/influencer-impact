-- Add detailed rating fields to reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS overall_rating NUMERIC(3, 2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
ADD COLUMN IF NOT EXISTS professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
ADD COLUMN IF NOT EXISTS communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
ADD COLUMN IF NOT EXISTS content_quality_rating INTEGER CHECK (content_quality_rating >= 1 AND content_quality_rating <= 5),
ADD COLUMN IF NOT EXISTS roi_rating INTEGER CHECK (roi_rating >= 1 AND roi_rating <= 5),
ADD COLUMN IF NOT EXISTS reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
ADD COLUMN IF NOT EXISTS pros TEXT,
ADD COLUMN IF NOT EXISTS cons TEXT,
ADD COLUMN IF NOT EXISTS advice TEXT,
ADD COLUMN IF NOT EXISTS would_work_again BOOLEAN,
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Update existing reviews to have default values
UPDATE reviews 
SET overall_rating = rating::numeric 
WHERE overall_rating IS NULL;

-- Comment on columns for clarity
COMMENT ON COLUMN reviews.overall_rating IS 'Calculated average of all individual ratings';
COMMENT ON COLUMN reviews.professionalism_rating IS 'Rating for professionalism (1-5)';
COMMENT ON COLUMN reviews.communication_rating IS 'Rating for communication (1-5)';
COMMENT ON COLUMN reviews.content_quality_rating IS 'Rating for content quality (1-5)';
COMMENT ON COLUMN reviews.roi_rating IS 'Rating for ROI/performance (1-5)';
COMMENT ON COLUMN reviews.reliability_rating IS 'Rating for reliability (1-5)';
COMMENT ON COLUMN reviews.pros IS 'What the reviewer liked';
COMMENT ON COLUMN reviews.cons IS 'What could have been better';
COMMENT ON COLUMN reviews.advice IS 'Advice to other brands';
COMMENT ON COLUMN reviews.would_work_again IS 'Whether the reviewer would work with this influencer again';
COMMENT ON COLUMN reviews.reviewer_id IS 'ID of the user who wrote the review';
