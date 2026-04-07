-- Migration 017: Add plan_type column to plan and populate benefit_definition_json
-- for rich display in the Plan Detail page.
--
-- benefit_definition_json shape:
--   Non-tiered: { "display_sections": [{ "title", "wide", "fields": [{ "label", "value"? "values"? }] }] }
--   Tiered:     { "tiers": [{ "key", "label", "field_groups": [{ "title"?, "fields": [...] }] }] }
--
-- plan_definition_json gets an "additional_benefits" key for EAP / Virtual Health Care etc.

-- ── 1. Add plan_type column ───────────────────────────────────────────────────
ALTER TABLE plan ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50);

-- ── 2. Backfill plan_type ─────────────────────────────────────────────────────
UPDATE plan SET plan_type = 'Modular'     WHERE plan_id = 'c3000000-0000-0000-0000-000000000001';
UPDATE plan SET plan_type = 'Flex'        WHERE plan_id = 'c3000000-0000-0000-0000-000000000002';
UPDATE plan SET plan_type = 'Traditional' WHERE plan_id = 'c3000000-0000-0000-0000-000000000003';
UPDATE plan SET plan_type = 'Traditional' WHERE plan_id = 'c3000000-0000-0000-0000-000000000004';

-- ── 3. Add additional_benefits to executive plan ──────────────────────────────
UPDATE plan
SET plan_definition_json = plan_definition_json || '{"additional_benefits":[
  {"title":"EMPLOYEE ASSISTANCE PROGRAM","fields":[{"label":"Employee and family","value":"Offered by TELUS Health (formerly LifeWorks) — offered to all employees"}]},
  {"title":"VIRTUAL HEALTH CARE","fields":[{"label":"Employees covered under Health Care","value":"Offered by Sun Life Financial (Provider: Dialogue)"},{"label":"Employees exempted from Health Care","value":"Direct enrolment with Dialogue"}]}
]}'::jsonb
WHERE plan_id = 'c3000000-0000-0000-0000-000000000001';

-- ── 4. EXECUTIVE PLAN benefits (plan_id: c3000000-...-000000000001) ───────────

