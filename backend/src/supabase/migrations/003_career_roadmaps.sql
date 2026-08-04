-- ============================================================
-- LanTURN — CareerAIsle Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. CAREER_ROADMAPS
-- Stores each student's enrolled roadmaps
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS career_roadmaps (
  roadmap_id    TEXT        PRIMARY KEY,
  student_id    TEXT        NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  domain_id     TEXT        NOT NULL,
  domain_title  TEXT        NOT NULL,
  enrolled_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, domain_id)
);

CREATE INDEX IF NOT EXISTS career_roadmaps_student_idx ON career_roadmaps(student_id);

-- ─────────────────────────────────────────────
-- 2. ROADMAP_PROGRESS
-- Tracks which topics are completed per roadmap
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmap_progress (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id    TEXT        NOT NULL REFERENCES career_roadmaps(roadmap_id) ON DELETE CASCADE,
  student_id    TEXT        NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  stage_index   INTEGER     NOT NULL,
  topic_index   INTEGER     NOT NULL,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(roadmap_id, stage_index, topic_index)
);

CREATE INDEX IF NOT EXISTS roadmap_progress_roadmap_idx ON roadmap_progress(roadmap_id);
CREATE INDEX IF NOT EXISTS roadmap_progress_student_idx ON roadmap_progress(student_id);
