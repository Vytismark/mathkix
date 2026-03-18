-- ============================================================================
-- 012_fix_domain_values.sql
-- Fix diagnostic_questions.domain to use short codes (OA, NBT, NF, MD, G)
-- instead of grade-prefixed codes (1.OA, 2.NBT, etc.)
-- ============================================================================

UPDATE diagnostic_questions
SET domain = SPLIT_PART(domain, '.', 2)
WHERE domain LIKE '%.%';
