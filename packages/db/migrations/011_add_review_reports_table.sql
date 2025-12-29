-- Create review_reports table for tracking reports on reviews
CREATE TABLE review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reasons TEXT[] NOT NULL, -- Array of reasons (multi-select)
  additional_info TEXT,
  status VARCHAR(50) DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'investigating', 'closed')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin who reviewed the report
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_review_reports_review_id ON review_reports(review_id);
CREATE INDEX idx_review_reports_reporter_id ON review_reports(reporter_id);
CREATE INDEX idx_review_reports_status ON review_reports(status);
CREATE INDEX idx_review_reports_reviewed_by ON review_reports(reviewed_by);

-- Enable RLS
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create reports
CREATE POLICY "Users can create review reports"
  ON review_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Allow users to view their own reports
CREATE POLICY "Users can view their own reports"
  ON review_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Allow admins to view all reports
CREATE POLICY "Admins can view all reports"
  ON review_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow admins to update reports
CREATE POLICY "Admins can update reports"
  ON review_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_review_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_reports_updated_at
  BEFORE UPDATE ON review_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_review_reports_updated_at();
