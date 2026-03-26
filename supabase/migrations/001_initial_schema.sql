-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE sponsor_type_enum       AS ENUM ('EMPLOYER', 'ASSOCIATION', 'CREDITOR');
CREATE TYPE sponsor_status_enum     AS ENUM ('ACTIVE', 'SUSPENDED', 'TERMINATED');

CREATE TYPE funding_type_enum       AS ENUM ('INSURED', 'ASO', 'SELF_INSURED');
CREATE TYPE contract_status_enum    AS ENUM ('ACTIVE', 'PENDING', 'TERMINATED', 'LAPSED');

CREATE TYPE plan_status_enum        AS ENUM ('ACTIVE', 'DRAFT', 'ARCHIVED');

CREATE TYPE benefit_type_enum       AS ENUM ('LIFE', 'ADD', 'STD', 'LTD', 'CI', 'EHC', 'DENTAL', 'VISION', 'HSA', 'WSA', 'DRUG', 'OOC');
CREATE TYPE coverage_formula_enum   AS ENUM ('FLAT', 'SALARY_MULTIPLE', 'PERCENTAGE_EARNINGS');

CREATE TYPE employment_type_enum    AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'SEASONAL');
CREATE TYPE employment_status_enum  AS ENUM ('ACTIVE', 'ON_LEAVE', 'TERMINATED');

CREATE TYPE assignment_status_enum  AS ENUM ('ACTIVE', 'PENDING_ENROLLMENT', 'TERMINATED');

CREATE TYPE enrollment_type_enum    AS ENUM ('SELF', 'SPONSOR_ON_BEHALF', 'LATE_APPLICANT', 'LIFE_EVENT', 'OPEN_ENROLLMENT');
CREATE TYPE enrollment_status_enum  AS ENUM ('DRAFT', 'SUBMITTED', 'PENDING_EOI', 'APPROVED', 'DECLINED', 'CANCELLED');

CREATE TYPE member_status_enum      AS ENUM ('ACTIVE', 'TERMINATED', 'SUSPENDED', 'ON_LEAVE');
CREATE TYPE coverage_status_enum    AS ENUM ('ACTIVE', 'PENDING_EOI', 'RESTRICTED', 'TERMINATED', 'WAIVED');

CREATE TYPE relationship_type_enum  AS ENUM ('SPOUSE', 'COMMON_LAW', 'CHILD', 'STUDENT_CHILD', 'DOMESTIC_PARTNER');
CREATE TYPE dep_status_enum         AS ENUM ('ACTIVE', 'TERMINATED', 'PENDING');

CREATE TYPE claim_type_enum         AS ENUM ('LIFE', 'ADD', 'STD', 'LTD', 'CI', 'HEALTH', 'DENTAL', 'VISION', 'DRUG', 'HSA', 'WSA');
CREATE TYPE claim_status_enum       AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED', 'DECLINED', 'APPEALED', 'CLOSED');
CREATE TYPE payment_method_enum     AS ENUM ('EFT', 'CHEQUE');

CREATE TYPE persona_type_enum       AS ENUM ('EMPLOYEE', 'SPONSOR_ADMIN', 'BROKER', 'INTERNAL');
CREATE TYPE user_status_enum        AS ENUM ('ACTIVE', 'SUSPENDED', 'LOCKED', 'PENDING');


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLES  (in FK dependency order)
-- ─────────────────────────────────────────────────────────────────────────────

-- portal_user (no deps)
CREATE TABLE portal_user (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_type    persona_type_enum   NOT NULL,
    email           VARCHAR(255)        NOT NULL UNIQUE,  -- encrypted
    first_name      VARCHAR(100)        NOT NULL,
    last_name       VARCHAR(100)        NOT NULL,
    language_pref   CHAR(2)             NOT NULL DEFAULT 'en',
    status          user_status_enum    NOT NULL DEFAULT 'PENDING',
    idp_sub         VARCHAR(255),
    mfa_enabled     BOOLEAN             NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT now()
);

-- sponsor (no deps)
CREATE TABLE sponsor (
    sponsor_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_name         VARCHAR(200)        NOT NULL,
    sponsor_type         sponsor_type_enum   NOT NULL,
    country_code         CHAR(2)             NOT NULL,
    province_state_code  VARCHAR(10)         NOT NULL,
    tax_id               VARCHAR(30),  -- encrypted
    status               sponsor_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at           TIMESTAMPTZ         NOT NULL DEFAULT now()
);

-- group_contract
CREATE TABLE group_contract (
    contract_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id        UUID                    NOT NULL REFERENCES sponsor(sponsor_id),
    contract_number   VARCHAR(50)             NOT NULL UNIQUE,
    contract_name     VARCHAR(200)            NOT NULL,
    effective_date    DATE                    NOT NULL,
    renewal_date      DATE                    NOT NULL,
    termination_date  DATE,
    funding_type      funding_type_enum       NOT NULL,
    status            contract_status_enum    NOT NULL DEFAULT 'PENDING',
    pas_ref           VARCHAR(100),
    country_code      CHAR(2)                 NOT NULL,
    created_at        TIMESTAMPTZ             NOT NULL DEFAULT now()
);

