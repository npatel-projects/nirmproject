import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { Select, createListCollection } from '@ark-ui/react/select'
import { Menu } from '@ark-ui/react/menu'
import { Tabs } from '@ark-ui/react/tabs'
import { FileUpload } from '@ark-ui/react/file-upload'
import { Button } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { colors } from '../../theme'

const SPONSOR_ID = 'a1000000-0000-0000-0000-000000000001'

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
  const assignment = emp.employee_plan_assignment?.[0] ?? null
  const division = assignment?.division_code ?? '—'
  const classCode = assignment?.class_code ?? '—'
  const assignmentStatus = assignment?.status ?? '—'

  return {
    ...emp,
    isEnrolled,
    memberNumber,
    planName,
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

// ─── Row 3-dot actions menu ───────────────────────────────────────────────────
function ActionsMenu({ empId }) {
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
          >
            View Profile
          </Menu.Item>
          <Menu.Item
            value="enroll"
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none"
          >
            Enroll
          </Menu.Item>
          <Menu.Item
            value="edit"
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none"
          >
            Edit
          </Menu.Item>
          <Menu.Item
            value="terminate"
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none"
          >
            Terminate
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  )
}

// ─── Ark UI Select wrapper ────────────────────────────────────────────────────
function FilterSelect({ collection, value, onChange, placeholder }) {
  const selectedItem = collection.items.find((i) => i.value === value)
  const displayLabel = selectedItem ? selectedItem.label : placeholder

  return (
    <Select.Root
      collection={collection}
      value={[value]}
      onValueChange={({ value: vals }) => onChange(vals[0])}
    >
      <Select.Control>
        <Select.Trigger className="flex items-center justify-between gap-2 px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer hover:border-gray-400 focus:outline-none min-w-36">
          <Select.ValueText className="text-gray-700 truncate">
            {displayLabel}
          </Select.ValueText>
          <ArrowDropDownIcon fontSize="small" className="text-gray-400 shrink-0" />
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner>
        <Select.Content className="bg-white border border-gray-200 rounded shadow-lg z-50 min-w-36 py-1">
          {collection.items.map((item) => (
            <Select.Item
              key={item.value}
              item={item}
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none"
            >
              <Select.ItemText>{item.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  )
}

// ─── Add Individual Member form ───────────────────────────────────────────────
function AddIndividualForm({ plans }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    email: '',
    hireDate: '',
    employmentType: '',
    planId: '',
  })

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    // Placeholder: wire to Supabase insert when backend is ready
    alert('Add Member submitted (not yet wired to backend).')
  }

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400'
  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="firstName">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="lastName">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="employeeId">
            Employee ID
          </label>
          <input
            id="employeeId"
            name="employeeId"
            type="text"
            value={form.employeeId}
            onChange={handleChange}
            placeholder="e.g. EMP0001"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@company.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="hireDate">
            Hire Date
          </label>
          <input
            id="hireDate"
            name="hireDate"
            type="date"
            value={form.hireDate}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="employmentType">
            Employment Type
          </label>
          <select
            id="employmentType"
            name="employmentType"
            value={form.employmentType}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select type</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="SEASONAL">Seasonal</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="planId">
            Plan
          </label>
          <select
            id="planId"
            name="planId"
            value={form.planId}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select plan</option>
            {plans.map((p) => (
              <option key={p.plan_id} value={p.plan_id}>
                {p.plan_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-5">
        <Button
          type="submit"
          variant="contained"
          size="medium"
          style={{ backgroundColor: colors.brandPrimary }}
        >
          ADD MEMBER
        </Button>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────────────────────────────────────
export default function MembersPage() {
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

  // Individual add form plan list
  const [plans, setPlans] = useState([])

  // ─── Fetch employees ────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
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
        .eq('sponsor_id', SPONSOR_ID)
        .order('external_hr_id')

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setEmployees((data ?? []).map(deriveEmployee))
      }
      setLoading(false)
    }

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
    const uniquePlans = Array.from(
      new Map(
        employees
          .map((e) => e.employee_plan_assignment?.[0]?.plan)
          .filter(Boolean)
          .map((p) => [p.plan_id, p])
      ).values()
    )
    return createListCollection({
      items: [
        { label: 'All Plans', value: 'all' },
        ...uniquePlans.map((p) => ({ label: p.plan_name, value: p.plan_id })),
      ],
    })
  }, [employees])

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
        const assignedPlanId = emp.employee_plan_assignment?.[0]?.plan?.plan_id
        if (assignedPlanId !== planFilter) return false
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
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                          {emp.external_hr_id ?? '—'}
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
                          <ActionsMenu empId={emp.employee_id} />
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
                <AddIndividualForm plans={plans} />
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </>
      )}
    </div>
  )
}
