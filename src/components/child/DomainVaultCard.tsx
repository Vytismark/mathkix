'use client'

import { useState } from 'react'

// ── Discovery content per domain ────────────────────────────
// Each discovery is a real, verifiable mathematical fact or trick.
// Science: Loewenstein (1994) information-gap theory — partial
// information creates stronger curiosity motivation than none.

const DOMAIN_META: Record<string, {
  label: string
  icon: string
  color: string
  colorLight: string
  discovery: { emoji: string; title: string; body: string }
}> = {
  OA: {
    label: 'Operations',
    icon: '➕',
    color: '#3678FF',
    colorLight: '#eff6ff',
    discovery: {
      emoji: '🧠',
      title: 'The 11× mind trick',
      body: 'Multiply any 2-digit number by 11: add the two digits and put the sum in the middle. 23 × 11 = 253. 45 × 11 = 495. It always works — every single time. Try it on a friend!',
    },
  },
  NBT: {
    label: 'Numbers',
    icon: '🔢',
    color: '#8b5cf6',
    colorLight: '#f5f3ff',
    discovery: {
      emoji: '💻',
      title: 'Why computers only use 0 and 1',
      body: 'Every number can be written with just 0s and 1s. 5 = 101. 10 = 1010. This is called binary — the secret language of every computer, phone, and video game ever made.',
    },
  },
  NF: {
    label: 'Fractions',
    icon: '½',
    color: '#10b981',
    colorLight: '#f0fdf4',
    discovery: {
      emoji: '♾️',
      title: '0.999... = 1. Exactly.',
      body: '1/3 = 0.333... So 3 × 1/3 = 0.999... But 3 × 1/3 also = 1. So 0.999... = 1. Exactly. Forever. This is mathematically proven — and it confuses even adults!',
    },
  },
  MD: {
    label: 'Measurement',
    icon: '📏',
    color: '#f97316',
    colorLight: '#fff7ed',
    discovery: {
      emoji: '🌍',
      title: 'Measuring the Earth with a stick',
      body: '2,200 years ago, Eratosthenes measured the entire Earth\'s circumference using just a stick and shadows — and got within 2% of the correct answer. No satellites. No computers. Just math.',
    },
  },
  G: {
    label: 'Geometry',
    icon: '🔷',
    color: '#ec4899',
    colorLight: '#fdf2f8',
    discovery: {
      emoji: '🌀',
      title: 'The shape with only one side',
      body: 'Take a strip of paper, twist it once, and tape the ends. Draw a line down the middle without lifting your pencil — you cover both "sides" because there is only one side. This is a Möbius strip, and it\'s real.',
    },
  },
  CC: {
    label: 'Counting',
    icon: '🔤',
    color: '#f59e0b',
    colorLight: '#fffbeb',
    discovery: {
      emoji: '🔺',
      title: 'The triangle that hides everything',
      body: "Pascal's Triangle hides all Fibonacci numbers, all powers of 2, all triangle numbers, and patterns found in nature — all from one simple triangle built by adding neighbors. Mathematicians are still finding new secrets in it.",
    },
  },
}

const FALLBACK_META = {
  label: 'Math',
  icon: '📘',
  color: '#6b7280',
  colorLight: '#f9fafb',
  discovery: { emoji: '🔮', title: 'A math secret awaits', body: 'Keep practicing to unlock this discovery.' },
}

interface DomainVaultCardProps {
  domain: string
  masteryPct: number        // 0–100
  standardsTotal: number
  standardsMastered: number
  unlockThreshold?: number  // % mastery needed; default 50
}

