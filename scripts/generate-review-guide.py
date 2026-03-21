"""
Generates the MathKix Question Review Guide PDF for freelancers.
Run: python scripts/generate-review-guide.py
Output: scripts/output/MathKix_Question_Review_Guide.pdf
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER

# ── Output path ───────────────────────────────────────────────────────────────
os.makedirs("scripts/output", exist_ok=True)
OUTPUT = "scripts/output/MathKix_Question_Review_Guide.pdf"

# ── Colour palette ────────────────────────────────────────────────────────────
DARK       = colors.HexColor("#0f1117")
INDIGO     = colors.HexColor("#6366f1")
INDIGO_LT  = colors.HexColor("#e0e7ff")
RED        = colors.HexColor("#ef4444")
RED_LT     = colors.HexColor("#fee2e2")
AMBER      = colors.HexColor("#f59e0b")
AMBER_LT   = colors.HexColor("#fef3c7")
GREEN      = colors.HexColor("#22c55e")
GREEN_LT   = colors.HexColor("#dcfce7")
PURPLE     = colors.HexColor("#a855f7")
PURPLE_LT  = colors.HexColor("#f3e8ff")
ORANGE_LT  = colors.HexColor("#ffedd5")
YELLOW_LT  = colors.HexColor("#fefce8")
SLATE      = colors.HexColor("#64748b")
SLATE_LT   = colors.HexColor("#f8fafc")
BORDER     = colors.HexColor("#e2e8f0")

# ── Styles ────────────────────────────────────────────────────────────────────
base_styles = getSampleStyleSheet()

def S(name, **kw):
    return ParagraphStyle(name, **kw)

styles = {
    "title": S("title",
        fontSize=26, leading=32, textColor=DARK,
        fontName="Helvetica-Bold", spaceAfter=4),
    "subtitle": S("subtitle",
        fontSize=13, leading=18, textColor=SLATE,
        fontName="Helvetica", spaceAfter=16),
    "h1": S("h1",
        fontSize=16, leading=22, textColor=INDIGO,
        fontName="Helvetica-Bold", spaceBefore=18, spaceAfter=6,
        borderPad=4),
    "h2": S("h2",
        fontSize=12, leading=17, textColor=DARK,
        fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=4),
    "body": S("body",
        fontSize=10, leading=15, textColor=DARK,
        fontName="Helvetica", spaceAfter=6),
    "body_sm": S("body_sm",
        fontSize=9, leading=13, textColor=DARK,
        fontName="Helvetica", spaceAfter=4),
    "mono": S("mono",
        fontSize=9, leading=13, textColor=colors.HexColor("#1e293b"),
        fontName="Courier", spaceAfter=4,
        backColor=colors.HexColor("#f1f5f9"),
        borderPad=4),
    "bullet": S("bullet",
        fontSize=10, leading=15, textColor=DARK,
        fontName="Helvetica", spaceAfter=3,
        leftIndent=16, bulletIndent=4),
    "caption": S("caption",
        fontSize=8, leading=11, textColor=SLATE,
        fontName="Helvetica-Oblique", spaceAfter=4),
    "toc": S("toc",
        fontSize=10, leading=16, textColor=INDIGO,
        fontName="Helvetica"),
}

def hr(): return HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=8, spaceBefore=4)
def sp(n=6): return Spacer(1, n)

def p(text, style="body"): return Paragraph(text, styles[style])
def h1(text): return p(text, "h1")
def h2(text): return p(text, "h2")
def body(text): return p(text, "body")
def bullet(text): return Paragraph(f"&bull;&nbsp;&nbsp;{text}", styles["bullet"])

def info_box(title, text, bg=INDIGO_LT, border=INDIGO):
    tbl = Table([[Paragraph(f"<b>{title}</b><br/>{text}", styles["body_sm"])]],
                colWidths=[6.5*inch])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), bg),
        ("BOX",        (0,0), (-1,-1), 1, border),
        ("LEFTPADDING",  (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING",   (0,0), (-1,-1), 8),
        ("BOTTOMPADDING",(0,0), (-1,-1), 8),
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[bg]),
    ]))
    return tbl

# ── Document ──────────────────────────────────────────────────────────────────
doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=letter,
    leftMargin=0.85*inch, rightMargin=0.85*inch,
    topMargin=0.85*inch,  bottomMargin=0.85*inch,
)

story = []

# ═══════════════════════════════════════════════════════════════════════════════
# COVER
# ═══════════════════════════════════════════════════════════════════════════════
story += [
    sp(30),
    p("MathKix", "title"),
    p("Question Review Guide", "subtitle"),
    hr(),
    body("This document is for freelance reviewers working in the MathKix admin dashboard. "
         "It covers the full decision framework, curriculum cheat sheet, question type rules, "
         "flag definitions, and edge cases you will encounter."),
    sp(6),
    info_box("Your task in one sentence",
             "For each question: read it, check it against this guide, then click <b>Approve</b> or <b>Flag</b>."),
    sp(20),
    p("Contents", "h2"),
    p("1. How the dashboard works", "toc"),
    p("2. Decision framework — when to approve vs. flag", "toc"),
    p("3. Question types &amp; UI rules (critical)", "toc"),
    p("4. AI flags — what they mean and when to trust them", "toc"),
    p("5. Difficulty levels explained", "toc"),
    p("6. Curriculum cheat sheet — all grades &amp; standards", "toc"),
    p("7. Edge cases &amp; worked examples", "toc"),
    PageBreak(),
]

# ═══════════════════════════════════════════════════════════════════════════════
# 1. HOW THE DASHBOARD WORKS
# ═══════════════════════════════════════════════════════════════════════════════
story += [
    h1("1. How the Dashboard Works"),
    hr(),
    body("Log in at <b>mathkix.com/admin</b> → click <b>Questions</b> in the left sidebar. "
         "You will see a card for each question. The default filter shows <b>AI Flagged</b> questions first — "
         "these were pre-screened by an AI and need your human judgement to confirm or override."),
    sp(4),
    h2("Filters"),
    body("<b>AI Flagged</b> — AI found a potential issue. Review these first."),
    body("<b>Unreviewed</b> — Not yet seen by anyone. Work through these after AI Flagged."),
    body("<b>Approved</b> — Already approved. You can revisit if needed."),
    body("<b>Flagged</b> — Human-confirmed issues. Skip unless re-checking."),
    sp(4),
    h2("Actions"),
    body("<b>Approve (→ or L key)</b> — Question is correct, clear, and appropriate. Move on."),
    body("<b>Flag (← or H key)</b> — Opens a form. Fill in:"),
    bullet("<b>What's wrong?</b> (required) — Brief description of the issue."),
    bullet("<b>Suggested fix</b> (optional but very helpful) — What the question should say or what the answer should be."),
    sp(4),
    info_box("Tip — keyboard shortcuts",
             "Use → to approve and ← to flag. Use ↑ / ↓ to navigate without deciding. "
             "This makes reviewing fast once you are in a rhythm."),
    PageBreak(),
]

# ═══════════════════════════════════════════════════════════════════════════════
# 2. DECISION FRAMEWORK
# ═══════════════════════════════════════════════════════════════════════════════
story += [
    h1("2. Decision Framework"),
    hr(),
    body("Go through these checks in order. Stop at the first failure and flag."),
    sp(6),
]

checks = [
    ("1", "Is the correct answer mathematically right?",
     "Work it out yourself. If it is wrong, flag it as <b>Wrong Answer</b> with the correct value in Suggested Fix.",
     RED_LT, RED),
    ("2", "Can the student actually enter this answer using the UI type?",
     "See Section 3 for the rules per type. This is the most common mechanical failure.",
     RED_LT, RED),
    ("3", "Is the question clear and unambiguous?",
     "Read it as a child of that grade. If it could mean two different things, flag as <b>Ambiguous Wording</b>.",
     AMBER_LT, AMBER),
    ("4", "Does the question have enough information to be solved?",
     "If it references a picture/diagram/chart but no visual is shown, flag as <b>Missing Visual</b>. "
     "If a number or unit is missing, flag as <b>Unanswerable</b>.",
     AMBER_LT, AMBER),
    ("5", "Does the difficulty match the grade level standard? (Check the cheat sheet in Section 6)",
     "Always check the <b>difficulty stars</b> before flagging grade mismatch. Hard (★★★) questions "
     "at a grade level are expected to push the upper boundary of that standard.",
     PURPLE_LT, PURPLE),
    ("6", "For multiple choice: are the wrong options (distractors) reasonable?",
     "Distractors should reflect common mistakes — not be obviously silly or identical to each other. "
     "Flag as <b>Weak Distractors</b> if a child could eliminate wrong answers without knowing the math.",
     ORANGE_LT, AMBER),
    ("7", "Is the language appropriate for the grade?",
     "Grade 1-2: vocabulary should be simple, sentences short. Grade 3-5: can be more complex. "
     "Flag as <b>Ambiguous Wording</b> if language seems wildly off.",
     YELLOW_LT, colors.HexColor("#ca8a04")),
]

for num, title, desc, bg, border in checks:
    tbl = Table([
        [Paragraph(num, ParagraphStyle("cn", fontSize=14, fontName="Helvetica-Bold",
                                        textColor=border, alignment=TA_CENTER)),
         Paragraph(f"<b>{title}</b><br/>{desc}", styles["body_sm"])]
    ], colWidths=[0.4*inch, 6.1*inch])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,-1), bg),
        ("BOX",          (0,0), (-1,-1), 1,   border),
        ("LINEAFTER",    (0,0), (0,-1),  0.5, border),
        ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
        ("LEFTPADDING",  (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING",   (0,0), (-1,-1), 7),
        ("BOTTOMPADDING",(0,0), (-1,-1), 7),
    ]))
    story.append(KeepTogether([tbl, sp(5)]))

story.append(sp(4))
story.append(info_box(
    "When in doubt — approve",
    "If you have spent more than 60 seconds on a question and are still unsure, approve it. "
    "The goal is to catch clear errors, not to debate edge cases. Flag only when you are confident something is wrong."))
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# 3. QUESTION TYPES & UI RULES
# ═══════════════════════════════════════════════════════════════════════════════
story += [
    h1("3. Question Types &amp; UI Rules"),
    hr(),
    body("Each question has a type. The type determines what UI component the student uses to answer. "
         "If the correct answer cannot be physically entered using that UI, the question is broken — flag it as <b>UI Mismatch</b>."),
    sp(8),
]

type_data = [
    ["Type", "How the student answers", "Valid correct_answer format", "Common failures"],
    ["multiple_choice",
     "Taps one of 2–4 labelled buttons (A, B, C, D)",
     "Must exactly match one of the option values (case-sensitive)",
     "Answer is '12' but option values are 'twelve', '10', '14', '16' — no match\nFewer than 2 options"],
    ["numeric",
     "Types on a virtual number pad (digits 0–9 and decimal point)",
     "Any number: '7', '42', '3.14', '0.5'\nNO fractions, NO words",
     "Answer is '1/2' — must use fraction type\nAnswer is 'A half' — not a number\nAnswer is 'seven' — not a number"],
    ["fraction",
     "Two separate boxes — numerator (top) and denominator (bottom)",
     "Format: X/Y where Y is not 0\nExamples: '1/2', '3/4', '7/8'\nNO decimals, NO mixed numbers",
     "Answer is '0.5' — must be '1/2'\nAnswer is '1 1/2' — mixed numbers not supported\nDenominator is 0 (e.g. '3/0')"],
]

col_widths = [1.1*inch, 1.6*inch, 1.8*inch, 2.0*inch]
tbl = Table(type_data, colWidths=col_widths, repeatRows=1)
tbl.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0),  INDIGO),
    ("TEXTCOLOR",     (0,0), (-1,0),  colors.white),
    ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,0),  9),
    ("FONTNAME",      (0,1), (-1,-1), "Helvetica"),
    ("FONTSIZE",      (0,1), (-1,-1), 8),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [colors.white, SLATE_LT]),
    ("BOX",           (0,0), (-1,-1), 1,   BORDER),
    ("INNERGRID",     (0,0), (-1,-1), 0.5, BORDER),
    ("VALIGN",        (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING",   (0,0), (-1,-1), 6),
    ("RIGHTPADDING",  (0,0), (-1,-1), 6),
    ("TOPPADDING",    (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ("BACKGROUND",    (0,1), (0,-1),  colors.HexColor("#dbeafe")),
]))
story.append(tbl)
story.append(sp(10))

story.append(h2("Multiple choice — extra checks"))
story += [
    bullet("The <b>correct_answer</b> field must exactly match one option <b>value</b> (not label). "
           "Labels are A/B/C/D. Values are what the student actually answers, e.g. '12'."),
    bullet("There must be at least 2 options, ideally 4."),
    bullet("No two options should have the same value."),
    bullet("The correct option should not be obviously different in style or length from wrong options."),
]
story.append(sp(6))
story.append(h2("Fraction type — grade rule"))
story += [
    bullet("Fractions (NF domain) are a <b>Grade 3+ topic</b> in Common Core."),
    bullet("A question tagged Grade 1 or Grade 2 with type 'fraction' is almost certainly a data error — flag as <b>Grade Mismatch + UI Mismatch</b>."),
    bullet("Exception: Grade 2.G.A.3 asks students to partition shapes into equal shares (halves, thirds, fourths) — but the answer is described in words, not entered as a fraction. If a G2 question asks for a fraction input, flag it."),
]
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# 4. AI FLAGS
# ═══════════════════════════════════════════════════════════════════════════════
story += [
    h1("4. AI Flags — What They Mean &amp; When to Trust Them"),
    hr(),
    body("The AI pre-screened all questions and left flags where it suspected problems. "
         "It is helpful but not perfect. <b>Your human judgement always overrides the AI.</b>"),
    sp(8),
]

flag_rows = [
    ["Flag", "What it means", "Trust?", "What to do"],
    ["UI Mismatch",
     "Answer format doesn't match the UI type (e.g. fraction answer on numeric input)",
     "High",
     "Check Section 3 rules. If confirmed, flag. These are usually clear-cut data errors."],
    ["Format Error",
     "Multiple choice has fewer than 2 options, or options array is missing",
     "High",
     "Confirm by looking at the options grid. If empty or only 1 option, flag."],
    ["Wrong Answer",
     "AI thinks the stated correct answer is mathematically incorrect",
     "Medium",
     "Work out the answer yourself. AI makes arithmetic mistakes. Approve if your answer matches."],
    ["Missing Visual",
     "Question text says 'look at the diagram' or 'shown below' but no visual is attached",
     "High",
     "Check if the question is self-contained without a visual. If it references something the student can't see, flag."],
    ["Grade Mismatch",
     "AI thinks the question is too hard or too easy for the grade",
     "Low",
     "Always check the difficulty stars first. Hard (3-star) questions at a grade are meant to be challenging. "
     "Use the curriculum cheat sheet in Section 6. Override the AI often here."],
    ["Ambiguous Wording",
     "Question could be interpreted multiple ways",
     "Medium",
     "Read it as a child. If you can only see one interpretation, approve."],
    ["Weak Distractors",
     "Wrong options are too obvious or nonsensical for multiple choice",
     "Low",
     "Check if wrong options reflect plausible mistakes. If they do, approve — AI is conservative here."],
    ["Unanswerable",
     "Missing information needed to solve the problem",
     "Medium",
     "Try to solve it yourself. If you can, approve."],
]

col_widths2 = [1.1*inch, 2.0*inch, 0.65*inch, 2.75*inch]
tbl2 = Table(flag_rows, colWidths=col_widths2, repeatRows=1)
trust_colors = {
    "High":   GREEN_LT,
    "Medium": AMBER_LT,
    "Low":    PURPLE_LT,
}
tbl2_style = [
    ("BACKGROUND",    (0,0), (-1,0),  DARK),
    ("TEXTCOLOR",     (0,0), (-1,0),  colors.white),
    ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,0),  9),
    ("FONTNAME",      (0,1), (-1,-1), "Helvetica"),
    ("FONTSIZE",      (0,1), (-1,-1), 8),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [colors.white, SLATE_LT]),
    ("BOX",           (0,0), (-1,-1), 1,   BORDER),
    ("INNERGRID",     (0,0), (-1,-1), 0.5, BORDER),
    ("VALIGN",        (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING",   (0,0), (-1,-1), 6),
    ("RIGHTPADDING",  (0,0), (-1,-1), 6),
    ("TOPPADDING",    (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
]
for row_i, row in enumerate(flag_rows[1:], start=1):
    trust = row[2]
    color = GREEN_LT if trust == "High" else AMBER_LT if trust == "Medium" else PURPLE_LT
    tbl2_style.append(("BACKGROUND", (2, row_i), (2, row_i), color))
tbl2.setStyle(TableStyle(tbl2_style))
story.append(tbl2)
story.append(sp(10))
story.append(info_box(
    "Key principle on Grade Mismatch flags",
    "The AI does not know the difficulty setting. A 3-star (hard) question labelled Grade 2 is EXPECTED "
    "to be at the upper edge of Grade 2 content — that is its purpose. Always check the stars before "
    "accepting a grade mismatch flag. The example '345 + 478' for Grade 2 hard is fine — it's 2.NBT.7."))
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# 5. DIFFICULTY LEVELS
# ═══════════════════════════════════════════════════════════════════════════════
story += [
    h1("5. Difficulty Levels"),
    hr(),
    body("Every question has a difficulty from 1 (easy) to 3 (hard). This affects what content is acceptable."),
    sp(6),
]

diff_data = [
    ["Stars", "Label", "What to expect"],
    ["★☆☆", "Easy",
     "Straightforward application of the standard. Single step. Small numbers. "
     "No tricks. A student who just learned the concept should get this right."],
    ["★★☆", "Medium",
     "Requires applying the standard in a slightly less obvious way. May have two steps "
     "or slightly larger numbers. Still within the core standard."],
    ["★★★", "Hard",
     "Pushes the upper boundary of the standard. Multi-step, larger numbers, word problems, "
     "or application in a new context. SHOULD feel harder than easy — do not flag just because it "
     "seems challenging for that grade."],
]
col_widths3 = [0.7*inch, 0.7*inch, 5.1*inch]
tbl3 = Table(diff_data, colWidths=col_widths3, repeatRows=1)
tbl3.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0),  DARK),
    ("TEXTCOLOR",     (0,0), (-1,0),  colors.white),
    ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,0),  9),
    ("FONTNAME",      (0,1), (-1,-1), "Helvetica"),
    ("FONTSIZE",      (0,1), (-1,-1), 9),
    ("BACKGROUND",    (0,1), (-1,1),  GREEN_LT),
    ("BACKGROUND",    (0,2), (-1,2),  AMBER_LT),
    ("BACKGROUND",    (0,3), (-1,3),  RED_LT),
    ("BOX",           (0,0), (-1,-1), 1,   BORDER),
    ("INNERGRID",     (0,0), (-1,-1), 0.5, BORDER),
    ("VALIGN",        (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ("TOPPADDING",    (0,0), (-1,-1), 7),
    ("BOTTOMPADDING", (0,0), (-1,-1), 7),
]))
story.append(tbl3)
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# 6. CURRICULUM CHEAT SHEET
# ═══════════════════════════════════════════════════════════════════════════════
story += [
    h1("6. Curriculum Cheat Sheet"),
    hr(),
    body("Use this section to verify whether a question's content matches its standard code. "
         "Standard codes appear on the question card (e.g. '2.NBT.7'). The format is: "
         "<b>Grade.Domain.Standard</b>."),
    sp(4),
    body("<b>Domains:</b> OA = Operations &amp; Algebra | NBT = Number &amp; Base Ten | "
         "NF = Fractions (Grade 3+) | MD = Measurement &amp; Data | G = Geometry"),
    sp(8),
]

def grade_section(grade, color, standards):
    rows = [["Code", "What the student should be able to do", "Example question"]]
    for code, desc, example in standards:
        rows.append([code, desc, example])
    col_w = [0.85*inch, 3.1*inch, 2.55*inch]
    tbl = Table(rows, colWidths=col_w, repeatRows=1)
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  color),
        ("TEXTCOLOR",     (0,0), (-1,0),  colors.white),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,0),  8),
        ("FONTNAME",      (0,1), (-1,-1), "Helvetica"),
        ("FONTSIZE",      (0,1), (-1,-1), 8),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [colors.white, SLATE_LT]),
        ("BOX",           (0,0), (-1,-1), 1,   BORDER),
        ("INNERGRID",     (0,0), (-1,-1), 0.5, BORDER),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING",   (0,0), (-1,-1), 5),
        ("RIGHTPADDING",  (0,0), (-1,-1), 5),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("FONTNAME",      (0,1), (0,-1),  "Courier"),
        ("FONTSIZE",      (0,1), (0,-1),  8),
    ]))
    return [
        p(f"Grade {grade}", "h2"),
        tbl,
        sp(10),
    ]

g1_color = colors.HexColor("#0369a1")
g2_color = colors.HexColor("#0891b2")
g3_color = colors.HexColor("#059669")
g4_color = colors.HexColor("#7c3aed")
g5_color = colors.HexColor("#b45309")

for item in grade_section(1, g1_color, [
    ("1.OA.A.1", "Add/subtract within 20 to solve word problems using objects, drawings, and equations",
     "There are 8 apples. 3 are eaten. How many are left?"),
    ("1.OA.A.2", "Solve word problems adding three whole numbers whose sum is at most 20",
     "Sam has 3 red, 4 blue, and 5 green marbles. How many total?"),
    ("1.OA.B.3", "Apply commutative and associative properties of addition",
     "If 4 + 6 = 10, what does 6 + 4 equal?"),
    ("1.OA.B.4", "Understand subtraction as an unknown-addend problem",
     "8 - 3 = ___. What number plus 3 equals 8?"),
    ("1.OA.C.6", "Add and subtract within 20 fluently",
     "What is 7 + 8?"),
    ("1.OA.D.7", "Understand the equal sign (=) means both sides are the same",
     "Is 5 + 3 = 4 + 4 true or false?"),
    ("1.NBT.B.2", "Understand two-digit numbers as tens and ones",
     "What does the digit 3 mean in the number 35?"),
    ("1.NBT.B.3", "Compare two-digit numbers using >, =, <",
     "Which is greater: 47 or 74?"),
    ("1.NBT.C.4", "Add within 100 (two-digit + one-digit, two-digit + multiple of 10)",
     "What is 34 + 20?"),
    ("1.NBT.C.5", "Mentally find 10 more or 10 less than a two-digit number",
     "What is 10 more than 56?"),
    ("1.MD.B.3", "Tell and write time in hours and half-hours",
     "The clock shows 3:30. What time is it?"),
    ("1.MD.C.4", "Organize and interpret data with up to three categories",
     "The chart shows 4 cats, 7 dogs, 2 fish. How many more dogs than cats?"),
    ("1.G.A.1", "Distinguish defining attributes of shapes (sides, angles)",
     "Which shape has 3 sides?"),
    ("1.G.A.3", "Partition circles and rectangles into two and four equal shares",
     "A circle is cut into 2 equal pieces. What is each piece called?"),
]): story.append(item)

for item in grade_section(2, g2_color, [
    ("2.OA.A.1", "Add/subtract within 100 to solve one- and two-step word problems",
     "Lena has 45 stickers. She gives away 18. How many does she have left?"),
    ("2.OA.B.2", "Fluently add and subtract within 20 from memory",
     "What is 13 - 7?"),
    ("2.OA.C.3", "Determine if a group of objects has an odd or even number",
     "Is 14 odd or even?"),
    ("2.OA.C.4", "Use addition to find total objects in rectangular arrays",
     "A 3-row array has 4 items per row. How many total?"),
    ("2.NBT.A.1", "Understand 3-digit numbers as hundreds, tens, and ones",
     "What does the digit 4 represent in 347?"),
    ("2.NBT.A.3", "Read and write numbers to 1,000 in multiple forms",
     "Write 'five hundred sixty-two' in standard form."),
    ("2.NBT.A.4", "Compare three-digit numbers using >, =, <",
     "Which is less: 472 or 427?"),
    ("2.NBT.B.5", "Fluently add and subtract within 100",
     "What is 67 - 29?"),
    ("2.NBT.B.7", "Add and subtract within 1,000 using models and strategies",
     "A school has 345 boys and 478 girls. How many students in all?"),
    ("2.NBT.B.8", "Mentally add or subtract 10 or 100 to/from any number",
     "What is 100 more than 637?"),
    ("2.MD.C.7", "Tell and write time to the nearest 5 minutes",
     "The clock shows 2:45. What time is it?"),
    ("2.MD.C.8", "Solve word problems with dollar bills, coins",
     "If you have 3 quarters and 2 dimes, how many cents do you have?"),
    ("2.G.A.1", "Recognize and draw shapes with specific attributes",
     "Which shape has 4 equal sides?"),
    ("2.G.A.3", "Partition rectangles/circles into halves, thirds, fourths",
     "A pizza is cut into 4 equal slices. What fraction is one slice?"),
]): story.append(item)

story.append(PageBreak())

for item in grade_section(3, g3_color, [
    ("3.OA.A.1", "Interpret products of whole numbers (multiplication as equal groups)",
     "There are 4 bags with 6 apples each. How many apples total?"),
    ("3.OA.A.2", "Interpret whole-number quotients (division as sharing/grouping)",
     "24 cookies are shared equally among 6 children. How many each?"),
    ("3.OA.A.3", "Multiply and divide within 100 to solve word problems",
     "Each box holds 8 crayons. How many crayons in 7 boxes?"),
    ("3.OA.C.7", "Fluently multiply and divide within 100",
     "What is 7 x 8?"),
    ("3.OA.D.8", "Solve two-step word problems using all four operations",
     "A baker made 48 muffins and sold 15. He packs the rest in boxes of 3. How many boxes?"),
    ("3.NBT.A.1", "Round whole numbers to the nearest 10 or 100",
     "Round 374 to the nearest 10."),
    ("3.NBT.A.2", "Fluently add and subtract within 1,000",
     "What is 856 - 478?"),
    ("3.NF.A.1", "Understand a fraction 1/b as one part of a whole with b equal parts",
     "A pie is cut into 8 equal slices. What fraction is 3 slices?"),
    ("3.NF.A.2", "Represent fractions on a number line",
     "What fraction is the point halfway between 0 and 1?"),
    ("3.NF.A.3", "Explain fraction equivalence; compare fractions with same numerator/denominator",
     "Which fraction is greater: 3/4 or 3/8?"),
    ("3.MD.A.1", "Tell time to the nearest minute; solve elapsed time problems",
     "A movie starts at 2:15 and ends at 3:50. How long is the movie?"),
    ("3.MD.C.5", "Recognize area as an attribute; understand square units",
     "A rectangle is 4 units wide and 3 units tall. What is its area?"),
    ("3.MD.D.8", "Solve problems involving perimeter of polygons",
     "A rectangle is 6 cm long and 4 cm wide. What is its perimeter?"),
    ("3.G.A.1", "Understand shapes share attributes (e.g., all quadrilaterals have 4 sides)",
     "What do all quadrilaterals have in common?"),
]): story.append(item)

for item in grade_section(4, g4_color, [
    ("4.OA.A.1", "Interpret a multiplication equation as a comparison",
     "35 is 5 times as many as what number?"),
    ("4.OA.A.3", "Solve multi-step word problems; interpret remainders",
     "A school buys 250 pencils for 38 students. How many extras are left over?"),
    ("4.OA.B.4", "Find factor pairs; identify prime and composite numbers within 100",
     "Is 37 prime or composite?"),
    ("4.NBT.A.2", "Read and write multi-digit whole numbers; expand in base-ten",
     "What is the value of the digit 6 in 364,891?"),
    ("4.NBT.A.3", "Round multi-digit whole numbers to any place",
     "Round 47,382 to the nearest thousand."),
    ("4.NBT.B.4", "Fluently add and subtract multi-digit whole numbers",
     "What is 56,281 + 34,769?"),
    ("4.NBT.B.5", "Multiply up to 4-digit by 1-digit; multiply two 2-digit numbers",
     "What is 47 x 23?"),
    ("4.NBT.B.6", "Find quotients and remainders with up to 4-digit dividends",
     "What is 6,372 divided by 4?"),
    ("4.NF.A.1", "Explain why a/b = (nxa)/(nxb); generate equivalent fractions",
     "What fraction is equivalent to 2/3 with a denominator of 12?"),
    ("4.NF.A.2", "Compare fractions with different numerators and denominators",
     "Which is greater: 5/8 or 3/5?"),
    ("4.NF.B.3", "Add and subtract fractions and mixed numbers with like denominators",
     "What is 2/5 + 4/5?"),
    ("4.NF.C.6", "Use decimal notation for fractions with denominators 10 or 100",
     "Write 7/10 as a decimal."),
    ("4.MD.A.3", "Apply area and perimeter formulas for rectangles in real-world problems",
     "A garden is 12 m long and 8 m wide. What is its area?"),
    ("4.MD.C.6", "Measure angles in whole-number degrees using a protractor",
     "What type of angle is 135 degrees?"),
    ("4.G.A.2", "Classify shapes based on parallel/perpendicular lines and angles",
     "Which shape always has two pairs of parallel sides?"),
]): story.append(item)

story.append(PageBreak())

for item in grade_section(5, g5_color, [
    ("5.OA.A.1", "Evaluate expressions with parentheses, brackets, or braces",
     "What is (3 + 4) x 2 - 5?"),
    ("5.NBT.A.1", "Understand place value: a digit is 10x the value of digit to its right",
     "The digit 4 in 3,400 is how many times the value of 4 in 340?"),
    ("5.NBT.A.3", "Read, write, and compare decimals to thousandths",
     "Which is greater: 0.45 or 0.405?"),
    ("5.NBT.A.4", "Round decimals to any place",
     "Round 3.7284 to the nearest hundredth."),
    ("5.NBT.B.5", "Fluently multiply multi-digit whole numbers",
     "What is 347 x 82?"),
    ("5.NBT.B.7", "Add, subtract, multiply, and divide decimals to hundredths",
     "What is 12.4 + 7.85?"),
    ("5.NF.A.1", "Add and subtract fractions with unlike denominators",
     "What is 2/3 + 3/4?"),
    ("5.NF.B.3", "Interpret a fraction as division of the numerator by the denominator",
     "What does 3/4 mean as a division problem?"),
    ("5.NF.B.4", "Multiply fractions and mixed numbers",
     "What is 2/3 x 3/5?"),
    ("5.NF.B.7", "Divide unit fractions by whole numbers and whole numbers by unit fractions",
     "What is 1/3 divided by 4?"),
    ("5.MD.A.1", "Convert measurement units within the same system",
     "How many centimetres are in 3.5 metres?"),
    ("5.MD.C.3", "Recognize volume as an attribute of solid figures",
     "A box is 3 cm x 4 cm x 5 cm. What is its volume?"),
    ("5.G.A.1", "Use a coordinate plane; plot points in the first quadrant",
     "Plot the point (3, 5) on a coordinate grid. Which quadrant is it in?"),
    ("5.G.B.3", "Understand that attributes of a category apply to all subcategories",
     "All squares are rectangles. True or false?"),
]): story.append(item)

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# 7. EDGE CASES & WORKED EXAMPLES
# ═══════════════════════════════════════════════════════════════════════════════
story += [
    h1("7. Edge Cases &amp; Worked Examples"),
    hr(),
]

cases = [
    (GREEN, "APPROVE",
     "Grade 2 hard — 345 + 478 flagged as Grade Mismatch",
     "Standard 2.NBT.7 explicitly covers adding within 1,000. Three-digit addition with regrouping IS the Grade 2 hard content. "
     "The AI flagged because the numbers look large, but it didn't account for the hard difficulty. Approve."),
    (RED, "FLAG",
     "Grade 2 fraction type — correct_answer '1/2', type 'fraction'",
     "Fraction input (the X/Y entry UI) is for Grade 3+ NF standards. A Grade 2 question should not use this type. "
     "Flag as UI Mismatch + Grade Mismatch. Suggested fix: change type to 'multiple_choice' with word answers, "
     "or move to Grade 3."),
    (RED, "FLAG",
     "Type numeric — correct_answer 'A half'",
     "The numeric keypad only accepts digits and a decimal point. 'A half' cannot be typed. "
     "Flag as UI Mismatch. Suggested fix: change correct_answer to '0.5' and type to 'numeric', "
     "or rephrase question and use 'multiple_choice'."),
    (RED, "FLAG",
     "Type multiple_choice — correct_answer '12' but options are ['ten', 'twelve', 'fourteen', 'sixteen']",
     "The correct_answer '12' is a numeral but the options use words. No option value equals '12'. "
     "Flag as UI Mismatch. Suggested fix: either change correct_answer to 'twelve', "
     "or change option values to '10', '12', '14', '16'."),
    (GREEN, "APPROVE",
     "Grade 4 hard — 'Is 97 prime or composite?' flagged as Grade Mismatch",
     "4.OA.B.4 explicitly covers prime and composite numbers. 97 is a valid choice for hard difficulty "
     "(it requires checking divisibility). Approve."),
    (RED, "FLAG",
     "Question says 'Look at the shape shown below.' No visual asset visible on card",
     "The student cannot answer without seeing the shape. Flag as Missing Visual. "
     "Note in Suggested Fix that a visual asset is needed (or rephrase the question to be self-contained)."),
    (RED, "FLAG",
     "Correct answer verified wrong — 'What is 7 x 8?' with correct_answer '54'",
     "7 x 8 = 56, not 54. Flag as Wrong Answer. Suggested fix: change correct_answer to '56'."),
    (GREEN, "APPROVE",
     "Multiple choice — one distractor is obviously wrong (e.g. '999' when other options are '12', '14', '16')",
     "The AI may flag this as Weak Distractors. But consider: for Grade 1-2 students, "
     "'999' is still a plausible wrong answer if they miscount. Use your judgement — "
     "if most distractors are reasonable, approve. Only flag if ALL wrong options are clearly absurd."),
    (GREEN, "APPROVE",
     "Grade 3 word problem with two steps — flagged as Grade Mismatch (too hard)",
     "3.OA.D.8 explicitly requires two-step word problems. If it's tagged as hard difficulty, this is expected. Approve."),
    (RED, "FLAG",
     "Type fraction — correct_answer '3/0'",
     "Division by zero is undefined and the fraction UI rejects a denominator of 0. "
     "Flag as UI Mismatch + Wrong Answer. The question itself needs to be reworked."),
]

for color, verdict, scenario, explanation in cases:
    verdict_style = ParagraphStyle("vrd", fontSize=9, fontName="Helvetica-Bold",
                                   textColor=color, alignment=TA_CENTER)
    inner = Table([
        [Paragraph(verdict, verdict_style),
         Paragraph(f"<b>{scenario}</b><br/>{explanation}", styles["body_sm"])]
    ], colWidths=[0.75*inch, 5.75*inch])
    bg = GREEN_LT if color == GREEN else RED_LT
    border = GREEN if color == GREEN else RED
    inner.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,-1), bg),
        ("BOX",          (0,0), (-1,-1), 1,   border),
        ("LINEAFTER",    (0,0), (0,-1),  1,   border),
        ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
        ("LEFTPADDING",  (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING",   (0,0), (-1,-1), 8),
        ("BOTTOMPADDING",(0,0), (-1,-1), 8),
    ]))
    story.append(KeepTogether([inner, sp(6)]))

story += [
    sp(10),
    hr(),
    p("Questions? Contact the MathKix team. Thank you for helping make MathKix great for kids.", "caption"),
]

# ── Build ─────────────────────────────────────────────────────────────────────
doc.build(story)
print(f"Generated: {OUTPUT}")
