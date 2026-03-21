'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Check, Play, BookOpen, Clock, Target, Hash } from 'lucide-react'

/* ── Types ─────────────────────────────────────────────── */

export interface StandardInfo {
  code: string
  shortCode: string
  gradeLevel: number
  mastery_level: number // 0-3
  attempts: number
  last_attempted: string | null
  title: string        // e.g. "Interpret Products of Whole Numbers"
  domainName: string   // e.g. "Operations and Algebraic Thinking"
}

export interface DomainData {
  domain: string
  label: string
  icon: string
  description: string
  colors: { bg: string; text: string; border: string; hex: string }
  overallMastery: number       // 0-100
  effectiveGrade: number | null
  standards: StandardInfo[]
}

interface DomainProgressGridProps {
  domains: DomainData[]
  childHasPlacement: boolean
  childId: string
  totalStandards: number
  practicedStandards: number
}

/* ── Helpers ───────────────────────────────────────────── */

const MASTERY_LABELS: Record<number, string> = {
  0: 'Not Started',
  1: 'Introduced',
  2: 'Practicing',
  3: 'Mastered',
}

const MASTERY_DESCRIPTIONS: Record<number, string> = {
  0: 'This standard hasn\u2019t been practiced yet.',
  1: 'Your child has been introduced to this concept and is beginning to learn it.',
  2: 'Your child is actively practicing and building confidence with this skill.',
  3: 'Your child has demonstrated strong understanding of this standard!',
}

