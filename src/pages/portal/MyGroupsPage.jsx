import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePersona } from '../../context/PersonaContext'
import { createListCollection } from '@ark-ui/react/select'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import StatusChip from '../../components/StatusChip'
import FilterSelect from '../../components/FilterSelect'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined'
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import { colors } from '../../theme'

// ─── Pending action metadata ──────────────────────────────────────────────────
const ACTION_META = {
  MISSING_DOCUMENTS: { Icon: DescriptionOutlinedIcon,    label: 'Missing Documents',  color: '#dc2626' },
  OUTSTANDING_EOI:   { Icon: AssignmentLateOutlinedIcon, label: 'Outstanding EOI',    color: '#d97706' },
  UNSIGNED_RENEWAL:  { Icon: DrawOutlinedIcon,           label: 'Unsigned Renewal',   color: '#7c3aed' },
  MISSING_CENSUS:    { Icon: GroupsOutlinedIcon,         label: 'Missing Census',     color: '#0369a1' },
}

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcDays(renewalDate) {
  if (!renewalDate) return null
  return Math.floor((new Date(renewalDate) - new Date()) / 86400000)
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(val) {
  if (val == null) return '—'
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val)
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function RenewalBadge({ days }) {
  if (days === null) return <span className="text-gray-400 text-xs">—</span>

  const cfg = days < 0
    ? { bg: '#fee2e2', color: '#b91c1c', label: `${Math.abs(days)}d overdue` }
    : days <= 30
    ? { bg: '#ffedd5', color: '#c2410c', label: `${days}d` }
    : days <= 90
    ? { bg: '#fef9c3', color: '#854d0e', label: `${days}d` }
    : { bg: '#dcfce7', color: '#15803d', label: `${days}d` }

  return (
    <span
      className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <UnfoldMoreIcon style={{ fontSize: '1rem', color: '#9ca3af' }} />
  return sortDir === 'asc'
    ? <KeyboardArrowUpIcon style={{ fontSize: '1rem', color: colors.brandPrimary }} />
    : <KeyboardArrowDownIcon style={{ fontSize: '1rem', color: colors.brandPrimary }} />
}

function StatCard({ label, value, alert }) {
  return (
    <div
      className="bg-white border rounded-xl px-5 py-4"
      style={{ borderColor: alert ? '#fca5a5' : '#e5e7eb' }}
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

// ─── Column definitions ───────────────────────────────────────────────────────
const GRID = '1fr 90px 56px 64px 130px 72px 140px 130px 120px'

function ColHeader({ label, col, sortCol, sortDir, onSort }) {
  return (
    <button
      className="flex items-center gap-0.5 text-left hover:text-gray-700 transition-colors"
      onClick={() => onSort(col)}
    >
      {label} <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MyGroupsPage() {
  const navigate = useNavigate()
  const { activeEntity } = usePersona()
  const brokerId = activeEntity?.id ?? 'b0000001-0000-0000-0000-000000000001'

  const [groups, setGroups]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const [search, setSearch]                     = useState('')
  const [statusFilter, setStatusFilter]         = useState('all')
  const [provinceFilter, setProvinceFilter]     = useState('all')
  const [sizeFilter, setSizeFilter]             = useState('all')
  const [renewalMonthFilter, setRenewalMonthFilter] = useState('all')
  const [sortCol, setSortCol]                   = useState('renewalDate')
  const [sortDir, setSortDir]                   = useState('asc')

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('broker_sponsor')
        .select(`
          role,
          sponsor (
            sponsor_id, sponsor_name, province_state_code, total_lives, last_activity_date,
            group_contract ( contract_id, contract_number, status, renewal_date, annual_premium_estimate ),
            sponsor_pending_action ( id, action_type, description, due_date, resolved_at )
          )
        `)
        .eq('broker_id', brokerId)

      if (err) { setError(err.message); setLoading(false); return }

      setGroups(
        (data ?? []).map(({ role, sponsor }) => {
          const contracts = sponsor.group_contract ?? []
          // Primary contract: prefer the most relevant non-terminated contract
          const primaryContract = contracts.find((c) => c.status === 'PENDING')
            ?? contracts.find((c) => c.status === 'ACTIVE')
            ?? contracts[0]
          const renewalDate = primaryContract?.renewal_date ?? null
          return {
            sponsorId:      sponsor.sponsor_id,
            name:           sponsor.sponsor_name,
            province:       sponsor.province_state_code ?? '—',
            status:         primaryContract?.status ?? 'ACTIVE',
            lives:          sponsor.total_lives ?? 0,
            premium:        primaryContract?.annual_premium_estimate ?? null,
            lastActivity:   sponsor.last_activity_date ?? null,
            policyNumber:   primaryContract?.contract_number ?? '—',
            renewalDate,
            daysToRenewal:  calcDays(renewalDate),
            pendingActions: (sponsor.sponsor_pending_action ?? []).filter((a) => !a.resolved_at),
            role,
          }
        })
      )
      setLoading(false)
    }
    fetch()
  }, [brokerId])

  // ─── Filter collections ──────────────────────────────────────────────────────
  const provinceCollection = useMemo(() => createListCollection({
    items: [
      { label: 'All Provinces', value: 'all' },
      ...[...new Set(groups.map((g) => g.province).filter((p) => p && p !== '—'))]
        .sort().map((p) => ({ label: p, value: p })),
    ],
  }), [groups])

  const renewalMonthCollection = useMemo(() => createListCollection({
    items: [
      { label: 'All Months', value: 'all' },
      ...[...new Set(groups.filter((g) => g.renewalDate)
        .map((g) => new Date(g.renewalDate).getMonth()))].sort((a, b) => a - b)
        .map((m) => ({ label: MONTHS[m], value: String(m) })),
    ],
  }), [groups])

  const statusCollection = createListCollection({ items: [
    { label: 'All Statuses',     value: 'all' },
    { label: 'Active',           value: 'ACTIVE' },
    { label: 'Pending Renewal',  value: 'PENDING' },
    { label: 'Lapsed',           value: 'LAPSED' },
    { label: 'Terminated',       value: 'TERMINATED' },
  ]})

  const sizeCollection = createListCollection({ items: [
    { label: 'All Sizes',          value: 'all' },
    { label: 'Small (< 25 lives)', value: 'small' },
    { label: 'Medium (25–100)',    value: 'medium' },
    { label: 'Large (100+)',       value: 'large' },
  ]})

  // ─── Filtered + sorted ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return groups
      .filter((g) => {
        if (statusFilter !== 'all' && g.status !== statusFilter) return false
        if (provinceFilter !== 'all' && g.province !== provinceFilter) return false
        if (renewalMonthFilter !== 'all' && g.renewalDate) {
          if (String(new Date(g.renewalDate).getMonth()) !== renewalMonthFilter) return false
        }
        if (sizeFilter === 'small'  && g.lives >= 25)               return false
        if (sizeFilter === 'medium' && (g.lives < 25 || g.lives > 100)) return false
        if (sizeFilter === 'large'  && g.lives <= 100)              return false
        if (search) {
          const q = search.toLowerCase()
          if (!g.name.toLowerCase().includes(q) && !g.policyNumber.toLowerCase().includes(q))
            return false
        }
        return true
      })
      .sort((a, b) => {
        let av, bv
        if (sortCol === 'renewalDate') {
          av = a.renewalDate ? new Date(a.renewalDate).getTime() : Infinity
          bv = b.renewalDate ? new Date(b.renewalDate).getTime() : Infinity
        } else if (sortCol === 'lives') {
          av = a.lives; bv = b.lives
        } else if (sortCol === 'premium') {
          av = a.premium ?? 0; bv = b.premium ?? 0
        } else if (sortCol === 'lastActivity') {
          av = a.lastActivity ? new Date(a.lastActivity).getTime() : 0
          bv = b.lastActivity ? new Date(b.lastActivity).getTime() : 0
        } else {
          av = a.name; bv = b.name
        }
        if (av < bv) return sortDir === 'asc' ? -1 : 1
        if (av > bv) return sortDir === 'asc' ?  1 : -1
        return 0
      })
  }, [groups, statusFilter, provinceFilter, sizeFilter, renewalMonthFilter, search, sortCol, sortDir])

  function toggleSort(col) {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortCol(col); setSortDir('asc') }
  }

  // ─── Summary stats ────────────────────────────────────────────────────────────
  const totalLives   = groups.reduce((s, g) => s + g.lives, 0)
  const totalPremium = groups.reduce((s, g) => s + (g.premium ?? 0), 0)
  const totalPending = groups.reduce((s, g) => s + g.pendingActions.length, 0)

  if (loading) return <p className="text-sm text-gray-400">Loading your groups…</p>
  if (error)   return <p className="text-sm text-red-500">Error: {error}</p>

  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Groups</h1>
      <p className="text-sm text-gray-500 mb-6">
        Your full book of business — all groups tied to your broker code.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Groups"    value={groups.length} />
        <StatCard label="Total Lives"     value={totalLives.toLocaleString()} />
        <StatCard label="Premium Volume"  value={formatCurrency(totalPremium)} />
        <StatCard label="Pending Actions" value={totalPending} alert={totalPending > 0} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-56">
          <SearchOutlinedIcon
            fontSize="small"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by group name or policy number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400"
          />
        </div>
        <FilterSelect collection={statusCollection}       value={statusFilter}       onChange={setStatusFilter}       placeholder="All Statuses"    />
        <FilterSelect collection={provinceCollection}     value={provinceFilter}     onChange={setProvinceFilter}     placeholder="All Provinces"   />
        <FilterSelect collection={renewalMonthCollection} value={renewalMonthFilter} onChange={setRenewalMonthFilter} placeholder="Renewal Month"   />
        <FilterSelect collection={sizeCollection}         value={sizeFilter}         onChange={setSizeFilter}         placeholder="Group Size"      />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header row */}
        <div
          className="grid items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100
                     text-xs font-bold text-gray-500 uppercase tracking-wider"
          style={{ gridTemplateColumns: GRID }}
        >
          <span>Group</span>
          <span>Policy #</span>
          <span>Prov.</span>
          <ColHeader label="Lives"         col="lives"        sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
          <span>Status</span>
          <span>Actions</span>
          <ColHeader label="Renewal"       col="renewalDate"  sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
          <ColHeader label="Premium Vol."  col="premium"      sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
          <ColHeader label="Last Activity" col="lastActivity" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
        </div>

        {/* Data rows */}
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">No groups match your filters.</p>
        ) : (
          filtered.map((g) => (
            <div
              key={g.sponsorId}
              className="grid items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0
                         hover:bg-gray-50 cursor-pointer transition-colors"
              style={{ gridTemplateColumns: GRID }}
              onClick={() => navigate(`/portal/broker/groups/${g.sponsorId}`)}
            >
              {/* Name + role tag */}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-blue-600 truncate">{g.name}</p>
                {g.role !== 'PRIMARY' && (
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                    {g.role.replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* Policy # */}
              <span className="text-sm text-gray-600 font-mono truncate">{g.policyNumber}</span>

              {/* Province */}
              <span className="text-sm text-gray-600">{g.province}</span>

              {/* Lives */}
              <span className="text-sm font-medium text-gray-900">{g.lives.toLocaleString()}</span>

              {/* Status */}
              <StatusChip status={g.status} />

              {/* Pending action icons */}
              <div className="flex items-center gap-1">
                {g.pendingActions.length === 0 ? (
                  <span className="text-xs text-gray-300">—</span>
                ) : (
                  g.pendingActions.map((action) => {
                    const meta = ACTION_META[action.action_type]
                    if (!meta) return null
                    const { Icon } = meta
                    return (
                      <span
                        key={action.id}
                        title={`${meta.label}${action.due_date ? ` · due ${formatDate(action.due_date)}` : ''}`}
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full"
                        style={{ backgroundColor: `${meta.color}18` }}
                      >
                        <Icon style={{ fontSize: '0.8rem', color: meta.color }} />
                      </span>
                    )
                  })
                )}
              </div>

              {/* Renewal date + countdown */}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-500">{formatDate(g.renewalDate)}</span>
                <RenewalBadge days={g.daysToRenewal} />
              </div>

              {/* Premium */}
              <span className="text-sm text-gray-700">{formatCurrency(g.premium)}</span>

              {/* Last activity */}
              <span className="text-sm text-gray-500">{formatDate(g.lastActivity)}</span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          Showing {filtered.length} of {groups.length} groups
        </p>
      )}
    </div>
  )
}
