-- ============================================================
-- LanTURN — Supabase Migration 002: Chat Tables
-- Run this AFTER 001_initial_schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_threads (
  thread_id             TEXT        PRIMARY KEY,
  user_id               TEXT        NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  title                 TEXT        NOT NULL DEFAULT '',
  mode                  TEXT        NOT NULL DEFAULT 'general',
  context               JSONB       NOT NULL DEFAULT '{}',
  last_message_preview  TEXT        NOT NULL DEFAULT '',
  last_message_at       TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER chat_threads_updated_at
  BEFORE UPDATE ON chat_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS chat_threads_user_id_idx ON chat_threads(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   TEXT        NOT NULL REFERENCES chat_threads(thread_id) ON DELETE CASCADE,
  role        TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_messages_thread_id_idx ON chat_messages(thread_id, created_at ASC);
