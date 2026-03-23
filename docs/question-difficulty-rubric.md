# MathKix Question Difficulty Rubric

**Version:** 1.0
**Applies to:** All question authors, reviewers, and AI generation prompts
**Scope:** Grades 1–5, all CCSS domains (OA, NBT, NF, MD, G)

---

## Core Principle

Every question belongs to exactly one CCSS standard code (e.g. `3.OA.7`). That code defines a precise scope — the specific skill or concept a child must know at that grade level, as described in the Common Core State Standards.

**Difficulty controls how deeply within a code a question probes. It never controls how far outside the code a question reaches.**

A 3-star (Hard) question is the most demanding valid test of a code. It is not a preview of the next code. A student who answers it correctly has demonstrated complete mastery of that standard — nothing more, nothing less.

---

## Why the ceiling matters

Each CCSS code is written with deliberate boundaries. Those boundaries exist for a reason: they define what is developmentally appropriate and sequentially necessary at each grade. When a hard question exceeds those boundaries, two things break:

1. **Diagnostic accuracy degrades.** A student who answers a `3.OA.7` question that secretly requires `4.NBT.5` skills might answer correctly because they've been exposed to Grade 4 content — not because they've mastered `3.OA.7`. The signal is noise.

2. **The progression breaks.** MathKix advances students through codes in sequence. If mastering `3.OA.7` Hard already requires `4.OA.1` knowledge, the system can't cleanly determine when to move a student forward. The whole adaptive logic depends on each code being a clean, self-contained checkpoint.

---

## The Three Difficulty Levels

### ⭐ Easy — Direct Application

The student applies the skill in its most straightforward, isolated form. The problem is unambiguous, the numbers are accessible, and there is no extra reasoning layer between the student and the operation.

**What it looks like:**
- Single operation, clean numbers
- No multi-step reasoning required
- Context is simple or absent
- One clear path to the answer

**What it is NOT:**
- Trivial (e.g. 1 + 0, or any fact a younger child would know)
- Below the grade band of the code

**Examples:**

| Code | Easy Question |
|---|---|
| `1.OA.1` | "Tom has 3 apples. He gets 2 more. How many does he have?" |
| `3.OA.7` | "What is 3 × 5?" |
| `4.NF.3` | "Write 3/4 as a sum of unit fractions." |
| `5.NBT.6` | "96 ÷ 12 = ?" |

---

### ⭐⭐ Medium — Applied in Context

The student uses the skill within a word problem, a multi-part setup, or a context that requires them to identify which operation or strategy to use. There is a reasoning layer — the skill is not handed to them on a plate.

**What it looks like:**
- Word problems where the student must interpret the situation
- Two-step problems where both steps are within the code's scope
- Problems with larger or less friendly numbers (still within code limits)
- Comparison, estimation, or explanation tasks

**What it is NOT:**
- Multi-step problems where one step requires a different code
- Problems requiring knowledge not yet introduced at this grade

**Examples:**

| Code | Medium Question |
|---|---|
| `1.OA.1` | "There were 12 children at the park. 5 went home. How many are still there?" |
| `3.OA.7` | "What is 8 × 6?" (less familiar fact, requires strategy) |
| `4.NF.3` | "3/10 + 4/10 + 2/10 = ?" |
| `5.NBT.6` | "1,260 ÷ 42 = ?" |

---

### ⭐⭐⭐ Hard — Complete Mastery

The student demonstrates full, fluent command of the code at its most demanding valid level. The problem is complex, multi-layered, or requires strategic thinking — but every element of the problem is still within the code's defined scope. A student who answers correctly has proven they own this standard completely.

**What it looks like:**
- The most complex real-world application the code permits
- Problems that require deep understanding, not just procedure recall
- Multi-step problems where all steps are within the code
- Requires the student to explain, justify, or transfer the concept
- May use the upper bound of the code's number range or complexity

**What it is NOT:**
- Content from the next code or next grade (even one step beyond the code boundary is a violation)
- A trick question or an ambiguous problem
- A problem that requires a tool or concept not introduced at this grade

**Examples:**

| Code | Hard Question |
|---|---|
| `1.OA.1` | "Lily read 8 pages Monday and some pages Tuesday. She read 17 total. How many Tuesday?" (unknown addend, within 20) |
| `3.OA.7` | "Solve: 8×9, 7×7, 6×8, 81÷9, 56÷7 — from memory, no paper." (fluency under pressure, still within 100) |
| `4.NF.3` | "5 1/8 − 2 5/8 = ?" (regrouping mixed numbers, like denominators — still within 4.NF.3 scope) |
| `5.NBT.6` | "8,432 ÷ 34 = ?" (4-digit dividend, 2-digit divisor — exactly at the code's stated ceiling) |

---

## The Boundary Rule

When authoring or reviewing a Hard question, ask:

> "Does answering this question correctly prove the student has mastered **this specific code** — and only this code?"

If the answer requires knowledge from a different code, rewrite the question. Difficulty comes from **depth**, not **breadth**.

| Allowed at Hard | Not Allowed at Hard |
|---|---|
| Larger numbers within the code's stated range | Numbers beyond the code's stated range |
| More complex real-world context | Concepts introduced in a later code or grade |
| Multi-step where every step is within the code | A step that requires a skill from another standard |
| Explanation or justification of the concept | Open-ended tasks with no clear correct answer |
| Time pressure or fluency test (where code requires fluency) | Trick questions or intentional ambiguity |

---

## Checking Against the Standard

Every code in MathKix has a full CCSS explanation stored in the grade JSON files (`src/data/questions/gradeN.json`). Before finalising a Hard question, check that explanation. The explanation defines the ceiling. If the question goes beyond what the explanation describes, it belongs to a different code.

**Example check for `3.NF.1`:**

> *"Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts... denominators limited to 2, 3, 4, 6, and 8."*

A Hard `3.NF.1` question must use denominators from that set only. A question using denominator 7 or 12 violates the code boundary and must be reassigned or rewritten.

---

## US Context Requirement

All questions — regardless of difficulty — must be grounded in contexts familiar to US children. This means:

- **Units:** dollars and cents, miles, feet and inches, pounds and ounces, Fahrenheit — not metric-first
- **Names:** common US names (not region-specific or unfamiliar)
- **Settings:** American school, home, sports (baseball, basketball, football), grocery stores, national parks, state fairs
- **Currency:** USD ($) only
- **Holidays and culture:** US-relevant references (Thanksgiving, Fourth of July, school year structure)

Metric units may appear where the CCSS code explicitly requires them (e.g. `3.MD.2` uses grams, kilograms, liters). In those cases, metric is required by the standard and must be included — but the context should still be US-grounded.

---

## Summary Table

| | ⭐ Easy | ⭐⭐ Medium | ⭐⭐⭐ Hard |
|---|---|---|---|
| **Core test** | Can they do the basic operation? | Can they apply it in context? | Do they fully own this standard? |
| **Steps** | 1 | 1–2 (all within code) | 2–3 (all within code) |
| **Context** | Simple or none | Word problem / real-world | Complex real-world, justification |
| **Numbers** | Accessible | Mid-range for the code | Upper bound of the code's stated range |
| **Goes outside code?** | Never | Never | Never |
| **On mastery signal** | Partially understands | Developing confidence | Complete mastery confirmed |

---

*This document is the single source of truth for question difficulty at MathKix. Any question that violates the boundary rule must be flagged and rewritten before it enters the question pool.*
