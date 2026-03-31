import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePersona } from '../../context/PersonaContext'
import { Select, createListCollection } from '@ark-ui/react/select'
import { DynamicSections } from '../../components/DynamicForm'
import { Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CheckIcon from '@mui/icons-material/Check'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import { colors } from '../../theme'

const SYSTEM_USER_ID = 'e5000000-0000-0000-0000-000000000001'

// ─── Request type tile definitions ───────────────────────────────────────────
const TILES = [
  {
    requestType: 'BENEFICIARY_CHANGE',
    label:       'Beneficiary Change',
    description: 'Update or designate a beneficiary for your life or AD&D benefit.',
    icon:        PeopleOutlinedIcon,
    iconColor:   '#7c3aed', iconBg: '#f5f3ff',
  },
  {
    requestType: 'ADD_DEPENDENT',
    label:       'Add a Dependent',
    description: 'Add a spouse, common-law partner, or child to your coverage.',
    icon:        PersonAddOutlinedIcon,
    iconColor:   '#16a34a', iconBg: '#f0fdf4',
  },
  {
    requestType: 'REMOVE_DEPENDENT',
    label:       'Remove a Dependent',
    description: 'Remove a dependent who is no longer eligible for coverage.',
    icon:        PersonRemoveOutlinedIcon,
    iconColor:   '#dc2626', iconBg: '#fef2f2',
  },
  {
    requestType: 'LIFE_EVENT',
    label:       'Report a Life Event',
    description: 'Report a marriage, birth, divorce, or other qualifying event.',
    icon:        EventNoteOutlinedIcon,
    iconColor:   '#0891b2', iconBg: '#ecfeff',
  },
  {
    requestType: 'COVERAGE_CHANGE',
    label:       'Change Coverage',
    description: 'Request a change to your current benefit coverage level.',
    icon:        TuneOutlinedIcon,
    iconColor:   '#d97706', iconBg: '#fffbeb',
  },
]

function genRequestNumber() {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 90000) + 10000
  return `CHG-${year}-${rand}`
}

