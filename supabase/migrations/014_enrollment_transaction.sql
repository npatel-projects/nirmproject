-- 014_enrollment_transaction.sql
-- Audit table for all enrollment submissions and their PAS results.
-- Created regardless of PAS outcome — allows re-processing and audit trail.

CREATE TABLE IF NOT EXISTS enrollment_transaction (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
  sponsor_id    UUID NOT NULL REFERENCES sponsor(sponsor_id)   ON DELETE CASCADE,
  plan_id       UUID NOT NULL REFERENCES plan(plan_id)         ON DELETE CASCADE,
  submitted_by  TEXT,
  form_data     JSONB NOT NULL DEFAULT '{}',
  pas_status    TEXT NOT NULL,
  -- ENROLLED | PENDING_REVIEW | PENDING_EOI | INELIGIBLE | ERROR
  pas_ref       TEXT,
  pas_reason    TEXT,
  mock          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for looking up all submissions for a given employee
CREATE INDEX IF NOT EXISTS idx_enrollment_transaction_employee
  ON enrollment_transaction (employee_id);
