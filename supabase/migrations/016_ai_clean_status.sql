-- Add 'ai_clean' status so the review script can mark processed-but-unflagged
-- questions in the DB. This lets re-runs skip them without a local checkpoint file.
--
-- ai_clean  = AI reviewed, no issues found (not yet seen by a human)
-- ai_flagged is represented by status='flagged' + is_ai_review=TRUE
-- approved  = human approved
-- flagged   = human flagged with a comment

ALTER TABLE question_reviews
  DROP CONSTRAINT IF EXISTS question_reviews_status_check;

ALTER TABLE question_reviews
  ADD CONSTRAINT question_reviews_status_check
  CHECK (status IN ('approved', 'flagged', 'ai_clean'));
