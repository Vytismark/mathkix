-- ============================================================
-- Migration 004: Child personalization fields
-- Replaces birth_year with school_grade, adds 6 fields that
-- drive content delivery style and seed the AI algorithm.
-- ============================================================

-- Drop the old birth_year column (replaced by school_grade)
ALTER TABLE children DROP COLUMN IF EXISTS birth_year;

-- Tier 1: Core delivery signals
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS school_grade        SMALLINT CHECK (school_grade BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS learning_pace       TEXT NOT NULL DEFAULT 'average'
    CHECK (learning_pace IN ('steady', 'average', 'quick')),
  ADD COLUMN IF NOT EXISTS challenge_preference TEXT NOT NULL DEFAULT 'balanced'
    CHECK (challenge_preference IN ('gentle', 'balanced', 'loves_challenge'));

-- Tier 2: Session UX + trajectory
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS attention_span TEXT NOT NULL DEFAULT 'medium'
    CHECK (attention_span IN ('short', 'medium', 'long')),
  ADD COLUMN IF NOT EXISTS parent_goal    TEXT NOT NULL DEFAULT 'reinforce'
    CHECK (parent_goal IN ('catch_up', 'reinforce', 'advance')),
  ADD COLUMN IF NOT EXISTS motivation_style TEXT NOT NULL DEFAULT 'encouragement'
    CHECK (motivation_style IN ('rewards', 'challenge', 'encouragement'));

-- Tier 3: Free-text AI context (injected into Claude system prompt)
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS learning_notes TEXT;

-- Comment the fields for future devs
COMMENT ON COLUMN children.school_grade          IS '1-5=G1-G5. What grade the child is currently in at school (vs assessed math level).';
COMMENT ON COLUMN children.learning_pace         IS 'steady|average|quick. Controls how many correct answers needed before advancing difficulty.';
COMMENT ON COLUMN children.challenge_preference  IS 'gentle|balanced|loves_challenge. Controls hint frequency and difficulty retreat speed on errors.';
COMMENT ON COLUMN children.attention_span        IS 'short(≤8min)|medium(10-15min)|long(20+min). Sets default questions-per-session.';
COMMENT ON COLUMN children.parent_goal           IS 'catch_up|reinforce|advance. Algorithm trajectory target relative to school_grade.';
COMMENT ON COLUMN children.motivation_style      IS 'rewards|challenge|encouragement. How the UI frames success and celebrates progress.';
COMMENT ON COLUMN children.learning_notes        IS 'Free text from parent (ADHD, ESL, dyscalculia, etc). Injected into AI system prompt.';
