-- ============================================================
-- 006_adaptive_learning.sql
-- Math Learning App - Adaptive Algorithm Tables
-- Run after 005_domain_mastery.sql
-- ============================================================

-- ============================================================
-- BEHAVIORAL EVENTS
-- Raw event stream: every answer, pause, hint, emoji reaction
-- ============================================================
CREATE TABLE behavioral_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  session_id      UUID,               -- practice_sessions.id, nullable for non-session events
  event_type      TEXT NOT NULL
                  CHECK (event_type IN (
                    'answer_correct', 'answer_wrong', 'hint_requested',
                    'pause_long', 'topic_pivot', 'session_start',
                    'session_end', 'emoji_reaction'
                  )),
  domain          TEXT CHECK (domain IN ('OA', 'NBT', 'NF', 'MD', 'G')),
  standard_code   TEXT,
  question_id     TEXT,
  time_ms         INTEGER,            -- ms taken to answer (null for non-answer events)
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_behavioral_events_child_time
  ON behavioral_events(child_id, created_at DESC);
CREATE INDEX idx_behavioral_events_session
  ON behavioral_events(session_id)
  WHERE session_id IS NOT NULL;
CREATE INDEX idx_behavioral_events_domain
  ON behavioral_events(child_id, domain, created_at DESC)
  WHERE domain IS NOT NULL;

-- ============================================================
-- TOPIC AFFINITY
-- Per-(child, domain) enjoyment signal, 0–100, 50 = neutral
-- ============================================================
CREATE TABLE topic_affinity (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id              UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  domain                TEXT NOT NULL CHECK (domain IN ('OA', 'NBT', 'NF', 'MD', 'G')),
  affinity_score        NUMERIC(5,2) NOT NULL DEFAULT 50.00,
  sessions_in_domain    SMALLINT NOT NULL DEFAULT 0,
  correct_streak_best   SMALLINT NOT NULL DEFAULT 0,
  avg_response_ms       INTEGER,                  -- rolling avg, null until 3+ data points
  emoji_positive        SMALLINT NOT NULL DEFAULT 0,
  emoji_negative        SMALLINT NOT NULL DEFAULT 0,
  last_updated          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT topic_affinity_child_domain_unique UNIQUE(child_id, domain)
);

CREATE INDEX idx_topic_affinity_child ON topic_affinity(child_id);

-- ============================================================
-- SPACED REPETITION ITEMS
-- SM-2 state per (child, standard_code)
-- ============================================================
CREATE TABLE spaced_repetition_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id          UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  standard_code     TEXT NOT NULL,
  domain            TEXT NOT NULL CHECK (domain IN ('OA', 'NBT', 'NF', 'MD', 'G')),
  grade_level       SMALLINT NOT NULL CHECK (grade_level BETWEEN 1 AND 5),
  -- SM-2 fields
  ease_factor       NUMERIC(4,2) NOT NULL DEFAULT 2.50 CHECK (ease_factor >= 1.30),
  interval_days     NUMERIC(6,2) NOT NULL DEFAULT 1.0,
  repetitions       SMALLINT NOT NULL DEFAULT 0,
  next_review_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reviewed_at  TIMESTAMPTZ,
  last_score_pct    NUMERIC(5,2),
  times_reviewed    SMALLINT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sr_items_child_standard_unique UNIQUE(child_id, standard_code)
);

CREATE INDEX idx_sr_items_child_due
  ON spaced_repetition_items(child_id, next_review_at);
CREATE INDEX idx_sr_items_domain
  ON spaced_repetition_items(child_id, domain);

-- ============================================================
-- PRACTICE SESSIONS
-- Adaptive learning session tracker (separate from quiz_sessions)
-- ============================================================
CREATE TABLE practice_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id            UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'completed', 'abandoned')),
  engine_state        JSONB NOT NULL DEFAULT '{}',
  engagement_summary  JSONB NOT NULL DEFAULT '{}',
  questions_answered  SMALLINT NOT NULL DEFAULT 0,
  correct_count       SMALLINT NOT NULL DEFAULT 0,
  xp_earned           INTEGER NOT NULL DEFAULT 0,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_practice_sessions_child
  ON practice_sessions(child_id, started_at DESC);

-- ============================================================
-- ACHIEVEMENTS
-- Earned badges; one row per (child, achievement_code)
-- ============================================================
CREATE TABLE achievements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id          UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  achievement_code  TEXT NOT NULL,
  achievement_type  TEXT NOT NULL
                    CHECK (achievement_type IN (
                      'streak', 'mastery', 'performance', 'consistency', 'spaced_repetition'
                    )),
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  icon_slug         TEXT NOT NULL DEFAULT 'star',
  xp_bonus          SMALLINT NOT NULL DEFAULT 0,
  metadata          JSONB NOT NULL DEFAULT '{}',
  earned_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT achievements_child_code_unique UNIQUE(child_id, achievement_code)
);

CREATE INDEX idx_achievements_child
  ON achievements(child_id, earned_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- Same ownership pattern as existing tables
-- ============================================================
ALTER TABLE behavioral_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_affinity           ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaced_repetition_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements             ENABLE ROW LEVEL SECURITY;

CREATE POLICY "behavioral_events_child_owner" ON behavioral_events
  USING (child_id IN (SELECT id FROM children WHERE profile_id = auth.uid()));

CREATE POLICY "topic_affinity_child_owner" ON topic_affinity
  USING (child_id IN (SELECT id FROM children WHERE profile_id = auth.uid()));

CREATE POLICY "sr_items_child_owner" ON spaced_repetition_items
  USING (child_id IN (SELECT id FROM children WHERE profile_id = auth.uid()));

CREATE POLICY "practice_sessions_child_owner" ON practice_sessions
  USING (child_id IN (SELECT id FROM children WHERE profile_id = auth.uid()));

CREATE POLICY "achievements_child_owner" ON achievements
  USING (child_id IN (SELECT id FROM children WHERE profile_id = auth.uid()));
