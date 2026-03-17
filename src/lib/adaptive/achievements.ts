// ============================================================
// Achievement Definitions & Checker
// Pure functions only, no Supabase dependency.
// ============================================================

import type {
  AchievementDefinition,
  AchievementCheckState,
  EarnedAchievement,
} from '@/types/adaptive'

// ── Achievement catalogue ──────────────────────────────────

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Streak achievements
  {
    code: 'streak_3',
    type: 'streak',
    title: '3-Day Streak!',
    description: 'You practiced 3 days in a row. Keep it up!',
    icon_slug: 'fire',
    xp_bonus: 25,
    condition: (s) => s.streak_days >= 3,
  },
  {
    code: 'streak_7',
    type: 'streak',
    title: 'One Week Strong!',
    description: 'A full week of daily practice. Amazing!',
    icon_slug: 'fire_double',
    xp_bonus: 75,
    condition: (s) => s.streak_days >= 7,
  },
  {
    code: 'streak_30',
    type: 'streak',
    title: 'Month-Long Master!',
    description: '30 days in a row. You are unstoppable!',
    icon_slug: 'crown',
    xp_bonus: 300,
    condition: (s) => s.streak_days >= 30,
  },
  // Performance achievements
  {
    code: 'perfect_lesson',
    type: 'performance',
    title: 'Flawless!',
    description: 'You got every question right in a lesson.',
    icon_slug: 'star',
    xp_bonus: 20,
    condition: (s) => s.last_lesson_score === 100 && s.lessons_completed >= 1,
  },
  {
    code: 'perfect_5',
    type: 'performance',
    title: 'Perfectionist!',
    description: 'Five perfect lessons completed!',
    icon_slug: 'stars',
    xp_bonus: 100,
    condition: (s) => s.perfect_lessons >= 5,
  },
  {
    code: 'speed_demon',
    type: 'performance',
    title: 'Lightning Fast!',
    description: 'Perfect score and super quick answers!',
    icon_slug: 'bolt',
    xp_bonus: 30,
    condition: (s) =>
      s.last_lesson_score === 100 &&
      s.avg_response_ms !== null &&
      s.avg_response_ms < 8_000,
  },
  {
    code: 'comeback_kid',
    type: 'performance',
    title: 'Comeback Kid!',
    description: 'You struggled with a topic and then nailed it!',
    icon_slug: 'rocket',
    xp_bonus: 40,
    condition: (s) => {
      if (!s.last_lesson_standard || s.last_lesson_score === null) return false
      const prev = s.standard_best_scores[s.last_lesson_standard]
      return s.last_lesson_score >= 80 && prev !== undefined && prev < 50
    },
  },
  // Mastery achievements
  {
    code: 'mastery_oa',
    type: 'mastery',
    title: 'Arithmetic Ace!',
    description: 'Mastered Operations & Arithmetic!',
    icon_slug: 'plus_circle',
    xp_bonus: 50,
    condition: (s) => (s.domain_mastery.OA ?? 0) >= 80,
  },
  {
    code: 'mastery_nbt',
    type: 'mastery',
    title: 'Place Value Pro!',
    description: 'Mastered Numbers & Base Ten!',
    icon_slug: 'numbers',
    xp_bonus: 50,
    condition: (s) => (s.domain_mastery.NBT ?? 0) >= 80,
  },
  {
    code: 'mastery_nf',
    type: 'mastery',
    title: 'Fraction Fanatic!',
    description: 'Mastered Numbers & Fractions!',
    icon_slug: 'fraction',
    xp_bonus: 50,
    condition: (s) => (s.domain_mastery.NF ?? 0) >= 80,
  },
  {
    code: 'mastery_md',
    type: 'mastery',
    title: 'Measurement Master!',
    description: 'Mastered Measurement & Data!',
    icon_slug: 'ruler',
    xp_bonus: 50,
    condition: (s) => (s.domain_mastery.MD ?? 0) >= 80,
  },
  {
    code: 'mastery_g',
    type: 'mastery',
    title: 'Geometry Genius!',
    description: 'Mastered Geometry!',
    icon_slug: 'shapes',
    xp_bonus: 50,
    condition: (s) => (s.domain_mastery.G ?? 0) >= 80,
  },
  {
    code: 'mastery_all',
    type: 'mastery',
    title: 'Well-Rounded!',
    description: 'Strong in every math topic. You are a true math star!',
    icon_slug: 'trophy',
    xp_bonus: 500,
    condition: (s) => {
      const entries = Object.entries(s.domain_mastery).filter(([, v]) => v !== undefined)
      return entries.length >= 4 && entries.every(([, v]) => v >= 70)
    },
  },
  // Spaced repetition achievements
  {
    code: 'sr_10',
    type: 'spaced_repetition',
    title: 'Memory Master!',
    description: 'You reviewed and remembered 10 topics!',
    icon_slug: 'brain',
    xp_bonus: 60,
    condition: (s) => s.sr_items_reviewed >= 10,
  },
  {
    code: 'sr_50',
    type: 'spaced_repetition',
    title: 'Memory Legend!',
    description: '50 review sessions completed. Your memory is incredible!',
    icon_slug: 'brain_gold',
    xp_bonus: 200,
    condition: (s) => s.sr_items_reviewed >= 50,
  },
  // Consistency achievement
  {
    code: 'consistent_7',
    type: 'consistency',
    title: 'Weekly Warrior!',
    description: 'You completed lessons every day this week!',
    icon_slug: 'calendar',
    xp_bonus: 100,
    condition: (s) => s.recent_week_lessons >= 7,
  },
]

// ── Checker ────────────────────────────────────────────────

/**
 * Evaluate all achievement conditions and return only newly-earned ones.
 * Already-earned achievements (by code) are excluded.
 */
export function checkAchievements(
  state: AchievementCheckState,
  existingCodes: string[]
): AchievementDefinition[] {
  const existingSet = new Set(existingCodes)
  return ACHIEVEMENT_DEFINITIONS.filter(
    (def) => !existingSet.has(def.code) && def.condition(state)
  )
}

/**
 * Build an EarnedAchievement row ready to insert into the DB.
 */
export function buildAchievementRow(
  childId: string,
  def: AchievementDefinition,
  metadata: Record<string, unknown> = {}
): Omit<EarnedAchievement, 'id'> {
  return {
    child_id:         childId,
    achievement_code: def.code,
    achievement_type: def.type,
    title:            def.title,
    description:      def.description,
    icon_slug:        def.icon_slug,
    xp_bonus:         def.xp_bonus,
    metadata,
    earned_at:        new Date().toISOString(),
  }
}
