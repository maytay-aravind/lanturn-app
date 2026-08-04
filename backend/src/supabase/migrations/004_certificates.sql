-- Add certificates array to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS certificates JSONB NOT NULL DEFAULT '[]'::jsonb;
