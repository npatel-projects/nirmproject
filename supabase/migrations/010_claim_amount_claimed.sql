-- ─────────────────────────────────────────────────────────────────────────────
-- 010_claim_amount_claimed.sql
-- Adds amount_claimed column to claim; backfills seed rows
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE claim ADD COLUMN IF NOT EXISTS amount_claimed DECIMAL(14,2);

-- Backfill amount_claimed for seeded in-progress claims
UPDATE claim SET amount_claimed = 2500.00 WHERE claim_number = 'CLM-2026-001';
UPDATE claim SET amount_claimed =  850.00 WHERE claim_number = 'CLM-2026-002';
UPDATE claim SET amount_claimed =  125.00 WHERE claim_number = 'CLM-2026-003';
UPDATE claim SET amount_claimed =    0.00 WHERE claim_number = 'CLM-2026-004';
UPDATE claim SET amount_claimed =    0.00 WHERE claim_number = 'CLM-2026-005';

-- Backfill amount_claimed for seeded completed claims
UPDATE claim SET amount_claimed =  125.00 WHERE claim_number = 'CLM-2025-001';
UPDATE claim SET amount_claimed =   82.00 WHERE claim_number = 'CLM-2025-002';
UPDATE claim SET amount_claimed =  950.00 WHERE claim_number = 'CLM-2025-003';
UPDATE claim SET amount_claimed =  350.00 WHERE claim_number = 'CLM-2025-004';
UPDATE claim SET amount_claimed =  475.00 WHERE claim_number = 'CLM-2024-001';
