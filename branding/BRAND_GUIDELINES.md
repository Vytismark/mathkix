# MathKix Brand Guidelines
**Version 1.0 — March 2026**

---

## 0. Brand Foundation

### Who MathKix Is

MathKix is ambitious, innovative, and loves a challenge — but refuses to make that feel like pressure. Think of MathKix as the coach who believes every kid has untapped potential, and builds a program specifically around unlocking it. Not a cheerleader. Not a drill sergeant. A coach.

### The Two Audiences

MathKix serves two distinct people simultaneously, and the brand speaks to each differently:

| | **Parents** | **Children** |
|---|---|---|
| **Goal** | Confidence that this is the right investment | Feeling capable and motivated to come back |
| **Tone** | Sharp, premium, evidence-based | Direct, energising, earned praise |
| **Feels like** | Revolut, Linear, Stripe | A great sports coach, not a classroom |
| **Fear to avoid** | "Is this just another edtech gimmick?" | "I'm not smart enough for this" |

### Brand Values (in order)

1. **Ambition** — We believe kids are more capable than most software gives them credit for.
2. **Honesty** — We don't fake progress. Results are real, feedback is direct.
3. **Quality** — Every detail is intentional. Premium feel, no bloat.
4. **Calm confidence** — We don't shout. We don't guilt. We simply raise the bar.

---

## 1. Colors

### 1.1 Primary Palette

These are the two brand colors extracted directly from the MathKix logo mark. They are non-negotiable.

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--brand-blue` | Brand Blue | `#3678FF` | Primary actions, links, highlights, key UI elements |
| `--brand-gold` | Brand Gold | `#FFAB02` | Achievements, streaks, progress, rewards, secondary CTAs |

**Gradients (from the logo):**

```
Blue gradient:   #3678FF → #B0CDFF  (top to bottom or left to right)
Gold gradient:   #FFAB02 → #FFD892  (bottom to top or left to right)
```

Use gradients for the icon, achievement badges, and select hero moments — not for body text or UI chrome.

---

### 1.2 Neutral Palette

MathKix uses a **dark-first** neutral system. The deep navy `#000714` is the brand's darkest anchor.

| Token | Hex | Usage |
|---|---|---|
| `--navy` | `#000714` | Logo text color. Deepest backgrounds. |
| `--surface-0` | `#07080F` | App root background |
| `--surface-1` | `#0E0F16` | Card backgrounds, modals |
| `--surface-2` | `#14151F` | Hover states, secondary cards |
| `--border` | `rgba(255,255,255,0.07)` | Dividers, card outlines |
| `--text-primary` | `#FFFFFF` | Primary text on dark surfaces |
| `--text-secondary` | `#94A3B8` | Supporting text, labels |
| `--text-muted` | `#64748B` | Placeholder text, disabled states |

---

### 1.3 Semantic Colors

These communicate system state. Keep them consistent — never use brand blue/gold for errors or warnings.

| State | Hex | Usage |
|---|---|---|
| Success | `#22C55E` | Correct answers, completed milestones |
| Error | `#EF4444` | Wrong answers, failed validation |
| Warning | `#F59E0B` | Low streaks, subscription expiry |
| Info | `#3678FF` | Informational callouts (uses Brand Blue) |

---

### 1.4 Color Rules

- **Never** use the old red `#E74C3C` — it has been fully retired.
- **Never** use brand gold as a background color for text — contrast is insufficient at small sizes.
- **Minimum contrast ratio**: 4.5:1 for body text, 3:1 for large text (WCAG AA).
- **Dark backgrounds are the default** across the full app. Light mode is only used for the official logo on light surfaces (logo light variant).
- Brand Blue is the **only** color allowed on primary CTA buttons. Gold is reserved for achievement/reward contexts only.

---

## 2. Typography

### 2.1 Typefaces

**UI Font: Geist**
Used everywhere in the product. Geist is geometric, modern, and highly legible at all sizes. It's already embedded via `next/font/google`.

```css
font-family: 'Geist', system-ui, -apple-system, sans-serif;
```

**Monospace: Geist Mono**
Used for scores, timers, answer inputs, and any numeric display that benefits from fixed-width characters.

```css
font-family: 'Geist Mono', 'Courier New', monospace;
```

**Logo typeface**
The wordmark uses a custom rounded geometric sans-serif from the brand designer. Never attempt to recreate the logo using Geist — always use the provided SVG assets.

---

