-- Add admin verification columns to jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS verified_by_admin BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- Update status CHECK to include 'verified' and 'paused'
ALTER TABLE jobs
DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE jobs
ADD CONSTRAINT jobs_status_check CHECK (status IN ('draft', 'active', 'verified', 'paused', 'closed', 'removed'));

-- Index for admin verification queries
CREATE INDEX IF NOT EXISTS jobs_verified_by_admin_idx ON jobs(verified_by_admin) WHERE verified_by_admin = true;
