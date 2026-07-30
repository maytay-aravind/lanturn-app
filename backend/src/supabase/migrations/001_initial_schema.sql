-- ============================================================
-- LanTURN — Supabase PostgreSQL Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── Helper: auto-update updated_at on every row change ───
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────
-- 1. USERS
-- Primary identity table (keyed by Firebase UID)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  uid               TEXT        PRIMARY KEY,
  email             TEXT        NOT NULL,
  email_verified    BOOLEAN     NOT NULL DEFAULT false,
  display_name      TEXT        NOT NULL DEFAULT '',
  photo_url         TEXT        NOT NULL DEFAULT '',
  auth_provider     TEXT        NOT NULL DEFAULT 'google.com',
  role              TEXT        CHECK (role IN ('student', 'employer', 'admin')),
  profile_complete  BOOLEAN     NOT NULL DEFAULT false,
  status            TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- 2. STUDENTS
-- Extended profile for users with role = 'student'
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  uid               TEXT        PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  personal          JSONB       NOT NULL DEFAULT '{}',
  academic          JSONB       NOT NULL DEFAULT '{}',
  professional      JSONB       NOT NULL DEFAULT '{}',
  social            JSONB       NOT NULL DEFAULT '{}',
  searchable_skills TEXT[]      NOT NULL DEFAULT '{}',
  graduation_year   INTEGER,
  profile_photo_url TEXT        NOT NULL DEFAULT '',
  resume_url        TEXT        NOT NULL DEFAULT '',
  resume_text       TEXT        NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS students_graduation_year_idx ON students(graduation_year);
CREATE INDEX IF NOT EXISTS students_skills_idx ON students USING GIN(searchable_skills);

-- ─────────────────────────────────────────────
-- 3. EMPLOYERS
-- Extended profile for users with role = 'employer'
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employers (
  uid           TEXT        PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  company_name  TEXT        NOT NULL DEFAULT '',
  description   TEXT        NOT NULL DEFAULT '',
  website       TEXT        NOT NULL DEFAULT '',
  industry      TEXT        NOT NULL DEFAULT '',
  location      JSONB       NOT NULL DEFAULT '{}',
  hr_contact    JSONB       NOT NULL DEFAULT '{}',
  logo_url      TEXT        NOT NULL DEFAULT '',
  verified      BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER employers_updated_at
  BEFORE UPDATE ON employers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- 4. JOBS
-- Job postings created by employers
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  job_id            TEXT        PRIMARY KEY,
  title             TEXT        NOT NULL,
  description       TEXT        NOT NULL DEFAULT '',
  requirements      TEXT[]      NOT NULL DEFAULT '{}',
  required_skills   TEXT[]      NOT NULL DEFAULT '{}',
  job_type          TEXT        NOT NULL CHECK (job_type IN ('full-time', 'internship', 'part-time', 'contract')),
  industry          TEXT        NOT NULL DEFAULT '',
  salary            JSONB       NOT NULL DEFAULT '{}',
  experience_level  TEXT        CHECK (experience_level IN ('entry', 'junior', 'mid', 'senior')),
  openings          INTEGER,
  deadline          TIMESTAMPTZ,
  status            TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'removed')),
  employer_id       TEXT        NOT NULL REFERENCES users(uid),
  company_name      TEXT        NOT NULL DEFAULT '',
  company_logo_url  TEXT        NOT NULL DEFAULT '',
  application_count INTEGER     NOT NULL DEFAULT 0,
  location          JSONB       NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS jobs_status_created_idx ON jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_employer_id_idx ON jobs(employer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_job_type_idx ON jobs(job_type);
CREATE INDEX IF NOT EXISTS jobs_industry_idx ON jobs(industry);
CREATE INDEX IF NOT EXISTS jobs_experience_level_idx ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS jobs_required_skills_idx ON jobs USING GIN(required_skills);

-- ─────────────────────────────────────────────
-- 5. APPLICATIONS
-- Job applications submitted by students
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  application_id        TEXT        PRIMARY KEY,
  job_id                TEXT        NOT NULL REFERENCES jobs(job_id),
  job_title             TEXT        NOT NULL DEFAULT '',
  employer_id           TEXT        NOT NULL,
  student_id            TEXT        NOT NULL REFERENCES users(uid),
  student_name          TEXT        NOT NULL DEFAULT '',
  student_photo_url     TEXT        NOT NULL DEFAULT '',
  resume_url            TEXT        NOT NULL DEFAULT '',
  resume_text_snapshot  TEXT        NOT NULL DEFAULT '',
  skills_snapshot       TEXT[]      NOT NULL DEFAULT '{}',
  cover_letter          TEXT        NOT NULL DEFAULT '',
  status                TEXT        NOT NULL DEFAULT 'submitted'
                          CHECK (status IN ('submitted','reviewed','shortlisted','accepted','rejected','withdrawn')),
  status_history        JSONB       NOT NULL DEFAULT '[]',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, job_id)
);

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS applications_student_id_idx ON applications(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS applications_job_id_idx ON applications(job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS applications_employer_id_idx ON applications(employer_id);

-- ─────────────────────────────────────────────
-- 6. NOTIFICATIONS
-- In-app and email notifications
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  notification_id TEXT        PRIMARY KEY,
  user_id         TEXT        NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  type            TEXT        NOT NULL,
  title           TEXT        NOT NULL DEFAULT '',
  body            TEXT        NOT NULL DEFAULT '',
  link            TEXT        NOT NULL DEFAULT '',
  data            JSONB       NOT NULL DEFAULT '{}',
  channel         TEXT        NOT NULL DEFAULT 'both',
  read            BOOLEAN     NOT NULL DEFAULT false,
  email_status    TEXT        NOT NULL DEFAULT 'skipped',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON notifications(user_id, read) WHERE read = false;

-- ─────────────────────────────────────────────
-- 7. ANALYTICS EVENTS
-- Lightweight event log for admin dashboard
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT        NOT NULL,
  data        JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS analytics_events_type_created_idx ON analytics_events(type, created_at);

-- ─────────────────────────────────────────────
-- 8. PLATFORM CONFIG
-- Single-row admin configuration table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_config (
  id                TEXT        PRIMARY KEY DEFAULT 'default',
  signup_enabled    BOOLEAN     NOT NULL DEFAULT true,
  maintenance_mode  BOOLEAN     NOT NULL DEFAULT false,
  ai_daily_limit    INTEGER     NOT NULL DEFAULT 20,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the single config row
INSERT INTO platform_config (id, signup_enabled, maintenance_mode, ai_daily_limit)
VALUES ('default', true, false, 20)
ON CONFLICT (id) DO NOTHING;
