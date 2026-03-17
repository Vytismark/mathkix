-- ============================================================
-- Migration 005: Domain-based mastery assessment
-- Replaces single grade_level quiz placement with per-domain
-- mastery percentages (0-100%) and derived effective grades.
-- ============================================================

-- ── Children: add domain mastery maps ──────────────────────

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS domain_mastery JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS domain_grades  JSONB NOT NULL DEFAULT '{}'::jsonb;

-- domain_mastery: { "OA": 72, "NBT": 45, "NF": 20, "MD": 60, "G": 80 }
-- domain_grades:  { "OA": 3,  "NBT": 2,  "NF": 1,  "MD": 2,  "G": 3  }
--   (effective grade per domain = school_grade adjusted by mastery %)

COMMENT ON COLUMN children.domain_mastery IS
  'Per-domain mastery 0-100. Keys: OA, NBT, NF, MD, G. Primary personalization signal.';
COMMENT ON COLUMN children.domain_grades IS
  'Effective lesson grade per domain, derived from domain_mastery + school_grade.';

-- grade_level is now the min(domain_grades values) - kept as a fallback cache
-- and for backwards compatibility with existing lesson queries.

-- ── Quiz sessions: store per-domain results ─────────────────

ALTER TABLE quiz_sessions
  ADD COLUMN IF NOT EXISTS domain_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS domain_grades JSONB NOT NULL DEFAULT '{}'::jsonb;

-- domain_scores: raw computed % per domain from this quiz session
-- domain_grades: effective grade per domain derived in this session

COMMENT ON COLUMN quiz_sessions.domain_scores IS
  'Per-domain mastery % computed during this session. { OA: 72, NBT: 45, ... }';
COMMENT ON COLUMN quiz_sessions.domain_grades IS
  'Effective lesson grade per domain derived from domain_scores + school_grade.';

-- recommended_grade kept for backwards compat.
-- Going forward it equals min(domain_grades values) - the lowest effective grade.
