# MathKix — K-5 Adaptive Math Learning Platform

> Live at **[mathkix.com](https://mathkix.com)**

MathKix is a subscription-based web application that helps K-5 students master mathematics through adaptive practice, spaced repetition, and AI-powered teaching. Parents manage child profiles and track progress; children learn through a game-like interface with an AI tutor, achievement system, and personalized question selection.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Database Schema](#database-schema)
6. [Running Migrations](#running-migrations)
7. [Routes & Pages](#routes--pages)
8. [API Reference](#api-reference)
9. [Adaptive Learning Engine](#adaptive-learning-engine)
10. [Billing & Subscriptions](#billing--subscriptions)
11. [AI Integration](#ai-integration)
12. [Analytics](#analytics)
13. [Support Ticket System](#support-ticket-system)
14. [Email System](#email-system)
15. [Admin Panel](#admin-panel)
16. [Security](#security)
17. [Deployment](#deployment)
18. [Local Development](#local-development)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Payments | Stripe |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) |
| Email | Resend |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Analytics | PostHog (event tracking + funnels) |
| Hosting | Vercel |

---

## Architecture Overview

```
mathkix.com
├── (marketing)     Public landing, pricing, science, privacy, terms, contact
├── (auth)          Login, signup, password reset (Supabase email/password)
├── (parent)        Protected parent dashboard — children, progress, billing, support
├── (child)         Game-like learning UI — quiz, lessons, adaptive sessions
└── admin/          Admin panel — stats, support tickets, question review
```

**Request flow for authenticated pages:**
1. Next.js middleware (`src/lib/supabase/middleware.ts`) reads the Supabase session cookie on every request.
2. Unauthenticated requests to protected routes are redirected to `/login`.
3. Server components call `createClient()` from `src/lib/supabase/server.ts` to make RLS-scoped queries.
4. API routes use `createAdminClient()` from `src/lib/supabase/admin.ts` (service role, bypasses RLS) for writes that span multiple user contexts (e.g. Stripe webhook, AI responses).

**Rendering strategy:** All routes use `export const dynamic = 'force-dynamic'` — no static prerendering. This is required because every page depends on per-user session data.

---

## Project Structure

```
math-app/
├── src/
│   ├── app/
│   │   ├── (auth)/                  Login, signup, password reset
│   │   ├── (child)/play/            Child-facing learning experience
│   │   ├── (marketing)/             Public pages
│   │   ├── (parent)/                Parent dashboard
│   │   ├── admin/                   Admin panel
│   │   └── api/                     All API route handlers
│   ├── components/
│   │   ├── adaptive/                AI teacher, achievement toasts, interactive question types
│   │   ├── admin/                   Admin shell + question review deck
│   │   ├── analytics/               PostHogProvider (initializes PostHog, wraps app)
│   │   ├── auth/                    Login/signup forms, auth provider context
│   │   ├── child/                   Child UI (XP bar, skill rings, number pad, etc.)
│   │   ├── marketing/               Landing page sections
│   │   ├── parent/                  Parent dashboard components
│   │   ├── quiz/                    Placement quiz components
│   │   └── ui/                      shadcn/ui primitives
│   ├── data/
│   │   └── questions/               grade1-5.json — 1,890 seeded questions
│   ├── lib/
│   │   ├── adaptive/                Engine, spaced repetition, affinity, achievements
│   │   ├── admin/                   Admin auth helper
│   │   ├── anthropic/               Claude client, prompts, teacher/support prompts
│   │   ├── email/                   Resend client + email templates
│   │   ├── posthog/                 client.ts (browser) + server.ts (API routes)
│   │   ├── questions/               Pool tracker
│   │   ├── quiz/                    Scoring, level mapping, adaptive quiz logic
│   │   ├── stripe/                  Client + lazy server proxy
│   │   └── supabase/                Client, server, admin, middleware clients
│   └── types/
│       ├── adaptive.ts              Adaptive engine types
│       ├── curriculum.ts            Lesson + question types
│       ├── database.ts              Supabase-generated DB types (hand-maintained)
│       ├── quiz.ts                  Domain, grade, quiz types
│       └── stripe.ts                Stripe webhook payload types
└── supabase/
    └── migrations/                  13 ordered SQL migration files
```

---

## Environment Variables

Copy `.env.example` to `.env.local` for local development. All variables below are required in Vercel production settings.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Stripe Price IDs (from your Stripe dashboard)
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID=price_...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=https://mathkix.com

# Admin (comma-separated emails that can access /admin)
ADMIN_EMAILS=your@email.com

# Cron (random secret string for securing internal cron endpoints)
CRON_SECRET=some-random-secret

# Email (Resend)
RESEND_API_KEY=re_...
SUPPORT_FROM_EMAIL=support@mathkix.com
ADMIN_NOTIFICATION_EMAIL=your@email.com

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

**Notes:**
- `RESEND_API_KEY` is optional — email features silently degrade if absent.
- `SUPPORT_FROM_EMAIL` defaults to `support@mathkix.com` if not set.
- `CRON_SECRET` must be passed as `Authorization: Bearer <CRON_SECRET>` when calling `/api/internal/*` endpoints.

---

## Database Schema

All 13 migrations must be run **in order** in the Supabase SQL editor.

### Migration order

| File | Description |
|---|---|
| `001_initial_schema.sql` | Core tables: profiles, subscriptions, children, diagnostic_questions, quiz_sessions, lessons, lesson_attempts, child_standard_mastery, progress_snapshots |
| `002_rls_policies.sql` | Row Level Security for all core tables |
| `003_seed_questions.sql` | Seeds 1,890 diagnostic questions (grades 1–5, all domains) |
| `003_trial_on_signup.sql` | DB trigger: auto-creates 30-day free trial subscription on signup |
| `004_seed_curriculum.sql` | Seeds lesson content for all grades |
| `004_child_personalization_fields.sql` | Adds learning_pace, challenge_preference, attention_span, parent_goal, motivation_style, learning_notes to children |
| `005_domain_mastery.sql` | Adds domain_mastery (JSONB), domain_grades (JSONB), span_calibration_score to children |
| `006_adaptive_learning.sql` | Adaptive tables: behavioral_events, topic_affinity, spaced_repetition_items, practice_sessions, achievements |
| `007_scoring_method.sql` | Adds scoring_method, domain_scores, domain_grades to quiz_sessions |
| `008_question_reviews.sql` | Crowdsourced question review queue table |
| `009_attention_calibration.sql` | Adds attention calibration fields |
| `010_fix_rls_initplan.sql` | Performance fix: eliminates RLS init-plan overhead |
| `011_support_tickets.sql` | Support tables: support_tickets, support_messages with RLS |
| `012_fix_domain_values.sql` | Data migration: normalises domain column values |
| `013_notification_preferences.sql` | Adds notification_preferences JSONB to profiles |

### Key tables

**`profiles`** — One row per parent account (mirrors `auth.users`).
```
id (UUID PK, FK auth.users), email, full_name, avatar_url,
stripe_customer_id, notification_preferences (JSONB), created_at, updated_at
```

**`subscriptions`** — Billing state per parent.
```
id, profile_id, stripe_subscription_id, stripe_price_id,
plan_type (free|monthly|annual|lifetime), status (active|canceled|past_due|trialing|incomplete),
current_period_start, current_period_end, cancel_at_period_end
```

**`children`** — Child profiles owned by a parent.
```
id, profile_id, name, birth_year, avatar_id, grade_level (1-5), xp_total, streak_days,
last_active, placement_done, domain_mastery (JSONB), domain_grades (JSONB),
learning_pace, challenge_preference, attention_span, parent_goal, motivation_style,
learning_notes, span_calibration_score
```

**`diagnostic_questions`** — Static question bank (no PII). 1,890 rows.
```
id, grade_level (1-5), domain (OA|NBT|NF|MD|G), standard_code,
question_text, question_type (multiple_choice|numeric|fraction),
options (JSONB), correct_answer, difficulty (1-3), visual_asset
```

**`quiz_sessions`** — Placement quiz tracker per child.
```
id, child_id, status (in_progress|completed|abandoned),
questions_asked (JSONB), total_correct, total_asked,
ai_raw_response, recommended_grade (1-5), confidence_score,
domain_scores (JSONB), domain_grades (JSONB), scoring_method,
started_at, completed_at
```

**`lessons`** — Curriculum content. Seeded from migration 004.
```
id, grade_level, domain, standard_code, title, description,
lesson_type (practice|concept|challenge), difficulty (1-5),
xp_reward, questions (JSONB), sort_order, is_active
```

**`lesson_attempts`** — Student progress on structured lessons.
```
id, child_id, lesson_id, status (started|completed|skipped),
score_pct, answers (JSONB), xp_earned, time_spent_sec, started_at, completed_at
```

**`child_standard_mastery`** — Per-standard mastery state.
```
id, child_id, standard_code,
mastery_level (0=not_seen | 1=introduced | 2=practicing | 3=mastered),
attempts, last_attempted
UNIQUE(child_id, standard_code)
```

**`behavioral_events`** — Raw event stream for adaptive algorithm.
```
id, child_id, session_id,
event_type (answer_correct|answer_wrong|hint_requested|pause_long|
            topic_pivot|session_start|session_end|emoji_reaction),
domain, standard_code, question_id, time_ms, metadata (JSONB)
```

**`topic_affinity`** — Domain enjoyment signal per child.
```
id, child_id, domain, affinity_score (0-100, 50=neutral),
sessions_in_domain, correct_streak_best, avg_response_ms,
emoji_positive, emoji_negative, last_updated
UNIQUE(child_id, domain)
```

**`spaced_repetition_items`** — SM-2 algorithm state per (child, standard).
```
id, child_id, standard_code, domain, grade_level,
ease_factor (1.30-3.0+, default 2.50), interval_days (default 1.0),
repetitions, next_review_at, last_reviewed_at, last_score_pct, times_reviewed
UNIQUE(child_id, standard_code)
```

**`practice_sessions`** — Adaptive session tracker.
```
id, child_id, status (active|completed|abandoned),
engine_state (JSONB), engagement_summary (JSONB),
questions_answered, correct_count, xp_earned, started_at, completed_at
```

**`achievements`** — Earned badges. One row per (child, achievement_code).
```
id, child_id, achievement_code,
achievement_type (streak|mastery|performance|consistency|spaced_repetition),
title, description, icon_slug, xp_bonus, metadata (JSONB), earned_at
UNIQUE(child_id, achievement_code)
```

**`support_tickets`** — Parent support requests.
```
id, profile_id, subject, description,
status (open|awaiting_human|resolved|closed),
priority (low|medium|high|urgent),
ai_message_count, escalated, escalation_reason, created_at, updated_at
```

**`support_messages`** — Messages in a support ticket.
```
id, ticket_id, sender_type (user|ai|admin), content, created_at
```

---

## Running Migrations

1. Open your [Supabase project](https://supabase.com/dashboard) → **SQL Editor**.
2. Run each file in the `supabase/migrations/` directory **in the order listed above**.
3. After running migrations, regenerate TypeScript types:

```bash
npx supabase gen types typescript \
  --project-id YOUR_SUPABASE_PROJECT_ID \
  > src/types/database.ts
```

> **Note:** The hand-maintained `src/types/database.ts` contains critical fixes for TypeScript inference (see the Critical Fixes section below). If you regenerate types, review those fixes before committing.

---

## Routes & Pages

### Marketing (public)

| Route | Description |
|---|---|
| `/` | Landing page — hero, features, app preview, pricing, FAQ |
| `/pricing` | Detailed pricing plans |
| `/science` | Educational methodology page |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/contact` | Contact form |

### Authentication

| Route | Description |
|---|---|
| `/login` | Parent email/password login |
| `/signup` | Parent registration + legal agreement |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset confirmation |
| `/auth/callback` | Supabase OAuth/magic-link callback handler |

### Parent Dashboard (requires auth)

| Route | Description |
|---|---|
| `/dashboard` | Overview: children count, total XP, lessons, streaks |
| `/children` | List of child profiles |
| `/children/new` | Add a new child (name, grade, avatar, preferences) |
| `/children/[childId]` | Child profile detail |
| `/children/[childId]/progress` | Domain-by-domain mastery breakdown + weekly charts |
| `/children/[childId]/settings` | Edit child grade, avatar, learning preferences |
| `/account` | Password change, notification prefs, data export, delete account |
| `/billing` | Current plan, upgrade/downgrade, Stripe portal link |
| `/curriculum` | Browse full K-5 curriculum by grade and domain |
| `/how-to` | Step-by-step usage guide and FAQ |
| `/support` | Support ticket list |
| `/support/new` | Create a new support ticket |
| `/support/[ticketId]` | Chat view for a ticket (AI + human responses) |

### Child Learning (requires auth)

| Route | Description |
|---|---|
| `/select` | Child selector (after parent logs in, choose which child to play as) |
| `/play/home?child=[id]` | Child home — greeting, domain skill rings, XP bar, lesson cards |
| `/play/quiz?child=[id]` | Placement quiz (3-minute level finder) |
| `/play/quiz/results` | Quiz results + recommended grade level |
| `/play/lesson/[lessonId]` | Interactive structured lesson |
| `/play/session/[sessionId]` | Adaptive practice session |
| `/play/celebrate` | Session completion celebration screen |

### Admin (requires ADMIN_EMAILS match)

| Route | Description |
|---|---|
| `/admin/login` | Admin login (Supabase auth + email allowlist) |
| `/admin` | Dashboard — user counts, revenue stats, server info, recent tickets |
| `/admin/questions` | Question review deck for content QA |
| `/admin/support` | All support tickets with filter/sort |
| `/admin/support/[ticketId]` | Ticket detail, reply as admin, change status/priority |

---

## API Reference

All routes live under `src/app/api/`. Server-side routes use the Supabase service role client to bypass RLS where necessary.

### Quiz & Assessment

| Method | Route | Description |
|---|---|---|
| POST | `/api/quiz/start` | Initialize placement quiz session, return first question |
| POST | `/api/quiz/next-question` | Adaptive question selection and answer scoring |
| POST | `/api/quiz/complete` | Finalize quiz, trigger Claude AI grade recommendation |
| POST | `/api/ai/level-assessment` | Claude-powered grade placement (called from quiz/complete) |

### Adaptive Learning

| Method | Route | Description |
|---|---|---|
| POST | `/api/adaptive/session/start` | Create practice session, build question pool via engine |
| POST | `/api/adaptive/session/next` | Get next question, record answer, update mastery |
| POST | `/api/adaptive/session/complete` | Finalize session, update SR intervals, check achievements |
| POST | `/api/adaptive/session/end` | Abandon session cleanly |
| GET | `/api/adaptive/sr-due` | List standards where spaced repetition review is overdue |
| POST | `/api/adaptive/events` | Log behavioral events (hints, pauses, emoji reactions) |
| GET | `/api/adaptive/achievements` | Fetch all earned badges for a child |
| POST | `/api/adaptive/ai-teacher` | Fetch AI hint/explanation for current question |

### Lessons

| Method | Route | Description |
|---|---|---|
| GET | `/api/lessons?childId=` | List lessons for a child (sorted by weakest domain first) |
| GET | `/api/lessons/[lessonId]` | Get full lesson detail including questions |
| POST | `/api/lessons/[lessonId]/complete` | Submit lesson attempt and record score/XP |

### Children & Progress

| Method | Route | Description |
|---|---|---|
| GET | `/api/children` | List all children for the authenticated parent |
| POST | `/api/children` | Create a new child profile |
| GET | `/api/children/[childId]` | Get child profile with mastery data |
| PATCH | `/api/children/[childId]` | Update child settings |
| GET | `/api/progress/[childId]` | Fetch progress: domain mastery scores + weekly snapshots |
| GET | `/api/child/island` | Get island/lesson layout state for child home screen |

### Billing

| Method | Route | Description |
|---|---|---|
| POST | `/api/stripe/create-checkout` | Create Stripe Checkout session for a plan |
| POST | `/api/stripe/create-portal` | Create Stripe Billing Portal session |
| POST | `/api/stripe/webhook` | Stripe webhook handler — syncs subscription state |

**Webhook events handled:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### Account

| Method | Route | Description |
|---|---|---|
| POST | `/api/account/update-password` | Change parent account password |
| GET | `/api/account/notifications` | Fetch notification preferences |
| POST | `/api/account/notifications` | Update notification preferences |
| POST | `/api/account/export-data` | GDPR data export (returns JSON of all user data) |
| POST | `/api/account/delete` | Initiate account deletion |

### Support

| Method | Route | Description |
|---|---|---|
| GET | `/api/support/tickets` | List parent's support tickets |
| POST | `/api/support/tickets` | Create ticket (triggers AI auto-response) |
| GET | `/api/support/tickets/[ticketId]` | Get ticket + message history |
| PATCH | `/api/support/tickets/[ticketId]` | Update ticket status |
| POST | `/api/support/tickets/[ticketId]/messages` | Add message (AI responds automatically) |

### Admin

| Method | Route | Description |
|---|---|---|
| POST | `/api/admin/login` | Admin login (validates against ADMIN_EMAILS) |
| POST | `/api/admin/logout` | Admin logout |
| GET | `/api/admin/stats` | Platform stats (users, revenue, server info) |
| GET | `/api/admin/questions/queue` | Pending question review submissions |
| POST | `/api/admin/questions/review` | Approve or reject a question submission |
| GET | `/api/admin/support/tickets` | All tickets (admin view) |
| GET | `/api/admin/support/tickets/[ticketId]` | Ticket detail |
| PATCH | `/api/admin/support/tickets/[ticketId]` | Update status/priority |
| POST | `/api/admin/support/tickets/[ticketId]/messages` | Send admin reply |

### Internal / Cron

These endpoints require `Authorization: Bearer <CRON_SECRET>`.

| Method | Route | Description |
|---|---|---|
| POST | `/api/internal/cleanup` | Scheduled cleanup (expired sessions, old events) |
| POST | `/api/internal/weekly-report` | Send weekly summary email to admin |
| POST | `/api/internal/test-email` | Test email delivery |

### Marketing

| Method | Route | Description |
|---|---|---|
| POST | `/api/contact` | Contact form submission (sends email via Resend) |

---

## Adaptive Learning Engine

The adaptive engine lives in `src/lib/adaptive/engine.ts` and selects questions for each practice session by scoring every question in the grade-level pool.

### How question scoring works

Each question receives a composite score:

```
score = (needScore × 1.0)
      + (srScore × 0.6)
      + (difficultyFitScore × 0.5)
      + (domainScore × 0.7)
      + (affinityScore × 0.15)
      - (varietyPenalty × 0.8)
```

**Components:**

| Component | What it measures |
|---|---|
| `needScore` | How much the child needs this standard (0=mastered → 10pts, 1=introduced → 70pts, 2=practicing → 40pts, 0=not_seen → 100pts) |
| `srScore` | How overdue the spaced repetition review is (30 + days_overdue × 23, capped at 100) |
| `difficultyFitScore` | How well the question's difficulty matches the child's mastery level for that standard |
| `domainScore` | Weight of the domain (weak domains get higher weight) |
| `affinityScore` | How much the child enjoys this domain (0–100, 50 = neutral) |
| `varietyPenalty` | Increases for each question already selected from the same standard (prevents repetition) |

**Hard exclusion rules:**
- Question already used in this session
- Domain already accounts for >50% of the session
- More than 3 questions from the same standard already selected
- Difficulty gap >1.5 from ideal (e.g. a child who has never seen a standard won't receive a difficulty-3 question)

**Selection method:** After scoring, the top-8 candidates are sampled using softmax with temperature 0.5 — this provides natural variation instead of always picking the top-ranked question.

### Domain weights

Domain weights are computed from three signals:
1. **Inverted mastery** — weaker domains get higher weight
2. **SR overdue pressure** — each overdue item adds +8 (capped at +40)
3. **Affinity decay** — enjoyment signals decay over time; a domain enjoyed last week counts less today

### Spaced repetition (SM-2)

Implemented in `src/lib/adaptive/spaced-repetition.ts`. Algorithm:
- **Ease factor:** starts at 2.50, range 1.30–3.0+
- **Interval:** starts at 1 day, multiplied by ease factor after each correct review
- **Quality scoring:** 0–5 based on score percentage
- `next_review_at` = `last_reviewed_at + interval_days`

An SR item is "due" if `next_review_at <= now()`. Due items get a boosted score in the engine.

### Topic affinity

Implemented in `src/lib/adaptive/affinity.ts`. The affinity score (0–100) for each domain is updated by:
- Correct answers: +boost
- Wrong answers: -penalty
- Positive emoji reactions: +boost
- Negative emoji reactions: -penalty
- Time-based decay: scores drift toward 50 (neutral) over time using an exponential decay function

### Achievements

Implemented in `src/lib/adaptive/achievements.ts`. Badge types:
- **streak** — consecutive days of practice
- **mastery** — standards or domains fully mastered
- **performance** — high score thresholds (e.g. 100% session)
- **consistency** — regular practice patterns
- **spaced_repetition** — completing SR reviews

---

## Billing & Subscriptions

### Plans

| Plan | Price | Stripe Price Env Var |
|---|---|---|
| Monthly | $9.99/month | `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID` |
| Annual | $79.99/year | `NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID` |
| Lifetime | $149.99 one-time | `NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID` |

### Free trial

On signup, a DB trigger (`003_trial_on_signup.sql`) automatically creates a `subscriptions` row with:
- `plan_type = 'free'`
- `status = 'trialing'`
- `current_period_end = now() + 30 days`

When the trial period ends, the `TrialExpiredModal` component blocks app access and prompts upgrade.

### Stripe webhook

The webhook endpoint at `/api/stripe/webhook` handles subscription lifecycle events and keeps the `subscriptions` table in sync. Configure the webhook in your Stripe dashboard to point to `https://mathkix.com/api/stripe/webhook`.

### Subscription guard

`src/lib/subscription-guard.ts` — checks subscription status server-side. Used in parent layout and API routes to enforce access control.

---

## AI Integration

All Anthropic API calls go through `src/lib/anthropic/client.ts`.

### Placement quiz (Claude claude-sonnet-4-6)

After a child completes the placement quiz, Claude analyzes the question history and outputs:
- Recommended grade level (1–5)
- Domain-level assessment
- Confidence score

Prompt: `src/lib/anthropic/prompts.ts`

### AI teacher (Claude)

When a child requests a hint or gets a question wrong, the AI teacher:
- Explains the concept at grade-appropriate language
- Offers a step-by-step hint without giving away the answer
- Uses emotional awareness (if the child has been frustrated)

Prompts: `src/lib/anthropic/teacher-prompts.ts`
Emotion detection: `src/lib/anthropic/emotion-detection.ts`
Problem-type detection: `src/lib/anthropic/problem-type-detection.ts`

### Support AI (Claude Haiku)

The support ticket system uses Claude Haiku for cost-efficient auto-responses.

Prompt: `src/lib/anthropic/support-prompts.ts`

The system prompt includes strict guardrails:
- Never reveal internal system details or user data
- Never impersonate a human
- Escalate after 3 exchanges or on user request

---

## Analytics

PostHog is used for product analytics. Events flow through a Next.js reverse proxy (`/ingest → us.i.posthog.com`) so ad blockers don't interfere.

### Tracked events

| Event | Where fired | Properties |
|---|---|---|
| `signup_started` | `SignupForm` mount | `method: 'page_load'` |
| `signup_completed` | `SignupForm` on success | `method: 'email'|'google'` |
| `child_added` | `POST /api/children` | `grade`, `child_id` |
| `quiz_started` | `POST /api/quiz/start` | `child_id`, `session_id`, `grade`, `total_questions` |
| `quiz_completed` | `POST /api/quiz/complete` | `child_id`, `session_id`, `scoring_method`, `questions_answered` |
| `first_session_started` | `POST /api/adaptive/session/start` | `child_id`, `session_id`, `question_count`, `grade`, `is_first: true` |
| `first_session_completed` | `POST /api/adaptive/session/complete` | `child_id`, `session_id`, `score_pct`, `xp_earned`, `is_first: true` |
| `session_started` | same route, subsequent sessions | `is_first: false` |
| `session_completed` | same route, subsequent sessions | `is_first: false` |
| `subscription_started` | Stripe webhook `checkout.session.completed` | `plan`, `price`, `currency`, `transaction_id` |
| `subscription_cancelled` | Stripe webhook `customer.subscription.deleted` | `plan`, `subscription_id` |
| `trial_expired_modal_shown` | `TrialExpiredModal` mount | — |

### Key funnels to build in PostHog

**Signup rate:** `signup_started → signup_completed`

**Activation rate:** `signup_completed → child_added → quiz_completed → first_session_completed`

**Conversion rate:** `first_session_completed → subscription_started`

### Implementation files

- `src/lib/posthog/client.ts` — `captureEvent()` for client components
- `src/lib/posthog/server.ts` — `captureServerEvent()` for API routes (posthog-node, one-shot per call)
- `src/components/analytics/PostHogProvider.tsx` — initializes posthog-js, wraps root layout
- `next.config.ts` — `/ingest` and `/ingest/static` rewrites for the reverse proxy

---

## Support Ticket System

### Flow

1. Parent opens `/support/new`, submits subject + description.
2. API creates the ticket and triggers an immediate AI response from Claude Haiku.
3. Parent can continue the chat. Claude responds to each message automatically.
4. After **3 AI exchanges**, the ticket status changes to `awaiting_human` and an email is sent to `ADMIN_NOTIFICATION_EMAIL`.
5. Admin sees the ticket in `/admin/support`, can reply, change status, and set priority.
6. Parent receives an email notification when admin replies.

### Ticket statuses

| Status | Meaning |
|---|---|
| `open` | Active, AI is responding |
| `awaiting_human` | Escalated, waiting for admin |
| `resolved` | Admin marked resolved |
| `closed` | Ticket closed |

---

## Email System

Email is handled by Resend via `src/lib/email/resend.ts`. Templates are in `src/lib/email/templates.ts`.

### Emails sent

| Trigger | Template | Recipients |
|---|---|---|
| New support ticket created | New ticket notification | Admin |
| Ticket escalated to human | Escalation notification | Admin |
| Admin replies to ticket | Admin reply notification | Parent |
| Contact form submitted | Contact form notification | Admin |
| Weekly cron runs | Weekly platform report | Admin |

All emails are sent from `SUPPORT_FROM_EMAIL` (defaults to `support@mathkix.com`).

> If `RESEND_API_KEY` is not set, email calls fail silently — the core app functions normally.

---

## Admin Panel

Access requires:
1. Logging in at `/admin/login` with an email that is listed in the `ADMIN_EMAILS` environment variable (comma-separated).
2. The session is stored as a Supabase auth session with an additional server-side email check on every admin API call.

### Admin capabilities

- **Dashboard:** Total users, active subscriptions, revenue summary, recent support tickets, server info.
- **Support tickets:** View all tickets across all parents. Filter by status/priority. Reply as admin. Change status/priority.
- **Question review:** Review crowdsourced question submissions. Approve or reject with feedback.

---

## Security

### Row Level Security (RLS)

Every table with user data has RLS enabled. The pattern is:
- Parents can only read/write their own `profiles` and `subscriptions` rows.
- Parents can only read/write `children` rows where `children.profile_id = auth.uid()`.
- All child-linked tables (lessons, sessions, mastery, etc.) check via a subquery: `child_id IN (SELECT id FROM children WHERE profile_id = auth.uid())`.
- `diagnostic_questions` and `lessons` are public read (no PII).
- The service role key (used only in server-side API routes) bypasses RLS for admin operations.

### Admin authentication

`src/lib/admin/auth.ts` — validates the session user's email against the `ADMIN_EMAILS` environment variable on every admin API call. Supabase auth tokens are validated server-side before the email check.

### Rate limiting

`src/lib/rate-limit.ts` — applied to AI endpoints and auth endpoints to prevent abuse.

### Input security

`src/lib/security.ts` — input sanitization utilities used in API routes.

### Additional protections

- Stripe webhook signature verification (`stripe.webhooks.constructEvent`)
- CRON_SECRET required for all `/api/internal/*` endpoints
- No user PII is logged or included in AI prompts beyond what is necessary
- Account deletion is implemented with a grace period

---

## Deployment

The app is deployed on **Vercel** at **mathkix.com**.

### Vercel environment variables

Set all variables from the [Environment Variables](#environment-variables) section in your Vercel project settings under **Settings → Environment Variables**. Apply to Production, Preview, and Development as appropriate.

### Stripe webhook

In your Stripe dashboard:
1. Go to **Developers → Webhooks → Add endpoint**.
2. URL: `https://mathkix.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`
4. Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` in Vercel.

### Cron jobs (optional)

To run weekly reports and cleanup automatically, set up Vercel Cron Jobs or an external scheduler (e.g. GitHub Actions) to POST to:
- `POST /api/internal/cleanup` — daily
- `POST /api/internal/weekly-report` — weekly

Include `Authorization: Bearer <CRON_SECRET>` in the request header.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your values
cp .env.example .env.local

# 3. Run the dev server
npm run dev
```

The app runs at `http://localhost:3000`.

### Type checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

### Build check

```bash
npx next build
```

---

## Known TypeScript Fixes

The `src/types/database.ts` file contains several hand-applied fixes that must be preserved when regenerating types from Supabase.

### 1. Empty views type

Supabase generates `Views: Record<string, never>` which creates an index signature conflict. The fix:
```ts
// Instead of:
Views: Record<string, never>
// Use:
Views: { [_ in never]: never }
```
Same fix applies to `Functions`, `Enums`, `CompositeTypes`.

### 2. Nested join relationships

The following FK relationship entries were manually added:
- `quiz_sessions.Relationships` → `quiz_sessions_child_id_fkey` → `children`
- `lesson_attempts.Relationships` → `lesson_attempts_child_id_fkey` → `children`, `lesson_attempts_lesson_id_fkey` → `lessons`

### 3. JSONB fields

JSONB columns (`questions`, `answers`, `options`, `engine_state`, etc.) require an explicit cast when inserting:
```ts
questions: lessonQuestions as unknown as Json
```
