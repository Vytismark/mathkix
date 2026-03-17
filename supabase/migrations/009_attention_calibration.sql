-- ============================================================
-- 009: Attention span auto-calibration
--
-- span_calibration_score: running accumulation (-10 to +10).
--   Breezing session (fast + good score) → +2
--   Overwhelmed session (very low score) → -2
--   Neutral session                      →  0 (no decay)
-- Threshold ±10 → adjust span_question_offset by ±1, reset score to 0.
-- Requires ~5 consistent sessions to shift - won't move on a bad day.
--
-- span_question_offset: added to the base question count derived from
-- attention_span (parent's choice, never modified by the algorithm).
-- Clamped in app code so effective count stays within [3, 13].
-- ============================================================

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS span_calibration_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS span_question_offset   integer NOT NULL DEFAULT 0;
