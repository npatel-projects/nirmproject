-- Migration 018: Add enrolled_module to member table.
-- Stores the module/tier option the member selected during enrollment
-- (e.g. 'Premium', 'Standard', 'Basic') so the Plan Summary can show
-- only their chosen tier without a selector.

ALTER TABLE member ADD COLUMN IF NOT EXISTS enrolled_module TEXT;

-- Backfill seed members based on their plan and role:
--   Natalie Lee   → Executive Plan (Modular)  → Premium
--   Rachel Johnson→ Executive Plan (Modular)  → Standard
--   John Doe      → Operational Plan (Flex)   → Standard
--   Norman Smith  → Office Plan (Traditional) → Standard

UPDATE member SET enrolled_module = 'Premium'  WHERE member_id = 'cc400000-0000-0000-0000-000000000001';
UPDATE member SET enrolled_module = 'Standard' WHERE member_id = 'cc400000-0000-0000-0000-000000000002';
UPDATE member SET enrolled_module = 'Standard' WHERE member_id = 'cc400000-0000-0000-0000-000000000003';
UPDATE member SET enrolled_module = 'Standard' WHERE member_id = 'cc400000-0000-0000-0000-000000000004';