// ─── Step 1 (sponsor only): pick a member ────────────────────────────────────
function MemberStep({ employees, onNext }) {
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [error, setError] = useState(null)

  const collection = createListCollection({
    items: employees.map((e) => ({ label: `${e.first_name} ${e.last_name}`, value: e.employee_id })),
  })

  function handleNext() {
    if (!selectedEmpId) { setError('Please select a member to continue'); return }
    onNext(selectedEmpId)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Select a member</h1>
        <p className="text-sm text-gray-500">
          Choose the member you are submitting this change request on behalf of.
        </p>
      </div>

      <div className="max-w-md space-y-4">
        <div>
          <Select.Root
            collection={collection}
            value={selectedEmpId ? [selectedEmpId] : []}
            onValueChange={({ value: v }) => { setSelectedEmpId(v[0] ?? ''); setError(null) }}
          >
            <Select.Control>
              <Select.Trigger
                className={`flex items-center justify-between gap-2 w-full px-3 py-2 text-sm border ${
                  error ? 'border-red-400' : 'border-gray-300'
                } rounded-lg bg-white cursor-pointer hover:border-gray-400 focus:outline-none transition-colors`}
              >
                <Select.ValueText placeholder="Select a member…" className="text-gray-700 truncate data-[placeholder]:text-gray-400" />
                <Select.Indicator className="shrink-0">
                  <KeyboardArrowDownIcon fontSize="small" className="text-gray-400" />
                </Select.Indicator>
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
              <Select.Content className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-60 overflow-y-auto min-w-[var(--reference-width)]">
                {collection.items.map((item) => (
                  <Select.Item key={item.value} item={item} className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none">
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator><CheckIcon style={{ fontSize: 14, color: '#2563eb' }} /></Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <Button variant="contained" endIcon={<ChevronRightIcon />} onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}

// ─── Step 2: pick request type ────────────────────────────────────────────────
function TypeSelector({ selectedMember, onSelect }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Select the type of change request</h1>
        <p className="text-sm text-gray-500">
          {selectedMember
            ? <>Submitting on behalf of <strong className="text-gray-700">{selectedMember}</strong>. Choose the change to make.</>
            : "Choose the change you'd like to make to your benefits. For assistance, contact your plan administrator."
          }
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 mb-8">
        {TILES.map((tile) => {
          const Icon = tile.icon
          return (
            <button
              key={tile.requestType}
              className="group flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl text-left transition-all duration-150 hover:border-blue-400 hover:shadow-md focus:outline-none"
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
              <ChevronRightIcon fontSize="small" className="text-gray-200 group-hover:text-blue-400 transition-colors shrink-0 mt-0.5" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 3: fill in the form ─────────────────────────────────────────────────
function RequestForm({ tile, template, onSubmit, submitting, submitError }) {
  const Icon = tile.icon
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})

  function handleChange(id, val) {
    setValues((v) => ({ ...v, [id]: val }))
    setErrors((e) => ({ ...e, [id]: undefined }))
  }

  function validate() {
    const errs = {}
    ;(template?.sections ?? []).forEach((section) => {
      section.fields.forEach((field) => {
        if (!field.required) return
        if (field.show_if && values[field.show_if.field] !== field.show_if.value) return
        const v = values[field.id]
        if (v === undefined || v === null || v === '' || v === false)
          errs[field.id] = `${field.label} is required`
      })
    })
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit({ formData: values })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Context bar */}
      <div
        className="flex items-center gap-3 p-4 rounded-xl border mb-6"
        style={{ backgroundColor: tile.iconBg, borderColor: `${tile.iconColor}30` }}
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${tile.iconColor}20` }}>
          <Icon style={{ color: tile.iconColor, fontSize: 18 }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{tile.label}</p>
          <p className="text-xs text-gray-500">{tile.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {template
          ? <DynamicSections sections={template.sections} values={values} onChange={handleChange} errors={errors} />
          : <div className="text-sm text-gray-400 py-4 text-center">No form configuration found.</div>
        }

        {submitError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-3">
            <span className="text-red-500 text-sm leading-none mt-0.5">✕</span>
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Request'}
          </Button>
        </div>
      </div>
    </form>
  )
}

// ─── Success ──────────────────────────────────────────────────────────────────
function SuccessState({ requestNumber, onViewRequests, onNewRequest }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: `${colors.brandPrimary}15` }}>
        <CheckCircleOutlineIcon style={{ color: colors.brandPrimary, fontSize: 40 }} />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted</h2>
      <p className="text-sm text-gray-500 mb-1">
        Your request <strong className="text-gray-800">{requestNumber}</strong> has been submitted and is now under review.
      </p>
      <p className="text-xs text-gray-400 mb-8">You will be notified once your request has been processed.</p>
      <div className="flex gap-3">
        <Button variant="outlined" onClick={onNewRequest}>Submit Another</Button>
        <Button variant="contained" onClick={onViewRequests}>View Requests</Button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CreateChangeRequestPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { personaKey, activeEntity, sponsorId } = usePersona()
  const isMember = personaKey === 'MEMBER'

  // Sponsors start at 'member', members start at 'type'
  const [step,          setStep]         = useState(isMember ? 'type' : 'member')
  const [selectedEmpId, setSelectedEmpId] = useState(isMember ? (activeEntity?.employeeId ?? '') : '')
  const [selectedMemberName, setSelectedMemberName] = useState('')
  const [employees,     setEmployees]    = useState([])
  const [selectedTile,  setSelectedTile] = useState(null)
  const [template,      setTemplate]     = useState(null)
  const [loadingForm,   setLoadingForm]  = useState(false)
  const [submitting,    setSubmitting]   = useState(false)
  const [submitError,   setSubmitError]  = useState(null)
  const [submittedNum,  setSubmittedNum] = useState(null)

  // Fetch employees once for sponsor
  useEffect(() => {
    if (isMember) return
    supabase
      .from('employee')
      .select('employee_id, first_name, last_name')
      .eq('sponsor_id', sponsorId)
      .eq('employment_status', 'ACTIVE')
      .order('last_name')
      .then(({ data }) => setEmployees(data ?? []))
  }, [isMember, sponsorId])

  // Auto-select tile from ?type= query param
  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (!typeParam) return
    const tile = TILES.find((t) => t.requestType === typeParam)
    if (tile) handleSelectTile(tile)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleMemberNext(empId) {
    const emp = employees.find((e) => e.employee_id === empId)
    setSelectedEmpId(empId)
    setSelectedMemberName(emp ? `${emp.first_name} ${emp.last_name}` : '')
    setStep('type')
  }

  async function handleSelectTile(tile) {
    setSelectedTile(tile)
    setStep('form')
    setLoadingForm(true)
    const { data } = await supabase
      .from('change_request_form_template')
      .select('form_config')
      .eq('request_type', tile.requestType)
      .eq('is_active', true)
      .is('sponsor_id', null)
      .single()
    setTemplate(data?.form_config ?? null)
    setLoadingForm(false)
  }

  async function handleSubmit({ formData }) {
    setSubmitting(true)
    setSubmitError(null)
    const requestNumber = genRequestNumber()
    const { error } = await supabase.from('change_request').insert({
      request_number:    requestNumber,
      employee_id:       selectedEmpId,
      member_id:         isMember ? activeEntity?.id : null,
      submitted_by:      SYSTEM_USER_ID,
      request_type:      selectedTile.requestType,
      status:            'SUBMITTED',
      submission_date:   new Date().toISOString().split('T')[0],
      request_form_json: formData,
    })
    if (error) { setSubmitError(error.message); setSubmitting(false); return }
    setSubmittedNum(requestNumber)
    setStep('success')
    setSubmitting(false)
  }

  function handleBack() {
    if (step === 'form') {
      setStep('type'); setSelectedTile(null)
    } else if (step === 'type') {
      isMember ? navigate('/portal/requests') : setStep('member')
    } else {
      navigate('/portal/requests')
    }
  }

  function handleNewRequest() {
    setStep(isMember ? 'type' : 'member')
    setSelectedTile(null); setTemplate(null)
    setSubmittedNum(null); setSubmitError(null)
    if (!isMember) { setSelectedEmpId(''); setSelectedMemberName('') }
  }

  const backLabel = step === 'member' || (step === 'type' && isMember) ? 'Back to Requests' : 'Back'

  return (
    <div>
      {step !== 'success' && (
        <Button variant="text" startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 3, pl: 0 }}>
          {backLabel}
        </Button>
      )}

      {step === 'member' && (
        <MemberStep employees={employees} onNext={handleMemberNext} />
      )}

      {step === 'type' && (
        <TypeSelector
          selectedMember={selectedMemberName || null}
          onSelect={handleSelectTile}
        />
      )}

      {step === 'form' && (
        loadingForm
          ? <div className="text-sm text-gray-400 py-16 text-center">Loading form…</div>
          : <RequestForm
              tile={selectedTile}
              template={template}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
            />
      )}

      {step === 'success' && (
        <SuccessState
          requestNumber={submittedNum}
          onViewRequests={() => navigate('/portal/requests')}
          onNewRequest={handleNewRequest}
        />
      )}
    </div>
  )
}
