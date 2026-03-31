import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePersona } from '../../context/PersonaContext'
import { Button, Chip } from '@mui/material'
import { FormField } from '../../components/DynamicForm'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined'
import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { CircularProgress } from '@mui/material'
import { colors } from '../../theme'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// Map DB field names to prefill keys defined in the form config
function buildPrefill(emp) {
  return {
    first_name:          emp.first_name ?? '',
    last_name:           emp.last_name ?? '',
    date_of_birth:       emp.date_of_birth ?? '',
    email:               emp.email ?? '',
    phone_mobile:        emp.phone_mobile ?? '',
    province_state_code: emp.province_state_code ?? '',
  }
}

// ─── Section renderer ─────────────────────────────────────────────────────────
function FormSection({ section, values, onChange, errors }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-5">
      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-6">
        {section.title}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
        {section.fields.map((field) => {
          // Conditional visibility
          if (field.show_if) {
            const depValue = values[field.show_if.field]
            if (depValue !== field.show_if.value) return null
          }

          // Checkboxes and textareas span full width
          const fullWidth = field.type === 'checkbox' || field.type === 'textarea' || field.type === 'radio'

          return (
            <div key={field.id} className={fullWidth ? 'md:col-span-2' : ''}>
              <FormField
                field={field}
                value={values[field.id]}
                onChange={onChange}
                error={errors[field.id]}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ sections, currentStep }) {
  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto">
      {sections.map((section, i) => {
        const isDone    = i < currentStep
        const isActive  = i === currentStep
        return (
          <div key={section.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0"
                style={{
                  borderColor: isDone || isActive ? colors.brandPrimary : '#d1d5db',
                  backgroundColor: isDone ? colors.brandPrimary : isActive ? '#f0fdf4' : '#fff',
                  color: isDone ? '#fff' : isActive ? colors.brandPrimary : '#9ca3af',
                }}
              >
                {isDone ? '✓' : i + 1}
              </div>
              <span
                className="text-xs mt-1 whitespace-nowrap hidden md:block"
                style={{ color: isActive ? colors.brandPrimary : isDone ? '#374151' : '#9ca3af', fontWeight: isActive ? 600 : 400 }}
              >
                {section.title}
              </span>
            </div>
            {i < sections.length - 1 && (
              <div
                className="h-0.5 w-8 md:w-16 mx-1 shrink-0 mt-0 md:-mt-4"
                style={{ backgroundColor: isDone ? colors.brandPrimary : '#e5e7eb' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── PAS result screen ────────────────────────────────────────────────────────
const PAS_RESULT_CFG = {
  ENROLLED: {
    Icon:    CheckCircleOutlineIcon,
    color:   '#15803d',
    bg:      '#f0fdf4',
    border:  '#bbf7d0',
    heading: 'Enrollment Approved',
    detail:  (r) => `Member number ${r.member_number} has been created and coverage is now active.`,
  },
  PENDING_REVIEW: {
    Icon:    PendingOutlinedIcon,
    color:   '#854d0e',
    bg:      '#fefce8',
    border:  '#fde68a',
    heading: 'Pending Underwriting Review',
    detail:  () => 'Your enrollment has been received and is under manual review. You will be notified once a decision has been made.',
  },
  PENDING_EOI: {
    Icon:    AssignmentLateOutlinedIcon,
    color:   '#1d4ed8',
    bg:      '#eff6ff',
    border:  '#bfdbfe',
    heading: 'Evidence of Insurability Required',
    detail:  () => 'Your enrollment is on hold pending receipt of Evidence of Insurability (EOI) documentation.',
  },
  INELIGIBLE: {
    Icon:    BlockOutlinedIcon,
    color:   '#b91c1c',
    bg:      '#fef2f2',
    border:  '#fecaca',
    heading: 'Enrollment Ineligible',
    detail:  () => 'This enrollment could not be processed. Please contact your Plan Administrator for assistance.',
  },
  ERROR: {
    Icon:    ErrorOutlineIcon,
    color:   '#6b7280',
    bg:      '#f9fafb',
    border:  '#e5e7eb',
    heading: 'Submission Error',
    detail:  () => 'An error occurred while processing your enrollment. Please try again or contact support.',
  },
}

function PasResultState({ emp, result, onBack }) {
  const cfg = PAS_RESULT_CFG[result.status] ?? PAS_RESULT_CFG.ERROR
  const { Icon } = cfg

  return (
    <div
      className="rounded-xl p-10 text-center"
      style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <Icon style={{ fontSize: '3rem', color: cfg.color }} />
      <h2 className="text-xl font-bold text-gray-900 mt-4">{cfg.heading}</h2>
      <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
        {result.reason ?? cfg.detail(result)}
      </p>

      {/* Meta row */}
      <div className="flex items-center justify-center gap-6 mt-5 text-xs text-gray-400">
        {result.pas_ref && <span>Ref: <strong className="text-gray-600">{result.pas_ref}</strong></span>}
        {result.member_number && <span>Member #: <strong className="text-gray-600">{result.member_number}</strong></span>}
        {result.mock && (
          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">
            MOCK PAS
          </span>
        )}
      </div>

      <div className="mt-8">
        <Button variant="contained" onClick={onBack}>
          BACK TO MEMBERS
        </Button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function EnrollmentPage() {
  const { employeeId } = useParams()
  const navigate = useNavigate()
  const { sponsorId } = usePersona()

  const [emp, setEmp]           = useState(null)
  const [template, setTemplate] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(0)
  const [values, setValues]           = useState({})
  const [errors, setErrors]           = useState({})
  const [submitting, setSubmitting]   = useState(false)
  const [pasResult, setPasResult]     = useState(null)   // EnrollmentResult from Edge Function

  useEffect(() => {
    async function fetchData() {
      const [empRes, tplRes] = await Promise.all([
        supabase
          .from('employee')
          .select(`
            employee_id, external_hr_id, first_name, last_name, date_of_birth,
            email, phone_mobile, province_state_code,
            member ( member_status )
          `)
          .eq('employee_id', employeeId)
          .single(),
        supabase
          .from('enrollment_form_template')
          .select('form_config')
          .eq('sponsor_id', sponsorId)
          .eq('is_active', true)
          .is('plan_id', null)
          .single(),
      ])

      if (empRes.error)  { setError(empRes.error.message);  setLoading(false); return }
      if (tplRes.error)  { setError(tplRes.error.message);  setLoading(false); return }

      const emp = empRes.data
      setEmp(emp)
      setTemplate(tplRes.data.form_config)

      // Pre-fill known values from employee record
      setValues(buildPrefill(emp))
      setLoading(false)
    }
    fetchData()
  }, [employeeId])

  if (loading) return <p className="text-sm text-gray-400">Loading enrollment form...</p>
  if (error)   return <p className="text-sm text-red-500">Error: {error}</p>
  if (!emp || !template) return <p className="text-sm text-gray-400">Form not available.</p>

  const isEnrolled  = emp.member?.some((m) => m.member_status === 'ACTIVE') ?? false
  const sections    = template.sections ?? []
  const section     = sections[currentStep]
  const isLastStep  = currentStep === sections.length - 1

  // ─── Field change handler ────────────────────────────────────────────────
  function handleChange(fieldId, value) {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
    setErrors((prev) => ({ ...prev, [fieldId]: undefined }))
  }

  // ─── Validate current section ────────────────────────────────────────────
  function validateSection() {
    const newErrors = {}
    for (const field of section.fields) {
      // Skip hidden conditional fields
      if (field.show_if) {
        const depValue = values[field.show_if.field]
        if (depValue !== field.show_if.value) continue
      }
      if (!field.required) continue

      const val = values[field.id]
      if (val === undefined || val === null || val === '' || val === false) {
        newErrors[field.id] = 'This field is required.'
      } else if (field.pattern) {
        const re = new RegExp(field.pattern)
        if (!re.test(val)) newErrors[field.id] = field.pattern_message ?? 'Invalid format.'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleNext() {
    if (!validateSection()) return
    setCurrentStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBack() {
    setCurrentStep((s) => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    if (!validateSection()) return
    setSubmitting(true)

    // Fetch the plan assignment to get plan_id
    const { data: assignment } = await supabase
      .from('employee_plan_assignment')
      .select('plan_id')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const planId = assignment?.plan_id

    if (!planId) {
      setPasResult({
        status: 'ERROR',
        reason: 'No plan assignment found for this employee. Please contact your Plan Administrator.',
        mock: true,
      })
      setSubmitting(false)
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke('pas-enrollment-adapter', {
        body: {
          employee_id:  employeeId,
          sponsor_id:   sponsorId,
          plan_id:      planId,
          form_data:    values,
          submitted_by: 'portal',
        },
      })

      if (error) throw error
      setPasResult(data)
    } catch (err) {
      setPasResult({
        status: 'ERROR',
        reason: `Failed to reach the enrollment service. Please try again. (${err?.message ?? 'unknown error'})`,
        mock: true,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      {/* Back nav */}
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/portal/members/${employeeId}`)}
        sx={{ mb: 1, pl: 0 }}
      >
        Back to Employee
      </Button>

      {/* Employee header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">
            {emp.first_name} {emp.last_name}
          </h1>
          <Chip
            label={isEnrolled ? 'ENROLLED' : 'NOT ENROLLED'}
            size="small"
            variant="outlined"
            sx={{
              borderColor: isEnrolled ? colors.brandPrimary : '#9ca3af',
              color: isEnrolled ? colors.brandPrimary : '#6b7280',
              fontWeight: 600,
              fontSize: '0.65rem',
              letterSpacing: '0.05em',
            }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-0.5">{emp.external_hr_id}</p>
      </div>

      <hr className="border-gray-200 mb-6" />

      <h2 className="text-lg font-semibold text-gray-900 mb-6">Enrollment Form</h2>

      {pasResult ? (
        <PasResultState emp={emp} result={pasResult} onBack={() => navigate('/portal/members')} />
      ) : (
        <>
          {/* Step indicator */}
          <StepIndicator sections={sections} currentStep={currentStep} />

          {/* Current section */}
          <FormSection
            section={section}
            values={values}
            onChange={handleChange}
            errors={errors}
          />

          {/* Navigation buttons */}
          <div className="flex justify-between mt-2">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              PREVIOUS
            </Button>

            {isLastStep ? (
              <Button
                variant="contained"
                endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineIcon />}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'SUBMITTING…' : 'SUBMIT ENROLLMENT'}
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
              >
                NEXT
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
