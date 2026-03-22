const reviews = require('../grade_mismatch_reviews.json');

const verdicts = {
  // ── CLEAR: freelancer was wrong, question is within scope ─────────────────
  'lesson:97fd768b-56ab-4bd5-8c48-08d4da0f9d0f:1':  { verdict:'CLEAR', reason:'1.OA.5 explicitly says counting up from smaller number to find difference. 11-7 within 20.' },
  'diag:16b664d7-22ec-44f7-9c67-6d9623d594cd':       { verdict:'CLEAR', reason:'2.NBT.2 explicitly says skip-count by 5s within 1000. 970 is within 1000.' },
  'diag:c61e72f6-2016-45aa-8387-e7d1b476fdef':       { verdict:'CLEAR', reason:'2.NBT.7 says add and subtract within 1000. 567-234=333, within scope.' },
  'diag:7a8bcdb1-e91f-4740-bf7e-16997c0ae701':       { verdict:'CLEAR', reason:'2.NBT.7: within 1000. 724-368=356, within scope.' },
  'lesson:db69ccb0-5b42-4724-831b-349d0055c9ed:1':   { verdict:'CLEAR', reason:'1.OA.1: within 20. 7+8=15, simple adding-to problem.' },
  'lesson:ffd019db-f9d4-498b-8815-6e097e957694:1':   { verdict:'CLEAR', reason:'1.OA.3: CCSS gives (2+6)+4=2+(6+4) as the exact example. 8+(2+5) is identical.' },
  'lesson:5ba78f10-f9f9-461c-a246-c405c880a944:4':   { verdict:'CLEAR', reason:'1.OA.4: subtraction as unknown-addend. 15 within 20.' },
  'lesson:0ffba73d-777d-42c3-b36c-a5ad9a653cf7:0':   { verdict:'CLEAR', reason:'1.OA.3: content fine (associative, within 20). Show two ways is a formatting issue, not grade mismatch.' },
  'lesson:61811c59-7386-4764-b8c3-9b9314451964:1':   { verdict:'CLEAR', reason:'1.OA.8: unknown in any position, within 20. 13 is within grade 1 range.' },
  'lesson:fdf9d6c8-0f9c-47f3-a046-1324b6a1d365:0':  { verdict:'CLEAR', reason:'2.NBT.7: 587+248=835, within 1000.' },
  'lesson:fdf9d6c8-0f9c-47f3-a046-1324b6a1d365:2':  { verdict:'CLEAR', reason:'2.NBT.7: 345+478=823, within 1000.' },
  'lesson:2060b91c-952d-4cf7-bed5-00bb3481d826:2':  { verdict:'CLEAR', reason:'2.MD.3: choosing right unit for a car is exactly what estimation of lengths means.' },
  'lesson:172febf5-84c1-4499-aece-8266e5c498b1:3':  { verdict:'CLEAR', reason:'2.MD.3: is 60cm reasonable for 65cm tests estimation judgment, not percentage error.' },
  'lesson:1c9559e5-33b5-489d-aea3-aef7068bd08d:2':  { verdict:'CLEAR', reason:'2.MD.6: sums within 100 on a number line. 47+36=83, within 100.' },
  'diag:bca48d0f-ba80-41f1-a36a-7964afafca48':       { verdict:'CLEAR', reason:'1.OA.1: unknowns in all positions, within 20. 8+?=17 is a canonical 1.OA.1 problem.' },
  'lesson:caa07400-a7d2-456f-a9e4-92f9b220a682:0':  { verdict:'CLEAR', reason:'1.OA.1: same as above.' },
  'lesson:41883c8d-ec4d-4378-a0f0-53f7abb641bc:0':  { verdict:'CLEAR', reason:'1.G.2: composing triangles from smaller triangles is exactly composing shapes.' },
  'lesson:7c0078d1-582b-4ae5-b83e-f8b887d90140:4':  { verdict:'CLEAR', reason:'1.G.2: CCSS says compose 2D shapes to create composite shapes and name it.' },
  'lesson:80abaebe-0d4a-47c9-b89e-10bb79fafefb:0':  { verdict:'CLEAR', reason:'1.G.3: partition into 4 equal shares. Multiple ways is within scope.' },
  'lesson:80abaebe-0d4a-47c9-b89e-10bb79fafefb:4':  { verdict:'CLEAR', reason:'1.G.3: CCSS explicitly says more equal parts = smaller shares. Pizza question tests exactly that.' },
  'lesson:875edb0f-dd29-417d-9936-9b5c2e88fc6b:1':  { verdict:'CLEAR', reason:'1.MD.2: CCSS says smaller units = larger count. Which ruler is shorter tests that directly.' },
  'lesson:ae079020-802d-4b6a-a160-168dda3a6a83:2':  { verdict:'CLEAR', reason:'1.MD.3: hours and half-hours. 12:30 is a half-hour. Difficulty wrong but not a grade mismatch.' },
  'lesson:db69ccb0-5b42-4724-831b-349d0055c9ed:3':  { verdict:'CLEAR', reason:'1.OA.1: 6+?=13, unknown addend, within 20.' },
  'lesson:5ba78f10-f9f9-461c-a246-c405c880a944:2':  { verdict:'CLEAR', reason:'1.OA.4: 20-?=13 is unknown-addend. 20 is within Grade 1 range.' },
  'lesson:3d805208-70d5-4db9-a336-9f6369c202fd:2':  { verdict:'CLEAR', reason:'1.OA.7: equations with operations on both sides. 8+7-5=10, within 20.' },
  'lesson:acc8bf59-da18-4997-a0bd-0b776defb4e0:0':  { verdict:'CLEAR', reason:'2.G.3: explicitly covers thirds. Comment is about a wrong distractor, not grade level.' },
  'lesson:172febf5-84c1-4499-aece-8266e5c498b1:2':  { verdict:'CLEAR', reason:'2.MD.3: estimating length of common object in cm is exactly what the code requires.' },
  'lesson:a9a038ae-d0a3-46ee-9139-58186fd319a5:2':  { verdict:'CLEAR', reason:'2.MD.2: conversion given (1cm=10mm), student just observes 3x10=30. That is observing the relationship.' },
  'lesson:7c0078d1-582b-4ae5-b83e-f8b887d90140:1':  { verdict:'CLEAR', reason:'1.G.2: identifying real-world 3D shapes is within scope. Wrong answer choices are a content issue.' },
  'lesson:1e2cbda4-4db4-454e-87f0-2ee5b66324c6:3':  { verdict:'CLEAR', reason:'2.G.1 explicitly lists hexagons. Regular shapes are implied by attribute recognition.' },
  'lesson:33a6271b-ee45-481c-9cf0-fd8dbe9a30d3:1':  { verdict:'CLEAR', reason:'1.MD.4: how many in each category is directly in scope. 20-8-7 uses numbers within 20.' },

  // ── TRUE MISMATCH: question content genuinely exceeds the code scope ───────
  'diag:a223234f-db35-4253-aabc-7603026c4b5b':       { verdict:'MISMATCH', reason:'2.MD.1 is measuring with tools, not converting units. Feet-to-inches belongs to 4.MD.1.' },
  'diag:04eb0a5a-d1da-4ccb-885f-f13ad544d877':       { verdict:'MISMATCH', reason:'4.MD.6 is protractor use only. Supplementary angles not introduced until Grade 7 (7.G.5).' },
  'lesson:33a6271b-ee45-481c-9cf0-fd8dbe9a30d3:3':  { verdict:'MISMATCH', reason:'Writing your own question from data is not in 1.MD.4 scope.' },
  'lesson:41883c8d-ec4d-4378-a0f0-53f7abb641bc:1':  { verdict:'MISMATCH', reason:'1.G.2 is composing shapes, not counting faces. Face-counting not introduced until Grade 2.' },
  'diag:9ba09fd7-7ff2-4943-98c4-e2cfc05efe19':       { verdict:'MISMATCH', reason:'Same: face-counting on a 3D shape is not 1.G.2.' },
  'lesson:41883c8d-ec4d-4378-a0f0-53f7abb641bc:4':  { verdict:'MISMATCH', reason:'1.G.2 is composing shapes, not comparing attributes between 3D shapes.' },
  'lesson:7c0078d1-582b-4ae5-b83e-f8b887d90140:3':  { verdict:'MISMATCH', reason:'Identifying shape by named face types (triangular + rectangular faces) is not in 1.G.2.' },
  'lesson:db77312a-6557-43ff-bc80-80bf5fee3243:4':  { verdict:'MISMATCH', reason:'2.MD.1 requires whole-number readings. Decimal answer (3.5 cm) is Grade 4-5 content.' },
  'diag:4ceb2330-1695-48e2-83da-3b763cb82010':       { verdict:'MISMATCH', reason:'2.MD.1 is measuring with tools. Meters-to-cm conversion is 4.MD.1.' },
  'lesson:db77312a-6557-43ff-bc80-80bf5fee3243:1':  { verdict:'MISMATCH', reason:'Same: meters to cm conversion is not 2.MD.1.' },
  'lesson:b0d29144-3a31-46d3-afbd-914bff7b3c77:3':  { verdict:'MISMATCH', reason:'2.MD.2 observes bigger/smaller relationship, not calculates ratios. Requires 10/4=2.5.' },
  'lesson:a9a038ae-d0a3-46ee-9139-58186fd319a5:0':  { verdict:'MISMATCH', reason:'2.MD.2 is observing the relationship, not calculating 6/2=3 to derive feet-per-yard.' },
  'lesson:a9a038ae-d0a3-46ee-9139-58186fd319a5:1':  { verdict:'MISMATCH', reason:'9 meters to cm requires knowing the conversion factor (x100). Not in 2.MD.2.' },
  'lesson:a9a038ae-d0a3-46ee-9139-58186fd319a5:3':  { verdict:'MISMATCH', reason:'Requires knowing 1m=100cm. That is unit conversion (4.MD.1), not 2.MD.2.' },
  'lesson:a9a038ae-d0a3-46ee-9139-58186fd319a5:4':  { verdict:'MISMATCH', reason:'Decimal multiplication 2.5x30 is not in Grade 2 scope.' },
  'lesson:875edb0f-dd29-417d-9936-9b5c2e88fc6b:3':  { verdict:'MISMATCH', reason:'20/10=2 is division. Division introduced in Grade 3 (3.OA). Not in 1.MD.2.' },
  'lesson:14190ba0-a041-4002-8d2b-38f4c25186cd:0':  { verdict:'MISMATCH', reason:'4.MD.3 applies the perimeter formula. L=3W with P=50 requires solving a system (algebra), not formula application.' },
  'lesson:890bf4dc-83aa-4364-a4cd-f1a999de6d87:1':  { verdict:'MISMATCH', reason:'4.MD.2 requires whole-number results. 50/3=16.67 is non-whole, beyond scope.' },
  'lesson:8cbc8ded-1ec9-4091-a5bb-0e3f94bb4166:1':  { verdict:'MISMATCH', reason:'5.NBT.2 specifies whole-number exponents only. 0.0072=7.2x10^-3 requires negative exponents (Grade 8-9).' },
  'lesson:3560885d-79c0-48f1-a036-6366c7a66315:1':  { verdict:'MISMATCH', reason:'5.MD.1 converts within one system. Liters to cups crosses metric to US customary.' },
};

let clear = 0, mismatch = 0, missing = [];
reviews.forEach(r => {
  const v = verdicts[r.question_ref];
  if (!v) { missing.push(r.question_ref); return; }
  if (v.verdict === 'CLEAR') clear++;
  else mismatch++;
});

console.log('CLEAR (not actually a mismatch):', clear);
console.log('TRUE MISMATCH (freelancer correct):', mismatch);
console.log('Total:', clear + mismatch);
if (missing.length) console.log('Missing verdict:', missing);

require('fs').writeFileSync('grade_mismatch_verdicts.json', JSON.stringify(verdicts, null, 2));
