-- Migration 016: Remove Northern Logistics and Metro Healthcare sponsors and all their data.
-- Order matters: delete child rows before parent rows to satisfy FK constraints.

-- 1. Pending actions
DELETE FROM sponsor_pending_action
WHERE sponsor_id IN (
  'c0000001-0000-0000-0000-000000000003',
  'c0000001-0000-0000-0000-000000000004'
);

-- 2. Broker ↔ sponsor links
DELETE FROM broker_sponsor
WHERE sponsor_id IN (
  'c0000001-0000-0000-0000-000000000003',
  'c0000001-0000-0000-0000-000000000004'
);

-- 3. Group contracts
DELETE FROM group_contract
WHERE sponsor_id IN (
  'c0000001-0000-0000-0000-000000000003',
  'c0000001-0000-0000-0000-000000000004'
);

-- 4. Sponsors (must be last)
DELETE FROM sponsor
WHERE sponsor_id IN (
  'c0000001-0000-0000-0000-000000000003',
  'c0000001-0000-0000-0000-000000000004'
);
