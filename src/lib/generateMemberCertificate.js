import jsPDF from 'jspdf'

const BRAND_GREEN  = [0, 133, 62]   // #00853e
const BRAND_ACCENT = [255, 205, 0]  // #ffcd00
const DARK        = [17, 24, 39]    // gray-900
const MID         = [107, 114, 128] // gray-500
const LIGHT_BG    = [249, 250, 251] // gray-50
const BORDER      = [229, 231, 235] // gray-200
const WHITE       = [255, 255, 255]

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatCurrency(val, currency = 'CAD') {
  if (val == null) return '—'
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(val)
}

// Draw a section header row (colored label bar)
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

// Draw a two-column row
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

// Draw a horizontal divider line
function divider(doc, y) {
  doc.setDrawColor(...BORDER)
  doc.line(14, y, 196, y)
  return y + 4
}

export function generateMemberCertificate({ emp, member, plan, assignment, benefits = [] }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = 210

  // ── Header bar ────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_GREEN)
  doc.rect(0, 0, pageW, 48, 'F')

  // Accent strip
  doc.setFillColor(...BRAND_ACCENT)
  doc.rect(0, 44, pageW, 4, 'F')

  // Insurer name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...WHITE)
  doc.text('ABC Insurance Inc.', 14, 18)

  // Certificate title
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Group Benefits — Member Certificate', 14, 28)

  // Issue date (top right)
  const issueDate = formatDate(new Date().toISOString().split('T')[0])
  doc.setFontSize(8)
  doc.text(`Issued: ${issueDate}`, pageW - 14, 18, { align: 'right' })
  doc.text(`Cert. No: ${member?.member_number ?? '—'}`, pageW - 14, 25, { align: 'right' })

  let y = 58

  // ── Member Information ────────────────────────────────────────────────────
  y = sectionHeader(doc, y, 'Member Information')
  y += 4

  const memberName = `${emp.first_name} ${emp.last_name}`
  infoRow(doc, y, 'Full Name',      memberName,                false)
  infoRow(doc, y, 'Member Number',  member?.member_number,     true)
  y += 12
  infoRow(doc, y, 'Employee ID',    emp.external_hr_id,        false)
  infoRow(doc, y, 'Date of Birth',  formatDate(emp.date_of_birth), true)
  y += 12
  infoRow(doc, y, 'Province',       emp.province_state_code,   false)
  infoRow(doc, y, 'Email',          emp.email ?? '—',          true)
  y += 14

  y = divider(doc, y)

  // ── Plan Information ──────────────────────────────────────────────────────
  y = sectionHeader(doc, y, 'Plan Information')
  y += 4

  infoRow(doc, y, 'Plan Name',        plan?.plan_name,                     false)
  infoRow(doc, y, 'Plan Code',        plan?.plan_code,                     true)
  y += 12
  infoRow(doc, y, 'Coverage Effective', formatDate(member?.effective_date), false)
  infoRow(doc, y, 'Member Status',    member?.member_status,               true)
  y += 12
  infoRow(doc, y, 'Class',            assignment?.class_code,              false)
  infoRow(doc, y, 'Division',         assignment?.division_code,           true)
  y += 14

  y = divider(doc, y)

  // ── Coverage Summary ──────────────────────────────────────────────────────
  y = sectionHeader(doc, y, 'Coverage Summary')
  y += 6

  if (benefits.length === 0) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...MID)
    doc.text('No active benefits on file.', 18, y)
    y += 10
  } else {
    // Table header
    doc.setFillColor(...BRAND_GREEN)
    doc.rect(14, y - 1, 182, 7, 'F')
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...WHITE)
    doc.text('Benefit',           18, y + 4)
    doc.text('Type',              80, y + 4)
    doc.text('Formula',          115, y + 4)
    doc.text('Max Amount',       160, y + 4)
    y += 8

    benefits.forEach((b, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(245, 247, 250)
        doc.rect(14, y - 1, 182, 7, 'F')
      }
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...DARK)
      doc.text(b.benefit_name ?? '—',                         18, y + 4)
      doc.text(b.benefit_type ?? '—',                         80, y + 4)
      doc.text((b.coverage_formula ?? '—').replace('_', ' '), 115, y + 4)
      doc.text(formatCurrency(b.max_amount),                  160, y + 4)
      y += 8
    })
    y += 4
  }

  y = divider(doc, y)

  // ── Disclaimer ────────────────────────────────────────────────────────────
  y += 4
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(...MID)
  const disclaimer =
    'This certificate is issued as evidence of coverage under the group benefits plan administered by ABC Insurance Inc. ' +
    'It does not constitute the policy and is subject to the terms, conditions, and exclusions of the master policy. ' +
    'Coverage is effective as of the date shown above and is contingent upon continued eligibility. ' +
    'For full plan details, refer to your benefits booklet or contact your plan administrator.'
  const lines = doc.splitTextToSize(disclaimer, 182)
  doc.text(lines, 14, y)
  y += lines.length * 4 + 6

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_GREEN)
  doc.rect(0, 287, pageW, 10, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...WHITE)
  doc.text('ABC Insurance Inc.  |  abcinsurance.com  |  1-800-555-0100', pageW / 2, 293, { align: 'center' })

  // ── Save ──────────────────────────────────────────────────────────────────
  const fileName = `MemberCertificate_${member?.member_number ?? emp.external_hr_id}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