### 2.2 Type Scale

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| **Hero** | 56–72px | 800 | 1.05 | Landing hero headline only |
| **H1** | 36px | 700 | 1.1 | Page titles |
| **H2** | 28px | 700 | 1.15 | Section headers |
| **H3** | 20px | 600 | 1.2 | Card titles, sub-sections |
| **Body Large** | 18px | 400 | 1.6 | Introductory paragraphs |
| **Body** | 16px | 400 | 1.6 | Default body copy |
| **Body Small** | 14px | 400 | 1.5 | Labels, captions, nav items |
| **Micro** | 12px | 500 | 1.4 | Badges, tags, timestamps |

---

### 2.3 Typography Rules

- **Letter spacing**: Hero and H1 headings should use `tracking-tight` (−0.02em). Body copy uses default tracking.
- **Weight contrast**: Headlines are always 700 or 800. Never bold body copy for general emphasis — use color or size instead.
- **All caps**: Allowed only for badges, micro labels, and section dividers. Never for body text or CTAs.
- **Numeric displays** (scores, timers, streak counts): Always use Geist Mono to prevent layout shift as numbers change.
- **Max line length**: 65–75 characters for body text. Never let a paragraph stretch full-width on desktop.

---

## 3. Logo

### 3.1 Logo Assets

| File | Use case |
|---|---|
| `public/mathkix-logo.svg` | All dark backgrounds — nav, app screens, dark hero sections |
| `public/mathkix-logo-light.svg` | Light backgrounds only — print, email, white cards |
| `public/mathkix-icon.svg` | Icon-only contexts — app icon, avatar, social profile picture |
| `public/icon.svg` | Favicon (32×32, navy background) |

---

### 3.2 The Mark

The MathKix icon is a two-part geometric shield:

- **Blue chevron** (top) — represents direction, ambition, upward movement
- **Gold semicircle** (bottom) — represents foundation, achievement, warmth

Together they form a compact badge that works at any size from 16px to billboard.

---

### 3.3 Clear Space

The minimum clear space around the logo (both icon-only and full wordmark) is equal to the **height of the gold semicircle** in the mark — approximately 40% of the total icon height.

```
         ↑ clear space
← cs  [  LOGO  ]  cs →
         ↓ clear space
```

Never crowd the logo with other elements, text, or imagery within this zone.

---

### 3.4 Minimum Sizes

| Variant | Minimum size |
|---|---|
| Full wordmark (with text) | 120px wide / 24px tall |
| Icon only | 24×24px |
| Favicon | 16×16px (always use the `.ico` or `icon.svg`) |

Below these thresholds the mark becomes unreadable. Use icon-only below 40px tall.

---

### 3.5 Logo Do's and Don'ts

**Do:**
- Use the dark logo (white text) on all dark/navy surfaces
- Use the light logo (navy text) on white or very light surfaces
- Maintain the icon's aspect ratio — never stretch
- Give the logo its required clear space

**Don't:**
- ❌ Recreate the wordmark using Geist or any other font
- ❌ Use the logo on medium-grey backgrounds where neither version provides sufficient contrast
- ❌ Add drop shadows, glows, or effects to the logo
- ❌ Change any gradient color in the icon — the blue and gold are locked
- ❌ Place the icon without its gold semicircle — the two parts are inseparable
- ❌ Use the old red `#E74C3C` color anywhere near the logo

---

## 4. Tone & Voice

### 4.1 The Brand Voice

MathKix communicates like a **world-class coach** — direct, motivating, and respectful of the person's intelligence. It never condescends. It never guilt-trips. It never performs enthusiasm it doesn't mean.

**Three words: Sharp. Warm. Ambitious.**

---

### 4.2 Parent-Facing Voice

Parents are busy, skeptical, and have seen too many "AI-powered" products that overpromise. MathKix earns trust through **precision and restraint**, not hype.

**Principles:**
- Lead with what it does, not how "amazing" it is
- Use data and specificity over adjectives
- Assume intelligence — never over-explain
- Confident without arrogance

**Examples:**

| ❌ Don't write | ✓ Write instead |
|---|---|
| "Amazing AI-powered learning!" | "Adapts to your child's level in real time." |
| "Your child will LOVE this!" | "Built for kids who are ready to be challenged." |
| "Sign up today — don't miss out!" | "Start with a free 3-minute assessment." |
| "We're so excited to help your family!" | "Personalised math practice for grades K–5." |
| "Our cutting-edge technology..." | "Each session adapts based on what your child got wrong." |

---

### 4.3 Child-Facing Voice

Children inside the app see a different register — warmer, more direct, and coach-like. The goal is to make hard feel possible, not to make easy feel impressive.

**Principles:**
- Praise is **specific and earned** — never generic
- Difficulty is framed as opportunity, not threat
- Short sentences. Active voice. Present tense.
- Never condescend. Kids know when they're being talked down to.
- No forced humour, no emoji spam

