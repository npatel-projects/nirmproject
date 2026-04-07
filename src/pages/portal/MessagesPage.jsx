import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Chip, TextField, InputAdornment, Checkbox } from '@mui/material'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import { t } from '../../i18n/en'

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_MESSAGES = [
  {
    id: 'msg-001',
    title: 'Notice of Eligible Insurance Coverage',
    priority: 'Normal',
    type: 'Information',
    dateReceived: '2026-03-26',
    deadline: null,
    policy: 'GH004821',
    hasAttachment: true,
    read: false,
    archived: false,
    body: `Dear Plan Member,\n\nWe are pleased to inform you that you are eligible for insurance coverage under the group benefits plan sponsored by your employer.\n\nYour coverage is effective as of March 1, 2026. Please review the attached Certificate of Insurance for full details of your coverage, including benefit maximums, limitations, and exclusions.\n\nIf you have any questions regarding your coverage, please contact Member Services at 1-800-555-0100.\n\nSincerely,\nABC Insurance`,
    attachment: { label: 'Certificate of Insurance.pdf', href: '#' },
  },
  {
    id: 'msg-002',
    title: 'Notice of Dependent Age-Out',
    priority: 'High',
    type: 'Action Required',
    dateReceived: '2026-03-26',
    deadline: '2026-04-30',
    policy: 'GH004821',
    hasAttachment: false,
    read: false,
    archived: false,
    body: `Dear Plan Member,\n\nThis notice is to inform you that your dependent child will reach the maximum eligible age under your group benefits plan on April 30, 2026.\n\nAs of that date, your dependent will no longer be covered under your plan. If your dependent is a full-time student, you may be eligible for an extension of coverage. Please submit the required documentation before the deadline.\n\nTo update your coverage, please use the Change Request form in your portal or contact your Plan Administrator.\n\nSincerely,\nABC Insurance`,
    attachment: null,
    action: { label: 'Submit Change Request', href: '/portal/requests/new?type=REMOVE_DEPENDENT' },
  },
  {
    id: 'msg-003',
    title: 'Annual Renewal Confirmation',
    priority: 'Normal',
    type: 'Information',
    dateReceived: '2026-03-10',
    deadline: null,
    policy: 'GH004821',
    hasAttachment: true,
    read: true,
    archived: false,
    body: `Dear Plan Administrator,\n\nYour group benefits plan has been successfully renewed for the upcoming policy year beginning April 1, 2026.\n\nPlease review the attached renewal documents, which include updated benefit schedules and premium rates. Any changes to coverage will take effect on the renewal date.\n\nThank you for your continued trust in ABC Insurance.\n\nSincerely,\nABC Insurance`,
    attachment: { label: 'Renewal Summary 2026.pdf', href: '#' },
  },
  {
    id: 'msg-004',
    title: 'Claim EFT Payment Issued',
    priority: 'Normal',
    type: 'Information',
    dateReceived: '2026-03-05',
    deadline: null,
    policy: 'GH004821',
    hasAttachment: false,
    read: true,
    archived: false,
    body: `Dear Plan Member,\n\nAn EFT payment for your recent claim has been processed and deposited to your account on file.\n\nClaim Reference: CLM-2026-0042\nPayment Amount: $245.00\nPayment Date: March 5, 2026\n\nPlease allow 1–3 business days for the funds to appear in your account. If you have questions about this payment, please contact Member Services.\n\nSincerely,\nABC Insurance`,
    attachment: null,
  },
]

