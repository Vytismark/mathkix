-- Allow reviewers to attach a suggested fix alongside their flag comment.
ALTER TABLE question_reviews
  ADD COLUMN IF NOT EXISTS suggested_fix TEXT;

COMMENT ON COLUMN question_reviews.suggested_fix IS 'Reviewer-provided corrected version of the question (free text)';
