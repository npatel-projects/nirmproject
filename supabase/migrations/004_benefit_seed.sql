-- ─────────────────────────────────────────────────────────────────────────────
-- Update plans with plan_definition_json (general overview data)
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE plan SET plan_definition_json = '{
  "group": "Management",
  "plan_type": "Medical",
  "modules": ["Premium", "Standard", "Basic"],
  "eligible_classes": [
    "Employee (Permanent - minimum of 30 hours / week)",
    "Spouse (Married or 12 months cohabitation)",
    "Dependent Children (under 26 years)"
  ],
  "reenrolment_period": "2027-04-01"
}' WHERE plan_id = 'c3000000-0000-0000-0000-000000000001';

UPDATE plan SET plan_definition_json = '{
  "group": "Operations",
  "plan_type": "Group Benefits",
  "modules": ["Standard", "Basic"],
  "eligible_classes": [
    "Full-Time Employee (minimum 35 hours / week)",
    "Spouse",
    "Dependent Children (under 21 years)"
  ],
  "reenrolment_period": "2027-04-01"
}' WHERE plan_id = 'c3000000-0000-0000-0000-000000000002';

UPDATE plan SET plan_definition_json = '{
  "group": "Office",
  "plan_type": "Group Benefits",
  "modules": ["Standard"],
  "eligible_classes": [
    "Full-Time Employee",
    "Spouse",
    "Dependent Children (under 21 years)"
  ],
  "reenrolment_period": "2027-04-01"
}' WHERE plan_id = 'c3000000-0000-0000-0000-000000000003';

UPDATE plan SET plan_definition_json = '{
  "group": "All Employees",
  "plan_type": "Group Benefits",
  "modules": ["Basic"],
  "eligible_classes": [
    "Full-Time Employee",
    "Spouse",
    "Dependent Children (under 25 years)"
  ],
  "reenrolment_period": "2027-11-08"
}' WHERE plan_id = 'c3000000-0000-0000-0000-000000000004';


-- ─────────────────────────────────────────────────────────────────────────────
-- Benefits for Executive Plan (c3000000-0000-0000-0000-000000000001)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO benefit (benefit_id, plan_id, benefit_code, benefit_type, benefit_name, coverage_formula, flat_amount, nem_amount, max_amount, waiting_period_days, is_active)
VALUES
  ('d4000001-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 'LIFE-EXEC', 'LIFE', 'Group Life Insurance', 'SALARY_MULTIPLE', NULL, 500000, 2000000, 30, TRUE),
  ('d4000001-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000001', 'ADD-EXEC',  'ADD',  'Accidental Death & Dismemberment', 'SALARY_MULTIPLE', NULL, 500000, 2000000, 30, TRUE),
  ('d4000001-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000001', 'STD-EXEC',  'STD',  'Short Term Disability', 'PERCENTAGE_EARNINGS', NULL, NULL, NULL, 7, TRUE),
  ('d4000001-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000001', 'LTD-EXEC',  'LTD',  'Long Term Disability', 'PERCENTAGE_EARNINGS', NULL, NULL, NULL, 119, TRUE),
  ('d4000001-0000-0000-0000-000000000005', 'c3000000-0000-0000-0000-000000000001', 'EHC-EXEC',  'EHC',  'Extended Health Care', 'FLAT', NULL, NULL, NULL, 30, TRUE),
  ('d4000001-0000-0000-0000-000000000006', 'c3000000-0000-0000-0000-000000000001', 'DENT-EXEC', 'DENTAL','Dental Care', 'FLAT', NULL, NULL, 3000, 30, TRUE),
  ('d4000001-0000-0000-0000-000000000007', 'c3000000-0000-0000-0000-000000000001', 'DRUG-EXEC', 'DRUG', 'Prescription Drug', 'FLAT', NULL, NULL, NULL, 30, TRUE),
  ('d4000001-0000-0000-0000-000000000008', 'c3000000-0000-0000-0000-000000000001', 'VIS-EXEC',  'VISION','Vision Care', 'FLAT', 400, NULL, 400, 30, TRUE),
  ('d4000001-0000-0000-0000-000000000009', 'c3000000-0000-0000-0000-000000000001', 'HSA-EXEC',  'HSA',  'Health Spending Account', 'FLAT', 2500, NULL, 2500, 30, TRUE);


-- ─────────────────────────────────────────────────────────────────────────────
-- Benefits for Operational Employees Plan (c3000000-0000-0000-0000-000000000002)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO benefit (benefit_id, plan_id, benefit_code, benefit_type, benefit_name, coverage_formula, flat_amount, nem_amount, max_amount, waiting_period_days, is_active)
VALUES
  ('d4000002-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000002', 'LIFE-OPS', 'LIFE', 'Group Life Insurance', 'SALARY_MULTIPLE', NULL, 250000, 500000, 90, TRUE),
  ('d4000002-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000002', 'STD-OPS',  'STD',  'Short Term Disability', 'PERCENTAGE_EARNINGS', NULL, NULL, NULL, 14, TRUE),
  ('d4000002-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000002', 'EHC-OPS',  'EHC',  'Extended Health Care', 'FLAT', NULL, NULL, NULL, 90, TRUE),
  ('d4000002-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000002', 'DENT-OPS', 'DENTAL','Dental Care', 'FLAT', NULL, NULL, 1500, 90, TRUE),
  ('d4000002-0000-0000-0000-000000000005', 'c3000000-0000-0000-0000-000000000002', 'DRUG-OPS', 'DRUG', 'Prescription Drug', 'FLAT', NULL, NULL, NULL, 90, TRUE);


-- ─────────────────────────────────────────────────────────────────────────────
-- Benefits for Office Employees Plan (c3000000-0000-0000-0000-000000000003)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO benefit (benefit_id, plan_id, benefit_code, benefit_type, benefit_name, coverage_formula, flat_amount, nem_amount, max_amount, waiting_period_days, is_active)
VALUES
  ('d4000003-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000003', 'LIFE-OFF', 'LIFE', 'Group Life Insurance', 'SALARY_MULTIPLE', NULL, 200000, 400000, 90, TRUE),
  ('d4000003-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000003', 'EHC-OFF',  'EHC',  'Extended Health Care', 'FLAT', NULL, NULL, NULL, 90, TRUE),
  ('d4000003-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000003', 'DENT-OFF', 'DENTAL','Dental Care', 'FLAT', NULL, NULL, 1000, 90, TRUE);


-- ─────────────────────────────────────────────────────────────────────────────
-- Benefits for Employee Plan / Acquisition 1 (c3000000-0000-0000-0000-000000000004)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO benefit (benefit_id, plan_id, benefit_code, benefit_type, benefit_name, coverage_formula, flat_amount, nem_amount, max_amount, waiting_period_days, is_active)
VALUES
  ('d4000004-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000004', 'LIFE-EMP', 'LIFE', 'Group Life Insurance', 'FLAT', 50000, 50000, 50000, 90, TRUE),
  ('d4000004-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000004', 'EHC-EMP',  'EHC',  'Extended Health Care', 'FLAT', NULL, NULL, NULL, 90, TRUE),
  ('d4000004-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000004', 'DENT-EMP', 'DENTAL','Dental Care', 'FLAT', NULL, NULL, 1000, 90, TRUE),
  ('d4000004-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000004', 'DRUG-EMP', 'DRUG', 'Prescription Drug', 'FLAT', NULL, NULL, NULL, 90, TRUE);
