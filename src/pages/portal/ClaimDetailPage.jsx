import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Button, Chip } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined'
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined'
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined'
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined'
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined'
import { colors } from '../../theme'

// ─── Tile metadata (mirrors CreateClaimPage TILES) ────────────────────────────
const TILE_META = {
  LIFE:   { label: 'Life Insurance Claim',             description: 'Submit a claim for a group life insurance benefit.',                icon: FavoriteBorderIcon,               iconColor: '#be185d', iconBg: '#fdf2f8' },
  STD:    { label: 'Disability Claim',                 description: 'Short-term or long-term disability income replacement.',            icon: AccessibilityNewOutlinedIcon,     iconColor: '#7c3aed', iconBg: '#f5f3ff' },
  LTD:    { label: 'Disability Claim',                 description: 'Short-term or long-term disability income replacement.',            icon: AccessibilityNewOutlinedIcon,     iconColor: '#7c3aed', iconBg: '#f5f3ff' },
  ADD:    { label: 'Accidental Death & Dismemberment', description: 'Claim for accidents resulting in death or serious injury.',         icon: HealthAndSafetyOutlinedIcon,      iconColor: '#b45309', iconBg: '#fffbeb' },
  CI:     { label: 'Critical Illness Claim',           description: 'Lump-sum benefit for a covered critical illness diagnosis.',        icon: MonitorHeartOutlinedIcon,         iconColor: '#dc2626', iconBg: '#fef2f2' },
  HEALTH: { label: 'Medical / Health Claim',           description: 'Extended health care including paramedical and hospital.',          icon: LocalHospitalOutlinedIcon,        iconColor: '#0369a1', iconBg: '#f0f9ff' },
  DENTAL: { label: 'Dental Claim',                     description: 'Preventive, basic, and major restorative dental expenses.',         icon: MedicalServicesOutlinedIcon,      iconColor: '#0891b2', iconBg: '#ecfeff' },
  VISION: { label: 'Vision Claim',                     description: 'Eye exams, glasses, contacts, and laser eye surgery.',              icon: VisibilityOutlinedIcon,           iconColor: '#4f46e5', iconBg: '#eef2ff' },
  DRUG:   { label: 'Prescription Drug Claim',          description: 'Reimbursement for eligible prescription medications.',              icon: MedicationOutlinedIcon,           iconColor: '#16a34a', iconBg: '#f0fdf4' },
  HSA:    { label: 'Health Spending Account',          description: 'Use your HSA balance for eligible health expenses.',                icon: AccountBalanceWalletOutlinedIcon, iconColor: '#0d9488', iconBg: '#f0fdfa' },
  WSA:    { label: 'Wellness Spending Account',        description: 'Use your WSA balance for eligible wellness expenses.',              icon: SpaOutlinedIcon,                  iconColor: '#65a30d', iconBg: '#f7fee7' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(val) {
  if (val == null || val === '') return '—'
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val)
}

// ─── Status chip ──────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const map = {
    DRAFT:              { label: 'Draft',    borderColor: '#9ca3af', color: '#6b7280' },
    SUBMITTED:          { label: 'Pending',  borderColor: '#d97706', color: '#d97706' },
    IN_REVIEW:          { label: 'In Review',borderColor: '#2563eb', color: '#2563eb' },
    APPEALED:           { label: 'Appealed', borderColor: '#7c3aed', color: '#7c3aed' },
    APPROVED:           { label: 'Approved', borderColor: '#16a34a', color: '#16a34a' },
    PARTIALLY_APPROVED: { label: 'Partial',  borderColor: '#d97706', color: '#d97706' },
    DECLINED:           { label: 'Declined', borderColor: '#dc2626', color: '#dc2626' },
    CLOSED:             { label: 'Closed',   borderColor: '#9ca3af', color: '#6b7280' },
  }
  const cfg = map[status] ?? { label: status, borderColor: '#9ca3af', color: '#6b7280' }
  return (
    <Chip
      label={cfg.label}
      size="small"
      variant="outlined"
      sx={{ fontSize: 12, height: 24, fontWeight: 600, borderColor: cfg.borderColor, color: cfg.color }}
    />
  )
}

// ─── Read-only field ──────────────────────────────────────────────────────────
function ReadOnlyField({ field, value }) {
  let display = value || '—'

  if (field.type === 'select' || field.type === 'radio') {
    const opt = (field.options ?? []).find((o) => o.value === value)
    display = opt?.label ?? value ?? '—'
  } else if (field.type === 'number') {
    display = value ? formatCurrency(value) : '—'
  } else if (field.type === 'date') {
    display = formatDate(value)
  } else if (field.type === 'checkbox') {
    display = value === true || value === 'true' ? 'Yes' : 'No'
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{field.label}</p>
      <p className="text-sm text-gray-900">{display}</p>
    </div>
  )
}