-- LIFE
UPDATE benefit SET benefit_definition_json = '{"display_sections":[
  {"title":"BASIS LIFE AND ACCIDENTAL DEATH & DISMEMBERMENT","wide":true,"fields":[
    {"label":"Benefit","value":"100% x Annual Salary"},
    {"label":"Waiver Premium","value":"Coordinated with LTD"},
    {"label":"Maximum with / without proof of health","value":"$2,000,000 / $500,000"},
    {"label":"Reduction","value":"50% at age 65"},
    {"label":"Termination","value":"Age 70 or retirement, if prior"}
  ]},
  {"title":"DEPENDENT LIFE","wide":false,"fields":[
    {"label":"Spouse / Child","value":"$15,000 / $10,000"},
    {"label":"Termination","value":"Age 70 or retirement, if prior"}
  ]},
  {"title":"OPTIONAL LIFE","wide":false,"fields":[
    {"label":"Employee and spouse","value":"Offered"},
    {"label":"Termination","value":"Age 70 or retirement, if prior"}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000001-0000-0000-0000-000000000001';

-- ADD (bundled into LIFE card above — no standalone display)
UPDATE benefit SET benefit_definition_json = '{"display_sections":[]}'::jsonb
WHERE benefit_id = 'd4000001-0000-0000-0000-000000000002';

-- STD
UPDATE benefit SET benefit_definition_json = '{"display_sections":[
  {"title":"SHORT TERM DISABILITY","wide":false,"fields":[
    {"label":"Benefit","value":"66.7% of weekly earnings"},
    {"label":"Elimination period","value":"7 days"},
    {"label":"Maximum benefit period","value":"17 weeks"},
    {"label":"Tax status","value":"Taxable"},
    {"label":"Termination","value":"Age 70 or retirement, if prior"}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000001-0000-0000-0000-000000000003';

-- LTD
UPDATE benefit SET benefit_definition_json = '{"display_sections":[
  {"title":"LONG TERM DISABILITY","wide":true,"fields":[
    {"label":"Benefit","values":["66.7% of first $2,250 of the monthly salary","50% of the next $2,250","40% of the excess"]},
    {"label":"Maximum with / without proof of health","value":"$15,000 / $10,500"},
    {"label":"Definition of disability","value":"Elimination period + 24 months, own occupation"},
    {"label":"Tax status","value":"Non-taxable"},
    {"label":"Termination","value":"Age 65 less waiting period or retirement, if prior"}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000001-0000-0000-0000-000000000004';

-- EHC — 3 tiers (Premium / Standard / Basic)
UPDATE benefit SET benefit_definition_json = '{"tiers":[
  {"key":"Premium","label":"PREMIUM","field_groups":[
    {"title":"Annual deductibles","fields":[
      {"label":"Hospital, Emergency out-of-province","value":"N/A"},
      {"label":"Other benefits including Eye exams and Vision Care","value":"N/A"}
    ]},
    {"title":"Coinsurances","fields":[
      {"label":"Hospital, Emergency out-of-province","value":"100%"},
      {"label":"Other benefits including Eye exams and Vision Care","value":"100%"}
    ]},
    {"title":"Paramedical services","fields":[
      {"label":"Acupuncturist, Audiologist, Chiropractor, Dietician, Speech therapist, Physiotherapist","value":"$600 / calendar year / practitioner"},
      {"label":"Massage therapist, Naturopath, Osteopath, Osteopathic pract., Occupational therapist","value":"$600 / calendar year - services combined"},
      {"label":"Psychologist, Social worker","value":"$600 / calendar year - services combined"},
      {"label":"Podiatrist, Chiropodist","value":"$600 / calendar year - services combined"}
    ]},
    {"title":"Other","fields":[
      {"label":"Hospital","value":"Private room"},
      {"label":"Diagnostic services","value":"Unlimited / calendar year"},
      {"label":"Eye exams","value":"$75 / 24 months (12 months < age 18)"},
      {"label":"Vision care","value":"N/A"},
      {"label":"Emergency out-of-province, Travel Assistance","value":"90 days / Included"},
      {"label":"Trip cancellation / interruption (MSH)","value":"$7,500 / insured / trip"},
      {"label":"Survivor benefit","value":"36 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]},
  {"key":"Standard","label":"STANDARD","field_groups":[
    {"title":"Annual deductibles","fields":[
      {"label":"Hospital, Emergency out-of-province","value":"N/A"},
      {"label":"Other benefits including Eye exams and Vision Care","value":"N/A"}
    ]},
    {"title":"Coinsurances","fields":[
      {"label":"Hospital, Emergency out-of-province","value":"100%"},
      {"label":"Other benefits including Eye exams and Vision Care","value":"100%"}
    ]},
    {"title":"Paramedical services","fields":[
      {"label":"Acupuncturist, Audiologist, Chiropractor, Dietician, Speech therapist, Physiotherapist","value":"$500 / calendar year / practitioner"},
      {"label":"Massage therapist, Naturopath, Osteopath, Osteopathic pract., Occupational therapist","value":"$500 / calendar year - services combined"},
      {"label":"Psychologist, Social worker","value":"$500 / calendar year - services combined"},
      {"label":"Podiatrist, Chiropodist","value":"$500 / calendar year - services combined"}
    ]},
    {"title":"Other","fields":[
      {"label":"Hospital","value":"Semi-private room"},
      {"label":"Diagnostic services","value":"$500 / calendar year"},
      {"label":"Eye exams","value":"$50 / 24 months (12 months < age 18)"},
      {"label":"Vision care","value":"N/A"},
      {"label":"Emergency out-of-province, Travel Assistance","value":"60 days / Included"},
      {"label":"Trip cancellation / interruption (MSH)","value":"$5,000 / insured / trip"},
      {"label":"Survivor benefit","value":"24 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]},
  {"key":"Basic","label":"BASIC","field_groups":[
    {"title":"Annual deductibles","fields":[
      {"label":"Hospital, Emergency out-of-province","value":"$50 Individual / $100 Family"},
      {"label":"Other benefits including Eye exams and Vision Care","value":"$25 Individual / $50 Family"}
    ]},
    {"title":"Coinsurances","fields":[
      {"label":"Hospital, Emergency out-of-province","value":"80%"},
      {"label":"Other benefits including Eye exams and Vision Care","value":"80%"}
    ]},
    {"title":"Paramedical services","fields":[
      {"label":"Acupuncturist, Audiologist, Chiropractor, Dietician, Speech therapist, Physiotherapist","value":"$350 / calendar year / practitioner"},
      {"label":"Massage therapist, Naturopath, Osteopath, Osteopathic pract., Occupational therapist","value":"$350 / calendar year - services combined"},
      {"label":"Psychologist, Social worker","value":"$350 / calendar year - services combined"},
      {"label":"Podiatrist, Chiropodist","value":"N/A"}
    ]},
    {"title":"Other","fields":[
      {"label":"Hospital","value":"Ward"},
      {"label":"Diagnostic services","value":"$300 / calendar year"},
      {"label":"Eye exams","value":"$40 / 24 months"},
      {"label":"Vision care","value":"N/A"},
      {"label":"Emergency out-of-province, Travel Assistance","value":"30 days / Included"},
      {"label":"Trip cancellation / interruption (MSH)","value":"N/A"},
      {"label":"Survivor benefit","value":"12 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000001-0000-0000-0000-000000000005';

-- DENTAL — 3 tiers
UPDATE benefit SET benefit_definition_json = '{"tiers":[
  {"key":"Premium","label":"PREMIUM","field_groups":[
    {"fields":[
      {"label":"Annual deductibles","value":"N/A"},
      {"label":"Preventive and basic services","value":"100%"},
      {"label":"Major services","value":"80%"},
      {"label":"Orthodontics","value":"50% — lifetime maximum $3,000"},
      {"label":"Preventive and basic services maximum","value":"$3,000 / calendar year"},
      {"label":"Major services maximum","value":"$3,000 / calendar year"},
      {"label":"Recall exam","value":"1 exam / 6 months"},
      {"label":"Fee guide","value":"Current, Generalists, Province of residence"},
      {"label":"Survivor benefit","value":"36 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]},
  {"key":"Standard","label":"STANDARD","field_groups":[
    {"fields":[
      {"label":"Annual deductibles","value":"$50 Individual / $100 Family"},
      {"label":"Preventive and basic services","value":"80%"},
      {"label":"Major services","value":"N/A"},
      {"label":"Orthodontics","value":"N/A"},
      {"label":"Preventive and basic services maximum","value":"$1,500 / calendar year"},
      {"label":"Major services maximum","value":"N/A"},
      {"label":"Recall exam","value":"1 exam / 6 months"},
      {"label":"Fee guide","value":"Current, Generalists, Province of residence"},
      {"label":"Survivor benefit","value":"24 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]},
  {"key":"Basic","label":"BASIC","field_groups":[
    {"fields":[
      {"label":"Annual deductibles","value":"$75 Individual / $150 Family"},
      {"label":"Preventive and basic services","value":"70%"},
      {"label":"Major services","value":"N/A"},
      {"label":"Orthodontics","value":"N/A"},
      {"label":"Preventive and basic services maximum","value":"$1,000 / calendar year"},
      {"label":"Major services maximum","value":"N/A"},
      {"label":"Recall exam","value":"1 exam / 9 months"},
      {"label":"Fee guide","value":"Current, Generalists, Province of residence"},
      {"label":"Survivor benefit","value":"12 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000001-0000-0000-0000-000000000006';

-- DRUG — 3 tiers
UPDATE benefit SET benefit_definition_json = '{"tiers":[
  {"key":"Premium","label":"PREMIUM","field_groups":[
    {"fields":[
      {"label":"Annual deductibles","value":"N/A"},
      {"label":"Coinsurance","value":"90% x lowest cost equivalent drug"},
      {"label":"Drugs","value":"Requires doctor prescription"},
      {"label":"Quebec residents — Age 65 and over","value":"Coordination with RAMQ"},
      {"label":"Payment mode","value":"Pay direct card"},
      {"label":"Survivor benefit","value":"36 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]},
  {"key":"Standard","label":"STANDARD","field_groups":[
    {"fields":[
      {"label":"Annual deductibles","value":"$50 Individual / $100 Family"},
      {"label":"Coinsurance","value":"80% x lowest cost equivalent drug"},
      {"label":"Drugs","value":"Requires doctor prescription"},
      {"label":"Quebec residents — Age 65 and over","value":"Coordination with RAMQ"},
      {"label":"Payment mode","value":"Pay direct card"},
      {"label":"Survivor benefit","value":"24 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]},
  {"key":"Basic","label":"BASIC","field_groups":[
    {"fields":[
      {"label":"Annual deductibles","value":"$100 Individual / $200 Family"},
      {"label":"Coinsurance","value":"70% x lowest cost equivalent drug"},
      {"label":"Drugs","value":"Requires doctor prescription"},
      {"label":"Quebec residents — Age 65 and over","value":"Coordination with RAMQ"},
      {"label":"Payment mode","value":"Submit receipts"},
      {"label":"Survivor benefit","value":"12 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000001-0000-0000-0000-000000000007';

-- VISION
UPDATE benefit SET benefit_definition_json = '{"display_sections":[
  {"title":"VISION CARE","wide":false,"fields":[
    {"label":"Benefit","value":"$400 / insured / 24 months"},
    {"label":"Eligible expenses","value":"Prescription glasses, contact lenses, laser eye surgery"},
    {"label":"Eye exams","value":"Covered under Health Care benefit"},
    {"label":"Termination","value":"Retirement"}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000001-0000-0000-0000-000000000008';

-- HSA
UPDATE benefit SET benefit_definition_json = '{"display_sections":[
  {"title":"HEALTH SPENDING ACCOUNT","wide":true,"fields":[
    {"label":"Eligibility","value":"Employee must be covered under the Health Care benefit"},
    {"label":"Amount - Credits","value":"$2,500 / calendar year"},
    {"label":"Allocation during the calendar year","value":"Prorated to the remaining months of the year"},
    {"label":"Balance carry-forward","value":"Applicable"},
    {"label":"Eligible expenses","value":"According to the Income Tax Act (Canada)"},
    {"label":"Tax status","value":"Non-taxable"},
    {"label":"Termination","value":"Retirement"}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000001-0000-0000-0000-000000000009';

-- ── 5. OPERATIONAL EMPLOYEES PLAN benefits (plan_id: c3000000-...-000000000002) ─

-- LIFE
UPDATE benefit SET benefit_definition_json = '{"display_sections":[
  {"title":"GROUP LIFE INSURANCE","wide":true,"fields":[
    {"label":"Benefit","value":"200% x Annual Salary"},
    {"label":"Maximum with / without proof of health","value":"$500,000 / $250,000"},
    {"label":"Reduction","value":"50% at age 65"},
    {"label":"Termination","value":"Age 70 or retirement, if prior"}
  ]},
  {"title":"DEPENDENT LIFE","wide":false,"fields":[
    {"label":"Spouse / Child","value":"$10,000 / $5,000"},
    {"label":"Termination","value":"Age 70 or retirement, if prior"}
  ]},
  {"title":"OPTIONAL LIFE","wide":false,"fields":[
    {"label":"Coverage","value":"Not offered"}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000002-0000-0000-0000-000000000001';

-- STD
UPDATE benefit SET benefit_definition_json = '{"display_sections":[
  {"title":"SHORT TERM DISABILITY","wide":true,"fields":[
    {"label":"Benefit","value":"66.7% of weekly earnings"},
    {"label":"Elimination period","value":"14 days"},
    {"label":"Maximum benefit period","value":"17 weeks"},
    {"label":"Tax status","value":"Taxable"},
    {"label":"Termination","value":"Age 70 or retirement, if prior"}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000002-0000-0000-0000-000000000002';

-- EHC — 2 tiers (Standard / Basic)
UPDATE benefit SET benefit_definition_json = '{"tiers":[
  {"key":"Standard","label":"STANDARD","field_groups":[
    {"title":"Annual deductibles","fields":[
      {"label":"Hospital, Emergency out-of-province","value":"N/A"},
      {"label":"Other benefits","value":"N/A"}
    ]},
    {"title":"Coinsurances","fields":[
      {"label":"Hospital, Emergency out-of-province","value":"100%"},
      {"label":"Other benefits","value":"80%"}
    ]},
    {"title":"Paramedical services","fields":[
      {"label":"Chiropractor, Physiotherapist, Massage therapist","value":"$400 / calendar year / practitioner"},
      {"label":"Psychologist, Social worker","value":"$400 / calendar year - services combined"}
    ]},
    {"title":"Other","fields":[
      {"label":"Hospital","value":"Semi-private room"},
      {"label":"Emergency out-of-province, Travel Assistance","value":"60 days / Included"},
      {"label":"Survivor benefit","value":"24 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]},
  {"key":"Basic","label":"BASIC","field_groups":[
    {"title":"Annual deductibles","fields":[
      {"label":"Hospital, Emergency out-of-province","value":"$50 Individual / $100 Family"},
      {"label":"Other benefits","value":"$25 Individual / $50 Family"}
    ]},
    {"title":"Coinsurances","fields":[
      {"label":"Hospital, Emergency out-of-province","value":"80%"},
      {"label":"Other benefits","value":"70%"}
    ]},
    {"title":"Paramedical services","fields":[
      {"label":"Chiropractor, Physiotherapist, Massage therapist","value":"$300 / calendar year / practitioner"},
      {"label":"Psychologist, Social worker","value":"$300 / calendar year - services combined"}
    ]},
    {"title":"Other","fields":[
      {"label":"Hospital","value":"Ward"},
      {"label":"Emergency out-of-province, Travel Assistance","value":"30 days / Included"},
      {"label":"Survivor benefit","value":"12 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000002-0000-0000-0000-000000000003';

-- DENTAL — 2 tiers
UPDATE benefit SET benefit_definition_json = '{"tiers":[
  {"key":"Standard","label":"STANDARD","field_groups":[
    {"fields":[
      {"label":"Annual deductibles","value":"$50 Individual / $100 Family"},
      {"label":"Preventive and basic services","value":"80%"},
      {"label":"Major services","value":"N/A"},
      {"label":"Preventive and basic services maximum","value":"$1,500 / calendar year"},
      {"label":"Recall exam","value":"1 exam / 6 months"},
      {"label":"Fee guide","value":"Current, Generalists, Province of residence"},
      {"label":"Survivor benefit","value":"24 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]},
  {"key":"Basic","label":"BASIC","field_groups":[
    {"fields":[
      {"label":"Annual deductibles","value":"$75 Individual / $150 Family"},
      {"label":"Preventive and basic services","value":"70%"},
      {"label":"Major services","value":"N/A"},
      {"label":"Preventive and basic services maximum","value":"$1,000 / calendar year"},
      {"label":"Recall exam","value":"1 exam / 9 months"},
      {"label":"Fee guide","value":"Current, Generalists, Province of residence"},
      {"label":"Survivor benefit","value":"12 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000002-0000-0000-0000-000000000004';

-- DRUG — 2 tiers
UPDATE benefit SET benefit_definition_json = '{"tiers":[
  {"key":"Standard","label":"STANDARD","field_groups":[
    {"fields":[
      {"label":"Annual deductibles","value":"$50 Individual / $100 Family"},
      {"label":"Coinsurance","value":"80% x lowest cost equivalent drug"},
      {"label":"Drugs","value":"Requires doctor prescription"},
      {"label":"Payment mode","value":"Pay direct card"},
      {"label":"Survivor benefit","value":"24 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]},
  {"key":"Basic","label":"BASIC","field_groups":[
    {"fields":[
      {"label":"Annual deductibles","value":"$100 Individual / $200 Family"},
      {"label":"Coinsurance","value":"70% x lowest cost equivalent drug"},
      {"label":"Drugs","value":"Requires doctor prescription"},
      {"label":"Payment mode","value":"Submit receipts"},
      {"label":"Survivor benefit","value":"12 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000002-0000-0000-0000-000000000005';

-- ── 6. OFFICE EMPLOYEES PLAN benefits (plan_id: c3000000-...-000000000003) ────

-- LIFE
UPDATE benefit SET benefit_definition_json = '{"display_sections":[
  {"title":"GROUP LIFE INSURANCE","wide":true,"fields":[
    {"label":"Benefit","value":"150% x Annual Salary"},
    {"label":"Maximum with / without proof of health","value":"$400,000 / $200,000"},
    {"label":"Reduction","value":"50% at age 65"},
    {"label":"Termination","value":"Age 70 or retirement, if prior"}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000003-0000-0000-0000-000000000001';

-- EHC — 1 tier (Standard)
UPDATE benefit SET benefit_definition_json = '{"tiers":[
  {"key":"Standard","label":"STANDARD","field_groups":[
    {"title":"Annual deductibles","fields":[
      {"label":"Hospital, Emergency out-of-province","value":"N/A"},
      {"label":"Other benefits","value":"N/A"}
    ]},
    {"title":"Coinsurances","fields":[
      {"label":"Hospital, Emergency out-of-province","value":"100%"},
      {"label":"Other benefits","value":"80%"}
    ]},
    {"title":"Paramedical services","fields":[
      {"label":"Chiropractor, Physiotherapist, Massage therapist","value":"$400 / calendar year / practitioner"}
    ]},
    {"title":"Other","fields":[
      {"label":"Hospital","value":"Semi-private room"},
      {"label":"Emergency out-of-province, Travel Assistance","value":"60 days / Included"},
      {"label":"Survivor benefit","value":"24 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000003-0000-0000-0000-000000000002';

-- DENTAL — 1 tier (Standard)
UPDATE benefit SET benefit_definition_json = '{"tiers":[
  {"key":"Standard","label":"STANDARD","field_groups":[
    {"fields":[
      {"label":"Annual deductibles","value":"$50 Individual / $100 Family"},
      {"label":"Preventive and basic services","value":"80%"},
      {"label":"Major services","value":"N/A"},
      {"label":"Preventive and basic services maximum","value":"$1,000 / calendar year"},
      {"label":"Recall exam","value":"1 exam / 6 months"},
      {"label":"Fee guide","value":"Current, Generalists, Province of residence"},
      {"label":"Survivor benefit","value":"24 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000003-0000-0000-0000-000000000003';

-- ── 7. EMPLOYEE PLAN / ACQUISITION 1 (plan_id: c3000000-...-000000000004) ─────

-- LIFE
UPDATE benefit SET benefit_definition_json = '{"display_sections":[
  {"title":"GROUP LIFE INSURANCE","wide":true,"fields":[
    {"label":"Benefit","value":"$50,000 flat amount"},
    {"label":"Maximum","value":"$50,000"},
    {"label":"Termination","value":"Age 70 or retirement, if prior"}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000004-0000-0000-0000-000000000001';

-- EHC — 1 tier (Basic)
UPDATE benefit SET benefit_definition_json = '{"tiers":[
  {"key":"Basic","label":"BASIC","field_groups":[
    {"title":"Annual deductibles","fields":[
      {"label":"Hospital, Emergency out-of-province","value":"$50 Individual / $100 Family"},
      {"label":"Other benefits","value":"$25 Individual / $50 Family"}
    ]},
    {"title":"Coinsurances","fields":[
      {"label":"Hospital, Emergency out-of-province","value":"80%"},
      {"label":"Other benefits","value":"70%"}
    ]},
    {"title":"Other","fields":[
      {"label":"Hospital","value":"Ward"},
      {"label":"Emergency out-of-province, Travel Assistance","value":"30 days / Included"},
      {"label":"Survivor benefit","value":"12 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000004-0000-0000-0000-000000000002';

-- DENTAL — 1 tier (Basic)
UPDATE benefit SET benefit_definition_json = '{"tiers":[
  {"key":"Basic","label":"BASIC","field_groups":[
    {"fields":[
      {"label":"Annual deductibles","value":"$75 Individual / $150 Family"},
      {"label":"Preventive and basic services","value":"70%"},
      {"label":"Major services","value":"N/A"},
      {"label":"Preventive and basic services maximum","value":"$1,000 / calendar year"},
      {"label":"Recall exam","value":"1 exam / 9 months"},
      {"label":"Fee guide","value":"Current, Generalists, Province of residence"},
      {"label":"Survivor benefit","value":"12 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000004-0000-0000-0000-000000000003';

-- DRUG — 1 tier (Basic)
UPDATE benefit SET benefit_definition_json = '{"tiers":[
  {"key":"Basic","label":"BASIC","field_groups":[
    {"fields":[
      {"label":"Annual deductibles","value":"$100 Individual / $200 Family"},
      {"label":"Coinsurance","value":"70% x lowest cost equivalent drug"},
      {"label":"Drugs","value":"Requires doctor prescription"},
      {"label":"Payment mode","value":"Submit receipts"},
      {"label":"Survivor benefit","value":"12 months"},
      {"label":"Termination","value":"Retirement"}
    ]}
  ]}
]}'::jsonb
WHERE benefit_id = 'd4000004-0000-0000-0000-000000000004';
