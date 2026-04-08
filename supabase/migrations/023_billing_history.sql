-- Migration 023: Sponsor billing history (invoices)

CREATE TABLE IF NOT EXISTS sponsor_invoice (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id    UUID NOT NULL REFERENCES sponsor(sponsor_id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL,
  invoice_date  DATE NOT NULL,
  due_date      DATE NOT NULL,
  amount        NUMERIC(14,2) NOT NULL,
  currency      CHAR(3) NOT NULL DEFAULT 'CAD',
  status        VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING | PAID | OVERDUE | VOID
  paid_at       DATE,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsor_invoice_sponsor ON sponsor_invoice (sponsor_id, invoice_date DESC);

-- ── Seed: ABC Company invoices ────────────────────────────────────────────────
INSERT INTO sponsor_invoice (sponsor_id, invoice_number, invoice_date, due_date, amount, currency, status, paid_at, description) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'INV-2025-003', '2025-03-01', '2025-03-15', 14250.00, 'CAD', 'PAID',    '2025-03-12', 'Monthly group benefits premium — March 2025'),
  ('a1000000-0000-0000-0000-000000000001', 'INV-2025-002', '2025-02-01', '2025-02-15', 13980.00, 'CAD', 'PAID',    '2025-02-10', 'Monthly group benefits premium — February 2025'),
  ('a1000000-0000-0000-0000-000000000001', 'INV-2025-001', '2025-01-01', '2025-01-15', 13980.00, 'CAD', 'PAID',    '2025-01-14', 'Monthly group benefits premium — January 2025'),
  ('a1000000-0000-0000-0000-000000000001', 'INV-2024-012', '2024-12-01', '2024-12-15', 13750.00, 'CAD', 'PAID',    '2024-12-13', 'Monthly group benefits premium — December 2024'),
  ('a1000000-0000-0000-0000-000000000001', 'INV-2024-011', '2024-11-01', '2024-11-15', 13750.00, 'CAD', 'PAID',    '2024-11-15', 'Monthly group benefits premium — November 2024'),
  ('a1000000-0000-0000-0000-000000000001', 'INV-2024-010', '2024-10-01', '2024-10-15', 13500.00, 'CAD', 'PAID',    '2024-10-11', 'Monthly group benefits premium — October 2024');
