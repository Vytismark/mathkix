-- Email drip sequence queue
-- Each row represents one scheduled email for one user.
-- UNIQUE(profile_id, sequence_key) prevents duplicate sends.

CREATE TABLE IF NOT EXISTS email_queue (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sequence_key  TEXT        NOT NULL,
  send_at       TIMESTAMPTZ NOT NULL,
  sent_at       TIMESTAMPTZ,
  cancelled_at  TIMESTAMPTZ,
  failed_at     TIMESTAMPTZ,
  error         TEXT,
  metadata      JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, sequence_key)
);

-- Partial index for pending emails only (the hot path for the cron runner)
CREATE INDEX IF NOT EXISTS email_queue_pending_idx
  ON email_queue (send_at)
  WHERE sent_at IS NULL AND cancelled_at IS NULL AND failed_at IS NULL;

-- RLS: no direct user access - only service role (cron) writes/reads this table
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
