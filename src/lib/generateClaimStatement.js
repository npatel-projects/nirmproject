import jsPDF from 'jspdf'

const BRAND_GREEN  = [0, 133, 62]
const BRAND_ACCENT = [255, 205, 0]
const DARK        = [17, 24, 39]
const MID         = [107, 114, 128]
const LIGHT_BG    = [249, 250, 251]
const BORDER      = [229, 231, 235]
const WHITE       = [255, 255, 255]
const RED         = [185, 28, 28]
const RED_BG      = [254, 242, 242]

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatCurrency(val) {
  if (val == null || val === '') return '—'
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency: 'CAD',
  }).format(val)
}

function sectionHeader(doc, y, label) {
  doc.setFillColor(...LIGHT_BG)
  doc.rect(14, y, 182, 8, 'F')
  doc.setDrawColor(...BORDER)
  doc.rect(14, y, 182, 8, 'S')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...MID)
  doc.text(label.toUpperCase(), 18, y + 5.5)
  return y + 8
}

function infoRow(doc, y, label, value, col2 = false) {
  const x = col2 ? 110 : 18
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MID)
  doc.text(label, x, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text(String(value ?? '—'), x, y + 5)
  return y + 12
}

function divider(doc, y) {
  doc.setDrawColor(...BORDER)
  doc.line(14, y, 196, y)
  return y + 4
}

const CLAIM_TYPE_LABELS = {
  LIFE:   'Life Insurance',
  STD:    'Short-Term Disability',
  LTD:    'Long-Term Disability',
  ADD:    'Accidental Death & Dismemberment',
  CI:     'Critical Illness',
  HEALTH: 'Medical / Extended Health',
  DENTAL: 'Dental',
  VISION: 'Vision',
  DRUG:   'Prescription Drug',
  HSA:    'Health Spending Account',
  WSA:    'Wellness Spending Account',
}

const STATUS_LABELS = {
  APPROVED:           'Approved',
  PARTIALLY_APPROVED: 'Partially Approved',
  DECLINED:           'Declined',
  CLOSED:             'Closed',
}

export function generateClaimStatement({ claim, memberName, benefitName }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = 210

  // ── Header bar ──────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_GREEN)
  doc.rect(0, 0, pageW, 48, 'F')
  doc.setFillColor(...BRAND_ACCENT)
  doc.rect(0, 44, pageW, 4, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...WHITE)
  doc.text('ABC Insurance Inc.', 14, 18)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Explanation of Benefits — Claim Statement', 14, 28)

  const issueDate = formatDate(new Date().toISOString().split('T')[0])
  doc.setFontSize(8)
  doc.text(`Issued: ${issueDate}`, pageW - 14, 18, { align: 'right' })
  doc.text(`Claim #: ${claim.claim_number ?? '—'}`, pageW - 14, 25, { align: 'right' })

  let y = 58

  // ── Claimant Information ────────────────────────────────────────────────────
  y = sectionHeader(doc, y, 'Claimant Information')
  y += 4

  infoRow(doc, y, 'Claimant Name', memberName, false)
  infoRow(doc, y, 'Member Number', claim.member?.member_number, true)
  y += 12
  infoRow(doc, y, 'Benefit', benefitName ?? claim.benefit?.benefit_name, false)
  infoRow(doc, y, 'Claim Type', CLAIM_TYPE_LABELS[claim.claim_type] ?? claim.claim_type, true)
  y += 14

  y = divider(doc, y)

  // ── Claim Details ───────────────────────────────────────────────────────────
  y = sectionHeader(doc, y, 'Claim Details')
  y += 4

  infoRow(doc, y, 'Claim Number', claim.claim_number, false)
  infoRow(doc, y, 'Status', STATUS_LABELS[claim.status] ?? claim.status, true)
  y += 12
  infoRow(doc, y, 'Incident / Service Date', formatDate(claim.incident_date), false)
  infoRow(doc, y, 'Submission Date', formatDate(claim.submission_date), true)
  y += 12

  if (claim.pas_claim_ref) {
    infoRow(doc, y, 'PAS Reference', claim.pas_claim_ref, false)
    y += 12
  }
  y += 2

  y = divider(doc, y)

  // ── Financial Summary ───────────────────────────────────────────────────────
  y = sectionHeader(doc, y, 'Financial Summary')
  y += 6

  // Summary box
  const boxH = 36
  doc.setFillColor(245, 247, 250)
  doc.setDrawColor(...BORDER)
  doc.roundedRect(14, y, 182, boxH, 2, 2, 'FD')

  const col1 = 30, col2 = 86, col3 = 142
  const rowY1 = y + 10, rowY2 = y + 24

  // Labels
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MID)
  doc.text('Amount Claimed', col1, rowY1, { align: 'center' })
  doc.text('Approved Amount', col2, rowY1, { align: 'center' })
  doc.text('Amount Paid', col3, rowY1, { align: 'center' })

  // Values
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text(formatCurrency(claim.amount_claimed), col1, rowY2, { align: 'center' })
  doc.text(formatCurrency(claim.approved_amount), col2, rowY2, { align: 'center' })
  doc.text(formatCurrency(claim.paid_amount), col3, rowY2, { align: 'center' })

  y += boxH + 8

  if (claim.paid_date || claim.payment_method) {
    infoRow(doc, y, 'Payment Date', formatDate(claim.paid_date), false)
    if (claim.payment_method) infoRow(doc, y, 'Payment Method', claim.payment_method, true)
    y += 14
  }

  y = divider(doc, y)

  // ── Decline Reason (if applicable) ─────────────────────────────────────────
  if (claim.status === 'DECLINED' && claim.decline_reason) {
    y += 2
    doc.setFillColor(...RED_BG)
    doc.setDrawColor(252, 165, 165)
    doc.roundedRect(14, y, 182, 22, 2, 2, 'FD')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...RED)
    doc.text('Decline Reason', 20, y + 8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    const reasonLines = doc.splitTextToSize(claim.decline_reason, 172)
    doc.text(reasonLines, 20, y + 15)
    y += 28
    y = divider(doc, y)
  }

  // ── Disclaimer ──────────────────────────────────────────────────────────────
  y += 4
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(...MID)
  const disclaimer =
    'This Explanation of Benefits is a summary of the claim decision and is not a guarantee of payment. ' +
    'Payment is subject to the terms, conditions, limitations, and exclusions of your group benefits plan. ' +
    'If you have questions about this claim decision, please contact ABC Insurance Inc. at 1-800-555-0100.'
  const lines = doc.splitTextToSize(disclaimer, 182)
  doc.text(lines, 14, y)

  // ── Footer ───────────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_GREEN)
  doc.rect(0, 287, pageW, 10, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...WHITE)
  doc.text('ABC Insurance Inc.  |  abcinsurance.com  |  1-800-555-0100', pageW / 2, 293, { align: 'center' })

  // ── Save ────────────────────────────────────────────────────────────────────
  const fileName = `ClaimStatement_${claim.claim_number ?? claim.claim_id}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
