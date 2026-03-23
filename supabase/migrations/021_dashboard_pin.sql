-- Add dashboard PIN hash to parent profiles
-- Stores a PBKDF2-SHA256 hash of the 4-digit PIN (salted with user ID)
-- This is a child-barrier, not a security feature. NULL = no PIN set.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS dashboard_pin_hash TEXT;
