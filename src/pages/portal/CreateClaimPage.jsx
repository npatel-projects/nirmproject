import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Select, createListCollection } from '@ark-ui/react/select'
import { Button } from '@mui/material'
import { DynamicSections } from '../../components/DynamicForm'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CheckIcon from '@mui/icons-material/Check'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
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
import { usePersona } from '../../context/PersonaContext'

const SYSTEM_USER_ID = 'e5000000-0000-0000-0000-000000000001'

// ─── Tile definitions ─────────────────────────────────────────────────────────
const TILES = [
  {
    claimType: 'LIFE',
    label: 'Life Insurance Claim',
    description: 'Submit a claim for a group life insurance benefit.',
    icon: FavoriteBorderIcon,
    iconColor: '#be185d', iconBg: '#fdf2f8',
    benefitTypes: ['LIFE'],
  },
  {
    claimType: 'STD',
    label: 'Disability Claim',
    description: 'Short-term or long-term disability income replacement.',
    icon: AccessibilityNewOutlinedIcon,
    iconColor: '#7c3aed', iconBg: '#f5f3ff',
    benefitTypes: ['STD', 'LTD'],
    resolveCT: (benefitType) => benefitType === 'LTD' ? 'LTD' : 'STD',
  },
  {
    claimType: 'ADD',
    label: 'Accidental Death & Dismemberment',
    description: 'Claim for accidents resulting in death or serious injury.',
    icon: HealthAndSafetyOutlinedIcon,
    iconColor: '#b45309', iconBg: '#fffbeb',
    benefitTypes: ['ADD'],
  },
  {
    claimType: 'CI',
    label: 'Critical Illness Claim',
    description: 'Lump-sum benefit for a covered critical illness diagnosis.',
    icon: MonitorHeartOutlinedIcon,
    iconColor: '#dc2626', iconBg: '#fef2f2',
    benefitTypes: ['CI'],
  },
  {
    claimType: 'HEALTH',
    label: 'Medical / Health Claim',
    description: 'Extended health care including paramedical and hospital.',
    icon: LocalHospitalOutlinedIcon,
    iconColor: '#0369a1', iconBg: '#f0f9ff',
    benefitTypes: ['EHC'],
  },
  {
    claimType: 'DENTAL',
    label: 'Dental Claim',
    description: 'Preventive, basic, and major restorative dental expenses.',
    icon: MedicalServicesOutlinedIcon,
    iconColor: '#0891b2', iconBg: '#ecfeff',
    benefitTypes: ['DENTAL'],
  },
  {
    claimType: 'VISION',
    label: 'Vision Claim',
    description: 'Eye exams, glasses, contacts, and laser eye surgery.',
    icon: VisibilityOutlinedIcon,
    iconColor: '#4f46e5', iconBg: '#eef2ff',
    benefitTypes: ['VISION'],
  },
  {
    claimType: 'DRUG',
    label: 'Prescription Drug Claim',
    description: 'Reimbursement for eligible prescription medications.',
    icon: MedicationOutlinedIcon,
    iconColor: '#16a34a', iconBg: '#f0fdf4',
    benefitTypes: ['DRUG'],
  },
  {
    claimType: 'HSA',
    label: 'Health Spending Account',
    description: 'Use your HSA balance for eligible health expenses.',
    icon: AccountBalanceWalletOutlinedIcon,
    iconColor: '#0d9488', iconBg: '#f0fdfa',
    benefitTypes: ['HSA'],
  },
  {
    claimType: 'WSA',
    label: 'Wellness Spending Account',
    description: 'Use your WSA balance for eligible wellness expenses.',
    icon: SpaOutlinedIcon,
    iconColor: '#65a30d', iconBg: '#f7fee7',
    benefitTypes: ['WSA'],
  },
]

function genClaimNumber() {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 90000) + 10000
  return `CLM-${year}-${rand}`
}

// ─── Step 1: type selector grid ───────────────────────────────────────────────
function TypeSelector({ onSelect }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Select the type of claim request</h1>
        <p className="text-sm text-gray-500">
          Please find below the possible types of claim requests. For any other request,
          please contact the ABC Insurance Agent Service.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 mb-8">
        {TILES.map((tile) => {
          const Icon = tile.icon
          return (
            <button
              key={tile.claimType}
              className="group flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl text-left transition-all duration-150 hover:border-blue-400 hover:shadow-md focus:outline-none focus:border-blue-500"
              onClick={() => onSelect(tile)}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: tile.iconBg }}
              >
                <Icon style={{ color: tile.iconColor, fontSize: 20 }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                  {tile.label}
                </p>
                <p className="text-xs text-gray-400 mt-1 leading-snug line-clamp-2">
                  {tile.description}
                </p>
              </div>
              <ChevronRightIcon
                fontSize="small"
                className="text-gray-200 group-hover:text-blue-400 transition-colors shrink-0 mt-0.5"
              />
            </button>
          )
        })}
      </div>

      <p className="text-sm text-gray-400">
        To make any other claim request, please contact your agent.
      </p>
    </div>
  )
}