function formatDate(iso) {
  if (!iso) return t('common.na')
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

function PriorityChip({ priority }) {
  if (priority === 'High') {
    return <Chip label="High" size="small" sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
  }
  return <Chip label="Normal" size="small" sx={{ bgcolor: '#f3f4f6', color: '#6b7280', fontWeight: 500, fontSize: '0.7rem', height: 20 }} />
}

function TypeBadge({ type }) {
  if (type === 'Action Required') {
    return <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{type}</span>
  }
  return <span className="inline-flex items-center text-xs font-medium text-gray-500">{type}</span>
}

export default function MessagesPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [filter, setFilter] = useState('all') // 'all' | 'read' | 'unread'
  const [policySearch, setPolicySearch] = useState('')
  const [selected, setSelected] = useState(new Set())

  const unreadCount = messages.filter((m) => !m.read && !m.archived).length

  const visible = useMemo(() => {
    return messages.filter((m) => {
      if (m.archived) return false
      if (filter === 'read' && !m.read) return false
      if (filter === 'unread' && m.read) return false
      if (policySearch.trim() && !m.policy.toLowerCase().includes(policySearch.trim().toLowerCase())) return false
      return true
    })
  }, [messages, filter, policySearch])

  function toggleRead(id) {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: !m.read } : m))
  }

  function archiveMessage(id) {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, archived: true } : m))
    setSelected((prev) => { const s = new Set(prev); s.delete(id); return s })
  }

  function toggleSelect(id) {
    setSelected((prev) => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  function toggleSelectAll() {
    if (selected.size === visible.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(visible.map((m) => m.id)))
    }
  }

  const allSelected = visible.length > 0 && selected.size === visible.length

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('messages.title')}</h1>
      <p className="text-sm text-gray-500 mb-6">{t('messages.subtitle')}</p>

      {/* Controls card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          {/* Left: unread count + filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900">{unreadCount}</span>
              <span className="text-sm text-gray-500">{unreadCount === 1 ? 'unread message' : 'unread messages'}</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            {/* Filter pills */}
            <div className="flex items-center gap-1">
              {['all', 'unread', 'read'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    filter === f
                      ? 'bg-interactive text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Read'}
                </button>
              ))}
            </div>
          </div>

          {/* Right: policy search + archived link */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <TextField
              size="small"
              placeholder={t('messages.searchPolicy')}
              value={policySearch}
              onChange={(e) => setPolicySearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" style={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 200, '& .MuiInputBase-root': { fontSize: '0.8125rem' } }}
            />
            <button
              className="text-xs text-interactive hover:underline whitespace-nowrap"
              onClick={() => {}}
            >
              {t('messages.viewArchived')}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider"
          style={{ gridTemplateColumns: '32px 1fr 80px 120px 110px 100px 90px 80px' }}
        >
          <Checkbox
            size="small"
            checked={allSelected}
            indeterminate={selected.size > 0 && !allSelected}
            onChange={toggleSelectAll}
            sx={{ p: 0 }}
          />
          <span>Title</span>
          <span>Priority</span>
          <span>Type</span>
          <span>Date Received</span>
          <span>Deadline</span>
          <span>Policy</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Rows */}
        {visible.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">{t('messages.noMessages')}</p>
        ) : (
          visible.map((msg) => (
            <div
              key={msg.id}
              className={`grid items-center gap-2 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                !msg.read ? 'bg-blue-50/40' : ''
              }`}
              style={{ gridTemplateColumns: '32px 1fr 80px 120px 110px 100px 90px 80px' }}
            >
              {/* Checkbox */}
              <Checkbox
                size="small"
                checked={selected.has(msg.id)}
                onChange={() => toggleSelect(msg.id)}
                sx={{ p: 0 }}
              />

              {/* Title */}
              <div className="flex items-center gap-2 min-w-0">
                {!msg.read && (
                  <span className="w-2 h-2 rounded-full bg-interactive shrink-0" />
                )}
                <div className="min-w-0">
                  <button
                    className="text-sm font-semibold text-interactive hover:underline text-left truncate block max-w-full"
                    onClick={() => navigate(`/portal/messages/${msg.id}`, { state: { msg } })}
                  >
                    {msg.title}
                  </button>
                </div>
              </div>

              {/* Priority */}
              <div><PriorityChip priority={msg.priority} /></div>

              {/* Type */}
              <div><TypeBadge type={msg.type} /></div>

              {/* Date received */}
              <span className="text-sm text-gray-600">{formatDate(msg.dateReceived)}</span>

              {/* Deadline */}
              <span className={`text-sm ${msg.deadline ? 'text-amber-700 font-medium' : 'text-gray-400'}`}>
                {formatDate(msg.deadline)}
              </span>

              {/* Policy */}
              <span className="text-sm text-gray-600 font-mono">{msg.policy}</span>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
                {msg.hasAttachment && (
                  <AttachFileOutlinedIcon style={{ fontSize: '1rem', color: '#9ca3af' }} />
                )}
                <button
                  title={msg.read ? 'Mark as unread' : 'Mark as read'}
                  onClick={() => toggleRead(msg.id)}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                >
                  {msg.read
                    ? <MarkEmailUnreadOutlinedIcon style={{ fontSize: '1rem', color: '#9ca3af' }} />
                    : <MarkEmailReadOutlinedIcon style={{ fontSize: '1rem', color: '#3b5ea6' }} />
                  }
                </button>
                <button
                  title="Archive"
                  onClick={() => archiveMessage(msg.id)}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                >
                  <ArchiveOutlinedIcon style={{ fontSize: '1rem', color: '#9ca3af' }} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination — mock */}
      {visible.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Showing {visible.length} of {messages.filter((m) => !m.archived).length} messages</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40" disabled>
              Previous
            </button>
            <button className="px-2.5 py-1 rounded border border-gray-200 bg-interactive text-white font-medium">
              1
            </button>
            <button className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40" disabled>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
