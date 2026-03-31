import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePersona } from '../../context/PersonaContext'
import { createListCollection } from '@ark-ui/react/select'
import FilterSelect from '../../components/FilterSelect'
import { Menu } from '@ark-ui/react/menu'
import { Dialog } from '@ark-ui/react/dialog'
import { Tabs } from '@ark-ui/react/tabs'
import { FileUpload } from '@ark-ui/react/file-upload'
import { Button } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { colors } from '../../theme'

// ─── Helper: format a date string to "Jan 1, 2025" ───────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Helper: derive display values from a raw employee record ────────────────
function deriveEmployee(emp) {
  const activeMember = emp.member?.find((m) => m.member_status === 'ACTIVE') ?? null
  const isEnrolled = activeMember !== null
  const memberNumber = activeMember?.member_number ?? '-'
  const planName = isEnrolled
    ? (activeMember?.plan?.plan_name ?? '—')
    : (emp.employee_plan_assignment?.[0]?.plan?.plan_name ?? '—')
  // Unified plan ID: enrolled members use their member plan, others use their assignment plan
  const planId = isEnrolled
    ? (activeMember?.plan_id ?? activeMember?.plan?.plan_id ?? null)
    : (emp.employee_plan_assignment?.[0]?.plan?.plan_id ?? null)
  const assignment = emp.employee_plan_assignment?.[0] ?? null
  const division = assignment?.division_code ?? '—'
  const classCode = assignment?.class_code ?? '—'
  const assignmentStatus = assignment?.status ?? '—'

  return {
    ...emp,
    isEnrolled,
    memberNumber,
    planName,
    planId,
    division,
    classCode,
    assignmentStatus,
  }
}

// ─── Badge components ─────────────────────────────────────────────────────────
function EligibilityBadge() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{
        border: `1px solid ${colors.brandPrimary}`,
        color: colors.brandPrimary,
        backgroundColor: 'transparent',
      }}
    >
      ELIGIBLE
    </span>
  )
}

function EnrollmentStatusBadge({ isEnrolled }) {
  if (isEnrolled) {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
        style={{
          border: `1px solid ${colors.brandPrimary}`,
          color: colors.brandPrimary,
          backgroundColor: 'transparent',
        }}
      >
        ENROLLED
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border border-gray-400 text-gray-500 bg-transparent">
      NOT ENROLLED
    </span>
  )
}

function EmploymentStatusBadge({ status }) {
  const colorMap = {
    ACTIVE: { border: colors.brandPrimary, color: colors.brandPrimary },
    ON_LEAVE: { border: colors.warning, color: colors.warning },
    TERMINATED: { border: colors.error, color: colors.error },
  }
  const style = colorMap[status] ?? { border: '#6b7280', color: '#6b7280' }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{
        border: `1px solid ${style.border}`,
        color: style.color,
        backgroundColor: 'transparent',
      }}
    >
      {status ?? '—'}
    </span>
  )
}

function CoverageStatusBadge({ isEnrolled }) {
  if (isEnrolled) {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
        style={{
          border: `1px solid ${colors.brandPrimary}`,
          color: colors.brandPrimary,
          backgroundColor: 'transparent',
        }}
      >
        ACTIVE
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border border-gray-400 text-gray-500 bg-transparent">
      N/A
    </span>
  )
}

// ─── Expanded row detail ──────────────────────────────────────────────────────
function ExpandedRow({ emp }) {
  return (
    <tr>
      <td colSpan={7} className="px-0 py-0 border-b border-gray-100">
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Column 1: Employment Details */}
          <div className="space-y-3">
            <p
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: colors.link }}
            >
              Employment Details
            </p>
            <DetailField label="Hire Date" value={formatDate(emp.hire_date)} />
            <DetailField label="Employment Type" value={emp.employment_type ?? '—'} />
            <DetailField label="Group" value={emp.division} />
            <DetailField label="Plan" value={emp.planName} />
          </div>

          {/* Column 2: Classification & Compensation */}
          <div className="space-y-3">
            <p
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: colors.link }}
            >
              Classification &amp; Compensation
            </p>
            <DetailField label="Division" value={emp.division} />
            <DetailField label="Class" value={emp.classCode} />
            <DetailField
              label="Salary"
              value={
                emp.annual_salary != null
                  ? `${Number(emp.annual_salary).toLocaleString('en-CA', {
                      style: 'currency',
                      currency: emp.salary_currency ?? 'CAD',
                      maximumFractionDigits: 0,
                    })} ${emp.salary_currency ?? 'CAD'}`
                  : '—'
              }
            />
          </div>

          {/* Column 3: Contact Information */}
          <div className="space-y-3">
            <p
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: colors.link }}
            >
              Contact Information
            </p>
            <DetailField label="Date of Birth" value={formatDate(emp.date_of_birth)} />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Email
              </p>
              {emp.email ? (
                <a
                  href={`mailto:${emp.email}`}
                  className="text-sm"
                  style={{ color: colors.link }}
                >
                  {emp.email}
                </a>
              ) : (
                <p className="text-sm text-gray-800">—</p>
              )}
            </div>
            <DetailField label="Phone" value={emp.phone_mobile ?? '—'} />
          </div>

          {/* Column 4: Status Information */}
          <div className="space-y-3">
            <p
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: colors.link }}
            >
              Status Information
            </p>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Employment Status
              </p>
              <EmploymentStatusBadge status={emp.employment_status} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Coverage Status
              </p>
              <CoverageStatusBadge isEnrolled={emp.isEnrolled} />
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  )
}

