// ============================================================
// Lesson Content Registry
//
// Central loader for hard-coded lesson content organized by
// standard code and teaching modality. Content is authored in
// per-standard directories (e.g. grade3/3.OA.1/visual.ts).
//
// When content doesn't exist for a standard, the session
// composer falls back to practice-only mode.
//
// Uses lazy initialization to avoid circular dependency issues
// with the type system during module evaluation.
// ============================================================

import type { LessonContent, TeachingModality } from '@/types/lesson-content'

// ── Content registry ─────────────────────────────────────────

const registry = new Map<string, LessonContent>()
let initialized = false

const MODALITIES: TeachingModality[] = ['visual', 'story', 'procedural', 'interactive', 'challenge']

function registryKey(standardCode: string, modality: TeachingModality): string {
  return `${standardCode}:${modality}`
}

/** Register a lesson content variant. Called by grade-level index files. */
export function registerLesson(content: LessonContent): void {
  registry.set(registryKey(content.standardCode, content.modality), content)
}

/** Register multiple lesson content variants at once. */
export function registerLessons(contents: LessonContent[]): void {
  for (const content of contents) {
    registerLesson(content)
  }
}

// ── Lazy initialization ──────────────────────────────────────

function ensureInitialized(): void {
  if (initialized) return
  initialized = true

  // Dynamically require grade content to avoid circular import issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./grade3')
}

// ── Queries ──────────────────────────────────────────────────

/** Get a specific lesson content variant. */
export function getLessonContent(
  standardCode: string,
  modality: TeachingModality,
): LessonContent | null {
  ensureInitialized()
  return registry.get(registryKey(standardCode, modality)) ?? null
}

/** Get all available modalities for a standard. */
export function getAvailableModalities(standardCode: string): TeachingModality[] {
  ensureInitialized()
  return MODALITIES.filter(
    (m) => registry.has(registryKey(standardCode, m))
  )
}

/** Check if any lesson content exists for a standard. */
export function hasLessonContent(standardCode: string): boolean {
  return getAvailableModalities(standardCode).length > 0
}

/** Get all standards that have at least one lesson content variant. */
export function getContentStandards(): string[] {
  ensureInitialized()
  const standards = new Set<string>()
  for (const key of registry.keys()) {
    standards.add(key.split(':')[0])
  }
  return [...standards]
}

/** Get the total number of registered lesson content variants. */
export function getContentCount(): number {
  ensureInitialized()
  return registry.size
}
