# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MathKix — a K-5 adaptive math learning platform. Parents create accounts, add children, and children learn through AI-driven lessons with spaced repetition. Built on Next.js 16 (App Router) with Supabase, Stripe, and Anthropic Claude.

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build — run before pushing to catch type errors
npm run lint      # ESLint (Next.js core web vitals + TypeScript)
npm start         # Serve production build locally
```

No test framework is configured. Verify changes with `npm run build` and `npm run lint`.

## Tech Stack

- **Framework**: Next.js 16, React 19, TypeScript 5 (strict mode)
- **Database/Auth**: Supabase (PostgreSQL + RLS + Auth with email/password)
- **Payments**: Stripe (monthly/annual/lifetime subscriptions)
- **AI**: Anthropic Claude SDK for tutoring and support responses
- **Email**: Resend with queue-based drip campaigns
- **Analytics**: PostHog (client + server events) + GA4
- **UI**: Tailwind CSS v4, shadcn/ui, Lucide icons, Recharts
- **Hosting**: Vercel with cron jobs

## Architecture

### Path alias

`@/*` maps to `src/*` (configured in tsconfig.json).

### Route groups

```
src/app/
  (auth)/         — Login, signup, password reset (redirects away if logged in)
  (marketing)/    — Public: landing, pricing, blog, contact
  (parent)/       — Parent dashboard, children management, billing, support
  (child)/play/   — Child-facing learning UI (quiz, lessons, sessions)
  admin/          — Admin panel (email-gated auth via ADMIN_EMAILS env var)
  api/            — ~45 API routes
```

### Supabase client usage

Three client factories in `src/lib/supabase/`:
- `client.ts` — browser client (used in client components)
- `server.ts` — server client (used in Server Components and API routes, respects RLS)
- `admin.ts` — service role client (bypasses RLS, only for webhooks/cron/admin operations)

### Middleware

`middleware.ts` → `src/lib/supabase/middleware.ts`: refreshes Supabase session on every request, protects routes (`/dashboard`, `/children`, `/billing`, `/account`, `/select`, `/play`, `/support`, `/admin`), and redirects authenticated users away from auth pages. Injects `x-pathname` header for server components.

### Adaptive learning engine

`src/lib/adaptive/` — the core learning system:
- `engine.ts` — question selection via composite scoring (mastery need, SR urgency, difficulty fit, domain weight, variety)
- `prerequisites.ts` — DAG-based prerequisite graph traversal, readiness tiers (ideal/ready/unlocked/blocked), priority scoring for next-standard selection, deepest-gap remediation
- `session-composer.ts` — builds structured sessions with instruction + practice + review segments, budget-based allocation with profile-aware adjustments, falls back to practice-only when no authored content exists
- `modality.ts` — teaching modality selection (visual/story/procedural/interactive/challenge) using cold start → epsilon-greedy → Thompson sampling. Profile filters modalities by representation preference, CRA stage, and example-vs-rule preference.
- `profiler.ts` — inference engine that silently builds a 25-dimension learning profile from session behavior. Runs after every session completion. Uses Bayesian-like confidence tracking.
- `profile-signals.ts` — extracts raw behavioral signals from session data (response times, error patterns, engagement, fatigue, modality performance) for the profiler
- `algo-logger.ts` — structured console logging for all algorithm decisions, visible in Vercel Functions logs with `[ALGO:{component}]` tags
- `spaced-repetition.ts` — SM-2 scheduling algorithm
- `affinity.ts` — domain preference tracking with exponential decay
- `achievements.ts` — badge/trophy detection
- `engagement.ts` — attention span calibration

### Child learning profile

`src/types/learning-profile.ts` — 25 dimensions inferred silently from behavior, stored as JSONB on `children.learning_profile`. Each dimension has a value, confidence (0-1), data point count, and last-updated timestamp. Dimensions only change when confidence threshold (0.3) is met.

Profile flows through the system:
1. **Session complete** → profiler extracts signals → updates profile dimensions
2. **Session start** → `deriveProfileAdjustments()` converts profile into actionable adjustments
3. **Session composer** uses adjustments for: difficulty reduction (anxiety), content ordering (fatigue), modality filtering (CRA stage, representation pref), interleaving (preference), word problem reduction (reading struggles)
4. **AI teacher** receives adjustments via `profileAdjustments` in API request body → injects personality rules into Claude system prompt (warmth for anxiety, brevity for brief-depth, growth framing for fixed mindset, error-specific strategies)
5. **Client** receives adjustments in session/start response → stores in sessionStorage → passes to AiTeacherPanel

Profiler dimensions by category:
- **Learning**: cognitiveStage, workingMemoryCapacity, processingSpeed, mathAnxietyLevel
- **Knowledge**: misconceptionFlags (20 detection patterns in `src/data/misconceptions.ts`), proceduralVsConceptual
- **Style**: representationPreference, exampleFirstVsRuleFirst, craStageByDomain
- **Motivation**: motivationOrientation, challengeTolerance, mindsetIndicator
- **Errors**: errorTypeTendency, selfCorrectionAbility, hintResponsiveness, responseLatencyPattern
- **Pacing**: masterySpeedByDomain, interleavingPreference
- **Context**: wordProblemProficiency, sessionFatiguePattern
- **Scaffolding**: feedbackGranularity, explanationDepth
- **Structure**: discoveryVsDirectInstruction, workedExampleFadingStage, problemFirstVsLessonFirst

### Placement quiz

`src/lib/quiz/` — 20-question domain sweep with adaptive difficulty stepping. `scoring.ts` validates answers, `levelMapping.ts` maps performance to grade level.

### AI integration

`src/lib/anthropic/` — Claude SDK client and prompt templates. `teacher-prompts.ts` (17KB) handles tutoring with emotion detection, problem-type detection, and context-aware explanations. `support-prompts.ts` powers AI support ticket responses. The AI teacher at `/api/adaptive/ai-teacher` receives `profileAdjustments` and injects personality rules into the system prompt (anxiety warmth, explanation depth, mindset framing, error-specific strategies, hint scaffolding level).

### Payments

Stripe checkout → webhook sync. Webhook at `/api/stripe/webhook` handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Trial system in `src/lib/trial.ts` (30-day free trial with warning states).

### Cron jobs

Secured by `CRON_SECRET` header. Defined in `vercel.json`:
- Weekly report emails (Monday 8am)
- Drip email dispatch (daily 9am)
- Cleanup of expired sessions (daily 3am)

### Types

Hand-maintained in `src/types/`: `database.ts` (Supabase schema), `adaptive.ts`, `quiz.ts`, `stripe.ts`, `lesson-content.ts` (modalities, instruction steps, session segments, visual assets). Update these when changing database schema or domain models.

### Lesson content

`src/data/lessons/` — hard-coded teaching content organized by grade and standard. Each standard has up to 5 modality variants (visual, story, procedural, interactive, challenge). The lesson registry (`src/data/lessons/index.ts`) lazy-loads content and provides `getLessonContent()`, `getAvailableModalities()`, `hasLessonContent()` queries. Currently authored: Grade 3 OA (3.OA.1–3.OA.9, 45 files). Standards without content fall back to practice-only sessions. All practice questions are tagged with `category` (procedural/conceptual/word_problem/bare_number), `abstractionLevel` (concrete/representational/abstract), and `stepsRequired` (1-3) for the profiler.

### Prerequisite map

`mathkix_prerequisite_map.json` — 393 Common Core standards (Grade 2 → High School) as a directed acyclic graph. Each node has prerequisites. The prerequisite engine in `src/lib/adaptive/prerequisites.ts` traverses this graph to determine which standards are ready to teach.

### Question data

`src/data/questions/` — JSON files (grade1-5.json) with 1,890 seeded diagnostic questions.

## Environment Variables

**Required**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `ANTHROPIC_API_KEY`, `ADMIN_EMAILS`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`

**Optional**: `RESEND_API_KEY`, `SUPPORT_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `GA4_MEASUREMENT_PROTOCOL_SECRET`

Validation logic is in `src/lib/env.ts` — use `env.VARIABLE_NAME` in server code for runtime checks.

## Database

Supabase PostgreSQL with Row-Level Security on all user data tables. Migrations live in `supabase/migrations/` as ordered SQL scripts (001–024). Key tables: `profiles`, `subscriptions`, `children` (includes `modality_scores`, `preferred_modality`, `learning_profile` JSONB, `current_frontier`, `strengths`, `gaps`), `diagnostic_questions`, `quiz_sessions`, `practice_sessions`, `spaced_repetition_items`, `child_standard_mastery`, `lessons`, `lesson_attempts`, `modality_attempts`, `achievements`, `topic_affinity`, `behavioral_events`, `support_tickets`, `blog_posts`, `email_queue`.

## Code Style

- Functional programming preferred; OOP only for external system connectors
- Pure functions — only modify return values, never inputs or global state
- Strict typing everywhere — no `any`, `unknown`, or loose dictionaries
- No default parameter values — all parameters explicit
- Single-purpose functions — no flag parameters that switch logic
- Raise errors explicitly, never silently ignore them
- Error messages must include context: request params, response body, status codes
- No fallbacks unless explicitly requested
- Match existing repository style over personal preference
