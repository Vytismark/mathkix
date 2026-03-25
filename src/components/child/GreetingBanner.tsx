'use client'

import { useMemo, useState, useEffect } from 'react'
import { MascotCharacter } from './MascotCharacter'

interface GreetingBannerProps {
  childName: string
  streakDays: number
  lastActiveDaysAgo: number
  srDueCount: number
  childId: string
  xpTotal: number
  masteredCount: number
}

function getMood(streakDays: number, lastActiveDaysAgo: number) {
  if (streakDays >= 3 && lastActiveDaysAgo === 0) return 'excited' as const
  if (lastActiveDaysAgo === 0) return 'happy' as const
  if (streakDays > 0) return 'thinking' as const
  return 'neutral' as const
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Greeting pools by context ───────────────────────────────

type Greeting = { main: string; sub: string }

function getGreeting(
  name: string,
  streakDays: number,
  lastActiveDaysAgo: number,
  xpTotal: number,
  masteredCount: number,
): Greeting {
  const hour = new Date().getHours()

  // ── Easter eggs (rare, ~10% chance) ─────────────
  if (Math.random() < 0.1) {
    const easterEggs: Greeting[] = [
      { main: `Psst… ${name}!`, sub: 'Did you know octopuses have 3 hearts? Now go do some math! 🐙' },
      { main: `Hey ${name}!`, sub: 'Fun fact: a pizza that has radius "z" and height "a" has volume Pi·z·z·a 🍕' },
      { main: `Yo ${name}!`, sub: 'Parallel lines have so much in common… shame they never meet 😄' },
      { main: `${name}!!! 🎪`, sub: 'Why was 6 afraid of 7? Because 7 ate 9!' },
      { main: `Knock knock, ${name}!`, sub: "Who's there? Math. Math who? Math-ter of the universe! 🌍" },
      { main: `🦖 Rawr ${name}!`, sub: 'Even dinosaurs did math. Probably. Start your lesson!' },
      { main: `🪄 Abracadabra!`, sub: `${name}, you just appeared! Time for some math magic!` },
      { main: `🕵️ Agent ${name}`, sub: 'Your mission: solve math problems. Do you accept?' },
    ]
    return pick(easterEggs)
  }

  // ── Streak milestones ───────────────────────────
  if (streakDays === 7) return { main: `🎉 One week streak, ${name}!`, sub: "You're unstoppable! Keep that fire burning!" }
  if (streakDays === 14) return { main: `🏆 Two weeks straight!`, sub: `${name}, you're a math machine!` }
  if (streakDays === 30) return { main: `👑 30-day streak!`, sub: `${name}, you're basically a math legend now.` }
  if (streakDays === 100) return { main: `💯 100 DAYS!`, sub: `${name}… are you even real?! That's incredible!` }
  if (streakDays >= 50) return { main: `🔥 ${streakDays} days strong!`, sub: `${name}, you're on a legendary streak!` }

  // ── XP milestones ───────────────────────────────
  if (xpTotal > 0 && xpTotal % 1000 < 50) return { main: `⭐ ${xpTotal.toLocaleString()} XP!`, sub: `${name}, look how far you've come!` }

  // ── Mastery celebrations ────────────────────────
  if (masteredCount === 1 && lastActiveDaysAgo <= 1) return { main: `🎯 First mastery!`, sub: `${name}, you mastered your first skill! Amazing!` }
  if (masteredCount >= 5) return pick([
    { main: `🌟 ${masteredCount} skills mastered!`, sub: `${name}, you're becoming an expert!` },
    { main: `Look at you, ${name}!`, sub: `${masteredCount} skills down - keep crushing it!` },
  ])

  // ── Haven't been active ─────────────────────────
  if (lastActiveDaysAgo >= 7) {
    const comeBack: Greeting[] = [
      { main: `${name}! You're back! 🎉`, sub: "We missed you! Let's jump right in!" },
      { main: `Welcome back, ${name}!`, sub: "Your brain is ready for some math! Let's go!" },
      { main: `There you are, ${name}! 👋`, sub: "It's been a while - let's warm up!" },
    ]
    return pick(comeBack)
  }

  if (lastActiveDaysAgo >= 2) {
    const missYou: Greeting[] = [
      { main: `Hey ${name}! 👋`, sub: "Haven't seen you in a bit - ready to practice?" },
      { main: `${name}! Come on in!`, sub: "Your skills are waiting for you!" },
      { main: `Miss you, ${name}! 🥺`, sub: "Let's get back on track today!" },
    ]
    return pick(missYou)
  }

  // ── Already active today ────────────────────────
  if (lastActiveDaysAgo === 0) {
    const activeToday: Greeting[] = [
      { main: `You're on a roll, ${name}! 🚀`, sub: "Keep the momentum going!" },
      { main: `Back for more, ${name}? 💪`, sub: "Love the dedication!" },
      { main: `${name} is ON FIRE! 🔥`, sub: "Let's keep practicing!" },
      { main: `Look who's here again! 😄`, sub: `${name}, you're a math superstar!` },
      { main: `Another round, ${name}?`, sub: "Your brain must be getting stronger! 🧠" },
    ]
    return pick(activeToday)
  }

  // ── Time-of-day default (active yesterday) ──────
  if (hour < 6) {
    return pick([
      { main: `Up early, ${name}? 🌙`, sub: "Early bird gets the math worm!" },
      { main: `Whoa, ${name}! 😴`, sub: "Math before sunrise? You're dedicated!" },
    ])
  }

  if (hour < 12) {
    const morning: Greeting[] = [
      { main: `Good morning, ${name}! ☀️`, sub: "Fresh brain = best math brain!" },
      { main: `Rise and shine, ${name}! 🌅`, sub: "Let's start the day with some math!" },
      { main: `Morning, ${name}! 🌤️`, sub: "Ready to get smarter today?" },
      { main: `Hey ${name}! 👋`, sub: "Morning practice makes perfect!" },
    ]
    return pick(morning)
  }

  if (hour < 17) {
    const afternoon: Greeting[] = [
      { main: `Hey there, ${name}! 😊`, sub: "Perfect time for some practice!" },
      { main: `What's up, ${name}? 🙌`, sub: "Let's learn something cool!" },
      { main: `Afternoon, ${name}! 🌞`, sub: "Ready for a math adventure?" },
      { main: `Hi ${name}! 🎯`, sub: "Let's sharpen those skills!" },
    ]
    return pick(afternoon)
  }

  const evening: Greeting[] = [
    { main: `Evening, ${name}! 🌙`, sub: "One more lesson before bed?" },
    { main: `Hey ${name}! 🦉`, sub: "Night owls make great mathematicians!" },
    { main: `Still going, ${name}? 🌟`, sub: "You're amazing - one more round!" },
    { main: `${name}! 🌛`, sub: "End the day on a math high!" },
  ]
  return pick(evening)
}

// ── Streak sub-messages ─────────────────────────────────────

function getStreakLine(streakDays: number): string {
  if (streakDays >= 30) return pick([
    `🔥 ${streakDays}-day streak - LEGENDARY!`,
    `🔥 ${streakDays} days! You can't be stopped!`,
  ])
  if (streakDays >= 7) return pick([
    `🔥 ${streakDays}-day streak - incredible!`,
    `🔥 ${streakDays} days and counting!`,
    `🔥 ${streakDays}-day streak! You're on fire!`,
  ])
  if (streakDays >= 3) return pick([
    `🔥 ${streakDays}-day streak - nice!`,
    `🔥 ${streakDays} days in a row!`,
    `🔥 Keep it up! ${streakDays}-day streak!`,
  ])
  return pick([
    `🔥 ${streakDays}-day streak - keep going!`,
    `🔥 Day ${streakDays}! Don't break the chain!`,
  ])
}

// ── Component ───────────────────────────────────────────────

export function GreetingBanner({
  childName,
  streakDays,
  lastActiveDaysAgo,
  srDueCount,
  childId,
  xpTotal,
  masteredCount,
}: GreetingBannerProps) {
  const mood = getMood(streakDays, lastActiveDaysAgo)

  // Defer random greeting to client-only to avoid hydration mismatch
  // (Math.random + Date.now differ between server and client)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const greeting = useMemo(
    () => mounted ? getGreeting(childName, streakDays, lastActiveDaysAgo, xpTotal, masteredCount) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mounted, childName, streakDays, lastActiveDaysAgo, xpTotal, masteredCount]
  )

  const streakLine = useMemo(
    () => mounted && streakDays > 0 ? getStreakLine(streakDays) : null,
    [mounted, streakDays]
  )

  return (
    <div
      className="rounded-3xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #E8F0FE 40%, #FFF7ED 100%)',
        border: '1px solid rgba(54,120,255,0.1)',
        boxShadow: '0 4px 16px rgba(54,120,255,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Decorative corner accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at top right, rgba(54,120,255,0.15), transparent 70%)' }}
      />

      <div className="p-5 sm:p-6 flex items-center gap-4 relative z-10">
        {/* Mascot with colored backdrop */}
        <div className="shrink-0 relative">
          <div
            className="absolute inset-0 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #3678FF, transparent)', transform: 'scale(1.3)' }}
          />
          <MascotCharacter mood={mood} size="lg" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">{greeting?.main ?? `Hey, ${childName}!`}</h2>
          <p className="text-sm sm:text-base text-slate-600 mt-0.5">{greeting?.sub ?? "Let's do some math!"}</p>

          {/* Streak badge */}
          {streakLine && (
            <p className="inline-block text-xs font-bold text-orange-500 mt-2 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">{streakLine}</p>
          )}

          {/* SR review nudge */}
          {srDueCount > 0 && (
            <a
              href={`/play/home?child=${childId}&mode=review`}
              className="inline-flex items-center gap-1.5 mt-2 ml-1 text-xs font-bold text-[#3678FF] bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-200 transition-colors shadow-sm"
            >
              🧠 {srDueCount} review{srDueCount > 1 ? 's' : ''} waiting!
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
