-- ─────────────────────────────────────────────────────────────────────────────
-- 012_change_requests.sql
-- Change request types, transaction table, form template table + seeds
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Enums ───────────────────────────────────────────────────────────────────
CREATE TYPE change_request_type_enum AS ENUM (
    'BENEFICIARY_CHANGE',
    'ADD_DEPENDENT',
    'REMOVE_DEPENDENT',
    'LIFE_EVENT',
    'COVERAGE_CHANGE'
);

CREATE TYPE change_request_status_enum AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'IN_REVIEW',
    'APPROVED',
    'DECLINED',
    'CANCELLED'
);

-- ─── change_request transaction table ────────────────────────────────────────
CREATE TABLE change_request (
    change_request_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number      VARCHAR(50)                     UNIQUE,
    member_id           UUID                            REFERENCES member(member_id),
    employee_id         UUID                NOT NULL    REFERENCES employee(employee_id),
    submitted_by        UUID                            REFERENCES portal_user(user_id),
    request_type        change_request_type_enum        NOT NULL,
    status              change_request_status_enum      NOT NULL DEFAULT 'DRAFT',
    submission_date     DATE,
    effective_date      DATE,
    request_form_json   JSONB,
    notes               TEXT,
    decline_reason      TEXT,
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT now()
);

-- ─── change_request_form_template table ──────────────────────────────────────
-- sponsor_id NULL = global default (applies to all sponsors)
CREATE TABLE change_request_form_template (
    template_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id      UUID            REFERENCES sponsor(sponsor_id),
    request_type    change_request_type_enum NOT NULL,
    template_name   VARCHAR(200)    NOT NULL,
    form_config     JSONB           NOT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- ─── Seeds ───────────────────────────────────────────────────────────────────

-- 1. BENEFICIARY_CHANGE
INSERT INTO change_request_form_template (template_id, request_type, template_name, form_config) VALUES (
  'cc000000-0000-0000-0000-000000000001',
  'BENEFICIARY_CHANGE',
  'Beneficiary Change',
  '{
    "sections": [
      {
        "id": "beneficiary_info",
        "title": "Beneficiary Information",
        "description": "Provide details for the new or updated beneficiary.",
        "fields": [
          { "id": "beneficiary_first_name", "label": "First Name",         "type": "text",   "required": true },
          { "id": "beneficiary_last_name",  "label": "Last Name",          "type": "text",   "required": true },
          { "id": "beneficiary_dob",        "label": "Date of Birth",      "type": "date",   "required": true },
          { "id": "relationship",           "label": "Relationship",       "type": "select", "required": true,
            "options": [
              { "value": "SPOUSE",    "label": "Spouse / Common-law" },
              { "value": "CHILD",     "label": "Child" },
              { "value": "PARENT",    "label": "Parent" },
              { "value": "SIBLING",   "label": "Sibling" },
              { "value": "ESTATE",    "label": "Estate" },
              { "value": "OTHER",     "label": "Other" }
            ]
          },
          { "id": "allocation_pct",  "label": "Allocation (%)",    "type": "number", "required": true, "placeholder": "100" },
          { "id": "contingent",      "label": "Beneficiary Type",  "type": "radio",  "required": true,
            "options": [
              { "value": "PRIMARY",   "label": "Primary" },
              { "value": "CONTINGENT","label": "Contingent" }
            ]
          }
        ]
      },
      {
        "id": "benefit_scope",
        "title": "Applicable Benefits",
        "fields": [
          { "id": "applies_to", "label": "Apply change to", "type": "radio", "required": true,
            "options": [
              { "value": "ALL",   "label": "All life & AD&D benefits" },
              { "value": "LIFE",  "label": "Life insurance only" },
              { "value": "ADD",   "label": "AD&D only" }
            ]
          }
        ]
      },
      {
        "id": "confirmation",
        "title": "Declaration",
        "fields": [
          { "id": "declaration", "label": "I confirm that the information provided is accurate and I authorize this beneficiary change.", "type": "checkbox", "required": true }
        ]
      }
    ]
  }'
);

