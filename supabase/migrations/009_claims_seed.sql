-- ─────────────────────────────────────────────────────────────────────────────
-- 009_claims_seed.sql
-- Adds claim_number column, creates claim_estimate table, seeds claims + estimates
-- ─────────────────────────────────────────────────────────────────────────────


-- ─── 1. Add claim_number to claim ────────────────────────────────────────────
ALTER TABLE claim ADD COLUMN IF NOT EXISTS claim_number VARCHAR(50) UNIQUE;


-- ─── 2. claim_estimate table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS claim_estimate (
    estimate_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id        UUID                NOT NULL REFERENCES member(member_id),
    benefit_id       UUID                NOT NULL REFERENCES benefit(benefit_id),
    claim_type       claim_type_enum     NOT NULL,
    estimate_number  VARCHAR(50)         UNIQUE,
    statement_date   DATE                NOT NULL,
    claimant_name    VARCHAR(200),
    amount_claimed   DECIMAL(14,2),
    payable_amount   DECIMAL(14,2),
    created_at       TIMESTAMPTZ         NOT NULL DEFAULT now()
);


-- ─── 3. Seed claims ──────────────────────────────────────────────────────────
-- Portal admin user: e5000000-0000-0000-0000-000000000001
--
-- Members:
--   cc400000-...-001  MEM10001  Natalie Lee     Executive Plan
--   cc400000-...-002  MEM10002  Rachel Johnson  Executive Plan
--   cc400000-...-003  MEM10003  John Doe        Operational Plan
--   cc400000-...-004  MEM10004  Norman Smith    Office Plan
--
-- Dental benefit IDs:
--   Executive Plan   : d4000001-0000-0000-0000-000000000006
--   Operational Plan : d4000002-0000-0000-0000-000000000004
--   Office Plan      : d4000003-0000-0000-0000-000000000003
-- Drug benefit (Exec): d4000001-0000-0000-0000-000000000007
-- EHC benefit (Exec) : d4000001-0000-0000-0000-000000000005
-- Life benefit (Exec): d4000001-0000-0000-0000-000000000001

-- ── In-Progress claims ───────────────────────────────────────────────────────
INSERT INTO claim (
  claim_id, member_id, benefit_id, submitted_by,
  claim_number, claim_type, incident_date, submission_date,
  status, approved_amount, paid_amount
)
VALUES
  -- CLM-2026-001  Natalie Lee  Dental  SUBMITTED
  (
    'e7000000-0000-0000-0000-000000000001',
    'cc400000-0000-0000-0000-000000000001',
    'd4000001-0000-0000-0000-000000000006',
    'e5000000-0000-0000-0000-000000000001',
    'CLM-2026-001', 'DENTAL',
    '2026-03-20', '2026-03-25',
    'SUBMITTED', NULL, NULL
  ),
  -- CLM-2026-002  Rachel Johnson  Medical (EHC)  IN_REVIEW
  (
    'e7000000-0000-0000-0000-000000000002',
    'cc400000-0000-0000-0000-000000000002',
    'd4000001-0000-0000-0000-000000000005',
    'e5000000-0000-0000-0000-000000000001',
    'CLM-2026-002', 'HEALTH',
    '2026-03-10', '2026-03-22',
    'IN_REVIEW', NULL, NULL
  ),
  -- CLM-2026-003  Natalie Lee  Drug  SUBMITTED
  (
    'e7000000-0000-0000-0000-000000000003',
    'cc400000-0000-0000-0000-000000000001',
    'd4000001-0000-0000-0000-000000000007',
    'e5000000-0000-0000-0000-000000000001',
    'CLM-2026-003', 'DRUG',
    '2026-03-15', '2026-03-18',
    'SUBMITTED', NULL, NULL
  ),
  -- CLM-2026-004  John Doe  Dental  DRAFT
  (
    'e7000000-0000-0000-0000-000000000004',
    'cc400000-0000-0000-0000-000000000003',
    'd4000002-0000-0000-0000-000000000004',
    'e5000000-0000-0000-0000-000000000001',
    'CLM-2026-004', 'DENTAL',
    '2026-03-20', NULL,
    'DRAFT', NULL, NULL
  ),
  -- CLM-2026-005  John Doe  Dental  DRAFT
  (
    'e7000000-0000-0000-0000-000000000005',
    'cc400000-0000-0000-0000-000000000003',
    'd4000002-0000-0000-0000-000000000004',
    'e5000000-0000-0000-0000-000000000001',
    'CLM-2026-005', 'DENTAL',
    '2026-03-21', NULL,
    'DRAFT', NULL, NULL
  );


