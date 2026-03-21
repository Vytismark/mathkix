# MathKix - Strategic Plan
_Updated: March 2026_

---

## Current State Snapshot

**What's working:**
- App is live at mathkix.com, deployed on Vercel
- Supabase, Stripe, Anthropic, Resend - all wired up and active
- Full adaptive learning engine (SM-2 spaced repetition, topic affinity, domain weights)
- Parent dashboard, child learning UI, placement quiz, AI tutor, support system
- 1,890 seeded questions across Grades 1-5, all CCSSM domains
- QA tester currently validating the full conversion funnel

**What's missing:**
- Real users (zero organic traffic yet)
- Real testimonials (current ones are placeholder copy)
- Email onboarding sequence (no drip after signup, no day-7/day-30 nudges)
- SEO content (landing page exists but no blog/content layer)

**Recently completed:**
- PostHog analytics - 8 core funnel events live (signup, activation, session, subscription)
- Reverse proxy (`/ingest`) so ad blockers don't interfere with event collection

---

## Immediate Priority: Validate QA Findings (This Week)

Before any growth work, the funnel must be airtight. Wait for QA tester results, then fix all reported issues in priority order:

**Critical funnel paths to verify:**
1. Signup → 30-day trial creation → dashboard loads correctly
2. Add child → placement quiz → grade assigned → child home loads
3. Child completes an adaptive session → XP awarded → parent dashboard reflects it
4. Stripe checkout → subscription active → billing page reflects plan
5. Stripe cancel → subscription status degrades correctly
6. Support ticket → AI auto-response fires within 5 seconds
7. Admin login → ticket visible → admin reply → parent receives email notification
8. Password reset full flow

**Zero-tolerance bugs:** anything in paths 1–4 kills conversion. Fix before any marketing.

---

## Phase 1 - Foundation (Weeks 1-2, post-QA)

### 1.2 Email Drip Sequence

You have Resend already configured. Add lifecycle emails:

| Trigger | Email | Goal |
|---|---|---|
| Day 0 (signup) | Welcome + "start the quiz" CTA | Drive first activation |
| Day 1 (no quiz taken) | "Your child is waiting" reminder | Push to quiz completion |
| Day 3 (quiz done, no session) | "First lesson ready" prompt | Push to first session |
| Day 7 | Weekly progress summary (if data exists) | Habit formation |
| Day 25 (trial, not paid) | "Your trial ends in 5 days" | Convert before expiry |
| Day 28 (trial, not paid) | "Last 2 days" + lifetime offer | Urgency conversion |
| Day 30 (trial expired, not paid) | "Come back" with savings offer | Win-back |

Implement as a cron job (`/api/internal/lifecycle-emails`) that runs daily, checks `subscriptions` + `children` + `practice_sessions` to determine what to send each user.

### 1.3 Replace Placeholder Testimonials

The three testimonials on the landing page (Rachel T., James K., Priya M.) are generic placeholder copy. Once you have 5-10 real users through QA or beta, get real quotes. Real specifics ("my son was in 3rd grade and behind in fractions") convert at 3-5x higher rates than polished generic praise.

**Short-term fix:** Add "Early Access" or "Beta" label to testimonials if they're not yet from real users, or remove the names/make them more explicitly illustrative.

### 1.4 Pricing CTA Fix

Every pricing card CTA goes to `/signup` with no plan pre-selection. This means a user who clicks "Start Annual" lands on a generic signup page with no indication of which plan they chose.

**Fix:** Pass plan intent through the URL: `/signup?plan=annual`. On the signup page, read this param and store it in localStorage. After signup, auto-redirect to Stripe Checkout for that plan, or at minimum show the selected plan in the billing page.

This is a 20-minute code change with a meaningful conversion impact.

---

## Phase 2 - First 100 Users (Weeks 2-6)

### 2.1 Targeted Parent Communities (Zero cost)

The highest-ROI early-user channel for an edtech app is direct outreach in parent communities. This is manual but converts well because you're solving a real, felt pain.

**Where to post (with what angle):**
- **r/homeschool, r/Parenting, r/elementary** - "I built a free AI math app for K-5, looking for beta testers"
- **Facebook groups** - "Homeschool Parents", "Elementary School Math Help", grade-specific groups
- **Twitter/X** - tag edtech accounts, post a short video of the placement quiz working
- **Product Hunt** - launch when you have 10 real testimonials; prep a maker comment thread