-- 2. ADD_DEPENDENT
INSERT INTO change_request_form_template (template_id, request_type, template_name, form_config) VALUES (
  'cc000000-0000-0000-0000-000000000002',
  'ADD_DEPENDENT',
  'Add Dependent',
  '{
    "sections": [
      {
        "id": "dependent_info",
        "title": "Dependent Information",
        "description": "Provide details about the dependent you wish to add.",
        "fields": [
          { "id": "dep_first_name",  "label": "First Name",       "type": "text",   "required": true },
          { "id": "dep_last_name",   "label": "Last Name",        "type": "text",   "required": true },
          { "id": "dep_dob",         "label": "Date of Birth",    "type": "date",   "required": true },
          { "id": "dep_gender",      "label": "Gender",           "type": "radio",  "required": true,
            "options": [
              { "value": "M", "label": "Male" },
              { "value": "F", "label": "Female" },
              { "value": "X", "label": "Non-binary / Other" }
            ]
          },
          { "id": "relationship",    "label": "Relationship",     "type": "select", "required": true,
            "options": [
              { "value": "SPOUSE",   "label": "Spouse / Common-law partner" },
              { "value": "CHILD",    "label": "Dependent child" },
              { "value": "DISABLED_CHILD", "label": "Disabled dependent child" }
            ]
          },
          { "id": "dep_effective_date", "label": "Coverage Effective Date", "type": "date", "required": true }
        ]
      },
      {
        "id": "life_event_link",
        "title": "Qualifying Life Event",
        "description": "Adding a dependent must be triggered by a qualifying life event.",
        "fields": [
          { "id": "life_event_type", "label": "Life Event", "type": "select", "required": true,
            "options": [
              { "value": "MARRIAGE",      "label": "Marriage / Common-law union" },
              { "value": "BIRTH",         "label": "Birth of child" },
              { "value": "ADOPTION",      "label": "Adoption" },
              { "value": "LOSS_COVERAGE", "label": "Loss of other coverage" }
            ]
          },
          { "id": "event_date", "label": "Event Date", "type": "date", "required": true }
        ]
      },
      {
        "id": "confirmation",
        "title": "Declaration",
        "fields": [
          { "id": "declaration", "label": "I confirm that this dependent qualifies for coverage under my plan and that the information provided is accurate.", "type": "checkbox", "required": true }
        ]
      }
    ]
  }'
);

-- 3. REMOVE_DEPENDENT
INSERT INTO change_request_form_template (template_id, request_type, template_name, form_config) VALUES (
  'cc000000-0000-0000-0000-000000000003',
  'REMOVE_DEPENDENT',
  'Remove Dependent',
  '{
    "sections": [
      {
        "id": "dependent_id",
        "title": "Dependent to Remove",
        "fields": [
          { "id": "dep_first_name",  "label": "First Name",    "type": "text",   "required": true },
          { "id": "dep_last_name",   "label": "Last Name",     "type": "text",   "required": true },
          { "id": "dep_dob",         "label": "Date of Birth", "type": "date",   "required": true },
          { "id": "relationship",    "label": "Relationship",  "type": "select", "required": true,
            "options": [
              { "value": "SPOUSE",  "label": "Spouse / Common-law partner" },
              { "value": "CHILD",   "label": "Dependent child" }
            ]
          }
        ]
      },
      {
        "id": "removal_reason",
        "title": "Reason for Removal",
        "fields": [
          { "id": "reason", "label": "Reason", "type": "select", "required": true,
            "options": [
              { "value": "DIVORCE",        "label": "Divorce / Separation" },
              { "value": "MARRIAGE",       "label": "Dependent married" },
              { "value": "OVERAGE",        "label": "Dependent no longer eligible (over age)" },
              { "value": "OWN_COVERAGE",   "label": "Dependent obtained own coverage" },
              { "value": "DEATH",          "label": "Death of dependent" },
              { "value": "OTHER",          "label": "Other" }
            ]
          },
          { "id": "termination_date", "label": "Coverage Termination Date", "type": "date", "required": true },
          { "id": "notes", "label": "Additional Notes", "type": "textarea", "required": false }
        ]
      }
    ]
  }'
);

