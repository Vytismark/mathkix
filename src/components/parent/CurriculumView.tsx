'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

/* ── Types ─────────────────────────────────────────────── */

interface StandardEntry {
  code: string
  title: string
}

interface DomainEntry {
  key: string
  label: string
  icon: string
  description: string
  color: { bg: string; text: string; border: string; hex: string }
  standards: StandardEntry[]
}

interface GradeEntry {
  grade: number
  totalStandards: number
  domains: DomainEntry[]
}

interface CurriculumViewProps {
  grades: GradeEntry[]
  defaultGrade: number
}

/* ── Component ─────────────────────────────────────────── */

export function CurriculumView({ grades, defaultGrade }: CurriculumViewProps) {
  const [selectedGrade, setSelectedGrade] = useState(defaultGrade)
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set())

  const gradeData = grades.find((g) => g.grade === selectedGrade) ?? grades[0]

  const toggleDomain = (key: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // When switching grades, reset expanded domains
  const handleGradeChange = (grade: number) => {
    setSelectedGrade(grade)
    setExpandedDomains(new Set())
  }

  return (
    <div>
      {/* Grade tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {grades.map((g) => {
          const active = g.grade === selectedGrade
          return (
            <button
              key={g.grade}
              onClick={() => handleGradeChange(g.grade)}
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{
                background: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                color: active ? '#fff' : 'rgba(148,163,184,0.7)',
                border: `1px solid ${active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              Grade {g.grade}
              <span
                className="ml-1.5 text-[10px]"
                style={{ color: active ? 'rgba(255,255,255,0.5)' : 'rgba(148,163,184,0.4)' }}
              >
                {g.totalStandards} standards
              </span>
            </button>
          )
        })}
      </div>

      {/* Domain sections */}
      <div className="space-y-3">
        {gradeData.domains.map((domain) => {
          const isExpanded = expandedDomains.has(domain.key)

          return (
            <div
              key={domain.key}
              className="rounded-2xl border overflow-hidden"
              style={{
                background: domain.color.bg,
                borderColor: isExpanded ? domain.color.border : 'rgba(255,255,255,0.08)',
              }}
            >
              {/* Domain header */}
              <button
                onClick={() => toggleDomain(domain.key)}
                className="w-full text-left px-4 py-3.5 flex items-start gap-3 cursor-pointer group"
              >
                <span className="text-2xl shrink-0 mt-0.5">{domain.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{domain.label}</h3>
                    <span className="text-[10px] text-slate-500">
                      {domain.standards.length} standard{domain.standards.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{domain.description}</p>
                </div>
                <ChevronDown
                  className="w-4 h-4 text-slate-500 shrink-0 mt-1 transition-transform duration-200 group-hover:text-slate-400"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {/* Standards list */}
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden min-h-0">
                  <div
                    className="px-4 pb-3 pt-1 border-t space-y-1"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    {domain.standards.map((std) => (
                      <div
                        key={std.code}
                        className="flex items-center gap-3 py-2 px-2 rounded-lg"
                      >
                        <span
                          className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                          style={{
                            background: domain.color.bg,
                            color: domain.color.text,
                            border: `1px solid ${domain.color.border}`,
                          }}
                        >
                          {std.code}
                        </span>
                        <span className="text-xs text-slate-300">{std.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <p className="text-[11px] text-slate-600 mt-6 text-center">
        Curriculum aligned to Common Core State Standards for Mathematics (K-5).
        <br />
        {grades.reduce((sum, g) => sum + g.totalStandards, 0)} standards across {grades.length} grade levels.
      </p>
    </div>
  )
}
