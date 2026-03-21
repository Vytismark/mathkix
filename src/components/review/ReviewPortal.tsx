'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ReviewableQuestion, ReviewRecord } from '@/app/api/admin/questions/queue/route'

// ── Curriculum data ────────────────────────────────────────────────────────────

const DOMAIN_LABELS: Record<string, string> = {
  OA: 'Operations & Algebra',
  NBT: 'Number & Base Ten',
  NF: 'Fractions',
  MD: 'Measurement & Data',
  G: 'Geometry',
}

// Full CCSS K-5 standards with scope detail
type StandardEntry = {
  desc: string
  example: string
  scope: string
  inScope: string[]
  outScope: string[]
}
const STANDARDS: Record<string, StandardEntry> = {
  '1.OA.A.1': {
    desc: 'Add/subtract within 20 to solve word problems',
    example: 'There are 8 apples. 3 are eaten. How many left?',
    scope: 'Real-world addition/subtraction stories where both numbers and the answer are ≤ 20. Students can use objects, drawings, or equations.',
    inScope: ['Add-to / Take-from / Put-together / Take-apart / Compare stories', 'Unknown in any position (result, change, or start unknown)', 'Both operands and result within 0–20'],
    outScope: ['Any number > 20', 'Three-addend problems (that is 1.OA.A.2)', 'Abstract equations with no context'],
  },
  '1.OA.A.2': {
    desc: 'Solve word problems adding three whole numbers (sum ≤ 20)',
    example: 'Sam has 3 red, 4 blue, 5 green marbles. Total?',
    scope: 'Word problems that require adding exactly three whole numbers whose sum does not exceed 20.',
    inScope: ['Exactly three addends', 'Sum ≤ 20', 'Real-world context'],
    outScope: ['Two-addend problems (that is 1.OA.A.1)', 'Sum > 20', 'Subtraction'],
  },
  '1.OA.B.3': {
    desc: 'Apply commutative & associative properties of addition',
    example: 'If 4 + 6 = 10, what does 6 + 4 equal?',
    scope: 'Understanding that order (commutative) and grouping (associative) don\'t change the sum. Does NOT require students to name the properties, only apply them.',
    inScope: ['Showing a + b = b + a', 'Showing (a + b) + c = a + (b + c)', 'Applying to simplify calculations within 20'],
    outScope: ['Naming "commutative" or "associative" by term', 'Subtraction properties', 'Numbers > 20'],
  },
  '1.OA.B.4': {
    desc: 'Understand subtraction as an unknown-addend problem',
    example: 'What plus 3 equals 8?',
    scope: 'Connecting subtraction to a missing addend. "13 − 4 = ?" is the same as "4 + ? = 13". Reinforces the relationship between operations.',
    inScope: ['___ + b = c format', 'a + ___ = c format', 'Connecting to the related subtraction fact', 'Numbers within 20'],
    outScope: ['Pure subtraction with no missing-addend framing', 'Numbers > 20'],
  },
  '1.OA.C.5': {
    desc: 'Relate counting to addition and subtraction',
    example: 'Count on from 7 to add 3. What do you get?',
    scope: 'Using counting strategies (count on, count back) to add or subtract. Bridges counting and arithmetic.',
    inScope: ['Count on from the larger number', 'Count back to subtract', 'Results within 20'],
    outScope: ['Fluency from memory (that is 1.OA.C.6)', 'Numbers > 20'],
  },
  '1.OA.C.6': {
    desc: 'Add and subtract within 20 fluently',
    example: 'What is 7 + 8?',
    scope: 'Quick, accurate recall (not slow counting). Students should know facts or use mental strategies like making ten, doubles, or near doubles.',
    inScope: ['Any addition or subtraction where both operands and result ≤ 20', 'Mental-math strategy questions (make 10, doubles ± 1)', 'Fact fluency checks'],
    outScope: ['Numbers > 20', 'Word problems (those go to 1.OA.A.1)', 'Three addends'],
  },
  '1.OA.D.7': {
    desc: 'Understand the equal sign means both sides are equal',
    example: 'Is 5 + 3 = 4 + 4 true or false?',
    scope: 'The equal sign means "the same value as," not "write the answer here." Students evaluate whether equations are true or false.',
    inScope: ['True/false for equations with expressions on both sides', 'Finding the value that makes an equation true', 'Within 20'],
    outScope: ['Solving for unknowns (that is 1.OA.D.8)', 'Inequalities (< or >)'],
  },
  '1.OA.D.8': {
    desc: 'Find the unknown whole number in an equation',
    example: 'What number makes ___ + 4 = 9?',
    scope: 'Solving simple equations where the unknown is in any position. Result, change, or start unknown. All values within 20.',
    inScope: ['___ + b = c', 'a + ___ = c', 'a + b = ___', 'Same for subtraction', 'Values within 0–20'],
    outScope: ['Values > 20', 'Two unknowns', 'Word problems without an equation frame'],
  },
  '1.NBT.A.1': {
    desc: 'Count to 120 starting at any number',
    example: 'What number comes after 109?',
    scope: 'Counting forward from any starting number within 120. Includes reading and writing numerals up to 120.',
    inScope: ['Counting on from a given number', 'Reading or writing numerals 0–120', 'What comes next/before in a sequence'],
    outScope: ['Numbers > 120', 'Skip counting (that is 2.NBT.A.2)', 'Place value decomposition'],
  },
  '1.NBT.B.2': {
    desc: 'Understand two-digit numbers as tens and ones',
    example: 'What does the 3 mean in 35?',
    scope: 'Two-digit numbers = some tens + some ones. Includes understanding 10 can be thought of as a bundle of ten ones, and multiples of 10 (10, 20, … 90).',
    inScope: ['Place value of digits in a 2-digit number', 'Tens and ones decomposition (e.g. 47 = 4 tens 7 ones)', 'Multiples of 10 up to 90'],
    outScope: ['Three-digit numbers (Grade 2)', 'Addition/subtraction using place value (1.NBT.C.4)'],
  },
  '1.NBT.B.3': {
    desc: 'Compare two-digit numbers using >, =, <',
    example: 'Which is greater: 47 or 74?',
    scope: 'Comparing two two-digit numbers by reasoning about tens and ones. Uses symbols >, =, <.',
    inScope: ['Any two 2-digit numbers', 'Using >, <, or = correctly', 'Reasoning based on tens first'],
    outScope: ['Three-digit numbers', 'Ordering more than two numbers'],
  },
  '1.NBT.C.4': {
    desc: 'Add within 100 (two-digit + one-digit or multiple of 10)',
    example: 'What is 34 + 20?',
    scope: 'Adding a two-digit number + a one-digit number, or a two-digit + a multiple of 10. Concrete models and place value understanding used. May involve regrouping.',
    inScope: ['2-digit + 1-digit (e.g. 43 + 6)', '2-digit + multiple of 10 (e.g. 43 + 20)', 'Results within 100', 'With or without regrouping'],
    outScope: ['Two-digit + two-digit with regrouping (Grade 2)', 'Subtraction within 100'],
  },
  '1.NBT.C.5': {
    desc: 'Mentally find 10 more or 10 less',
    example: 'What is 10 more than 56?',
    scope: 'Mental calculation only - no pencil. Students see that only the tens digit changes when adding/subtracting 10.',
    inScope: ['10 more than any 2-digit number', '10 less than any 2-digit number', 'Mental math only'],
    outScope: ['Adding/subtracting other amounts', 'Numbers > 99'],
  },
  '1.NBT.C.6': {
    desc: 'Subtract multiples of 10 in range 10–90',
    example: 'What is 70 − 30?',
    scope: 'Subtracting a multiple of 10 from another multiple of 10. Both numbers are in 10–90. Uses models or mental math.',
    inScope: ['10 − 10, 20 − 10, 70 − 30, 90 − 80, etc.', 'Mental math or models', 'Both numbers multiples of 10'],
    outScope: ['Non-multiples of 10', 'Any answer below 0', 'General 2-digit subtraction'],
  },
  '1.MD.A.1': {
    desc: 'Order three objects by length',
    example: 'Which pencil is shortest?',
    scope: 'Direct comparison of three objects - no measuring tool needed. Uses words: shorter, longer, shortest, longest.',
    inScope: ['Ordering three objects from shortest to longest or vice versa', 'Using comparative vocabulary', 'Direct visual comparison'],
    outScope: ['Using a ruler or units to measure (1.MD.A.2)', 'More than three objects'],
  },
  '1.MD.A.2': {
    desc: 'Measure length by laying units end to end',
    example: 'The ribbon is ___ paper clips long.',
    scope: 'Measuring length by placing same-size units (paper clips, cubes) end to end with no gaps or overlaps. Results are whole-number counts.',
    inScope: ['Counting non-standard units along an object', 'Expressing length as "X units long"', 'Whole number answers'],
    outScope: ['Standard units like cm or inches (Grade 2)', 'Rulers', 'Fractions of a unit'],
  },
  '1.MD.B.3': {
    desc: 'Tell and write time in hours and half-hours',
    example: 'The clock shows 3:30. What time is it?',
    scope: 'Reading an analog or digital clock to the nearest hour (X:00) or half hour (X:30). Includes both "o\'clock" and "half past."',
    inScope: ['Times ending in :00 or :30 only', 'Analog and digital clock reading', '"Half past" language'],
    outScope: ['Minutes other than 00 or 30 (Grade 2)', 'Elapsed time (Grade 3)', 'AM/PM distinctions'],
  },
  '1.MD.C.4': {
    desc: 'Organize and interpret data with up to three categories',
    example: 'How many more dogs than cats?',
    scope: 'Simple tally charts, picture graphs, or bar graphs with 2–3 categories. Ask/answer questions about total, most, least, and difference.',
    inScope: ['Up to 3 categories', 'How many total / most / least', 'How many more/fewer between two categories', 'Tally charts or simple picture graphs'],
    outScope: ['Scaled graphs (Grade 3)', 'More than 3 categories', 'Line plots'],
  },
  '1.G.A.1': {
    desc: 'Distinguish defining attributes of 2D/3D shapes',
    example: 'Which shape has 3 sides?',
    scope: 'Identifying shapes by their geometric attributes (sides, angles, faces) - not by color, size, or orientation. Triangles, squares, rectangles, circles, cubes, cones, cylinders, spheres.',
    inScope: ['Identifying shapes by number of sides/corners', 'Distinguishing defining vs. non-defining attributes', 'Both 2D and basic 3D shapes'],
    outScope: ['Composing shapes (1.G.A.2)', 'Partitioning (1.G.A.3)', 'Parallel/perpendicular (Grade 4)'],
  },
  '1.G.A.2': {
    desc: 'Compose 2D and 3D shapes to create a new shape',
    example: 'Two triangles make a ___?',
    scope: 'Putting shapes together to make a new shape (2 triangles → rectangle, 4 squares → larger square). Can also use 3D shapes.',
    inScope: ['Combining two or more shapes into a new shape', 'Naming the resulting composite shape', 'Visual/spatial reasoning'],
    outScope: ['Decomposing shapes (opposite direction)', 'Measuring or counting sides of result'],
  },
  '1.G.A.3': {
    desc: 'Partition circles and rectangles into halves and fourths',
    example: 'A circle is cut into 2 equal pieces. What is each called?',
    scope: 'Dividing circles and rectangles into 2 or 4 equal parts. Uses words: halves, fourths, quarters. Equal parts are the key concept.',
    inScope: ['Halves (2 equal parts) and fourths/quarters (4 equal parts)', 'Circles and rectangles only', 'Naming the parts (half, fourth, quarter)'],
    outScope: ['Thirds (Grade 2)', 'Fractions notation like 1/2 (Grade 3)', 'Other shapes'],
  },
  '2.OA.A.1': {
    desc: 'Add/subtract within 100 to solve one- and two-step word problems',
    example: 'Lena has 45 stickers. Gives away 18. How many left?',
    scope: 'Real-world problems that require one or two operations, with all values within 100. Two-step problems may combine two operations.',
    inScope: ['One-step add/subtract stories', 'Two-step stories (add then subtract, or two additions)', 'All values and answers within 0–100'],
    outScope: ['Pure computation with no context', 'Values > 100', 'Multiplication/division contexts'],
  },
  '2.OA.B.2': {
    desc: 'Fluently add and subtract within 20 from memory',
    example: 'What is 13 − 7?',
    scope: 'Instant recall - not counting on fingers. Both addition and subtraction facts where all values are 0–20.',
    inScope: ['Any add/subtract fact with operands and result ≤ 20', 'Expected to answer from memory', 'Includes related facts (if 7+8=15, then 15−7=8)'],
    outScope: ['Values > 20', 'Word problems', 'Strategy explanations'],
  },
  '2.OA.C.3': {
    desc: 'Determine if a group of objects is odd or even',
    example: 'Is 14 odd or even?',
    scope: 'Defining odd/even by whether objects can be paired up with none left over, or by checking if the ones digit is 0/2/4/6/8. Numbers up to 20.',
    inScope: ['Numbers 1–20', 'Even: can be paired or split into two equal groups', 'Odd: one object left when pairing', 'Writing equations like 2+2+2+2+2=10'],
    outScope: ['Numbers > 20 (not explicitly required)', 'Abstract rules without context', 'Division'],
  },
  '2.OA.C.4': {
    desc: 'Use addition to find total objects in arrays',
    example: 'A 3-row array, 4 per row. Total?',
    scope: 'Rectangular arrays up to 5×5. Students write an addition equation (3+3+3+3 = 12) to find the total. Lays groundwork for multiplication.',
    inScope: ['Arrays up to 5 rows × 5 columns', 'Writing repeated addition equations', 'Finding totals by adding rows or columns'],
    outScope: ['Using multiplication symbol (Grade 3)', 'Arrays > 5×5', 'Non-rectangular arrangements'],
  },
  '2.NBT.A.1': {
    desc: 'Understand 3-digit numbers as hundreds, tens, ones',
    example: 'What does the 4 represent in 347?',
    scope: 'Extending place value to three digits. 100 = 10 tens = 100 ones. Includes understanding multiples of 100 (100–900).',
    inScope: ['Place value of each digit in a 3-digit number', 'Decomposing: 347 = 3 hundreds + 4 tens + 7 ones', 'Multiples of 100 up to 900'],
    outScope: ['Four-digit numbers', 'Addition/subtraction with 3-digit numbers (2.NBT.B.7)', 'Comparing (2.NBT.A.4)'],
  },
  '2.NBT.A.2': {
    desc: 'Count within 1000; skip-count by 5s, 10s, 100s',
    example: 'Count by 10s from 120. What is the next number?',
    scope: 'Counting sequences within 1000, including skip-counting patterns by 5, 10, or 100 starting from any number.',
    inScope: ['Skip count by 5: 5, 10, 15… or 35, 40, 45…', 'Skip count by 10: 120, 130, 140…', 'Skip count by 100: 200, 300, 400…', 'Any starting point within 1000'],
    outScope: ['Skip count by other amounts', 'Numbers > 1000', 'Reading/writing numbers (2.NBT.A.3)'],
  },
  '2.NBT.A.3': {
    desc: 'Read and write numbers to 1,000 in multiple forms',
    example: 'Write "five hundred sixty-two" in standard form.',
    scope: 'Converting between standard form (562), word form (five hundred sixty-two), and expanded form (500 + 60 + 2) for numbers up to 1,000.',
    inScope: ['Standard ↔ word ↔ expanded form', 'Numbers 0–1000', 'Including numbers with zeros (e.g. 304)'],
    outScope: ['Numbers > 1000', 'Comparing numbers (2.NBT.A.4)', 'Operations'],
  },
  '2.NBT.A.4': {
    desc: 'Compare three-digit numbers using >, =, <',
    example: 'Which is less: 472 or 427?',
    scope: 'Comparing two 3-digit numbers using place value reasoning: compare hundreds first, then tens, then ones.',
    inScope: ['Any two 3-digit numbers', 'Using >, =, < symbols', 'Reasoning from hundreds → tens → ones'],
    outScope: ['Numbers > 999', 'Ordering more than two numbers', '4-digit numbers'],
  },
  '2.NBT.B.5': {
    desc: 'Fluently add and subtract within 100',
    example: 'What is 67 − 29?',
    scope: 'Accurate and efficient (not necessarily instant) computation within 100, using any valid strategy: algorithms, counting up, place value.',
    inScope: ['Any two 2-digit numbers', 'Results within 0–100', 'With or without regrouping', 'Any valid strategy'],
    outScope: ['Three-digit operands', 'Word problems (2.OA.A.1)', 'Mental-only requirement'],
  },
  '2.NBT.B.6': {
    desc: 'Add up to four two-digit numbers',
    example: 'What is 12 + 23 + 34 + 15?',
    scope: 'Adding 2, 3, or 4 two-digit numbers. Sum may exceed 100. Uses strategies like making tens or grouping.',
    inScope: ['2–4 addends, each two-digit', 'Sum can be > 100', 'Strategies: make 10, group by tens'],
    outScope: ['Five or more addends', 'Three-digit addends', 'Word problem context (2.OA.A.1)'],
  },
  '2.NBT.B.7': {
    desc: 'Add and subtract within 1,000 using strategies',
    example: 'A school has 345 boys and 478 girls. Total students?',
    scope: 'Extending addition/subtraction to three-digit numbers using concrete models, drawings, or strategies based on place value. Not required to be instant.',
    inScope: ['3-digit ± 3-digit (or 2-digit)', 'Strategies: base-ten blocks, open number line, place value decomposition', 'With regrouping (composing/decomposing hundreds)', 'Results within 0–1000'],
    outScope: ['Standard algorithm required (Grade 4)', 'Numbers > 1000', 'Four operations'],
  },
  '2.NBT.B.8': {
    desc: 'Mentally add or subtract 10 or 100 to/from any number',
    example: 'What is 100 more than 637?',
    scope: 'Mental math only. Adding or subtracting exactly 10 or exactly 100 from any three-digit number. Only the relevant place value digit changes.',
    inScope: ['±10 or ±100 from any 3-digit number', 'Mental calculation only', 'Crossing hundreds (e.g. 190 + 10 = 200)'],
    outScope: ['Adding other amounts', '4-digit numbers', 'Written computation'],
  },
  '2.NBT.B.9': {
    desc: 'Explain why addition/subtraction strategies work',
    example: 'Why does adding tens first make 354 + 200 easier?',
    scope: 'Conceptual understanding questions - students explain or justify a strategy using place value. Verbal or written explanations. Very hard to test with multiple choice alone.',
    inScope: ['Explaining why a strategy works', 'Using place value language in justification', 'Comparing efficiency of strategies'],
    outScope: ['Just computing the answer without explanation', 'Memorization of procedure'],
  },
  '2.MD.A.1': {
    desc: 'Measure length using appropriate tools',
    example: 'Measure this pencil to the nearest centimetre.',
    scope: 'Using rulers, yardsticks, metre sticks, or measuring tapes. Includes whole-number measurements in standard units (inches, feet, cm, metres).',
    inScope: ['Measuring to the nearest whole unit', 'Selecting the right tool for the job', 'Both metric and customary units', 'Results as whole numbers'],
    outScope: ['Fractional measurements (Grade 3)', 'Non-standard units (Grade 1)', 'Estimating without measuring (2.MD.A.3)'],
  },
  '2.MD.A.3': {
    desc: 'Estimate lengths using inches, feet, centimetres, metres',
    example: 'About how tall is a door? Metres or centimetres?',
    scope: 'Estimating - not measuring - using benchmarks. Also choosing between units (would you measure a room in cm or m?).',
    inScope: ['Choosing appropriate unit', 'Estimating using known benchmarks (e.g. a door is about 2 metres)', 'Reasonable vs. unreasonable estimates'],
    outScope: ['Actual measurement with a tool (2.MD.A.1)', 'Exact answers'],
  },
  '2.MD.B.5': {
    desc: 'Solve word problems involving length',
    example: 'A rope is 85 cm. Cut off 37 cm. How much left?',
    scope: 'Word problems that involve lengths - adding or subtracting. May include a number line diagram.',
    inScope: ['Add or subtract lengths given in same units', 'Word problem context', 'Number lines as representation', 'Results within measurable range'],
    outScope: ['Converting between units', 'Multiplying lengths', 'Area (Grade 3)'],
  },
  '2.MD.C.7': {
    desc: 'Tell and write time to the nearest 5 minutes',
    example: 'The clock shows 2:45. What time is it?',
    scope: 'Reading analog and digital clocks to the nearest 5-minute mark. Includes AM/PM. Extends Grade 1 skill to 5-minute intervals.',
    inScope: ['Times at :00 :05 :10 :15 :20 :25 :30 :35 :40 :45 :50 :55', 'Analog and digital', 'AM/PM awareness'],
    outScope: ['Individual minutes (Grade 3)', 'Elapsed time (Grade 3)', 'Seconds'],
  },
  '2.MD.C.8': {
    desc: 'Solve word problems with coins and bills',
    example: 'If you have 3 quarters and 2 dimes, how many cents?',
    scope: 'Using dollar and cent notation. Adding combinations of coins and bills. Making change. All within realistic amounts.',
    inScope: ['Pennies (1¢), nickels (5¢), dimes (10¢), quarters (25¢)', 'Dollar bills ($1, $5, $10)', 'Dollar sign and decimal notation ($X.XX)', 'Making change or finding total'],
    outScope: ['Large dollar amounts beyond everyday context', 'Multiplication of coins', 'Percent'],
  },
  '2.MD.D.9': {
    desc: 'Generate measurement data; show on a line plot',
    example: 'Which length appears most often on the line plot?',
    scope: 'Measuring several objects and displaying the data as a line plot (each X = one data point). Then answer questions about the data.',
    inScope: ['Whole-number measurements', 'Line plots with X marks', 'Questions: most frequent, how many total, how many more/fewer'],
    outScope: ['Fractional measurements on line plots (Grade 3)', 'Bar graphs (2.MD.D.10)', 'Statistical measures like mean'],
  },
  '2.MD.D.10': {
    desc: 'Draw and interpret picture/bar graphs',
    example: 'How many more students prefer pizza than tacos?',
    scope: 'Graphs with up to 4 categories. Each picture or bar unit = 1. Ask/answer questions about totals and differences.',
    inScope: ['Up to 4 categories', 'Scale of 1 per unit', 'Total / most / least / how many more questions', 'Creating and reading both picture and bar graphs'],
    outScope: ['Scaled graphs (each unit > 1, that is Grade 3)', 'Line plots (2.MD.D.9)', 'More than 4 categories'],
  },
  '2.G.A.1': {
    desc: 'Recognize and draw shapes with specified attributes',
    example: 'Which shape has 4 equal sides?',
    scope: 'Identifying and drawing triangles, quadrilaterals, pentagons, hexagons, and cubes by their attributes (number of sides, angles, faces). Includes recognizing these regardless of size or orientation.',
    inScope: ['Triangles (3 sides), quadrilaterals (4), pentagons (5), hexagons (6)', 'Drawing from attribute description', 'Any size or orientation'],
    outScope: ['Classifying quadrilateral subtypes (Grade 4)', 'Parallel/perpendicular (Grade 4)', '3D shapes beyond cubes'],
  },
  '2.G.A.2': {
    desc: 'Partition a rectangle into rows and columns of same-size squares',
    example: 'A 3×4 rectangle - how many unit squares?',
    scope: 'Dividing a rectangle into a grid of equal unit squares by drawing rows and columns. Count the total squares. Foundation for area.',
    inScope: ['Rectangles partitioned into equal unit squares', 'Counting total squares in a grid', 'Arrays of squares (rows × columns)'],
    outScope: ['Using the area formula (Grade 3)', 'Non-rectangular shapes', 'Triangles or circles'],
  },
  '2.G.A.3': {
    desc: 'Partition circles/rectangles into halves, thirds, fourths',
    example: 'A pizza cut into 4 equal slices. One slice is what fraction?',
    scope: 'Extends Grade 1 halves/fourths to include thirds. Equal parts are required. Uses fraction names: third, half, quarter/fourth.',
    inScope: ['Halves (2 equal parts), thirds (3 equal parts), fourths (4 equal parts)', 'Circles and rectangles', 'Fraction vocabulary: half, third, fourth, quarter', 'Naming one part as a fraction (1/2, 1/3, 1/4)'],
    outScope: ['Fractions > 1', 'Equivalent fractions (Grade 3)', 'Other denominators', 'Other shapes'],
  },
  '3.OA.A.1': {
    desc: 'Interpret products as equal groups',
    example: '4 bags with 6 apples each. How many total?',
    scope: 'Understanding multiplication as combining equal groups. 4 × 6 means 4 groups of 6. Students interpret the meaning, not just compute.',
    inScope: ['Equal-groups context (bags, rows, boxes)', 'Interpreting a × b as a groups of b', 'Products within 100', 'Both computing and interpreting'],
    outScope: ['Repeated addition without equal-groups context', 'Division', 'Arrays (partially 3.OA.A.3)', 'Products > 100'],
  },
  '3.OA.A.2': {
    desc: 'Interpret quotients as sharing or grouping',
    example: '24 cookies shared among 6 children. How many each?',
    scope: 'Division as equal sharing (how many each?) or measurement/grouping (how many groups?). Both division situations within 100.',
    inScope: ['Partitive division (sharing): 24 ÷ 6 = 4 each', 'Measurement division (grouping): how many groups of 6 in 24?', 'Dividends and quotients within 100'],
    outScope: ['Remainders (Grade 4)', 'Multiplication', 'Values > 100'],
  },
  '3.OA.A.3': {
    desc: 'Multiply/divide within 100 to solve word problems',
    example: 'Each box holds 8 crayons. 7 boxes = how many crayons?',
    scope: 'Using multiplication and division to solve equal-groups, arrays, and compare word problems. All within 100.',
    inScope: ['Equal groups, arrays, area, compare situations', 'Both × and ÷', 'Products and dividends within 100', 'Unknown in any position'],
    outScope: ['Two-step problems (3.OA.D.8)', 'Values > 100', 'Remainders'],
  },
  '3.OA.A.4': {
    desc: 'Find the unknown in a multiplication/division equation',
    example: 'What number makes 6 × ___ = 42?',
    scope: 'Solving for the unknown in a × b = c or a ÷ b = c where all values are within 100. Unknown can be any position.',
    inScope: ['___ × b = c', 'a × ___ = c', 'a ÷ ___ = c', '___ ÷ b = c', 'All values within 100'],
    outScope: ['Two-step equations', 'Values > 100', 'Remainders'],
  },
  '3.OA.B.5': {
    desc: 'Apply properties of multiplication',
    example: 'If 4 × 7 = 28, what is 7 × 4?',
    scope: 'Commutative (a×b = b×a), associative ((a×b)×c = a×(b×c)), and distributive (a×(b+c) = a×b + a×c) properties. Students apply - not name - them.',
    inScope: ['Commutative: 4×7 = 7×4', 'Associative: (2×3)×4 = 2×(3×4)', 'Distributive: 6×7 = 6×(5+2) = 30+12', 'Using properties to find unknown products'],
    outScope: ['Naming properties by term', 'Division properties', 'Values > 100'],
  },
  '3.OA.B.6': {
    desc: 'Understand division as an unknown-factor problem',
    example: '42 ÷ 6 = ___. What times 6 equals 42?',
    scope: 'Division is equivalent to finding the missing factor. 42 ÷ 6 = ? is the same as ? × 6 = 42. Connects multiplication and division.',
    inScope: ['Rewriting division as a missing-factor multiplication', 'Using multiplication facts to solve division', 'Within 100'],
    outScope: ['Long division algorithm', 'Remainders', 'Two-step problems'],
  },
  '3.OA.C.7': {
    desc: 'Fluently multiply and divide within 100',
    example: 'What is 7 × 8?',
    scope: 'Automatic recall of all multiplication facts 1–10 × 1–10 and corresponding division facts. This is pure fluency - speed and accuracy.',
    inScope: ['All single-digit × single-digit facts (1×1 through 10×10)', 'Corresponding division (56 ÷ 7 = 8)', 'Expected from memory or near-instant strategy'],
    outScope: ['Multi-digit multiplication (Grade 4)', 'Word problems (3.OA.A.3)', 'Two-digit × two-digit'],
  },
  '3.OA.D.8': {
    desc: 'Solve two-step word problems using four operations',
    example: 'Baker made 48 muffins, sold 15, packs rest in 3s. Boxes?',
    scope: 'Problems requiring exactly two operations (+, −, ×, ÷ in any combination). All values within reasonable range. May include interpreting remainders.',
    inScope: ['Two-step problems with any combination of +/−/×/÷', 'Interpreting remainder in context', 'Writing equations with a letter for the unknown'],
    outScope: ['One-step problems', 'Three or more operations', 'Values far beyond grade-level range'],
  },
  '3.OA.D.9': {
    desc: 'Identify arithmetic patterns and explain them',
    example: 'What pattern do you see in the multiples of 4?',
    scope: 'Noticing patterns in addition/multiplication tables (e.g. all even × even = even, multiples of 5 end in 0 or 5). Explaining WHY the pattern exists.',
    inScope: ['Patterns in addition tables', 'Patterns in multiplication tables', 'Even/odd rules', 'Explaining the rule'],
    outScope: ['Geometric patterns (Grade 4)', 'Just listing multiples without pattern observation', 'Algebra notation'],
  },
  '3.NBT.A.1': {
    desc: 'Round whole numbers to nearest 10 or 100',
    example: 'Round 374 to the nearest 10.',
    scope: 'Rounding any whole number to the nearest 10 or nearest 100. Uses number line or place value reasoning. Applies standard rounding rules (5 rounds up).',
    inScope: ['Any whole number rounded to nearest 10', 'Any whole number rounded to nearest 100', 'Numbers up to 999', 'Standard rounding convention'],
    outScope: ['Rounding to nearest 1000 (Grade 4)', 'Rounding decimals', 'Estimation in context (use 3.OA.D.8)'],
  },
  '3.NBT.A.2': {
    desc: 'Fluently add and subtract within 1,000',
    example: 'What is 856 − 478?',
    scope: 'Efficient, accurate computation within 1000 using strategies or algorithms. Includes regrouping across hundreds.',
    inScope: ['3-digit ± 3-digit', 'With regrouping', 'Standard algorithm or any valid strategy', 'Results 0–1000'],
    outScope: ['Numbers > 1000 (Grade 4)', 'Word problems (3.OA.D.8)', 'Multiplication/division'],
  },
  '3.NBT.A.3': {
    desc: 'Multiply one-digit numbers by multiples of 10',
    example: 'What is 7 × 60?',
    scope: 'Multiplying any 1-digit number by any multiple of 10 (10, 20, 30, … 90). Uses place value and basic facts: 7 × 6 = 42, so 7 × 60 = 420.',
    inScope: ['1-digit × multiple of 10 (10–90)', 'Products up to 900', 'Using basic fact × 10 strategy'],
    outScope: ['Two-digit × two-digit (Grade 4)', 'Multiples of 100 or 1000', 'Non-multiples of 10'],
  },
  '3.NF.A.1': {
    desc: 'Understand a fraction as one part of a whole',
    example: 'A pie cut into 8 equal slices. What fraction is 3 slices?',
    scope: 'Fractions as b equal parts of a whole; a/b means a of those parts. Denominators 2, 3, 4, 6, 8. Includes fractions equal to a whole.',
    inScope: ['Denominators: 2, 3, 4, 6, 8 only', 'Unit fractions (1/b) and non-unit fractions (a/b)', 'Fractions of a shape or set', 'Fractions equivalent to 1 (e.g. 4/4)'],
    outScope: ['Denominators not in {2,3,4,6,8}', 'Mixed numbers (Grade 4)', 'Operations on fractions (Grade 4–5)', 'Decimals'],
  },
  '3.NF.A.2': {
    desc: 'Represent fractions on a number line',
    example: 'What fraction is halfway between 0 and 1?',
    scope: 'Placing fractions on a number line from 0 to 1 (or beyond). Unit fractions first, then other fractions. Denominators 2, 3, 4, 6, 8.',
    inScope: ['Number lines from 0 to 1', 'Partitioning a number line into b equal parts', 'Locating a/b', 'Denominators 2, 3, 4, 6, 8'],
    outScope: ['Fractions > 1 on a number line (Grade 4)', 'Decimals on number lines', 'Other denominators'],
  },
  '3.NF.A.3': {
    desc: 'Explain equivalence; compare fractions',
    example: 'Which is greater: 3/4 or 3/8?',
    scope: 'Equivalent fractions (2/4 = 1/2), whole numbers as fractions (3 = 3/1 = 6/2), and comparing fractions with same numerator or denominator.',
    inScope: ['Equivalent fractions with same denominator/numerator', 'Recognizing 1 = b/b, n = n/1', 'Comparing fractions using >, =, <', 'Denominators 2, 3, 4, 6, 8'],
    outScope: ['Adding/subtracting fractions (Grade 4)', 'Unlike denominators comparison strategy (Grade 4)', 'Mixed numbers'],
  },
  '3.MD.A.1': {
    desc: 'Tell time to nearest minute; solve elapsed time problems',
    example: 'Movie starts 2:15, ends 3:50. How long is it?',
    scope: 'Reading clocks to the minute. Computing elapsed time in hours and minutes. May use number lines to count up.',
    inScope: ['Clock reading to exact minute', 'Elapsed time: how long from A to B?', 'AM/PM', 'Number line strategy for elapsed time'],
    outScope: ['Seconds', 'Calendar time (days/weeks)', 'Time zones'],
  },
  '3.MD.A.2': {
    desc: 'Measure and estimate liquid volumes and masses',
    example: 'A bottle holds about 1 ___ of water. Litre or millilitre?',
    scope: 'Using grams, kilograms, litres, millilitres. Adding, subtracting, multiplying, or dividing these measurements. Estimation questions included.',
    inScope: ['Grams (g), kilograms (kg)', 'Litres (L), millilitres (mL)', 'Choosing appropriate unit', 'Solving word problems with these measurements'],
    outScope: ['Ounces, pounds, cups, pints, quarts (customary - not in CCSS 3.MD.A.2)', 'Converting between units (Grade 4)', 'Length/area'],
  },
  '3.MD.B.3': {
    desc: 'Draw and interpret scaled picture/bar graphs',
    example: 'How many more students chose blue than red?',
    scope: 'Graphs where each symbol or bar unit represents more than 1 (e.g. each picture = 5). Students both read and create scaled graphs.',
    inScope: ['Scale > 1 per unit (e.g. each star = 5 students)', 'Reading scaled graphs', 'Total / most / least / difference questions', 'Drawing a graph from data'],
    outScope: ['Scale of 1 (Grade 2)', 'Line plots (3.MD.B.4)', 'More than about 6 categories'],
  },
  '3.MD.C.5': {
    desc: 'Recognize area as an attribute of plane figures',
    example: 'What is the area of a shape covering 12 unit squares?',
    scope: 'Conceptual intro to area: it\'s the number of same-size unit squares needed to cover a plane figure without gaps or overlaps.',
    inScope: ['Defining area as square unit count', 'Identifying that area measures 2D surfaces', 'Standard and non-standard unit squares'],
    outScope: ['Computing area with a formula (3.MD.C.7)', 'Perimeter (3.MD.D.8)', '3D volume'],
  },
  '3.MD.C.6': {
    desc: 'Measure area by counting unit squares',
    example: 'Count the unit squares. What is the area?',
    scope: 'Finding area by counting all unit squares in a shape (may include partial squares for irregular shapes). Result in square units.',
    inScope: ['Counting whole unit squares', 'Any polygon that can be covered by unit squares', 'Answer in square units'],
    outScope: ['Using a formula (3.MD.C.7)', 'Fractional unit squares', 'Perimeter'],
  },
  '3.MD.C.7': {
    desc: 'Relate area to multiplication and addition',
    example: 'A 4×6 rectangle - what is its area?',
    scope: 'Area of a rectangle = length × width. Also: find area of L-shaped figures by decomposing into rectangles and adding. Connects to distributive property.',
    inScope: ['Area = l × w for rectangles', 'Decomposing irregular shapes into rectangles', 'Distributive property connection: (a+b)×c = a×c + b×c', 'Results as square units'],
    outScope: ['Perimeter (3.MD.D.8)', 'Triangles or circles (Grade 6)', 'Fractions as dimensions (Grade 5)'],
  },
  '3.MD.D.8': {
    desc: 'Solve problems involving perimeters of polygons',
    example: 'A 6cm × 4cm rectangle. Perimeter?',
    scope: 'Perimeter = total distance around. Finding perimeter given side lengths, finding an unknown side given perimeter, and distinguishing perimeter from area.',
    inScope: ['Perimeter by adding all sides', 'Finding an unknown side when perimeter is given', 'Any polygon (not just rectangles)', 'Distinguishing perimeter from area'],
    outScope: ['Area (3.MD.C.7)', 'Circles (circumference - middle school)', 'Formulas not yet required'],
  },
  '3.G.A.1': {
    desc: 'Understand shapes share attributes (e.g., all quadrilaterals)',
    example: 'What do all quadrilaterals have in common?',
    scope: 'Understanding shape hierarchies: rhombuses, rectangles, and squares are all special quadrilaterals. Categorizing by shared attributes.',
    inScope: ['Quadrilaterals and their subcategories', 'Shared attributes define broader categories', 'Rhombus, rectangle, square as quadrilaterals'],
    outScope: ['Parallel/perpendicular classification (Grade 4)', 'Triangles subtypes', 'Formal hierarchy diagram (Grade 5)'],
  },
  '3.G.A.2': {
    desc: 'Partition shapes into parts with equal areas',
    example: 'Divide a rectangle into 6 equal parts. Each part is what fraction?',
    scope: 'Dividing shapes into equal-area parts and expressing each part as a unit fraction. Area of each part = total area ÷ number of parts.',
    inScope: ['Partitioning into 2, 3, 4, 6, 8 equal parts', 'Naming each part as 1/b', 'Different partition methods yield equal-area parts'],
    outScope: ['Non-equal partitions', 'Complex fractions', 'Computing actual area values'],
  },
  '4.OA.A.1': {
    desc: 'Interpret a multiplication equation as a comparison',
    example: '35 is 5 times as many as what number?',
    scope: 'Multiplicative comparison: "A is n times as many as B" ↔ A = n × B. Different from additive comparison ("A is 5 more than B").',
    inScope: ['"X times as many/much as" language', 'Writing a × b = c from a comparison statement', 'Identifying the multiplier and the referent'],
    outScope: ['Additive comparisons (that is subtraction)', 'Two-step problems (4.OA.A.2)', 'Fractions as multipliers'],
  },
  '4.OA.A.2': {
    desc: 'Multiply or divide to solve comparison word problems',
    example: 'Ahmed is 3 times as old as his sister who is 7. How old is Ahmed?',
    scope: 'Real-world multiplicative comparison problems. Unknown can be the product, the multiplier, or the referent.',
    inScope: ['Multiplicative comparison stories', 'Unknown in any position (product, factor, referent)', 'Using × and ÷ to solve'],
    outScope: ['Additive comparisons', 'Two-step problems (4.OA.A.3)', 'Fractions/decimals as values'],
  },
  '4.OA.A.3': {
    desc: 'Solve multi-step word problems; interpret remainders',
    example: '250 pencils for 38 students. How many extras?',
    scope: 'Multi-step problems using any of the four operations. Crucially includes interpreting remainders: do you round up, round down, or report the remainder?',
    inScope: ['Multi-step problems with any operations', 'Remainder interpretation: round up (buses), round down (full bags), or use remainder (leftovers)', 'Estimating to check reasonableness'],
    outScope: ['One-step problems', 'Fractions/decimals as answers (unless contextually appropriate)', 'Pure computation'],
  },
  '4.OA.B.4': {
    desc: 'Find factor pairs; identify prime and composite numbers',
    example: 'Is 37 prime or composite?',
    scope: 'For any number 1–100: list all factor pairs, identify as prime (exactly 2 factors: 1 and itself) or composite (more than 2 factors). 1 is neither.',
    inScope: ['Factor pairs for numbers 1–100', 'Prime numbers ≤ 100', 'Composite numbers ≤ 100', '1 is neither prime nor composite'],
    outScope: ['Prime factorization (Grade 6)', 'Greatest common factor (Grade 6)', 'Numbers > 100'],
  },
  '4.OA.C.5': {
    desc: 'Generate a number or shape pattern following a rule',
    example: 'Rule: multiply by 3. Start at 2. List next 4 terms.',
    scope: 'Continuing or generating a pattern given a rule. Also identifying features of the pattern not stated in the rule (e.g. even/odd alternation).',
    inScope: ['Arithmetic sequences (add n each time)', 'Geometric sequences (multiply by n)', 'Shape pattern sequences', 'Features not explicit in the rule (e.g. all even)'],
    outScope: ['Writing rules algebraically (Grade 6)', 'Two-variable patterns (Grade 5)', 'Quadratic or exponential patterns'],
  },
  '4.NBT.A.1': {
    desc: 'Recognize 10× relationships between adjacent place values',
    example: 'The digit 4 in 40,000 is how many times the value of 4 in 4,000?',
    scope: 'Place value understanding: each position is 10× the one to its right. Applies to multi-digit numbers through at least millions.',
    inScope: ['Comparing value of same digit in different positions', '10× relationship between adjacent places', 'Numbers up to millions'],
    outScope: ['Rounding (4.NBT.A.3)', 'Decimal place value (5.NBT.A.1)', 'Scientific notation'],
  },
  '4.NBT.A.2': {
    desc: 'Read and write multi-digit whole numbers in multiple forms',
    example: 'What is the value of the 6 in 364,891?',
    scope: 'Standard, word, and expanded form for numbers up to 1,000,000. Comparing multi-digit numbers.',
    inScope: ['Standard ↔ word ↔ expanded form', 'Numbers up to 1,000,000', 'Comparing with >, =, <'],
    outScope: ['Numbers > 1,000,000', 'Decimals', 'Rounding (4.NBT.A.3)'],
  },
  '4.NBT.A.3': {
    desc: 'Round multi-digit whole numbers to any place',
    example: 'Round 47,382 to the nearest thousand.',
    scope: 'Rounding to any specified place value: tens, hundreds, thousands, ten-thousands, hundred-thousands. Standard rounding rules apply.',
    inScope: ['Rounding to any place up to hundred-thousands', 'Numbers up to 1,000,000', 'Standard rounding (5 rounds up)'],
    outScope: ['Rounding decimals (5.NBT.A.4)', 'Estimation in context (4.OA.A.3)', 'Numbers > 1,000,000'],
  },
  '4.NBT.B.4': {
    desc: 'Fluently add and subtract multi-digit whole numbers',
    example: 'What is 56,281 + 34,769?',
    scope: 'Standard algorithm for addition and subtraction of numbers with any number of digits. Fluency expected.',
    inScope: ['Any multi-digit addition or subtraction', 'Standard algorithm', 'With regrouping', 'Numbers up to and including millions'],
    outScope: ['Multiplication (4.NBT.B.5)', 'Division (4.NBT.B.6)', 'Decimals (5.NBT.B.7)'],
  },
  '4.NBT.B.5': {
    desc: 'Multiply up to 4-digit by 1-digit; two 2-digit numbers',
    example: 'What is 47 × 23?',
    scope: 'Multiplication: up to 4-digit × 1-digit, and 2-digit × 2-digit. Using place value, area models, or standard algorithm.',
    inScope: ['4-digit × 1-digit (e.g. 3,421 × 6)', '2-digit × 2-digit (e.g. 47 × 23)', 'Area model, partial products, or standard algorithm'],
    outScope: ['3-digit × 2-digit (Grade 5)', '4-digit × 2-digit (Grade 5)', 'Decimals'],
  },
  '4.NBT.B.6': {
    desc: 'Find whole-number quotients and remainders',
    example: 'What is 6,372 ÷ 4?',
    scope: 'Division with up to 4-digit dividends and 1-digit divisors. Remainders are possible and expected. Strategies or algorithm accepted.',
    inScope: ['Up to 4-digit ÷ 1-digit', 'With or without remainder', 'Strategies: place value, area model, or standard algorithm'],
    outScope: ['2-digit divisors (Grade 5)', 'Decimal quotients (Grade 5)', 'Division of fractions'],
  },
  '4.NF.A.1': {
    desc: 'Explain and generate equivalent fractions',
    example: 'What fraction equals 2/3 with denominator 12?',
    scope: 'Fractions are equivalent when they represent the same point on a number line. Generate by multiplying or dividing numerator and denominator by the same non-zero number.',
    inScope: ['Multiplying/dividing both parts by same number', 'Visual models (fraction strips, number lines)', 'Denominators within realistic range', 'Recognizing a/b = (n×a)/(n×b)'],
    outScope: ['Adding fractions (4.NF.B.3)', 'Simplifying to lowest terms (not explicitly required until Grade 5)', 'Mixed numbers'],
  },
  '4.NF.A.2': {
    desc: 'Compare fractions with different numerators/denominators',
    example: 'Which is greater: 5/8 or 3/5?',
    scope: 'Comparing fractions by finding common denominators or numerators, or using benchmark fractions (0, 1/2, 1). Justify with symbols >, =, <.',
    inScope: ['Fractions with different numerators AND denominators', 'Common denominator strategy', 'Benchmark comparison (vs. 1/2 or 1)', 'Using >, =, < with justification'],
    outScope: ['Adding/subtracting fractions', 'Mixed numbers comparison', 'Decimals'],
  },
  '4.NF.B.3': {
    desc: 'Add and subtract fractions and mixed numbers (like denominators)',
    example: 'What is 2/5 + 4/5?',
    scope: 'Adding and subtracting fractions and mixed numbers ONLY when denominators are identical. Includes decomposing a fraction into a sum of fractions.',
    inScope: ['Same denominator only', 'Proper fractions, improper fractions, mixed numbers', 'Decomposing fractions: 3/8 = 1/8 + 1/8 + 1/8', 'Regrouping mixed numbers (e.g. borrowing)'],
    outScope: ['Unlike denominators (Grade 5)', 'Multiplication of fractions (4.NF.B.4)', 'Decimals'],
  },
  '4.NF.B.4': {
    desc: 'Multiply fractions by whole numbers',
    example: 'What is 3 × 2/5?',
    scope: 'Multiplying a fraction by a whole number. Interpreted as repeated addition: 3 × 2/5 = 2/5 + 2/5 + 2/5. Includes word problems.',
    inScope: ['Whole number × fraction', 'Result may be improper fraction or mixed number', 'Word problem context', 'Denominators in practical range'],
    outScope: ['Fraction × fraction (Grade 5)', 'Mixed number × whole number (Grade 5)', 'Division of fractions'],
  },
  '4.NF.C.5': {
    desc: 'Express fractions with denominator 10 as hundredths',
    example: 'Write 3/10 as hundredths.',
    scope: 'Bridging fractions and decimals: 3/10 = 30/100. Also adding tenths and hundredths: 3/10 + 4/100 = 34/100.',
    inScope: ['Converting x/10 to xx/100', 'Adding a tenth and hundredths fraction', 'Denominator 10 and 100 only'],
    outScope: ['Other denominators', 'Decimal notation (4.NF.C.6)', 'Comparing decimals (4.NF.C.7)'],
  },
  '4.NF.C.6': {
    desc: 'Use decimal notation for fractions with denominators 10 or 100',
    example: 'Write 7/10 as a decimal.',
    scope: 'Converting fractions with denominators 10 or 100 to decimal notation (and vice versa). Locating these on a number line.',
    inScope: ['x/10 ↔ 0.x', 'xx/100 ↔ 0.xx', 'Locating on a number line', 'Reading/writing tenths and hundredths decimals'],
    outScope: ['Thousandths (Grade 5)', 'Arithmetic with decimals (5.NBT.B.7)', 'Percentages'],
  },
  '4.NF.C.7': {
    desc: 'Compare two decimals to hundredths',
    example: 'Which is greater: 0.45 or 0.405?',
    scope: 'Comparing decimals to the hundredths place using place value reasoning. Using >, =, < and justifying with models or number lines.',
    inScope: ['Tenths vs. tenths, hundredths vs. hundredths, tenths vs. hundredths', 'Using >, =, < with justification', 'Number line or grid model'],
    outScope: ['Thousandths (Grade 5)', 'Ordering more than two decimals', 'Operations on decimals'],
  },
  '4.MD.A.1': {
    desc: 'Know relative sizes of measurement units; convert within a system',
    example: 'How many centimetres in 3 metres?',
    scope: 'Knowing unit relationships (km, m, cm; kg, g; L, mL; mile, yard, foot, inch; lb, oz; gal, qt, pt, cup, fl oz) and converting within the same system.',
    inScope: ['Metric: km↔m, m↔cm, kg↔g, L↔mL', 'Customary: mi↔yd↔ft↔in, lb↔oz, gal↔qt↔pt↔cup', 'Converting to smaller or larger units', 'Multi-step conversion word problems'],
    outScope: ['Metric ↔ customary conversion (not in CCSS)', 'Temperature', 'Area/volume units'],
  },
  '4.MD.A.3': {
    desc: 'Apply area and perimeter formulas for rectangles',
    example: 'A garden is 12 m × 8 m. What is its area?',
    scope: 'Using A = l × w and P = 2(l + w) for rectangles in real-world problems. Finding unknown dimensions given area or perimeter.',
    inScope: ['A = l × w', 'P = 2l + 2w or 2(l + w)', 'Finding unknown side from area or perimeter', 'Real-world rectangle problems'],
    outScope: ['Non-rectangular shapes', 'Fractions as dimensions (Grade 5)', 'Volume (Grade 5)'],
  },
  '4.MD.B.4': {
    desc: 'Make a line plot to display data in fractions of a unit',
    example: 'Which measurement appears most on the line plot?',
    scope: 'Line plots with measurements in halves, quarters, or eighths of a unit. Answering questions using addition/subtraction of fractions.',
    inScope: ['Line plots with ½, ¼, ⅛ increments', 'Creating a line plot from a data set', 'Adding or subtracting fractions to answer questions'],
    outScope: ['Non-fractional line plots (Grade 2–3)', 'Bar graphs', 'Statistical measures'],
  },
  '4.MD.C.5': {
    desc: 'Recognize angles as geometric shapes; understand degrees',
    example: 'An angle that measures 90° is called a ___ angle.',
    scope: 'Angles are formed by two rays with a common endpoint. A circle is 360°. Types: acute (<90°), right (=90°), obtuse (90°–180°), straight (=180°).',
    inScope: ['Angle vocabulary: acute, right, obtuse, straight', 'Circle = 360°', 'Recognizing angle types by measure', 'Rays and vertex definition'],
    outScope: ['Measuring with a protractor (4.MD.C.6)', 'Calculating unknown angles (4.MD.C.7)', 'Reflex angles (>180°)'],
  },
  '4.MD.C.6': {
    desc: 'Measure angles in whole-number degrees using a protractor',
    example: 'What type of angle is 135°?',
    scope: 'Using a protractor to measure or draw angles. Results in whole-number degrees. Includes choosing the correct scale on the protractor.',
    inScope: ['Reading a protractor to the nearest degree', 'Drawing an angle of given measure', 'Whole-number degree results'],
    outScope: ['Decimal degrees', 'Angle addition (4.MD.C.7)', 'Angles in polygons'],
  },
  '4.MD.C.7': {
    desc: 'Recognize angle measure as additive',
    example: 'A 120° angle is split into two. One is 45°. What is the other?',
    scope: 'When an angle is divided into non-overlapping parts, the whole equals the sum of the parts. Solve for unknown angles using addition/subtraction.',
    inScope: ['Angle addition: part + part = whole', 'Finding unknown angle given the whole and one part', 'Real-world contexts (corner of a room, folded paper)'],
    outScope: ['Complementary/supplementary angle terminology (Grade 7)', 'Multiple unknown angles', 'Protractor use (4.MD.C.6)'],
  },
  '4.G.A.1': {
    desc: 'Draw points, lines, line segments, rays, angles',
    example: 'How many endpoints does a line segment have?',
    scope: 'Definitions and drawings of basic geometric figures: point, line, line segment, ray, angle (right, acute, obtuse), perpendicular lines, parallel lines.',
    inScope: ['Point, line, line segment, ray', 'Right/acute/obtuse angle identification', 'Perpendicular lines (meet at 90°)', 'Parallel lines (never intersect)'],
    outScope: ['Transversals (Grade 8)', 'Angle measures (4.MD.C.5–7)', '3D figures'],
  },
  '4.G.A.2': {
    desc: 'Classify 2D figures based on parallel/perpendicular lines and angles',
    example: 'Which shape always has two pairs of parallel sides?',
    scope: 'Classifying triangles (right, acute, obtuse) and quadrilaterals (trapezoid, parallelogram, rectangle, rhombus, square) by their line and angle properties.',
    inScope: ['Triangle types: right, acute, obtuse', 'Quadrilateral hierarchy: trapezoid, parallelogram, rectangle, rhombus, square', 'Parallel and perpendicular sides as criteria'],
    outScope: ['Pentagons and hexagons (2.G.A.1)', 'Formal proofs', 'Coordinate geometry (Grade 5)'],
  },
  '4.G.A.3': {
    desc: 'Recognize a line of symmetry for a 2D figure',
    example: 'How many lines of symmetry does a square have?',
    scope: 'A line of symmetry divides a shape into two mirror-image halves. Identifying all lines of symmetry for a given shape, or deciding if a line IS a line of symmetry.',
    inScope: ['Folding test: does the shape fold onto itself?', 'Counting lines of symmetry', 'Identifying whether a given line is a line of symmetry', 'Common shapes: squares (4), rectangles (2), equilateral triangles (3), circles (infinite)'],
    outScope: ['Rotational symmetry (not in Grade 4 CCSS)', 'Creating symmetric designs', 'Coordinate plane reflection'],
  },
  '5.OA.A.1': {
    desc: 'Evaluate expressions with parentheses, brackets, braces',
    example: 'What is (3 + 4) × 2 − 5?',
    scope: 'Order of operations with nested grouping symbols: innermost first, then work outward. Parentheses (), brackets [], braces {}.',
    inScope: ['Order of operations with grouping symbols', 'Nested: {[( )]}', 'All four operations inside groupings', 'Whole numbers'],
    outScope: ['Exponents (Grade 6)', 'Variables (Grade 6)', 'Fractions or decimals inside expressions (advanced)'],
  },
  '5.OA.A.2': {
    desc: 'Write simple expressions that record calculations',
    example: 'Write an expression: subtract 4 from the product of 5 and 3.',
    scope: 'Translating word descriptions into numerical expressions - NOT evaluating them. Interpreting what an expression represents.',
    inScope: ['Writing expressions from verbal descriptions', 'Interpreting what an expression means in context', 'Using grouping symbols correctly in an expression'],
    outScope: ['Evaluating (computing) the expression (5.OA.A.1)', 'Variables (Grade 6)', 'Equations (has = sign)'],
  },
  '5.OA.B.3': {
    desc: 'Generate two numerical patterns using two given rules',
    example: 'Rule A: add 2. Rule B: add 4. Start both at 0. List 5 terms each.',
    scope: 'Creating two separate sequences, graphing corresponding terms as ordered pairs in the first quadrant, and identifying the relationship between the two sequences.',
    inScope: ['Two simultaneous sequences with different rules', 'Forming ordered pairs (termA, termB)', 'Graphing in first quadrant', 'Identifying relationship (e.g. terms of B are always 2× terms of A)'],
    outScope: ['One sequence only (4.OA.C.5)', 'Negative coordinates', 'Algebraic equations'],
  },
  '5.NBT.A.1': {
    desc: 'Understand 10× place value relationships',
    example: 'The digit 4 in 3,400 is how many times the value in 340?',
    scope: 'Extends Grade 4: each place is 10× the place to its right, including decimals (tenths, hundredths, thousandths).',
    inScope: ['Whole number place values up to billions', 'Decimal places: tenths, hundredths, thousandths', '10× and 1/10× relationships between adjacent places'],
    outScope: ['Scientific notation', 'Negative exponents', 'Beyond thousandths'],
  },
  '5.NBT.A.2': {
    desc: 'Explain patterns when multiplying/dividing by powers of 10',
    example: 'What is 4.5 × 10²?',
    scope: 'Multiplying by 10ⁿ shifts the decimal point n places right; dividing shifts n places left. Uses exponent notation for powers of 10.',
    inScope: ['Multiplying/dividing decimals by 10¹, 10², 10³', 'Decimal point shifts', 'Whole numbers and decimals as operands', 'Explaining the pattern'],
    outScope: ['Negative exponents (÷ 10ⁿ as 10⁻ⁿ - middle school)', 'Non-powers-of-10 multipliers', 'Scientific notation format'],
  },
  '5.NBT.A.3': {
    desc: 'Read, write, and compare decimals to thousandths',
    example: 'Which is greater: 0.45 or 0.405?',
    scope: 'Standard, word, and expanded form for decimals to thousandths. Comparing using >, =, <.',
    inScope: ['Tenths, hundredths, thousandths', 'Expanded form: 3 × 1 + 2 × (1/10) + 5 × (1/100)', 'Word form: "three and twenty-five thousandths"', 'Comparing decimals using >, =, <'],
    outScope: ['Beyond thousandths', 'Operations on decimals (5.NBT.B.7)', 'Fractions'],
  },
  '5.NBT.A.4': {
    desc: 'Round decimals to any place',
    example: 'Round 3.7284 to the nearest hundredth.',
    scope: 'Rounding decimals to any specified decimal place using number lines or place value understanding.',
    inScope: ['Rounding to tenths, hundredths, thousandths', 'Standard rounding rules', 'Number line justification'],
    outScope: ['Rounding whole numbers (Grade 4)', 'Beyond thousandths', 'Estimation in context'],
  },
  '5.NBT.B.5': {
    desc: 'Fluently multiply multi-digit whole numbers',
    example: 'What is 347 × 82?',
    scope: 'Standard algorithm for multi-digit multiplication. Expected to be fast and accurate.',
    inScope: ['Any multi-digit × multi-digit whole numbers', 'Standard algorithm', 'Partial products approach also acceptable'],
    outScope: ['Decimals (5.NBT.B.7)', 'Fractions', 'Estimation only (4.OA.A.3)'],
  },
  '5.NBT.B.6': {
    desc: 'Find whole-number quotients with up to four-digit dividends',
    example: 'What is 8,736 ÷ 24?',
    scope: 'Division with up to 4-digit dividends and 2-digit divisors. Strategies or standard algorithm. Results are whole numbers (no decimal quotients required).',
    inScope: ['Up to 4-digit ÷ up to 2-digit', 'Whole-number quotient with remainder', 'Standard algorithm or area model'],
    outScope: ['Decimal quotients (5.NBT.B.7)', 'Fraction divisors', '5-digit dividends'],
  },
  '5.NBT.B.7': {
    desc: 'Add, subtract, multiply, divide decimals to hundredths',
    example: 'What is 12.4 + 7.85?',
    scope: 'All four operations with decimal operands up to hundredths. Connects to concrete models and justifies using place value.',
    inScope: ['Decimal + decimal, decimal − decimal', 'Decimal × decimal (up to hundredths result)', 'Decimal ÷ decimal (up to hundredths divisor)', 'Real-world contexts (money, measurement)'],
    outScope: ['Thousandths operands', 'Fraction arithmetic (5.NF)', 'Scientific notation'],
  },
  '5.NF.A.1': {
    desc: 'Add and subtract fractions with unlike denominators',
    example: 'What is 2/3 + 3/4?',
    scope: 'Finding common denominators to add or subtract fractions and mixed numbers with any denominators. Result may need simplifying.',
    inScope: ['Unlike denominators: must find LCD or common denominator', 'Proper fractions, improper fractions, mixed numbers', 'Simplifying the result'],
    outScope: ['Like denominators (Grade 4)', 'Multiplication of fractions (5.NF.B.4)', 'Decimal fractions'],
  },
  '5.NF.A.2': {
    desc: 'Solve word problems with addition/subtraction of fractions',
    example: 'A recipe uses 1/2 cup of flour and 1/3 cup of sugar. Total cups?',
    scope: 'Real-world and mathematical problems requiring addition or subtraction of fractions with unlike denominators. Estimate to check reasonableness.',
    inScope: ['Unlike denominator fraction/mixed number word problems', 'Estimating reasonableness of answer', 'Real-world contexts'],
    outScope: ['Pure computation (5.NF.A.1)', 'Multiplication contexts (5.NF.B.6)', 'Division contexts (5.NF.B.7)'],
  },
  '5.NF.B.3': {
    desc: 'Interpret a fraction as division',
    example: 'What does 3/4 mean as a division problem?',
    scope: 'a/b = a ÷ b. Dividing 3 objects equally among 4 people gives 3/4 each. Connects fractions to division.',
    inScope: ['a/b = a ÷ b', 'Dividing whole numbers with fraction result (3 ÷ 4 = 3/4)', 'Real-world sharing contexts', 'Mixed number results'],
    outScope: ['Fraction ÷ fraction (5.NF.B.7)', 'Decimal quotients (5.NBT.B.7)', 'Multiplying fractions'],
  },
  '5.NF.B.4': {
    desc: 'Multiply fractions and mixed numbers',
    example: 'What is 2/3 × 3/5?',
    scope: 'Multiplying fractions by fractions, fractions by whole numbers, and mixed numbers. Area model connection. (a/b) × (c/d) = ac/bd.',
    inScope: ['Fraction × fraction', 'Whole number × fraction (extends 4.NF.B.4)', 'Mixed number × mixed number', 'Area model as visual', 'Simplifying before or after multiplying'],
    outScope: ['Division of fractions (5.NF.B.7)', 'Addition/subtraction of fractions', 'Decimal multiplication'],
  },
  '5.NF.B.5': {
    desc: 'Interpret multiplication as scaling (resizing)',
    example: 'Is 3/4 × 8 greater or less than 8? Why?',
    scope: 'Understanding that multiplying by a fraction < 1 shrinks the result, multiplying by a fraction > 1 grows it, and multiplying by 1 leaves it unchanged.',
    inScope: ['Comparing product to first factor based on the second factor', 'Multiplying by a fraction < 1 → result < original', 'Multiplying by a fraction > 1 → result > original', 'Conceptual, not always computational'],
    outScope: ['Computing the product (5.NF.B.4)', 'Division as scaling', 'Percentages'],
  },
  '5.NF.B.6': {
    desc: 'Solve real-world problems involving multiplication of fractions',
    example: 'A recipe needs 2/3 of a cup. Making 1.5 batches. Total cups?',
    scope: 'Word problems that require multiplying fractions and/or mixed numbers. Context makes the multiplication meaning clear.',
    inScope: ['Fraction × fraction, mixed number × mixed number in context', 'Area contexts (fractional dimensions)', 'Scaling/resize contexts'],
    outScope: ['Pure computation (5.NF.B.4)', 'Addition/subtraction contexts', 'Division contexts (5.NF.B.7)'],
  },
  '5.NF.B.7': {
    desc: 'Divide unit fractions by whole numbers and vice versa',
    example: 'What is 1/3 ÷ 4?',
    scope: 'Only unit fractions (1/b). Either (1/b) ÷ c or c ÷ (1/b). Interpret using real-world contexts. General fraction division is Grade 6.',
    inScope: ['Unit fraction ÷ whole number: (1/3) ÷ 4 = 1/12', 'Whole number ÷ unit fraction: 4 ÷ (1/3) = 12', 'Word problems for both cases', 'Using a number line or visual model'],
    outScope: ['Non-unit fractions as dividend or divisor (Grade 6)', 'Fraction ÷ fraction where neither is a unit fraction', 'Decimal division'],
  },
  '5.MD.A.1': {
    desc: 'Convert measurement units within the same system',
    example: 'How many centimetres in 3.5 metres?',
    scope: 'Converting within metric or customary systems using multiplication/division. Multi-step conversion problems. Includes decimal and fraction conversions.',
    inScope: ['Metric and customary conversions', 'Decimal and fraction quantities', 'Multi-step conversions (km → m → cm)', 'Word problems involving conversion'],
    outScope: ['Metric ↔ customary (not in CCSS)', 'Temperature', 'Currency'],
  },
  '5.MD.B.2': {
    desc: 'Make a line plot; use it to solve problems',
    example: 'What is the difference between the longest and shortest lengths?',
    scope: 'Line plots with measurements in fractions (½, ¼, ⅛). Adding, subtracting, multiplying those fractions to answer questions about the data.',
    inScope: ['Fractional measurements on line plots', 'Operations on fraction data to answer questions', 'Interpreting spread and distribution'],
    outScope: ['Whole-number line plots (Grade 3)', 'Bar/picture graphs', 'Statistical measures like mean'],
  },
  '5.MD.C.3': {
    desc: 'Recognize volume as an attribute of solid figures',
    example: 'What unit do we use to measure volume?',
    scope: 'Conceptual intro to volume: it\'s the number of unit cubes needed to fill a solid figure without gaps or overlaps. Right rectangular prisms.',
    inScope: ['Volume as space inside a 3D figure', 'Unit cube definition', 'Volume measured in cubic units', 'Right rectangular prisms only'],
    outScope: ['Volume formula (5.MD.C.5)', 'Cylinders, pyramids (Grade 8)', 'Surface area'],
  },
  '5.MD.C.4': {
    desc: 'Measure volumes by counting unit cubes',
    example: 'Count the unit cubes. What is the volume?',
    scope: 'Finding volume by counting individual unit cubes in a 3D figure. May include figures with visible and hidden cubes.',
    inScope: ['Counting unit cubes directly', 'cm³, m³, in³, ft³ as units', 'Right rectangular prisms and composite prisms', 'Visible + inferred hidden cubes'],
    outScope: ['Volume formula (5.MD.C.5)', 'Irregular 3D solids', 'Liquid volume (3.MD.A.2)'],
  },
  '5.MD.C.5': {
    desc: 'Relate volume to multiplication and addition',
    example: 'A box is 3 cm × 4 cm × 5 cm. What is its volume?',
    scope: 'V = l × w × h for right rectangular prisms. Also V = B × h where B is base area. Find volume of composite prisms by adding sub-volumes.',
    inScope: ['V = l × w × h', 'V = B × h', 'Composite prisms: add sub-volumes', 'Whole-number and fractional dimensions (whole number expected here)', 'Real-world packing/filling problems'],
    outScope: ['Cylinders, pyramids (Grade 8)', 'Fractional dimensions (extends to 6th grade)', 'Surface area'],
  },
  '5.G.A.1': {
    desc: 'Use a coordinate plane; plot points in first quadrant',
    example: 'Plot (3, 5). Which axis is horizontal?',
    scope: 'First quadrant only (positive x and y). Plot ordered pairs. Understand x-axis (horizontal) and y-axis (vertical). The origin is (0, 0).',
    inScope: ['First quadrant (x ≥ 0, y ≥ 0)', 'Plotting ordered pairs (x, y)', 'Identifying coordinates of a plotted point', 'Horizontal = x-axis, vertical = y-axis'],
    outScope: ['Four quadrants (Grade 6)', 'Negative coordinates', 'Slope or rate of change'],
  },
  '5.G.A.2': {
    desc: 'Represent real-world problems by graphing in first quadrant',
    example: 'Mark the point showing 4 hours and 200 km.',
    scope: 'Using a coordinate plane to represent real-world data. Interpret the meaning of points in context (e.g. distance–time graphs).',
    inScope: ['First quadrant graphs with meaningful axes', 'Interpreting what a plotted point means', 'Creating a graph from a table of data', 'Real-world contexts'],
    outScope: ['Four quadrants', 'Line graphs with connected points (interpretation vs. scatter)', 'Statistical graphs'],
  },
  '5.G.B.3': {
    desc: 'Understand attributes of a category apply to all subcategories',
    example: 'All squares are rectangles. True or false?',
    scope: 'Shape hierarchy: properties of a broader category belong to all members of subcategories. Squares ⊂ rectangles ⊂ parallelograms ⊂ quadrilaterals.',
    inScope: ['Squares are special rectangles', 'Rectangles are special parallelograms', 'All rectangles are parallelograms (but not vice versa)', 'Inheriting properties down the hierarchy'],
    outScope: ['Proving properties formally', 'Circles', 'Triangles (separate hierarchy)'],
  },
  '5.G.B.4': {
    desc: 'Classify 2D figures in a hierarchy based on properties',
    example: 'Is a rhombus always a parallelogram?',
    scope: 'Full 2D figure classification hierarchy for quadrilaterals and triangles. Understands "all X are Y but not all Y are X" relationships.',
    inScope: ['Quadrilateral hierarchy: quadrilateral → parallelogram → rectangle/rhombus → square', 'Triangle hierarchy: acute/obtuse/right; scalene/isosceles/equilateral', 'Venn diagram–style reasoning'],
    outScope: ['Formal proofs', 'Coordinate geometry proofs', 'Non-polygon figures'],
  },
}