-- 4. LIFE_EVENT
INSERT INTO change_request_form_template (template_id, request_type, template_name, form_config) VALUES (
  'cc000000-0000-0000-0000-000000000004',
  'LIFE_EVENT',
  'Report a Life Event',
  '{
    "sections": [
      {
        "id": "event_details",
        "title": "Life Event Details",
        "description": "Report a life event that may affect your benefits coverage.",
        "fields": [
          { "id": "event_type", "label": "Type of Life Event", "type": "select", "required": true,
            "options": [
              { "value": "MARRIAGE",       "label": "Marriage" },
              { "value": "COMMON_LAW",     "label": "Common-law relationship" },
              { "value": "DIVORCE",        "label": "Divorce / Legal separation" },
              { "value": "BIRTH",          "label": "Birth of child" },
              { "value": "ADOPTION",       "label": "Adoption" },
              { "value": "DEATH_SPOUSE",   "label": "Death of spouse / partner" },
              { "value": "DEATH_DEP",      "label": "Death of dependent" },
              { "value": "LOSS_COVERAGE",  "label": "Loss of other group coverage" },
              { "value": "RETURNED_WORK",  "label": "Return to work after leave" },
              { "value": "OTHER",          "label": "Other" }
            ]
          },
          { "id": "event_date",        "label": "Date of Event",      "type": "date",     "required": true },
          { "id": "requested_changes", "label": "Requested Changes",  "type": "textarea", "required": true,
            "placeholder": "Describe what changes you would like to make as a result of this life event." }
        ]
      },
      {
        "id": "supporting_docs",
        "title": "Supporting Documentation",
        "fields": [
          { "id": "docs_available", "label": "Supporting documents will be provided (e.g. marriage certificate, birth certificate)", "type": "checkbox", "required": false }
        ]
      }
    ]
  }'
);

-- 5. COVERAGE_CHANGE
INSERT INTO change_request_form_template (template_id, request_type, template_name, form_config) VALUES (
  'cc000000-0000-0000-0000-000000000005',
  'COVERAGE_CHANGE',
  'Change Coverage',
  '{
    "sections": [
      {
        "id": "coverage_details",
        "title": "Coverage Change Request",
        "description": "Request a change to your current benefit coverage level.",
        "fields": [
          { "id": "benefit_type", "label": "Benefit Type", "type": "select", "required": true,
            "options": [
              { "value": "LIFE",   "label": "Life Insurance" },
              { "value": "ADD",    "label": "Accidental Death & Dismemberment" },
              { "value": "STD",    "label": "Short Term Disability" },
              { "value": "LTD",    "label": "Long Term Disability" },
              { "value": "HEALTH", "label": "Extended Health Care" },
              { "value": "DENTAL", "label": "Dental" }
            ]
          },
          { "id": "current_coverage",    "label": "Current Coverage Level",    "type": "text", "required": true, "placeholder": "e.g. Single, Employee only, 1x salary" },
          { "id": "requested_coverage",  "label": "Requested Coverage Level",  "type": "text", "required": true, "placeholder": "e.g. Family, 2x salary" },
          { "id": "reason",              "label": "Reason for Change",         "type": "select", "required": true,
            "options": [
              { "value": "LIFE_EVENT",   "label": "Qualifying life event" },
              { "value": "OPEN_ENROL",   "label": "Open enrollment period" },
              { "value": "ERROR",        "label": "Correction of error" },
              { "value": "OTHER",        "label": "Other" }
            ]
          },
          { "id": "effective_date",      "label": "Requested Effective Date",  "type": "date",     "required": true },
          { "id": "additional_notes",    "label": "Additional Notes",          "type": "textarea", "required": false }
        ]
      },
      {
        "id": "eoi",
        "title": "Evidence of Insurability",
        "description": "Some coverage increases require medical evidence.",
        "fields": [
          { "id": "eoi_acknowledged", "label": "I understand that this change may require Evidence of Insurability (EOI) and may be subject to approval.", "type": "checkbox", "required": true }
        ]
      }
    ]
  }'
);
