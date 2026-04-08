-- Migration 024: Member notification preferences

CREATE TABLE IF NOT EXISTS member_notification_preference (
  member_id         UUID PRIMARY KEY REFERENCES member(member_id) ON DELETE CASCADE,

  -- Claims
  email_claim_update       BOOLEAN NOT NULL DEFAULT TRUE,
  sms_claim_update         BOOLEAN NOT NULL DEFAULT FALSE,

  -- Enrollment
  email_enrollment         BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enrollment           BOOLEAN NOT NULL DEFAULT FALSE,

  -- Documents
  email_document           BOOLEAN NOT NULL DEFAULT TRUE,
  sms_document             BOOLEAN NOT NULL DEFAULT FALSE,

  -- Messages / announcements
  email_message            BOOLEAN NOT NULL DEFAULT TRUE,
  sms_message              BOOLEAN NOT NULL DEFAULT FALSE,

  -- EOI / benefit changes
  email_benefit_change     BOOLEAN NOT NULL DEFAULT TRUE,
  sms_benefit_change       BOOLEAN NOT NULL DEFAULT FALSE,

  -- Digest vs immediate
  email_frequency          VARCHAR(20) NOT NULL DEFAULT 'IMMEDIATE', -- IMMEDIATE | DAILY | WEEKLY

  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Seed: active members ──────────────────────────────────────────────────────
INSERT INTO member_notification_preference (member_id)
SELECT member_id FROM member WHERE member_status = 'ACTIVE'
ON CONFLICT (member_id) DO NOTHING;
