import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Button, Chip } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import { colors } from '../../theme'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(val) {
  if (val == null) return '—'
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val)
}

const CLAIM_TYPE_LABELS = {
  LIFE:    'Life Insurance',
  ADD:     'Accidental Death & Dismemberment',
  STD:     'Short Term Disability',
  LTD:     'Long Term Disability',
  CI:      'Critical Illness',
  HEALTH:  'Medical',
  DENTAL:  'Dental',
  VISION:  'Vision',
  DRUG:    'Prescription Drug',
  HSA:     'Health Spending Account',
  WSA:     'Wellness Spending Account',
}

// ─── Status chip ──────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const map = {
    DRAFT:              { label: 'Draft',      borderColor: '#9ca3af', color: '#6b7280' },
    SUBMITTED:          { label: 'Pending',    borderColor: '#d97706', color: '#d97706' },
    IN_REVIEW:          { label: 'In Review',  borderColor: colors.link, color: colors.link },
    APPEALED:           { label: 'Appealed',   borderColor: '#7c3aed', color: '#7c3aed' },
    APPROVED:           { label: 'Approved',   borderColor: '#16a34a', color: '#16a34a' },
    PARTIALLY_APPROVED: { label: 'Partial',    borderColor: '#d97706', color: '#d97706' },
    DECLINED:           { label: 'Declined',   borderColor: '#dc2626', color: '#dc2626' },
    CLOSED:             { label: 'Closed',     borderColor: '#9ca3af', color: '#6b7280' },
  }
  const cfg = map[status] ?? { label: status, borderColor: '#9ca3af', color: '#6b7280' }
  return (
    <Chip
      label={cfg.label}
      size="small"
      variant="outlined"
      sx={{
        fontSize: 12,
        height: 24,
        fontWeight: 600,
        borderColor: cfg.borderColor,
        color: cfg.color,
      }}
    />
  )
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0 gap-1">
      <span className="text-sm text-gray-500 sm:w-48 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value ?? '—'}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ClaimDetailPage() {
  const { claimId } = useParams()
  const navigate    = useNavigate()

  const [claim,   setClaim]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function fetchClaim() {
      const { data, error: err } = await supabase
        .from('claim')
        .select(`
          claim_id, claim_number, claim_type, status,
          incident_date, submission_date, paid_date,
          amount_claimed, approved_amount, paid_amount, decline_reason,
          payment_method, pas_claim_ref,
          member(
            member_number,
            employee(first_name, last_name)
          ),
          benefit(benefit_name, benefit_type)
        `)
        .eq('claim_id', claimId)
        .single()

      if (err) setError(err.message)
      else setClaim(data)
      setLoading(false)
    }
    fetchClaim()
  }, [claimId])

  if (loading) return <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
  if (error)   return <div className="text-sm text-red-500 py-4">Error: {error}</div>
  if (!claim)  return <div className="text-sm text-gray-400 py-4">Claim not found.</div>

  const memberName = claim.member?.employee
    ? `${claim.member.employee.first_name} ${claim.member.employee.last_name}`
    : '—'

  const isCompleted = ['APPROVED', 'PARTIALLY_APPROVED', 'DECLINED', 'CLOSED'].includes(claim.status)

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <button
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        onClick={() => navigate('/portal/claims')}
      >
        <ArrowBackIcon fontSize="small" />
        Back to Claims
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${colors.brandPrimary}15` }}
          >
            <DescriptionOutlinedIcon style={{ color: colors.brandPrimary, fontSize: 22 }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{claim.claim_number}</h1>
            <p className="text-sm text-gray-500">{CLAIM_TYPE_LABELS[claim.claim_type] ?? claim.claim_type}</p>
          </div>
        </div>
        <StatusChip status={claim.status} />
      </div>

      {/* Claim details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Claim Information</h2>
        <InfoRow label="Claim Number"   value={claim.claim_number} />
        <InfoRow label="Member"         value={`${memberName} (${claim.member?.member_number ?? '—'})`} />
        <InfoRow label="Benefit"        value={claim.benefit?.benefit_name} />
        <InfoRow label="Claim Type"     value={CLAIM_TYPE_LABELS[claim.claim_type] ?? claim.claim_type} />
        <InfoRow label="Incident Date"  value={formatDate(claim.incident_date)} />
        <InfoRow label="Submitted"      value={formatDate(claim.submission_date)} />
        {claim.pas_claim_ref && <InfoRow label="Reference #" value={claim.pas_claim_ref} />}
      </div>

      {/* Financials */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Financials</h2>
        <InfoRow label="Amount Claimed"  value={formatCurrency(claim.amount_claimed)} />
        <InfoRow label="Approved Amount" value={formatCurrency(claim.approved_amount)} />
        <InfoRow label="Amount Paid"     value={formatCurrency(claim.paid_amount)} />
        {claim.paid_date && <InfoRow label="Paid Date"     value={formatDate(claim.paid_date)} />}
        {claim.payment_method && <InfoRow label="Payment Method" value={claim.payment_method} />}
      </div>

      {/* Decline reason */}
      {claim.status === 'DECLINED' && claim.decline_reason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <p className="text-sm font-semibold text-red-700 mb-1">Decline Reason</p>
          <p className="text-sm text-red-600">{claim.decline_reason}</p>
        </div>
      )}

      {/* Actions */}
      {isCompleted && (
        <div className="flex gap-3">
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none' }}
            onClick={() => {/* TODO: download statement */}}
          >
            Download Statement
          </Button>
        </div>
      )}
    </div>
  )
}
