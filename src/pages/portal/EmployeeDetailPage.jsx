import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Tabs } from '@ark-ui/react/tabs'
import { Accordion } from '@ark-ui/react/accordion'
import { Button, Chip } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import { colors } from '../../theme'
import { usePersona } from '../../context/PersonaContext'
import { generateMemberCertificate } from '../../lib/generateMemberCertificate'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatCurrency(val, currency = 'CAD') {
  if (val == null) return '—'
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(val)
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-5">
      {title && (
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-5">{title}</p>
      )}
      {children}
    </div>
  )
}

function QuickActionCard({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 hover:shadow-sm transition-all w-full"
    >
      <span
        className="mt-0.5 p-2 rounded-full shrink-0"
        style={{ backgroundColor: '#f0fdf4', color: colors.brandPrimary }}
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </button>
  )
}

function EnrollmentBanner({ onSend }) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-lg px-5 py-4 mb-6"
      style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}
    >
      <div className="flex items-center gap-3">
        <InfoOutlinedIcon style={{ color: '#2563eb' }} />
        <div>
          <p className="text-sm font-semibold text-blue-800">Enrollment Required</p>
          <p className="text-xs text-blue-700">
            This employee has not yet completed enrollment. Send them a reminder to get started.
          </p>
        </div>
      </div>
      <Button
        variant="contained"
        size="small"
        startIcon={<NotificationsOutlinedIcon />}
        onClick={onSend}
        style={{ backgroundColor: '#2563eb', whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        SEND ENROLLMENT REMINDER
      </Button>
    </div>
  )
}

function SelfEnrollmentBanner({ onStart }) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-lg px-5 py-4 mb-6"
      style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}
    >
      <div className="flex items-center gap-3">
        <InfoOutlinedIcon style={{ color: '#2563eb' }} />
        <div>
          <p className="text-sm font-semibold text-blue-800">Enrollment Required</p>
          <p className="text-xs text-blue-700">
            Welcome! You haven't enrolled in your benefits yet. Please complete the enrollment process to select your coverage options and designate your beneficiaries.
          </p>
        </div>
      </div>
      <Button
        variant="contained"
        size="small"
        startIcon={<AccountCircleOutlinedIcon />}
        onClick={onStart}
        style={{ backgroundColor: '#2563eb', whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        Start Enrollment Now
      </Button>
    </div>
  )
}

