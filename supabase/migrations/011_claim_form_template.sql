-- ─────────────────────────────────────────────────────────────────────────────
-- 011_claim_form_template.sql
-- Creates claim_form_template table and seeds one config per claim type.
-- form_config mirrors the enrollment_form_template shape:
--   { "sections": [ { "id", "title", "description?", "fields": [...] } ] }
-- Field types: text | number | date | select | radio | textarea | checkbox
-- Special: show_if: { "field": "<id>", "value": "<val>" }
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS claim_form_template (
    template_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id    UUID REFERENCES sponsor(sponsor_id),   -- NULL = global default
    claim_type    claim_type_enum     NOT NULL,
    form_config   JSONB               NOT NULL,
    is_active     BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ         NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ         NOT NULL DEFAULT now()
);

-- ─── DENTAL ──────────────────────────────────────────────────────────────────
INSERT INTO claim_form_template (template_id, claim_type, form_config) VALUES (
'f9100000-0000-0000-0000-000000000001', 'DENTAL',
'{
  "sections": [
    {
      "id": "service",
      "title": "Service Information",
      "fields": [
        { "id": "service_date",     "label": "Date of Service",      "type": "date",   "required": true },
        { "id": "amount_claimed",   "label": "Amount Claimed (CAD)", "type": "number", "required": true, "placeholder": "0.00" },
        { "id": "procedure_type",   "label": "Procedure Type",       "type": "select", "required": true,
          "options": [
            { "value": "preventive",    "label": "Preventive (Cleaning / X-Ray)" },
            { "value": "basic",         "label": "Basic Restorative (Fillings)" },
            { "value": "major",         "label": "Major Restorative (Crowns / Bridges)" },
            { "value": "orthodontics",  "label": "Orthodontics" },
            { "value": "periodontics",  "label": "Periodontics" },
            { "value": "oral_surgery",  "label": "Oral Surgery" },
            { "value": "other",         "label": "Other" }
          ]
        },
        { "id": "tooth_numbers", "label": "Tooth Number(s)", "type": "text", "required": false, "placeholder": "e.g. 11, 21" }
      ]
    },
    {
      "id": "provider",
      "title": "Provider Details",
      "fields": [
        { "id": "dentist_name",     "label": "Dentist Name",          "type": "text", "required": true },
        { "id": "clinic_name",      "label": "Clinic / Practice",     "type": "text", "required": false },
        { "id": "provider_number",  "label": "Provider Number",       "type": "text", "required": false, "placeholder": "Optional" }
      ]
    },
    {
      "id": "coordination",
      "title": "Coordination of Benefits",
      "description": "Indicate if you have coverage through another plan.",
      "fields": [
        { "id": "other_coverage",   "label": "Do you have additional dental coverage through another plan?", "type": "radio", "required": true,
          "options": [ { "value": "yes", "label": "Yes" }, { "value": "no", "label": "No" } ]
        },
        { "id": "other_plan_name",  "label": "Other Carrier / Plan Name", "type": "text", "required": false,
          "show_if": { "field": "other_coverage", "value": "yes" }
        },
        { "id": "notes",            "label": "Additional Notes",  "type": "textarea", "required": false }
      ]
    }
  ]
}'::jsonb);

-- ─── HEALTH (EHC) ─────────────────────────────────────────────────────────────
INSERT INTO claim_form_template (template_id, claim_type, form_config) VALUES (
'f9100000-0000-0000-0000-000000000002', 'HEALTH',
'{
  "sections": [
    {
      "id": "service",
      "title": "Service Information",
      "fields": [
        { "id": "service_date",     "label": "Date of Service",      "type": "date",   "required": true },
        { "id": "amount_claimed",   "label": "Amount Claimed (CAD)", "type": "number", "required": true, "placeholder": "0.00" },
        { "id": "service_type",     "label": "Type of Service",      "type": "select", "required": true,
          "options": [
            { "value": "physiotherapy",   "label": "Physiotherapy" },
            { "value": "chiropractic",    "label": "Chiropractic" },
            { "value": "massage",         "label": "Registered Massage Therapy" },
            { "value": "psychology",      "label": "Psychology / Mental Health" },
            { "value": "naturopathy",     "label": "Naturopathy" },
            { "value": "hospital",        "label": "Hospital / Semi-Private Room" },
            { "value": "ambulance",       "label": "Ambulance" },
            { "value": "medical_equip",   "label": "Medical Equipment / Supplies" },
            { "value": "other",           "label": "Other" }
          ]
        },
        { "id": "practitioner_type", "label": "Practitioner Type", "type": "text", "required": true, "placeholder": "e.g. Physiotherapist" }
      ]
    },
    {
      "id": "provider",
      "title": "Provider Details",
      "fields": [
        { "id": "provider_name",    "label": "Provider Name",             "type": "text", "required": true },
        { "id": "clinic_name",      "label": "Clinic / Facility Name",    "type": "text", "required": false },
        { "id": "license_number",   "label": "Registration / License No.", "type": "text", "required": false },
        { "id": "notes",            "label": "Additional Notes",          "type": "textarea", "required": false }
      ]
    }
  ]
}'::jsonb);

