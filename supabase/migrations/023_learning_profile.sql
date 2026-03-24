-- ============================================================
-- 023: Child learning profile — comprehensive dimension tracking
-- ============================================================

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS learning_profile JSONB DEFAULT '{}'::jsonb;