// ─── Read-only sections (mirrors DynamicSections) ─────────────────────────────
function ReadOnlySections({ sections, values }) {
  return sections.map((section) => {
    const visible = section.fields.filter((f) => {
      if (!f.show_if) return true
      return values[f.show_if.field] === f.show_if.value
    })
    if (visible.length === 0) return null

    return (
      <div key={section.id} className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">{section.title}</h3>
        {section.description && (
          <p className="text-xs text-gray-400 mb-4">{section.description}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          {visible.map((field) => {
            const wide = field.type === 'textarea' || field.type === 'radio' || field.type === 'checkbox'
            return (
              <div key={field.id} className={wide ? 'col-span-full' : ''}>
                <ReadOnlyField field={field} value={values[field.id]} />
              </div>
            )
          })}
        </div>
      </div>
    )
  })
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ClaimDetailPage() {
  const { claimId } = useParams()
  const navigate    = useNavigate()

  const [claim,    setClaim]    = useState(null)
  const [template, setTemplate] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    async function fetchData() {
      const { data: claimData, error: claimErr } = await supabase
        .from('claim')
        .select(`
          claim_id, claim_number, claim_type, status,
          incident_date, submission_date, paid_date,
          amount_claimed, approved_amount, paid_amount,
          decline_reason, payment_method, pas_claim_ref,
          claim_form_json,
          member(
            member_number,
            employee(first_name, last_name)
          ),
          benefit(benefit_name, benefit_type)
        `)
        .eq('claim_id', claimId)
        .single()

      if (claimErr) { setError(claimErr.message); setLoading(false); return }

      // Fetch form template for this claim type
      const templateClaimType = ['LTD'].includes(claimData.claim_type) ? 'STD' : claimData.claim_type
      const { data: tplData } = await supabase
        .from('claim_form_template')
        .select('form_config')
        .eq('claim_type', templateClaimType)
        .eq('is_active', true)
        .is('sponsor_id', null)
        .single()

      setClaim(claimData)
      setTemplate(tplData?.form_config ?? null)
      setLoading(false)
    }
    fetchData()
  }, [claimId])

  if (loading) return <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
  if (error)   return <div className="text-sm text-red-500 py-4">Error: {error}</div>
  if (!claim)  return <div className="text-sm text-gray-400 py-4">Claim not found.</div>

  const tile       = TILE_META[claim.claim_type] ?? TILE_META.HEALTH
  const Icon       = tile.icon
  const formValues = claim.claim_form_json ?? {}
  const memberName = claim.member?.employee
    ? `${claim.member.employee.first_name} ${claim.member.employee.last_name}`
    : '—'
  const isCompleted = ['APPROVED', 'PARTIALLY_APPROVED', 'DECLINED', 'CLOSED'].includes(claim.status)

  return (
    <div>
      {/* Back */}
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/portal/claims')}
        sx={{ mb: 3, pl: 0 }}
      >
        Back to Claims
      </Button>

      {/* Claim type context bar — same as create form */}
      <div
        className="flex items-center justify-between gap-3 p-4 rounded-xl border mb-6"
        style={{ backgroundColor: tile.iconBg, borderColor: `${tile.iconColor}30` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${tile.iconColor}20` }}
          >
            <Icon style={{ color: tile.iconColor, fontSize: 18 }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{tile.label}</p>
            <p className="text-xs text-gray-500">{tile.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {claim.claim_number && (
            <span className="text-xs text-gray-500 hidden sm:block">{claim.claim_number}</span>
          )}
          <StatusChip status={claim.status} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Claimant & Coverage — read-only */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Claimant &amp; Coverage</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Claimant</p>
              <p className="text-sm text-gray-900">
                {memberName}
                {claim.member?.member_number && (
                  <span className="text-gray-400 ml-1">({claim.member.member_number})</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Benefit</p>
              <p className="text-sm text-gray-900">{claim.benefit?.benefit_name ?? '—'}</p>
            </div>
            {claim.submission_date && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Submission Date</p>
                <p className="text-sm text-gray-900">{formatDate(claim.submission_date)}</p>
              </div>
            )}
            {claim.pas_claim_ref && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Reference #</p>
                <p className="text-sm text-gray-900">{claim.pas_claim_ref}</p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic template sections — read-only */}
        {template
          ? <ReadOnlySections sections={template.sections} values={formValues} />
          : (
            <div className="text-sm text-gray-400 py-4 text-center">
              No form configuration found for this claim type.
            </div>
          )
        }

        {/* Financials — only for completed claims */}
        {isCompleted && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Financials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Amount Claimed</p>
                <p className="text-sm text-gray-900">{formatCurrency(claim.amount_claimed)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Approved Amount</p>
                <p className="text-sm text-gray-900">{formatCurrency(claim.approved_amount)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Amount Paid</p>
                <p className="text-sm text-gray-900">{formatCurrency(claim.paid_amount)}</p>
              </div>
              {claim.paid_date && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Paid Date</p>
                  <p className="text-sm text-gray-900">{formatDate(claim.paid_date)}</p>
                </div>
              )}
              {claim.payment_method && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Payment Method</p>
                  <p className="text-sm text-gray-900">{claim.payment_method}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Decline reason */}
        {claim.status === 'DECLINED' && claim.decline_reason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-red-700 mb-1">Decline Reason</p>
            <p className="text-sm text-red-600">{claim.decline_reason}</p>
          </div>
        )}

        {/* Actions */}
        {isCompleted && (
          <div className="flex gap-3 pt-2">
            <Button variant="outlined" onClick={() => {/* TODO: download statement */}}>
              Download Statement
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
