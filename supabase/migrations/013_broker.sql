-- 013_broker.sql
-- Broker portal: tables, Max Hampton seed, mock groups, associations, pending actions

-- ── Broker table ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS broker (
  broker_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  email                 TEXT,
  phone                 TEXT,
  broker_code           TEXT UNIQUE NOT NULL,
  status                TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Broker ↔ Sponsor association ─────────────────────────────────────────────
-- Association is at the sponsor level; contract details (status, premium, renewal)
-- live on group_contract as they already do in the existing schema.
CREATE TABLE IF NOT EXISTS broker_sponsor (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id             UUID NOT NULL REFERENCES broker(broker_id) ON DELETE CASCADE,
  sponsor_id            UUID NOT NULL REFERENCES sponsor(sponsor_id) ON DELETE CASCADE,
  role                  TEXT NOT NULL DEFAULT 'PRIMARY', -- PRIMARY | MGA_ADVISOR | SUB_ADVISOR
  effective_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (broker_id, sponsor_id)
);

-- ── Pending actions per sponsor group ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sponsor_pending_action (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id            UUID NOT NULL REFERENCES sponsor(sponsor_id) ON DELETE CASCADE,
  action_type           TEXT NOT NULL,
  -- MISSING_DOCUMENTS | OUTSTANDING_EOI | UNSIGNED_RENEWAL | MISSING_CENSUS
  description           TEXT,
  due_date              DATE,
  resolved_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Sponsor-level broker metadata ────────────────────────────────────────────
-- province_state_code already exists on sponsor from the initial schema.
-- Status and premium belong on group_contract (where they already exist).
ALTER TABLE sponsor ADD COLUMN IF NOT EXISTS total_lives        INTEGER;
ALTER TABLE sponsor ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- ── Annual premium lives on the contract, not the sponsor ────────────────────
ALTER TABLE group_contract ADD COLUMN IF NOT EXISTS annual_premium_estimate NUMERIC(12,2);

-- ── Seed: Max Hampton ─────────────────────────────────────────────────────────
INSERT INTO broker (broker_id, first_name, last_name, email, broker_code)
VALUES (
  'b0000001-0000-0000-0000-000000000001',
  'Max', 'Hampton',
  'max.hampton@brokeragefirm.com',
  'BRK-MH-001'
) ON CONFLICT DO NOTHING;

-- ── Seed: Additional mock sponsor groups ─────────────────────────────────────
INSERT INTO sponsor (sponsor_id, sponsor_name, sponsor_type, country_code, province_state_code, status, total_lives, last_activity_date)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Acme Manufacturing Inc.',  'EMPLOYER', 'CA', 'ON', 'ACTIVE',  89, CURRENT_DATE - INTERVAL  '3 days'),
  ('c0000001-0000-0000-0000-000000000002', 'TechStart Solutions',      'EMPLOYER', 'CA', 'BC', 'ACTIVE',  34, CURRENT_DATE - INTERVAL  '1 day'),
  ('c0000001-0000-0000-0000-000000000003', 'Northern Logistics Ltd.',  'EMPLOYER', 'CA', 'AB', 'ACTIVE', 156, CURRENT_DATE - INTERVAL '10 days'),
  ('c0000001-0000-0000-0000-000000000004', 'Metro Healthcare Group',   'EMPLOYER', 'CA', 'QC', 'ACTIVE',   0, CURRENT_DATE - INTERVAL '45 days')
ON CONFLICT DO NOTHING;

-- Backfill lives/activity on the existing demo sponsor
UPDATE sponsor SET
  total_lives        = 47,
  last_activity_date = CURRENT_DATE - INTERVAL '5 days'
WHERE sponsor_id = 'a1000000-0000-0000-0000-000000000001';

-- ── Seed: group_contracts for new sponsors ────────────────────────────────────
-- Status values mirror the existing schema (ACTIVE, LAPSED, etc.).
-- PENDING_RENEWAL is a valid status indicating the contract is up for renewal.
INSERT INTO group_contract (contract_id, sponsor_id, contract_name, contract_number, funding_type, country_code, status, effective_date, renewal_date, annual_premium_estimate)
VALUES
  ('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Acme Group Benefits Plan',  'GH-7721', 'INSURED', 'CA', 'ACTIVE',  '2024-05-01', (CURRENT_DATE + INTERVAL  '45 days')::date, 220000.00),
  ('d0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000002', 'TechStart Benefits Plan',   'GH-8834', 'INSURED', 'CA', 'PENDING', '2024-03-01', (CURRENT_DATE + INTERVAL  '12 days')::date,  98000.00),
  ('d0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000003', 'Northern Logistics Plan',   'GH-5503', 'INSURED', 'CA', 'ACTIVE',  '2023-10-01', (CURRENT_DATE + INTERVAL '120 days')::date, 445000.00),
  ('d0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000004', 'Metro Healthcare Benefits', 'GH-4422', 'INSURED', 'CA', 'LAPSED',  '2023-04-01', (CURRENT_DATE - INTERVAL  '15 days')::date,      NULL)
ON CONFLICT DO NOTHING;

-- Backfill annual_premium_estimate on existing demo contract
UPDATE group_contract SET annual_premium_estimate = 125000.00
WHERE sponsor_id = 'a1000000-0000-0000-0000-000000000001'
  AND annual_premium_estimate IS NULL;

-- ── Link Max Hampton to all sponsor groups ────────────────────────────────────
INSERT INTO broker_sponsor (broker_id, sponsor_id, role)
VALUES
  ('b0000001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'PRIMARY'),
  ('b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'PRIMARY'),
  ('b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002', 'PRIMARY'),
  ('b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003', 'MGA_ADVISOR'),
  ('b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000004', 'PRIMARY')
ON CONFLICT DO NOTHING;

-- ── Seed: pending actions ─────────────────────────────────────────────────────
INSERT INTO sponsor_pending_action (id, sponsor_id, action_type, description, due_date)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'OUTSTANDING_EOI',   'EOI required for 3 late enrolees',            CURRENT_DATE + INTERVAL '14 days'),
  ('e0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'MISSING_DOCUMENTS', 'Missing plan administrator agreement',         CURRENT_DATE + INTERVAL  '7 days'),
  ('e0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000002', 'UNSIGNED_RENEWAL',  'Renewal documents awaiting signature',         CURRENT_DATE + INTERVAL  '5 days'),
  ('e0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000002', 'MISSING_CENSUS',    'Annual census data not yet submitted',         CURRENT_DATE + INTERVAL '12 days'),
  ('e0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000003', 'OUTSTANDING_EOI',   'Late enrolment evidence required for 1 life',  CURRENT_DATE + INTERVAL '30 days'),
  ('e0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000004', 'UNSIGNED_RENEWAL',  'Lapsed — renewal package not returned',        CURRENT_DATE - INTERVAL  '5 days')
ON CONFLICT DO NOTHING;
