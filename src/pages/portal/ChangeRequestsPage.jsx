import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePersona } from '../../context/PersonaContext'
import { Tabs } from '@ark-ui/react/tabs'
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import StatusChip from '../../components/StatusChip'

const IN_PROGRESS_STATUSES = ['DRAFT', 'SUBMITTED', 'IN_REVIEW']
const COMPLETED_STATUSES   = ['APPROVED', 'DECLINED', 'CANCELLED']

const REQUEST_TYPE_LABELS = {
  BENEFICIARY_CHANGE: 'Beneficiary Change',
  ADD_DEPENDENT:      'Add Dependent',
  REMOVE_DEPENDENT:   'Remove Dependent',
  LIFE_EVENT:         'Life Event',
  COVERAGE_CHANGE:    'Coverage Change',
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AssignmentOutlinedIcon style={{ fontSize: 40, color: '#d1d5db', marginBottom: 12 }} />
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}

function RequestRow({ req, onClick }) {
  const memberName = req.employee
    ? `${req.employee.first_name} ${req.employee.last_name}`
    : '—'

  return (
    <tr
      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-5 py-3.5 text-sm font-medium">
        <button className="text-interactive hover:underline" onClick={onClick}>
          {req.request_number ?? '—'}
        </button>
      </td>
      <td className="px-5 py-3.5 text-sm text-gray-700">
        {REQUEST_TYPE_LABELS[req.request_type] ?? req.request_type}
      </td>
      <td className="px-5 py-3.5 text-sm text-gray-500">{memberName}</td>
      <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(req.submission_date)}</td>
      <td className="px-5 py-3.5">
        <StatusChip status={req.status} />
      </td>
    </tr>
  )
}

function RequestTable({ rows, navigate }) {
  return (
    <>
      <p className="text-sm text-gray-500 mb-4">Click on a request number to see more details</p>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              {['Request #', 'Type', 'Member', 'Submitted', 'Status'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <RequestRow
                key={r.change_request_id}
                req={r}
                onClick={() => navigate(`/portal/requests/${r.change_request_id}`)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

const tabClass = `px-4 py-2.5 text-sm font-medium text-gray-500 border-b-2 border-transparent -mb-px transition-colors
  data-[selected]:text-interactive data-[selected]:border-interactive hover:text-gray-700 focus:outline-none`

export default function ChangeRequestsPage() {
  const navigate = useNavigate()
  const { personaKey, activeEntity, sponsorId } = usePersona()
  const isMember  = personaKey === 'MEMBER'

  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    async function fetchData() {
      let query = supabase
        .from('change_request')
        .select(`
          change_request_id, request_number, request_type, status,
          submission_date, effective_date,
          employee(first_name, last_name, sponsor_id)
        `)
        .order('created_at', { ascending: false })

      if (isMember && activeEntity?.employeeId) {
        query = query.eq('employee_id', activeEntity.employeeId)
      } else {
        // Sponsor sees all requests for their employees
        query = query.eq('employee.sponsor_id', sponsorId)
      }

      const { data, error } = await query
      if (error) setError(error.message)
      else setRequests(data ?? [])
      setLoading(false)
    }
    fetchData()
  }, [isMember, activeEntity, sponsorId])

  const inProgress = requests.filter((r) => IN_PROGRESS_STATUSES.includes(r.status))
  const completed  = requests.filter((r) => COMPLETED_STATUSES.includes(r.status))

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Change Request</h1>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/portal/requests/new')}
        >
          New Request
        </Button>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error   && <p className="text-sm text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <Tabs.Root defaultValue="in-progress">
          <Tabs.List className="flex gap-6 border-b border-gray-200 mb-6">
            <Tabs.Trigger value="in-progress" className={tabClass}>
              In Progress
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {inProgress.length}
              </span>
            </Tabs.Trigger>
            <Tabs.Trigger value="completed" className={tabClass}>
              Completed
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {completed.length}
              </span>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="in-progress">
            {inProgress.length === 0
              ? <EmptyState label="No in-progress requests." />
              : <RequestTable rows={inProgress} navigate={navigate} />
            }
          </Tabs.Content>

          <Tabs.Content value="completed">
            {completed.length === 0
              ? <EmptyState label="No completed requests." />
              : <RequestTable rows={completed} navigate={navigate} />
            }
          </Tabs.Content>
        </Tabs.Root>
      )}
    </div>
  )
}
