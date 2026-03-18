-- Add notification preferences to profiles
ALTER TABLE profiles
  ADD COLUMN notification_preferences JSONB NOT NULL DEFAULT
    '{"support_updates": true, "weekly_reports": true, "product_updates": false}';