-- plan
CREATE TABLE plan (
    plan_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id           UUID                NOT NULL REFERENCES group_contract(contract_id),
    plan_code             VARCHAR(50)         NOT NULL,
    plan_name             VARCHAR(200)        NOT NULL,
    plan_definition_json  JSONB,
    effective_date        DATE                NOT NULL,
    termination_date      DATE,
    version               VARCHAR(20),
    status                plan_status_enum    NOT NULL DEFAULT 'DRAFT',
    admin_system_ref      VARCHAR(100),
    pas_ref               VARCHAR(100),
    created_at            TIMESTAMPTZ         NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ         NOT NULL DEFAULT now()
);

-- benefit
CREATE TABLE benefit (
    benefit_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id                  UUID                        NOT NULL REFERENCES plan(plan_id),
    benefit_code             VARCHAR(50)                 NOT NULL,
    benefit_type             benefit_type_enum           NOT NULL,
    benefit_name             VARCHAR(200)                NOT NULL,
    benefit_definition_json  JSONB,
    coverage_formula         coverage_formula_enum       NOT NULL,
    flat_amount              DECIMAL(14,2),
    salary_multiple          DECIMAL(6,4),
    benefit_percentage       DECIMAL(5,2),
    nem_amount               DECIMAL(14,2),
    max_amount               DECIMAL(14,2),
    elimination_days         SMALLINT,
    benefit_period_months    SMALLINT,
    waiting_period_days      SMALLINT,
    is_voluntary             BOOLEAN                     NOT NULL DEFAULT FALSE,
    is_active                BOOLEAN                     NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMPTZ                 NOT NULL DEFAULT now()
);

-- employee
CREATE TABLE employee (
    employee_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id           UUID                        NOT NULL REFERENCES sponsor(sponsor_id),
    user_id              UUID                        REFERENCES portal_user(user_id),
    external_hr_id       VARCHAR(100),
    first_name           VARCHAR(100)                NOT NULL,
    last_name            VARCHAR(100)                NOT NULL,
    date_of_birth        DATE,                               -- encrypted
    ssn_sin_hash         CHAR(64),                           -- SHA-256 hash only
    gender_code          VARCHAR(20),
    language_pref        CHAR(2)                     DEFAULT 'en',
    hire_date            DATE                        NOT NULL,
    employment_type      employment_type_enum        NOT NULL,
    employment_status    employment_status_enum      NOT NULL DEFAULT 'ACTIVE',
    termination_date     DATE,
    job_title            VARCHAR(100),
    annual_salary        DECIMAL(14,2),                      -- encrypted
    salary_currency      CHAR(3)                     NOT NULL DEFAULT 'CAD',
    hours_per_week       DECIMAL(4,1),
    province_state_code  VARCHAR(10)                 NOT NULL,
    address_line1        VARCHAR(255),                       -- encrypted
    city                 VARCHAR(100),
    postal_zip_code      VARCHAR(10),
    email                VARCHAR(255),                       -- encrypted
    phone_mobile         VARCHAR(30),                        -- encrypted
    created_at           TIMESTAMPTZ                 NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ                 NOT NULL DEFAULT now()
);

-- employee_plan_assignment
CREATE TABLE employee_plan_assignment (
    assignment_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id      UUID                        NOT NULL REFERENCES employee(employee_id),
    plan_id          UUID                        NOT NULL REFERENCES plan(plan_id),
    class_code       VARCHAR(20)                 NOT NULL,
    division_code    VARCHAR(20),
    effective_date   DATE                        NOT NULL,
    termination_date DATE,
    assigned_by      UUID                        NOT NULL REFERENCES portal_user(user_id),
    status           assignment_status_enum      NOT NULL DEFAULT 'PENDING_ENROLLMENT',
    created_at       TIMESTAMPTZ                 NOT NULL DEFAULT now()
);

-- enrollment
CREATE TABLE enrollment (
    enrollment_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id          UUID                        NOT NULL REFERENCES employee(employee_id),
    plan_id              UUID                        NOT NULL REFERENCES plan(plan_id),
    submitted_by         UUID                        NOT NULL REFERENCES portal_user(user_id),
    enrollment_type      enrollment_type_enum        NOT NULL,
    life_event_type      VARCHAR(50),
    enrollment_form_json JSONB,
    submitted_at         TIMESTAMPTZ,
    effective_date       DATE,
    status               enrollment_status_enum      NOT NULL DEFAULT 'DRAFT',
    pas_submission_ref   VARCHAR(100),
    pas_submitted_at     TIMESTAMPTZ,
    pas_response_at      TIMESTAMPTZ,
    pas_response_json    JSONB,
    decline_reason       TEXT,
    ip_address           INET,
    created_at           TIMESTAMPTZ                 NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ                 NOT NULL DEFAULT now()
);

