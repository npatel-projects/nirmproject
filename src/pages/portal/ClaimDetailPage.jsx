import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import StatusChip from '../../components/StatusChip'
import { ReadOnlyField, ReadOnlySections } from '../../components/ReadOnlyForm'
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