function relativeTime(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/* ── Mastery Segment Bar ──────────────────────────────── */

function MasterySegmentBar({
  level,
  hex,
  size = 'sm',
}: {
  level: number
  hex: string
  size?: 'sm' | 'lg'
}) {
  const w = size === 'lg' ? 'w-8' : 'w-5'
  const h = size === 'lg' ? 'h-2' : 'h-1.5'

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3].map((seg) => (
          <div
            key={seg}
            className={`${w} ${h} rounded-full transition-colors duration-300`}
            style={{
              background: level >= seg ? hex : 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
      </div>
      {level === 3 && (
        <Check className={size === 'lg' ? 'w-4 h-4 ml-0.5' : 'w-3 h-3 ml-0.5'} style={{ color: hex }} />
      )}
    </div>
  )
}

/* ── Standard Detail Panel ────────────────────────────── */

function StandardDetail({
  standard,
  colors,
}: {
  standard: StandardInfo
  colors: DomainData['colors']
}) {
  const masteryLabel = MASTERY_LABELS[standard.mastery_level] ?? 'Unknown'
  const masteryDesc = MASTERY_DESCRIPTIONS[standard.mastery_level] ?? ''

  return (
    <div
      className="mx-2 mb-2 p-3.5 rounded-xl border animate-fade-in"
      style={{
        background: 'rgba(0,0,0,0.25)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      {/* Title */}
      <h4 className="text-sm font-semibold text-white mb-0.5">
        {standard.title || standard.code}
      </h4>
      <p className="text-[11px] text-slate-500 mb-3">{standard.domainName}</p>

      {/* Mastery status */}
      <div
        className="flex items-center gap-3 p-2.5 rounded-lg mb-3"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <MasterySegmentBar level={standard.mastery_level} hex={colors.hex} size="lg" />
        <div className="min-w-0">
          <p className="text-xs font-medium" style={{ color: colors.text }}>{masteryLabel}</p>
          <p className="text-[11px] text-slate-500 leading-snug">{masteryDesc}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Hash className="w-3 h-3 text-slate-600" />
          <span>Standard <span className="font-semibold text-slate-300">{standard.code}</span></span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Target className="w-3 h-3 text-slate-600" />
          <span>Grade <span className="font-semibold text-slate-300">{standard.gradeLevel}</span> level</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Play className="w-3 h-3 text-slate-600" />
          <span><span className="font-semibold text-slate-300">{standard.attempts}</span> attempt{standard.attempts !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3 h-3 text-slate-600" />
          <span>Last practiced <span className="font-semibold text-slate-300">{formatDate(standard.last_attempted)}</span></span>
        </div>
      </div>
    </div>
  )
}

/* ── Standard Row ─────────────────────────────────────── */

function StandardRow({
  standard,
  colors,
  index,
  isSelected,
  onSelect,
}: {
  standard: StandardInfo
  colors: DomainData['colors']
  index: number
  isSelected: boolean
  onSelect: () => void
}) {
  const masteryLabel = MASTERY_LABELS[standard.mastery_level] ?? 'Unknown'
  const time = relativeTime(standard.last_attempted)
  const unpracticed = standard.attempts === 0 && standard.mastery_level === 0

  return (
    <div className="standard-row-animate" style={{ animationDelay: `${index * 40}ms` }}>
      <button
        onClick={onSelect}
        className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors text-left cursor-pointer"
        style={{
          background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
          opacity: unpracticed ? 0.5 : 1,
        }}
      >
        {/* Left: code pill + title + mastery */}
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-md"
            style={{
              background: unpracticed ? 'rgba(255,255,255,0.04)' : colors.bg,
              color: unpracticed ? 'rgba(148,163,184,0.6)' : colors.text,
              border: `1px solid ${unpracticed ? 'rgba(255,255,255,0.06)' : colors.border}`,
            }}
          >
            {standard.code}
          </span>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className={`text-xs truncate ${unpracticed ? 'text-slate-600' : 'text-slate-300'}`}>
              {standard.title || masteryLabel}
            </span>
            <MasterySegmentBar level={standard.mastery_level} hex={colors.hex} />
          </div>
        </div>

        {/* Right: meta + chevron */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-600">
            {standard.attempts > 0 && (
              <span>{standard.attempts} attempt{standard.attempts !== 1 ? 's' : ''}</span>
            )}
            {time && <span>{time}</span>}
          </div>
          <ChevronRight
            className="w-3.5 h-3.5 text-slate-600 transition-transform duration-200"
            style={{ transform: isSelected ? 'rotate(90deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {/* Expandable detail panel */}
      <div
        className="grid transition-[grid-template-rows] duration-250 ease-out"
        style={{ gridTemplateRows: isSelected ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden min-h-0">
          {isSelected && <StandardDetail standard={standard} colors={colors} />}
        </div>
      </div>
    </div>
  )
}

/* ── Domain Card ──────────────────────────────────────── */

function DomainCard({
  domain,
  isExpanded,
  onToggle,
  selectedStandard,
  onSelectStandard,
}: {
  domain: DomainData
  isExpanded: boolean
  onToggle: () => void
  selectedStandard: string | null
  onSelectStandard: (code: string | null) => void
}) {
  const { colors, standards } = domain
  const practicedCount = standards.filter((s) => s.attempts > 0 || s.mastery_level > 0).length
  const masteredCount = standards.filter((s) => s.mastery_level === 3).length

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-shadow duration-200"
      style={{
        background: colors.bg,
        borderColor: isExpanded ? colors.border : 'rgba(255,255,255,0.08)',
        boxShadow: isExpanded ? `0 0 24px ${colors.bg}` : 'none',
      }}
    >
      {/* Header - always visible, clickable */}
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3.5 flex items-start gap-3 cursor-pointer group"
      >
        {/* Icon */}
        <span className="text-2xl shrink-0 mt-0.5">{domain.icon}</span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white">{domain.label}</h3>
            {domain.effectiveGrade != null && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(255,255,255,0.08)', color: colors.text }}
              >
                G{domain.effectiveGrade}
              </span>
            )}
            {standards.length > 0 && (
              <span className="text-[10px] text-slate-500 ml-auto hidden sm:inline">
                {practicedCount}/{standards.length} practiced
                {masteredCount > 0 && <> &middot; {masteredCount} mastered</>}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{domain.description}</p>

          {/* Mastery progress bar */}
          <div className="mt-2.5 flex items-center gap-2.5">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(domain.overallMastery, 100)}%`,
                  background: `linear-gradient(90deg, ${colors.hex}, ${colors.text})`,
                }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums" style={{ color: colors.text }}>
              {domain.overallMastery}%
            </span>
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown
          className="w-4 h-4 text-slate-500 shrink-0 mt-1 transition-transform duration-200 group-hover:text-slate-400"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Expandable content - CSS grid transition */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden min-h-0">
          <div className="px-3 pb-3 pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="space-y-0.5">
              {/* Mobile practiced/mastered count */}
              <div className="sm:hidden text-[11px] text-slate-500 px-3 pb-1">
                {practicedCount}/{standards.length} practiced
                {masteredCount > 0 && <> &middot; {masteredCount} mastered</>}
              </div>
              {standards.map((s, i) => (
                <StandardRow
                  key={s.code}
                  standard={s}
                  colors={colors}
                  index={i}
                  isSelected={selectedStandard === s.code}
                  onSelect={() =>
                    onSelectStandard(selectedStandard === s.code ? null : s.code)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Grid ────────────────────────────────────────── */

export function DomainProgressGrid({
  domains,
  childHasPlacement,
  childId,
  totalStandards,
  practicedStandards,
}: DomainProgressGridProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null)

  const toggle = (domain: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(domain)) {
        next.delete(domain)
        setSelectedStandard(null)
      } else {
        next.add(domain)
      }
      return next
    })
  }

  /* Empty state */
  if (domains.length === 0 || (!childHasPlacement && practicedStandards === 0)) {
    return (
      <div className="rounded-3xl border border-white/10 p-8 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 font-medium mb-1">No progress data yet</p>
        <p className="text-slate-600 text-sm mb-5">
          {!childHasPlacement
            ? 'Complete the placement quiz to unlock domain breakdowns.'
            : 'Start practicing to see mastery across domains.'}
        </p>
        {!childHasPlacement && (
          <Link href="/select">
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-transform active:scale-95"
              style={{ background: 'linear-gradient(135deg, #2557CC, #3678FF)' }}
            >
              <Play className="w-4 h-4" />
              Start placement quiz
            </button>
          </Link>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold">Math Domains</h2>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-600">
            {practicedStandards} of {totalStandards} standards practiced
          </span>
          <Link
            href="/curriculum"
            className="text-[11px] font-medium text-slate-500 hover:text-slate-300 transition-colors"
          >
            View curriculum →
          </Link>
        </div>
      </div>

      {/* Domain grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 domain-grid">
        {domains.map((d) => (
          <DomainCard
            key={d.domain}
            domain={d}
            isExpanded={expanded.has(d.domain)}
            onToggle={() => toggle(d.domain)}
            selectedStandard={selectedStandard}
            onSelectStandard={setSelectedStandard}
          />
        ))}
      </div>
    </div>
  )
}
