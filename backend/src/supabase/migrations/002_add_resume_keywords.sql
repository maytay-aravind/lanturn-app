-- ============================================================
-- LanTURN — Add resume_keywords column to students table
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

ALTER TABLE students
ADD COLUMN IF NOT EXISTS resume_keywords JSONB NOT NULL DEFAULT '[]';

COMMENT ON COLUMN students.resume_keywords IS 'Array of keywords extracted from the student resume via MagicalAPI/Gemini, used for AI scoring';