// ─── Edit Member modal ────────────────────────────────────────────────────────
function EditMemberModal({ emp, groups, onConfirm, onCancel, saving, saveError }) {
  const [form, setForm] = useState({
    firstName:   emp.first_name       ?? '',
    lastName:    emp.last_name        ?? '',
    dateOfBirth: emp.date_of_birth    ?? '',
    hireDate:    emp.hire_date        ?? '',
    annualSalary: emp.annual_salary != null ? String(emp.annual_salary) : '',
    division:    emp.division         ?? '',
    email:       emp.email            ?? '',
    phone:       emp.phone_mobile     ?? '',
  })
  const [errors, setErrors] = useState({})

  const inputClass = (f) =>
    `w-full px-3 py-2 text-sm border rounded focus:outline-none transition-colors ${
      errors[f] ? 'border-red-400' : 'border-gray-300 focus:border-gray-500'
    }`

  function set(field) {
    return (e) => {
      setForm((p) => ({ ...p, [field]: e.target.value }))
      setErrors((p) => ({ ...p, [field]: undefined }))
    }
  }

  function validate() {
    const e = {}
    if (!form.firstName) e.firstName = 'Required'
    if (!form.lastName)  e.lastName  = 'Required'
    if (!form.hireDate)  e.hireDate  = 'Required'
    if (form.annualSalary && isNaN(Number(form.annualSalary))) e.annualSalary = 'Must be a number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onConfirm({
      first_name:    form.firstName,
      last_name:     form.lastName,
      date_of_birth: form.dateOfBirth  || null,
      hire_date:     form.hireDate,
      annual_salary: form.annualSalary !== '' ? Number(form.annualSalary) : null,
      email:         form.email        || null,
      phone_mobile:  form.phone        || null,
      division:      form.division     || null,
    })
  }

  return (
    <Dialog.Root open onOpenChange={({ open }) => { if (!open) onCancel() }}>
      <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-40" />
      <Dialog.Positioner className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Dialog.Content className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <Dialog.Title className="text-lg font-bold text-gray-900">Edit Member</Dialog.Title>
            <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">✕</button>
          </div>

          {/* Scrollable body */}
          <div className="px-6 py-5 space-y-5 overflow-y-auto">
            {/* Employee info block */}
            <div className="bg-gray-50 rounded-lg px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">{emp.first_name} {emp.last_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">Employee ID: {emp.external_hr_id}</p>
            </div>

            {/* First + Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.firstName} onChange={set('firstName')} className={inputClass('firstName')} />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.lastName} onChange={set('lastName')} className={inputClass('lastName')} />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* DOB + Hire Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className={inputClass('dateOfBirth')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date <span className="text-red-500">*</span></label>
                <input type="date" value={form.hireDate} onChange={set('hireDate')} className={inputClass('hireDate')} />
                {errors.hireDate && <p className="text-xs text-red-500 mt-1">{errors.hireDate}</p>}
              </div>
            </div>

            {/* Annual Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Salary</label>
              <input type="number" min="0" step="1000" value={form.annualSalary} onChange={set('annualSalary')} placeholder="e.g. 75000" className={inputClass('annualSalary')} />
              {errors.annualSalary && <p className="text-xs text-red-500 mt-1">{errors.annualSalary}</p>}
            </div>

            {/* Group / Division */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
              <select value={form.division} onChange={set('division')} className={inputClass('division')}>
                <option value="">— No group —</option>
                {groups.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="email@company.com" className={inputClass('email')} />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="555-123-4567" className={inputClass('phone')} />
            </div>

            {saveError && <p className="text-sm text-red-600">Error: {saveError}</p>}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
            <Button variant="outlined" onClick={onCancel} disabled={saving}>CANCEL</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={saving}>
              {saving ? 'SAVING...' : 'SAVE CHANGES'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

// ─── Change Employment Status modal ──────────────────────────────────────────
function ChangeStatusModal({ emp, onConfirm, onCancel, saving, saveError }) {
  const today = new Date().toISOString().split('T')[0]
  const [status, setStatus]         = useState(emp.employment_status ?? 'ACTIVE')
  const [effectiveDate, setDate]    = useState(today)
  const [salary, setSalary]         = useState(emp.annual_salary ?? '')
  const [notes, setNotes]           = useState('')
  const [errors, setErrors]         = useState({})

  const inputClass = (f) =>
    `w-full px-3 py-2 text-sm border rounded focus:outline-none transition-colors ${
      errors[f] ? 'border-red-400' : 'border-gray-300 focus:border-gray-500'
    }`

  function validate() {
    const e = {}
    if (!status)        e.status = 'Required'
    if (!effectiveDate) e.effectiveDate = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onConfirm({ status, effectiveDate, salary: salary !== '' ? Number(salary) : null, notes })
  }

  return (
    <Dialog.Root open onOpenChange={({ open }) => { if (!open) onCancel() }}>
      <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-40" />
      <Dialog.Positioner className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Dialog.Content className="bg-white rounded-lg shadow-xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <Dialog.Title className="text-lg font-bold text-gray-900">
              Change Employment Status
            </Dialog.Title>
            <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Employee info block */}
            <div className="bg-gray-50 rounded-lg px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">{emp.first_name} {emp.last_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">Employee ID: {emp.external_hr_id}</p>
            </div>

            {/* Employment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Status <span className="text-red-500">*</span>
              </label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass('status')}>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TERMINATED">Terminated</option>
              </select>
              {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
            </div>

            {/* Effective Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date <span className="text-red-500">*</span>
              </label>
              <input type="date" value={effectiveDate} onChange={(e) => setDate(e.target.value)} className={inputClass('effectiveDate')} />
              {errors.effectiveDate && <p className="text-xs text-red-500 mt-1">{errors.effectiveDate}</p>}
            </div>

            {/* New Annual Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Annual Salary</label>
              <input
                type="number" min="0" step="1000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Leave blank to keep current"
                className={inputClass('salary')}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any additional notes about this status change..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-500 resize-none"
              />
            </div>

            {saveError && <p className="text-sm text-red-600">Error: {saveError}</p>}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <Button variant="outlined" onClick={onCancel} disabled={saving}>CANCEL</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={saving}>
              {saving ? 'SAVING...' : 'UPDATE STATUS'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

// ─── Terminate confirmation modal ─────────────────────────────────────────────
function TerminateModal({ emp, onConfirm, onCancel, terminating, terminateError }) {
  if (!emp) return null
  return (
    <Dialog.Root open onOpenChange={({ open }) => { if (!open) onCancel() }}>
      <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-40" />
      <Dialog.Positioner className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Dialog.Content className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <Dialog.Title className="text-lg font-bold text-gray-900 mb-2">
            Terminate Employee
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 mb-5">
            Are you sure you want to terminate{' '}
            <span className="font-semibold">{emp.first_name} {emp.last_name}</span>{' '}
            <span className="font-mono text-xs text-gray-500">({emp.external_hr_id})</span>?
            <br /><br />
            Their employment status will be set to <strong>TERMINATED</strong> and they will be
            removed from the members list.
          </Dialog.Description>
          {terminateError && (
            <p className="text-sm text-red-600 mb-4">Error: {terminateError}</p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outlined" onClick={onCancel} disabled={terminating}>
              CANCEL
            </Button>
            <Button
              variant="contained"
              onClick={onConfirm}
              disabled={terminating}
              style={{ backgroundColor: colors.error }}
            >
              {terminating ? 'TERMINATING...' : 'CONFIRM TERMINATION'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

// ─── Row 3-dot actions menu ───────────────────────────────────────────────────
function ActionsMenu({ emp, onEditClick, onTerminateClick, onChangeStatusClick }) {
  const navigate = useNavigate()
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <button
          className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-label="Row actions"
        >
          <MoreVertIcon fontSize="small" className="text-gray-500" />
        </button>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content className="bg-white border border-gray-200 rounded shadow-lg z-50 py-1 min-w-36">
          <Menu.Item
            value="view-profile"
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none"
            onClick={() => navigate(`/portal/members/${emp.employee_id}`)}
          >
            View Profile
          </Menu.Item>
          {!emp.isEnrolled && (
            <Menu.Item
              value="enroll"
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none"
              onClick={() => navigate(`/portal/members/${emp.employee_id}/enroll`)}
            >
              Enroll
            </Menu.Item>
          )}
          <Menu.Item
            value="edit"
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none"
            onClick={() => onEditClick(emp)}
          >
            Edit
          </Menu.Item>
          <Menu.Item
            value="change-status"
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none"
            onClick={() => onChangeStatusClick(emp)}
          >
            Change Employment Status
          </Menu.Item>
          <Menu.Item
            value="terminate"
            className="px-4 py-2 text-sm text-red-600 cursor-pointer hover:bg-red-50 data-[highlighted]:bg-red-50 outline-none"
            onClick={() => onTerminateClick(emp)}
          >
            Terminate
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  )
}

// ─── Add Individual Member form ───────────────────────────────────────────────
const ADMIN_USER_ID = 'e5000000-0000-0000-0000-000000000001'
const PROVINCES = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT']

const EMPTY_FORM = {
  firstName: '', lastName: '', externalHrId: '', dateOfBirth: '',
  email: '', phone: '', jobTitle: '',
  hireDate: '', employmentType: '', province: '',
  annualSalary: '', salaryCurrency: 'CAD',
  planId: '', classCode: '', divisionCode: '',
}

const REQUIRED = ['firstName', 'lastName', 'externalHrId', 'hireDate', 'employmentType', 'province']

function AddIndividualForm({ plans, onSuccess, sponsorId }) {
  const [form, setForm]       = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving]   = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved]     = useState(false)

  const inputClass = (name) =>
    `w-full px-3 py-2 text-sm border rounded focus:outline-none focus:border-gray-500 transition-colors ${
      fieldErrors[name] ? 'border-red-400' : 'border-gray-300'
    }`
  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function validate() {
    const errs = {}
    REQUIRED.forEach((k) => { if (!form[k]) errs[k] = 'Required' })
    if (form.annualSalary && isNaN(Number(form.annualSalary))) errs.annualSalary = 'Must be a number'
    if (form.planId && !form.classCode) errs.classCode = 'Required when a plan is selected'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSaveError(null)

    // 1. Insert employee
    const { data: emp, error: empErr } = await supabase
      .from('employee')
      .insert({
        sponsor_id:          sponsorId,
        external_hr_id:      form.externalHrId   || null,
        first_name:          form.firstName,
        last_name:           form.lastName,
        date_of_birth:       form.dateOfBirth     || null,
        email:               form.email           || null,
        phone_mobile:        form.phone           || null,
        job_title:           form.jobTitle        || null,
        hire_date:           form.hireDate,
        employment_type:     form.employmentType,
        employment_status:   'ACTIVE',
        province_state_code: form.province,
        annual_salary:       form.annualSalary    ? Number(form.annualSalary) : null,
        salary_currency:     form.salaryCurrency,
      })
      .select('employee_id')
      .single()

    if (empErr) { setSaveError(empErr.message); setSaving(false); return }

    // 2. Insert plan assignment if a plan was chosen
    if (form.planId) {
      const { error: assignErr } = await supabase
        .from('employee_plan_assignment')
        .insert({
          employee_id:    emp.employee_id,
          plan_id:        form.planId,
          class_code:     form.classCode,
          division_code:  form.divisionCode || null,
          effective_date: form.hireDate,
          assigned_by:    ADMIN_USER_ID,
          status:         'PENDING_ENROLLMENT',
        })
      if (assignErr) { setSaveError(assignErr.message); setSaving(false); return }
    }

    setSaving(false)
    setSaved(true)
    setForm(EMPTY_FORM)
    onSuccess?.()
  }

  if (saved) {
    return (
      <div className="flex flex-col items-start gap-4 py-4">
        <p className="text-sm font-semibold" style={{ color: colors.brandPrimary }}>
          ✓ Member added successfully.
        </p>
        <Button variant="outlined" size="small" onClick={() => setSaved(false)}>
          ADD ANOTHER
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">

      {/* ── Personal ── */}
      <p className={`text-xs font-bold uppercase tracking-wider mb-3`} style={{ color: colors.link }}>
        Personal Information
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelClass} htmlFor="firstName">First Name <span className="text-red-500">*</span></label>
          <input id="firstName" name="firstName" type="text" value={form.firstName} onChange={handleChange} placeholder="First Name" className={inputClass('firstName')} />
          {fieldErrors.firstName && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.firstName}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="lastName">Last Name <span className="text-red-500">*</span></label>
          <input id="lastName" name="lastName" type="text" value={form.lastName} onChange={handleChange} placeholder="Last Name" className={inputClass('lastName')} />
          {fieldErrors.lastName && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.lastName}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="dateOfBirth">Date of Birth</label>
          <input id="dateOfBirth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className={inputClass('dateOfBirth')} />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@company.com" className={inputClass('email')} />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">Mobile Phone</label>
          <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="555-123-4567" className={inputClass('phone')} />
        </div>
        <div>
          <label className={labelClass} htmlFor="externalHrId">Employee ID <span className="text-red-500">*</span></label>
          <input id="externalHrId" name="externalHrId" type="text" value={form.externalHrId} onChange={handleChange} placeholder="e.g. EMP0099" className={inputClass('externalHrId')} />
        </div>
      </div>

      {/* ── Employment ── */}
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: colors.link }}>
        Employment Details
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelClass} htmlFor="jobTitle">Job Title</label>
          <input id="jobTitle" name="jobTitle" type="text" value={form.jobTitle} onChange={handleChange} placeholder="e.g. Software Engineer" className={inputClass('jobTitle')} />
        </div>
        <div>
          <label className={labelClass} htmlFor="hireDate">Hire Date <span className="text-red-500">*</span></label>
          <input id="hireDate" name="hireDate" type="date" value={form.hireDate} onChange={handleChange} className={inputClass('hireDate')} />
          {fieldErrors.hireDate && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.hireDate}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="employmentType">Employment Type <span className="text-red-500">*</span></label>
          <select id="employmentType" name="employmentType" value={form.employmentType} onChange={handleChange} className={inputClass('employmentType')}>
            <option value="">Select type</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="SEASONAL">Seasonal</option>
          </select>
          {fieldErrors.employmentType && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.employmentType}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="province">Province / Territory <span className="text-red-500">*</span></label>
          <select id="province" name="province" value={form.province} onChange={handleChange} className={inputClass('province')}>
            <option value="">Select province</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {fieldErrors.province && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.province}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="annualSalary">Annual Salary</label>
          <div className="flex gap-2">
            <input id="annualSalary" name="annualSalary" type="number" min="0" step="1000" value={form.annualSalary} onChange={handleChange} placeholder="e.g. 75000" className={`${inputClass('annualSalary')} flex-1`} />
            <select name="salaryCurrency" value={form.salaryCurrency} onChange={handleChange} className="px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none w-20">
              <option value="CAD">CAD</option>
              <option value="USD">USD</option>
            </select>
          </div>
          {fieldErrors.annualSalary && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.annualSalary}</p>}
        </div>
      </div>

      {/* ── Plan Assignment ── */}
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: colors.link }}>
        Plan Assignment
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="planId">Plan</label>
          <select id="planId" name="planId" value={form.planId} onChange={handleChange} className={inputClass('planId')}>
            <option value="">Select plan (optional)</option>
            {plans.map((p) => <option key={p.plan_id} value={p.plan_id}>{p.plan_name}</option>)}
          </select>
        </div>
        {form.planId && (
          <>
            <div>
              <label className={labelClass} htmlFor="classCode">Class Code <span className="text-red-500">*</span></label>
              <input id="classCode" name="classCode" type="text" value={form.classCode} onChange={handleChange} placeholder="e.g. EXEC" className={inputClass('classCode')} />
              {fieldErrors.classCode && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.classCode}</p>}
            </div>
            <div>
              <label className={labelClass} htmlFor="divisionCode">Division</label>
              <input id="divisionCode" name="divisionCode" type="text" value={form.divisionCode} onChange={handleChange} placeholder="e.g. Management" className={inputClass('divisionCode')} />
            </div>
          </>
        )}
      </div>

      {saveError && (
        <p className="text-sm text-red-600 mb-4">Error: {saveError}</p>
      )}

      <Button type="submit" variant="contained" size="medium" disabled={saving}>
        {saving ? 'SAVING...' : 'ADD MEMBER'}
      </Button>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────────────────────────────────────
