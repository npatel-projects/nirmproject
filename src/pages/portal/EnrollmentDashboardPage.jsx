import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu } from '@ark-ui/react/menu'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { supabase } from '../../lib/supabase'
import { usePersona } from '../../context/PersonaContext'
import { Tabs } from '@ark-ui/react/tabs'
import SearchIcon from '@mui/icons-material/Search'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysSince(dateStr) {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconColor, iconBg, label, value, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
        <Icon style={{ color: iconColor, fontSize: 20 }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── EOI status badge ─────────────────────────────────────────────────────────
function EoiBadge({ status }) {
  const cfg = {
    PENDING:  { bg: '#fef9c3', text: '#854d0e', label: 'Pending' },
    RECEIVED: { bg: '#dbeafe', text: '#1d4ed8', label: 'Received' },
    APPROVED: { bg: '#dcfce7', text: '#15803d', label: 'Approved' },
    DECLINED: { bg: '#fee2e2', text: '#b91c1c', label: 'Declined' },
  }[status] ?? { bg: '#f3f4f6', text: '#6b7280', label: status }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
      {cfg.label}
    </span>
  )
}

// ─── Enrollment Status tab ────────────────────────────────────────────────────
const OVERDUE_DAYS = 30

function EnrollmentTab({ sponsorId }) {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('pending') // all | pending | overdue | enrolled

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('employee')
        .select(`
          employee_id, external_hr_id, first_name, last_name,
          email, hire_date, employment_status,
          employee_plan_assignment ( status, plan ( plan_name ) ),
          member ( member_status )
        `)
        .eq('sponsor_id', sponsorId)
        .neq('employment_status', 'TERMINATED')
        .order('hire_date', { ascending: false })

      setEmployees(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [sponsorId])

  const derived = useMemo(() => employees.map((e) => {
    const isEnrolled     = e.member?.some((m) => m.member_status === 'ACTIVE') ?? false
    const assignStatus   = e.employee_plan_assignment?.[0]?.status ?? null
    const isPending      = !isEnrolled && assignStatus === 'PENDING_ENROLLMENT'
    const days           = daysSince(e.hire_date)
    const isOverdue      = isPending && days != null && days > OVERDUE_DAYS
    const planName       = e.employee_plan_assignment?.[0]?.plan?.plan_name ?? '—'
    return { ...e, isEnrolled, isPending, isOverdue, daysSinceHire: days, planName }
  }), [employees])

  const stats = useMemo(() => ({
    total:    derived.length,
    enrolled: derived.filter((e) => e.isEnrolled).length,
    pending:  derived.filter((e) => e.isPending).length,
    overdue:  derived.filter((e) => e.isOverdue).length,
  }), [derived])

  const filtered = useMemo(() => {
    let list = derived
    if (filter === 'pending')  list = list.filter((e) => e.isPending)
    if (filter === 'overdue')  list = list.filter((e) => e.isOverdue)
    if (filter === 'enrolled') list = list.filter((e) => e.isEnrolled)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((e) =>
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
        (e.external_hr_id ?? '').toLowerCase().includes(q) ||
        (e.email ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [derived, filter, search])

  const FILTERS = [
    { key: 'pending',  label: 'Pending Enrollment' },
    { key: 'overdue',  label: `Overdue (>${OVERDUE_DAYS}d)` },
    { key: 'all',      label: 'All Employees' },
  ]

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={PeopleAltOutlinedIcon}        iconColor="#6b7280" iconBg="#f3f4f6" label="Total Employees"    value={stats.total} />
        <StatCard icon={CheckCircleOutlineIcon}        iconColor="#15803d" iconBg="#dcfce7" label="Enrolled"           value={stats.enrolled} />
        <StatCard icon={HourglassEmptyOutlinedIcon}   iconColor="#d97706" iconBg="#fef9c3" label="Pending Enrollment" value={stats.pending} />
        <StatCard icon={WarningAmberOutlinedIcon}     iconColor="#b91c1c" iconBg="#fee2e2" label="Overdue"            value={stats.overdue} sub={`>${OVERDUE_DAYS} days since hire`} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative">
          <SearchIcon fontSize="small" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400 bg-white w-56"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f.key ? 'bg-interactive text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Hire Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Days Since Hire</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr
                  key={e.employee_id}
                  className={i < filtered.length - 1 ? 'border-b border-gray-100' : ''}
                >
                  <td className="px-5 py-3">
                    <p
                      className="font-medium text-interactive hover:underline cursor-pointer"
                      onClick={() => navigate(`/portal/members/${e.employee_id}`)}
                    >
                      {e.first_name} {e.last_name}
                    </p>
                    <p className="text-xs text-gray-400">{e.external_hr_id} · {e.email}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{e.planName}</td>
                  <td className="px-5 py-3 text-gray-600">{formatDate(e.hire_date)}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {e.daysSinceHire != null ? `${e.daysSinceHire}d` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    {e.isEnrolled ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700">
                        <CheckCircleOutlineIcon style={{ fontSize: 12 }} /> Enrolled
                      </span>
                    ) : e.isOverdue ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-500">
                        <HourglassEmptyOutlinedIcon style={{ fontSize: 12 }} /> Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-600">
                        <HourglassEmptyOutlinedIcon style={{ fontSize: 12 }} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Menu.Root>
                      <Menu.Trigger asChild>
                        <button className="p-1 rounded hover:bg-gray-100 focus:outline-none" aria-label="Row actions">
                          <MoreVertIcon fontSize="small" className="text-gray-400" />
                        </button>
                      </Menu.Trigger>
                      <Menu.Positioner>
                        <Menu.Content className="bg-white border border-gray-200 rounded shadow-lg z-50 py-1 min-w-36">
                          <Menu.Item
                            value="view"
                            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none"
                            onClick={() => navigate(`/portal/members/${e.employee_id}?from=enrollment`)}
                          >
                            View Profile
                          </Menu.Item>
                          {!e.isEnrolled && (
                            <>
                              <Menu.Item
                                value="enroll"
                                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none"
                                onClick={() => navigate(`/portal/members/${e.employee_id}/enroll?from=enrollment`)}
                              >
                                Enroll
                              </Menu.Item>
                              <Menu.Item
                                value="remind"
                                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50 outline-none"
                                onClick={() => alert(`Enrollment reminder sent to ${e.email} (UI only).`)}
                              >
                                Send Reminder
                              </Menu.Item>
                            </>
                          )}
                        </Menu.Content>
                      </Menu.Positioner>
                    </Menu.Root>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                    No employees match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}

// ─── EOI Tracking tab ─────────────────────────────────────────────────────────
function EoiTab({ sponsorId }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('PENDING')
  const [search, setSearch]           = useState('')
  const [resolving, setResolving]     = useState(null) // id being updated

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('eoi_submission')
        .select(`
          id, benefit_type, amount_applied, status, requested_at, resolved_at, notes,
          employee ( employee_id, first_name, last_name, external_hr_id, email ),
          plan ( plan_name )
        `)
        .eq('sponsor_id', sponsorId)
        .order('requested_at', { ascending: false })
      setSubmissions(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [sponsorId])

  async function updateStatus(id, newStatus) {
    setResolving(id)
    const { error } = await supabase
      .from('eoi_submission')
      .update({
        status:      newStatus,
        resolved_at: ['APPROVED', 'DECLINED'].includes(newStatus) ? new Date().toISOString() : null,
      })
      .eq('id', id)
    if (!error) {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: newStatus, resolved_at: ['APPROVED', 'DECLINED'].includes(newStatus) ? new Date().toISOString() : null }
            : s
        )
      )
    }
    setResolving(null)
  }

  const FILTERS = [
    { key: 'PENDING',  label: 'Pending' },
    { key: 'RECEIVED', label: 'Received' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'DECLINED', label: 'Declined' },
    { key: 'all',      label: 'All' },
  ]

  const filtered = useMemo(() => {
    let list = submissions
    if (filter !== 'all') list = list.filter((s) => s.status === filter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((s) =>
        `${s.employee?.first_name} ${s.employee?.last_name}`.toLowerCase().includes(q) ||
        (s.employee?.external_hr_id ?? '').toLowerCase().includes(q) ||
        (s.benefit_type ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [submissions, filter, search])

  const counts = useMemo(() => ({
    PENDING:  submissions.filter((s) => s.status === 'PENDING').length,
    RECEIVED: submissions.filter((s) => s.status === 'RECEIVED').length,
  }), [submissions])

  function formatAmount(v) {
    if (v == null) return '—'
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v)
  }

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={AssignmentLateOutlinedIcon} iconColor="#d97706" iconBg="#fef9c3" label="Awaiting EOI"    value={counts.PENDING} sub="Requires documentation" />
        <StatCard icon={CheckCircleOutlineIcon}     iconColor="#1d4ed8" iconBg="#dbeafe" label="Documents Received" value={counts.RECEIVED} sub="Under review" />
        <StatCard icon={CheckOutlinedIcon}          iconColor="#15803d" iconBg="#dcfce7" label="Approved"       value={submissions.filter((s) => s.status === 'APPROVED').length} />
        <StatCard icon={CloseOutlinedIcon}          iconColor="#b91c1c" iconBg="#fee2e2" label="Declined"       value={submissions.filter((s) => s.status === 'DECLINED').length} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <SearchIcon fontSize="small" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee or benefit…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400 bg-white w-64"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f.key ? 'bg-interactive text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Benefit</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount Applied</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Requested</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className={i < filtered.length - 1 ? 'border-b border-gray-100' : ''}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{s.employee?.first_name} {s.employee?.last_name}</p>
                    <p className="text-xs text-gray-400">{s.employee?.external_hr_id} · {s.employee?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600 text-xs">{s.plan?.plan_name ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                      {s.benefit_type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{formatAmount(s.amount_applied)}</td>
                  <td className="px-5 py-3 text-gray-600">{formatDate(s.requested_at)}</td>
                  <td className="px-5 py-3"><EoiBadge status={s.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {s.status === 'PENDING' && (
                        <button
                          disabled={resolving === s.id}
                          onClick={() => updateStatus(s.id, 'RECEIVED')}
                          className="text-xs text-interactive hover:underline font-medium disabled:opacity-50"
                        >
                          Mark Received
                        </button>
                      )}
                      {s.status === 'RECEIVED' && (
                        <>
                          <button
                            disabled={resolving === s.id}
                            onClick={() => updateStatus(s.id, 'APPROVED')}
                            className="text-xs text-green-600 hover:underline font-medium disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            disabled={resolving === s.id}
                            onClick={() => updateStatus(s.id, 'DECLINED')}
                            className="text-xs text-red-600 hover:underline font-medium disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {(s.status === 'APPROVED' || s.status === 'DECLINED') && (
                        <span className="text-xs text-gray-400">Resolved {formatDate(s.resolved_at)}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                    No EOI submissions match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function EnrollmentDashboardPage() {
  const { sponsorId } = usePersona()

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Enrollment & EOI</h1>
      <p className="text-sm text-gray-500 mb-5">Track pending enrollments, send reminders, and manage Evidence of Insurability submissions.</p>
      <hr className="border-gray-200 mb-6" />

      <Tabs.Root defaultValue="enrollment">
        <Tabs.List className="flex border-b border-gray-200 mb-6">
          <Tabs.Trigger
            value="enrollment"
            className="px-4 py-3 text-sm font-medium cursor-pointer whitespace-nowrap border-b-2 border-transparent text-gray-500 hover:text-gray-800 transition-colors data-[selected]:border-interactive data-[selected]:text-interactive"
          >
            Enrollment Status
          </Tabs.Trigger>
          <Tabs.Trigger
            value="eoi"
            className="px-4 py-3 text-sm font-medium cursor-pointer whitespace-nowrap border-b-2 border-transparent text-gray-500 hover:text-gray-800 transition-colors data-[selected]:border-interactive data-[selected]:text-interactive"
          >
            EOI Tracking
          </Tabs.Trigger>
          <div className="flex-1" />
        </Tabs.List>

        <Tabs.Content value="enrollment">
          <EnrollmentTab sponsorId={sponsorId} />
        </Tabs.Content>

        <Tabs.Content value="eoi">
          <EoiTab sponsorId={sponsorId} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