// ── Flag metadata ──────────────────────────────────────────────────────────────

const FLAGS = [
  {
    code:  'wrong_answer',
    label: 'Wrong Answer',
    trust: 'High' as const,
    color: 'bg-red-900/40 text-red-300 border-red-700',
    desc:  'The stated correct answer is mathematically incorrect.',
    action: 'Work it out yourself. If your answer differs, flag with the correct value in Suggested Fix.',
  },
  {
    code:  'ui_mismatch',
    label: 'UI Mismatch',
    trust: 'High' as const,
    color: 'bg-red-900/40 text-red-300 border-red-700',
    desc:  'The answer format cannot be entered using the assigned input type.',
    action: 'Check the Type Rules tab. Most common: fraction answer on a numeric input, or text answer on any input.',
  },
  {
    code:  'format_error',
    label: 'Format Error',
    trust: 'High' as const,
    color: 'bg-red-900/40 text-red-300 border-red-700',
    desc:  'Multiple choice has fewer than 2 options, or the options array is missing.',
    action: 'Look at the options grid. If empty or only 1 option is shown, flag it.',
  },
  {
    code:  'missing_visual_ref',
    label: 'Missing Visual',
    trust: 'High' as const,
    color: 'bg-amber-900/40 text-amber-300 border-amber-700',
    desc:  'Question text says "look at the diagram/picture/figure" but no visual is attached.',
    action: 'Check whether the question is self-contained without an image. If it references something invisible, flag it.',
  },
  {
    code:  'unanswerable',
    label: 'Unanswerable',
    trust: 'Medium' as const,
    color: 'bg-red-900/40 text-red-300 border-red-700',
    desc:  'The question is missing information needed to solve it.',
    action: 'Try to solve it yourself. If you can solve it without any extra information, approve.',
  },
  {
    code:  'grade_mismatch',
    label: 'Grade Mismatch',
    trust: 'Low' as const,
    color: 'bg-purple-900/40 text-purple-300 border-purple-700',
    desc:  'AI thinks the content is too hard or too easy for the stated grade.',
    action: '⚠️ Always check the difficulty stars first. 3-star (hard) questions are EXPECTED to be challenging. Check the Standards tab and override the AI here often.',
  },
  {
    code:  'weak_distractors',
    label: 'Weak Distractors',
    trust: 'Low' as const,
    color: 'bg-orange-900/40 text-orange-300 border-orange-700',
    desc:  'For multiple choice: wrong options are too obvious or nonsensical.',
    action: 'Check if wrong options reflect common student mistakes. If most are plausible, approve. Only flag if all wrong options are clearly absurd.',
  },
  {
    code:  'ambiguous_wording',
    label: 'Ambiguous Wording',
    trust: 'Medium' as const,
    color: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
    desc:  'The question could be interpreted in multiple valid ways.',
    action: 'Read it as a child of that grade. If you can only see one interpretation, approve.',
  },
]

