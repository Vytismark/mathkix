-- ============================================================
-- 022: Lesson modalities — child learning profile + modality tracking
-- ============================================================

-- ── New columns on children table ────────────────────────────

-- Modality effectiveness tracking (built from session data)
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS modality_scores JSONB DEFAULT '{"visual":{"success_rate":0,"engagement":0,"attempts":0,"last_used":null},"story":{"success_rate":0,"engagement":0,"attempts":0,"last_used":null},"procedural":{"success_rate":0,"engagement":0,"attempts":0,"last_used":null},"interactive":{"success_rate":0,"engagement":0,"attempts":0,"last_used":null},"challenge":{"success_rate":0,"engagement":0,"attempts":0,"last_used":null}}'::jsonb;

-- Derived best modality (null until enough data)
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS preferred_modality TEXT;

-- Standards currently being worked on (frontier of the prerequisite graph)
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS current_frontier JSONB DEFAULT '[]'::jsonb;

-- Standards at mastery 3 (quick lookup for prerequisite checks)
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS strengths JSONB DEFAULT '[]'::jsonb;

-- Standards with low mastery that block higher-grade standards
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS gaps JSONB DEFAULT '[]'::jsonb;

-- ── New table: modality_attempts ─────────────────────────────

CREATE TABLE IF NOT EXISTS modality_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  standard_code   TEXT NOT NULL,
  modality        TEXT NOT NULL CHECK (modality IN ('visual', 'story', 'procedural', 'interactive', 'challenge')),
  score_pct       SMALLINT,
  time_spent_sec  INTEGER,
  engagement_signal TEXT,
  completed_at    TIMESTAMPTZ DEFAULT now()
);

-- Index for querying child's modality history
CREATE INDEX IF NOT EXISTS idx_modality_attempts_child
  ON modality_attempts(child_id, completed_at DESC);

-- Index for per-standard modality analysis
CREATE INDEX IF NOT EXISTS idx_modality_attempts_standard
  ON modality_attempts(child_id, standard_code);

-- ── RLS policies for modality_attempts ───────────────────────

ALTER TABLE modality_attempts ENABLE ROW LEVEL SECURITY;

-- Parents can read their children's modality attempts
CREATE POLICY "Parents read own children modality attempts"
  ON modality_attempts FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM children WHERE profile_id = auth.uid()
    )
  );

-- Service role inserts (from API routes)
CREATE POLICY "Service role manages modality attempts"
  ON modality_attempts FOR ALL
  USING (auth.role() = 'service_role');
