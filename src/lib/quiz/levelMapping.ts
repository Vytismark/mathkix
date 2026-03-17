import type { Domain } from '@/types/quiz'

// ── Grade labels (kept for lesson cards, child profile, etc.) ─────────────────

export const GRADE_LABELS: Record<number, string> = {
  1: 'Grade 1',
  2: 'Grade 2',
  3: 'Grade 3',
  4: 'Grade 4',
  5: 'Grade 5',
}

export const GRADE_DESCRIPTIONS: Record<number, string> = {
  1: 'Adding and subtracting to 20, place value, and telling time',
  2: 'Adding and subtracting to 1000, measuring, and data',
  3: 'Multiplication, division, fractions, and area',
  4: 'Multi-digit multiplication, equivalent fractions, and angles',
  5: 'Decimals, fractions with unlike denominators, and volume',
}

export function getGradeLabel(grade: number): string {
  return GRADE_LABELS[grade] ?? `Grade ${grade}`
}

export function getGradeDescription(grade: number): string {
  return GRADE_DESCRIPTIONS[grade] ?? ''
}

// ── Domain metadata ────────────────────────────────────────────────────────────

/** User-friendly label for each Common Core domain code */
export const DOMAIN_LABELS: Record<Domain, string> = {
  OA:  'Arithmetic',
  NBT: 'Place Value',
  NF:  'Fractions',
  MD:  'Measurement',
  G:   'Geometry',
}

/** One-line description shown in quiz and lesson cards */
export const DOMAIN_DESCRIPTIONS: Record<Domain, string> = {
  OA:  'Addition, subtraction, multiplication, division & word problems',
  NBT: 'Place value, multi-digit arithmetic & rounding',
  NF:  'Fractions, decimals & equivalence',
  MD:  'Measurement, time, money & data graphs',
  G:   'Shapes, area, perimeter & coordinates',
}

/** Emoji icon for each domain */
export const DOMAIN_ICONS: Record<Domain, string> = {
  OA:  '➕',
  NBT: '🔢',
  NF:  '½',
  MD:  '📏',
  G:   '📐',
}

/** Tailwind-compatible accent colour per domain (used for bars, badges, borders) */
export const DOMAIN_COLORS: Record<Domain, { bg: string; text: string; border: string; hex: string }> = {
  OA:  { bg: 'rgba(231,76,60,0.15)',   text: '#f87171', border: 'rgba(231,76,60,0.4)',   hex: '#E74C3C' },
  NBT: { bg: 'rgba(99,102,241,0.15)',  text: '#a5b4fc', border: 'rgba(99,102,241,0.4)',  hex: '#6366f1' },
  NF:  { bg: 'rgba(245,158,11,0.15)',  text: '#fcd34d', border: 'rgba(245,158,11,0.4)',  hex: '#f59e0b' },
  MD:  { bg: 'rgba(14,165,233,0.15)',  text: '#7dd3fc', border: 'rgba(14,165,233,0.4)',  hex: '#0ea5e9' },
  G:   { bg: 'rgba(16,185,129,0.15)',  text: '#6ee7b7', border: 'rgba(16,185,129,0.4)',  hex: '#10b981' },
}

/** Short label used in quiz domain pills (≤10 chars) */
export const DOMAIN_PILL_LABELS: Record<Domain, string> = {
  OA:  'Arithmetic',
  NBT: 'Place Value',
  NF:  'Fractions',
  MD:  'Measurement',
  G:   'Geometry',
}