// ─── Step 2: dynamic claim form ───────────────────────────────────────────────
function ClaimForm({ tile, member, benefits, template, onSubmit, submitting, submitError }) {
  const Icon = tile.icon
  const [values,  setValues]  = useState({})
  const [errors,  setErrors]  = useState({})

  function handleChange(id, val) {
    setValues((v) => ({ ...v, [id]: val }))
    setErrors((e) => ({ ...e, [id]: undefined }))
  }

  function validate() {
    const errs = {}
    if (!values.benefit_id) errs.benefit_id = 'Please select a benefit'

    // Validate all required fields from template sections
    ;(template?.sections ?? []).forEach((section) => {
      section.fields.forEach((field) => {
        if (!field.required) return
        // Respect show_if — skip hidden fields
        if (field.show_if && values[field.show_if.field] !== field.show_if.value) return
        if (!values[field.id] || String(values[field.id]).trim() === '')
          errs[field.id] = `${field.label} is required`
      })
    })
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const selectedBenefit = benefits.find((b) => b.benefit_id === values.benefit_id)
    const claimType = tile.resolveCT
      ? tile.resolveCT(selectedBenefit?.benefit_type)
      : tile.claimType

    // amount_claimed may come from a template field
    const amount = values.amount_claimed ? Number(values.amount_claimed) : null

    // Everything except benefit_id and amount_claimed goes into claim_form_json
    const { benefit_id, amount_claimed, ...formData } = values
    onSubmit({ benefit_id, amount, claimType, formData })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Selected claim type context bar */}
      <div
        className="flex items-center gap-3 p-4 rounded-xl border mb-6"
        style={{ backgroundColor: tile.iconBg, borderColor: `${tile.iconColor}30` }}
      >
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

      <div className="space-y-4">
        {/* Standard fields — always first */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Claimant &amp; Coverage</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Claimant — read-only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Claimant</label>
              <input
                readOnly
                value={member.label}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* Benefit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Benefit <span className="text-red-500">*</span>
              </label>
              {benefits.length === 0 ? (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                  <span className="text-amber-500 text-base leading-none mt-0.5">⚠</span>
                  <p className="text-xs text-amber-700">No active benefits found for this claim type under your plan.</p>
                </div>
              ) : (() => {
                const benefitCollection = createListCollection({
                  items: benefits.map((b) => ({ label: b.benefit_name, value: b.benefit_id })),
                })
                const borderClass = errors.benefit_id ? 'border-red-400' : 'border-gray-300'
                return (
                  <Select.Root
                    collection={benefitCollection}
                    value={values.benefit_id ? [values.benefit_id] : []}
                    onValueChange={({ value: v }) => handleChange('benefit_id', v[0] ?? '')}
                  >
                    <Select.Control>
                      <Select.Trigger
                        className={`flex items-center justify-between gap-2 w-full px-3 py-2 text-sm border ${borderClass} rounded-lg bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:border-blue-400 transition-colors`}
                      >
                        <Select.ValueText placeholder="Select a benefit…" className="text-gray-700 truncate data-[placeholder]:text-gray-400" />
                        <Select.Indicator className="shrink-0">
                          <KeyboardArrowDownIcon fontSize="small" className="text-gray-400" />
                        </Select.Indicator>
                      </Select.Trigger>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-60 overflow-y-auto min-w-[var(--reference-width)]">
                        {benefitCollection.items.map((item) => (
                          <Select.Item
                            key={item.value}
                            item={item}
                            className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none"
                          >
                            <Select.ItemText>{item.label}</Select.ItemText>
                            <Select.ItemIndicator>
                              <CheckIcon style={{ fontSize: 14, color: '#2563eb' }} />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                )
              })()}
              {errors.benefit_id && <p className="text-xs text-red-500 mt-1">{errors.benefit_id}</p>}
            </div>
          </div>
        </div>

        {/* Dynamic template sections */}
        {template
          ? <DynamicSections
              sections={template.sections}
              values={values}
              onChange={handleChange}
              errors={errors}
            />
          : <div className="text-sm text-gray-400 py-4 text-center">No form configuration found for this claim type.</div>
        }

        {/* Submit error */}
        {submitError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-3">
            <span className="text-red-500 text-sm leading-none mt-0.5">✕</span>
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || benefits.length === 0}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              backgroundColor: colors.brandPrimary,
              '&:hover': { backgroundColor: colors.brandPrimaryDark },
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Claim'}
          </Button>
        </div>
      </div>
    </form>
  )
}

// ─── Step 3: success ──────────────────────────────────────────────────────────
function SuccessState({ claimNumber, onViewClaims, onNewClaim }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ backgroundColor: `${colors.brandPrimary}15` }}
      >
        <CheckCircleOutlineIcon style={{ color: colors.brandPrimary, fontSize: 40 }} />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Claim Submitted</h2>
      <p className="text-sm text-gray-500 mb-1">
        Your claim <strong className="text-gray-800">{claimNumber}</strong> has been submitted and is now under review.
      </p>
      <p className="text-xs text-gray-400 mb-8">You will be notified once your claim has been processed.</p>
      <div className="flex gap-3">
        <Button
          variant="outlined"
          sx={{ textTransform: 'none', borderRadius: 2 }}
          onClick={onNewClaim}
        >
          Submit Another Claim
        </Button>
        <Button
          variant="contained"
          sx={{ textTransform: 'none', borderRadius: 2, backgroundColor: colors.brandPrimary, '&:hover': { backgroundColor: colors.brandPrimaryDark } }}
          onClick={onViewClaims}
        >
          View My Claims
        </Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function CreateClaimPage() {
  const navigate = useNavigate()
  const { activeEntity } = usePersona()

  const [step,            setStep]            = useState('type')
  const [selectedTile,    setSelectedTile]    = useState(null)
  const [benefits,        setBenefits]        = useState([])
  const [template,        setTemplate]        = useState(null)
  const [loadingForm,     setLoadingForm]     = useState(false)
  const [submitting,      setSubmitting]      = useState(false)
  const [submitError,     setSubmitError]     = useState(null)
  const [submittedNum,    setSubmittedNum]    = useState(null)

  const memberId = activeEntity?.id

  async function handleSelectTile(tile) {
    setSelectedTile(tile)
    setStep('form')
    setLoadingForm(true)

    // Resolve the DB claim_type for template lookup:
    // For 'STD' tile, fetch 'STD' template (also covers LTD visually)
    const templateClaimType = tile.claimType

    const [memberRes, templateRes] = await Promise.all([
      supabase.from('member').select('plan_id').eq('member_id', memberId).single(),
      supabase
        .from('claim_form_template')
        .select('form_config')
        .eq('claim_type', templateClaimType)
        .eq('is_active', true)
        .is('sponsor_id', null)   // global default
        .single(),
    ])

    // Fetch benefits from member's plan
    let fetchedBenefits = []
    if (memberRes.data?.plan_id) {
      const { data } = await supabase
        .from('benefit')
        .select('benefit_id, benefit_name, benefit_type')
        .eq('plan_id', memberRes.data.plan_id)
        .eq('is_active', true)
        .in('benefit_type', tile.benefitTypes)
      fetchedBenefits = data ?? []
    }

    setBenefits(fetchedBenefits)
    setTemplate(templateRes.data?.form_config ?? null)
    setLoadingForm(false)
  }

  async function handleSubmit({ benefit_id, amount, claimType, formData }) {
    setSubmitting(true)
    setSubmitError(null)
    const claimNumber = genClaimNumber()

    const { error } = await supabase.from('claim').insert({
      member_id:       memberId,
      benefit_id,
      submitted_by:    SYSTEM_USER_ID,
      claim_number:    claimNumber,
      claim_type:      claimType,
      incident_date:   formData.service_date || formData.incident_date || formData.date_of_death || formData.diagnosis_date || formData.disability_start_date || null,
      submission_date: new Date().toISOString().split('T')[0],
      amount_claimed:  amount,
      status:          'SUBMITTED',
      claim_form_json: formData,
    })

    if (error) { setSubmitError(error.message); setSubmitting(false); return }
    setSubmittedNum(claimNumber)
    setStep('success')
    setSubmitting(false)
  }

  function handleNewClaim() {
    setStep('type')
    setSelectedTile(null)
    setBenefits([])
    setTemplate(null)
    setSubmittedNum(null)
    setSubmitError(null)
  }

  function handleBack() {
    if (step === 'form') { setStep('type'); setSelectedTile(null) }
    else navigate('/portal/claims')
  }

  return (
    <div>
      {step !== 'success' && (
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 3, pl: 0 }}
        >
          {step === 'type' ? 'Back to Claims' : 'Back'}
        </Button>
      )}

      {step === 'type' && <TypeSelector onSelect={handleSelectTile} />}

      {step === 'form' && (
        loadingForm
          ? <div className="text-sm text-gray-400 py-16 text-center">Loading form…</div>
          : <ClaimForm
              tile={selectedTile}
              member={activeEntity}
              benefits={benefits}
              template={template}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
            />
      )}

      {step === 'success' && (
        <SuccessState
          claimNumber={submittedNum}
          onViewClaims={() => navigate('/portal/claims')}
          onNewClaim={handleNewClaim}
        />
      )}
    </div>
  )
}
