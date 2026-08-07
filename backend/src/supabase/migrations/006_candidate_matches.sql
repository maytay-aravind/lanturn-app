-- Create candidate_matches table for AI scoring
CREATE TABLE IF NOT EXISTS candidate_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    match_score INTEGER NOT NULL,
    skill_match_score INTEGER,
    experience_score INTEGER,
    project_score INTEGER,
    education_score INTEGER,
    overall_reason TEXT,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, student_id)
);

CREATE INDEX IF NOT EXISTS candidate_matches_job_id_idx ON candidate_matches(job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS candidate_matches_student_id_idx ON candidate_matches(student_id, created_at DESC);
