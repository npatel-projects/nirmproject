import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button, Chip } from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import { t } from '../../i18n/en'

// ─── Mirrored from MessagesPage so detail works even on direct load ───────────
const MOCK_MESSAGES = [
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
    body: `Dear Plan Member,\n\nAn EFT payment for your recent claim has been processed and deposited to your account on file.\n\nClaim Reference: CLM-2026-0042\nPayment Amount: $245.00\nPayment Date: March 5, 2026\n\nPlease allow 1–3 business days for the funds to appear in your account. If you have questions about this payment, please contact Member Services.\n\nSincerely,\nABC Insurance`,
    attachment: null,
  },
]

function formatDate(iso) {
  if (!iso) return t('common.na')
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function MessageDetailPage() {
  const { messageId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // Use passed state if available (avoids re-fetch for mock), else look up
  const [msg] = useState(() => location.state?.msg ?? MOCK_MESSAGES.find((m) => m.id === messageId) ?? null)

  useEffect(() => {
    // In a real app, mark as read via API here
  }, [messageId])

  if (!msg) {
    return (
      <div className="py-24 text-center text-sm text-gray-400">{t('common.noData')}</div>
    )
  }

  return (
    <div>
      {/* Back */}
      <Button
        variant="text"
        startIcon={<ArrowBackOutlinedIcon />}
        onClick={() => navigate('/portal/messages')}
        sx={{ mb: 2 }}
      >
        {t('messages.back')}
      </Button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('messages.detailHeading')}</h1>

      {/* Message card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {/* Meta row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{msg.type}</p>
            <h2 className="text-lg font-semibold text-gray-900 leading-snug">{msg.title}</h2>
          </div>
          {msg.priority === 'High' && (
            <Chip
              label="High Priority"
              size="small"
              sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 600, fontSize: '0.7rem', flexShrink: 0 }}
            />
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mb-5 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Date Received</p>
            <p className="text-gray-800 font-medium">{formatDate(msg.dateReceived)}</p>
          </div>
          {msg.deadline && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Deadline</p>
              <p className="text-amber-700 font-semibold">{formatDate(msg.deadline)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Policy Number</p>
            <p className="text-gray-800 font-mono font-medium">{msg.policy}</p>
          </div>
        </div>

        <hr className="border-gray-100 mb-5" />

        {/* Body */}
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-6">
          {msg.body}
        </div>

        {/* Attachment or action */}
        {msg.attachment && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <PictureAsPdfOutlinedIcon style={{ color: '#ef4444', fontSize: '1.5rem', flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{msg.attachment.label}</p>
              <p className="text-xs text-gray-400">PDF Document</p>
            </div>
            <a
              href={msg.attachment.href}
              className="text-sm text-blue-600 hover:underline font-medium shrink-0"
            >
              Download
            </a>
          </div>
        )}

        {msg.action && !msg.attachment && (
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AttachFileOutlinedIcon style={{ color: '#d97706', fontSize: '1.25rem', flexShrink: 0 }} />
            <p className="text-sm text-amber-800 flex-1">Action required before the deadline.</p>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate(msg.action.href)}
              sx={{ flexShrink: 0 }}
            >
              {msg.action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
