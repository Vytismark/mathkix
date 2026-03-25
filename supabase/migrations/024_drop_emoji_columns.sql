-- ============================================================
-- 024: Remove emoji reaction columns from topic_affinity
-- Emoji feature removed — engagement tracked via behavioral signals
-- ============================================================

ALTER TABLE topic_affinity DROP COLUMN IF EXISTS emoji_positive;
ALTER TABLE topic_affinity DROP COLUMN IF EXISTS emoji_negative;
