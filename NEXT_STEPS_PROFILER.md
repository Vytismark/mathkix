# Next Steps — After Learning Profiler Implementation

This document lists what YOU need to create, design, or configure to fully leverage the profiler. The algorithm and data infrastructure are in place — these are the content, design, and experimentation tasks that require human judgment.

---

## Content to Author

### Misconception Remediation Lessons
The profiler detects ~20 misconceptions (see `src/data/misconceptions.ts`). Each needs a targeted mini-lesson:
- `MULT_AS_ADD` — Visual lesson showing groups vs. addition
- `FRAC_BIGGER_DENOM_BIGGER` — Fraction bar comparison lesson
- `AREA_PERIMETER_SWAP` — Grid paper visual showing inside vs edge
- `OFF_BY_ONE` — Number line counting lesson
- (See full list in `src/data/misconceptions.ts`)

**Format**: Same as existing lesson content (`LessonContent` type). Create in `src/data/lessons/remediation/`.

### Audio Narrations
For younger kids and weaker readers (profiler tracks `explanationDepth` and `wordProblemProficiency`):
- Record or generate audio for each instruction step
- Add `audioUrl` field to `InstructionStep` type
- Priority: Grade 3 lessons first

### Story Theme Variants
The profiler can track which story themes get better engagement. Author story modality lessons with tagged themes:
- Animals, sports, space, cooking, games, nature, building
- Tag each story lesson with `theme: string` so the profiler can learn preferences

### Worked Example Fading Sets
The profiler tracks `workedExampleFadingStage` (full → partial → independent). Need:
- **Full examples**: All steps shown (already have these)
- **Partial examples**: Some steps blank for child to fill in (new content type)
- **Independent**: Just the problem, no scaffolding (practice-only)

---

## Design to Create

### Interface Density Variants
The profiler infers `workingMemoryCapacity`. Low capacity kids need:
- **Clean mode**: One element at a time, large text, minimal distractions
- **Standard mode**: Current design
- **Rich mode**: Number line, multiplication table, scratch pad always visible

### Color Coding System
For place value, operations, and fractions:
- Ones = blue, tens = green, hundreds = red (place value)
- Addition = green, subtraction = red, multiplication = blue, division = orange
- Apply to relevant instruction steps and practice questions

### Persistent Reference Tools
Based on `selfCorrectionAbility` and `hintResponsiveness`:
- **Scratch pad overlay** — digital drawing space
- **Multiplication table** — toggleable reference (auto-shown for kids who need it)
- **Number line** — always-on for kids in CRA "concrete" stage

### Tutor Persona Variants
Based on `mathAnxietyLevel` and grade:
- **Encouraging coach** (high anxiety) — "You're doing amazing!", extra celebration
- **Neutral guide** (low anxiety, older) — matter-of-fact, concise
- **Peer buddy** (young, moderate anxiety) — casual, emoji-heavy

Implement by adjusting the AI teacher system prompt based on profile dimensions.

### Progress Visualization Variants
Based on `motivationOrientation`:
- **Journey map** (extrinsic) — visual path with milestones and rewards
- **Mastery tree** (intrinsic) — branching skill tree showing depth
- **Simple bar** (minimal) — for kids distracted by gamification

### Gamification Wrapper Options
Based on `motivationOrientation`:
- **Quest narrative** (extrinsic) — storyline, characters, missions
- **Clean math** (intrinsic) — minimal wrapper, focus on the math
- **Light badges** (mixed) — achievements without heavy narrative

---

## A/B Experiments to Run

After the profiler has baseline data (~100+ sessions across multiple children):

### Problem-First vs Lesson-First
- Track `problemFirstVsLessonFirst` dimension
- Alternate session ordering and compare performance
- Goal: validate the profiler's inference matches actual performance

### Immediate vs Delayed Feedback
- Track `feedbackGranularity` dimension
- Test: show answer immediately vs batch feedback at end of segment
- Measure: error correction rate, engagement, anxiety signals

### Interleaved vs Blocked Practice
- Track `interleavingPreference` dimension
- Test: 3+ domain sessions vs single-domain focused sessions
- Measure: retention (SR review scores), engagement

### Socratic vs Direct Correction
- Test: AI teacher asks "What do you think went wrong?" vs "The answer is X because..."
- Measure: self-correction rate, hint dependency, time-to-correct

---

## Data Analysis Tasks

### After 50+ Sessions
- Review misconception detection accuracy (false positive rate)
- Check if profiler dimensions stabilize (confidence should plateau)
- Verify processing speed norms by grade match real data

### After 200+ Sessions
- Tune confidence thresholds (currently `CONFIDENCE_THRESHOLD = 0.3`)
- Validate math anxiety detection against parent questionnaires
- Analyze which profile dimensions actually predict performance

### After 500+ Sessions
- Train simple ML models to replace heuristic inferrers where possible
- Identify new misconception patterns from wrong answer clustering
- Validate spaced repetition scheduling against actual forgetting curves

---

## Technical Follow-ups

### Per-Question Timestamps (Step 7)
Add exact `startMs`/`endMs` per question in the session page. Currently the profiler uses approximated timestamps. This unlocks:
- Precise fatigue detection
- Per-question processing speed
- Math anxiety detection from post-error pauses

### Question Classification Tags
Add `category`, `abstractionLevel`, `stepsRequired` to all lesson content questions. Currently the profiler skips dimensions that need these tags when they're missing. Priority: back-fill Grade 3 OA content first.

### Parent Dashboard — Profile View
Show the learning profile to parents in a digestible format:
- "Your child learns best with visual examples"
- "We've noticed they process slowly but carefully — that's great!"
- "They tend to make careless errors when going fast"
- Never show raw dimension names or anxiety labels

### Profile Export for Tutors
If MathKix adds human tutor integration, export the profile as a teacher-friendly summary for 1:1 sessions.
