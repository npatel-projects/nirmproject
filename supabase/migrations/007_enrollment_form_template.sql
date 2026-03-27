-- ─────────────────────────────────────────────────────────────────────────────
-- 007_enrollment_form_template.sql
-- Dynamic enrollment form template table + seed config for ABC Insurance
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Table
--    plan_id NULL  → template applies to all plans for the sponsor
--    plan_id set   → plan-specific override
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE enrollment_form_template (
    template_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id     UUID            NOT NULL REFERENCES sponsor(sponsor_id),
    plan_id        UUID            REFERENCES plan(plan_id),
    template_name  VARCHAR(200)    NOT NULL,
    form_config    JSONB           NOT NULL,
    is_active      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ     NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Seed — ABC Insurance default enrollment form
--    sponsor_id = a1000000-0000-0000-0000-000000000001
--    plan_id    = NULL (applies to all plans)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO enrollment_form_template (template_id, sponsor_id, plan_id, template_name, form_config)
VALUES (
  'ff700000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  NULL,
  'ABC Insurance — Standard Enrollment Form',
  '{
    "version": "1.0",
    "sections": [
      {
        "id": "personal",
        "title": "Personal Information",
        "fields": [
          { "id": "first_name",       "type": "text",     "label": "First Name",       "required": true,  "prefill": "first_name" },
          { "id": "last_name",        "type": "text",     "label": "Last Name",        "required": true,  "prefill": "last_name" },
          { "id": "date_of_birth",    "type": "date",     "label": "Date of Birth",    "required": true,  "prefill": "date_of_birth" },
          { "id": "gender",           "type": "radio",    "label": "Gender",           "required": true,
            "options": ["Male", "Female", "Non-binary", "Prefer not to say"] },
          { "id": "language",         "type": "radio",    "label": "Preferred Language", "required": true,
            "options": ["English", "French"] },
          { "id": "email",            "type": "email",    "label": "Email Address",    "required": true,  "prefill": "email" },
          { "id": "phone",            "type": "phone",    "label": "Mobile Phone",     "required": false, "prefill": "phone_mobile" },
          { "id": "province",         "type": "select",   "label": "Province / Territory", "required": true, "prefill": "province_state_code",
            "options": ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"] }
        ]
      },
      {
        "id": "health",
        "title": "Health Declaration",
        "fields": [
          { "id": "smoker",           "type": "radio",    "label": "Do you currently smoke or have you smoked in the last 12 months?",
            "required": true, "options": ["Yes", "No"] },
          { "id": "pre_existing",     "type": "radio",    "label": "Do you have any pre-existing medical conditions?",
            "required": true, "options": ["Yes", "No"] },
          { "id": "pre_existing_details", "type": "textarea", "label": "Please describe your pre-existing conditions",
            "required": true, "show_if": { "field": "pre_existing", "value": "Yes" },
            "placeholder": "Provide details including diagnosis date and current treatment..." }
        ]
      },
      {
        "id": "coverage",
        "title": "Coverage Selection",
        "fields": [
          { "id": "coverage_tier",    "type": "select",   "label": "Coverage Tier",    "required": true,
            "options": ["Single", "Single + Spouse", "Single + Children", "Family"] },
          { "id": "waive_dental",     "type": "checkbox", "label": "I wish to waive dental coverage" },
          { "id": "waive_dental_reason", "type": "textarea", "label": "Reason for waiving dental",
            "required": true, "show_if": { "field": "waive_dental", "value": true },
            "placeholder": "e.g. covered under spouse plan..." },
          { "id": "waive_drug",       "type": "checkbox", "label": "I wish to waive drug coverage" },
          { "id": "waive_drug_reason", "type": "textarea", "label": "Reason for waiving drug coverage",
            "required": true, "show_if": { "field": "waive_drug", "value": true },
            "placeholder": "e.g. covered under spouse plan..." }
        ]
      },
      {
        "id": "consent",
        "title": "Declarations & Consent",
        "fields": [
          { "id": "consent_accuracy", "type": "checkbox", "label": "I certify that the information provided is true and complete to the best of my knowledge.", "required": true },
          { "id": "consent_privacy",  "type": "checkbox", "label": "I consent to the collection and use of my personal information for the purposes of administering my group benefits plan, as described in the Privacy Policy.", "required": true },
          { "id": "consent_edelivery","type": "checkbox", "label": "I consent to receiving plan documents and communications electronically." }
        ]
      }
    ]
  }'
);
