-- Add scoring_method column to quiz_sessions to track whether
-- AI or fallback scoring was used for the diagnostic assessment.
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS scoring_method text DEFAULT 'local_fallback';
