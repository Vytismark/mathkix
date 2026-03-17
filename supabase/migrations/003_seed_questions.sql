-- ============================================================================
-- 003_seed_questions.sql
-- Diagnostic questions for grade placement (Grade 1-5, CCSSM-aligned)
-- Grade 1: 21 standards | Grade 2: 26 standards | Grade 3: 25 standards | Grade 4: 28 standards | Grade 5: 26 standards
-- 2 diagnostic questions per standard per difficulty
-- ============================================================================

DELETE FROM diagnostic_questions;

INSERT INTO diagnostic_questions
  (grade_level, domain, standard_code, question_text, question_type, options, correct_answer, difficulty)
VALUES
(1,'1.OA','1.OA.1','Tom has 3 apples. He gets 2 more. How many apples does he have now?','numeric',NULL,'5',1),
(1,'1.OA','1.OA.1','Sara has 6 flowers. She gives 1 away. How many flowers does she have left?','numeric',NULL,'5',1),
(1,'1.OA','1.OA.1','There were 12 children at the park. 5 went home. How many are still at the park?','numeric',NULL,'7',2),
(1,'1.OA','1.OA.1','Jake scored 7 points in game 1 and 8 points in game 2. How many points total?','numeric',NULL,'15',2),
(1,'1.OA','1.OA.1','Lily read 8 pages on Monday and some pages on Tuesday. She read 17 pages in total. How many pages did she read on Tuesday?','numeric',NULL,'9',3),
(1,'1.OA','1.OA.1','Sam had some toy cars. He got 7 more and now has 15. How many did he start with?','numeric',NULL,'8',3),
(1,'1.OA','1.OA.2','2 + 3 + 1 = ?','numeric',NULL,'6',1),
(1,'1.OA','1.OA.2','1 + 4 + 2 = ?','numeric',NULL,'7',1),
(1,'1.OA','1.OA.2','4 + 6 + 3 = ?','numeric',NULL,'13',2),
(1,'1.OA','1.OA.2','5 + 3 + 7 = ?','numeric',NULL,'15',2),
(1,'1.OA','1.OA.2','8 + 4 + 5 = ?','numeric',NULL,'17',3),
(1,'1.OA','1.OA.2','Find three different numbers that add up to 18.','numeric',NULL,'Many valid answers, e.g. 5 + 6 + 7 = 18',3),
(1,'1.OA','1.OA.3','If 5 + 3 = 8, what is 3 + 5?','numeric',NULL,'8',1),
(1,'1.OA','1.OA.3','If 7 + 2 = 9, what is 2 + 7?','numeric',NULL,'9',1),
(1,'1.OA','1.OA.3','(3 + 7) + 6 = ? Use the grouping that makes it easiest.','numeric',NULL,'16',2),
(1,'1.OA','1.OA.3','8 + (2 + 5) = ?','numeric',NULL,'15',2),
(1,'1.OA','1.OA.3','5 + (5 + 8) = ? Show two different ways to solve it.','numeric',NULL,'18',3),
(1,'1.OA','1.OA.3','If 7 + 9 = 16, write two subtraction sentences using the same numbers.','numeric',NULL,'16 - 7 = 9 and 16 - 9 = 7',3),
(1,'1.OA','1.OA.4','5 - 2 = ? Think: 2 + ? = 5','numeric',NULL,'3',1),
(1,'1.OA','1.OA.4','7 - 3 = ? Think: 3 + ? = 7','numeric',NULL,'4',1),
(1,'1.OA','1.OA.4','10 - 6 = ? Think: 6 + ? = 10','numeric',NULL,'4',2),
(1,'1.OA','1.OA.4','12 - 7 = ? Think: 7 + ? = 12','numeric',NULL,'5',2),
(1,'1.OA','1.OA.4','16 - 9 = ? Write it as an unknown addend equation and solve.','numeric',NULL,'7',3),
(1,'1.OA','1.OA.4','Write both a subtraction and an unknown-addend equation for: ? relates 9 and 18.','numeric',NULL,'18 - 9 = 9 and 9 + ? = 18, ? = 9',3),
(1,'1.OA','1.OA.5','Start at 4 and count on 2. What number do you land on?','numeric',NULL,'6',1),
(1,'1.OA','1.OA.5','Start at 7 and count back 3. What number do you land on?','numeric',NULL,'4',1),
(1,'1.OA','1.OA.5','To find 13 - 5, count up from 5 to 13. How many counts is that?','numeric',NULL,'8',2),
(1,'1.OA','1.OA.5','11 - 7 = ? Count up from 7 to 11 to find the answer.','numeric',NULL,'4',2),
(1,'1.OA','1.OA.5','Mia counts up 8 times starting at 9. Write an addition equation and give the answer.','numeric',NULL,'9 + 8 = 17',3),
(1,'1.OA','1.OA.5','A frog jumps back 5 spaces from 14 on a number line. Write a subtraction equation.','numeric',NULL,'14 - 5 = 9',3),
(1,'1.OA','1.OA.6','4 + 3 = ?','numeric',NULL,'7',1),
(1,'1.OA','1.OA.6','9 - 4 = ?','numeric',NULL,'5',1),
(1,'1.OA','1.OA.6','7 + 6 = ? (Use near-doubles)','numeric',NULL,'13',2),
(1,'1.OA','1.OA.6','8 + 5 = ? (Use make-a-ten)','numeric',NULL,'13',2),
(1,'1.OA','1.OA.6','16 - 8 = ?','numeric',NULL,'8',3),
(1,'1.OA','1.OA.6','9 + 8 = ?','numeric',NULL,'17',3),
(1,'1.OA','1.OA.7','Is 3 + 4 = 7 true or false?','numeric',NULL,'True',1),
(1,'1.OA','1.OA.7','Is 5 - 2 = 4 true or false?','numeric',NULL,'False',1),
(1,'1.OA','1.OA.7','Is 4 + 5 = 3 + 6 true or false?','numeric',NULL,'True',2),
(1,'1.OA','1.OA.7','Is 7 - 2 = 6 - 1 true or false?','numeric',NULL,'True',2),
(1,'1.OA','1.OA.7','7 + ? = 4 + 6. What is the missing number?','numeric',NULL,'3',3),
(1,'1.OA','1.OA.7','Is 12 - 5 = 3 + 4 true or false?','numeric',NULL,'True',3),
(1,'1.OA','1.OA.8','3 + 4 = ?','numeric',NULL,'7',1),
(1,'1.OA','1.OA.8','8 - 3 = ?','numeric',NULL,'5',1),
(1,'1.OA','1.OA.8','? + 7 = 15','numeric',NULL,'8',2),
(1,'1.OA','1.OA.8','13 - ? = 5','numeric',NULL,'8',2),
(1,'1.OA','1.OA.8','? + 9 = 20','numeric',NULL,'11',3),
(1,'1.OA','1.OA.8','18 - ? = 9','numeric',NULL,'9',3),
(1,'1.NBT','1.NBT.1','What number comes after 15?','numeric',NULL,'16',1),
(1,'1.NBT','1.NBT.1','What number comes before 10?','numeric',NULL,'9',1),
(1,'1.NBT','1.NBT.1','What number comes after 99?','numeric',NULL,'100',2),
(1,'1.NBT','1.NBT.1','Count by 10s: 10, 20, 30, __, 50. What is missing?','numeric',NULL,'40',2),
(1,'1.NBT','1.NBT.1','Start at 97 and count to 103. Write all the numbers.','numeric',NULL,'97, 98, 99, 100, 101, 102, 103',3),
(1,'1.NBT','1.NBT.1','Write the number that is 1 less than 120.','numeric',NULL,'119',3),
(1,'1.NBT','1.NBT.2','How many tens and ones are in 24?','numeric',NULL,'2 tens and 4 ones',1),
(1,'1.NBT','1.NBT.2','What number has 1 ten and 5 ones?','numeric',NULL,'15',1),
(1,'1.NBT','1.NBT.2','What is the value of the digit 5 in 57?','numeric',NULL,'50 (5 tens)',2),
(1,'1.NBT','1.NBT.2','40 + 8 = ?','numeric',NULL,'48',2),
(1,'1.NBT','1.NBT.2','58 = 5 tens + ? ones','numeric',NULL,'8',3),
(1,'1.NBT','1.NBT.2','Write two different ways to show 43 using tens and ones.','numeric',NULL,'4 tens 3 ones; or 3 tens 13 ones',3),
(1,'1.NBT','1.NBT.3','Which is greater: 34 or 38?','numeric',NULL,'38',1),
(1,'1.NBT','1.NBT.3','Use >, =, or < to compare: 25 __ 25','numeric',NULL,'=',1),
(1,'1.NBT','1.NBT.3','Use >, =, or < to compare: 53 __ 49','numeric',NULL,'>',2),
(1,'1.NBT','1.NBT.3','Which is greater: 81 or 78?','numeric',NULL,'81',2),
(1,'1.NBT','1.NBT.3','Name two numbers between 30 and 40 where one is greater, and write a comparison.','numeric',NULL,'e.g., 37 > 32',3),
(1,'1.NBT','1.NBT.3','My number is less than 75 and greater than 72. What could it be?','numeric',NULL,'73 or 74',3),
(1,'1.NBT','1.NBT.4','30 + 20 = ?','numeric',NULL,'50',1),
(1,'1.NBT','1.NBT.4','45 + 10 = ?','numeric',NULL,'55',1),
(1,'1.NBT','1.NBT.4','43 + 5 = ?','numeric',NULL,'48',2),
(1,'1.NBT','1.NBT.4','61 + 7 = ?','numeric',NULL,'68',2),
(1,'1.NBT','1.NBT.4','47 + 6 = ?','numeric',NULL,'53',3),
(1,'1.NBT','1.NBT.4','68 + 5 = ?','numeric',NULL,'73',3),
(1,'1.NBT','1.NBT.5','What is 10 more than 23?','numeric',NULL,'33',1),
(1,'1.NBT','1.NBT.5','What is 10 less than 35?','numeric',NULL,'25',1),
(1,'1.NBT','1.NBT.5','What is 10 more than 78?','numeric',NULL,'88',2),
(1,'1.NBT','1.NBT.5','What is 10 less than 91?','numeric',NULL,'81',2),
(1,'1.NBT','1.NBT.5','Start at 45. Add 10 three times. Where do you end up?','numeric',NULL,'75',3),
(1,'1.NBT','1.NBT.5','What is 10 more than 10 less than 67?','numeric',NULL,'67',3),
(1,'1.NBT','1.NBT.6','50 - 10 = ?','numeric',NULL,'40',1),
(1,'1.NBT','1.NBT.6','30 - 20 = ?','numeric',NULL,'10',1),
(1,'1.NBT','1.NBT.6','74 - 30 = ?','numeric',NULL,'44',2),
(1,'1.NBT','1.NBT.6','87 - 50 = ?','numeric',NULL,'37',2),
(1,'1.NBT','1.NBT.6','? - 40 = 35. What is the missing number?','numeric',NULL,'75',3),
(1,'1.NBT','1.NBT.6','90 - ? = 20. What is the missing number?','numeric',NULL,'70',3),
(1,'1.MD','1.MD.1','A pencil is 7 inches long. A crayon is 4 inches long. Which is longer?','numeric',NULL,'The pencil',1),
(1,'1.MD','1.MD.1','A book is taller than a cup. A cup is taller than a coin. Which is tallest?','numeric',NULL,'The book',1),
(1,'1.MD','1.MD.1','A red stick is longer than a blue stick. The blue stick is longer than a yellow stick. Order from longest to shortest.','numeric',NULL,'Red, blue, yellow',2),
(1,'1.MD','1.MD.1','String A is 12 cm. String B is 9 cm. String C is 15 cm. Order from shortest to longest.','numeric',NULL,'B, A, C',2),
(1,'1.MD','1.MD.1','Four strings: A = 10 cm, B = 7 cm, C = 13 cm, D = 10 cm. Which two are equal? Order all four from shortest to longest.','numeric',NULL,'A and D are equal; order: B, A = D, C',3),
(1,'1.MD','1.MD.1','A worm is shorter than a pencil. A pencil is shorter than a ruler. A ruler is shorter than a table. Which is the longest?','numeric',NULL,'The table',3),
(1,'1.MD','1.MD.2','A pencil is as long as 5 paper clips placed end to end. How long is the pencil?','numeric',NULL,'5 paper clips',1),
(1,'1.MD','1.MD.2','A book is 4 crayons long. A ruler is 8 crayons long. Which is longer?','numeric',NULL,'The ruler',1),
(1,'1.MD','1.MD.2','Object A is 6 paper clips long. Object B is 4 paper clips long. Which is longer and by how much?','numeric',NULL,'Object A; by 2 paper clips',2),
(1,'1.MD','1.MD.2','The same object measures 4 blocks long OR 8 buttons long. Which unit is bigger - a block or a button?','numeric',NULL,'A block',2),
(1,'1.MD','1.MD.2','A pencil is 6 buttons long. An eraser needs to measure 18 buttons long. How many pencils long is the eraser?','numeric',NULL,'3 pencils',3),
(1,'1.MD','1.MD.2','Which ruler is shorter: one that measures a table as 4 units, or one that measures the same table as 8 units?','numeric',NULL,'The ruler that gives 8 units (the shorter ruler)',3),
(1,'1.MD','1.MD.3','The clock shows the hour hand on 3 and the minute hand on 12. What time is it?','numeric',NULL,'3:00 (3 o''clock)',1),
(1,'1.MD','1.MD.3','What does 5:00 mean?','numeric',NULL,'5 o''clock',1),
(1,'1.MD','1.MD.3','The minute hand is on 6 and the hour hand is between 4 and 5. What time is it?','numeric',NULL,'4:30',2),
(1,'1.MD','1.MD.3','What time is half past 2?','numeric',NULL,'2:30',2),
(1,'1.MD','1.MD.3','School starts at 8 o''clock. Write this time two ways.','numeric',NULL,'8:00 and "8 o''clock"',3),
(1,'1.MD','1.MD.3','If it is 3:00 now, what time will it be in half an hour?','numeric',NULL,'3:30',3),
(1,'1.MD','1.MD.4','5 students chose apples and 3 chose bananas. How many students chose fruit in all?','numeric',NULL,'8',1),
(1,'1.MD','1.MD.4','A chart shows 4 cats and 6 dogs. Which has more?','numeric',NULL,'Dogs',1),
(1,'1.MD','1.MD.4','Favorite colors: Red = 5, Blue = 3, Green = 7. Which color got the most votes?','numeric',NULL,'Green',2),
(1,'1.MD','1.MD.4','A graph shows: apples = 6, bananas = 4, oranges = 5. How many fruit were counted in all?','numeric',NULL,'15',2),
(1,'1.MD','1.MD.4','Favorite lunch: Pizza = 9, Sandwich = 6, Salad = 3. How many more students chose pizza than sandwich and salad combined?','numeric',NULL,'0 (they are equal)',3),
(1,'1.MD','1.MD.4','A class surveyed 20 students about pets. Dogs = 8, Cats = 7. How many students chose neither?','numeric',NULL,'5',3),
(1,'1.G','1.G.1','How many sides does a triangle have?','numeric',NULL,'3',1),
(1,'1.G','1.G.1','How many corners does a square have?','numeric',NULL,'4',1),
(1,'1.G','1.G.1','Maria has a yellow triangle and a blue triangle. What makes both shapes triangles?','numeric',NULL,'Both have 3 sides and 3 corners',2),
(1,'1.G','1.G.1','Sort these into defining vs. non-defining attributes: color, number of sides, size, number of corners.','numeric',NULL,'Defining: number of sides, number of corners. Non-defining: color, size',2),
(1,'1.G','1.G.1','Jake says this shape is not a square because it is blue. Is he right?','numeric',NULL,'No',3),
(1,'1.G','1.G.1','Name a non-defining attribute for a triangle. Explain why it is non-defining.','numeric',NULL,'e.g., Color. It does not affect the number of sides or corners.',3),
(1,'1.G','1.G.2','What shape do you make when you put two equal right triangles together along their longest sides?','numeric',NULL,'A rectangle (or square)',1),
(1,'1.G','1.G.2','Name a 3D shape that looks like a soup can.','numeric',NULL,'Cylinder',1),
(1,'1.G','1.G.2','A large equilateral triangle can be made from how many smaller equal triangles?','numeric',NULL,'4',2),
(1,'1.G','1.G.2','How many faces does a rectangular prism have?','numeric',NULL,'6',2),
(1,'1.G','1.G.2','Ben has 4 small cubes. He stacks 2 and places 2 side by side. What shape does he create?','numeric',NULL,'A larger rectangular prism',3),
(1,'1.G','1.G.2','Name three real-world objects shaped like a sphere.','numeric',NULL,'e.g., ball, globe, orange',3),
(1,'1.G','1.G.3','A circle is cut into 2 equal pieces. What is each piece called?','numeric',NULL,'A half',1),
(1,'1.G','1.G.3','If you fold a rectangle into 2 equal parts, how many halves are there?','numeric',NULL,'2 halves',1),
(1,'1.G','1.G.3','A circle is cut into 4 equal pieces. What is each piece called?','numeric',NULL,'A fourth, or a quarter',2),
(1,'1.G','1.G.3','If you cut a rectangle into 4 equal parts, how many fourths are there?','numeric',NULL,'4 fourths',2),
(1,'1.G','1.G.3','Can a rectangle be cut into 4 equal shares in different ways? Explain.','numeric',NULL,'Yes (e.g., 4 horizontal strips, 4 vertical strips, or a 2x2 grid - all are fourths)',3),
(1,'1.G','1.G.3','Sam cuts a circle into 2 equal pieces. Ana cuts a same-size circle into 4 equal pieces. Whose pieces are bigger?','numeric',NULL,'Sam''s (halves are bigger than fourths)',3),
(2,'2.OA','2.OA.1','Amy has 23 stickers. She gets 15 more. How many does she have now?','numeric',NULL,'38',1),
(2,'2.OA','2.OA.1','There are 45 apples in a bowl. 12 are eaten. How many remain?','numeric',NULL,'33',1),
(2,'2.OA','2.OA.1','Lily had 72 pages to read. She read 38. How many are left?','numeric',NULL,'34',2),
(2,'2.OA','2.OA.1','There are 47 boys and 35 girls in a school play. How many students in all?','numeric',NULL,'82',2),
(2,'2.OA','2.OA.1','Tyler had some books. He gave 27 away and has 45 left. How many did he start with?','numeric',NULL,'72',3),
(2,'2.OA','2.OA.1','A class collected 48 cans, then 37 more. They need 100 total. How many more do they need?','numeric',NULL,'15',3),
(2,'2.OA','2.OA.2','9 + 6 = ?','numeric',NULL,'15',1),
(2,'2.OA','2.OA.2','14 - 8 = ?','numeric',NULL,'6',1),
(2,'2.OA','2.OA.2','8 + 7 = ?','numeric',NULL,'15',2),
(2,'2.OA','2.OA.2','13 - 7 = ?','numeric',NULL,'6',2),
(2,'2.OA','2.OA.2','? + 7 = 15','numeric',NULL,'8',3),
(2,'2.OA','2.OA.2','20 - ? = 13','numeric',NULL,'7',3),
(2,'2.OA','2.OA.3','Is 6 odd or even?','numeric',NULL,'Even',1),
(2,'2.OA','2.OA.3','Is 7 odd or even?','numeric',NULL,'Odd',1),
(2,'2.OA','2.OA.3','Is 14 odd or even? How do you know?','numeric',NULL,'Even',2),
(2,'2.OA','2.OA.3','Write 18 as two equal addends.','numeric',NULL,'9 + 9 = 18',2),
(2,'2.OA','2.OA.3','Can an odd number always be written as two equal addends? Explain.','numeric',NULL,'No',3),
(2,'2.OA','2.OA.3','What happens when you add two even numbers? Give an example.','numeric',NULL,'The result is always even',3),
(2,'2.OA','2.OA.4','An array has 2 rows and 3 columns. How many objects are there?','numeric',NULL,'6',1),
(2,'2.OA','2.OA.4','Write an addition equation for a 3 x 3 array.','numeric',NULL,'3 + 3 + 3 = 9',1),
(2,'2.OA','2.OA.4','For a 3 x 4 array, write two different addition equations (one by rows, one by columns).','numeric',NULL,'4 + 4 + 4 = 12 (by rows) and 3 + 3 + 3 + 3 = 12 (by columns)',2),
(2,'2.OA','2.OA.4','A fruit tray has 5 rows with 4 oranges in each row. How many oranges?','numeric',NULL,'20',2),
(2,'2.OA','2.OA.4','For a 4 x 5 array, write two equations (by rows and by columns).','numeric',NULL,'5 + 5 + 5 + 5 = 20 and 4 + 4 + 4 + 4 + 4 = 20',3),
(2,'2.OA','2.OA.4','There are 20 objects in an array with 4 rows. How many columns?','numeric',NULL,'5 columns',3),
(2,'2.NBT','2.NBT.1','What is the value of each digit in 345?','numeric',NULL,'3 hundreds (300), 4 tens (40), 5 ones (5)',1),
(2,'2.NBT','2.NBT.1','Write 200 + 70 + 3 as a number.','numeric',NULL,'273',1),
(2,'2.NBT','2.NBT.1','What is the value of the digit 7 in 374?','numeric',NULL,'70 (7 tens)',2),
(2,'2.NBT','2.NBT.1','100 = ? tens','numeric',NULL,'10 tens',2),
(2,'2.NBT','2.NBT.1','835 = 8 hundreds + ? tens + ? ones','numeric',NULL,'3 tens and 5 ones',3),
(2,'2.NBT','2.NBT.1','Write 712 in two different ways using hundreds, tens, and ones.','numeric',NULL,'7 hundreds 1 ten 2 ones; OR 6 hundreds 11 tens 2 ones',3),
(2,'2.NBT','2.NBT.2','Skip-count by 5s: 5, 10, 15, __, 25. What is missing?','numeric',NULL,'20',1),
(2,'2.NBT','2.NBT.2','Skip-count by 10s: 10, 20, 30, __, 50. What is missing?','numeric',NULL,'40',1),
(2,'2.NBT','2.NBT.2','Skip-count by 5s starting at 45: 45, 50, 55, __','numeric',NULL,'60',2),
(2,'2.NBT','2.NBT.2','Skip-count by 10s: 65, 75, 85, __','numeric',NULL,'95',2),
(2,'2.NBT','2.NBT.2','Count backwards by 10s: 150, 140, 130, __','numeric',NULL,'120',3),
(2,'2.NBT','2.NBT.2','Skip-count by 5s: 970, 975, 980, 985, __','numeric',NULL,'990',3),
(2,'2.NBT','2.NBT.3','Write "three hundred forty-two" as a numeral.','numeric',NULL,'342',1),
(2,'2.NBT','2.NBT.3','Write 516 in words.','numeric',NULL,'Five hundred sixteen',1),
(2,'2.NBT','2.NBT.3','Write 804 in expanded form.','numeric',NULL,'800 + 0 + 4 (or 800 + 4)',2),
(2,'2.NBT','2.NBT.3','Write 600 + 90 as a number and in words.','numeric',NULL,'690; six hundred ninety',2),
(2,'2.NBT','2.NBT.3','John wrote 670 in expanded form as 600 + 7. What mistake did he make?','numeric',NULL,'He forgot the tens: it should be 600 + 70 + 0',3),
(2,'2.NBT','2.NBT.3','Write the number that has 8 hundreds, 3 ones, and 0 tens. Give its expanded form.','numeric',NULL,'803; 800 + 0 + 3',3),
(2,'2.NBT','2.NBT.4','Which is greater: 345 or 267?','numeric',NULL,'345',1),
(2,'2.NBT','2.NBT.4','Use >, =, or <: 500 __ 500','numeric',NULL,'=',1),
(2,'2.NBT','2.NBT.4','Use >, =, or <: 856 __ 865','numeric',NULL,'<',2),
(2,'2.NBT','2.NBT.4','Order from least to greatest: 204, 402, 240.','numeric',NULL,'204, 240, 402',2),
(2,'2.NBT','2.NBT.4','Name two numbers between 465 and 470.','numeric',NULL,'466, 467, 468, or 469',3),
(2,'2.NBT','2.NBT.4','Is 30 tens greater than, equal to, or less than 300?','numeric',NULL,'Equal',3),
(2,'2.NBT','2.NBT.5','34 + 25 = ?','numeric',NULL,'59',1),
(2,'2.NBT','2.NBT.5','67 - 43 = ?','numeric',NULL,'24',1),
(2,'2.NBT','2.NBT.5','47 + 35 = ?','numeric',NULL,'82',2),
(2,'2.NBT','2.NBT.5','73 - 48 = ?','numeric',NULL,'25',2),
(2,'2.NBT','2.NBT.5','99 - 54 = ?','numeric',NULL,'45',3),
(2,'2.NBT','2.NBT.5','68 + 17 + 5 = ?','numeric',NULL,'90',3),
(2,'2.NBT','2.NBT.6','21 + 34 = ?','numeric',NULL,'55',1),
(2,'2.NBT','2.NBT.6','43 + 26 = ?','numeric',NULL,'69',1),
(2,'2.NBT','2.NBT.6','13 + 24 + 35 = ?','numeric',NULL,'72',2),
(2,'2.NBT','2.NBT.6','21 + 18 + 30 = ?','numeric',NULL,'69',2),
(2,'2.NBT','2.NBT.6','14 + 26 + 33 + 17 = ?','numeric',NULL,'90',3),
(2,'2.NBT','2.NBT.6','22 + 18 + 15 + 25 = ?','numeric',NULL,'80',3),
(2,'2.NBT','2.NBT.7','234 + 152 = ?','numeric',NULL,'386',1),
(2,'2.NBT','2.NBT.7','567 - 234 = ?','numeric',NULL,'333',1),
(2,'2.NBT','2.NBT.7','347 + 285 = ?','numeric',NULL,'632',2),
(2,'2.NBT','2.NBT.7','724 - 368 = ?','numeric',NULL,'356',2),
(2,'2.NBT','2.NBT.7','587 + 248 = ?','numeric',NULL,'835',3),
(2,'2.NBT','2.NBT.7','1000 - 673 = ?','numeric',NULL,'327',3),
(2,'2.NBT','2.NBT.8','What is 10 more than 250?','numeric',NULL,'260',1),
(2,'2.NBT','2.NBT.8','What is 100 more than 300?','numeric',NULL,'400',1),
(2,'2.NBT','2.NBT.8','Start at 450. Add 100. Then subtract 10. Where are you?','numeric',NULL,'540',2),
(2,'2.NBT','2.NBT.8','620 - 100 + 10 = ?','numeric',NULL,'530',2),
(2,'2.NBT','2.NBT.8','Start at 190. Add 10. What happens?','numeric',NULL,'200',3),
(2,'2.NBT','2.NBT.8','What is 100 less than 105?','numeric',NULL,'5',3),
(2,'2.NBT','2.NBT.9','Why does 37 + 20 = 57? Explain using place value.','numeric',NULL,'Adding 20 adds 2 tens: 30 + 20 = 50, plus 7 ones = 57.',1),
(2,'2.NBT','2.NBT.9','Why is 8 + 5 the same as 5 + 8?','numeric',NULL,'Commutative property: you can add numbers in any order.',1),
(2,'2.NBT','2.NBT.9','Explain why 78 - 40 = 38 using place value.','numeric',NULL,'40 = 4 tens. 7 tens - 4 tens = 3 tens. Ones digit stays 8. Result: 38.',2),
(2,'2.NBT','2.NBT.9','Why does decomposing 9 + 7 as (9 + 1) + 6 = 16 work?','numeric',NULL,'Associative property: group 9+1=10 first, then 10+6=16. 7 is decomposed as 1+6.',2),
(2,'2.NBT','2.NBT.9','Tom said 400 + 90 + 5 = 495. Is he right? Explain.','numeric',NULL,'Yes',3),
(2,'2.NBT','2.NBT.9','Amy solved 82 - 37 by doing 82 - 40 + 3 = 45. Why does this work?','numeric',NULL,'She over-subtracted by 3, then added 3 back. This is the compensation strategy.',3),
(2,'2.MD','2.MD.1','Which tool would you use to measure a pencil: a ruler or a yardstick?','numeric',NULL,'A ruler',1),
(2,'2.MD','2.MD.1','A book is about 9 inches long. What unit is being used?','numeric',NULL,'Inches',1),
(2,'2.MD','2.MD.1','A marker is 14 cm long. A crayon is 9 cm long. Which is longer and by how much?','numeric',NULL,'The marker; by 5 cm',2),
(2,'2.MD','2.MD.1','You measure a hallway in meters and get 12 meters. How many centimeters is that?','numeric',NULL,'1200 cm',2),
(2,'2.MD','2.MD.1','About how many feet long is a car?','numeric',NULL,'About 12 to 15 feet',3),
(2,'2.MD','2.MD.1','A table is 3 feet long. How many inches is that? (1 foot = 12 inches)','numeric',NULL,'36 inches',3),
(2,'2.MD','2.MD.2','A book is 24 cm or 9 inches. Which unit gives a larger number?','numeric',NULL,'Centimeters (24)',1),
(2,'2.MD','2.MD.2','You measure a pencil and get 16 cm or about 6 inches. Which unit is smaller?','numeric',NULL,'Centimeters',1),
(2,'2.MD','2.MD.2','An object measures 4 large blocks or 8 small blocks. How many small blocks equal 1 large block?','numeric',NULL,'2 small blocks',2),
(2,'2.MD','2.MD.2','A snake is 3 feet long. Measured in yards (1 yard = 3 feet), how many yards?','numeric',NULL,'1 yard',2),
(2,'2.MD','2.MD.2','An object measured in feet gives 6. The same object measured in yards gives 2. What is the relationship between feet and yards?','numeric',NULL,'1 yard = 3 feet',3),
(2,'2.MD','2.MD.2','If a hallway is 9 meters, how many centimeters is that?','numeric',NULL,'900 cm',3),
(2,'2.MD','2.MD.3','About how long is a pencil: 7 inches, 7 feet, or 7 meters?','numeric',NULL,'7 inches',1),
(2,'2.MD','2.MD.3','About how tall is a door: 2 meters or 20 meters?','numeric',NULL,'2 meters',1),
(2,'2.MD','2.MD.3','You estimate a book is 25 cm long. The actual measurement is 28 cm. How far off was your estimate?','numeric',NULL,'3 cm',2),
(2,'2.MD','2.MD.3','A hallway is about 20 meters long. Estimate in feet. (1 meter is about 3 feet)','numeric',NULL,'About 60 feet',2),
(2,'2.MD','2.MD.3','Estimate the length of your classroom in meters, then convert to centimeters.','numeric',NULL,'About 8-10 meters; 800-1000 cm',3),
(2,'2.MD','2.MD.3','A fence post is about 1.5 meters tall. There are 8 posts spaced 1.5 meters apart. About how long is the fence?','numeric',NULL,'About 12 meters',3),
(2,'2.MD','2.MD.4','Pencil A is 12 cm. Pencil B is 7 cm. How much longer is A?','numeric',NULL,'5 cm',1),
(2,'2.MD','2.MD.4','A ribbon is 18 inches. A string is 10 inches. How much shorter is the string?','numeric',NULL,'8 inches',1),
(2,'2.MD','2.MD.4','Sam''s rope is 35 cm. Lily''s rope is 27 cm. How much longer is Sam''s?','numeric',NULL,'8 cm',2),
(2,'2.MD','2.MD.4','A red crayon is 14 cm. A blue crayon is 9 cm. How much longer is the red crayon?','numeric',NULL,'5 cm longer',2),
(2,'2.MD','2.MD.4','Strip A = 1 foot 3 inches (= 15 inches). Strip B = 9 inches. How much longer is A?','numeric',NULL,'6 inches',3),
(2,'2.MD','2.MD.4','Tower C is 79 cm. Tower A is 68 cm. How much taller is Tower C?','numeric',NULL,'11 cm',3),
(2,'2.MD','2.MD.5','A string is 25 cm. Another is 14 cm. How long are they together?','numeric',NULL,'39 cm',1),
(2,'2.MD','2.MD.5','A worm is 18 cm. It stretches to 24 cm. How much did it grow?','numeric',NULL,'6 cm',1),
(2,'2.MD','2.MD.5','A rope is 45 cm. Jake cuts off 17 cm. How much is left?','numeric',NULL,'28 cm',2),
(2,'2.MD','2.MD.5','A fence is 62 feet long. Ann painted 38 feet. How much is unpainted?','numeric',NULL,'24 feet',2),
(2,'2.MD','2.MD.5','A path is 95 meters. Workers paved 47 meters on day 1 and 28 meters on day 2. How much is left?','numeric',NULL,'20 meters',3),
(2,'2.MD','2.MD.5','A rope is cut into two equal pieces of 36 cm each. How long was the original rope?','numeric',NULL,'72 cm',3),
(2,'2.MD','2.MD.6','Show 7 + 5 on a number line. Start at 7, jump 5 right. Where do you land?','numeric',NULL,'12',1),
(2,'2.MD','2.MD.6','Show 15 - 4 on a number line. Start at 15, jump 4 left. Where do you land?','numeric',NULL,'11',1),
(2,'2.MD','2.MD.6','A number line jump goes from 35 to 52. What addition equation does this show?','numeric',NULL,'35 + 17 = 52',2),
(2,'2.MD','2.MD.6','Use a number line to solve 68 - 25.','numeric',NULL,'43',2),
(2,'2.MD','2.MD.6','On a number line, start at 15, jump 28 right, then jump 14 left. Where do you end? Write the equation.','numeric',NULL,'29; 15 + 28 - 14 = 29',3),
(2,'2.MD','2.MD.6','A jump on a number line ends at 91 and started at 54. Was it addition or subtraction? How far was the jump?','numeric',NULL,'Addition (jump right) of 37',3),
(2,'2.MD','2.MD.7','The clock shows: hour hand on 4, minute hand on 12. What time is it?','numeric',NULL,'4:00',1),
(2,'2.MD','2.MD.7','The time is 3:30. Is the minute hand on 6 or 12?','numeric',NULL,'6',1),
(2,'2.MD','2.MD.7','The minute hand points to 7. How many minutes does this show?','numeric',NULL,'35 minutes',2),
(2,'2.MD','2.MD.7','What time is shown: hour hand just past 6, minute hand on 4?','numeric',NULL,'6:20',2),
(2,'2.MD','2.MD.7','Soccer practice starts at 3:15 p.m. and ends at 4:45 p.m. How long is practice?','numeric',NULL,'1 hour 30 minutes',3),
(2,'2.MD','2.MD.7','Sam woke at 7:20 a.m. and arrived at school at 8:05 a.m. How long did the trip take?','numeric',NULL,'45 minutes',3),
(2,'2.MD','2.MD.8','You have 2 dimes and 1 nickel. How much money do you have?','numeric',NULL,'25 cents',1),
(2,'2.MD','2.MD.8','How much is 1 quarter?','numeric',NULL,'25 cents',1),
(2,'2.MD','2.MD.8','You have 1 quarter, 2 dimes, 1 nickel. How much total?','numeric',NULL,'50 cents',2),
(2,'2.MD','2.MD.8','A toy costs 67 cents. You pay with 3 quarters (75 cents). How much change?','numeric',NULL,'8 cents',2),
(2,'2.MD','2.MD.8','Ana saves $1.35. She spends $0.80. How much does she have left?','numeric',NULL,'$0.55 (55 cents)',3),
(2,'2.MD','2.MD.8','A book costs $3.50. Tom has 2 one-dollar bills and 6 quarters. Does he have enough?','numeric',NULL,'Yes - exactly $3.50',3),
(2,'2.MD','2.MD.9','A line plot shows 4 Xs above 3 and 2 Xs above 4. How many objects measured 3?','numeric',NULL,'4',1),
(2,'2.MD','2.MD.9','A line plot has Xs at: 5 (3 Xs), 6 (5 Xs), 7 (2 Xs). Which measurement is most common?','numeric',NULL,'6',1),
(2,'2.MD','2.MD.9','Five crayons measure: 6, 8, 6, 7, 8 cm. On a line plot, how many Xs go above 6?','numeric',NULL,'2 Xs',2),
(2,'2.MD','2.MD.9','A class measured pencils: 14, 15, 14, 16, 15, 14 cm. Which length appears most often?','numeric',NULL,'14 cm',2),
(2,'2.MD','2.MD.9','Line plot: 8 cm (2 Xs), 9 cm (4 Xs), 10 cm (3 Xs), 11 cm (1 X). How many objects total?','numeric',NULL,'10',3),
(2,'2.MD','2.MD.9','Using the same data above, how many objects measured more than 9 cm?','numeric',NULL,'4 (3 at 10 cm + 1 at 11 cm)',3),
(2,'2.MD','2.MD.10','A bar graph shows: dogs = 6, cats = 4. How many more dogs than cats?','numeric',NULL,'2',1),
(2,'2.MD','2.MD.10','A picture graph shows apples = 3, oranges = 5. How many fruits in all?','numeric',NULL,'8',1),
(2,'2.MD','2.MD.10','Favorite seasons: Spring=12, Summer=18, Fall=9, Winter=6. Which season got the most votes?','numeric',NULL,'Summer',2),
(2,'2.MD','2.MD.10','How many more voted for Summer than Winter in the graph above?','numeric',NULL,'12 more',2),
(2,'2.MD','2.MD.10','Bar graph: soccer=15, basketball=9, tennis=6, swimming=12. How many more chose soccer+basketball than tennis+swimming?','numeric',NULL,'6 more',3),
(2,'2.MD','2.MD.10','Bar graph scores: Ana=85, Ben=70, Carl=90, Dee=75. How much higher is the highest score than the lowest?','numeric',NULL,'20',3),
(2,'2.G','2.G.1','How many sides does a pentagon have?','numeric',NULL,'5',1),
(2,'2.G','2.G.1','How many sides does a hexagon have?','numeric',NULL,'6',1),
(2,'2.G','2.G.1','A hexagon - how many corners does it have?','numeric',NULL,'6 corners',2),
(2,'2.G','2.G.1','What is the difference between a square and a rhombus?','numeric',NULL,'A square has 4 right angles; a rhombus has 4 equal sides but angles may not be right.',2),
(2,'2.G','2.G.1','A shape has 5 equal sides. What is it? Is it a polygon?','numeric',NULL,'Regular pentagon; yes, it is a polygon',3),
(2,'2.G','2.G.1','Can a triangle be a quadrilateral?','numeric',NULL,'No',3),
(2,'2.G','2.G.2','A rectangle is divided into 2 rows and 3 columns of squares. How many squares total?','numeric',NULL,'6',1),
(2,'2.G','2.G.2','A rectangle has 4 rows of 2 squares each. How many squares?','numeric',NULL,'8',1),
(2,'2.G','2.G.2','Divide a rectangle into 3 rows and 4 columns. Write the addition equation.','numeric',NULL,'4 + 4 + 4 = 12',2),
(2,'2.G','2.G.2','A rectangle has 20 squares in 4 equal rows. How many squares are in each row?','numeric',NULL,'5',2),
(2,'2.G','2.G.2','A rectangle has 24 squares in 4 equal rows. How many are in each row?','numeric',NULL,'6',3),
(2,'2.G','2.G.2','Two rectangles: one is 3 x 5, the other is 5 x 3. Do they have the same number of squares?','numeric',NULL,'Yes, both have 15',3),
(2,'2.G','2.G.3','A circle is divided into 3 equal parts. What is each part called?','numeric',NULL,'A third',1),
(2,'2.G','2.G.3','A rectangle is divided into 4 equal parts. What is each part called?','numeric',NULL,'A fourth or a quarter',1),
(2,'2.G','2.G.3','Which is smallest: one-half, one-third, or one-fourth?','numeric',NULL,'One-fourth',2),
(2,'2.G','2.G.3','A pie is cut into 3 equal pieces. Two pieces are eaten. How much is left?','numeric',NULL,'One-third',2),
(2,'2.G','2.G.3','Can a circle be divided into thirds? How?','numeric',NULL,'Yes, by making 3 equal-sized "pie slices" (each 120 degrees)',3),
(2,'2.G','2.G.3','A shape is divided into 4 equal parts that are not all the same shape. Can these still be called fourths?','numeric',NULL,'Yes',3),
(3,'3.OA','3.OA.1','What does 3 x 4 mean?','numeric',NULL,'3 groups of 4, which equals 12',1),
(3,'3.OA','3.OA.1','There are 2 bags with 5 apples each. Write a multiplication equation.','numeric',NULL,'2 x 5 = 10',1),
(3,'3.OA','3.OA.1','Describe a real-world situation for 6 x 3.','numeric',NULL,'Example: 6 baskets with 3 oranges each = 18 oranges',2),
(3,'3.OA','3.OA.1','An array shows 4 rows and 5 columns. Write the multiplication.','numeric',NULL,'4 x 5 = 20',2),
(3,'3.OA','3.OA.1','Jake says 3 x 8 means ''3 added 8 times.'' Is he right?','numeric',NULL,'Not exactly; it means 3 groups of 8 (or 8 + 8 + 8 = 24)',3),
(3,'3.OA','3.OA.1','Write a word problem for 9 x 4.','numeric',NULL,'Example: There are 9 rows of desks with 4 desks in each row. How many desks?',3),
(3,'3.OA','3.OA.2','12 cookies are shared equally among 3 friends. How many does each get?','numeric',NULL,'4 cookies (12 / 3 = 4)',1),
(3,'3.OA','3.OA.2','What does 10 / 2 mean?','numeric',NULL,'10 objects split into 2 equal groups = 5 in each',1),
(3,'3.OA','3.OA.2','24 students sit in rows of 6. How many rows?','numeric',NULL,'4 rows (24 / 6 = 4)',2),
(3,'3.OA','3.OA.2','Describe a situation for 36 / 9.','numeric',NULL,'Example: 36 books on 9 shelves = 4 books per shelf',2),
(3,'3.OA','3.OA.2','56 / 8 = ?. Describe two different sharing situations.','numeric',NULL,'7',3),
(3,'3.OA','3.OA.2','A baker has 72 muffins. He puts 9 in each box. How many boxes?','numeric',NULL,'8 boxes (72 / 9 = 8)',3),
(3,'3.OA','3.OA.3','There are 3 fish tanks with 6 fish in each. How many fish in all?','numeric',NULL,'18 (3 x 6 = 18)',1),
(3,'3.OA','3.OA.3','20 apples are shared equally among 4 baskets. How many in each?','numeric',NULL,'5 (20 / 4 = 5)',1),
(3,'3.OA','3.OA.3','A farmer has 54 eggs. He puts 9 in each carton. How many cartons does he fill?','numeric',NULL,'6 (54 / 9 = 6)',2),
(3,'3.OA','3.OA.3','There are 8 teams with 7 players each. How many players in all?','numeric',NULL,'56 (8 x 7 = 56)',2),
(3,'3.OA','3.OA.3','A hall has 6 rows of chairs with 9 chairs in each row. 15 more chairs are added. How many total?','numeric',NULL,'69',3),
(3,'3.OA','3.OA.3','There are 72 students going on a field trip. Each bus holds 9 students. How many buses are needed?','numeric',NULL,'8 buses (72 / 9 = 8)',3),
(3,'3.OA','3.OA.4','Find the unknown: 4 x ? = 12','numeric',NULL,'3',1),
(3,'3.OA','3.OA.4','Find the unknown: ? x 5 = 25','numeric',NULL,'5',1),
(3,'3.OA','3.OA.4','Find the unknown: 8 x ? = 56','numeric',NULL,'7',2),
(3,'3.OA','3.OA.4','Find the unknown: ? x 9 = 63','numeric',NULL,'7',2),
(3,'3.OA','3.OA.4','Find the unknown: ? x 8 = 72','numeric',NULL,'9',3),
(3,'3.OA','3.OA.4','Find the unknown: 81 / ? = 9','numeric',NULL,'9',3),
(3,'3.OA','3.OA.5','If 3 x 7 = 21, what is 7 x 3?','numeric',NULL,'21',1),
(3,'3.OA','3.OA.5','If 4 x 6 = 24, what is 6 x 4?','numeric',NULL,'24',1),
(3,'3.OA','3.OA.5','Find 3 x 5 x 2 by grouping in two ways.','numeric',NULL,'30 both ways',2),
(3,'3.OA','3.OA.5','Use the distributive property: 7 x 6 = 7 x (5 + 1). Solve.','numeric',NULL,'42',2),
(3,'3.OA','3.OA.5','Use the distributive property to find 8 x 7: 8 x (5 + 2).','numeric',NULL,'56',3),
(3,'3.OA','3.OA.5','Find 9 x 6 by breaking 9 into (10 - 1).','numeric',NULL,'54',3),
(3,'3.OA','3.OA.6','Find 12 / 4 by thinking: 4 x ? = 12','numeric',NULL,'3',1),
(3,'3.OA','3.OA.6','Find 15 / 3 by thinking: 3 x ? = 15','numeric',NULL,'5',1),
(3,'3.OA','3.OA.6','Find 32 / 8. Think: 8 x ? = 32','numeric',NULL,'4',2),
(3,'3.OA','3.OA.6','Find 45 / 9. Think: 9 x ? = 45','numeric',NULL,'5',2),
(3,'3.OA','3.OA.6','Find 72 / 8. Think: 8 x ? = 72','numeric',NULL,'9',3),
(3,'3.OA','3.OA.6','Write the complete fact family for 7, 8, and 56.','numeric',NULL,'7x8=56, 8x7=56, 56/7=8, 56/8=7',3),
(3,'3.OA','3.OA.7','What is 3 x 5?','numeric',NULL,'15',1),
(3,'3.OA','3.OA.7','What is 24 / 6?','numeric',NULL,'4',1),
(3,'3.OA','3.OA.7','What is 8 x 6?','numeric',NULL,'48',2),
(3,'3.OA','3.OA.7','What is 63 / 9?','numeric',NULL,'7',2),
(3,'3.OA','3.OA.7','Solve quickly: 8 x 9, 7 x 7, 6 x 8, 81 / 9, 56 / 7.','numeric',NULL,'72, 49, 48, 9, 8',3),
(3,'3.OA','3.OA.7','What is 12 x 5?','numeric',NULL,'60',3),
(3,'3.OA','3.OA.8','Sam has 3 bags of 5 marbles. He finds 4 more. How many marbles in all?','numeric',NULL,'19',1),
(3,'3.OA','3.OA.8','There are 20 apples. 8 are eaten. The rest are shared equally among 4 friends. How many each?','numeric',NULL,'3',1),
(3,'3.OA','3.OA.8','A toy costs $8. Maria buys 3 toys and pays with a $50 bill. How much change?','numeric',NULL,'$26',2),
(3,'3.OA','3.OA.8','There are 6 boxes with 9 books each. 15 books are donated. How many books now?','numeric',NULL,'69',2),
(3,'3.OA','3.OA.8','A school orders 8 boxes of pencils with 12 each. They distribute equally to 6 classrooms. How many per classroom?','numeric',NULL,'16',3),
(3,'3.OA','3.OA.8','Tom earns $9 per hour. He works 5 hours and buys a book for $18. How much money does he have left?','numeric',NULL,'$27',3),
(3,'3.OA','3.OA.9','What pattern do you see: 2, 4, 6, 8, 10?','numeric',NULL,'Counting by 2s (adding 2 each time)',1),
(3,'3.OA','3.OA.9','What pattern: 5, 10, 15, 20, 25?','numeric',NULL,'Counting by 5s (adding 5 each time)',1),
(3,'3.OA','3.OA.9','Look at the multiplication table: 4x1=4, 4x2=8, 4x3=12. Are the products always even?','numeric',NULL,'Yes',2),
(3,'3.OA','3.OA.9','What pattern do you see in multiples of 9: 9, 18, 27, 36, 45?','numeric',NULL,'The digits add up to 9',2),
(3,'3.OA','3.OA.9','Why is 4 times any number always even? Explain.','numeric',NULL,'Because 4 = 2 x 2, so the product always contains 2 as a factor, making it even',3),
(3,'3.OA','3.OA.9','In the multiplication table, is the product of two odd numbers odd or even? Test with examples.','numeric',NULL,'Always odd',3),
(3,'3.NBT','3.NBT.1','Round 23 to the nearest 10.','numeric',NULL,'20',1),
(3,'3.NBT','3.NBT.1','Round 67 to the nearest 10.','numeric',NULL,'70',1),
(3,'3.NBT','3.NBT.1','Round 345 to the nearest 10.','numeric',NULL,'350',2),
(3,'3.NBT','3.NBT.1','Round 345 to the nearest 100.','numeric',NULL,'300',2),
(3,'3.NBT','3.NBT.1','A school has 467 students. About how many is that, rounded to the nearest hundred?','numeric',NULL,'500',3),
(3,'3.NBT','3.NBT.1','Round 555 to the nearest 10 and to the nearest 100.','numeric',NULL,'560 (nearest 10); 600 (nearest 100)',3),
(3,'3.NBT','3.NBT.2','What is 342 + 215?','numeric',NULL,'557',1),
(3,'3.NBT','3.NBT.2','What is 689 - 234?','numeric',NULL,'455',1),
(3,'3.NBT','3.NBT.2','What is 475 + 368?','numeric',NULL,'843',2),
(3,'3.NBT','3.NBT.2','What is 800 - 347?','numeric',NULL,'453',2),
(3,'3.NBT','3.NBT.2','What is 783 + 217?','numeric',NULL,'1000',3),
(3,'3.NBT','3.NBT.2','What is 1000 - 463?','numeric',NULL,'537',3),
(3,'3.NBT','3.NBT.3','What is 2 x 10?','numeric',NULL,'20',1),
(3,'3.NBT','3.NBT.3','What is 5 x 10?','numeric',NULL,'50',1),
(3,'3.NBT','3.NBT.3','What is 5 x 60?','numeric',NULL,'300',2),
(3,'3.NBT','3.NBT.3','What is 7 x 40?','numeric',NULL,'280',2),
(3,'3.NBT','3.NBT.3','What is 9 x 80?','numeric',NULL,'720',3),
(3,'3.NBT','3.NBT.3','What is 7 x 90?','numeric',NULL,'630',3),
(3,'3.NF','3.NF.1','A pizza is cut into 4 equal slices. What fraction is one slice?','numeric',NULL,'1/4',1),
(3,'3.NF','3.NF.1','A pie is cut into 2 equal pieces. What fraction is one piece?','numeric',NULL,'1/2',1),
(3,'3.NF','3.NF.1','A pie is cut into 6 equal pieces. You eat 2 pieces. What fraction did you eat?','numeric',NULL,'2/6',2),
(3,'3.NF','3.NF.1','A strip of paper is divided into 4 equal parts. You color 3 parts. What fraction is colored?','numeric',NULL,'3/4',2),
(3,'3.NF','3.NF.1','A ribbon is divided into 8 equal parts. You use 5 parts. What fraction is used? What fraction is left?','numeric',NULL,'5/8 used; 3/8 left',3),
(3,'3.NF','3.NF.1','What fraction is greater: 3/4 or 3/8? Explain.','numeric',NULL,'3/4 is greater',3),
(3,'3.NF','3.NF.2','On a number line from 0 to 1, where is 1/2?','numeric',NULL,'Halfway between 0 and 1',1),
(3,'3.NF','3.NF.2','On a number line from 0 to 1 divided into 4 equal parts, where is 1/4?','numeric',NULL,'At the first mark (one quarter of the way)',1),
(3,'3.NF','3.NF.2','On a number line from 0 to 1 with 4 equal parts, where is 3/4?','numeric',NULL,'At the third mark from 0',2),
(3,'3.NF','3.NF.2','Place 2/3 on a number line from 0 to 1.','numeric',NULL,'At the second mark when divided into 3 equal parts',2),
(3,'3.NF','3.NF.2','On a number line from 0 to 2, where is 5/4?','numeric',NULL,'Between 1 and 2, at 1 and 1/4',3),
(3,'3.NF','3.NF.2','Place both 1/3 and 2/3 on a number line. Which is closer to 1?','numeric',NULL,'2/3 is closer to 1',3),
(3,'3.NF','3.NF.3','Are 1/2 and 2/4 the same amount?','numeric',NULL,'Yes, they are equivalent',1),
(3,'3.NF','3.NF.3','Compare 1/3 and 1/6. Which is larger?','numeric',NULL,'1/3',1),
(3,'3.NF','3.NF.3','Write a fraction equivalent to 1/2 with denominator 6.','numeric',NULL,'3/6',2),
(3,'3.NF','3.NF.3','Compare 3/8 and 3/4. Which is greater?','numeric',NULL,'3/4',2),
(3,'3.NF','3.NF.3','Compare 5/6 and 7/8. Which is closer to 1?','numeric',NULL,'7/8 is closer to 1',3),
(3,'3.NF','3.NF.3','Write two fractions equivalent to 2/4.','numeric',NULL,'1/2 and 4/8',3),
(3,'3.MD','3.MD.1','What time does a clock show when the hour hand is on 3 and the minute hand is on 4?','numeric',NULL,'3:20',1),
(3,'3.MD','3.MD.1','It is 2:00. What time will it be in 30 minutes?','numeric',NULL,'2:30',1),
(3,'3.MD','3.MD.1','A movie starts at 4:15 and is 90 minutes long. What time does it end?','numeric',NULL,'5:45',2),
(3,'3.MD','3.MD.1','School starts at 8:05 and lunch is at 11:35. How many minutes between?','numeric',NULL,'210 minutes (3 hours 30 minutes)',2),
(3,'3.MD','3.MD.1','A show starts at 7:48 p.m. and lasts 1 hour 25 minutes. What time does it end?','numeric',NULL,'9:13 p.m.',3),
(3,'3.MD','3.MD.1','Recess starts at 10:15 and lasts 20 minutes. Math class is 45 minutes after recess. When does math start?','numeric',NULL,'10:35 + 0 = 10:35 is when recess ends; but 45 min after = trick',3),
(3,'3.MD','3.MD.2','Would you measure a paperclip in grams or kilograms?','numeric',NULL,'Grams',1),
(3,'3.MD','3.MD.2','Would you measure a watermelon in grams or kilograms?','numeric',NULL,'Kilograms',1),
(3,'3.MD','3.MD.2','An apple has a mass of 150 grams. 4 apples weigh how many grams?','numeric',NULL,'600 grams',2),
(3,'3.MD','3.MD.2','A bucket holds 8 liters. You fill 3 buckets. How many liters total?','numeric',NULL,'24 liters',2),
(3,'3.MD','3.MD.2','A recipe needs 250 mL of milk. You have 1 liter. How much is left after the recipe?','numeric',NULL,'750 mL',3),
(3,'3.MD','3.MD.2','A bag of rice is 2 kg. How many grams is that?','numeric',NULL,'2000 grams',3),
(3,'3.MD','3.MD.3','A bar graph shows: Red=6, Blue=10, Green=4. Which color has the most votes?','numeric',NULL,'Blue (10)',1),
(3,'3.MD','3.MD.3','In a picture graph, each picture = 2 votes. A category has 5 pictures. How many votes?','numeric',NULL,'10',1),
(3,'3.MD','3.MD.3','A picture graph uses a scale of 2. Pizza has 7 pictures. Tacos have 5 pictures. How many total votes?','numeric',NULL,'24',2),
(3,'3.MD','3.MD.3','A bar graph: Soccer=20, Basketball=15, Baseball=25, Tennis=10. How many more for baseball than tennis?','numeric',NULL,'15 more',2),
(3,'3.MD','3.MD.3','A picture graph (scale=5) shows: Mon=3, Tue=5, Wed=4, Thu=6, Fri=2. Total for the week?','numeric',NULL,'100',3),
(3,'3.MD','3.MD.3','A bar graph: Grade 3=45, Grade 4=60, Grade 5=55. How many fewer in Grade 3 than Grades 4 and 5 combined?','numeric',NULL,'70 fewer',3),
(3,'3.MD','3.MD.4','A pencil is 5 and 1/2 inches long. Write this as a number.','numeric',NULL,'5 1/2 inches',1),
(3,'3.MD','3.MD.4','How many quarter inches are in 1 inch?','numeric',NULL,'4',1),
(3,'3.MD','3.MD.4','Lengths: 3, 3 1/2, 4, 3 1/2, 4, 4 1/2, 3 (inches). How many are 3 1/2 inches?','numeric',NULL,'2',2),
(3,'3.MD','3.MD.4','A ribbon is 6 3/4 inches long. Is it closer to 6 or 7 inches?','numeric',NULL,'Closer to 7',2),
(3,'3.MD','3.MD.4','Lengths measured: 2 1/4, 2 3/4, 2 1/2, 2 1/4, 3, 2 1/2, 2 3/4, 2 1/4 inches. What length is most common?','numeric',NULL,'2 1/4 inches (3 times)',3),
(3,'3.MD','3.MD.4','On a line plot, the shortest measurement is 4 1/4 inches and the longest is 6 inches. What is the range?','numeric',NULL,'1 3/4 inches',3),
(3,'3.MD','3.MD.5','What is area?','numeric',NULL,'The amount of space inside a flat shape',1),
(3,'3.MD','3.MD.5','A square has side length 1 unit. What is its area?','numeric',NULL,'1 square unit',1),
(3,'3.MD','3.MD.5','A shape is covered by 12 unit squares. What is the area?','numeric',NULL,'12 square units',2),
(3,'3.MD','3.MD.5','Two shapes: Shape A = 15 square cm, Shape B = 11 square cm. Which is larger?','numeric',NULL,'Shape A',2),
(3,'3.MD','3.MD.5','A floor is covered by square-foot tiles. It takes 24 tiles. What is the floor area?','numeric',NULL,'24 square feet',3),
(3,'3.MD','3.MD.5','Shape A is 20 square cm. Shape B is 20 square inches. Are their areas the same?','numeric',NULL,'No, because the units are different',3),
(3,'3.MD','3.MD.6','Count the squares: a shape made of 5 unit squares. What is the area?','numeric',NULL,'5 square units',1),
(3,'3.MD','3.MD.6','A shape has 3 rows of 4 squares. What is the area?','numeric',NULL,'12 square units',1),
(3,'3.MD','3.MD.6','An L-shaped figure is made of a 3x2 rectangle and a 2x1 rectangle. What is the total area?','numeric',NULL,'8 square units',2),
(3,'3.MD','3.MD.6','A rectangle is 5 cm by 4 cm. How many square centimeters?','numeric',NULL,'20 square cm',2),
(3,'3.MD','3.MD.6','An irregular shape on grid paper covers 23 full squares and 0 partial squares. What is the area?','numeric',NULL,'23 square units',3),
(3,'3.MD','3.MD.6','A U-shaped pool: outer rectangle 8x5, inner rectangle 4x3 removed. What is the pool area?','numeric',NULL,'28 square units',3),
(3,'3.MD','3.MD.7','A rectangle is 3 units by 5 units. What is the area?','numeric',NULL,'15 square units (3 x 5 = 15)',1),
(3,'3.MD','3.MD.7','A rectangle is 4 by 6. Find the area by multiplying.','numeric',NULL,'24 square units',1),
(3,'3.MD','3.MD.7','Use the distributive property: A rectangle is 7 by 8. Break 8 into 5+3 and find the area.','numeric',NULL,'56',2),
(3,'3.MD','3.MD.7','A rectangle is 6 by 9. Break 9 into 10-1. Find the area.','numeric',NULL,'54',2),
(3,'3.MD','3.MD.7','A room is shaped like an L: a 10x8 rectangle with a 4x3 corner cut out. What is the area?','numeric',NULL,'68 square units',3),
(3,'3.MD','3.MD.7','Show that a 6 by (4+5) rectangle has the same area as 6x4 + 6x5.','numeric',NULL,'54 = 24 + 30 = 54',3),
(3,'3.MD','3.MD.8','A square has sides of 4 cm. What is the perimeter?','numeric',NULL,'16 cm',1),
(3,'3.MD','3.MD.8','A rectangle is 5 inches long and 3 inches wide. What is the perimeter?','numeric',NULL,'16 inches',1),
(3,'3.MD','3.MD.8','A rectangle has a perimeter of 20 cm. One side is 6 cm. What is the other side?','numeric',NULL,'4 cm',2),
(3,'3.MD','3.MD.8','A square has a perimeter of 36 inches. What is the side length?','numeric',NULL,'9 inches',2),
(3,'3.MD','3.MD.8','Draw two rectangles with perimeter 24 cm. What are their areas?','numeric',NULL,'Example: 1x11 (area 11) and 6x6 (area 36)',3),
(3,'3.MD','3.MD.8','A rectangle has area 24 sq cm and one side is 8 cm. What is the perimeter?','numeric',NULL,'22 cm',3),
(3,'3.G','3.G.1','Is a square a quadrilateral?','numeric',NULL,'Yes',1),
(3,'3.G','3.G.1','Is a rectangle a quadrilateral?','numeric',NULL,'Yes',1),
(3,'3.G','3.G.1','What makes a rectangle special compared to other quadrilaterals?','numeric',NULL,'It has 4 right angles',2),
(3,'3.G','3.G.1','What makes a rhombus special?','numeric',NULL,'All 4 sides are equal length',2),
(3,'3.G','3.G.1','Explain how squares, rectangles, and rhombuses are all related.','numeric',NULL,'All are quadrilaterals. A square is both a rectangle and a rhombus.',3),
(3,'3.G','3.G.1','True or false: All rectangles are squares.','numeric',NULL,'False',3),
(3,'3.G','3.G.2','A rectangle is divided into 4 equal parts. What fraction is each part?','numeric',NULL,'1/4',1),
(3,'3.G','3.G.2','A circle is divided into 3 equal parts. What fraction is each?','numeric',NULL,'1/3',1),
(3,'3.G','3.G.2','A rectangle has area 12 sq units. It is divided into 4 equal parts. What is the area of each part?','numeric',NULL,'3 square units',2),
(3,'3.G','3.G.2','A square has area 16 sq cm. It is divided into 4 equal parts. Each part = what fraction? What area?','numeric',NULL,'1/4 of the whole; 4 sq cm each',2),
(3,'3.G','3.G.2','A rectangle has area 36 sq units. It is divided into 6 equal parts. What fraction and area is each part?','numeric',NULL,'1/6 of the whole; 6 sq units each',3),
(3,'3.G','3.G.2','A square (area 64 sq in) is divided into 8 equal strips. What is the area of 3 strips?','numeric',NULL,'24 sq in (3/8 of 64)',3),
(4,'4.OA','4.OA.1','Interpret this equation as a comparison: 3 × 6 = 18. Which statement is correct?','numeric',NULL,'18 is 3 times as many as 6',1),
(4,'4.OA','4.OA.1','Write a comparison statement for 5 × 4 = 20.','numeric',NULL,'20 is 5 times as many as 4',1),
(4,'4.OA','4.OA.1','A dog weighs 9 pounds. A cat weighs 3 times as much. Write a comparison equation.','numeric',NULL,'3 × 9 = 27',2),
(4,'4.OA','4.OA.1','Maya has 6 marbles. Jake has 42 marbles. Jake has how many times as many marbles as Maya?','numeric',NULL,'7 times as many',2),
(4,'4.OA','4.OA.1','Liam ran 4 miles. His dad ran 7 times as far. How far did his dad run? Write both a comparison statement and equation.','numeric',NULL,'His dad ran 28 miles; 7 × 4 = 28',3),
(4,'4.OA','4.OA.1','A shelf has 8 books. Another shelf has 72 books. Write two different comparison statements.','numeric',NULL,'72 is 9 times as many as 8; 8 is 1/9 of 72',3),
(4,'4.OA','4.OA.2','A cat weighs 6 pounds. A dog weighs 5 times as much. How much does the dog weigh?','numeric',NULL,'30 pounds',1),
(4,'4.OA','4.OA.2','Ben has 3 toy cars. Alex has 4 times as many. How many toy cars does Alex have?','numeric',NULL,'12 toy cars',1),
(4,'4.OA','4.OA.2','Maria scored 48 points. She scored 6 times as many points as Juan. How many points did Juan score?','numeric',NULL,'8 points',2),
(4,'4.OA','4.OA.2','A garden has 35 flowers. That is 5 times as many as a small pot. How many flowers are in the small pot?','numeric',NULL,'7 flowers',2),
(4,'4.OA','4.OA.2','Sam collected 3 times as many shells as Mia. Together they collected 56 shells. How many did each collect?','numeric',NULL,'Mia: 14, Sam: 42',3),
(4,'4.OA','4.OA.2','A truck weighs 5 times as much as a car. Together they weigh 5,400 pounds. How much does each weigh?','numeric',NULL,'Car: 900 lbs, Truck: 4,500 lbs',3),
(4,'4.OA','4.OA.3','A store sold 24 apples in the morning and 36 in the afternoon. They packed them in bags of 6. How many bags?','numeric',NULL,'10 bags',1),
(4,'4.OA','4.OA.3','Tom had 50 stickers. He gave 12 to Sam and 8 to Lily. How many does he have left?','numeric',NULL,'30 stickers',1),
(4,'4.OA','4.OA.3','A school ordered 6 boxes of pencils with 24 pencils each. They divided them equally among 8 classrooms. How many pencils per classroom?','numeric',NULL,'18 pencils',2),
(4,'4.OA','4.OA.3','Sam has $100. He buys 3 books at $12 each and 2 notebooks at $7 each. How much money is left?','numeric',NULL,'$50',2),
(4,'4.OA','4.OA.3','A theater has 12 rows of 15 seats plus 8 rows of 20 seats. If 245 tickets are sold, how many empty seats?','numeric',NULL,'95 empty seats',3),
(4,'4.OA','4.OA.3','A store received 1,500 bottles of water. They sold 847 on Monday and 398 on Tuesday. They need to order more if fewer than 100 are left. Should they order more?','numeric',NULL,'Yes, only 255 are left',3),
(4,'4.OA','4.OA.4','List all the factors of 12.','numeric',NULL,'1, 2, 3, 4, 6, 12',1),
(4,'4.OA','4.OA.4','Is 7 prime or composite?','numeric',NULL,'Prime',1),
(4,'4.OA','4.OA.4','Find all factor pairs of 36.','numeric',NULL,'(1,36), (2,18), (3,12), (4,9), (6,6)',2),
(4,'4.OA','4.OA.4','Is 51 prime or composite? Explain.','numeric',NULL,'Composite (51 = 3 × 17)',2),
(4,'4.OA','4.OA.4','Find all the factors of 48. How many factor pairs are there?','numeric',NULL,'Factors: 1,2,3,4,6,8,12,16,24,48 - 5 factor pairs',3),
(4,'4.OA','4.OA.4','What is the smallest number that has exactly 6 factors?','numeric',NULL,'12',3),
(4,'4.OA','4.OA.5','What is the rule for this pattern? 2, 4, 6, 8, 10, …','numeric',NULL,'Add 2',1),
(4,'4.OA','4.OA.5','Continue the pattern: 5, 10, 15, 20, ___','numeric',NULL,'25',1),
(4,'4.OA','4.OA.5','The rule is ''start at 1, add 5.'' Generate the first 6 terms. Are all the terms odd?','numeric',NULL,'1, 6, 11, 16, 21, 26. No, they alternate odd/even.',2),
(4,'4.OA','4.OA.5','Pattern: 2, 6, 18, 54, ___. What is the rule?','numeric',NULL,'Multiply by 3. Next term is 162.',2),
(4,'4.OA','4.OA.5','Start at 1, multiply by 2 each time. What are the first 8 terms? What do you notice about odd/even?','numeric',NULL,'1, 2, 4, 8, 16, 32, 64, 128. After the first term, all are even.',3),
(4,'4.OA','4.OA.5','Two patterns start at 0. Pattern A adds 3. Pattern B adds 6. Compare the 5th terms of each.','numeric',NULL,'A: 12, B: 24. B is always twice A.',3),
(4,'4.NBT','4.NBT.1','In the number 440, how many times greater is the 4 in the hundreds place than the 4 in the tens place?','numeric',NULL,'10 times greater',1),
(4,'4.NBT','4.NBT.1','What is the value of the 3 in 3,000?','numeric',NULL,'3,000',1),
(4,'4.NBT','4.NBT.1','In 7,700, the 7 appears in two places. How many times greater is the thousands-place 7 than the hundreds-place 7?','numeric',NULL,'10 times greater',2),
(4,'4.NBT','4.NBT.1','How many times greater is the value of 5 in 50,000 compared to the 5 in 5,000?','numeric',NULL,'10 times greater',2),
(4,'4.NBT','4.NBT.1','In 333,333, how many times greater is the hundred-thousands digit than the hundreds digit?','numeric',NULL,'1,000 times greater',3),
(4,'4.NBT','4.NBT.1','A number has a 4 in the ten-thousands place. If you move it two places to the right, what is its new value?','numeric',NULL,'400',3),
(4,'4.NBT','4.NBT.2','Write 4,523 in expanded form.','numeric',NULL,'4,000 + 500 + 20 + 3',1),
(4,'4.NBT','4.NBT.2','Write the number name for 7,081.','numeric',NULL,'Seven thousand, eighty-one',1),
(4,'4.NBT','4.NBT.2','Write 52,407 in expanded form.','numeric',NULL,'50,000 + 2,000 + 400 + 7',2),
(4,'4.NBT','4.NBT.2','Write the number name for 305,018.','numeric',NULL,'Three hundred five thousand, eighteen',2),
(4,'4.NBT','4.NBT.2','Write 600,000 + 50,000 + 70 + 8 in standard form and number name.','numeric',NULL,'650,078; six hundred fifty thousand, seventy-eight',3),
(4,'4.NBT','4.NBT.2','Arrange from least to greatest: 409,100; 410,900; 409,010; 401,900.','numeric',NULL,'401,900; 409,010; 409,100; 410,900',3),
(4,'4.NBT','4.NBT.3','Round 463 to the nearest hundred.','numeric',NULL,'500',1),
(4,'4.NBT','4.NBT.3','Round 3,821 to the nearest thousand.','numeric',NULL,'4,000',1),
(4,'4.NBT','4.NBT.3','Round 45,678 to the nearest ten-thousand.','numeric',NULL,'50,000',2),
(4,'4.NBT','4.NBT.3','Round 82,439 to the nearest thousand.','numeric',NULL,'82,000',2),
(4,'4.NBT','4.NBT.3','Round 549,999 to the nearest hundred-thousand.','numeric',NULL,'500,000',3),
(4,'4.NBT','4.NBT.3','A city''s population is 847,562. Round to the nearest ten-thousand and hundred-thousand.','numeric',NULL,'850,000 and 800,000',3),
(4,'4.NBT','4.NBT.4','3,456 + 2,341 = ?','numeric',NULL,'5,797',1),
(4,'4.NBT','4.NBT.4','8,000 − 3,500 = ?','numeric',NULL,'4,500',1),
(4,'4.NBT','4.NBT.4','47,856 + 35,678 = ?','numeric',NULL,'83,534',2),
(4,'4.NBT','4.NBT.4','90,000 − 45,327 = ?','numeric',NULL,'44,673',2),
(4,'4.NBT','4.NBT.4','456,789 + 345,678 = ?','numeric',NULL,'802,467',3),
(4,'4.NBT','4.NBT.4','1,000,000 − 567,891 = ?','numeric',NULL,'432,109',3),
(4,'4.NBT','4.NBT.5','34 × 2 = ?','numeric',NULL,'68',1),
(4,'4.NBT','4.NBT.5','123 × 3 = ?','numeric',NULL,'369',1),
(4,'4.NBT','4.NBT.5','2,345 × 6 = ?','numeric',NULL,'14,070',2),
(4,'4.NBT','4.NBT.5','56 × 34 = ?','numeric',NULL,'1,904',2),
(4,'4.NBT','4.NBT.5','4,567 × 8 = ?','numeric',NULL,'36,536',3),
(4,'4.NBT','4.NBT.5','93 × 86 = ?','numeric',NULL,'7,998',3),
(4,'4.NBT','4.NBT.6','84 ÷ 4 = ?','numeric',NULL,'21',1),
(4,'4.NBT','4.NBT.6','96 ÷ 3 = ?','numeric',NULL,'32',1),
(4,'4.NBT','4.NBT.6','435 ÷ 5 = ?','numeric',NULL,'87',2),
(4,'4.NBT','4.NBT.6','637 ÷ 7 = ?','numeric',NULL,'91',2),
(4,'4.NBT','4.NBT.6','4,536 ÷ 8 = ?','numeric',NULL,'567',3),
(4,'4.NBT','4.NBT.6','7,259 ÷ 6 = ?','numeric',NULL,'1,209 R5',3),
(4,'4.NF','4.NF.1','Find a fraction equivalent to 1/2 by multiplying numerator and denominator by 2.','numeric',NULL,'2/4',1),
(4,'4.NF','4.NF.1','Find a fraction equivalent to 1/3 by multiplying by 3.','numeric',NULL,'3/9',1),
(4,'4.NF','4.NF.1','Find two fractions equivalent to 3/5.','numeric',NULL,'6/10 and 9/15',2),
(4,'4.NF','4.NF.1','Simplify 8/12 to its simplest form.','numeric',NULL,'2/3',2),
(4,'4.NF','4.NF.1','Find three equivalent fractions for 2/5.','numeric',NULL,'4/10, 6/15, 8/20',3),
(4,'4.NF','4.NF.1','Is 12/18 equivalent to 8/12? Explain how you know.','numeric',NULL,'Yes',3),
(4,'4.NF','4.NF.2','Compare 1/3 and 1/4 using <, >, or =.','numeric',NULL,'1/3 > 1/4',1),
(4,'4.NF','4.NF.2','Compare 2/5 and 4/5.','numeric',NULL,'2/5 < 4/5',1),
(4,'4.NF','4.NF.2','Compare 3/4 and 5/8. Use a common denominator.','numeric',NULL,'3/4 > 5/8',2),
(4,'4.NF','4.NF.2','Compare 2/3 and 3/5.','numeric',NULL,'2/3 > 3/5',2),
(4,'4.NF','4.NF.2','Order from greatest to least: 2/3, 5/8, 7/12.','numeric',NULL,'2/3, 5/8, 7/12',3),
(4,'4.NF','4.NF.2','Compare 7/9 and 5/6. Which is closer to 1?','numeric',NULL,'5/6 is closer to 1',3),
(4,'4.NF','4.NF.3','Write 3/4 as a sum of unit fractions.','numeric',NULL,'1/4 + 1/4 + 1/4',1),
(4,'4.NF','4.NF.3','1/5 + 2/5 = ?','numeric',NULL,'3/5',1),
(4,'4.NF','4.NF.3','3/10 + 4/10 + 2/10 = ?','numeric',NULL,'9/10',2),
(4,'4.NF','4.NF.3','7/8 − 3/8 = ?','numeric',NULL,'4/8 = 1/2',2),
(4,'4.NF','4.NF.3','5 1/8 − 2 5/8 = ?','numeric',NULL,'2 4/8 = 2 1/2',3),
(4,'4.NF','4.NF.3','A recipe needs 3/4 cup of flour. You already added 1/4 cup. How much more do you need?','numeric',NULL,'2/4 = 1/2 cup',3),
(4,'4.NF','4.NF.4','3 × 1/4 = ?','numeric',NULL,'3/4',1),
(4,'4.NF','4.NF.4','2 × 2/5 = ?','numeric',NULL,'4/5',1),
(4,'4.NF','4.NF.4','6 × 2/3 = ?','numeric',NULL,'12/3 = 4',2),
(4,'4.NF','4.NF.4','4 × 3/5 = ?','numeric',NULL,'12/5 = 2 2/5',2),
(4,'4.NF','4.NF.4','8 × 5/6 = ?','numeric',NULL,'40/6 = 6 4/6 = 6 2/3',3),
(4,'4.NF','4.NF.4','Each serving of juice is 3/4 cup. How many cups for 12 servings?','numeric',NULL,'36/4 = 9 cups',3),
(4,'4.NF','4.NF.5','Write 3/10 as a fraction with denominator 100.','numeric',NULL,'30/100',1),
(4,'4.NF','4.NF.5','Write 7/10 as a fraction with denominator 100.','numeric',NULL,'70/100',1),
(4,'4.NF','4.NF.5','Add: 6/10 + 35/100 = ?','numeric',NULL,'95/100',2),
(4,'4.NF','4.NF.5','Add: 2/10 + 8/100 = ?','numeric',NULL,'28/100',2),
(4,'4.NF','4.NF.5','Add: 8/10 + 25/100 = ? Write as a fraction and simplify if possible.','numeric',NULL,'105/100 = 1 5/100 = 1 1/20',3),
(4,'4.NF','4.NF.5','Express 47/100 as a sum of a tenths fraction and a hundredths fraction.','numeric',NULL,'4/10 + 7/100',3),
(4,'4.NF','4.NF.6','Write 3/10 as a decimal.','numeric',NULL,'0.3',1),
(4,'4.NF','4.NF.6','Write 47/100 as a decimal.','numeric',NULL,'0.47',1),
(4,'4.NF','4.NF.6','Write 1 3/10 as a decimal.','numeric',NULL,'1.3',2),
(4,'4.NF','4.NF.6','Write 5.07 as a fraction.','numeric',NULL,'5 7/100',2),
(4,'4.NF','4.NF.6','Write 3 8/10 + 15/100 as a single decimal.','numeric',NULL,'3.95',3),
(4,'4.NF','4.NF.6','A pencil costs $0.75. Write this as a fraction of a dollar.','numeric',NULL,'75/100 = 3/4 of a dollar',3),
(4,'4.NF','4.NF.7','Compare 0.3 and 0.5 using <, >, or =.','numeric',NULL,'0.3 < 0.5',1),
(4,'4.NF','4.NF.7','Compare 0.72 and 0.27.','numeric',NULL,'0.72 > 0.27',1),
(4,'4.NF','4.NF.7','Order from least to greatest: 0.45, 0.54, 0.4, 0.5.','numeric',NULL,'0.4, 0.45, 0.5, 0.54',2),
(4,'4.NF','4.NF.7','Compare 0.08 and 0.8.','numeric',NULL,'0.08 < 0.8',2),
(4,'4.NF','4.NF.7','Order from least to greatest: 4.04, 4.40, 4.44, 4.4.','numeric',NULL,'4.04, 4.4 = 4.40, 4.44',3),
(4,'4.NF','4.NF.7','Find a decimal between 0.6 and 0.7.','numeric',NULL,'0.65 (or any value like 0.61–0.69)',3),
(4,'4.MD','4.MD.1','How many inches are in 1 foot?','numeric',NULL,'12 inches',1),
(4,'4.MD','4.MD.1','How many centimeters are in 1 meter?','numeric',NULL,'100 centimeters',1),
(4,'4.MD','4.MD.1','Convert 5 yards to feet.','numeric',NULL,'15 feet',2),
(4,'4.MD','4.MD.1','How many ounces are in 3 pounds?','numeric',NULL,'48 ounces',2),
(4,'4.MD','4.MD.1','A table is 6 feet long. How many inches is that? How many yards?','numeric',NULL,'72 inches; 2 yards',3),
(4,'4.MD','4.MD.1','A recipe needs 2 pounds 5 ounces of flour. How many ounces total?','numeric',NULL,'37 ounces',3),
(4,'4.MD','4.MD.2','A bottle holds 2 liters. How many milliliters is that?','numeric',NULL,'2,000 mL',1),
(4,'4.MD','4.MD.2','Sam walked 3 km 400 m. Write this in meters.','numeric',NULL,'3,400 m',1),
(4,'4.MD','4.MD.2','A runner completes a race in 12 minutes 45 seconds. Another finishes in 11 minutes 58 seconds. What is the difference?','numeric',NULL,'47 seconds',2),
(4,'4.MD','4.MD.2','Three containers hold 750 mL, 1 L 200 mL, and 500 mL. What is the total in liters and mL?','numeric',NULL,'2 L 450 mL',2),
(4,'4.MD','4.MD.2','You buy 3 items at $4.75, $6.50, and $2.25. You pay with a $20 bill. What''s your change?','numeric',NULL,'$6.50',3),
(4,'4.MD','4.MD.2','A tank holds 50 liters. Water flows in at 3 liters per minute. How long to fill?','numeric',NULL,'16 minutes 40 seconds',3),
(4,'4.MD','4.MD.3','Find the perimeter of a rectangle with length 8 cm and width 5 cm.','numeric',NULL,'26 cm',1),
(4,'4.MD','4.MD.3','Find the area of a rectangle with length 6 m and width 4 m.','numeric',NULL,'24 sq m',1),
(4,'4.MD','4.MD.3','A room is 12 feet by 15 feet. How many square feet of carpet are needed?','numeric',NULL,'180 sq ft',2),
(4,'4.MD','4.MD.3','A rectangle has a perimeter of 30 m and a length of 10 m. What is the width?','numeric',NULL,'5 m',2),
(4,'4.MD','4.MD.3','A rectangle has a perimeter of 50 cm. Its length is 3 times its width. Find the dimensions.','numeric',NULL,'Width: 6.25 cm, Length: 18.75 cm',3),
(4,'4.MD','4.MD.3','Two rooms are 15×12 ft and 10×8 ft. What is the total area of carpet needed?','numeric',NULL,'260 sq ft',3),
(4,'4.MD','4.MD.4','Students measured ribbons: 1/4, 1/2, 1/4, 3/4, 1/2. How many measured 1/2 inch?','numeric',NULL,'2 ribbons',1),
(4,'4.MD','4.MD.4','A line plot shows 3 X''s above 1/4, 2 X''s above 1/2, and 1 X above 3/4. How many data points total?','numeric',NULL,'6',1),
(4,'4.MD','4.MD.4','Caterpillar lengths (inches): 3/8, 5/8, 3/8, 7/8, 5/8, 3/8. What is the most common length?','numeric',NULL,'3/8 inch (3 times)',2),
(4,'4.MD','4.MD.4','A line plot shows plant heights: 2 at 1/4 in, 4 at 1/2 in, 3 at 3/4 in. What is the total of all heights?','numeric',NULL,'4 3/4 inches',2),
(4,'4.MD','4.MD.4','Ant lengths: 1/4(2), 3/8(3), 1/2(4), 5/8(1). Find the total length if all ants were placed end to end.','numeric',NULL,'4 3/8 inches',3),
(4,'4.MD','4.MD.4','Eight students measured worms. Results: 3/4, 1/2, 5/8, 3/4, 7/8, 1/2, 3/4, 5/8. What fraction of students found worms 3/4 inch or longer?','numeric',NULL,'4/8 = 1/2',3),
(4,'4.MD','4.MD.5','What is an angle?','numeric',NULL,'Two rays sharing a common endpoint (vertex)',1),
(4,'4.MD','4.MD.5','How many degrees are in a right angle?','numeric',NULL,'90°',1),
(4,'4.MD','4.MD.5','How many degrees is half a circle?','numeric',NULL,'180°',2),
(4,'4.MD','4.MD.5','An angle is 3/4 of a full turn. How many degrees?','numeric',NULL,'270°',2),
(4,'4.MD','4.MD.5','A clock''s minute hand moves from 12 to 8. How many degrees did it turn?','numeric',NULL,'240°',3),
(4,'4.MD','4.MD.5','If you face north and turn clockwise to face south, how many degrees did you turn?','numeric',NULL,'180°',3),
(4,'4.MD','4.MD.6','A protractor shows an angle measuring 45°. Is this acute, right, or obtuse?','numeric',NULL,'Acute',1),
(4,'4.MD','4.MD.6','An angle measures 90°. What type of angle is it?','numeric',NULL,'Right angle',1),
(4,'4.MD','4.MD.6','An angle measures 135°. Is it closer to a right angle or a straight angle?','numeric',NULL,'Closer to a straight angle',2),
(4,'4.MD','4.MD.6','A triangle has angles of 60° and 80°. What is the third angle?','numeric',NULL,'40°',2),
(4,'4.MD','4.MD.6','A quadrilateral has angles 85°, 95°, and 110°. What is the fourth angle?','numeric',NULL,'70°',3),
(4,'4.MD','4.MD.6','Two angles are supplementary. One is 63°. What is the other?','numeric',NULL,'117°',3),
(4,'4.MD','4.MD.7','Two angles share a side. One is 30° and the other is 50°. What is the total angle?','numeric',NULL,'80°',1),
(4,'4.MD','4.MD.7','An angle is split into 40° and 25°. What is the whole angle?','numeric',NULL,'65°',1),
(4,'4.MD','4.MD.7','Angle ABC = 125°. Ray BD splits it into angle ABD = 75° and angle DBC. Find angle DBC.','numeric',NULL,'50°',2),
(4,'4.MD','4.MD.7','Two angles form a right angle. One is (x + 10)° and the other is 50°. Find x.','numeric',NULL,'30',2),
(4,'4.MD','4.MD.7','Angles around a point: 120°, 85°, x°, and 70°. Find x.','numeric',NULL,'85°',3),
(4,'4.MD','4.MD.7','Two supplementary angles are in the ratio 2:3. Find both angles.','numeric',NULL,'72° and 108°',3),
(4,'4.G','4.G.1','What is the difference between a line and a line segment?','numeric',NULL,'A line goes on forever in both directions; a line segment has two endpoints',1),
(4,'4.G','4.G.1','What is a ray?','numeric',NULL,'A part of a line with one endpoint that extends infinitely in one direction',1),
(4,'4.G','4.G.1','How many line segments does a triangle have?','numeric',NULL,'3',2),
(4,'4.G','4.G.1','Can two rays form an angle? Explain.','numeric',NULL,'Yes, if they share a common endpoint',2),
(4,'4.G','4.G.1','Draw a shape that has exactly one pair of parallel sides. What is it called?','numeric',NULL,'A trapezoid',3),
(4,'4.G','4.G.1','Can a triangle have a pair of parallel sides? Why or why not?','numeric',NULL,'No',3),
(4,'4.G','4.G.2','Does a square have parallel sides?','numeric',NULL,'Yes, 2 pairs of parallel sides',1),
(4,'4.G','4.G.2','How many right angles does a rectangle have?','numeric',NULL,'4',1),
(4,'4.G','4.G.2','Classify a rectangle: how many pairs of parallel sides, perpendicular sides, and right angles?','numeric',NULL,'2 pairs parallel, 4 pairs perpendicular adjacent sides, 4 right angles',2),
(4,'4.G','4.G.2','A triangle has angles 90°, 45°, 45°. Classify it by its angles.','numeric',NULL,'Right triangle (also isosceles)',2),
(4,'4.G','4.G.2','Is every square a rectangle? Is every rectangle a square? Explain.','numeric',NULL,'Yes; No',3),
(4,'4.G','4.G.2','Is every rhombus a parallelogram? Is every parallelogram a rhombus?','numeric',NULL,'Yes; No',3),
(4,'4.G','4.G.3','Does a square have lines of symmetry? How many?','numeric',NULL,'Yes, 4 lines of symmetry',1),
(4,'4.G','4.G.3','Does the letter A have a line of symmetry?','numeric',NULL,'Yes, 1 vertical line of symmetry',1),
(4,'4.G','4.G.3','How many lines of symmetry does an equilateral triangle have?','numeric',NULL,'3',2),
(4,'4.G','4.G.3','Does a parallelogram (non-rectangle) have any lines of symmetry?','numeric',NULL,'No',2),
(4,'4.G','4.G.3','A regular hexagon has how many lines of symmetry?','numeric',NULL,'6',3),
(4,'4.G','4.G.3','Can you draw a quadrilateral with exactly 1 line of symmetry? Describe it.','numeric',NULL,'Yes - a kite or an isosceles trapezoid',3);

