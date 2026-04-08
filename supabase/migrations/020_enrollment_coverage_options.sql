-- Migration 020: Add plan-specific enrollment form templates that include a
-- "Coverage Options" section for plans with tiered benefits.
-- Field IDs use the convention module_<BENEFIT_TYPE> (e.g. module_EHC).
-- The enrollment submit handler extracts these to populate member.benefit_modules.
--
-- Plans with multiple tiers get a real selection; single-tier plans use the
-- global template (no new template needed — benefit_modules stays empty and
-- the Plan Summary falls back to showing the only available tier).

-- ── Executive Plan — 3 tiers across EHC, DENTAL, DRUG ────────────────────────
INSERT INTO enrollment_form_template (
  template_id, sponsor_id, plan_id, template_name, form_config
)
VALUES (
  'ff700000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'c3000000-0000-0000-0000-000000000001',
  'ABC Insurance — Executive Plan Enrollment Form',
  '{
    "version": "1.0",
    "sections": [
      {
        "id": "personal",
        "title": "Personal Information",
        "fields": [
          { "id": "first_name",       "type": "text",   "label": "First Name",           "required": true,  "prefill": "first_name" },
          { "id": "last_name",        "type": "text",   "label": "Last Name",            "required": true,  "prefill": "last_name" },
          { "id": "date_of_birth",    "type": "date",   "label": "Date of Birth",        "required": true,  "prefill": "date_of_birth" },
          { "id": "gender",           "type": "radio",  "label": "Gender",               "required": true,
            "options": ["Male", "Female", "Non-binary", "Prefer not to say"] },
          { "id": "language",         "type": "radio",  "label": "Preferred Language",   "required": true,
            "options": ["English", "French"] },
          { "id": "email",            "type": "email",  "label": "Email Address",        "required": true,  "prefill": "email" },
          { "id": "phone",            "type": "phone",  "label": "Mobile Phone",         "required": false, "prefill": "phone_mobile" },
          { "id": "province",         "type": "select", "label": "Province / Territory", "required": true,  "prefill": "province_state_code",
            "options": ["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"] }
        ]
      },
      {
        "id": "health",
        "title": "Health Declaration",
        "fields": [
          { "id": "smoker",               "type": "radio",    "label": "Do you currently smoke or have you smoked in the last 12 months?",
            "required": true, "options": ["Yes", "No"] },
          { "id": "pre_existing",         "type": "radio",    "label": "Do you have any pre-existing medical conditions?",
            "required": true, "options": ["Yes", "No"] },
          { "id": "pre_existing_details", "type": "textarea", "label": "Please describe your pre-existing conditions",
            "required": true, "show_if": { "field": "pre_existing", "value": "Yes" },
            "placeholder": "Provide details including diagnosis date and current treatment..." }
        ]
      },
      {
        "id": "coverage_options",
        "title": "Coverage Options",
        "description": "Select the coverage level you wish to enroll in for each benefit. Higher tiers provide broader coverage at a higher premium contribution.",
        "fields": [
          {
            "id": "coverage_tier",
            "type": "select",
            "label": "Coverage Category",
            "required": true,
            "options": ["Single", "Single + Spouse", "Single + Children", "Family"]
          },
          {
            "id": "module_EHC",
            "type": "radio",
            "label": "Extended Health Care",
            "required": true,
            "options": [
              { "label": "Basic — $50 deductible · 80% coinsurance · $350/yr paramedical", "value": "Basic" },
              { "label": "Standard — No deductible · 100% coinsurance · $500/yr paramedical", "value": "Standard" },
              { "label": "Premium — No deductible · 100% coinsurance · $600/yr paramedical · Private hospital room", "value": "Premium" }
            ]
          },
          {
            "id": "module_DENTAL",
            "type": "radio",
            "label": "Dental Care",
            "required": true,
            "options": [
              { "label": "Basic — 70% · max $1,000/yr · no major services", "value": "Basic" },
              { "label": "Standard — 80% · max $1,500/yr · no major services", "value": "Standard" },
              { "label": "Premium — 100% preventive · 80% major · max $3,000/yr · orthodontics covered", "value": "Premium" }
            ]
          },
          {
            "id": "module_DRUG",
            "type": "radio",
            "label": "Prescription Drugs",
            "required": true,
            "options": [
              { "label": "Basic — $100 deductible · 70% coinsurance · submit receipts", "value": "Basic" },
              { "label": "Standard — $50 deductible · 80% coinsurance · pay direct card", "value": "Standard" },
              { "label": "Premium — No deductible · 90% coinsurance · pay direct card", "value": "Premium" }
            ]
          },
          { "id": "waive_dental",        "type": "checkbox", "label": "I wish to waive dental coverage" },
          { "id": "waive_dental_reason", "type": "textarea", "label": "Reason for waiving dental",
            "required": true, "show_if": { "field": "waive_dental", "value": true },
            "placeholder": "e.g. covered under spouse plan..." },
          { "id": "waive_drug",          "type": "checkbox", "label": "I wish to waive drug coverage" },
          { "id": "waive_drug_reason",   "type": "textarea", "label": "Reason for waiving drug coverage",
            "required": true, "show_if": { "field": "waive_drug", "value": true },
            "placeholder": "e.g. covered under spouse plan..." }
        ]
      },
      {
        "id": "consent",
        "title": "Declarations & Consent",
        "fields": [
          { "id": "consent_accuracy",  "type": "checkbox", "label": "I certify that the information provided is true and complete to the best of my knowledge.", "required": true },
          { "id": "consent_privacy",   "type": "checkbox", "label": "I consent to the collection and use of my personal information for the purposes of administering my group benefits plan, as described in the Privacy Policy.", "required": true },
          { "id": "consent_edelivery", "type": "checkbox", "label": "I consent to receiving plan documents and communications electronically." }
        ]
      }
    ]
  }'
) ON CONFLICT DO NOTHING;