// ─── Reusable collapsible group with a table inside ───────────────────────────
function CollapsibleTableGroup({ label, count, columns, rows, emptyMessage }) {
  return (
    <Accordion.Root defaultValue={[label]} collapsible>
      <Accordion.Item value={label}>
        <Accordion.ItemTrigger className="flex items-center justify-between w-full px-5 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
          <span>{label} ({count})</span>
          <Accordion.ItemIndicator>
            <ChevronRightIcon
              fontSize="small"
              className="text-gray-400 transition-transform duration-200 [[data-state=open]_&]:rotate-90"
            />
          </Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          {rows.length === 0 ? (
            <p className="px-5 py-4 text-sm text-gray-400">{emptyMessage}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-5 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((cells, i) => (
                  <tr key={i} className={i < rows.length - 1 ? 'border-b border-gray-100' : ''}>
                    {cells.map((cell, j) => (
                      <td key={j} className={`px-5 py-3 ${j === 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  )
}

// ─── Beneficiaries & Dependents tab ──────────────────────────────────────────
function BeneficiariesDependentsTab({ memberId }) {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [dependents, setDependents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!memberId) {
      setLoading(false)
      return
    }

    async function fetchData() {
      const [benRes, depRes] = await Promise.all([
        supabase
          .from('beneficiary')
          .select('beneficiary_id, first_name, last_name, date_of_birth, relationship, beneficiary_type, allocation_pct, status')
          .eq('member_id', memberId)
          .order('beneficiary_type')
          .order('allocation_pct', { ascending: false }),
        supabase
          .from('dependent')
          .select('dependent_id, first_name, last_name, date_of_birth, relationship_type, dep_status, effective_date')
          .eq('member_id', memberId)
          .order('relationship_type'),
      ])
      setBeneficiaries(benRes.data ?? [])
      setDependents(depRes.data ?? [])
      setLoading(false)
    }

    fetchData()
  }, [memberId])

  if (loading) return <p className="text-sm text-gray-400 py-4">Loading...</p>

  if (!memberId) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
        <p className="text-sm text-gray-400">
          Employee is not yet enrolled. Beneficiaries and dependents can be added after enrollment.
        </p>
      </div>
    )
  }

  const primary    = beneficiaries.filter((b) => b.beneficiary_type === 'PRIMARY')
  const contingent = beneficiaries.filter((b) => b.beneficiary_type === 'CONTINGENT')

  return (
    <>
      {/* Beneficiaries */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Beneficiaries</p>
        </div>
        <CollapsibleTableGroup
          label="Primary"
          count={primary.length}
          columns={['Name', 'Relationship', 'Date of Birth', 'Allocation', 'Status']}
          rows={primary.map((b) => [
            `${b.first_name} ${b.last_name}`,
            b.relationship,
            formatDate(b.date_of_birth),
            `${b.allocation_pct}%`,
            b.status,
          ])}
          emptyMessage="No primary beneficiaries on file."
        />
        <CollapsibleTableGroup
          label="Contingent"
          count={contingent.length}
          columns={['Name', 'Relationship', 'Date of Birth', 'Allocation', 'Status']}
          rows={contingent.map((b) => [
            `${b.first_name} ${b.last_name}`,
            b.relationship,
            formatDate(b.date_of_birth),
            `${b.allocation_pct}%`,
            b.status,
          ])}
          emptyMessage="No contingent beneficiaries on file."
        />
      </div>

      {/* Dependents */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Dependents</p>
        </div>
        <CollapsibleTableGroup
          label="Dependents"
          count={dependents.length}
          columns={['Name', 'Relationship', 'Date of Birth', 'Effective Date', 'Status']}
          rows={dependents.map((d) => [
            `${d.first_name} ${d.last_name}`,
            d.relationship_type.replace('_', ' '),
            formatDate(d.date_of_birth),
            formatDate(d.effective_date),
            d.dep_status,
          ])}
          emptyMessage="No dependents on file."
        />
      </div>
    </>
  )
}

// ─── Plan Summary tab ─────────────────────────────────────────────────────────
function PlanSummaryTab({ emp }) {
  const member = emp.member?.find((m) => m.member_status === 'ACTIVE') ?? null
  const assignment = emp.employee_plan_assignment?.[0] ?? null
  const plan = member?.plan ?? assignment?.plan ?? null

  const [benefits, setBenefits] = useState([])
  const [loadingBenefits, setLoadingBenefits] = useState(false)

  useEffect(() => {
    if (!plan?.plan_id) return
    setLoadingBenefits(true)
    supabase
      .from('benefit')
      .select('benefit_id, benefit_name, benefit_type, coverage_formula, flat_amount, nem_amount, max_amount, waiting_period_days')
      .eq('plan_id', plan.plan_id)
      .eq('is_active', true)
      .order('benefit_type')
      .then(({ data }) => {
        setBenefits(data ?? [])
        setLoadingBenefits(false)
      })
  }, [plan?.plan_id])

  if (!plan) {
    return <p className="text-sm text-gray-400 py-6">No plan information available.</p>
  }

  return (
    <>
      <SectionCard title="Plan Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-5">
          <InfoRow label="Plan Name" value={plan.plan_name} />
          <InfoRow label="Plan Code" value={plan.plan_code} />
          <InfoRow label="Member Number" value={member?.member_number} />
          <InfoRow label="Effective Date" value={formatDate(member?.effective_date)} />
          <InfoRow label="Class" value={assignment?.class_code} />
          <InfoRow label="Division" value={assignment?.division_code} />
          <InfoRow label="Assignment Status" value={assignment?.status} />
          <InfoRow label="Member Status" value={member?.member_status} />
        </div>
      </SectionCard>

      {/* Benefits table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Benefits</p>
        </div>
        {loadingBenefits ? (
          <p className="text-sm text-gray-400 px-6 py-8">Loading benefits...</p>
        ) : benefits.length === 0 ? (
          <p className="text-sm text-gray-400 px-6 py-8">No benefits configured for this plan.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Benefit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Coverage Formula</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Flat Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">NEM</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Max</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Waiting (days)</th>
              </tr>
            </thead>
            <tbody>
              {benefits.map((b, i) => (
                <tr key={b.benefit_id} className={i < benefits.length - 1 ? 'border-b border-gray-100' : ''}>
                  <td className="px-6 py-3 font-medium text-gray-900">{b.benefit_name}</td>
                  <td className="px-6 py-3 text-gray-600">{b.benefit_type}</td>
                  <td className="px-6 py-3 text-gray-600">{b.coverage_formula.replace('_', ' ')}</td>
                  <td className="px-6 py-3 text-gray-600">{formatCurrency(b.flat_amount)}</td>
                  <td className="px-6 py-3 text-gray-600">{formatCurrency(b.nem_amount)}</td>
                  <td className="px-6 py-3 text-gray-600">{formatCurrency(b.max_amount)}</td>
                  <td className="px-6 py-3 text-gray-600">{b.waiting_period_days ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
const ALL_TABS = [
  { id: 'details',  label: 'Employee Details',          enrolledOnly: false },
  { id: 'plan',     label: 'Plan Summary',              enrolledOnly: true },
  { id: 'ben-dep',  label: 'Beneficiaries & Dependents', enrolledOnly: true },
]

export default function EmployeeDetailPage() {
  const { employeeId } = useParams()
  const navigate = useNavigate()
  const { personaKey } = usePersona()

  const [emp, setEmp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [certLoading, setCertLoading] = useState(false)

  useEffect(() => {
    async function fetchEmployee() {
      const { data, error: fetchErr } = await supabase
        .from('employee')
        .select(`
          employee_id, external_hr_id, first_name, last_name, date_of_birth,
          hire_date, employment_type, employment_status, annual_salary, salary_currency,
          province_state_code, email, phone_mobile, job_title,
          employee_plan_assignment (
            class_code, division_code, status, effective_date,
            plan ( plan_id, plan_name, plan_code, status )
          ),
          member (
            member_id, member_number, member_status, effective_date,
            plan ( plan_id, plan_name, plan_code )
          )
        `)
        .eq('employee_id', employeeId)
        .single()

      if (fetchErr) setError(fetchErr.message)
      else setEmp(data)
      setLoading(false)
    }
    fetchEmployee()
  }, [employeeId])

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>
  if (error)   return <p className="text-sm text-red-500">Error: {error}</p>
  if (!emp)    return <p className="text-sm text-gray-400">Employee not found.</p>

  const activeMember = emp.member?.find((m) => m.member_status === 'ACTIVE') ?? null
  const isEnrolled = activeMember !== null
  const tabs = ALL_TABS.filter((t) => !t.enrolledOnly || isEnrolled)

  async function handleDownloadCertificate() {
    setCertLoading(true)
    const assignment = emp.employee_plan_assignment?.[0] ?? null
    const planId = activeMember?.plan?.plan_id ?? assignment?.plan?.plan_id ?? null

    let benefits = []
    if (planId) {
      const { data } = await supabase
        .from('benefit')
        .select('benefit_name, benefit_type, coverage_formula, max_amount')
        .eq('plan_id', planId)
        .eq('is_active', true)
        .order('benefit_type')
      benefits = data ?? []
    }

    generateMemberCertificate({
      emp,
      member:     activeMember,
      plan:       activeMember?.plan ?? assignment?.plan ?? null,
      assignment,
      benefits,
    })
    setCertLoading(false)
  }

  return (
    <div className="w-full">
      {/* Back — only shown to sponsor admins */}
      {personaKey !== 'MEMBER' && (
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/portal/members')}
          sx={{ mb: 1, pl: 0 }}
        >
          Back to Members
        </Button>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
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
          <p className="text-sm text-gray-500 mt-0.5">
            {emp.external_hr_id}
            {emp.job_title ? ` · ${emp.job_title}` : ''}
          </p>
        </div>
        {isEnrolled && (
          <Button
            variant="outlined"
            startIcon={<CardMembershipOutlinedIcon />}
            onClick={handleDownloadCertificate}
            disabled={certLoading}
          >
            {certLoading ? 'GENERATING...' : '+ MEMBER CERTIFICATE'}
          </Button>
        )}
      </div>

      {/* Enrollment banner for non-enrolled employees */}
      {!isEnrolled && personaKey === 'MEMBER' && (
        <SelfEnrollmentBanner onStart={() => navigate(`/portal/members/${employeeId}/enroll`)} />
      )}
      {!isEnrolled && personaKey !== 'MEMBER' && (
        <EnrollmentBanner onSend={() => alert('Enrollment reminder sent (UI only).')} />
      )}

      {/* Tabs */}
      <Tabs.Root defaultValue="details">
        <Tabs.List className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              className="px-4 py-3 text-sm font-medium cursor-pointer whitespace-nowrap border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors data-[selected]:border-b-2 data-[selected]:text-gray-900"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
          <div className="flex-1" />
        </Tabs.List>

        {/* ── Employee Details tab ── */}
        <Tabs.Content value="details">
          <SectionCard title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-5">
              <InfoRow label="Employee ID" value={emp.external_hr_id} />
              <InfoRow label="Email" value={emp.email} />
              <InfoRow label="Date of Birth" value={formatDate(emp.date_of_birth)} />
              <InfoRow label="Phone" value={emp.phone_mobile} />
              <InfoRow label="Hire Date" value={formatDate(emp.hire_date)} />
              <InfoRow label="Annual Salary" value={formatCurrency(emp.annual_salary, emp.salary_currency)} />
              <InfoRow label="Province / State" value={emp.province_state_code} />
              <InfoRow label="Job Title" value={emp.job_title} />
              <InfoRow label="Employment Type" value={emp.employment_type} />
              <InfoRow label="Employment Status" value={emp.employment_status} />
            </div>
          </SectionCard>

          {/* I want to — quick actions (enrolled only) */}
          {isEnrolled && (
            <div className="mb-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">I Want To</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <QuickActionCard
                  icon={<PeopleOutlinedIcon fontSize="small" />}
                  title="Update Beneficiaries"
                  description="Add or change beneficiary information"
                  onClick={() => navigate('/portal/requests/new?type=BENEFICIARY_CHANGE')}
                />
                <QuickActionCard
                  icon={<SwapHorizOutlinedIcon fontSize="small" />}
                  title="Change Coverage"
                  description="Modify existing coverage elections"
                  onClick={() => navigate('/portal/requests/new?type=COVERAGE_CHANGE')}
                />
                <QuickActionCard
                  icon={<PersonAddOutlinedIcon fontSize="small" />}
                  title="Add / Remove Dependent"
                  description="Manage dependents on the plan"
                  onClick={() => navigate('/portal/requests/new?type=ADD_DEPENDENT')}
                />
                <QuickActionCard
                  icon={<EventOutlinedIcon fontSize="small" />}
                  title="Report Life Event"
                  description="Marriage, birth, retirement, etc."
                  onClick={() => navigate('/portal/requests/new?type=LIFE_EVENT')}
                />
              </div>
            </div>
          )}
        </Tabs.Content>

        {/* ── Plan Summary tab ── */}
        <Tabs.Content value="plan">
          <PlanSummaryTab emp={emp} />
        </Tabs.Content>

        {/* ── Beneficiaries & Dependents tab ── */}
        <Tabs.Content value="ben-dep">
          <BeneficiariesDependentsTab memberId={activeMember?.member_id ?? null} />
        </Tabs.Content>


      </Tabs.Root>
    </div>
  )
}