**Examples:**

| ❌ Don't write | ✓ Write instead |
|---|---|
| "Woohoo! Amazing job, superstar! 🎉🌟🎊" | "3 in a row. Keep it going." |
| "Oops! That wasn't quite right, but that's okay!" | "Not quite. Try again." |
| "You're doing SO well!!!" | "Level 4 unlocked." |
| "Let's try a fun math challenge!" | "Next question. Ready?" |
| "Don't worry if this is hard!" | "This one's tough. Take your time." |

---

### 4.4 The Anti-Duolingo Principles

MathKix is specifically not:

- **Guilt-driven** — No streak shame. No "You're losing your streak!" panic mechanics.
- **Infantilising** — No baby talk, no "Wow great job!" for answering 2+2.
- **Hollow** — No generic encouragement. Praise only when it's been earned.
- **Loud** — Minimal exclamation marks. Enthusiasm is shown through product quality, not punctuation.

---

### 4.5 Error Messages

Errors should be clear, human, and never make the user feel stupid.

| Situation | ✓ Example |
|---|---|
| Wrong answer | "Not this time. Try again." |
| Form validation | "Enter a valid email address." |
| Network error | "Something went wrong. Try again." |
| Payment failed | "Your payment didn't go through. Check your card details." |
| Session expired | "You've been logged out. Sign in again." |

---

### 4.6 Button Labels

Buttons use **action verbs**. Never use vague labels like "Click here" or "Submit."

| ✓ Use | ❌ Avoid |
|---|---|
| Start assessment | Click here |
| Continue | Submit |
| Try again | OK |
| Get started | Proceed |
| Save changes | Update |
| Add child | New |

---

## 5. Imagery & Iconography

### 5.1 Illustration Style

MathKix uses a **clean geometric** illustration approach, with selective use of warmth through color rather than character style. Think: precision-first, with the brand gold used to bring energy.

**Characteristics:**
- Geometric shapes as base forms — not organic or hand-drawn
- Brand blue and gold as primary illustration colors
- High contrast against dark backgrounds
- Minimal detail — readable at small sizes
- No realistic shading or drop shadows in illustrations
- Occasional use of soft glows using brand blue at low opacity to suggest depth

**Reference feel**: Somewhere between Linear's precision and Stripe's warmth — geometric-first, but not cold.

---

### 5.2 What to Avoid in Imagery

- ❌ Generic stock photography of kids at computers
- ❌ Cartoon characters or mascots (incompatible with the premium positioning)
- ❌ Clipart-style flat illustrations
- ❌ Anything that looks like a classroom or a worksheet
- ❌ Neon/rainbow color palettes — always stay within the brand palette

---

### 5.3 Icons

All icons in the product use **Lucide React** (already implemented). Usage rules:

- **Size**: 16px (`w-4 h-4`) for inline/nav, 20px (`w-5 h-5`) for actions, 24px (`w-6 h-6`) for featured
- **Stroke width**: Default (1.5) — never increase to 2+ as it conflicts with the brand's precise feel
- **Color**: Icons inherit text color. Never use brand gold or brand blue for decorative icons — reserve those for semantic meaning (achievement = gold, primary action = blue)
- **Never** use filled/solid icon variants — the outlined Lucide style is consistent with the brand

---

### 5.4 Achievement & Progress Visuals

Achievement moments (completing a level, hitting a streak, earning a badge) are the **one context** where MathKix allows more visual expression:

- Brand gold gradient is the primary color for achievement states
- Subtle animation is allowed (scale, fade — not bounce or spin)
- Keep copy direct even in celebration: "Level 5. Unlocked." not "WOW YOU'RE AMAZING!!!"

---

## 6. Quick Reference Card

```
COLORS
Primary Blue ......... #3678FF
Brand Gold ........... #FFAB02
Deep Navy ............ #000714
App Background ....... #07080F

TYPOGRAPHY
Font ................. Geist (UI), Geist Mono (numbers)
Hero ................. 56–72px / 800
H1 ................... 36px / 700
Body ................. 16px / 400

LOGO FILES
Dark backgrounds ..... mathkix-logo.svg
Light backgrounds .... mathkix-logo-light.svg
Icon only ............ mathkix-icon.svg

VOICE (PARENT)   Sharp · Precise · Premium · No hype
VOICE (CHILD)    Coach · Direct · Earned praise · No guilt

NEVER
❌ Red #E74C3C (retired)
❌ Generic praise ("Amazing!!!")
❌ Stretch or recolor the logo
❌ Forced humour or emoji spam
```

---

*MathKix Brand Guidelines v1.0 — March 2026*
*Update this document before shipping any significant new visual pattern.*