-- ── Operational Employees Plan — 2 tiers across EHC, DENTAL, DRUG ─────────────
INSERT INTO enrollment_form_template (
  template_id, sponsor_id, plan_id, template_name, form_config
)
VALUES (
  'ff700000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000001',
  'c3000000-0000-0000-0000-000000000002',
  'ABC Insurance — Operational Employees Plan Enrollment Form',
  '{
    "version": "1.0",
    "sections": [
      {
        "id": "personal",
        "title": "Personal Information",
        "fields": [
          { "id": "first_name",       "type": "text",   "label": "First Name",           "required": true,  "prefill": "first_name" },
          { "id": "last_name",        "type": "text",   "label": "Last Name",            "required": true,  "prefill": "last_name" },
          { "id": "date_of_birth",    "type": "date",   "label": "Date of Birth",        "required": true,  "prefill": "date_of_birth" },
          { "id": "gender",           "type": "radio",  "label": "Gender",               "required": true,
            "options": ["Male", "Female", "Non-binary", "Prefer not to say"] },
          { "id": "language",         "type": "radio",  "label": "Preferred Language",   "required": true,
            "options": ["English", "French"] },
          { "id": "email",            "type": "email",  "label": "Email Address",        "required": true,  "prefill": "email" },
          { "id": "phone",            "type": "phone",  "label": "Mobile Phone",         "required": false, "prefill": "phone_mobile" },
          { "id": "province",         "type": "select", "label": "Province / Territory", "required": true,  "prefill": "province_state_code",
            "options": ["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"] }
        ]
      },
      {
        "id": "health",
        "title": "Health Declaration",
        "fields": [
          { "id": "smoker",               "type": "radio",    "label": "Do you currently smoke or have you smoked in the last 12 months?",
            "required": true, "options": ["Yes", "No"] },
          { "id": "pre_existing",         "type": "radio",    "label": "Do you have any pre-existing medical conditions?",
            "required": true, "options": ["Yes", "No"] },
          { "id": "pre_existing_details", "type": "textarea", "label": "Please describe your pre-existing conditions",
            "required": true, "show_if": { "field": "pre_existing", "value": "Yes" },
            "placeholder": "Provide details including diagnosis date and current treatment..." }
        ]
      },
      {
        "id": "coverage_options",
        "title": "Coverage Options",
        "description": "Select the coverage level you wish to enroll in for each benefit.",
        "fields": [
          {
            "id": "coverage_tier",
            "type": "select",
            "label": "Coverage Category",
            "required": true,
            "options": ["Single", "Single + Spouse", "Single + Children", "Family"]
          },
          {
            "id": "module_EHC",
            "type": "radio",
            "label": "Extended Health Care",
            "required": true,
            "options": [
              { "label": "Basic — $50 deductible · 70% coinsurance · $300/yr paramedical", "value": "Basic" },
              { "label": "Standard — No deductible · 80-100% coinsurance · $400/yr paramedical", "value": "Standard" }
            ]
          },
          {
            "id": "module_DENTAL",
            "type": "radio",
            "label": "Dental Care",
            "required": true,
            "options": [
              { "label": "Basic — 70% · max $1,000/yr", "value": "Basic" },
              { "label": "Standard — 80% · max $1,500/yr", "value": "Standard" }
            ]
          },
          {
            "id": "module_DRUG",
            "type": "radio",
            "label": "Prescription Drugs",
            "required": true,
            "options": [
              { "label": "Basic — $100 deductible · 70% · submit receipts", "value": "Basic" },
              { "label": "Standard — $50 deductible · 80% · pay direct card", "value": "Standard" }
            ]
          },
          { "id": "waive_dental",        "type": "checkbox", "label": "I wish to waive dental coverage" },
          { "id": "waive_dental_reason", "type": "textarea", "label": "Reason for waiving dental",
            "required": true, "show_if": { "field": "waive_dental", "value": true },
            "placeholder": "e.g. covered under spouse plan..." },
          { "id": "waive_drug",          "type": "checkbox", "label": "I wish to waive drug coverage" },
          { "id": "waive_drug_reason",   "type": "textarea", "label": "Reason for waiving drug coverage",
            "required": true, "show_if": { "field": "waive_drug", "value": true },
            "placeholder": "e.g. covered under spouse plan..." }
        ]
      },
      {
        "id": "consent",
        "title": "Declarations & Consent",
        "fields": [
          { "id": "consent_accuracy",  "type": "checkbox", "label": "I certify that the information provided is true and complete to the best of my knowledge.", "required": true },
          { "id": "consent_privacy",   "type": "checkbox", "label": "I consent to the collection and use of my personal information for the purposes of administering my group benefits plan, as described in the Privacy Policy.", "required": true },
          { "id": "consent_edelivery", "type": "checkbox", "label": "I consent to receiving plan documents and communications electronically." }
        ]
      }
    ]
  }'
) ON CONFLICT DO NOTHING;
