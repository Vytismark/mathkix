-- Admin question review table
-- Stores approve/flag decisions for each reviewable question

CREATE TABLE IF NOT EXISTS question_reviews (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  question_ref    text    NOT NULL UNIQUE,           -- 'diag:{id}' | 'lesson:{lessonId}:{idx}' | 'proc:{grade}-{domain}-{diff}:{idx}'
  question_source text    NOT NULL CHECK (question_source IN ('diagnostic', 'lesson', 'procedural')),
  question_snapshot jsonb NOT NULL,                  -- full question at time of review
  status          text    NOT NULL CHECK (status IN ('approved', 'flagged')),
  comment         text,                              -- required when flagged
  reviewed_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_reviews_ref    ON question_reviews(question_ref);
CREATE INDEX IF NOT EXISTS idx_question_reviews_status ON question_reviews(status);
