import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Tabs } from '@ark-ui/react/tabs'
import { Dialog } from '@ark-ui/react/dialog'
import { Button, Chip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { colors } from '../../theme'
import { usePersona } from '../../context/PersonaContext'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-CA', {
    month: '2-digit', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatCurrency(val) {
  if (val == null) return '—'
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val)
}

const CLAIM_TYPE_LABELS = {
  LIFE:    'Life Insurance',
  ADD:     'Accidental Death & Dismemberment',
  STD:     'Short Term Disability',
  LTD:     'Long Term Disability',
  CI:      'Critical Illness',
  HEALTH:  'Medical',
  DENTAL:  'Dental',
  VISION:  'Vision',
  DRUG:    'Prescription Drug',
  HSA:     'Health Spending Account',
  WSA:     'Wellness Spending Account',
}

const IN_PROGRESS_STATUSES  = ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPEALED']
const COMPLETED_STATUSES    = ['APPROVED', 'PARTIALLY_APPROVED', 'DECLINED', 'CLOSED']

// ─── Status chip ──────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const map = {
    DRAFT:              { label: 'Draft',      borderColor: '#9ca3af', color: '#6b7280' },
    SUBMITTED:          { label: 'Pending',    borderColor: '#d97706', color: '#d97706' },
    IN_REVIEW:          { label: 'In Review',  borderColor: colors.link, color: colors.link },
    APPEALED:           { label: 'Appealed',   borderColor: '#7c3aed', color: '#7c3aed' },
    APPROVED:           { label: 'Approved',   borderColor: '#16a34a', color: '#16a34a' },
    PARTIALLY_APPROVED: { label: 'Partial',    borderColor: '#d97706', color: '#d97706' },
    DECLINED:           { label: 'Declined',   borderColor: '#dc2626', color: '#dc2626' },
    CLOSED:             { label: 'Closed',     borderColor: '#9ca3af', color: '#6b7280' },
  }
  const cfg = map[status] ?? { label: status, borderColor: '#9ca3af', color: '#6b7280' }
  return (
    <Chip
      label={cfg.label}
      size="small"
      variant="outlined"
      sx={{
        fontSize: 11,
        height: 22,
        fontWeight: 600,
        borderColor: cfg.borderColor,
        color: cfg.color,
      }}
    />
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <tr>
      <td colSpan={99} className="py-12 text-center text-sm text-gray-400">{message}</td>
    </tr>
  )
}

// ─── Sortable th ──────────────────────────────────────────────────────────────
function Th({ children, col, sortCol, sortDir, onSort }) {
  const active = sortCol === col
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap"
      onClick={() => onSort(col)}
    >
      <span className="flex items-center gap-1">
        {children}
        <span className="text-gray-300">
          {active ? (sortDir === 'asc' ? '▲' : '▼') : '⇕'}
        </span>
      </span>
    </th>
  )
}