-- enrollment_benefit_selection
CREATE TABLE enrollment_benefit_selection (
    selection_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id      UUID            NOT NULL REFERENCES enrollment(enrollment_id),
    benefit_id         UUID            NOT NULL REFERENCES benefit(benefit_id),
    elected            BOOLEAN         NOT NULL DEFAULT FALSE,
    coverage_option    VARCHAR(50),
    requested_amount   DECIMAL(14,2),
    waived             BOOLEAN         NOT NULL DEFAULT FALSE,
    waiver_reason      VARCHAR(200),
    eoi_required       BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- member
CREATE TABLE member (
    member_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id        UUID                    NOT NULL REFERENCES employee(employee_id),
    enrollment_id      UUID                    NOT NULL REFERENCES enrollment(enrollment_id),
    plan_id            UUID                    NOT NULL REFERENCES plan(plan_id),
    member_number      VARCHAR(50)             NOT NULL UNIQUE,
    certificate_number VARCHAR(50),
    effective_date     DATE                    NOT NULL,
    termination_date   DATE,
    member_status      member_status_enum      NOT NULL DEFAULT 'ACTIVE',
    pas_member_ref     VARCHAR(100),
    created_at         TIMESTAMPTZ             NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ             NOT NULL DEFAULT now()
);

-- member_benefit_coverage
CREATE TABLE member_benefit_coverage (
    coverage_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id        UUID                    NOT NULL REFERENCES member(member_id),
    benefit_id       UUID                    NOT NULL REFERENCES benefit(benefit_id),
    approved_amount  DECIMAL(14,2),
    coverage_status  coverage_status_enum    NOT NULL DEFAULT 'ACTIVE',
    effective_date   DATE                    NOT NULL,
    termination_date DATE,
    exclusions_text  TEXT,                           -- encrypted, PHI
    pas_coverage_ref VARCHAR(100),
    eoi_case_ref     VARCHAR(100),
    created_at       TIMESTAMPTZ             NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ             NOT NULL DEFAULT now()
);

-- dependent
CREATE TABLE dependent (
    dependent_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id           UUID                        NOT NULL REFERENCES member(member_id),
    relationship_type   relationship_type_enum      NOT NULL,
    first_name          VARCHAR(100)                NOT NULL,  -- PHI
    last_name           VARCHAR(100)                NOT NULL,  -- PHI
    date_of_birth       DATE,                                  -- encrypted, PHI
    gender_code         VARCHAR(20),
    student_status      BOOLEAN                     NOT NULL DEFAULT FALSE,
    student_cert_expiry DATE,
    effective_date      DATE                        NOT NULL,
    termination_date    DATE,
    dep_status          dep_status_enum             NOT NULL DEFAULT 'PENDING',
    pas_dep_ref         VARCHAR(100),
    created_at          TIMESTAMPTZ                 NOT NULL DEFAULT now()
);

-- claim
CREATE TABLE claim (
    claim_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id         UUID                    NOT NULL REFERENCES member(member_id),
    benefit_id        UUID                    NOT NULL REFERENCES benefit(benefit_id),
    submitted_by      UUID                    NOT NULL REFERENCES portal_user(user_id),
    claim_type        claim_type_enum         NOT NULL,
    incident_date     DATE,                           -- PHI
    submission_date   DATE,
    claim_form_json   JSONB,                          -- PHI, encrypted
    status            claim_status_enum       NOT NULL DEFAULT 'DRAFT',
    pas_claim_ref     VARCHAR(100),
    pas_submitted_at  TIMESTAMPTZ,
    pas_response_at   TIMESTAMPTZ,
    approved_amount   DECIMAL(14,2),
    paid_amount       DECIMAL(14,2),
    paid_date         DATE,
    payment_method    payment_method_enum,
    decline_reason    TEXT,
    ip_address        INET,
    created_at        TIMESTAMPTZ             NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ             NOT NULL DEFAULT now()
);

-- claim_document
CREATE TABLE claim_document (
    document_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id         UUID            NOT NULL REFERENCES claim(claim_id),
    uploaded_by      UUID            NOT NULL REFERENCES portal_user(user_id),
    document_type    VARCHAR(50)     NOT NULL,
    file_name        VARCHAR(255)    NOT NULL,
    storage_ref      VARCHAR(500)    NOT NULL,  -- encrypted path/URL
    file_size_bytes  INTEGER,
    mime_type        VARCHAR(100),
    uploaded_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    routed_to_pas    BOOLEAN         NOT NULL DEFAULT FALSE,
    routed_at        TIMESTAMPTZ
);