const TRUST_COLORS = {
  High:   'bg-red-900/40 text-red-300 border border-red-700',
  Medium: 'bg-amber-900/40 text-amber-300 border border-amber-700',
  Low:    'bg-emerald-900/40 text-emerald-300 border border-emerald-700',
}

// Pre-filled templates for each flag type - helps reviewers write consistent notes
const FLAG_TEMPLATES: Record<string, { comment: string; fix: string }> = {
  wrong_answer:        { comment: 'The correct answer shown is wrong.', fix: 'Change correct_answer to [X]. Work: [show your calculation]' },
  ui_mismatch:         { comment: 'The answer cannot be entered with the current input type.', fix: 'Change question type to [multiple_choice / numeric / fraction] OR change the answer to a value that fits the current type.' },
  format_error:        { comment: 'Multiple choice question has too few answer options.', fix: 'Add more options. Suggested additions: [option 1, option 2...]' },
  missing_visual_ref:  { comment: 'Question refers to a diagram or picture but no image is shown.', fix: 'Either add an image of [describe what is needed] OR rewrite the question so it does not reference a visual.' },
  unanswerable:        { comment: 'The question is missing information needed to solve it.', fix: 'Add the missing [number / unit / context] OR rewrite as: "[your suggested version]"' },
  grade_mismatch:      { comment: 'This question seems too [hard / easy] for the stated grade.', fix: 'Move to Grade [X] OR simplify/extend to: "[your suggested version]"' },
  weak_distractors:    { comment: 'The wrong answer options are too obvious and would not challenge a student guessing.', fix: 'Replace weak options with common mistake answers: [A: ..., B: ..., C: ...]' },
  ambiguous_wording:   { comment: 'The wording can be interpreted in more than one way.', fix: 'Rewrite as: "[your clearer version]"' },
}

