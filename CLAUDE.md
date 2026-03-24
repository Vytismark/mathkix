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
- `spaced-repetition.ts` — SM-2 scheduling algorithm
- `affinity.ts` — domain preference tracking with exponential decay
- `achievements.ts` — badge/trophy detection
- `engagement.ts` — attention span calibration

### Placement quiz

`src/lib/quiz/` — 20-question domain sweep with adaptive difficulty stepping. `scoring.ts` validates answers, `levelMapping.ts` maps performance to grade level.

### AI integration

`src/lib/anthropic/` — Claude SDK client and prompt templates. `teacher-prompts.ts` (17KB) handles tutoring with emotion detection, problem-type detection, and context-aware explanations. `support-prompts.ts` powers AI support ticket responses.

### Payments

Stripe checkout → webhook sync. Webhook at `/api/stripe/webhook` handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Trial system in `src/lib/trial.ts` (30-day free trial with warning states).

### Cron jobs

Secured by `CRON_SECRET` header. Defined in `vercel.json`:
- Weekly report emails (Monday 8am)
- Drip email dispatch (daily 9am)
- Cleanup of expired sessions (daily 3am)

### Types

Hand-maintained in `src/types/`: `database.ts` (Supabase schema), `adaptive.ts`, `quiz.ts`, `stripe.ts`. Update these when changing database schema or domain models.

### Question data

`src/data/questions/` — JSON files (grade1-5.json) with 1,890 seeded diagnostic questions.

## Environment Variables

**Required**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `ANTHROPIC_API_KEY`, `ADMIN_EMAILS`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`

**Optional**: `RESEND_API_KEY`, `SUPPORT_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `GA4_MEASUREMENT_PROTOCOL_SECRET`

Validation logic is in `src/lib/env.ts` — use `env.VARIABLE_NAME` in server code for runtime checks.

## Database

Supabase PostgreSQL with Row-Level Security on all user data tables. Migrations live in `supabase/migrations/` as ordered SQL scripts. Key tables: `profiles`, `subscriptions`, `children`, `diagnostic_questions`, `quiz_sessions`, `adaptive_sessions`, `spaced_repetition`, `domain_mastery`, `lessons`, `lesson_attempts`, `achievements`, `support_tickets`, `blog_posts`, `email_queue`.

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