**What to say:** Lead with the pain, not the product. "Does your kid get math homework that's too easy or too hard and just gives up? That's what I built this to fix." Offer the 30-day free trial explicitly.

### 2.2 School/Tutor Outreach

Teachers and tutors are multipliers. One teacher who recommends it = 20-30 families.

- Email 10-20 local elementary school math teachers: offer a free parent account + walk them through the progress dashboard
- Contact 5-10 private math tutors: offer a free professional account in exchange for referring clients
- Create a simple "For Educators" landing page or section explaining how the parent dashboard maps to CCSSM (you already have this data - it's your CurriculumView)

### 2.3 SEO Content Layer

The landing page is good but it only ranks for branded terms. You need long-tail search traffic from parents actively searching for help.

**Target queries (high intent, low competition):**
- "math practice for 3rd graders" / "grade 3 math worksheets online"
- "my child is struggling with fractions grade 4"
- "common core math grade 2 practice"
- "adaptive math app for kids"
- "best math app 2nd grader"

**Content plan:**
- Create `/blog` or `/guides` section
- Write 1 article per week: "Grade 3 Fractions: What Common Core Expects (and How to Practice)"
- Each article links to the landing page CTA
- Use the CCSSM standard data you already have to generate unique, authoritative content

**Implementation:** Add a `/blog` route with static MDX files. Very low overhead with Next.js App Router.

### 2.4 Referral Loop

Add a "Refer a friend" feature to the parent dashboard. Since your product is a subscription, a simple referral credit (e.g. "give a friend 1 free month, you get 1 free month when they subscribe") has excellent ROI.

**Minimum implementation:**
- Add a `referral_code` column to `profiles`
- Accept `?ref=CODE` on signup, store the referrer
- When referree converts to paid: grant both accounts a 30-day credit (extend `current_period_end`)
- Show a "Share MathKix" card in the parent dashboard with their referral link

---

## Phase 3 - Retention and LTV (Weeks 4-8)

Acquiring users is only valuable if they stay. EdTech churn is notoriously high. These features directly attack churn.

### 3.1 Weekly Progress Email

This is your single highest-retention feature. Parents who see their child's progress reported weekly:
- Feel the product is working
- Are reminded to keep the habit going
- Are much less likely to cancel

You already have the `/api/internal/weekly-report` cron endpoint. Extend it to send per-user summary emails showing:
- Sessions completed this week
- Standards newly mastered
- Current streak
- Domain with most improvement
- Suggested focus for next week (weakest domain)

Format: plain-text style email with one screenshot-style data table. HTML-heavy emails go to spam.

### 3.2 Streak Repair

When a child misses a day and loses their streak, it's one of the top reasons kids stop using the app. Add a "streak shield" system:

- First missed day: streak is preserved with a "shield" (one per week)
- Parent receives a gentle "your child's streak is at risk" email
- Child sees a "use your shield?" prompt next time they open the app

This is a small DB change (add `streak_shields` to `children`, a boolean or count) + minor UI work in the child home screen.

### 3.3 Parent Goal Alignment

At signup, parents select a `parent_goal` (you already have this field on `children`). Use it:
- Tailor the dashboard messaging ("Sofia is on track to close her fractions gap before end of year")
- In weekly emails, reference their stated goal
- When a goal milestone is hit, send a celebratory email

Parents who feel the product understands their specific goal churn at much lower rates.

### 3.4 Progress Milestones (Parent-facing)

Add notification triggers for:
- First standard mastered
- First domain completed
- 7-day streak reached
- Grade level assessed as improved

These milestones should trigger both an in-app notification and an email. They give parents concrete evidence the product is working, which directly improves retention and word-of-mouth.

---

## Phase 4 - Monetization Optimization (Week 6+)

### 4.1 Trial-to-Paid Conversion

**Target:** 15-25% trial-to-paid conversion is good for edtech. Below 10% means the product isn't delivering enough value before day 30.

Levers:
- **Activation speed:** Does the child complete their first session within 24 hours of signup? If not, the day-1 email and onboarding flow needs work.
- **Value milestone timing:** Make sure the first "wow" moment (placement quiz result, first mastered standard) happens within the first session.
- **Trial expiry UX:** The `TrialExpiredModal` should be empathetic, not punishing. Show their child's progress ("Sofia has mastered 3 standards") to anchor the value before asking for payment.

### 4.2 Annual Plan Anchoring

Currently the annual plan is marked "BEST VALUE" - good. But the pricing CTAs don't do enough to push users toward annual.

**Improvement:** On the trial expiry modal, default-select the annual plan and show the monthly equivalent ($6.66/mo). Only show all three options on click of "see all plans." Defaulting to annual in high-intent moments meaningfully increases LTV.

### 4.3 Lifetime Plan Positioning

Lifetime at $149.99 is a high-intent purchase. Position it as the "for homeschoolers" or "for 2+ kids" option - families who know they'll use this for 3-5 years. Add this framing to the pricing page and the trial expiry modal.

---

## Phase 5 - Scale (Month 3+)

Only pursue these after Phase 1-2 are generating steady signups and you have analytics to guide decisions.

### 5.1 Paid Acquisition

- **Facebook/Instagram ads:** Target parents of 6-11 year olds. Best-performing angle historically: video of a child successfully solving a problem, with parent reaction. Show the dashboard.
- **Google Search ads:** Bid on "math app for kids," "grade 3 math practice," "common core math help." High intent, relatively low competition vs. Duolingo-tier incumbents.
- **Pinterest:** Surprisingly effective for edtech targeting moms. Create pin graphics showing grade-level standard coverage.

**Budget approach:** Start with $20/day on Facebook for 2 weeks. Track signup cost. If cost-per-trial < $15, scale up. If not, iterate the creative before spending more.

### 5.2 School District Licensing

Once you have 50+ happy individual users, approach school districts with a bulk licensing proposal:
- Per-student pricing ($3-5/student/year for district volume)
- Teacher dashboard (read-only view of whole-class mastery - this is a new feature)
- SSO/Clever integration (required for most US districts)
- COPPA/FERPA compliance documentation

This is a longer sales cycle (6-18 months) but deals can be $10k-$100k+.

### 5.3 Homeschool Co-op Partnerships

Homeschool co-ops are tight-knit communities with high trust. A single co-op organizer who endorses MathKix can bring in 20-50 families at once.

Offer: co-op discount code (20% off) in exchange for a mention in their newsletter/group. Low cost, high conversion because it's peer-recommended.

---

## Product Roadmap

Prioritized by impact-to-effort ratio, for features not yet built:

### High Impact / Low Effort
- [ ] Analytics event tracking (PostHog/Mixpanel integration)
- [ ] Lifecycle email drip sequence (7 emails, cron-based)
- [ ] Plan pre-selection in signup URL (`?plan=annual`)
- [ ] Streak shield system (1 DB column, minor UI)
- [ ] Weekly progress email per parent

### High Impact / Medium Effort
- [ ] Referral system (referral codes, credit logic)
- [ ] Progress milestone notifications (email + in-app)
- [ ] Blog/SEO content section (`/blog` with MDX)
- [ ] Trial expiry modal: default annual, show child's progress

### Medium Impact / Medium Effort
- [ ] "For Educators" landing page
- [ ] Mobile app (PWA manifest + install prompt - no app store needed, 1-2 days)
- [ ] Printable progress report (PDF via API) for parents to share with teachers
- [ ] Grade-up celebration (when a child's assessed grade improves)

### Low Impact (or long-term) / High Effort
- [ ] Teacher/classroom dashboard (for district sales)
- [ ] Clever SSO integration
- [ ] iOS/Android native app
- [ ] Multi-language support

---

## Key Metrics to Track (Dashboard)

Build a simple internal metrics view at `/admin` showing these weekly:

| Metric | Target (Month 3) |
|---|---|
| Weekly new signups | 50+ |
| Activation rate (completed first session) | >60% |
| Day-7 retention (logged in again) | >40% |
| Trial-to-paid conversion | >15% |
| Monthly churn (paid → cancelled) | <5% |
| Average sessions per active child per week | >3 |

---

## Biggest Risk

**The product works. Will parents find it?**

The technology, adaptive engine, and UX are genuinely well-built. The risk is not product quality - it is distribution. Every action in Phase 1-2 should prioritize getting real users into the funnel as fast as possible, because:

1. Real user data will reveal what to fix in the product faster than any internal review.
2. Real testimonials (replacing the current placeholders) will improve conversion immediately.
3. Early retention metrics will tell you whether the streak/XP system is actually keeping kids engaged day-over-day.

Start manually. Post in parent groups this week. Get 20 real users before spending a dollar on ads.
