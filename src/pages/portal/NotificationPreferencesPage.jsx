import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { usePersona } from '../../context/PersonaContext'
import { Button } from '@mui/material'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined'
import { colors } from '../../theme'

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed`}
      style={{ backgroundColor: checked ? colors.brandPrimary : '#d1d5db' }}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// ─── Preference row ───────────────────────────────────────────────────────────
function PrefRow({ label, description, emailKey, smsKey, prefs, onChange, saving }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 mr-8">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-8 shrink-0">
        <div className="flex flex-col items-center gap-1">
          <Toggle
            checked={prefs[emailKey] ?? true}
            onChange={(val) => onChange(emailKey, val)}
            disabled={saving}
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Toggle
            checked={prefs[smsKey] ?? false}
            onChange={(val) => onChange(smsKey, val)}
            disabled={saving}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────
function PrefSection({ title, rows, prefs, onChange, saving }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.link }}>
        {title}
      </p>
      {rows.map((row) => (
        <PrefRow key={row.emailKey} {...row} prefs={prefs} onChange={onChange} saving={saving} />
      ))}
    </div>
  )
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_PREFS = {
  email_claim_update:   true,  sms_claim_update:   false,
  email_enrollment:     true,  sms_enrollment:     false,
  email_document:       true,  sms_document:       false,
  email_message:        true,  sms_message:        false,
  email_benefit_change: true,  sms_benefit_change: false,
  email_frequency:      'IMMEDIATE',
}

const SECTIONS = [
  {
    title: 'Claims',
    rows: [{
      label: 'Claim Status Updates',
      description: 'When a claim is received, approved, or requires more information',
      emailKey: 'email_claim_update',
      smsKey:   'sms_claim_update',
    }],
  },
  {
    title: 'Enrollment & Benefits',
    rows: [
      {
        label: 'Enrollment Confirmations',
        description: 'When you are enrolled or your enrollment status changes',
        emailKey: 'email_enrollment',
        smsKey:   'sms_enrollment',
      },
      {
        label: 'Benefit Changes',
        description: 'EOI decisions, coverage updates, and plan changes',
        emailKey: 'email_benefit_change',
        smsKey:   'sms_benefit_change',
      },
    ],
  },
  {
    title: 'Documents',
    rows: [{
      label: 'Document Uploads',
      description: 'When a new document or letter is added to your account',
      emailKey: 'email_document',
      smsKey:   'sms_document',
    }],
  },
  {
    title: 'Messages & Announcements',
    rows: [{
      label: 'Messages',
      description: 'New messages and announcements from your plan administrator',
      emailKey: 'email_message',
      smsKey:   'sms_message',
    }],
  },
]

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NotificationPreferencesPage() {
  const { activeEntity } = usePersona()
  const memberId = activeEntity?.id

  const [prefs, setPrefs]   = useState(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!memberId) { setLoading(false); return }
    async function fetch() {
      const { data } = await supabase
        .from('member_notification_preference')
        .select('*')
        .eq('member_id', memberId)
        .maybeSingle()
      if (data) setPrefs({ ...DEFAULT_PREFS, ...data })
      setLoading(false)
    }
    fetch()
  }, [memberId])

  function handleChange(key, value) {
    setSaved(false)
    setPrefs((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!memberId) return
    setSaving(true)
    setError(null)
    const { error: err } = await supabase
      .from('member_notification_preference')
      .upsert({ ...prefs, member_id: memberId, updated_at: new Date().toISOString() }, { onConflict: 'member_id' })
    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
    }
    setSaving(false)
  }

  if (loading) return <p className="text-sm text-gray-400 py-8">Loading…</p>

  if (!memberId) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        No member selected. Switch to a member account to manage notification preferences.
      </div>
    )
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Notification Preferences</h1>
      <p className="text-sm text-gray-500 mb-5">Choose how and when you receive updates about your benefits.</p>
      <hr className="border-gray-200 mb-6" />

      {/* Channel header */}
      <div className="flex items-center justify-end gap-8 pr-6 mb-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-9 justify-center">
          <EmailOutlinedIcon style={{ fontSize: 14 }} /> Email
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-9 justify-center">
          <SmsOutlinedIcon style={{ fontSize: 14 }} /> SMS
        </div>
      </div>

      {/* Preference sections */}
      {SECTIONS.map((section) => (
        <PrefSection
          key={section.title}
          title={section.title}
          rows={section.rows}
          prefs={prefs}
          onChange={handleChange}
          saving={saving}
        />
      ))}

      {/* Email frequency */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: colors.link }}>
          Email Delivery
        </p>
        <p className="text-sm font-medium text-gray-800 mb-3">Email Frequency</p>
        <div className="flex flex-col gap-2">
          {[
            { value: 'IMMEDIATE', label: 'Immediate', description: 'Send each notification as it happens' },
            { value: 'DAILY',     label: 'Daily Digest', description: 'Bundle all notifications into one daily email' },
            { value: 'WEEKLY',    label: 'Weekly Digest', description: 'Bundle all notifications into one weekly email' },
          ].map((opt) => (
            <label key={opt.value} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="radio"
                name="email_frequency"
                value={opt.value}
                checked={prefs.email_frequency === opt.value}
                onChange={() => handleChange('email_frequency', opt.value)}
                className="mt-0.5 accent-interactive"
                disabled={saving}
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                <p className="text-xs text-gray-400">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Save */}
      {error && <p className="text-sm text-red-600 mb-3">Error: {error}</p>}
      {saved && <p className="text-sm font-medium mb-3" style={{ color: colors.brandPrimary }}>✓ Preferences saved.</p>}
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={saving}
        style={{ backgroundColor: colors.brandPrimary }}
      >
        {saving ? 'SAVING…' : 'SAVE PREFERENCES'}
      </Button>
    </div>
  )
}
