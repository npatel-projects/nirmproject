-- ─────────────────────────────────────────────────────────────────────────────
-- 006_beneficiary_dependent_seed.sql
-- Creates the beneficiary table and seeds mock data for beneficiaries
-- and dependents (dependent table already exists in 001_initial_schema.sql)
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Beneficiary table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE beneficiary_type_enum AS ENUM ('PRIMARY', 'CONTINGENT');

CREATE TABLE beneficiary (
    beneficiary_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id         UUID                        NOT NULL REFERENCES member(member_id),
    first_name        VARCHAR(100)                NOT NULL,
    last_name         VARCHAR(100)                NOT NULL,
    date_of_birth     DATE,
    relationship      VARCHAR(50)                 NOT NULL,
    beneficiary_type  beneficiary_type_enum       NOT NULL DEFAULT 'PRIMARY',
    allocation_pct    DECIMAL(5,2)                NOT NULL DEFAULT 100.00,
    effective_date    DATE                        NOT NULL,
    status            VARCHAR(20)                 NOT NULL DEFAULT 'ACTIVE',
    created_at        TIMESTAMPTZ                 NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Beneficiary seed data
--    Members: MEM10001 (Natalie Lee), MEM10002 (Rachel Johnson),
--             MEM10003 (John Doe), MEM10004 (Norman Smith)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO beneficiary (
    beneficiary_id, member_id,
    first_name, last_name, date_of_birth, relationship,
    beneficiary_type, allocation_pct, effective_date, status
)
VALUES
    -- MEM10001 — Natalie Lee: 1 primary beneficiary
    (
        'dd500000-0000-0000-0000-000000000001',
        'cc400000-0000-0000-0000-000000000001',
        'Rachel', 'Smith', '1985-03-10', 'Daughter',
        'PRIMARY', 100.00, '2025-12-21', 'ACTIVE'
    ),

    -- MEM10002 — Rachel Johnson: 2 primaries split
    (
        'dd500000-0000-0000-0000-000000000002',
        'cc400000-0000-0000-0000-000000000002',
        'James', 'Johnson', '1988-07-22', 'Spouse',
        'PRIMARY', 60.00, '2024-06-01', 'ACTIVE'
    ),
    (
        'dd500000-0000-0000-0000-000000000003',
        'cc400000-0000-0000-0000-000000000002',
        'Emma', 'Johnson', '2015-11-05', 'Daughter',
        'PRIMARY', 40.00, '2024-06-01', 'ACTIVE'
    ),

    -- MEM10003 — John Doe: primary + contingent
    (
        'dd500000-0000-0000-0000-000000000004',
        'cc400000-0000-0000-0000-000000000003',
        'Maria', 'Doe', '1990-01-15', 'Spouse',
        'PRIMARY', 100.00, '2023-09-10', 'ACTIVE'
    ),
    (
        'dd500000-0000-0000-0000-000000000005',
        'cc400000-0000-0000-0000-000000000003',
        'Thomas', 'Doe', '1955-06-20', 'Parent',
        'CONTINGENT', 100.00, '2023-09-10', 'ACTIVE'
    ),

    -- MEM10004 — Norman Smith: 1 primary
    (
        'dd500000-0000-0000-0000-000000000006',
        'cc400000-0000-0000-0000-000000000004',
        'Linda', 'Smith', '1982-09-14', 'Spouse',
        'PRIMARY', 100.00, '2022-04-05', 'ACTIVE'
    );


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Dependent seed data
--    Dependents link to member; only enrolled members have dependents
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO dependent (
    dependent_id, member_id, relationship_type,
    first_name, last_name, date_of_birth,
    effective_date, dep_status
)
VALUES
    -- MEM10001 — Natalie Lee: 1 child dependent
    (
        'ee600000-0000-0000-0000-000000000001',
        'cc400000-0000-0000-0000-000000000001',
        'CHILD',
        'Sophie', 'Lee', '2018-04-12',
        '2025-12-21', 'ACTIVE'
    ),

    -- MEM10002 — Rachel Johnson: spouse + child
    (
        'ee600000-0000-0000-0000-000000000002',
        'cc400000-0000-0000-0000-000000000002',
        'SPOUSE',
        'James', 'Johnson', '1988-07-22',
        '2024-06-01', 'ACTIVE'
    ),
    (
        'ee600000-0000-0000-0000-000000000003',
        'cc400000-0000-0000-0000-000000000002',
        'CHILD',
        'Emma', 'Johnson', '2015-11-05',
        '2024-06-01', 'ACTIVE'
    ),

    -- MEM10003 — John Doe: spouse dependent
    (
        'ee600000-0000-0000-0000-000000000004',
        'cc400000-0000-0000-0000-000000000003',
        'SPOUSE',
        'Maria', 'Doe', '1990-01-15',
        '2023-09-10', 'ACTIVE'
    ),

    -- MEM10004 — Norman Smith: spouse + child
    (
        'ee600000-0000-0000-0000-000000000005',
        'cc400000-0000-0000-0000-000000000004',
        'SPOUSE',
        'Linda', 'Smith', '1982-09-14',
        '2022-04-05', 'ACTIVE'
    ),
    (
        'ee600000-0000-0000-0000-000000000006',
        'cc400000-0000-0000-0000-000000000004',
        'CHILD',
        'Oliver', 'Smith', '2012-03-28',
        '2022-04-05', 'ACTIVE'
    );