function useSort(initial) {
  const [sortCol, setSortCol] = useState(initial)
  const [sortDir, setSortDir] = useState('desc')
  function onSort(col) {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortCol(col); setSortDir('asc') }
  }
  function sortRows(rows, key) {
    return [...rows].sort((a, b) => {
      const av = a[key] ?? '', bv = b[key] ?? ''
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }
  return { sortCol, sortDir, onSort, sortRows }
}

// ─── Delete confirmation dialog ───────────────────────────────────────────────
function DeleteDialog({ target, onConfirm, onClose, loading }) {
  return (
    <Dialog.Root open={!!target} onOpenChange={({ open }) => { if (!open) onClose() }}>
      <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-40" />
      <Dialog.Positioner className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Dialog.Content className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
          <Dialog.Title className="text-base font-semibold text-gray-900 mb-2">Delete Draft Claim</Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-6">
            Are you sure you want to delete claim <strong>{target?.claim_number}</strong>? This cannot be undone.
          </Dialog.Description>
          <div className="flex justify-end gap-3">
            <Button variant="outlined" size="small" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="contained" size="small" color="error" onClick={onConfirm} disabled={loading}>
              {loading ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

// ─── In Progress tab ──────────────────────────────────────────────────────────
function InProgressTab({ claims, onDeleted }) {
  const navigate = useNavigate()
  const { sortCol, sortDir, onSort, sortRows } = useSort('submission_date')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  const sorted = sortRows(claims, sortCol)

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('claim').delete().eq('claim_id', deleteTarget.claim_id)
    setDeleting(false)
    setDeleteTarget(null)
    onDeleted()
  }

  return (
    <>
      <p className="text-sm text-gray-500 mb-4">Click on a claim number to see more details</p>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th col="claim_number"    sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Claim Number</Th>
              <Th col="submission_date" sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Submitted Date</Th>
              <Th col="claimantName"    sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Member</Th>
              <Th col="typeLabel"       sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Type</Th>
              <Th col="amount_claimed"  sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Amount</Th>
              <Th col="status"          sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Status</Th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {sorted.length === 0 ? (
              <EmptyState message="No in-progress claims" />
            ) : sorted.map((c) => (
              <tr key={c.claim_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => navigate(`/portal/claims/${c.claim_id}`)}
                  >
                    {c.claim_number}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateTime(c.submission_date)}</td>
                <td className="px-4 py-3 text-gray-800">{c.claimantName}</td>
                <td className="px-4 py-3 text-gray-600">{c.typeLabel}</td>
                <td className="px-4 py-3 text-gray-800">{c.amount_claimed != null ? formatCurrency(c.amount_claimed) : '—'}</td>
                <td className="px-4 py-3"><StatusChip status={c.status} /></td>
                <td className="px-4 py-3">
                  {c.status === 'DRAFT' && (
                    <button
                      className="text-red-400 hover:text-red-600 transition-colors"
                      onClick={() => setDeleteTarget(c)}
                      title="Delete draft"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteDialog
        target={deleteTarget}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  )
}

// ─── Completed tab ────────────────────────────────────────────────────────────
function CompletedTab({ claims }) {
  const navigate = useNavigate()
  const { sortCol, sortDir, onSort, sortRows } = useSort('paid_date')

  const sorted = sortRows(claims, sortCol)

  return (
    <>
      <p className="text-sm text-gray-500 mb-4">
        Showing approved, partially approved, declined, and closed claims
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th col="paid_date"    sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Date</Th>
              <Th col="typeLabel"    sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Benefit Type</Th>
              <Th col="claimantName" sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Claim is for</Th>
              <Th col="amount_claimed" sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Claim Total</Th>
              <Th col="paid_amount"  sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Reimbursed</Th>
              <Th col="claim_number" sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Claim Number</Th>
              <Th col="status"       sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {sorted.length === 0 ? (
              <EmptyState message="No completed claims" />
            ) : sorted.map((c) => (
              <tr key={c.claim_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-blue-600 font-medium whitespace-nowrap">
                  <button
                    className="hover:underline"
                    onClick={() => navigate(`/portal/claims/${c.claim_id}`)}
                  >
                    {formatDate(c.paid_date || c.submission_date)}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.typeLabel}</td>
                <td className="px-4 py-3 text-gray-800">{c.claimantName}</td>
                <td className="px-4 py-3 text-gray-800">{formatCurrency(c.amount_claimed)}</td>
                <td className="px-4 py-3 text-gray-800">{formatCurrency(c.paid_amount)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{c.claim_number}</td>
                <td className="px-4 py-3"><StatusChip status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ─── Estimates tab ────────────────────────────────────────────────────────────
function EstimatesTab({ estimates }) {
  const { sortCol, sortDir, onSort, sortRows } = useSort('statement_date')
  const sorted = sortRows(estimates, sortCol)

  return (
    <>
      <p className="text-sm text-gray-500 mb-4">
        Dental estimates are pre-approved based on the benefit plan and claims information on record.
        The claimant must be covered at the time of treatment.
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th col="statement_date"  sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Date of Statement</Th>
              <Th col="typeLabel"       sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Benefit Type</Th>
              <Th col="claimant_name"   sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Claimant</Th>
              <Th col="estimate_number" sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Estimate Number</Th>
              <Th col="amount_claimed"  sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Amount Claimed</Th>
              <Th col="payable_amount"  sortCol={sortCol} sortDir={sortDir} onSort={onSort}>Payable by Plan</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {sorted.length === 0 ? (
              <EmptyState message="No dental estimates" />
            ) : sorted.map((e) => (
              <tr key={e.estimate_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-blue-600 font-medium whitespace-nowrap">
                  {formatDate(e.statement_date)}
                </td>
                <td className="px-4 py-3 text-gray-600">{e.typeLabel}</td>
                <td className="px-4 py-3 text-gray-800">{e.claimant_name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{e.estimate_number}</td>
                <td className="px-4 py-3 text-gray-800">{formatCurrency(e.amount_claimed)}</td>
                <td className="px-4 py-3 text-gray-800">{formatCurrency(e.payable_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function ClaimsPage() {
  const navigate = useNavigate()
  const { personaKey, activeEntity, sponsorId } = usePersona()
  const isMember = personaKey === 'MEMBER'

  const [allClaims,    setAllClaims]    = useState([])
  const [estimates,    setEstimates]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [activeTab,    setActiveTab]    = useState('in-progress')

  async function fetchData() {
    setLoading(true)
    setError(null)

    // Build the claim query — join through member→employee to scope by sponsor
    let claimQuery = supabase
      .from('claim')
      .select(`
        claim_id, claim_number, claim_type, status,
        incident_date, submission_date, paid_date,
        amount_claimed, approved_amount, paid_amount,
        member!inner(
          member_id, member_number,
          employee!inner(first_name, last_name, sponsor_id)
        ),
        benefit(benefit_name, benefit_type)
      `)

    // Scope by persona
    if (personaKey === 'MEMBER' && activeEntity?.id) {
      claimQuery = claimQuery.eq('member_id', activeEntity.id)
    } else {
      claimQuery = claimQuery.eq('member.employee.sponsor_id', sponsorId)
    }

    // Build the estimates query
    let estQuery = supabase
      .from('claim_estimate')
      .select(`
        estimate_id, estimate_number, claim_type,
        statement_date, claimant_name,
        amount_claimed, payable_amount,
        member!inner(
          member_id,
          employee!inner(sponsor_id)
        ),
        benefit(benefit_name, benefit_type)
      `)

    if (personaKey === 'MEMBER' && activeEntity?.id) {
      estQuery = estQuery.eq('member_id', activeEntity.id)
    } else {
      estQuery = estQuery.eq('member.employee.sponsor_id', sponsorId)
    }

    const [{ data: claimsData, error: claimsErr }, { data: estData, error: estErr }] =
      await Promise.all([claimQuery, estQuery])

    if (claimsErr || estErr) {
      setError((claimsErr || estErr).message)
      setLoading(false)
      return
    }

    const derivedClaims = (claimsData ?? []).map((c) => ({
      ...c,
      claimantName: c.member?.employee
        ? `${c.member.employee.first_name} ${c.member.employee.last_name}`
        : c.member?.member_number ?? '—',
      typeLabel: CLAIM_TYPE_LABELS[c.claim_type] ?? c.claim_type,
    }))

    const derivedEst = (estData ?? []).map((e) => ({
      ...e,
      typeLabel: CLAIM_TYPE_LABELS[e.claim_type] ?? e.claim_type,
    }))

    setAllClaims(derivedClaims)
    setEstimates(derivedEst)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [sponsorId, personaKey, activeEntity?.id])

  const inProgress = useMemo(
    () => allClaims.filter((c) => IN_PROGRESS_STATUSES.includes(c.status)),
    [allClaims]
  )
  const completed = useMemo(
    () => allClaims.filter((c) => COMPLETED_STATUSES.includes(c.status)),
    [allClaims]
  )

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Claims</h1>
        {isMember && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/portal/claims/new')}
          >
            Create Claim
          </Button>
        )}
      </div>

      {loading && (
        <div className="text-sm text-gray-400 py-12 text-center">Loading claims…</div>
      )}
      {error && (
        <div className="text-sm text-red-500 py-4">Error: {error}</div>
      )}

      {!loading && !error && (
        <Tabs.Root
          value={activeTab}
          onValueChange={({ value }) => setActiveTab(value)}
        >
          <Tabs.List className="flex gap-6 border-b border-gray-200 mb-6">
            {[
              { value: 'in-progress', label: 'In Progress',  count: inProgress.length },
              { value: 'completed',   label: 'Completed',    count: completed.length },
              { value: 'estimates',   label: 'Estimates',    count: estimates.length },
            ].map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className="pb-3 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[selected]:border-blue-600 data-[selected]:text-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                {tab.label}
                <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="in-progress">
            <InProgressTab claims={inProgress} onDeleted={fetchData} />
          </Tabs.Content>
          <Tabs.Content value="completed">
            <CompletedTab claims={completed} />
          </Tabs.Content>
          <Tabs.Content value="estimates">
            <EstimatesTab estimates={estimates} />
          </Tabs.Content>
        </Tabs.Root>
      )}
    </div>
  )
}
