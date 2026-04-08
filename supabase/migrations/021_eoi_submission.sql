-- Migration 021: Per-employee EOI (Evidence of Insurability) submission tracking.
-- One row per benefit per employee that requires EOI.

CREATE TABLE IF NOT EXISTS eoi_submission (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
  sponsor_id      UUID NOT NULL REFERENCES sponsor(sponsor_id)   ON DELETE CASCADE,
  plan_id         UUID REFERENCES plan(plan_id),
  benefit_type    TEXT NOT NULL,          -- LIFE | ADD | LTD | EHC | DENTAL | DRUG | CI
  amount_applied  NUMERIC(14,2),          -- amount of coverage that triggered EOI
  status          TEXT NOT NULL DEFAULT 'PENDING',
  -- PENDING | RECEIVED | APPROVED | DECLINED
  requested_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  resolved_at     TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eoi_submission_employee ON eoi_submission (employee_id);
CREATE INDEX IF NOT EXISTS idx_eoi_submission_sponsor  ON eoi_submission (sponsor_id, status);

-- ── Seed: EOI submissions for enrolled members that triggered EOI rules ────────

-- Natalie Lee (EMP0001) — Executive Plan: high LIFE coverage triggered EOI
INSERT INTO eoi_submission (id, employee_id, sponsor_id, plan_id, benefit_type, amount_applied, status, requested_at)
VALUES (
  'e0100000-0000-0000-0000-000000000001',
  'f6000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'c3000000-0000-0000-0000-000000000001',
  'LIFE', 1500000.00, 'RECEIVED',
  CURRENT_DATE - INTERVAL '45 days'
);

-- Rachel Johnson (EMP0002) — Executive Plan: LTD over NEM threshold
INSERT INTO eoi_submission (id, employee_id, sponsor_id, plan_id, benefit_type, amount_applied, status, requested_at)
VALUES (
  'e0100000-0000-0000-0000-000000000002',
  'f6000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'c3000000-0000-0000-0000-000000000001',
  'LTD', NULL, 'PENDING',
  CURRENT_DATE - INTERVAL '12 days'
);

-- Rachel Johnson (EMP0002) — also LIFE
INSERT INTO eoi_submission (id, employee_id, sponsor_id, plan_id, benefit_type, amount_applied, status, requested_at)
VALUES (
  'e0100000-0000-0000-0000-000000000003',
  'f6000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'c3000000-0000-0000-0000-000000000001',
  'LIFE', 2000000.00, 'PENDING',
  CURRENT_DATE - INTERVAL '12 days'
);

-- John Doe (EMP0005) — Operational Plan: ADD over threshold
INSERT INTO eoi_submission (id, employee_id, sponsor_id, plan_id, benefit_type, amount_applied, status, requested_at, resolved_at)
VALUES (
  'e0100000-0000-0000-0000-000000000004',
  'f6000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000001',
  'c3000000-0000-0000-0000-000000000002',
  'LIFE', 500000.00, 'APPROVED',
  CURRENT_DATE - INTERVAL '90 days',
  NOW() - INTERVAL '60 days'
);
