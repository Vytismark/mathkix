-- ============================================================
-- 001_initial_schema.sql
-- Math Learning App - Initial Database Schema
-- Run this first in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (parent accounts, extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT NOT NULL,
  full_name           TEXT,
  avatar_url          TEXT,
  stripe_customer_id  TEXT UNIQUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id  TEXT UNIQUE,
  stripe_price_id         TEXT,
  plan_type               TEXT NOT NULL DEFAULT 'free'
                          CHECK (plan_type IN ('free', 'monthly', 'annual', 'lifetime')),
  status                  TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CHILDREN
-- ============================================================
CREATE TABLE children (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  birth_year      SMALLINT,
  avatar_id       TEXT NOT NULL DEFAULT 'bear',
  grade_level     SMALLINT CHECK (grade_level BETWEEN 1 AND 5), -- 1-5=G1-G5
  xp_total        INTEGER NOT NULL DEFAULT 0,
  streak_days     SMALLINT NOT NULL DEFAULT 0,
  last_active     TIMESTAMPTZ,
  placement_done  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- DIAGNOSTIC QUESTIONS (seed data, static - no PII)
-- ============================================================
CREATE TABLE diagnostic_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level     SMALLINT NOT NULL CHECK (grade_level BETWEEN 1 AND 5),
  domain          TEXT NOT NULL,        -- e.g. 'OA', 'NBT', 'NF', 'MD', 'G'
  standard_code   TEXT,                 -- e.g. '1.OA.1', '3.NF.1'
  question_text   TEXT NOT NULL,
  question_type   TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'numeric', 'fraction')),
  options         JSONB,                -- [{label:'A', value:'4'}, ...]
  correct_answer  TEXT NOT NULL,
  difficulty      SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
  visual_asset    TEXT,                 -- optional image/svg slug
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- QUIZ SESSIONS (level finder)
-- ============================================================
CREATE TABLE quiz_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id          UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'in_progress'
                    CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  questions_asked   JSONB NOT NULL DEFAULT '[]',
  -- [{question_id, answer_given, correct, time_ms, grade_level, domain}]
  total_correct     SMALLINT NOT NULL DEFAULT 0,
  total_asked       SMALLINT NOT NULL DEFAULT 0,
  ai_raw_response   TEXT,              -- Claude's full response (audit trail)
  recommended_grade SMALLINT CHECK (recommended_grade BETWEEN 1 AND 5),
  confidence_score  NUMERIC(4,3),      -- 0.000 to 1.000
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ
);

-- ============================================================
-- LESSONS (content - no PII)
-- ============================================================
CREATE TABLE lessons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level   SMALLINT NOT NULL CHECK (grade_level BETWEEN 1 AND 5),
  domain        TEXT NOT NULL,
  standard_code TEXT,
  title         TEXT NOT NULL,
  description   TEXT,
  lesson_type   TEXT NOT NULL CHECK (lesson_type IN ('practice', 'concept', 'challenge')),
  difficulty    SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  xp_reward     SMALLINT NOT NULL DEFAULT 10,
  questions     JSONB NOT NULL DEFAULT '[]',
  -- [{id, text, type, options, correct_answer, visual_asset}]
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- LESSON ATTEMPTS
-- ============================================================
CREATE TABLE lesson_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'started'
                  CHECK (status IN ('started', 'completed', 'skipped')),
  score_pct       NUMERIC(5,2),         -- 0.00 to 100.00
  answers         JSONB NOT NULL DEFAULT '[]',
  xp_earned       SMALLINT NOT NULL DEFAULT 0,
  time_spent_sec  INTEGER,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

-- ============================================================
-- CHILD STANDARD MASTERY
-- ============================================================
CREATE TABLE child_standard_mastery (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  standard_code   TEXT NOT NULL,
  mastery_level   SMALLINT NOT NULL DEFAULT 0
                  CHECK (mastery_level BETWEEN 0 AND 3),
  -- 0=not_seen, 1=introduced, 2=practicing, 3=mastered
  attempts        SMALLINT NOT NULL DEFAULT 0,
  last_attempted  TIMESTAMPTZ,
  UNIQUE(child_id, standard_code)
);

-- ============================================================
-- PROGRESS SNAPSHOTS (weekly roll-up for charts)
-- ============================================================
CREATE TABLE progress_snapshots (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id            UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  week_start          DATE NOT NULL,
  lessons_completed   SMALLINT NOT NULL DEFAULT 0,
  xp_earned           INTEGER NOT NULL DEFAULT 0,
  avg_score_pct       NUMERIC(5,2),
  domains_practiced   TEXT[],
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, week_start)
);

-- ============================================================
-- UPDATED_AT triggers
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_children_profile_id ON children(profile_id);
CREATE INDEX idx_subscriptions_profile_id ON subscriptions(profile_id);
CREATE INDEX idx_quiz_sessions_child_id ON quiz_sessions(child_id);
CREATE INDEX idx_lesson_attempts_child_id ON lesson_attempts(child_id);
CREATE INDEX idx_lesson_attempts_lesson_id ON lesson_attempts(lesson_id);
CREATE INDEX idx_child_standard_mastery_child_id ON child_standard_mastery(child_id);
CREATE INDEX idx_progress_snapshots_child_id ON progress_snapshots(child_id);
CREATE INDEX idx_lessons_grade_level ON lessons(grade_level, is_active);
CREATE INDEX idx_diagnostic_questions_grade_level ON diagnostic_questions(grade_level);