-- ─── DRUG ─────────────────────────────────────────────────────────────────────
INSERT INTO claim_form_template (template_id, claim_type, form_config) VALUES (
'f9100000-0000-0000-0000-000000000003', 'DRUG',
'{
  "sections": [
    {
      "id": "prescription",
      "title": "Prescription Details",
      "fields": [
        { "id": "service_date",        "label": "Date Dispensed",               "type": "date",   "required": true },
        { "id": "amount_claimed",      "label": "Amount Claimed (CAD)",         "type": "number", "required": true, "placeholder": "0.00" },
        { "id": "drug_name",           "label": "Drug / Medication Name",       "type": "text",   "required": true },
        { "id": "din_number",          "label": "DIN (Drug ID Number)",         "type": "text",   "required": false },
        { "id": "prescription_number", "label": "Prescription Number",          "type": "text",   "required": false },
        { "id": "is_generic",          "label": "Generic substitute dispensed?", "type": "radio", "required": true,
          "options": [
            { "value": "yes",           "label": "Yes" },
            { "value": "no",            "label": "No" },
            { "value": "unavailable",   "label": "No generic available" }
          ]
        }
      ]
    },
    {
      "id": "pharmacy",
      "title": "Pharmacy Details",
      "fields": [
        { "id": "pharmacist_name",  "label": "Pharmacist Name",  "type": "text", "required": true },
        { "id": "pharmacy_name",    "label": "Pharmacy Name",    "type": "text", "required": true }
      ]
    }
  ]
}'::jsonb);

-- ─── VISION ───────────────────────────────────────────────────────────────────
INSERT INTO claim_form_template (template_id, claim_type, form_config) VALUES (
'f9100000-0000-0000-0000-000000000004', 'VISION',
'{
  "sections": [
    {
      "id": "service",
      "title": "Service Details",
      "fields": [
        { "id": "service_date",   "label": "Date of Service",      "type": "date",   "required": true },
        { "id": "amount_claimed", "label": "Amount Claimed (CAD)", "type": "number", "required": true, "placeholder": "0.00" },
        { "id": "service_type",   "label": "Type of Vision Service", "type": "select", "required": true,
          "options": [
            { "value": "eye_exam",      "label": "Eye Examination" },
            { "value": "frames",        "label": "Eyeglass Frames" },
            { "value": "lenses",        "label": "Eyeglass Lenses" },
            { "value": "contacts",      "label": "Contact Lenses" },
            { "value": "laser",         "label": "Laser Eye Surgery" },
            { "value": "other",         "label": "Other" }
          ]
        }
      ]
    },
    {
      "id": "provider",
      "title": "Provider Details",
      "fields": [
        { "id": "provider_name",  "label": "Optometrist / Provider Name", "type": "text", "required": true },
        { "id": "clinic_name",    "label": "Clinic / Store Name",         "type": "text", "required": false },
        { "id": "notes",          "label": "Additional Notes",            "type": "textarea", "required": false }
      ]
    }
  ]
}'::jsonb);

-- ─── LIFE ─────────────────────────────────────────────────────────────────────
INSERT INTO claim_form_template (template_id, claim_type, form_config) VALUES (
'f9100000-0000-0000-0000-000000000005', 'LIFE',
'{
  "sections": [
    {
      "id": "incident",
      "title": "Incident Details",
      "fields": [
        { "id": "date_of_death",    "label": "Date of Death",     "type": "date",   "required": true },
        { "id": "cause_of_death",   "label": "Cause of Death",    "type": "select", "required": true,
          "options": [
            { "value": "natural",   "label": "Natural Causes" },
            { "value": "illness",   "label": "Illness / Disease" },
            { "value": "accident",  "label": "Accident" },
            { "value": "other",     "label": "Other" }
          ]
        },
        { "id": "place_of_death",   "label": "Place of Death",   "type": "text", "required": false }
      ]
    },
    {
      "id": "medical",
      "title": "Medical Information",
      "fields": [
        { "id": "attending_physician", "label": "Attending Physician",  "type": "text", "required": true },
        { "id": "hospital_name",       "label": "Hospital / Facility",  "type": "text", "required": false },
        { "id": "notes",               "label": "Additional Information", "type": "textarea", "required": false }
      ]
    }
  ]
}'::jsonb);

