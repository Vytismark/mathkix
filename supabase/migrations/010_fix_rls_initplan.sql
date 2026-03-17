-- ============================================================
-- 010_fix_rls_initplan.sql
-- Fix auth.uid() re-evaluation per row in RLS policies.
-- Wraps auth.uid() in (select auth.uid()) so Postgres evaluates
-- it once per query (InitPlan) rather than once per row.
-- ============================================================

-- ============================================================
-- PROFILES
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING ((select auth.uid()) = id);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON subscriptions;

CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (profile_id = (select auth.uid()));

CREATE POLICY "subscriptions_insert_own" ON subscriptions
  FOR INSERT WITH CHECK (profile_id = (select auth.uid()));

CREATE POLICY "subscriptions_update_own" ON subscriptions
  FOR UPDATE USING (profile_id = (select auth.uid()));

-- ============================================================
-- CHILDREN
-- ============================================================
DROP POLICY IF EXISTS "children_select_own" ON children;
DROP POLICY IF EXISTS "children_insert_own" ON children;
DROP POLICY IF EXISTS "children_update_own" ON children;
DROP POLICY IF EXISTS "children_delete_own" ON children;

CREATE POLICY "children_select_own" ON children
  FOR SELECT USING (profile_id = (select auth.uid()));

CREATE POLICY "children_insert_own" ON children
  FOR INSERT WITH CHECK (profile_id = (select auth.uid()));

CREATE POLICY "children_update_own" ON children
  FOR UPDATE USING (profile_id = (select auth.uid()));

CREATE POLICY "children_delete_own" ON children
  FOR DELETE USING (profile_id = (select auth.uid()));

-- ============================================================
-- QUIZ SESSIONS
-- ============================================================
DROP POLICY IF EXISTS "quiz_sessions_owner" ON quiz_sessions;

CREATE POLICY "quiz_sessions_owner" ON quiz_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = quiz_sessions.child_id
        AND children.profile_id = (select auth.uid())
    )
  );

-- ============================================================
-- LESSON ATTEMPTS
-- ============================================================
DROP POLICY IF EXISTS "lesson_attempts_owner" ON lesson_attempts;

CREATE POLICY "lesson_attempts_owner" ON lesson_attempts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = lesson_attempts.child_id
        AND children.profile_id = (select auth.uid())
    )
  );

-- ============================================================
-- CHILD STANDARD MASTERY
-- ============================================================
DROP POLICY IF EXISTS "mastery_owner" ON child_standard_mastery;

CREATE POLICY "mastery_owner" ON child_standard_mastery
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_standard_mastery.child_id
        AND children.profile_id = (select auth.uid())
    )
  );

-- ============================================================
-- PROGRESS SNAPSHOTS
-- ============================================================
DROP POLICY IF EXISTS "snapshots_owner" ON progress_snapshots;

CREATE POLICY "snapshots_owner" ON progress_snapshots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = progress_snapshots.child_id
        AND children.profile_id = (select auth.uid())
    )
  );

-- ============================================================
-- BEHAVIORAL EVENTS
-- ============================================================
DROP POLICY IF EXISTS "behavioral_events_child_owner" ON behavioral_events;

CREATE POLICY "behavioral_events_child_owner" ON behavioral_events
  USING (child_id IN (
    SELECT id FROM children WHERE profile_id = (select auth.uid())
  ));

-- ============================================================
-- TOPIC AFFINITY
-- ============================================================
DROP POLICY IF EXISTS "topic_affinity_child_owner" ON topic_affinity;

CREATE POLICY "topic_affinity_child_owner" ON topic_affinity
  USING (child_id IN (
    SELECT id FROM children WHERE profile_id = (select auth.uid())
  ));

-- ============================================================
-- SPACED REPETITION ITEMS
-- ============================================================
DROP POLICY IF EXISTS "sr_items_child_owner" ON spaced_repetition_items;

CREATE POLICY "sr_items_child_owner" ON spaced_repetition_items
  USING (child_id IN (
    SELECT id FROM children WHERE profile_id = (select auth.uid())
  ));

-- ============================================================
-- PRACTICE SESSIONS
-- ============================================================
DROP POLICY IF EXISTS "practice_sessions_child_owner" ON practice_sessions;

CREATE POLICY "practice_sessions_child_owner" ON practice_sessions
  USING (child_id IN (
    SELECT id FROM children WHERE profile_id = (select auth.uid())
  ));

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
DROP POLICY IF EXISTS "achievements_child_owner" ON achievements;

CREATE POLICY "achievements_child_owner" ON achievements
  USING (child_id IN (
    SELECT id FROM children WHERE profile_id = (select auth.uid())
  ));
