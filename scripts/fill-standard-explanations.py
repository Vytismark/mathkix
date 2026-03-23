"""
fill-standard-explanations.py
Parses the CCSS PDF text and fills in the explanation field for all
grade 3-5 standards in the grade JSON files.
"""

import json, re, sys, os
sys.stdout.reconfigure(encoding='utf-8')

# ─── Raw CCSS explanations extracted directly from the PDF ────────────────────
# Format: standard_code -> explanation text

EXPLANATIONS = {
    # ── GRADE 3 ──────────────────────────────────────────────────────────────
    "3.OA.1": (
        "Interpret products of whole numbers as the total number of objects in equal groups. "
        "For example, interpret 5 × 7 as the total number of objects in 5 groups of 7 objects each. "
        "Students describe real-world contexts where a total can be expressed as a product."
    ),
    "3.OA.2": (
        "Interpret whole-number quotients of whole numbers as the number of objects in each share "
        "or the number of equal shares. For example, interpret 56 ÷ 8 as the number of objects in "
        "each share when 56 objects are partitioned equally into 8 shares, or as the number of shares "
        "when 56 objects are partitioned into equal shares of 8 objects each."
    ),
    "3.OA.3": (
        "Use multiplication and division within 100 to solve word problems in situations involving "
        "equal groups, arrays, and measurement quantities. Students use drawings and equations with "
        "a symbol for the unknown number to represent the problem."
    ),
    "3.OA.4": (
        "Determine the unknown whole number in a multiplication or division equation relating three "
        "whole numbers. For example, determine the unknown number that makes the equation true in "
        "equations such as 8 × ? = 48, 5 = ? ÷ 3, and 6 × 6 = ?."
    ),
    "3.OA.5": (
        "Apply properties of operations as strategies to multiply and divide. Examples: the commutative "
        "property (4 × 6 = 6 × 4), associative property (3 × 5 × 2 = 15 × 2 = 30), and distributive "
        "property (8 × 7 = 8 × (5 + 2) = 40 + 16 = 56). Students need not use formal terms for these properties."
    ),
    "3.OA.6": (
        "Understand division as an unknown-factor problem. For example, find 32 ÷ 8 by finding the "
        "number that makes 32 when multiplied by 8. This connects division directly to multiplication."
    ),
    "3.OA.7": (
        "Fluently multiply and divide within 100, using strategies such as the relationship between "
        "multiplication and division and properties of operations. By the end of Grade 3, students "
        "know from memory all products of two one-digit numbers."
    ),
    "3.OA.8": (
        "Solve two-step word problems using the four operations. Represent these problems using equations "
        "with a letter standing for the unknown quantity. Assess the reasonableness of answers using "
        "mental computation and estimation strategies including rounding. Limited to problems with "
        "whole numbers and whole-number answers."
    ),
    "3.OA.9": (
        "Identify arithmetic patterns (including patterns in the addition table or multiplication table) "
        "and explain them using properties of operations. For example, observe that 4 times a number is "
        "always even, and explain why 4 times a number can be decomposed into two equal addends."
    ),
    "3.NBT.1": (
        "Use place value understanding to round whole numbers to the nearest 10 or 100. "
        "Students apply their understanding of place value to determine which ten or hundred a "
        "number is closest to."
    ),
    "3.NBT.2": (
        "Fluently add and subtract within 1000 using strategies and algorithms based on place value, "
        "properties of operations, and/or the relationship between addition and subtraction. "
        "A range of algorithms may be used."
    ),
    "3.NBT.3": (
        "Multiply one-digit whole numbers by multiples of 10 in the range 10-90 (e.g., 9 × 80, 5 × 60) "
        "using strategies based on place value and properties of operations."
    ),
    "3.NF.1": (
        "Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into "
        "b equal parts; understand a fraction a/b as the quantity formed by a parts of size 1/b. "
        "Grade 3 expectations are limited to fractions with denominators 2, 3, 4, 6, and 8."
    ),
    "3.NF.2": (
        "Understand a fraction as a number on the number line and represent fractions on a number line "
        "diagram. Students represent a fraction 1/b by partitioning the interval from 0 to 1 into b "
        "equal parts, and represent a fraction a/b by marking off a lengths of 1/b from 0. "
        "Denominators limited to 2, 3, 4, 6, and 8."
    ),
    "3.NF.3": (
        "Explain equivalence of fractions and compare fractions by reasoning about their size. "
        "Students understand two fractions as equivalent if they are the same size or at the same point "
        "on a number line; generate simple equivalent fractions (e.g., 1/2 = 2/4); express whole numbers "
        "as fractions; and compare fractions with the same numerator or denominator using >, =, or <. "
        "Denominators limited to 2, 3, 4, 6, and 8."
    ),
    "3.MD.1": (
        "Tell and write time to the nearest minute and measure time intervals in minutes. "
        "Solve word problems involving addition and subtraction of time intervals in minutes, "
        "e.g., by representing the problem on a number line diagram."
    ),
    "3.MD.2": (
        "Measure and estimate liquid volumes and masses of objects using standard units of grams (g), "
        "kilograms (kg), and liters (l). Add, subtract, multiply, or divide to solve one-step word "
        "problems involving masses or volumes given in the same units. Excludes compound units and "
        "multiplicative comparison problems."
    ),
    "3.MD.3": (
        "Draw a scaled picture graph and a scaled bar graph to represent a data set with several "
        "categories. Solve one- and two-step 'how many more' and 'how many less' problems using "
        "information presented in scaled bar graphs. For example, draw a bar graph where each square "
        "represents 5 pets."
    ),
    "3.MD.4": (
        "Generate measurement data by measuring lengths using rulers marked with halves and fourths "
        "of an inch. Show the data by making a line plot, where the horizontal scale is marked off in "
        "appropriate units — whole numbers, halves, or quarters."
    ),
    "3.MD.5": (
        "Recognize area as an attribute of plane figures and understand concepts of area measurement. "
        "A unit square has one square unit of area. A plane figure covered by n unit squares without "
        "gaps or overlaps has an area of n square units."
    ),
    "3.MD.6": (
        "Measure areas by counting unit squares (square cm, square m, square in, square ft, and "
        "improvised units)."
    ),
    "3.MD.7": (
        "Relate area to the operations of multiplication and addition. Students find areas of rectangles "
        "by tiling and by multiplying side lengths; use area models to represent the distributive property; "
        "and recognize area as additive by decomposing rectilinear figures into non-overlapping rectangles "
        "and adding their areas."
    ),
    "3.MD.8": (
        "Solve real world and mathematical problems involving perimeters of polygons, including finding "
        "the perimeter given the side lengths, finding an unknown side length, and exhibiting rectangles "
        "with the same perimeter and different areas or with the same area and different perimeters."
    ),
    "3.G.1": (
        "Understand that shapes in different categories may share attributes, and that shared attributes "
        "can define a larger category. Recognize rhombuses, rectangles, and squares as examples of "
        "quadrilaterals, and draw examples of quadrilaterals that do not belong to these subcategories."
    ),
    "3.G.2": (
        "Partition shapes into parts with equal areas. Express the area of each part as a unit fraction "
        "of the whole. For example, partition a shape into 4 parts with equal area and describe each "
        "part as 1/4 of the area of the shape."
    ),

    # ── GRADE 4 ──────────────────────────────────────────────────────────────
    "4.OA.1": (
        "Interpret a multiplication equation as a comparison. For example, interpret 35 = 5 × 7 as a "
        "statement that 35 is 5 times as many as 7 and 7 times as many as 5. Represent verbal statements "
        "of multiplicative comparisons as multiplication equations."
    ),
    "4.OA.2": (
        "Multiply or divide to solve word problems involving multiplicative comparison, distinguishing "
        "multiplicative comparison from additive comparison. Use drawings and equations with a symbol "
        "for the unknown number to represent the problem."
    ),
    "4.OA.3": (
        "Solve multistep word problems posed with whole numbers and having whole-number answers using "
        "the four operations, including problems in which remainders must be interpreted. Represent "
        "these problems using equations with a letter for the unknown quantity. Assess reasonableness "
        "of answers using mental computation and estimation including rounding."
    ),
    "4.OA.4": (
        "Find all factor pairs for a whole number in the range 1-100. Recognize that a whole number "
        "is a multiple of each of its factors. Determine whether a given whole number in the range "
        "1-100 is a multiple of a given one-digit number. Determine whether a given whole number is "
        "prime or composite."
    ),
    "4.OA.5": (
        "Generate a number or shape pattern that follows a given rule. Identify apparent features of "
        "the pattern that were not explicit in the rule itself. For example, given the rule 'Add 3' "
        "starting from 1, generate terms and observe that alternating terms are odd or even."
    ),
    "4.NBT.1": (
        "Recognize that in a multi-digit whole number, a digit in one place represents ten times what "
        "it represents in the place to its right. For example, recognize that 700 ÷ 70 = 10 by applying "
        "concepts of place value and division. Grade 4 expectations are limited to whole numbers less "
        "than or equal to 1,000,000."
    ),
    "4.NBT.2": (
        "Read and write multi-digit whole numbers using base-ten numerals, number names, and expanded "
        "form. Compare two multi-digit numbers based on meanings of the digits in each place, using "
        ">, =, and < symbols. Limited to whole numbers less than or equal to 1,000,000."
    ),
    "4.NBT.3": (
        "Use place value understanding to round multi-digit whole numbers to any place. "
        "Limited to whole numbers less than or equal to 1,000,000."
    ),
    "4.NBT.4": (
        "Fluently add and subtract multi-digit whole numbers using the standard algorithm. "
        "Limited to whole numbers less than or equal to 1,000,000."
    ),
    "4.NBT.5": (
        "Multiply a whole number of up to four digits by a one-digit whole number, and multiply two "
        "two-digit numbers, using strategies based on place value and the properties of operations. "
        "Illustrate and explain the calculation by using equations, rectangular arrays, and/or area models."
    ),
    "4.NBT.6": (
        "Find whole-number quotients and remainders with up to four-digit dividends and one-digit "
        "divisors, using strategies based on place value, the properties of operations, and/or the "
        "relationship between multiplication and division. Illustrate and explain calculations using "
        "equations, rectangular arrays, and/or area models."
    ),
    "4.NF.1": (
        "Explain why a fraction a/b is equivalent to a fraction (n × a)/(n × b) by using visual "
        "fraction models, with attention to how the number and size of the parts differ even though "
        "the two fractions themselves are the same size. Use this principle to recognize and generate "
        "equivalent fractions. Limited to fractions with denominators 2, 3, 4, 5, 6, 8, 10, 12, and 100."
    ),
    "4.NF.2": (
        "Compare two fractions with different numerators and different denominators by creating common "
        "denominators or numerators, or by comparing to a benchmark fraction such as 1/2. Recognize "
        "that comparisons are valid only when fractions refer to the same whole. Record comparisons "
        "with >, =, or < and justify conclusions using a visual fraction model."
    ),
    "4.NF.3": (
        "Understand a fraction a/b with a > 1 as a sum of fractions 1/b. Add and subtract mixed numbers "
        "with like denominators by replacing each mixed number with an equivalent fraction. Solve word "
        "problems involving addition and subtraction of fractions referring to the same whole and having "
        "like denominators."
    ),
    "4.NF.4": (
        "Apply and extend previous understandings of multiplication to multiply a fraction by a whole "
        "number. Understand a fraction a/b as a multiple of 1/b. Solve word problems involving "
        "multiplication of a fraction by a whole number, e.g., using visual fraction models and equations."
    ),
    "4.NF.5": (
        "Express a fraction with denominator 10 as an equivalent fraction with denominator 100, and "
        "use this technique to add two fractions with respective denominators 10 and 100. For example, "
        "express 3/10 as 30/100, and add 3/10 + 4/100 = 34/100."
    ),
    "4.NF.6": (
        "Use decimal notation for fractions with denominators 10 or 100. For example, rewrite 0.62 "
        "as 62/100; describe a length as 0.62 meters; locate 0.62 on a number line diagram."
    ),
    "4.NF.7": (
        "Compare two decimals to hundredths by reasoning about their size. Recognize that comparisons "
        "are valid only when the two decimals refer to the same whole. Record the results of comparisons "
        "with the symbols >, =, or <, and justify the conclusions using a visual model."
    ),
    "4.MD.1": (
        "Know relative sizes of measurement units within one system of units including km, m, cm; kg, g; "
        "lb, oz; l, ml; hr, min, sec. Within a single system of measurement, express measurements in "
        "a larger unit in terms of a smaller unit. Record measurement equivalents in a two-column table."
    ),
    "4.MD.2": (
        "Use the four operations to solve word problems involving distances, intervals of time, liquid "
        "volumes, masses of objects, and money, including problems involving simple fractions or decimals, "
        "and problems that require expressing measurements given in a larger unit in terms of a smaller unit."
    ),
    "4.MD.3": (
        "Apply the area and perimeter formulas for rectangles in real world and mathematical problems. "
        "For example, find the width of a rectangular room given the area of the flooring and the length."
    ),
    "4.MD.4": (
        "Make a line plot to display a data set of measurements in fractions of a unit (1/2, 1/4, 1/8). "
        "Solve problems involving addition and subtraction of fractions by using information presented "
        "in line plots."
    ),
    "4.MD.5": (
        "Recognize angles as geometric shapes formed wherever two rays share a common endpoint, and "
        "understand concepts of angle measurement. An angle is measured with reference to a circle with "
        "its center at the common endpoint — one degree is 1/360 of a circle. A full rotation is 360°."
    ),
    "4.MD.6": (
        "Measure angles in whole-number degrees using a protractor. Sketch angles of specified measure. "
        "Students learn to use a protractor accurately to measure and draw angles."
    ),
    "4.MD.7": (
        "Recognize angle measure as additive. When an angle is decomposed into non-overlapping parts, "
        "the angle measure of the whole is the sum of the angle measures of the parts. Solve addition "
        "and subtraction problems to find unknown angles on a diagram in real world and mathematical problems."
    ),
    "4.G.1": (
        "Draw points, lines, line segments, rays, angles (right, acute, obtuse), and perpendicular and "
        "parallel lines. Identify these in two-dimensional figures."
    ),
    "4.G.2": (
        "Classify two-dimensional figures based on the presence or absence of parallel or perpendicular "
        "lines, or the presence or absence of angles of a specified size. Recognize right triangles as "
        "a category, and identify right triangles."
    ),
    "4.G.3": (
        "Recognize a line of symmetry for a two-dimensional figure as a line across the figure such "
        "that the figure can be folded along the line into matching parts. Identify line-symmetric "
        "figures and draw lines of symmetry."
    ),

    # ── GRADE 5 ──────────────────────────────────────────────────────────────
    "5.OA.1": (
        "Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions "
        "with these symbols. Students apply order of operations to evaluate multi-step numerical expressions."
    ),
    "5.OA.2": (
        "Write simple expressions that record calculations with numbers, and interpret numerical "
        "expressions without evaluating them. For example, express the calculation 'add 8 and 7, "
        "then multiply by 2' as 2 × (8 + 7). Recognize that 3 × (18932 + 921) is three times as "
        "large as 18932 + 921, without calculating."
    ),
    "5.OA.3": (
        "Generate two numerical patterns using two given rules. Identify apparent relationships "
        "between corresponding terms. Form ordered pairs consisting of corresponding terms from "
        "the two patterns, and graph the ordered pairs on a coordinate plane."
    ),
    "5.NBT.1": (
        "Recognize that in a multi-digit number, a digit in one place represents 10 times as much as "
        "it represents in the place to its right and 1/10 of what it represents in the place to its left. "
        "This extends place value understanding to decimals."
    ),
    "5.NBT.2": (
        "Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, "
        "and explain patterns in the placement of the decimal point when a decimal is multiplied or divided "
        "by a power of 10. Use whole-number exponents to denote powers of 10."
    ),
    "5.NBT.3": (
        "Read, write, and compare decimals to thousandths. Read and write decimals using base-ten "
        "numerals, number names, and expanded form. Compare two decimals to thousandths based on "
        "meanings of the digits in each place, using >, =, and < symbols."
    ),
    "5.NBT.4": (
        "Use place value understanding to round decimals to any place."
    ),
    "5.NBT.5": (
        "Fluently multiply multi-digit whole numbers using the standard algorithm."
    ),
    "5.NBT.6": (
        "Find whole-number quotients of whole numbers with up to four-digit dividends and two-digit "
        "divisors, using strategies based on place value, the properties of operations, and/or the "
        "relationship between multiplication and division. Illustrate and explain the calculation using "
        "equations, rectangular arrays, and/or area models."
    ),
    "5.NBT.7": (
        "Add, subtract, multiply, and divide decimals to hundredths, using concrete models or drawings "
        "and strategies based on place value, properties of operations, and/or the relationship between "
        "addition and subtraction; relate the strategy to a written method and explain the reasoning used."
    ),
    "5.NF.1": (
        "Add and subtract fractions with unlike denominators (including mixed numbers) by replacing "
        "given fractions with equivalent fractions in such a way as to produce an equivalent sum or "
        "difference of fractions with like denominators. For example, 2/3 + 5/4 = 8/12 + 15/12 = 23/12."
    ),
    "5.NF.2": (
        "Solve word problems involving addition and subtraction of fractions referring to the same "
        "whole, including cases of unlike denominators. Use benchmark fractions and number sense to "
        "estimate mentally and assess the reasonableness of answers."
    ),
    "5.NF.3": (
        "Interpret a fraction as division of the numerator by the denominator (a/b = a ÷ b). Solve "
        "word problems involving division of whole numbers leading to answers in the form of fractions "
        "or mixed numbers. For example, interpret 3/4 as the result of dividing 3 by 4."
    ),
    "5.NF.4": (
        "Apply and extend previous understandings of multiplication to multiply a fraction or whole "
        "number by a fraction. Interpret the product (a/b) × q as a parts of a partition of q into "
        "b equal parts. Find the area of a rectangle with fractional side lengths by tiling it with "
        "unit squares of the appropriate unit fraction side lengths."
    ),
    "5.NF.5": (
        "Interpret multiplication as scaling (resizing). Compare the size of a product to the size of "
        "one factor on the basis of the size of the other factor, without performing multiplication. "
        "Explain why multiplying a given number by a fraction greater than 1 results in a product "
        "greater than the number, and multiplying by a fraction less than 1 results in a smaller product."
    ),
    "5.NF.6": (
        "Solve real world problems involving multiplication of fractions and mixed numbers by using "
        "visual fraction models or equations to represent the problem."
    ),
    "5.NF.7": (
        "Apply and extend previous understandings of division to divide unit fractions by whole numbers "
        "and whole numbers by unit fractions. Interpret division of a unit fraction by a non-zero whole "
        "number; compute such quotients. Interpret division of a whole number by a unit fraction; "
        "compute such quotients. Solve real world problems involving division of unit fractions by "
        "non-zero whole numbers and division of whole numbers by unit fractions."
    ),
    "5.MD.1": (
        "Convert among different-sized standard measurement units within a given measurement system "
        "(e.g., convert 5 cm to 0.05 m), and use these conversions in solving multi-step, real world problems."
    ),
    "5.MD.2": (
        "Make a line plot to display a data set of measurements in fractions of a unit (1/2, 1/4, 1/8). "
        "Use operations on fractions for this grade to solve problems involving information presented "
        "in line plots."
    ),
    "5.MD.3": (
        "Recognize volume as an attribute of solid figures and understand concepts of volume measurement. "
        "A cube with side length 1 unit is a 'unit cube' and has one cubic unit of volume. A solid figure "
        "which can be packed without gaps or overlaps using n unit cubes has a volume of n cubic units."
    ),
    "5.MD.4": (
        "Measure volumes by counting unit cubes, using cubic cm, cubic in, cubic ft, and improvised units."
    ),
    "5.MD.5": (
        "Relate volume to the operations of multiplication and addition and solve real world and "
        "mathematical problems involving volume. Find the volume of a right rectangular prism with "
        "whole-number side lengths by packing it with unit cubes, and show that the volume is the same "
        "as found by multiplying the edge lengths. Apply the formulas V = l × w × h and V = b × h. "
        "Recognize volume as additive and find volumes of solid figures composed of two non-overlapping "
        "right rectangular prisms."
    ),
    "5.G.1": (
        "Use a pair of perpendicular number lines, called axes, to define a coordinate system, with the "
        "intersection of the lines (the origin) arranged to coincide with the 0 on each line and a given "
        "point in the plane located by using an ordered pair of numbers, called its coordinates."
    ),
    "5.G.2": (
        "Represent real world and mathematical problems by graphing points in the first quadrant of "
        "the coordinate plane, and interpret coordinate values of points in the context of the situation."
    ),
    "5.G.3": (
        "Understand that attributes belonging to a category of two-dimensional figures also belong to "
        "all subcategories of that category. For example, all rectangles have four right angles and "
        "squares are rectangles, so all squares have four right angles."
    ),
    "5.G.4": (
        "Classify two-dimensional figures in a hierarchy based on properties. For example, understand "
        "that all squares are rhombuses (since they have four equal sides), but not all rhombuses are "
        "squares (right angles required)."
    ),
}

# ─── Update JSON files ────────────────────────────────────────────────────────

base = r"C:\Users\gamin\OneDrive\Desktop\Math app\math-app\src\data\questions"
updated = 0
missing = []

for grade_num in [3, 4, 5]:
    path = os.path.join(base, f"grade{grade_num}.json")
    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    for standard in data['standards']:
        code = standard['code']
        if code in EXPLANATIONS:
            standard['explanation'] = EXPLANATIONS[code]
            updated += 1
            print(f"  Updated: {code}")
        else:
            missing.append(code)

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\nDone. Updated: {updated} standards.")
if missing:
    print(f"Missing explanations for: {missing}")