-- ─── STD (Short-Term Disability) ──────────────────────────────────────────────
INSERT INTO claim_form_template (template_id, claim_type, form_config) VALUES (
'f9100000-0000-0000-0000-000000000006', 'STD',
'{
  "sections": [
    {
      "id": "employment",
      "title": "Employment Information",
      "fields": [
        { "id": "last_day_worked",       "label": "Last Day Worked",                "type": "date", "required": true },
        { "id": "disability_start_date", "label": "Disability Start Date",         "type": "date", "required": true },
        { "id": "expected_return_date",  "label": "Expected Return to Work Date",  "type": "date", "required": false }
      ]
    },
    {
      "id": "medical",
      "title": "Medical Information",
      "fields": [
        { "id": "diagnosis",        "label": "Diagnosis / Condition",  "type": "text", "required": true },
        { "id": "disability_type",  "label": "Nature of Disability",   "type": "radio", "required": true,
          "options": [
            { "value": "illness",       "label": "Illness" },
            { "value": "injury",        "label": "Injury" },
            { "value": "mental_health", "label": "Mental Health" }
          ]
        },
        { "id": "attending_physician", "label": "Attending Physician",  "type": "text", "required": true },
        { "id": "treating_facility",   "label": "Hospital / Clinic",    "type": "text", "required": false },
        { "id": "notes",               "label": "Additional Notes",     "type": "textarea", "required": false }
      ]
    }
  ]
}'::jsonb);

-- ─── LTD (Long-Term Disability) ───────────────────────────────────────────────
INSERT INTO claim_form_template (template_id, claim_type, form_config) VALUES (
'f9100000-0000-0000-0000-000000000007', 'LTD',
'{
  "sections": [
    {
      "id": "employment",
      "title": "Employment Information",
      "fields": [
        { "id": "last_day_worked",       "label": "Last Day Worked",              "type": "date", "required": true },
        { "id": "disability_start_date", "label": "Disability Start Date",       "type": "date", "required": true },
        { "id": "std_claim_number",      "label": "Related STD Claim Number",    "type": "text", "required": false, "placeholder": "If applicable" }
      ]
    },
    {
      "id": "medical",
      "title": "Medical Information",
      "fields": [
        { "id": "diagnosis",           "label": "Primary Diagnosis",         "type": "text",   "required": true },
        { "id": "disability_type",     "label": "Nature of Disability",      "type": "radio",  "required": true,
          "options": [
            { "value": "illness",       "label": "Illness" },
            { "value": "injury",        "label": "Injury" },
            { "value": "mental_health", "label": "Mental Health" }
          ]
        },
        { "id": "attending_physician", "label": "Attending Physician",       "type": "text",     "required": true },
        { "id": "treating_facility",   "label": "Hospital / Specialist",     "type": "text",     "required": false },
        { "id": "functional_limitations", "label": "Functional Limitations", "type": "textarea", "required": true },
        { "id": "notes",               "label": "Additional Notes",          "type": "textarea", "required": false }
      ]
    }
  ]
}'::jsonb);

-- ─── ADD ──────────────────────────────────────────────────────────────────────
INSERT INTO claim_form_template (template_id, claim_type, form_config) VALUES (
'f9100000-0000-0000-0000-000000000008', 'ADD',
'{
  "sections": [
    {
      "id": "incident",
      "title": "Accident Details",
      "fields": [
        { "id": "incident_date",        "label": "Date of Accident",      "type": "date",   "required": true },
        { "id": "incident_type",        "label": "Type of Accident",      "type": "select", "required": true,
          "options": [
            { "value": "motor_vehicle", "label": "Motor Vehicle Accident" },
            { "value": "workplace",     "label": "Workplace Accident" },
            { "value": "slip_fall",     "label": "Slip and Fall" },
            { "value": "sports",        "label": "Sports / Recreational" },
            { "value": "other",         "label": "Other" }
          ]
        },
        { "id": "injury_type",          "label": "Nature of Injury / Loss",     "type": "text",     "required": true },
        { "id": "incident_description", "label": "Description of Accident",     "type": "textarea", "required": true }
      ]
    },
    {
      "id": "medical",
      "title": "Medical Information",
      "fields": [
        { "id": "attending_physician",  "label": "Attending Physician", "type": "text", "required": true },
        { "id": "hospital_name",        "label": "Hospital / Facility", "type": "text", "required": false }
      ]
    }
  ]
}'::jsonb);