-- ── Completed claims ─────────────────────────────────────────────────────────
INSERT INTO claim (
  claim_id, member_id, benefit_id, submitted_by,
  claim_number, claim_type, incident_date, submission_date,
  status, approved_amount, paid_amount, paid_date
)
VALUES
  -- CLM-2025-001  Natalie Lee  Dental  APPROVED  $125/$75
  (
    'e7000000-0000-0000-0000-000000000011',
    'cc400000-0000-0000-0000-000000000001',
    'd4000001-0000-0000-0000-000000000006',
    'e5000000-0000-0000-0000-000000000001',
    'CLM-2025-001', 'DENTAL',
    '2026-02-10', '2026-02-14',
    'APPROVED', 75.00, 75.00, '2026-02-16'
  ),
  -- CLM-2025-002  Natalie Lee  Dental  CLOSED  $82/$0
  (
    'e7000000-0000-0000-0000-000000000012',
    'cc400000-0000-0000-0000-000000000001',
    'd4000001-0000-0000-0000-000000000006',
    'e5000000-0000-0000-0000-000000000001',
    'CLM-2025-002', 'DENTAL',
    '2026-02-10', '2026-02-14',
    'CLOSED', 0.00, 0.00, '2026-02-16'
  ),
  -- CLM-2025-003  Natalie Lee  Drug  APPROVED  $950/$950
  (
    'e7000000-0000-0000-0000-000000000013',
    'cc400000-0000-0000-0000-000000000001',
    'd4000001-0000-0000-0000-000000000007',
    'e5000000-0000-0000-0000-000000000001',
    'CLM-2025-003', 'DRUG',
    '2025-11-28', '2025-12-01',
    'APPROVED', 950.00, 950.00, '2025-12-09'
  ),
  -- CLM-2025-004  Rachel Johnson  Medical  PARTIALLY_APPROVED  $350/$200
  (
    'e7000000-0000-0000-0000-000000000014',
    'cc400000-0000-0000-0000-000000000002',
    'd4000001-0000-0000-0000-000000000005',
    'e5000000-0000-0000-0000-000000000001',
    'CLM-2025-004', 'HEALTH',
    '2025-10-15', '2025-10-20',
    'PARTIALLY_APPROVED', 200.00, 200.00, '2025-10-27'
  ),
  -- CLM-2024-001  Norman Smith  Dental  DECLINED  $475/$0
  (
    'e7000000-0000-0000-0000-000000000015',
    'cc400000-0000-0000-0000-000000000004',
    'd4000003-0000-0000-0000-000000000003',
    'e5000000-0000-0000-0000-000000000001',
    'CLM-2024-001', 'DENTAL',
    '2025-08-10', '2025-08-15',
    'DECLINED', 0.00, 0.00, NULL
  );


-- ── 4. Seed claim_estimate records ───────────────────────────────────────────
INSERT INTO claim_estimate (
  estimate_id, member_id, benefit_id, claim_type,
  estimate_number, statement_date, claimant_name,
  amount_claimed, payable_amount
)
VALUES
  (
    'e8000000-0000-0000-0000-000000000001',
    'cc400000-0000-0000-0000-000000000001',
    'd4000001-0000-0000-0000-000000000006',
    'DENTAL',
    '011225-ALX96-00', '2025-12-01', 'Natalie Lee',
    950.00, 950.00
  ),
  (
    'e8000000-0000-0000-0000-000000000002',
    'cc400000-0000-0000-0000-000000000001',
    'd4000001-0000-0000-0000-000000000006',
    'DENTAL',
    '011225-ALZ94-00', '2025-12-01', 'Natalie Lee',
    474.00, 474.00
  ),
  (
    'e8000000-0000-0000-0000-000000000003',
    'cc400000-0000-0000-0000-000000000002',
    'd4000001-0000-0000-0000-000000000006',
    'DENTAL',
    '091225-CGC54-00', '2025-12-09', 'Rachel Johnson',
    250.00, 200.00
  );
