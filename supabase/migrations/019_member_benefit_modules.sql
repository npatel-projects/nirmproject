-- Migration 019: Replace the single enrolled_module column with a per-benefit
-- benefit_modules JSONB map so members can have different tier selections
-- per benefit type (e.g. Gold dental, Standard health, Basic drug).
--
-- Shape: { "EHC": "Standard", "DENTAL": "Gold", "DRUG": "Basic", ... }

ALTER TABLE member DROP COLUMN IF EXISTS enrolled_module;
ALTER TABLE member ADD COLUMN IF NOT EXISTS benefit_modules JSONB NOT NULL DEFAULT '{}';

-- Backfill seed members with realistic per-benefit selections.

-- Natalie Lee — Executive Plan (Modular): premium health, standard drugs, premium dental
UPDATE member SET benefit_modules = '{"EHC":"Premium","DRUG":"Standard","DENTAL":"Premium"}'
WHERE member_id = 'cc400000-0000-0000-0000-000000000001';

-- Rachel Johnson — Executive Plan (Modular): standard health, standard drugs, basic dental
UPDATE member SET benefit_modules = '{"EHC":"Standard","DRUG":"Standard","DENTAL":"Basic"}'
WHERE member_id = 'cc400000-0000-0000-0000-000000000002';

-- John Doe — Operational Plan (Flex): standard across all
UPDATE member SET benefit_modules = '{"EHC":"Standard","DRUG":"Standard","DENTAL":"Standard"}'
WHERE member_id = 'cc400000-0000-0000-0000-000000000003';

-- Norman Smith — Office Plan (Traditional, single Standard tier)
UPDATE member SET benefit_modules = '{"EHC":"Standard","DENTAL":"Standard"}'
WHERE member_id = 'cc400000-0000-0000-0000-000000000004';
