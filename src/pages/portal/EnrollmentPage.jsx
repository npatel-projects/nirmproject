import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePersona } from '../../context/PersonaContext'
import { Select, createListCollection } from '@ark-ui/react/select'
import { RadioGroup } from '@ark-ui/react/radio-group'
import { Button, Chip } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CheckIcon from '@mui/icons-material/Check'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { colors } from '../../theme'

// Options can be plain strings or { value, label } objects — normalise to { value, label }
function normalizeOptions(options = []) {
  return options.map((o) => typeof o === 'string' ? { value: o, label: o } : o)
}

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

// ─── Individual field renderer ────────────────────────────────────────────────
function FormField({ field, value, onChange, error }) {
  const inputClass = `w-full px-3 py-2 text-sm border rounded focus:outline-none transition-colors ${
    error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'
  }`
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  const label = (
    <label className={labelClass} htmlFor={field.id}>
      {field.label}
      {field.required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )

  let control = null

  if (field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'number') {
    control = (
      <input
        id={field.id}
        type={field.type === 'phone' ? 'tel' : field.type}
        value={value ?? ''}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder={field.placeholder ?? ''}
        className={inputClass}
      />
    )
  } else if (field.type === 'date') {
    control = (
      <input
        id={field.id}
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(field.id, e.target.value)}
        className={inputClass}
      />
    )
  } else if (field.type === 'textarea') {
    control = (
      <textarea
        id={field.id}
        value={value ?? ''}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder={field.placeholder ?? ''}
        rows={3}
        className={`${inputClass} resize-none`}
      />
    )
  } else if (field.type === 'select') {
    const opts = normalizeOptions(field.options)
    const collection = createListCollection({ items: opts, itemToValue: (o) => o.value, itemToString: (o) => o.label })
    const selectedLabel = opts.find((o) => o.value === (value ?? ''))?.label ?? 'Select...'
    control = (
      <Select.Root
        collection={collection}
        value={value ? [value] : []}
        onValueChange={({ value: v }) => onChange(field.id, v[0] ?? '')}
      >
        <Select.Control>
          <Select.Trigger
            className={`${inputClass} flex items-center justify-between cursor-pointer bg-white`}
          >
            <Select.ValueText placeholder="Select...">
              {selectedLabel}
            </Select.ValueText>
            <KeyboardArrowDownIcon style={{ fontSize: '1.1rem', color: '#6b7280' }} />
          </Select.Trigger>
        </Select.Control>
        <Select.Positioner style={{ zIndex: 50 }}>
          <Select.Content className="bg-white border border-gray-200 rounded shadow-lg py-1 min-w-[160px]">
            {opts.map((opt) => (
              <Select.Item
                key={opt.value}
                item={opt}
                className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <CheckIcon style={{ fontSize: '0.9rem', color: '#15803d' }} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>
    )
  } else if (field.type === 'radio') {
    const opts = normalizeOptions(field.options)
    control = (
      <RadioGroup.Root
        value={value ?? ''}
        onValueChange={({ value: v }) => onChange(field.id, v)}
        className="flex flex-wrap gap-3 mt-1"
      >
        {opts.map((opt) => (
          <RadioGroup.Item key={opt.value} value={opt.value} className="flex items-center gap-2 cursor-pointer">
            <RadioGroup.ItemControl className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center data-[state=checked]:border-green-700 data-[state=checked]:bg-green-700" />
            <RadioGroup.ItemText className="text-sm text-gray-700">{opt.label}</RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    )
  } else if (field.type === 'checkbox') {
    return (
      <div className="flex items-start gap-3">
        <input
          id={field.id}
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(field.id, e.target.checked)}
          className="mt-0.5 accent-green-700 shrink-0"
        />
        <label htmlFor={field.id} className="text-sm text-gray-700 cursor-pointer leading-snug">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div>
      {label}
      {control}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
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

// ─── Submitted confirmation ───────────────────────────────────────────────────
function SubmittedState({ emp, onBack }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
      <CheckCircleOutlineIcon style={{ fontSize: '3rem', color: colors.brandPrimary }} />
      <h2 className="text-xl font-bold text-gray-900 mt-4">Enrollment Submitted</h2>
      <p className="text-sm text-gray-500 mt-2">
        The enrollment form for <strong>{emp.first_name} {emp.last_name}</strong> has been submitted
        and is pending review.
      </p>
      <div className="mt-6">
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
  const [submitted, setSubmitted]     = useState(false)

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

  function handleSubmit() {
    if (!validateSection()) return
    // UI only — no backend write yet
    setSubmitted(true)
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

      {submitted ? (
        <SubmittedState emp={emp} onBack={() => navigate('/portal/members')} />
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
                endIcon={<CheckCircleOutlineIcon />}
                onClick={handleSubmit}
              >
                SUBMIT ENROLLMENT
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
