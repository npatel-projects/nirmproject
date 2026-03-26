-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: sponsors
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sponsor (sponsor_id, sponsor_name, sponsor_type, country_code, province_state_code, status)
VALUES
    ('a1000000-0000-0000-0000-000000000001', 'ABC Company', 'EMPLOYER', 'CA', 'QC', 'ACTIVE');


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: group_contracts
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO group_contract (contract_id, sponsor_id, contract_number, contract_name, effective_date, renewal_date, funding_type, status, country_code)
VALUES
    (
        'b2000000-0000-0000-0000-000000000001',
        'a1000000-0000-0000-0000-000000000001',
        'GRP-2024-001234',
        'ABC Company Group Benefits',
        '2025-12-31',
        '2026-12-31',
        'INSURED',
        'ACTIVE',
        'CA'
    ),
    (
        'b2000000-0000-0000-0000-000000000002',
        'a1000000-0000-0000-0000-000000000001',
        'GRP-2024-005678',
        'Acquisition 1 Group Benefits',
        '2025-11-08',
        '2026-11-08',
        'INSURED',
        'ACTIVE',
        'CA'
    );


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: plans
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO plan (plan_id, contract_id, plan_code, plan_name, effective_date, status)
VALUES
    ('c3000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'EXEC',  'Executive Plan',              '2025-12-31', 'ACTIVE'),
    ('c3000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000001', 'OPS',   'Operational Employees Plan',  '2025-12-31', 'ACTIVE'),
    ('c3000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000001', 'OFFCE', 'Office Employees Plan',       '2025-12-31', 'ACTIVE'),
    ('c3000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000002', 'EMP',   'Employee Plan',               '2025-11-08', 'ACTIVE');
