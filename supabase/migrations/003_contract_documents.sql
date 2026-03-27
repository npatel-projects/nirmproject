-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: contract_document
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE contract_document (
    document_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id    UUID            NOT NULL REFERENCES group_contract(contract_id),
    document_type  VARCHAR(100)    NOT NULL,  -- e.g. Group Policy, Plan Summary, Bill
    event          VARCHAR(100)    NOT NULL,  -- e.g. Initial Issue, Renewal, Monthly Billing
    effective_date DATE            NOT NULL,
    issue_date     DATE            NOT NULL,
    storage_ref    VARCHAR(500),             -- path/URL to PDF in storage; null = not yet generated
    created_at     TIMESTAMPTZ     NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: documents for GRP-2024-001234 (ABC Company)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO contract_document (contract_id, document_type, event, effective_date, issue_date)
VALUES
    ('b2000000-0000-0000-0000-000000000001', 'Group Policy',  'Initial Issue',   '2023-01-31', '2023-01-14'),
    ('b2000000-0000-0000-0000-000000000001', 'Plan Summary',  'Initial Issue',   '2024-01-31', '2024-01-14'),
    ('b2000000-0000-0000-0000-000000000001', 'Group Policy',  'Renewal',         '2024-01-31', '2024-01-19'),
    ('b2000000-0000-0000-0000-000000000001', 'Group Policy',  'Renewal',         '2025-01-31', '2025-01-14'),
    ('b2000000-0000-0000-0000-000000000001', 'Group Policy',  'Renewal',         '2026-01-31', '2026-01-14');


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: documents for GRP-2024-005678 (Acquisition 1)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO contract_document (contract_id, document_type, event, effective_date, issue_date)
VALUES
    ('b2000000-0000-0000-0000-000000000002', 'Group Policy',  'Initial Issue',   '2025-11-08', '2025-10-20'),
    ('b2000000-0000-0000-0000-000000000002', 'Plan Summary',  'Initial Issue',   '2025-11-08', '2025-10-20'),
    ('b2000000-0000-0000-0000-000000000002', 'Group Policy',  'Renewal',         '2026-11-08', '2026-10-15');
