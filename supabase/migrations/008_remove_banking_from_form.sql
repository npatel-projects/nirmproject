-- ─────────────────────────────────────────────────────────────────────────────
-- 008_remove_banking_from_form.sql
-- Removes the Banking Information section from the ABC Insurance enrollment
-- form template (template_id ff700000-0000-0000-0000-000000000001)
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE enrollment_form_template
SET
  form_config = jsonb_set(
    form_config,
    '{sections}',
    (
      SELECT jsonb_agg(section ORDER BY ordinality)
      FROM jsonb_array_elements(form_config -> 'sections') WITH ORDINALITY AS t(section, ordinality)
      WHERE section ->> 'id' <> 'banking'
    )
  ),
  updated_at = now()
WHERE template_id = 'ff700000-0000-0000-0000-000000000001';