-- ─── CI (Critical Illness) ────────────────────────────────────────────────────
INSERT INTO claim_form_template (template_id, claim_type, form_config) VALUES (
'f9100000-0000-0000-0000-000000000009', 'CI',
'{
  "sections": [
    {
      "id": "diagnosis",
      "title": "Diagnosis Information",
      "fields": [
        { "id": "diagnosis_date",  "label": "Diagnosis Date",     "type": "date",   "required": true },
        { "id": "condition",       "label": "Covered Condition",  "type": "select", "required": true,
          "options": [
            { "value": "cancer",           "label": "Cancer" },
            { "value": "heart_attack",     "label": "Heart Attack" },
            { "value": "stroke",           "label": "Stroke" },
            { "value": "coronary_bypass",  "label": "Coronary Artery Bypass Surgery" },
            { "value": "kidney_failure",   "label": "Kidney Failure" },
            { "value": "organ_transplant", "label": "Major Organ Transplant" },
            { "value": "ms",               "label": "Multiple Sclerosis" },
            { "value": "other",            "label": "Other Covered Condition" }
          ]
        },
        { "id": "attending_physician", "label": "Attending Physician", "type": "text",     "required": true },
        { "id": "hospital_name",       "label": "Hospital / Facility",  "type": "text",     "required": false },
        { "id": "notes",               "label": "Additional Information", "type": "textarea", "required": false }
      ]
    }
  ]
}'::jsonb);

-- ─── HSA ──────────────────────────────────────────────────────────────────────
INSERT INTO claim_form_template (template_id, claim_type, form_config) VALUES (
'f9100000-0000-0000-0000-00000000000a', 'HSA',
'{
  "sections": [
    {
      "id": "expense",
      "title": "Expense Details",
      "fields": [
        { "id": "service_date",   "label": "Date of Service / Purchase", "type": "date",   "required": true },
        { "id": "amount_claimed", "label": "Amount (CAD)",               "type": "number", "required": true, "placeholder": "0.00" },
        { "id": "expense_type",   "label": "Type of Eligible Expense",   "type": "select", "required": true,
          "options": [
            { "value": "medical",       "label": "Medical / Dental / Vision" },
            { "value": "prescription",  "label": "Prescription Drugs" },
            { "value": "paramedical",   "label": "Paramedical Services" },
            { "value": "equipment",     "label": "Medical Equipment / Supplies" },
            { "value": "other",         "label": "Other CRA-Eligible Expense" }
          ]
        },
        { "id": "provider_name",  "label": "Provider / Retailer Name",  "type": "text",     "required": true },
        { "id": "description",    "label": "Description of Expense",     "type": "textarea", "required": true }
      ]
    }
  ]
}'::jsonb);

-- ─── WSA ──────────────────────────────────────────────────────────────────────
INSERT INTO claim_form_template (template_id, claim_type, form_config) VALUES (
'f9100000-0000-0000-0000-00000000000b', 'WSA',
'{
  "sections": [
    {
      "id": "expense",
      "title": "Wellness Expense Details",
      "fields": [
        { "id": "service_date",      "label": "Date of Service / Purchase", "type": "date",   "required": true },
        { "id": "amount_claimed",    "label": "Amount (CAD)",               "type": "number", "required": true, "placeholder": "0.00" },
        { "id": "expense_category",  "label": "Expense Category",           "type": "select", "required": true,
          "options": [
            { "value": "fitness",       "label": "Fitness Equipment / Gym Membership" },
            { "value": "sports",        "label": "Sports / Recreational Activities" },
            { "value": "nutrition",     "label": "Nutrition and Weight Management" },
            { "value": "mental_health", "label": "Mental Health and Stress Management" },
            { "value": "smoking",       "label": "Smoking Cessation Programs" },
            { "value": "ergonomics",    "label": "Ergonomic Equipment (Home Office)" },
            { "value": "other",         "label": "Other Eligible Wellness Expense" }
          ]
        },
        { "id": "provider_name",     "label": "Provider / Retailer Name",  "type": "text",     "required": true },
        { "id": "description",       "label": "Description of Expense",    "type": "text",     "required": false, "placeholder": "Brief description" }
      ]
    }
  ]
}'::jsonb);
