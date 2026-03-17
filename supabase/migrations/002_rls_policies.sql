-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security - all tables locked to their owners
-- Run after 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "subscriptions_insert_own" ON subscriptions
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "subscriptions_update_own" ON subscriptions
  FOR UPDATE USING (profile_id = auth.uid());

-- ============================================================
-- CHILDREN
-- ============================================================
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "children_select_own" ON children
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "children_insert_own" ON children
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "children_update_own" ON children
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "children_delete_own" ON children
  FOR DELETE USING (profile_id = auth.uid());

-- ============================================================
-- QUIZ SESSIONS
-- ============================================================
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_sessions_owner" ON quiz_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = quiz_sessions.child_id
        AND children.profile_id = auth.uid()
    )
  );

-- ============================================================
-- LESSON ATTEMPTS
-- ============================================================
ALTER TABLE lesson_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_attempts_owner" ON lesson_attempts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = lesson_attempts.child_id
        AND children.profile_id = auth.uid()
    )
  );

-- ============================================================
-- CHILD STANDARD MASTERY
-- ============================================================
ALTER TABLE child_standard_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mastery_owner" ON child_standard_mastery
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_standard_mastery.child_id
        AND children.profile_id = auth.uid()
    )
  );

-- ============================================================
-- PROGRESS SNAPSHOTS
-- ============================================================
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "snapshots_owner" ON progress_snapshots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = progress_snapshots.child_id
        AND children.profile_id = auth.uid()
    )
  );

-- ============================================================
-- DIAGNOSTIC QUESTIONS - public read (no PII)
-- ============================================================
ALTER TABLE diagnostic_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diagnostic_questions_public_read" ON diagnostic_questions
  FOR SELECT USING (TRUE);

-- ============================================================
-- LESSONS - public read (no PII)
-- ============================================================
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lessons_public_read" ON lessons
  FOR SELECT USING (TRUE);

-- ============================================================
-- SERVICE ROLE bypass (for server-side API routes using service key)
-- Supabase service_role automatically bypasses RLS,
-- so no additional grants needed for server routes.
-- ============================================================