export function DomainVaultCard({
  domain,
  masteryPct,
  standardsTotal,
  standardsMastered,
  unlockThreshold = 50,
}: DomainVaultCardProps) {
  const [showModal, setShowModal] = useState(false)

  const meta = DOMAIN_META[domain] ?? FALLBACK_META
  const isUnlocked = masteryPct >= unlockThreshold

  // Progress toward unlock (0–100)
  const progressPct = Math.min((masteryPct / unlockThreshold) * 100, 100)

  // Curiosity tease: show first 2 words, blur the rest
  const words = meta.discovery.title.split(' ')
  const visibleWords = words.slice(0, 2).join(' ')
  const hiddenWords = words.slice(2).join(' ')

  // Star dots — represent individual standards (the "constellation")
  const MAX_DOTS = 10
  const dotsToShow = Math.min(standardsTotal, MAX_DOTS)

  return (
    <>
      {/* ── Card ─────────────────────────────────────── */}
      <div
        onClick={() => isUnlocked && setShowModal(true)}
        className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 select-none ${
          isUnlocked
            ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]'
            : 'cursor-default'
        }`}
        style={{
          borderColor: isUnlocked ? `${meta.color}60` : '#e2e8f0',
          background: isUnlocked ? 'white' : '#f8faff',
          boxShadow: isUnlocked ? `0 4px 20px ${meta.color}18` : undefined,
        }}
      >
        {/* Accent bar */}
        <div
          className="h-1.5 w-full transition-colors duration-500"
          style={{ background: isUnlocked ? meta.color : '#cbd5e1' }}
        />

        <div className="p-3.5 flex flex-col gap-2.5">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-all duration-500"
                style={{
                  background: isUnlocked ? meta.color : '#e2e8f0',
                  color: isUnlocked ? 'white' : '#94a3b8',
                }}
              >
                {meta.icon}
              </div>
              <span className="text-xs font-bold text-slate-700">{meta.label}</span>
            </div>
            {isUnlocked ? (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: `${meta.color}18`, color: meta.color }}
              >
                ✨ Tap!
              </span>
            ) : (
              <span className="text-base">🔒</span>
            )}
          </div>

          {/* Constellation dots ─ each dot = one standard (the "B" part) */}
          {dotsToShow > 0 && (
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: dotsToShow }).map((_, i) => {
                const mastered = i < standardsMastered
                return (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-500"
                    style={{
                      width: 10,
                      height: 10,
                      background: mastered ? meta.color : '#e2e8f0',
                      boxShadow: mastered ? `0 0 6px ${meta.color}70` : undefined,
                      transform: mastered ? 'scale(1.15)' : undefined,
                    }}
                  />
                )
              })}
              {standardsTotal > MAX_DOTS && (
                <span className="text-[9px] text-slate-400 font-bold self-center">
                  +{standardsTotal - MAX_DOTS}
                </span>
              )}
            </div>
          )}

          {/* Bottom row: progress bar (locked) or discovery tease (unlocked) */}
          {isUnlocked ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base shrink-0">{meta.discovery.emoji}</span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold" style={{ color: meta.color }}>
                  Discovery unlocked
                </p>
                <p className="text-[11px] text-slate-600 font-semibold leading-tight line-clamp-1">
                  {meta.discovery.title}
                </p>
              </div>
            </div>
          ) : (
            <div>
              {/* Progress bar */}
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%`, background: meta.color }}
                />
              </div>
              {/* Skills count + tease */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] text-slate-400 font-semibold shrink-0">
                  {standardsMastered}/{standardsTotal} skills
                </p>
                <p className="text-[10px] font-semibold text-slate-500 truncate text-right flex items-center gap-0.5">
                  <span>🔒</span>
                  <span>{visibleWords}</span>
                  {hiddenWords && (
                    <span style={{ filter: 'blur(4px)', userSelect: 'none' }}>
                      {' '}{hiddenWords}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Discovery modal ───────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: 'rgba(0,7,20,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Emoji + unlocked badge */}
            <div className="text-center mb-3">
              <div className="text-5xl mb-2">{meta.discovery.emoji}</div>
              <span
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: `${meta.color}15`, color: meta.color }}
              >
                🔓 {meta.label} discovery
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-800 text-center leading-snug mb-3">
              {meta.discovery.title}
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed text-center mb-5">
              {meta.discovery.body}
            </p>

            {/* Constellation row in modal */}
            <div className="flex gap-1.5 justify-center mb-5">
              {Array.from({ length: Math.min(standardsTotal, 12) }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    background: i < standardsMastered ? meta.color : '#e2e8f0',
                    boxShadow: i < standardsMastered ? `0 0 5px ${meta.color}70` : undefined,
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3.5 rounded-2xl text-white font-extrabold text-base transition-all active:scale-[0.98]"
              style={{ background: meta.color }}
            >
              Got it! 🎉
            </button>
          </div>
        </div>
      )}
    </>
  )
}
