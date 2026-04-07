-- Migration 015: Add a "Supporting Documents" file_upload section to every claim form template.
-- Each claim type gets a tailored description so users know what to attach.

-- Helper: append a new section to form_config->sections array
-- We use jsonb_set + || to append an element to the array.

DO $$
DECLARE
  v_section jsonb;
BEGIN

  -- ── DENTAL ──────────────────────────────────────────────────────────────────
  v_section := '{
    "id": "supporting_docs",
    "title": "Supporting Documents",
    "description": "Attach itemized receipts from your dental provider and any Explanation of Benefits (EOB) from a coordinating insurer.",
    "fields": [
      {
        "id": "attachments",
        "type": "file_upload",
        "label": "Upload Documents",
        "required": false,
        "description": "Accepted: PDF, JPG, PNG · max 10 MB each · up to 10 files"
      }
    ]
  }'::jsonb;

  UPDATE claim_form_template
  SET form_config = jsonb_set(
    form_config,
    '{sections}',
    (form_config->'sections') || v_section
  )
  WHERE claim_type = 'DENTAL' AND is_active = true AND sponsor_id IS NULL;

  -- ── HEALTH ──────────────────────────────────────────────────────────────────
  v_section := '{
    "id": "supporting_docs",
    "title": "Supporting Documents",
    "description": "Attach official receipts, referral letters, and any EOB from a coordinating insurer.",
    "fields": [
      {
        "id": "attachments",
        "type": "file_upload",
        "label": "Upload Documents",
        "required": false,
        "description": "Accepted: PDF, JPG, PNG · max 10 MB each · up to 10 files"
      }
    ]
  }'::jsonb;

  UPDATE claim_form_template
  SET form_config = jsonb_set(
    form_config,
    '{sections}',
    (form_config->'sections') || v_section
  )
  WHERE claim_type = 'HEALTH' AND is_active = true AND sponsor_id IS NULL;

  -- ── DRUG ────────────────────────────────────────────────────────────────────
  v_section := '{
    "id": "supporting_docs",
    "title": "Supporting Documents",
    "description": "Attach the pharmacy receipt or prescription label showing the drug name, DIN, quantity, and cost.",
    "fields": [
      {
        "id": "attachments",
        "type": "file_upload",
        "label": "Upload Documents",
        "required": false,
        "description": "Accepted: PDF, JPG, PNG · max 10 MB each · up to 10 files"
      }
    ]
  }'::jsonb;

  UPDATE claim_form_template
  SET form_config = jsonb_set(
    form_config,
    '{sections}',
    (form_config->'sections') || v_section
  )
  WHERE claim_type = 'DRUG' AND is_active = true AND sponsor_id IS NULL;

  -- ── VISION ──────────────────────────────────────────────────────────────────
  v_section := '{
    "id": "supporting_docs",
    "title": "Supporting Documents",
    "description": "Attach receipts from your optometrist or optical retailer and any EOB from a coordinating insurer.",
    "fields": [
      {
        "id": "attachments",
        "type": "file_upload",
        "label": "Upload Documents",
        "required": false,
        "description": "Accepted: PDF, JPG, PNG · max 10 MB each · up to 10 files"
      }
    ]
  }'::jsonb;

  UPDATE claim_form_template
  SET form_config = jsonb_set(
    form_config,
    '{sections}',
    (form_config->'sections') || v_section
  )
  WHERE claim_type = 'VISION' AND is_active = true AND sponsor_id IS NULL;

  -- ── LIFE ────────────────────────────────────────────────────────────────────
  v_section := '{
    "id": "supporting_docs",
    "title": "Supporting Documents",
    "description": "Attach a certified death certificate and proof of relationship (e.g. marriage certificate, birth certificate).",
    "fields": [
      {
        "id": "attachments",
        "type": "file_upload",
        "label": "Upload Documents",
        "required": false,
        "description": "Accepted: PDF, JPG, PNG · max 10 MB each · up to 10 files"
      }
    ]
  }'::jsonb;

  UPDATE claim_form_template
  SET form_config = jsonb_set(
    form_config,
    '{sections}',
    (form_config->'sections') || v_section
  )
  WHERE claim_type = 'LIFE' AND is_active = true AND sponsor_id IS NULL;

  -- ── STD ─────────────────────────────────────────────────────────────────────
  v_section := '{
    "id": "supporting_docs",
    "title": "Supporting Documents",
    "description": "Attach a completed Attending Physician Statement and any relevant medical records supporting the disability.",
    "fields": [
      {
        "id": "attachments",
        "type": "file_upload",
        "label": "Upload Documents",
        "required": false,
        "description": "Accepted: PDF, JPG, PNG · max 10 MB each · up to 10 files"
      }
    ]
  }'::jsonb;

  UPDATE claim_form_template
  SET form_config = jsonb_set(
    form_config,
    '{sections}',
    (form_config->'sections') || v_section
  )
  WHERE claim_type = 'STD' AND is_active = true AND sponsor_id IS NULL;

  -- ── LTD ─────────────────────────────────────────────────────────────────────
  v_section := '{
    "id": "supporting_docs",
    "title": "Supporting Documents",
    "description": "Attach a completed Attending Physician Statement and any relevant medical records supporting the long-term disability.",
    "fields": [
      {
        "id": "attachments",
        "type": "file_upload",
        "label": "Upload Documents",
        "required": false,
        "description": "Accepted: PDF, JPG, PNG · max 10 MB each · up to 10 files"
      }
    ]
  }'::jsonb;

  UPDATE claim_form_template
  SET form_config = jsonb_set(
    form_config,
    '{sections}',
    (form_config->'sections') || v_section
  )
  WHERE claim_type = 'LTD' AND is_active = true AND sponsor_id IS NULL;

  -- ── ADD ─────────────────────────────────────────────────────────────────────
  v_section := '{
    "id": "supporting_docs",
    "title": "Supporting Documents",
    "description": "Attach a police or accident report, hospital admission records, and any medical documentation describing the injury.",
    "fields": [
      {
        "id": "attachments",
        "type": "file_upload",
        "label": "Upload Documents",
        "required": false,
        "description": "Accepted: PDF, JPG, PNG · max 10 MB each · up to 10 files"
      }
    ]
  }'::jsonb;

  UPDATE claim_form_template
  SET form_config = jsonb_set(
    form_config,
    '{sections}',
    (form_config->'sections') || v_section
  )
  WHERE claim_type = 'ADD' AND is_active = true AND sponsor_id IS NULL;

  -- ── CI ──────────────────────────────────────────────────────────────────────
  v_section := '{
    "id": "supporting_docs",
    "title": "Supporting Documents",
    "description": "Attach the specialist diagnosis letter, pathology report, or other documentation confirming the covered condition.",
    "fields": [
      {
        "id": "attachments",
        "type": "file_upload",
        "label": "Upload Documents",
        "required": false,
        "description": "Accepted: PDF, JPG, PNG · max 10 MB each · up to 10 files"
      }
    ]
  }'::jsonb;

  UPDATE claim_form_template
  SET form_config = jsonb_set(
    form_config,
    '{sections}',
    (form_config->'sections') || v_section
  )
  WHERE claim_type = 'CI' AND is_active = true AND sponsor_id IS NULL;

  -- ── HSA ─────────────────────────────────────────────────────────────────────
  v_section := '{
    "id": "supporting_docs",
    "title": "Supporting Documents",
    "description": "Attach official receipts for each eligible health expense you are claiming from your HSA balance.",
    "fields": [
      {
        "id": "attachments",
        "type": "file_upload",
        "label": "Upload Receipts",
        "required": false,
        "description": "Accepted: PDF, JPG, PNG · max 10 MB each · up to 10 files"
      }
    ]
  }'::jsonb;

  UPDATE claim_form_template
  SET form_config = jsonb_set(
    form_config,
    '{sections}',
    (form_config->'sections') || v_section
  )
  WHERE claim_type = 'HSA' AND is_active = true AND sponsor_id IS NULL;

  -- ── WSA ─────────────────────────────────────────────────────────────────────
  v_section := '{
    "id": "supporting_docs",
    "title": "Supporting Documents",
    "description": "Attach official receipts for each eligible wellness expense you are claiming from your WSA balance.",
    "fields": [
      {
        "id": "attachments",
        "type": "file_upload",
        "label": "Upload Receipts",
        "required": false,
        "description": "Accepted: PDF, JPG, PNG · max 10 MB each · up to 10 files"
      }
    ]
  }'::jsonb;

  UPDATE claim_form_template
  SET form_config = jsonb_set(
    form_config,
    '{sections}',
    (form_config->'sections') || v_section
  )
  WHERE claim_type = 'WSA' AND is_active = true AND sponsor_id IS NULL;

END $$;
