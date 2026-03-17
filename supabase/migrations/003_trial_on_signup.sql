-- ============================================================
-- 003_trial_on_signup.sql
-- Auto-create a 30-day free trial subscription on user signup
-- Run in Supabase SQL Editor after 001 and 002
-- ============================================================

-- Update handle_new_user() to also insert a trialing subscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );

  -- Create 30-day free trial subscription
  INSERT INTO subscriptions (
    profile_id,
    plan_type,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    'free',
    'trialing',
    now(),
    now() + interval '30 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Backfill: give existing users a trial based on their
-- profile created_at (safe to run multiple times)
-- ============================================================
INSERT INTO subscriptions (
  profile_id,
  plan_type,
  status,
  current_period_start,
  current_period_end
)
SELECT
  p.id,
  'free',
  'trialing',
  p.created_at,
  p.created_at + interval '30 days'
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions s WHERE s.profile_id = p.id
);