-- ============================================================
-- GRADE 5 (appended)
-- ============================================================

INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.1','Evaluate: (3 + 4) × 2','numeric',NULL,'14',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.1','Evaluate: 5 × (6 − 2)','numeric',NULL,'20',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.1','Evaluate: 3 × [(4 + 2) × 5]','numeric',NULL,'90',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.1','Evaluate: (8 + 2) × (7 − 3)','numeric',NULL,'40',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.1','Evaluate: {[(2 + 3) × 4] − 8} × 2','numeric',NULL,'24',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.1','Evaluate: 5 × {[8 × (3 + 1)] ÷ 4}','numeric',NULL,'40',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.2','Write an expression for: add 8 and 7, then multiply by 2.','numeric',NULL,'2 × (8 + 7)',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.2','Write an expression for: subtract 3 from 10, then divide by 7.','numeric',NULL,'(10 − 3) ÷ 7',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.2','Without evaluating, which is larger: 5 × 345 or 5 × (345 + 17)?','numeric',NULL,'5 × (345 + 17)',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.2','Without evaluating, is 3 × (18932 + 921) three times as large as 18932 + 921?','numeric',NULL,'Yes',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.2','Without evaluating, compare: 4 × (8,721 + 1,279) and 4 × 10,000.','numeric',NULL,'They are equal',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.2','Write an expression for: triple the difference between the product of 6 and 7 and the number 12.','numeric',NULL,'3 × (6 × 7 − 12)',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.3','Start at 0, add 2 each time. What are the first 5 terms?','numeric',NULL,'0, 2, 4, 6, 8',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.3','Start at 0, add 5 each time. What are the first 5 terms?','numeric',NULL,'0, 5, 10, 15, 20',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.3','Rule A: start at 0, add 4. Rule B: start at 0, add 8. Generate 5 terms each and form ordered pairs.','numeric',NULL,'A:0,4,8,12,16. B:0,8,16,24,32. Pairs:(0,0),(4,8),(8,16),(12,24),(16,32)',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.3','In the pattern above, if A = 20, predict B.','numeric',NULL,'B = 40',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.3','Rule A: start 0, add 3. Rule B: start 0, add 9. What is the relationship between corresponding terms? Write 5 ordered pairs.','numeric',NULL,'B = 3×A. Pairs: (0,0),(3,9),(6,18),(9,27),(12,36)',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.OA','5.OA.3','Given pairs (1,5),(2,10),(3,15),(4,20). What are the two rules?','numeric',NULL,'A: start 1, add 1. B: start 5, add 5. Relationship: B = 5 × A',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.1','In 555, how many times greater is the hundreds-place 5 than the tens-place 5?','numeric',NULL,'10 times',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.1','In 3.33, the 3 in the ones place is how many times the 3 in the tenths place?','numeric',NULL,'10 times',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.1','In 6.66, the 6 in the ones place is how many times the 6 in the hundredths place?','numeric',NULL,'100 times',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.1','In 7,070, compare the two 7s.','numeric',NULL,'The thousands-place 7 (7,000) is 100 times the tens-place 7 (70)',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.1','In 88,888.888, the 8 in the ten-thousands place is how many times the 8 in the thousandths place?','numeric',NULL,'10,000,000 times (10⁷)',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.1','A digit''s value is 0.3. If you move it 4 places to the left, what is its new value?','numeric',NULL,'3,000',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.2','What is 10² ?','numeric',NULL,'100',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.2','What is 10³ ?','numeric',NULL,'1,000',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.2','Write 10,000 as a power of 10.','numeric',NULL,'10⁴',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.2','Multiply: 3.45 × 10³','numeric',NULL,'3,450',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.2','Write 6.3 × 10⁴ in standard form.','numeric',NULL,'63,000',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.2','Express 0.0072 as a product of a number and a power of 10.','numeric',NULL,'7.2 × 10⁻³ (or 72 × 10⁻⁴)',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.3','Write 0.375 in words.','numeric',NULL,'Three hundred seventy-five thousandths',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.3','Write ''six and forty-two hundredths'' as a decimal.','numeric',NULL,'6.42',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.3','Write 347.392 in expanded form.','numeric',NULL,'300 + 40 + 7 + 0.3 + 0.09 + 0.002',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.3','Compare: 4.563 ___ 4.536','numeric',NULL,'4.563 > 4.536',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.3','Order from greatest to least: 7.125, 7.215, 7.152, 7.251','numeric',NULL,'7.251, 7.215, 7.152, 7.125',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.3','What decimal is halfway between 3.4 and 3.5?','numeric',NULL,'3.45',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.4','Round 3.47 to the nearest tenth.','numeric',NULL,'3.5',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.4','Round 6.82 to the nearest whole number.','numeric',NULL,'7',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.4','Round 4.5673 to the nearest hundredth.','numeric',NULL,'4.57',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.4','Round 15.998 to the nearest tenth.','numeric',NULL,'16.0',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.4','Round 99.9951 to the nearest hundredth.','numeric',NULL,'100.00',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.4','A number rounded to nearest tenth is 4.8 and to nearest hundredth is 4.75. What could the number be?','numeric',NULL,'Any number from 4.750 to 4.754',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.5','245 × 3 = ?','numeric',NULL,'735',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.5','128 × 5 = ?','numeric',NULL,'640',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.5','456 × 78 = ?','numeric',NULL,'35,568',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.5','1,234 × 56 = ?','numeric',NULL,'69,104',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.5','4,567 × 89 = ?','numeric',NULL,'406,463',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.5','7,891 × 56 = ?','numeric',NULL,'441,896',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.6','96 ÷ 12 = ?','numeric',NULL,'8',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.6','150 ÷ 15 = ?','numeric',NULL,'10',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.6','1,260 ÷ 42 = ?','numeric',NULL,'30',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.6','2,736 ÷ 36 = ?','numeric',NULL,'76',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.6','8,432 ÷ 34 = ?','numeric',NULL,'248',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.6','9,126 ÷ 57 = ?','numeric',NULL,'160 R6',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.7','3.5 + 2.7 = ?','numeric',NULL,'6.2',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.7','8.4 − 3.9 = ?','numeric',NULL,'4.5',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.7','12.75 − 8.38 = ?','numeric',NULL,'4.37',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.7','2.4 × 3.5 = ?','numeric',NULL,'8.4',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.7','45.6 × 2.35 = ?','numeric',NULL,'107.16',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NBT','5.NBT.7','100 − 47.85 = ?','numeric',NULL,'52.15',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.1','1/2 + 1/3 = ?','numeric',NULL,'5/6',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.1','3/4 − 1/2 = ?','numeric',NULL,'1/4',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.1','2/3 + 5/4 = ?','numeric',NULL,'23/12 = 1 11/12',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.1','3 1/2 + 2 2/3 = ?','numeric',NULL,'6 1/6',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.1','5 2/3 + 3 7/8 = ?','numeric',NULL,'9 13/24',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.1','10 1/4 − 6 5/6 = ?','numeric',NULL,'3 5/12',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.2','Sam ate 1/4 of a pizza and Mia ate 1/3. How much did they eat together?','numeric',NULL,'7/12 of the pizza',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.2','A recipe needs 1/2 cup of milk and 1/4 cup of cream. How much liquid total?','numeric',NULL,'3/4 cup',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.2','A board is 5 3/4 feet long. You cut off 2 1/3 feet. How long is the remaining piece?','numeric',NULL,'3 5/12 feet',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.2','It rained 3/8 inch on Monday and 1/2 inch on Tuesday. How much total rain?','numeric',NULL,'7/8 inch',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.2','A carpenter needs boards of 2 1/3 ft, 1 3/4 ft, and 3 1/6 ft. What total length of wood?','numeric',NULL,'7 1/4 feet',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.2','A recipe needs 2/3 cup flour. You only have 3/8 cup. How much more do you need?','numeric',NULL,'7/24 cup',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.3','Interpret 3/4 as a division problem.','numeric',NULL,'3 ÷ 4',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.3','If 4 friends share 3 sandwiches equally, how much does each get?','numeric',NULL,'3/4 of a sandwich',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.3','9 people share a 50-pound sack of rice. How many pounds per person?','numeric',NULL,'50/9 = 5 5/9 pounds',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.3','6 friends share 4 pies. Between what two whole numbers does each share lie?','numeric',NULL,'Between 0 and 1 (4/6 = 2/3)',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.3','15 people share 8 pizzas. Express each person''s share as a fraction and a decimal.','numeric',NULL,'8/15 ≈ 0.533',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.3','7 friends share $20 equally. How much does each friend get?','numeric',NULL,'$20/7 = $2 6/7 ≈ $2.86',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.4','1/2 × 6 = ?','numeric',NULL,'3',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.4','1/3 × 9 = ?','numeric',NULL,'3',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.4','2/3 × 4/5 = ?','numeric',NULL,'8/15',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.4','3/4 × 2/3 = ?','numeric',NULL,'6/12 = 1/2',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.4','2/3 × 4 = ? Use a visual model to explain.','numeric',NULL,'8/3 = 2 2/3',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.4','3/5 × 5/9 = ?','numeric',NULL,'15/45 = 1/3',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.5','Without calculating, is 5 × 3/4 greater or less than 5?','numeric',NULL,'Less than 5',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.5','Without calculating, is 8 × 2 greater or less than 8?','numeric',NULL,'Greater than 8',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.5','Without calculating, compare: 7 × 3/5 and 7.','numeric',NULL,'7 × 3/5 < 7',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.5','Without calculating, compare: 4 × 7/4 and 4.','numeric',NULL,'4 × 7/4 > 4',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.5','Without calculating, order from least to greatest: 20 × 1/3, 20 × 1, 20 × 5/4.','numeric',NULL,'20 × 1/3, 20 × 1, 20 × 5/4',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.5','A recipe is scaled by 3/2. Will the amounts increase or decrease?','numeric',NULL,'Increase',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.6','A garden is 1/2 acre. Sam plants flowers on 2/3 of it. How much is planted?','numeric',NULL,'1/3 acre',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.6','A recipe needs 3/4 cup sugar. You make half. How much sugar?','numeric',NULL,'3/8 cup',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.6','A painter paints 2 1/2 walls per hour. How many walls in 3 1/2 hours?','numeric',NULL,'8 3/4 walls',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.6','A rectangle is 3 1/3 ft by 2 1/4 ft. What is the area?','numeric',NULL,'7 1/2 sq ft',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.6','A rectangular playground is 5 1/4 m by 3 2/3 m. Find the area.','numeric',NULL,'19 1/4 sq m',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.6','A farmer plants 3/5 of his 2 1/2 acre field with corn. How many acres of corn?','numeric',NULL,'1 1/2 acres',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.7','(1/3) ÷ 4 = ?','numeric',NULL,'1/12',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.7','4 ÷ (1/2) = ?','numeric',NULL,'8',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.7','3 ÷ (1/4) = ?','numeric',NULL,'12',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.7','(1/6) ÷ 5 = ?','numeric',NULL,'1/30',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.7','8 ÷ (1/4) = ? Create a story problem for this.','numeric',NULL,'32. Story: How many quarter-pound burgers can you make from 8 pounds of meat?',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.NF','5.NF.7','(1/8) ÷ 6 = ? Explain using multiplication.','numeric',NULL,'1/48',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.1','Convert 5 cm to meters.','numeric',NULL,'0.05 m',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.1','Convert 3 feet to inches.','numeric',NULL,'36 inches',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.1','Convert 3.5 meters to centimeters.','numeric',NULL,'350 cm',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.1','A recipe calls for 2 pints of milk. How many cups is that?','numeric',NULL,'4 cups',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.1','A trail is 3 miles 440 yards. How many yards total? (1 mile = 1,760 yards)','numeric',NULL,'5,720 yards',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.1','Convert 7.5 liters to milliliters, then to cups (1 L ≈ 4.23 cups).','numeric',NULL,'7,500 mL ≈ 31.7 cups',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.2','Data set: 1/4, 1/2, 1/4, 3/4, 1/2, 1/4. How many data points at 1/4?','numeric',NULL,'3',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.2','A line plot has 2 X''s at 1/8, 4 X''s at 3/8, 1 X at 5/8. How many total data points?','numeric',NULL,'7',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.2','Beakers hold: 1/4, 3/8, 1/4, 1/2, 3/8 cups. If redistributed equally among 5 beakers, how much in each?','numeric',NULL,'7/20 cup',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.2','Data: 1/8(3), 1/4(2), 3/8(4), 1/2(1). Find the sum of all measurements.','numeric',NULL,'25/8 = 3 1/8',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.2','8 students measured pencils: 5 1/4(2), 5 1/2(3), 5 3/4(2), 6(1) inches. What is the total length?','numeric',NULL,'44 1/4 inches',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.2','The total water in 10 beakers is 4 3/4 cups. If redistributed equally, how much per beaker?','numeric',NULL,'19/40 cup',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.3','What is volume?','numeric',NULL,'The amount of space a 3D figure takes up, measured in cubic units',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.3','A unit cube has side length 1 cm. What is its volume?','numeric',NULL,'1 cubic centimeter (1 cm³)',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.3','A layer of cubes is 3 × 4. If there are 2 layers, what is the volume?','numeric',NULL,'24 cubic units',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.3','A rectangular prism is 5 cubes long, 3 cubes wide, 2 cubes high. What is the volume?','numeric',NULL,'30 cubic units',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.3','A box has a base area of 20 sq cm and is 6 cm tall. What is the volume?','numeric',NULL,'120 cm³',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.3','Which has more volume: a 3×3×3 cube or a 2×4×4 prism?','numeric',NULL,'The 2×4×4 prism (32 > 27)',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.4','Count the unit cubes: a shape has 2 rows of 3 cubes each, 1 layer high.','numeric',NULL,'6 cubic units',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.4','A shape is made of 3 layers, each with 4 unit cubes. What is the volume?','numeric',NULL,'12 cubic units',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.4','A prism has a bottom layer of 4 × 3 cubes and is 5 layers tall. Volume?','numeric',NULL,'60 cubic units',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.4','Each cube is 1 cm³. A box is filled with 6 × 4 × 3 cubes. Volume in cm³?','numeric',NULL,'72 cm³',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.4','An L-shaped figure: bottom part is 4×3×1, upper part is 2×3×2 (sitting on top of half the bottom). Total volume?','numeric',NULL,'24 cubic units',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.4','A step-shaped solid: step 1 is 5×4×1, step 2 is 3×4×1 on top. Volume?','numeric',NULL,'32 cubic units',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.5','Find the volume: l = 4, w = 3, h = 2.','numeric',NULL,'24 cubic units',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.5','A box is 5 cm × 2 cm × 3 cm. What is the volume?','numeric',NULL,'30 cm³',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.5','An L-shaped room has two parts: 8×5×3 m and 4×5×3 m. Total volume?','numeric',NULL,'180 m³',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.5','A swimming pool is 25 m × 10 m × 2 m. How many cubic meters of water does it hold?','numeric',NULL,'500 m³',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.5','A T-shaped solid: top bar is 8×2×2 and vertical bar is 2×2×6. Total volume?','numeric',NULL,'56 cubic units',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.MD','5.MD.5','A room is 12×10×3 m. A closet 3×2×3 m is removed from the corner. What is the remaining volume?','numeric',NULL,'342 m³',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.1','What is the origin on a coordinate plane?','numeric',NULL,'The point (0, 0) where the x-axis and y-axis intersect',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.1','Plot the point (3, 5). Describe how you get there from the origin.','numeric',NULL,'Move 3 units right and 5 units up',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.1','Point A is at (2, 5) and point B is at (2, 9). Describe the relationship.','numeric',NULL,'They have the same x-coordinate; B is 4 units above A',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.1','Name a point on the x-axis with x-coordinate 8.','numeric',NULL,'(8, 0)',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.1','Points (1,3), (2,6), (3,9), (4,12) form a pattern. What would the y-coordinate be when x = 10?','numeric',NULL,'30',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.1','A rectangle has corners at (1,1), (5,1), (5,4), and (1,4). What is its area?','numeric',NULL,'12 square units',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.2','A store sells lemonade. Monday (1, 5), Tuesday (2, 8). What do the coordinates represent?','numeric',NULL,'Day number and cups sold',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.2','Plot the point that shows 3 hours of work and $15 earned.','numeric',NULL,'(3, 15)',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.2','A taxi charges $2 base plus $3 per mile. Write 4 ordered pairs (miles, cost).','numeric',NULL,'(0,2), (1,5), (2,8), (3,11)',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.2','Points: (1,4), (2,8), (3,12), (4,16). What is the rule?','numeric',NULL,'y = 4x',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.2','Two friends save money. Amy: (0,20),(1,25),(2,30). Ben: (0,5),(1,15),(2,25). When do they have the same amount?','numeric',NULL,'At week 3 (both at $35)',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.2','A rectangle on the coordinate plane has one corner at (2,3) and the opposite corner at (7,8). What is the perimeter?','numeric',NULL,'20 units',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.3','All rectangles have 4 right angles. Are squares rectangles?','numeric',NULL,'Yes',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.3','Since squares are rectangles, do all squares have 4 right angles?','numeric',NULL,'Yes',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.3','A rhombus has 4 equal sides and 2 pairs of parallel sides. Is every rhombus a parallelogram?','numeric',NULL,'Yes',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.3','Is every parallelogram a rectangle? Why or why not?','numeric',NULL,'No',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.3','List the hierarchy: quadrilateral → parallelogram → rectangle → square. What properties does each level add?','numeric',NULL,'Quad: 4 sides. Parallelogram: 2 pairs parallel. Rectangle: 4 right angles. Square: 4 equal sides.',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.3','Is every rhombus a square? Is every square a rhombus?','numeric',NULL,'No; Yes',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.4','Name a quadrilateral with exactly one pair of parallel sides.','numeric',NULL,'Trapezoid',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.4','How is a square different from a rectangle?','numeric',NULL,'A square has all four sides equal; a rectangle only requires opposite sides equal',1);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.4','Classify a shape with 4 sides, 2 pairs of parallel sides, and 4 right angles, but not all sides equal.','numeric',NULL,'Rectangle (but not a square)',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.4','A shape has 4 equal sides but angles are not 90°. Classify it.','numeric',NULL,'Rhombus (but not a square)',2);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.4','Draw the hierarchy: start with ''Quadrilateral'' and show how trapezoid, parallelogram, rectangle, rhombus, and square relate.','numeric',NULL,'Quadrilateral → (Trapezoid, Parallelogram). Parallelogram → (Rectangle, Rhombus). Rectangle ∩ Rhombus = Square.',3);
INSERT INTO diagnostic_questions (grade_level,domain,standard_code,question_text,question_type,options,correct_answer,difficulty) VALUES (5,'5.G','5.G.4','A shape has 4 sides, exactly 2 pairs of parallel sides, 4 equal sides, and no right angles. What is it?','numeric',NULL,'A rhombus (that is not a square)',3);
