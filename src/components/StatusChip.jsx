import { Chip } from '@mui/material'

/**
 * Unified status chip for claims, change requests, and contracts.
 * Covers all status values across every domain — add new entries here as needed.
 */
const STATUS_MAP = {
  // ── Common ────────────────────────────────────────────────────────────────
  DRAFT:              { label: 'Draft',      borderColor: '#9ca3af', color: '#6b7280' },
  SUBMITTED:          { label: 'Pending',    borderColor: '#d97706', color: '#d97706' },
  IN_REVIEW:          { label: 'In Review',  borderColor: '#2563eb', color: '#2563eb' },
  APPROVED:           { label: 'Approved',   borderColor: '#16a34a', color: '#16a34a' },
  DECLINED:           { label: 'Declined',   borderColor: '#dc2626', color: '#dc2626' },
  // ── Claims ────────────────────────────────────────────────────────────────
  APPEALED:           { label: 'Appealed',   borderColor: '#7c3aed', color: '#7c3aed' },
  PARTIALLY_APPROVED: { label: 'Partial',    borderColor: '#d97706', color: '#d97706' },
  CLOSED:             { label: 'Closed',     borderColor: '#9ca3af', color: '#6b7280' },
  // ── Change requests ───────────────────────────────────────────────────────
  CANCELLED:          { label: 'Cancelled',  borderColor: '#9ca3af', color: '#6b7280' },
  // ── Contracts ─────────────────────────────────────────────────────────────
  ACTIVE:             { label: 'Active',     borderColor: '#16a34a', color: '#16a34a' },
  PENDING:            { label: 'Pending',    borderColor: '#d97706', color: '#d97706' },
  TERMINATED:         { label: 'Terminated', borderColor: '#9ca3af', color: '#6b7280' },
  LAPSED:             { label: 'Lapsed',     borderColor: '#dc2626', color: '#dc2626' },
}

export default function StatusChip({ status }) {
  const cfg = STATUS_MAP[status] ?? { label: status, borderColor: '#9ca3af', color: '#6b7280' }
  return (
    <Chip
      label={cfg.label}
      size="small"
      variant="outlined"
      sx={{
        fontSize: 12,
        height: 24,
        fontWeight: 600,
        borderColor: cfg.borderColor,
        color: cfg.color,
      }}
    />
  )
}
