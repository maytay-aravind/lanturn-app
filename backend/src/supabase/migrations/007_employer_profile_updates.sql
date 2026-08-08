-- Add new columns to employers table for the profile redesign
ALTER TABLE employers
ADD COLUMN IF NOT EXISTS linkedin TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}';
