import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import StatusChip from '../../components/StatusChip'
import { ReadOnlyField, ReadOnlySections } from '../../components/ReadOnlyForm'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'

const TILE_META = {
  BENEFICIARY_CHANGE: { label: 'Beneficiary Change',   description: 'Update or designate a beneficiary for your life or AD&D benefit.', icon: PeopleOutlinedIcon,        iconColor: '#7c3aed', iconBg: '#f5f3ff' },
  ADD_DEPENDENT:      { label: 'Add a Dependent',       description: 'Add a spouse, common-law partner, or child to your coverage.',      icon: PersonAddOutlinedIcon,     iconColor: '#16a34a', iconBg: '#f0fdf4' },
  REMOVE_DEPENDENT:   { label: 'Remove a Dependent',    description: 'Remove a dependent who is no longer eligible for coverage.',        icon: PersonRemoveOutlinedIcon,  iconColor: '#dc2626', iconBg: '#fef2f2' },
  LIFE_EVENT:         { label: 'Life Event',             description: 'Report a qualifying life event affecting your coverage.',           icon: EventNoteOutlinedIcon,     iconColor: '#0891b2', iconBg: '#ecfeff' },
  COVERAGE_CHANGE:    { label: 'Coverage Change',        description: 'Request a change to your current benefit coverage level.',          icon: TuneOutlinedIcon,          iconColor: '#d97706', iconBg: '#fffbeb' },
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ChangeRequestDetailPage() {
  const { requestId } = useParams()
  const navigate = useNavigate()

  const [req,      setReq]      = useState(null)
  const [template, setTemplate] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    async function fetchData() {
      const { data, error: err } = await supabase
        .from('change_request')
        .select(`
          change_request_id, request_number, request_type, status,
          submission_date, effective_date, decline_reason,
          request_form_json,
          employee(first_name, last_name),
          member(member_number)
        `)
        .eq('change_request_id', requestId)
        .single()

      if (err) { setError(err.message); setLoading(false); return }

      const { data: tplData } = await supabase
        .from('change_request_form_template')
        .select('form_config')
        .eq('request_type', data.request_type)
        .eq('is_active', true)
        .is('sponsor_id', null)
        .single()

      setReq(data)
      setTemplate(tplData?.form_config ?? null)
      setLoading(false)
    }
    fetchData()
  }, [requestId])

  if (loading) return <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
  if (error)   return <div className="text-sm text-red-500 py-4">Error: {error}</div>
  if (!req)    return <div className="text-sm text-gray-400 py-4">Request not found.</div>

  const tile       = TILE_META[req.request_type] ?? TILE_META.LIFE_EVENT
  const Icon       = tile.icon
  const formValues = req.request_form_json ?? {}
  const memberName = req.employee ? `${req.employee.first_name} ${req.employee.last_name}` : '—'

  return (
    <div>
      <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate('/portal/requests')} sx={{ mb: 3, pl: 0 }}>
        Back to Requests
      </Button>

      {/* Context bar */}
      <div
        className="flex items-center justify-between gap-3 p-4 rounded-xl border mb-6"
        style={{ backgroundColor: tile.iconBg, borderColor: `${tile.iconColor}30` }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${tile.iconColor}20` }}>
            <Icon style={{ color: tile.iconColor, fontSize: 18 }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{tile.label}</p>
            <p className="text-xs text-gray-500">{tile.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {req.request_number && <span className="text-xs text-gray-500 hidden sm:block">{req.request_number}</span>}
          <StatusChip status={req.status} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Request Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Member</p>
              <p className="text-sm text-gray-900">
                {memberName}
                {req.member?.member_number && <span className="text-gray-400 ml-1">({req.member.member_number})</span>}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Submission Date</p>
              <p className="text-sm text-gray-900">{formatDate(req.submission_date)}</p>
            </div>
            {req.effective_date && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Effective Date</p>
                <p className="text-sm text-gray-900">{formatDate(req.effective_date)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic form sections — read-only */}
        {template
          ? <ReadOnlySections sections={template.sections} values={formValues} />
          : <div className="text-sm text-gray-400 py-4 text-center">No form configuration found.</div>
        }

        {/* Decline reason */}
        {req.status === 'DECLINED' && req.decline_reason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-red-700 mb-1">Decline Reason</p>
            <p className="text-sm text-red-600">{req.decline_reason}</p>
          </div>
        )}
      </div>
    </div>
  )
}