const FIX_EXAMPLES = [
  { label: 'Wrong answer',      text: 'Change correct_answer to 56. Work: 7 × 8 = 56, not 54.' },
  { label: 'UI mismatch',       text: 'Answer is "1/2" but input type is numeric. Change correct_answer to 0.5 or change type to fraction.' },
  { label: 'Missing visual',    text: 'Question says "look at the bar graph" but no graph is shown. Rewrite as: "A bag has 3 red and 5 blue marbles. How many total?"' },
  { label: 'Ambiguous wording', text: 'Rewrite as: "How many equal groups of 4 can you make from 20 objects?"' },
  { label: 'Grade mismatch',    text: 'Long division with 3-digit divisor is Grade 5 content. Move to Grade 5 or simplify divisor to single digit.' },
]

// ── Types ──────────────────────────────────────────────────────────────────────

type GuideTab = 'checklist' | 'standards' | 'flags'
type FilterTab = 'ai_flagged' | 'pending' | 'all' | 'approved' | 'flagged'

interface QueueData {
  queue:   ReviewableQuestion[]
  reviews: Record<string, ReviewRecord>
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getStatus(ref: string, reviews: Record<string, ReviewRecord>) {
  const r = reviews[ref]
  if (!r) return 'pending'
  if (r.status === 'approved') return 'approved'
  if (r.status === 'flagged' && r.is_ai_review) return 'ai_flagged'
  return 'flagged'
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-400 text-sm tracking-tight">
      {'★'.repeat(n)}{'☆'.repeat(3 - n)}
    </span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ReviewPortal({ userEmail }: { userEmail: string }) {
  const [data,        setData]        = useState<QueueData | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState<FilterTab>('ai_flagged')
  const [idx,         setIdx]         = useState(0)
  const [guideTab,        setGuideTab]       = useState<GuideTab>('checklist')
  const [expandedStd,     setExpandedStd]    = useState<string | null>(null)
  const [isFlagMode,      setIsFlagMode]     = useState(false)
  const [flagComment,     setFlagComment]    = useState('')
  const [fixText,         setFixText]        = useState('')
  const [selectedFlagType, setSelectedFlagType] = useState<string | null>(null)
  const [showFixExamples, setShowFixExamples] = useState(false)
  const [toast,           setToast]          = useState<{ msg: string; type: 'approve' | 'flag' } | null>(null)
  const [showWelcome,     setShowWelcome]    = useState(false)
  const [submitting,      setSubmitting]     = useState(false)
  const commentRef = useRef<HTMLTextAreaElement>(null)

  // show welcome modal once per browser
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('mkreview_v1_welcomed')) {
      setShowWelcome(true)
    }
  }, [])

  function dismissWelcome() {
    localStorage.setItem('mkreview_v1_welcomed', '1')
    setShowWelcome(false)
  }

  // fetch
  useEffect(() => {
    fetch('/api/review/queue')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  // derived
  const filtered = data
    ? data.queue.filter(q => {
        const s = getStatus(q.ref, data.reviews)
        if (filter === 'all')        return true
        if (filter === 'pending')    return s === 'pending'
        if (filter === 'ai_flagged') return s === 'ai_flagged'
        if (filter === 'approved')   return s === 'approved'
        if (filter === 'flagged')    return s === 'flagged'
        return true
      })
    : []

  const current = filtered[idx] ?? null
  const currentReview = current ? data?.reviews[current.ref] : undefined

  const counts = data ? {
    total:      data.queue.length,
    ai_flagged: data.queue.filter(q => getStatus(q.ref, data.reviews) === 'ai_flagged').length,
    pending:    data.queue.filter(q => getStatus(q.ref, data.reviews) === 'pending').length,
    approved:   data.queue.filter(q => getStatus(q.ref, data.reviews) === 'approved').length,
    flagged:    data.queue.filter(q => getStatus(q.ref, data.reviews) === 'flagged').length,
  } : { total: 0, ai_flagged: 0, pending: 0, approved: 0, flagged: 0 }

  const progress = counts.total > 0
    ? Math.round(((counts.approved + counts.flagged) / counts.total) * 100)
    : 0

  // standards for current question's grade+domain
  const relevantStandards = current
    ? Object.entries(STANDARDS).filter(([code]) => {
        const parts = code.split('.')
        return parts[0] === String(current.grade_level) && parts[1] === current.domain
      })
    : []

  function showToast(msg: string, type: 'approve' | 'flag') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2200)
  }

  // navigation
  function navigate(dir: number) {
    setIdx(i => Math.max(0, Math.min(filtered.length - 1, i + dir)))
    setIsFlagMode(false); setFlagComment(''); setFixText(''); setSelectedFlagType(null); setShowFixExamples(false)
  }

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowRight' || e.key === 'l') handleApprove()
      if (e.key === 'ArrowLeft'  || e.key === 'h') openFlag()
      if (e.key === 'ArrowDown'  || e.key === 'j') navigate(1)
      if (e.key === 'ArrowUp'    || e.key === 'k') navigate(-1)
      if (e.key === 'Escape') { setIsFlagMode(false); setFlagComment(''); setFixText('') }
      if (e.key === '1') setGuideTab('checklist')
      if (e.key === '2') setGuideTab('standards')
      if (e.key === '3') setGuideTab('flags')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // auto-switch to standards tab when question changes; auto-expand current standard
  useEffect(() => {
    if (current?.standard_code) {
      setGuideTab('standards')
      setExpandedStd(current.standard_code)
    }
  }, [current?.ref])

  useEffect(() => { setIdx(0) }, [filter])

  function openFlag() {
    const aiNotes = currentReview?.ai_notes ?? ''
    if (!flagComment) setFlagComment(currentReview?.comment || aiNotes || '')
    if (!fixText) setFixText(currentReview?.suggested_fix ?? '')
    setSelectedFlagType(null)
    setShowFixExamples(false)
    setIsFlagMode(true)
    setTimeout(() => commentRef.current?.focus(), 50)
  }

  function pickFlagType(code: string) {
    const t = FLAG_TEMPLATES[code]
    if (!t) return
    setSelectedFlagType(code)
    setFlagComment(t.comment)
    if (!fixText) setFixText(t.fix)
    setTimeout(() => commentRef.current?.focus(), 50)
  }

  const handleApprove = useCallback(async () => {
    if (!current || submitting) return
    setSubmitting(true)
    await fetch('/api/review/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: current.ref, source: current.source, status: 'approved', snapshot: current }),
    })
    setData(prev => prev ? {
      ...prev,
      reviews: { ...prev.reviews, [current.ref]: {
        status: 'approved', comment: null, suggested_fix: null,
        reviewed_at: new Date().toISOString(),
        ai_flags: prev.reviews[current.ref]?.ai_flags ?? [],
        ai_notes: prev.reviews[current.ref]?.ai_notes ?? null,
        is_ai_review: false,
      }},
    } : prev)
    showToast('Approved', 'approve')
    setSubmitting(false)
    navigate(1)
  }, [current, submitting])

  async function handleFlag() {
    if (!current || !flagComment.trim()) { commentRef.current?.focus(); return }
    setSubmitting(true)
    await fetch('/api/review/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref: current.ref, source: current.source, status: 'flagged',
        comment: flagComment.trim(), suggested_fix: fixText.trim() || undefined,
        snapshot: current,
      }),
    })
    setData(prev => prev ? {
      ...prev,
      reviews: { ...prev.reviews, [current.ref]: {
        status: 'flagged', comment: flagComment.trim(), suggested_fix: fixText.trim() || null,
        reviewed_at: new Date().toISOString(),
        ai_flags: prev.reviews[current.ref]?.ai_flags ?? [],
        ai_notes: prev.reviews[current.ref]?.ai_notes ?? null,
        is_ai_review: false,
      }},
    } : prev)
    setIsFlagMode(false); setFlagComment(''); setFixText(''); setSelectedFlagType(null); setShowFixExamples(false)
    showToast('Flagged', 'flag')
    setSubmitting(false)
    navigate(1)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/review/login'
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">📋</div>
          <p className="text-gray-400">Loading question queue…</p>
        </div>
      </div>
    )
  }

  // ── Layout ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">

      {/* ── Welcome modal ────────────────────────────────────────────────────── */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="text-center">
              <div className="text-3xl mb-2">👋</div>
              <h2 className="text-white font-bold text-lg">Welcome to MathKix Review</h2>
              <p className="text-gray-400 text-sm mt-1">Here is all you need to know to get started.</p>
            </div>

            <div className="space-y-3">
              {[
                { n: '1', color: 'bg-indigo-600', title: 'Read each question carefully', body: 'Check that the answer is correct, the wording is clear, and it makes sense for the grade shown. The guide panel on the right has a full checklist.' },
                { n: '2', color: 'bg-emerald-600', title: 'Approve if it looks good', body: 'Press the green Approve button (or → on your keyboard). That\'s it, move on.' },
                { n: '3', color: 'bg-red-600', title: 'Flag if something is wrong', body: 'Press Flag, pick the issue type to get a pre-filled template, then edit it to describe what is wrong and what the fix should be. Be specific but brief.' },
              ].map(s => (
                <div key={s.n} className="flex gap-3 bg-gray-800/60 rounded-xl p-3">
                  <span className={`${s.color} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5`}>{s.n}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{s.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-400 mb-1.5">Example of a good flag note</p>
              <p className="text-xs text-amber-200/80 italic mb-1">&ldquo;The correct answer shown is 54, but 7 × 8 = 56.&rdquo;</p>
              <p className="text-xs font-semibold text-emerald-400 mb-1 mt-2">With suggested fix</p>
              <p className="text-xs text-emerald-200/80 italic">&ldquo;Change correct_answer to 56.&rdquo;</p>
            </div>

            <button onClick={dismissWelcome}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors text-sm">
              Got it, let&apos;s start reviewing
            </button>
          </div>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'approve'
            ? 'bg-emerald-700 text-white'
            : 'bg-red-700 text-white'
        }`}>
          {toast.type === 'approve' ? '✓ Approved' : '⚑ Flagged'} and saved
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-2.5 flex items-center gap-3 flex-wrap">

        {/* Brand */}
        <span className="text-base font-extrabold tracking-tight shrink-0">
          <span className="text-white">Math</span>
          <span style={{ color: '#3678FF' }}>Kix</span>
          <span className="text-indigo-400 text-xs font-medium ml-1.5">Review</span>
        </span>

        {/* Progress bar */}
        <div className="flex items-center gap-2 flex-1 min-w-[120px] max-w-[200px]">
          <div className="h-1.5 flex-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-gray-500 shrink-0">{progress}%</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            ['ai_flagged', `⚑ ${counts.ai_flagged}`, 'bg-amber-900/40 text-amber-300 border-amber-700'],
            ['pending',    `○ ${counts.pending}`,     'bg-gray-800 text-gray-400 border-gray-700'],
            ['approved',   `✓ ${counts.approved}`,    'bg-emerald-900/40 text-emerald-300 border-emerald-700'],
            ['flagged',    `✗ ${counts.flagged}`,     'bg-red-900/40 text-red-300 border-red-700'],
          ].map(([f, label, cls]) => (
            <button
              key={f}
              onClick={() => setFilter(f as FilterTab)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${cls} ${filter === f ? 'ring-1 ring-white/20 scale-105' : 'opacity-60 hover:opacity-100'}`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setFilter('all')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border bg-gray-800 text-gray-400 border-gray-700 transition-all ${filter === 'all' ? 'ring-1 ring-white/20 scale-105' : 'opacity-60 hover:opacity-100'}`}
          >
            All {counts.total}
          </button>
        </div>

        {/* User + sign out */}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-600 hidden sm:block">{userEmail}</span>
          <button onClick={handleSignOut} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Sign out
          </button>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ════════════════════════════════════════════════════════════════════
            LEFT - Question area
        ════════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-y-auto">

          {filtered.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-4">🎉</div>
                <p className="text-gray-300 text-lg font-semibold">All done!</p>
                <p className="text-gray-500 text-sm mt-1">No questions in this filter.</p>
              </div>
            </div>
          ) : !current ? null : (
            <div className="max-w-2xl mx-auto w-full px-4 py-5">

              {/* Nav row */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigate(-1)} disabled={idx === 0}
                  className="text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                  ← Prev
                </button>
                <span className="text-sm text-gray-500">
                  {idx + 1} / {filtered.length}
                </span>
                <button onClick={() => navigate(1)} disabled={idx >= filtered.length - 1}
                  className="text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                  Next →
                </button>
              </div>

              {/* ── Question card ──────────────────────────────────────────── */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">

                {/* Card header */}
                <div className="px-5 py-3.5 border-b border-gray-800 flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    current.source === 'diagnostic'
                      ? 'bg-blue-900/60 text-blue-300 border-blue-700'
                      : 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                  }`}>
                    {current.source === 'diagnostic' ? '🔬 Diagnostic' : '📘 Lesson'}
                  </span>
                  <span className="text-sm font-semibold text-white bg-gray-800 px-2.5 py-1 rounded-full">
                    Grade {current.grade_level}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-800 px-2.5 py-1 rounded-full">
                    {DOMAIN_LABELS[current.domain] ?? current.domain}
                  </span>
                  <Stars n={current.difficulty} />
                  {current.lesson_title && (
                    <span className="text-xs text-gray-500 truncate max-w-[180px]">
                      {current.lesson_title} · Q{(current.question_index ?? 0) + 1}
                    </span>
                  )}
                  {currentReview && (
                    <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full border ${
                      currentReview.status === 'approved'
                        ? 'bg-emerald-900/60 text-emerald-400 border-emerald-700'
                        : 'bg-red-900/60 text-red-400 border-red-700'
                    }`}>
                      {currentReview.status === 'approved' ? '✓ Approved' : '✗ Flagged'}
                    </span>
                  )}
                </div>

                {/* Standard code */}
                {current.standard_code && (
                  <div className="px-5 pt-4">
                    <div className="bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 flex items-start gap-3">
                      <span className="text-indigo-400 font-mono font-semibold text-sm shrink-0">
                        {current.standard_code}
                      </span>
                      {STANDARDS[current.standard_code] && (
                        <span className="text-gray-400 text-sm">
                          - {STANDARDS[current.standard_code].desc}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Question text */}
                <div className="px-5 pt-4 pb-3">
                  <div className="bg-gray-800 rounded-xl p-5 text-center">
                    <p className="text-white text-xl font-medium leading-relaxed">
                      {current.question_text}
                    </p>
                  </div>
                </div>

                {/* Meta + answer */}
                <div className="px-5 pb-4 space-y-3">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${
                      current.has_audio
                        ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700'
                        : 'bg-gray-800 text-gray-500 border-gray-700'
                    }`}>
                      🔊 {current.has_audio ? 'Read-aloud (G1-2)' : 'No audio (G3+)'}
                    </span>
                    <span className="text-xs font-medium px-3 py-1.5 rounded-full border bg-gray-800 text-gray-400 border-gray-700">
                      Type: {current.question_type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-28 shrink-0">Correct Answer</span>
                    <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-700 px-3 py-1.5 rounded-lg font-bold text-sm font-mono">
                      {current.correct_answer}
                    </span>
                  </div>

                  {current.options && current.options.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Options</p>
                      <div className="grid grid-cols-2 gap-2">
                        {current.options.map(opt => {
                          const correct = opt.value === current.correct_answer
                          return (
                            <div key={opt.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                              correct
                                ? 'bg-emerald-900/40 border-emerald-700 text-emerald-300 font-semibold'
                                : 'bg-gray-800 border-gray-700 text-gray-300'
                            }`}>
                              <span className="font-bold text-xs text-gray-500 w-4">{opt.label}</span>
                              <span>{opt.value}</span>
                              {correct && <span className="ml-auto text-emerald-400 text-xs">✓ correct</span>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI flags */}
                {currentReview && currentReview.ai_flags.length > 0 && (
                  <div className="mx-5 mb-4 bg-amber-950/30 border border-amber-800/60 rounded-xl px-4 py-3 space-y-2">
                    <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      ⚑ AI Flags
                      {currentReview.is_ai_review && (
                        <span className="font-normal text-amber-600 normal-case">(awaiting your review)</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentReview.ai_flags.map(flag => {
                        const meta = FLAGS.find(f => f.code === flag)
                        return (
                          <span key={flag}
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta?.color ?? 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                            {meta?.label ?? flag}
                          </span>
                        )
                      })}
                    </div>
                    {currentReview.ai_notes && (
                      <p className="text-xs text-amber-200/70 italic">{currentReview.ai_notes}</p>
                    )}
                  </div>
                )}

                {/* Previous human flag */}
                {currentReview?.status === 'flagged' && !currentReview.is_ai_review && (
                  <div className="mx-5 mb-5 space-y-2">
                    {currentReview.comment && (
                      <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">
                        <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-1">What&apos;s wrong</p>
                        <p className="text-sm text-red-200">{currentReview.comment}</p>
                      </div>
                    )}
                    {currentReview.suggested_fix && (
                      <div className="bg-emerald-900/30 border border-emerald-800 rounded-xl px-4 py-3">
                        <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">Suggested fix</p>
                        <p className="text-sm text-emerald-200 whitespace-pre-wrap">{currentReview.suggested_fix}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Flag form ────────────────────────────────────────────────── */}
              {isFlagMode && (
                <div className="mt-4 bg-red-950/40 border border-red-800 rounded-2xl p-5 space-y-4">

                  {/* Flag type selector */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      What type of issue is this? <span className="text-gray-600 font-normal normal-case">(pick one to auto-fill a template)</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {FLAGS.map(flag => (
                        <button
                          key={flag.code}
                          onClick={() => pickFlagType(flag.code)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                            selectedFlagType === flag.code
                              ? flag.color + ' ring-1 ring-white/20 scale-105'
                              : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                          }`}
                        >
                          {flag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* What's wrong */}
                  <div>
                    <label className="block text-sm font-semibold text-red-300 mb-2">
                      What&apos;s wrong? <span className="text-red-500">*</span>
                    </label>
                    <textarea ref={commentRef} value={flagComment}
                      onChange={e => setFlagComment(e.target.value)} rows={2}
                      placeholder="e.g. The correct answer is wrong. 7 × 8 = 56, not 54."
                      className="w-full bg-gray-900 border border-red-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 resize-none" />
                  </div>

                  {/* Suggested fix */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-emerald-400">
                        Suggested fix <span className="text-gray-500 font-normal">(optional but very helpful)</span>
                      </label>
                      <button
                        onClick={() => setShowFixExamples(v => !v)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {showFixExamples ? 'Hide examples ▲' : 'See examples ▼'}
                      </button>
                    </div>

                    {showFixExamples && (
                      <div className="mb-2 bg-gray-900 border border-gray-700 rounded-xl p-3 space-y-2">
                        <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Example suggested fixes</p>
                        {FIX_EXAMPLES.map(ex => (
                          <div key={ex.label}>
                            <p className="text-[10px] text-indigo-400 font-semibold mb-0.5">{ex.label}</p>
                            <p className="text-[11px] text-gray-300 italic leading-snug">&ldquo;{ex.text}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <textarea value={fixText} onChange={e => setFixText(e.target.value)} rows={3}
                      placeholder={
                        current.question_type === 'multiple_choice'
                          ? 'e.g. Change correct_answer to "C"\nOr: Option B should say "4 × 3" not "4 + 3"'
                          : 'e.g. Change correct_answer to 56\nOr: Change type to "multiple_choice" and add word options'
                      }
                      className="w-full bg-gray-900 border border-emerald-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 resize-none placeholder-gray-600" />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => { setIsFlagMode(false); setFlagComment(''); setFixText(''); setSelectedFlagType(null); setShowFixExamples(false) }}
                      className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-800 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleFlag} disabled={submitting || !flagComment.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 disabled:bg-red-900 text-white text-sm font-bold transition-colors">
                      {submitting ? 'Saving…' : 'Submit Flag'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Action buttons ───────────────────────────────────────────── */}
              {!isFlagMode && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <button onClick={openFlag} disabled={submitting}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-900/60 hover:bg-red-800/80 border border-red-700 text-red-300 font-bold text-lg transition-all active:scale-95 disabled:opacity-50">
                    <span className="text-xl">✗</span> Flag
                    <span className="text-xs font-normal text-red-500 ml-1">(← or H)</span>
                  </button>
                  <button onClick={handleApprove} disabled={submitting}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700 text-emerald-300 font-bold text-lg transition-all active:scale-95 disabled:opacity-50">
                    <span className="text-xl">✓</span> Approve
                    <span className="text-xs font-normal text-emerald-600 ml-1">(→ or L)</span>
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-gray-600 mt-3">
                ← / H&nbsp;flag &nbsp;·&nbsp; → / L&nbsp;approve &nbsp;·&nbsp; ↑↓ / J K&nbsp;navigate &nbsp;·&nbsp; 1 2 3&nbsp;guide tabs
              </p>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT - Guide panel
        ════════════════════════════════════════════════════════════════════ */}
        <aside className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 border-l border-gray-800 bg-gray-900/50 overflow-hidden">

          {/* Guide tab bar */}
          <div className="flex border-b border-gray-800 shrink-0">
            {([
              ['checklist', '1', 'Checklist'],
              ['standards', '2', 'Standards'],
              ['flags',     '3', 'Flag Types'],
            ] as const).map(([tab, num, label]) => (
              <button key={tab} onClick={() => setGuideTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors border-b-2 ${
                  guideTab === tab
                    ? 'text-white border-indigo-500'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}>
                <span className="text-gray-600 mr-1">{num}</span>{label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* ── CHECKLIST TAB ────────────────────────────────────────────── */}
            {guideTab === 'checklist' && (
              <div className="p-4 space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
                  Decision framework - check in order
                </p>

                {[
                  { n: '1', color: 'text-red-400', title: 'Is the correct answer right?',
                    body: 'Work it out yourself. If wrong → Flag with correct value in Suggested Fix.' },
                  { n: '2', color: 'text-red-400', title: 'Can the student enter this answer?',
                    body: 'Check the type rules below. Fraction answer on numeric = broken. Text on any input = broken.' },
                  { n: '3', color: 'text-amber-400', title: 'Is the question clear?',
                    body: 'Read as a child of that grade. Multiple valid interpretations → Flag Ambiguous Wording.' },
                  { n: '4', color: 'text-amber-400', title: 'Is there enough info to solve it?',
                    body: '"Look at the picture" but no picture visible → Flag Missing Visual. Missing numbers → Flag Unanswerable.' },
                  { n: '5', color: 'text-purple-400', title: 'Does difficulty match grade? (check Stars!)',
                    body: '★★★ hard questions at a grade SHOULD push the boundary. Always check stars before Grade Mismatch.' },
                  { n: '6', color: 'text-orange-400', title: 'Are the MC distractors reasonable?',
                    body: 'Wrong options should reflect common mistakes. Only flag if ALL wrong options are obviously absurd.' },
                  { n: '7', color: 'text-yellow-400', title: 'Is the language age-appropriate?',
                    body: 'G1-2: simple words, short sentences. G3-5: can be more complex.' },
                ].map(item => (
                  <div key={item.n} className="flex gap-3 bg-gray-800/40 border border-gray-700/60 rounded-xl p-3">
                    <span className={`text-base font-extrabold shrink-0 mt-0.5 ${item.color}`}>{item.n}</span>
                    <div>
                      <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}

                {/* Type rules quick ref */}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Type rules</p>
                  {[
                    { type: 'multiple_choice', rule: 'correct_answer must exactly match one option value. Options ≥ 2.' },
                    { type: 'numeric',         rule: 'correct_answer must be a plain number: "7", "3.14". No fractions, no words.' },
                    { type: 'fraction',        rule: 'correct_answer must be X/Y format with Y ≠ 0. No decimals, no mixed numbers. Grade 3+ only.' },
                  ].map(row => (
                    <div key={row.type} className="mb-2 bg-gray-800/60 border border-gray-700/50 rounded-lg p-3">
                      <p className="text-xs font-mono font-bold text-indigo-400 mb-1">{row.type}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{row.rule}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 bg-indigo-900/20 border border-indigo-800/60 rounded-xl p-3">
                  <p className="text-xs text-indigo-300 font-semibold mb-1">When in doubt</p>
                  <p className="text-xs text-indigo-200/70">If unsure after 60 seconds, approve. Flag only clear errors, not debatable edge cases.</p>
                </div>
              </div>
            )}

            {/* ── STANDARDS TAB ────────────────────────────────────────────── */}
            {guideTab === 'standards' && (
              <div className="p-4">
                {!current ? (
                  <p className="text-xs text-gray-500 text-center mt-8">Select a question to see its standards.</p>
                ) : (
                  <>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                        Grade {current.grade_level} · {DOMAIN_LABELS[current.domain] ?? current.domain}
                      </p>
                      <p className="text-[11px] text-gray-600">Click any standard to see what&apos;s in and out of scope.</p>
                      {current.domain === 'NF' && (
                        <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-2.5 mt-2">
                          <p className="text-xs text-purple-300">
                            ⚠️ NF (Fractions) is a Grade 3+ domain. A Grade 1-2 question with type "fraction" is almost certainly a data error.
                          </p>
                        </div>
                      )}
                    </div>

                    {relevantStandards.length === 0 ? (
                      <p className="text-xs text-gray-500">No standards found for Grade {current.grade_level} · {current.domain}.</p>
                    ) : (
                      <div className="space-y-2">
                        {relevantStandards.map(([code, entry]) => {
                          const isCurrent  = code === current.standard_code
                          const isExpanded = expandedStd === code
                          return (
                            <div key={code} className={`rounded-xl border transition-all overflow-hidden ${
                              isCurrent
                                ? 'bg-indigo-900/30 border-indigo-600 ring-1 ring-indigo-500/40'
                                : 'bg-gray-800/40 border-gray-700/60 hover:border-gray-600'
                            }`}>
                              {/* ── Clickable header row ── */}
                              <button
                                onClick={() => setExpandedStd(isExpanded ? null : code)}
                                className="w-full text-left px-3 py-2.5 flex items-start gap-2 group cursor-pointer"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`font-mono text-xs font-bold shrink-0 ${isCurrent ? 'text-indigo-300' : 'text-gray-400'}`}>
                                      {code}
                                    </span>
                                    {isCurrent && (
                                      <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                                        CURRENT
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-xs leading-relaxed ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                                    {entry.desc}
                                  </p>
                                </div>
                                {/* Chevron */}
                                <span className={`text-gray-500 group-hover:text-gray-300 shrink-0 mt-0.5 transition-transform duration-200 text-[10px] ${isExpanded ? 'rotate-180' : ''}`}>
                                  ▼
                                </span>
                              </button>

                              {/* ── Expanded detail ── */}
                              {isExpanded && (
                                <div className="px-3 pb-3 space-y-3 border-t border-gray-700/60 pt-3">

                                  {/* Scope summary */}
                                  <p className="text-[11px] text-gray-300 leading-relaxed">{entry.scope}</p>

                                  {/* In scope */}
                                  <div>
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                      <span>✓</span> In scope
                                    </p>
                                    <ul className="space-y-1">
                                      {entry.inScope.map((s, i) => (
                                        <li key={i} className="text-[11px] text-emerald-200/80 leading-snug flex gap-1.5">
                                          <span className="text-emerald-600 shrink-0 mt-0.5">•</span>
                                          {s}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Out of scope */}
                                  {entry.outScope.length > 0 && (
                                    <div>
                                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <span>✗</span> Out of scope
                                      </p>
                                      <ul className="space-y-1">
                                        {entry.outScope.map((s, i) => (
                                          <li key={i} className="text-[11px] text-red-200/70 leading-snug flex gap-1.5">
                                            <span className="text-red-700 shrink-0 mt-0.5">•</span>
                                            {s}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Example */}
                                  <div className="bg-gray-900/60 border border-gray-700/40 rounded-lg px-3 py-2">
                                    <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Example question</p>
                                    <p className="text-[11px] text-gray-300 italic">{entry.example}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-xs text-gray-500 font-semibold mb-2">Difficulty at this grade</p>
                      {[
                        ['★☆☆', 'Easy',   'emerald', 'Straightforward. Single step. Small numbers.'],
                        ['★★☆', 'Medium', 'amber',   'Slightly less obvious. May need two steps.'],
                        ['★★★', 'Hard',   'red',     'Upper boundary of standard. Multi-step, larger numbers. Should feel hard.'],
                      ].map(([stars, label, c, body]) => (
                        <div key={label} className={`mb-2 bg-${c}-900/20 border border-${c}-800/40 rounded-lg px-3 py-2`}>
                          <p className="text-xs font-semibold text-white">{stars} {label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{body}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── FLAGS TAB ────────────────────────────────────────────────── */}
            {guideTab === 'flags' && (
              <div className="p-4 space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
                  Flag types - AI trust level &amp; what to do
                </p>

                {FLAGS.map(flag => (
                  <div key={flag.code} className={`rounded-xl border p-3 space-y-1.5 ${
                    currentReview?.ai_flags?.includes(flag.code)
                      ? 'ring-1 ring-amber-500/40 bg-amber-950/20 border-amber-800/60'
                      : 'bg-gray-800/40 border-gray-700/60'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${flag.color}`}>
                        {flag.label}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TRUST_COLORS[flag.trust]}`}>
                        {flag.trust} trust
                      </span>
                      {currentReview?.ai_flags?.includes(flag.code) && (
                        <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded-full font-semibold ml-auto">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{flag.desc}</p>
                    <p className="text-xs text-gray-300 leading-relaxed border-t border-gray-700/60 pt-1.5 mt-1">
                      → {flag.action}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </aside>
      </div>
    </div>
  )
}
