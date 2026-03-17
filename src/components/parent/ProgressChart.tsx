'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WeeklyData {
  week_start: string
  xp_earned: number
  lessons_completed: number
  avg_score_pct: number | null
}

interface DomainData {
  domain: string
  avg_mastery: number
}

interface ProgressChartProps {
  snapshots: WeeklyData[]
  domainStats: DomainData[]
}

const DOMAIN_LABELS: Record<string, string> = {
  OA: 'Operations', NBT: 'Numbers', NF: 'Fractions',
  MD: 'Measurement', G: 'Geometry', CC: 'Counting',
}

export function ProgressChart({ snapshots, domainStats }: ProgressChartProps) {
  const weeklyData = [...snapshots]
    .reverse()
    .map((s) => ({
      week: new Date(s.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      xp: s.xp_earned,
      lessons: s.lessons_completed,
      score: s.avg_score_pct ?? 0,
    }))

  const radarData = domainStats.map((d) => ({
    domain: DOMAIN_LABELS[d.domain] ?? d.domain,
    mastery: d.avg_mastery,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* XP over time */}
      <Card>
        <CardHeader>
          <CardTitle>XP Earned (Weekly)</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyData.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No data yet - keep practicing!
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="#6366f1"
                  fill="#eef2ff"
                  strokeWidth={2}
                  name="XP"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Domain mastery radar */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Mastery</CardTitle>
        </CardHeader>
        <CardContent>
          {radarData.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              Complete lessons to see mastery data.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11 }} />
                <Radar
                  name="Mastery"
                  dataKey="mastery"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
