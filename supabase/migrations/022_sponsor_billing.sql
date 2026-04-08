-- Migration 022: Sponsor billing information table

CREATE TABLE IF NOT EXISTS sponsor_billing (
  sponsor_id            UUID PRIMARY KEY REFERENCES sponsor(sponsor_id) ON DELETE CASCADE,

  -- Billing contact
  billing_contact_name  VARCHAR(200),
  billing_contact_email VARCHAR(200),
  billing_contact_phone VARCHAR(50),

  -- Billing address
  billing_address_line1 VARCHAR(200),
  billing_address_line2 VARCHAR(200),
  billing_city          VARCHAR(100),
  billing_province      VARCHAR(10),
  billing_postal_code   VARCHAR(20),

  -- Payment preferences
  payment_method        VARCHAR(20) DEFAULT 'EFT',      -- EFT | CHEQUE | WIRE
  billing_frequency     VARCHAR(20) DEFAULT 'MONTHLY',  -- MONTHLY | QUARTERLY | ANNUAL
  invoice_email         VARCHAR(200),
  invoice_delivery      VARCHAR(20) DEFAULT 'EMAIL',    -- EMAIL | PORTAL | MAIL
  po_number             VARCHAR(100),

  -- Banking details
  bank_name             VARCHAR(200),
  bank_institution_no   VARCHAR(10),
  bank_transit_no       VARCHAR(10),
  bank_account_no       VARCHAR(30),

  -- Tax
  business_number       VARCHAR(30),  -- GST/HST registration

  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── Seed: ABC Company billing info ────────────────────────────────────────────
INSERT INTO sponsor_billing (
  sponsor_id,
  billing_contact_name, billing_contact_email, billing_contact_phone,
  billing_address_line1, billing_city, billing_province, billing_postal_code,
  payment_method, billing_frequency,
  invoice_email, invoice_delivery,
  bank_name, bank_institution_no, bank_transit_no, bank_account_no,
  business_number
) VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'Jane Smith', 'jane.smith@abccompany.com', '514-555-0100',
  '100 Main Street', 'Montreal', 'QC', 'H1A 1A1',
  'EFT', 'MONTHLY',
  'finance@abccompany.com', 'EMAIL',
  'Royal Bank of Canada', '003', '00123', '1234567',
  '123456789RT0001'
);