export default function MembersPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { sponsorId } = usePersona()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter state
  const [pillFilter, setPillFilter] = useState('all') // 'all' | 'enrolled' | 'not_enrolled'
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planTypeFilter, setPlanTypeFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [groupFilter, setGroupFilter] = useState('all')

  // Expanded rows: Set of employee_ids
  const [expandedRows, setExpandedRows] = useState(new Set())

  // Edit member modal
  const [editTarget, setEditTarget]             = useState(null)
  const [editSaving, setEditSaving]             = useState(false)
  const [editError, setEditError]               = useState(null)

  // Change status modal
  const [statusTarget, setStatusTarget]         = useState(null)
  const [statusSaving, setStatusSaving]         = useState(false)
  const [statusError, setStatusError]           = useState(null)

  // Terminate modal
  const [terminateTarget, setTerminateTarget]   = useState(null)
  const [terminating, setTerminating]           = useState(false)
  const [terminateError, setTerminateError]     = useState(null)

  // Individual add form plan list
  const [plans, setPlans] = useState([])

  // ─── Fetch employees ────────────────────────────────────────────────────────
  async function fetchData() {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('employee')
      .select(`
        employee_id, external_hr_id, first_name, last_name, date_of_birth,
        hire_date, employment_type, employment_status, annual_salary, salary_currency,
        city, province_state_code, email, phone_mobile, job_title,
        employee_plan_assignment (
          class_code, division_code, status,
          plan ( plan_id, plan_name )
        ),
        member (
          member_number, member_status, plan_id,
          plan ( plan_name )
        )
      `)
      .eq('sponsor_id', sponsorId)
      .neq('employment_status', 'TERMINATED')
      .order('external_hr_id')

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setEmployees((data ?? []).map(deriveEmployee))
    }
    setLoading(false)
  }

  useEffect(() => {
    async function fetchPlans() {
      const { data } = await supabase
        .from('plan')
        .select('plan_id, plan_name')
        .eq('status', 'ACTIVE')
        .order('plan_name')
      setPlans(data ?? [])
    }

    fetchData()
    fetchPlans()
  }, [])

  // Apply ?planId= URL param as plan filter once the plans list has loaded
  useEffect(() => {
    const planId = searchParams.get('planId')
    if (!planId || plans.length === 0) return
    if (plans.some((p) => p.plan_id === planId)) setPlanFilter(planId)
  }, [plans, searchParams])

  // ─── Summary counts ─────────────────────────────────────────────────────────
  const totalCount = employees.length
  const enrolledCount = employees.filter((e) => e.isEnrolled).length
  const notEnrolledCount = totalCount - enrolledCount

  // ─── Filter collections for Ark UI Select ───────────────────────────────────
  const statusCollection = createListCollection({
    items: [
      { label: 'All Status', value: 'all' },
      { label: 'Active', value: 'ACTIVE' },
      { label: 'On Leave', value: 'ON_LEAVE' },
      { label: 'Terminated', value: 'TERMINATED' },
    ],
  })

  const planTypeCollection = createListCollection({
    items: [
      { label: 'All Plan Types', value: 'all' },
      { label: 'Medical', value: 'Medical' },
      { label: 'Group Benefits', value: 'Group Benefits' },
    ],
  })

  const planCollection = useMemo(() => {
    return createListCollection({
      items: [
        { label: 'All Plans', value: 'all' },
        ...plans.map((p) => ({ label: p.plan_name, value: p.plan_id })),
      ],
    })
  }, [plans])

  const groupCollection = useMemo(() => {
    const uniqueGroups = [
      ...new Set(
        employees
          .map((e) => e.employee_plan_assignment?.[0]?.division_code)
          .filter(Boolean)
      ),
    ]
    return createListCollection({
      items: [
        { label: 'All Groups', value: 'all' },
        ...uniqueGroups.map((g) => ({ label: g, value: g })),
      ],
    })
  }, [employees])

  // ─── Filtered employees ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      // Pill filter
      if (pillFilter === 'enrolled' && !emp.isEnrolled) return false
      if (pillFilter === 'not_enrolled' && emp.isEnrolled) return false

      // Search
      if (search) {
        const q = search.toLowerCase()
        const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase()
        if (!fullName.includes(q) && !emp.external_hr_id?.toLowerCase().includes(q))
          return false
      }

      // Status filter
      if (statusFilter !== 'all' && emp.employment_status !== statusFilter) return false

      // Plan filter
      if (planFilter !== 'all') {
        if (emp.planId !== planFilter) return false
      }

      // Group filter
      if (groupFilter !== 'all') {
        if (emp.division !== groupFilter) return false
      }

      return true
    })
  }, [employees, pillFilter, search, statusFilter, planTypeFilter, planFilter, groupFilter])

  // ─── Toggle expanded row ─────────────────────────────────────────────────────
  function toggleRow(empId) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(empId)) {
        next.delete(empId)
      } else {
        next.add(empId)
      }
      return next
    })
  }

  // ─── Edit member handler ─────────────────────────────────────────────────
  async function handleConfirmEdit({ first_name, last_name, date_of_birth, hire_date, annual_salary, email, phone_mobile, division }) {
    setEditSaving(true)
    setEditError(null)

    const { error: empErr } = await supabase
      .from('employee')
      .update({ first_name, last_name, date_of_birth, hire_date, annual_salary, email, phone_mobile })
      .eq('employee_id', editTarget.employee_id)

    if (empErr) { setEditError(empErr.message); setEditSaving(false); return }

    // Update division on the plan assignment if present
    if (editTarget.employee_plan_assignment?.[0]) {
      await supabase
        .from('employee_plan_assignment')
        .update({ division_code: division })
        .eq('employee_id', editTarget.employee_id)
    }

    setEditSaving(false)
    setEditTarget(null)
    fetchData()
  }

  // ─── Change status handler ───────────────────────────────────────────────
  async function handleConfirmStatusChange({ status, effectiveDate, salary }) {
    setStatusSaving(true)
    setStatusError(null)
    const updates = { employment_status: status }
    if (salary !== null) updates.annual_salary = salary
    if (status === 'TERMINATED') updates.termination_date = effectiveDate
    else updates.termination_date = null

    const { error } = await supabase
      .from('employee')
      .update(updates)
      .eq('employee_id', statusTarget.employee_id)

    if (error) {
      setStatusError(error.message)
      setStatusSaving(false)
    } else {
      setStatusSaving(false)
      setStatusTarget(null)
      fetchData()
    }
  }

  // ─── Terminate handler ───────────────────────────────────────────────────
  async function handleConfirmTerminate() {
    setTerminating(true)
    setTerminateError(null)
    const { error } = await supabase
      .from('employee')
      .update({
        employment_status: 'TERMINATED',
        termination_date:  new Date().toISOString().split('T')[0],
      })
      .eq('employee_id', terminateTarget.employee_id)

    if (error) {
      setTerminateError(error.message)
      setTerminating(false)
    } else {
      setTerminating(false)
      setTerminateTarget(null)
      fetchData()
    }
  }

  // ─── Pill button style helper ─────────────────────────────────────────────
  function pillStyle(value) {
    const isActive = pillFilter === value
    return {
      padding: '6px 16px',
      borderRadius: '9999px',
      fontSize: '0.8125rem',
      fontWeight: isActive ? 600 : 400,
      cursor: 'pointer',
      border: isActive ? `2px solid ${colors.brandPrimary}` : '2px solid #e5e7eb',
      color: isActive ? colors.brandPrimary : '#374151',
      backgroundColor: isActive ? '#f0fdf4' : '#fff',
      transition: 'all 0.15s',
    }
  }

  return (
    <div className="w-full">
      {/* Page header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Members</h1>
      <p className="text-sm text-gray-500 mb-5">Manage employee benefit enrollments</p>
      <hr className="border-gray-200 mb-5" />

      {/* Summary pills */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button style={pillStyle('all')} onClick={() => setPillFilter('all')}>
          Total ({totalCount})
        </button>
        <button style={pillStyle('enrolled')} onClick={() => setPillFilter('enrolled')}>
          Enrolled ({enrolledCount})
        </button>
        <button
          style={pillStyle('not_enrolled')}
          onClick={() => setPillFilter('not_enrolled')}
        >
          Not Enrolled ({notEnrolledCount})
        </button>
      </div>

      {/* Search + dropdowns row */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search input */}
        <div className="relative flex-1 min-w-56">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400"
          />
          <SearchIcon
            fontSize="small"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Status select */}
        <FilterSelect
          collection={statusCollection}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All Status"
        />

        {/* Plan Type select */}
        <FilterSelect
          collection={planTypeCollection}
          value={planTypeFilter}
          onChange={setPlanTypeFilter}
          placeholder="All Plan Types"
        />

        {/* Plan select */}
        <FilterSelect
          collection={planCollection}
          value={planFilter}
          onChange={setPlanFilter}
          placeholder="All Plans"
        />

        {/* Group select */}
        <FilterSelect
          collection={groupCollection}
          value={groupFilter}
          onChange={setGroupFilter}
          placeholder="All Groups"
        />
      </div>

      {/* Loading / error states */}
      {loading && <p className="text-sm text-gray-400">Loading members...</p>}
      {error && <p className="text-sm text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* Members table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="w-10 px-3 py-3" aria-label="Expand" />
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Employee ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Member ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Eligibility
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Enrollment Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => {
                  const isExpanded = expandedRows.has(emp.employee_id)
                  const isLast = i === filtered.length - 1
                  return (
                    <>
                      <tr
                        key={emp.employee_id}
                        className={`hover:bg-gray-50 ${!isLast || isExpanded ? 'border-b border-gray-100' : ''}`}
                      >
                        {/* Chevron expand */}
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => toggleRow(emp.employee_id)}
                            className="p-0.5 rounded hover:bg-gray-200 focus:outline-none transition-transform duration-150"
                            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                            style={{
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}
                          >
                            <ChevronRightIcon fontSize="small" className="text-gray-400" />
                          </button>
                        </td>

                        {/* Employee ID */}
                        <td className="px-4 py-3 font-mono text-xs">
                          <button
                            onClick={() => navigate(`/portal/members/${emp.employee_id}`)}
                            className="hover:underline"
                            style={{ color: colors.link }}
                          >
                            {emp.external_hr_id ?? '—'}
                          </button>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {emp.first_name} {emp.last_name}
                        </td>

                        {/* Member ID */}
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                          {emp.memberNumber}
                        </td>

                        {/* Eligibility */}
                        <td className="px-4 py-3">
                          <EligibilityBadge />
                        </td>

                        {/* Enrollment Status */}
                        <td className="px-4 py-3">
                          <EnrollmentStatusBadge isEnrolled={emp.isEnrolled} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <ActionsMenu emp={emp} onEditClick={setEditTarget} onTerminateClick={setTerminateTarget} onChangeStatusClick={setStatusTarget} />
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && <ExpandedRow key={`${emp.employee_id}-expanded`} emp={emp} />}
                    </>
                  )
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-gray-400"
                    >
                      No members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ─── Add Members section ─────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Add Members</h2>
            <p className="text-sm text-gray-500 mb-5">
              Add members to the census individually or upload in bulk
            </p>

            <Tabs.Root defaultValue="bulk">
              <Tabs.List className="flex border-b border-gray-200 mb-6">
                <Tabs.Trigger
                  value="bulk"
                  className="px-5 py-2.5 text-sm font-medium text-gray-500 cursor-pointer border-b-2 border-transparent data-[selected]:border-b-2 data-[selected]:font-semibold focus:outline-none"
                  style={{}}
                >
                  {/* Inline selected indicator via inline style applied conditionally */}
                  <span className="data-[selected]:text-brand">Bulk Upload</span>
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="individual"
                  className="px-5 py-2.5 text-sm font-medium text-gray-500 cursor-pointer border-b-2 border-transparent data-[selected]:border-b-2 data-[selected]:font-semibold focus:outline-none"
                >
                  <span>Add Individual Member</span>
                </Tabs.Trigger>
                <Tabs.Indicator
                  className="absolute bottom-0 h-0.5"
                  style={{ backgroundColor: colors.brandPrimary }}
                />
              </Tabs.List>

              {/* Bulk Upload tab */}
              <Tabs.Content value="bulk">
                <div className="space-y-5">
                  {/* Download template button */}
                  <div>
                    <Button
                      variant="outlined"
                      size="medium"
                      startIcon={<FileDownloadIcon />}
                      style={{
                        borderColor: colors.brandPrimary,
                        color: colors.brandPrimary,
                      }}
                      onClick={() => {
                        // Placeholder: trigger template download
                        alert('Download template (not yet wired).')
                      }}
                    >
                      DOWNLOAD ENROLLMENT TEMPLATE
                    </Button>
                  </div>

                  {/* File upload zone */}
                  <FileUpload.Root
                    maxFiles={1}
                    accept={{ 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.xls', '.xlsx'] }}
                  >
                    <FileUpload.Dropzone className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-gray-400 transition-colors">
                      <UploadFileIcon
                        className="text-gray-400"
                        style={{ fontSize: '2.5rem' }}
                      />
                      <p className="text-sm text-gray-500">Drag and drop a file here</p>
                      <p className="text-xs text-gray-400">or</p>
                      <FileUpload.Trigger asChild>
                        <Button
                          variant="outlined"
                          size="small"
                          style={{
                            borderColor: '#9ca3af',
                            color: '#374151',
                          }}
                        >
                          CHOOSE A FILE
                        </Button>
                      </FileUpload.Trigger>
                    </FileUpload.Dropzone>
                    <FileUpload.HiddenInput />
                  </FileUpload.Root>
                </div>
              </Tabs.Content>

              {/* Add Individual Member tab */}
              <Tabs.Content value="individual">
                <AddIndividualForm plans={plans} onSuccess={fetchData} sponsorId={sponsorId} />
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </>
      )}

      {/* ─── Edit member modal ─────────────────────────────────────────────── */}
      {editTarget && (
        <EditMemberModal
          emp={editTarget}
          groups={[...new Set(employees.map((e) => e.employee_plan_assignment?.[0]?.division_code).filter(Boolean))]}
          onConfirm={handleConfirmEdit}
          onCancel={() => { setEditTarget(null); setEditError(null) }}
          saving={editSaving}
          saveError={editError}
        />
      )}

      {/* ─── Change status modal ───────────────────────────────────────────── */}
      {statusTarget && (
        <ChangeStatusModal
          emp={statusTarget}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => { setStatusTarget(null); setStatusError(null) }}
          saving={statusSaving}
          saveError={statusError}
        />
      )}

      {/* ─── Terminate confirmation modal ──────────────────────────────────── */}
      {terminateTarget && (
        <TerminateModal
          emp={terminateTarget}
          onConfirm={handleConfirmTerminate}
          onCancel={() => { setTerminateTarget(null); setTerminateError(null) }}
          terminating={terminating}
          terminateError={terminateError}
        />
      )}
    </div>
  )
}
