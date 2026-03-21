import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWeeklyReportEmail, type WeeklyReportChild } from '@/lib/email/templates'

function formatWeekLabel(weekStart: Date): string {
  const end = new Date(weekStart)
  end.setDate(weekStart.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${weekStart.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}, ${end.getFullYear()}`
}

export async function POST(request: Request) {
  // Verify cron secret - Vercel sets Authorization: Bearer <CRON_SECRET> automatically
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mathkix.com'

  // Last week: from 7 days ago (previous Sunday if running on Monday)
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(now.getDate() - 7)
  weekAgo.setHours(0, 0, 0, 0)
  const weekAgoStr = weekAgo.toISOString().slice(0, 10)
  const weekLabel = formatWeekLabel(weekAgo)

  // Fetch all profiles - filter opted-in in JS (JSONB key filter)
  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id, email, full_name, notification_preferences')

  if (profilesError) {
    console.error('weekly-report: failed to fetch profiles:', profilesError)
    return NextResponse.json({ error: profilesError.message }, { status: 500 })
  }

  // Only send to users who have explicitly opted in
  const optedIn = (profiles ?? []).filter((p) => {
    const prefs = p.notification_preferences as Record<string, boolean> | null
    return prefs?.weekly_reports === true // send only if explicitly opted in
  })

  if (optedIn.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, errors: 0, message: 'No opted-in users' })
  }

  let sent = 0
  let skipped = 0
  let errors = 0

  for (const profile of optedIn) {
    try {
      // Get this parent's children
      const { data: children } = await admin
        .from('children')
        .select('id, name, avatar_id, school_grade, streak_days, placement_done')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: true })

      if (!children || children.length === 0) {
        skipped++
        continue
      }

      const childIds = children.map((c) => c.id)

      // Last week's progress snapshots for all children (parallel)
      const [snapshotsResult, achievementsResult] = await Promise.all([
        admin
          .from('progress_snapshots')
          .select('child_id, lessons_completed, xp_earned, avg_score_pct')
          .in('child_id', childIds)
          .gte('week_start', weekAgoStr),
        admin
          .from('achievements')
          .select('child_id, title, icon_slug, achievement_type')
          .in('child_id', childIds)
          .gte('earned_at', weekAgo.toISOString()),
      ])

      const snapshots = snapshotsResult.data ?? []
      const achievements = achievementsResult.data ?? []

      // Build per-child report data
      const childData: WeeklyReportChild[] = children.map((child) => {
        const childSnaps = snapshots.filter((s) => s.child_id === child.id)
        const childAchs = achievements.filter((a) => a.child_id === child.id)

        const weekXP = childSnaps.reduce((sum, s) => sum + (s.xp_earned ?? 0), 0)
        const weekLessons = childSnaps.reduce((sum, s) => sum + (s.lessons_completed ?? 0), 0)
        const scores = childSnaps
          .filter((s) => s.avg_score_pct != null)
          .map((s) => s.avg_score_pct as number)
        const weekAvgScore =
          scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : null

        return {
          id: child.id,
          name: child.name,
          avatar_id: child.avatar_id,
          school_grade: child.school_grade,
          streak_days: child.streak_days ?? 0,
          weekXP,
          weekLessons,
          weekAvgScore,
          achievements: childAchs,
          hasActivity: weekXP > 0 || weekLessons > 0,
        }
      })

      // Skip if no child had any activity at all this week
      const anyActivity = childData.some((c) => c.hasActivity)
      if (!anyActivity) {
        skipped++
        continue
      }

      await sendWeeklyReportEmail({
        parentEmail: profile.email,
        parentName: profile.full_name,
        weekLabel,
        children: childData,
        appUrl,
      })

      sent++
    } catch (e) {
      console.error(`weekly-report: failed for profile ${profile.id}:`, e)
      errors++
    }
  }

  console.log(`weekly-report: sent=${sent} skipped=${skipped} errors=${errors}`)
  return NextResponse.json({ sent, skipped, errors, total: optedIn.length })
}
