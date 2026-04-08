import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { usePersona } from '../../context/PersonaContext'
import { Tabs } from '@ark-ui/react/tabs'
import { Button } from '@mui/material'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import { colors } from '../../theme'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ReadField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value || '—'}</p>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: colors.link }}>
      {children}
    </p>
  )
}

function inputClass(err) {
  return `w-full px-3 py-2 text-sm border rounded focus:outline-none focus:border-gray-500 transition-colors ${
    err ? 'border-red-400' : 'border-gray-300'
  }`
}

// ─── Company Info tab ─────────────────────────────────────────────────────────
function CompanyTab({ sponsorId }) {
  const [sponsor, setSponsor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('sponsor')
        .select('sponsor_name, sponsor_type, country_code, province_state_code, tax_id, status, created_at')
        .eq('sponsor_id', sponsorId)
        .single()
      setSponsor(data)
      setLoading(false)
    }
    fetch()
  }, [sponsorId])

  if (loading) return <p className="text-sm text-gray-400 py-8">Loading…</p>
  if (!sponsor)  return <p className="text-sm text-red-500 py-8">Could not load company info.</p>

  const statusColor = sponsor.status === 'ACTIVE' ? { bg: '#dcfce7', text: '#15803d' }
    : sponsor.status === 'SUSPENDED' ? { bg: '#fef9c3', text: '#854d0e' }
    : { bg: '#fee2e2', text: '#b91c1c' }

  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#eff6ff' }}>
              <BusinessOutlinedIcon style={{ color: colors.brandPrimary, fontSize: 24 }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{sponsor.sponsor_name}</h2>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mt-0.5"
                style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
              >
                {sponsor.status}
              </span>
            </div>
          </div>
        </div>

        <SectionTitle>Organization Details</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ReadField label="Sponsor Type"   value={sponsor.sponsor_type} />
          <ReadField label="Country"        value={sponsor.country_code} />
          <ReadField label="Province / Territory" value={sponsor.province_state_code} />
          <ReadField label="Tax ID"         value={sponsor.tax_id ? '••••••••' : null} />
          <ReadField label="Member Since"   value={sponsor.created_at
            ? new Date(sponsor.created_at).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })
            : null}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Billing tab ──────────────────────────────────────────────────────────────
const EMPTY_BILLING = {
  billing_contact_name:  '',
  billing_contact_email: '',
  billing_contact_phone: '',
  billing_address_line1: '',
  billing_address_line2: '',
  billing_city:          '',
  billing_province:      '',
  billing_postal_code:   '',
  payment_method:        'EFT',
  billing_frequency:     'MONTHLY',
  invoice_email:         '',
  invoice_delivery:      'EMAIL',
  po_number:             '',
  bank_name:             '',
  bank_institution_no:   '',
  bank_transit_no:       '',
  bank_account_no:       '',
  business_number:       '',
}

const PROVINCES = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT']

function BillingTab({ sponsorId }) {
  const [form, setForm]       = useState(EMPTY_BILLING)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('sponsor_billing')
        .select('*')
        .eq('sponsor_id', sponsorId)
        .maybeSingle()
      if (data) setForm({ ...EMPTY_BILLING, ...data })
      setLoading(false)
    }
    fetch()
  }, [sponsorId])

  function startEdit() {
    setDraft({ ...form })
    setEditing(true)
    setSaved(false)
    setSaveError(null)
  }

  function cancelEdit() {
    setDraft(null)
    setEditing(false)
    setSaveError(null)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setDraft((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const payload = { ...draft, sponsor_id: sponsorId, updated_at: new Date().toISOString() }
    const { error } = await supabase
      .from('sponsor_billing')
      .upsert(payload, { onConflict: 'sponsor_id' })

    if (error) {
      setSaveError(error.message)
      setSaving(false)
    } else {
      setForm(draft)
      setDraft(null)
      setEditing(false)
      setSaving(false)
      setSaved(true)
    }
  }

  const f = editing ? draft : form
  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'

  if (loading) return <p className="text-sm text-gray-400 py-8">Loading…</p>

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#eff6ff' }}>
              <CreditCardOutlinedIcon style={{ color: colors.brandPrimary, fontSize: 20 }} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Billing Information</h2>
              {form.updated_at && !editing && (
                <p className="text-xs text-gray-400">
                  Last updated {new Date(form.updated_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          {!editing && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditOutlinedIcon />}
              onClick={startEdit}
            >
              EDIT
            </Button>
          )}
        </div>

        {saved && !editing && (
          <p className="text-sm font-medium" style={{ color: colors.brandPrimary }}>✓ Billing information saved.</p>
        )}

        {/* ── Billing Contact ── */}
        <div>
          <SectionTitle>Billing Contact</SectionTitle>
          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Contact Name</label>
                <input name="billing_contact_name" value={f.billing_contact_name} onChange={handleChange} className={inputClass()} placeholder="e.g. Jane Smith" />
              </div>
              <div>
                <label className={labelClass}>Contact Email</label>
                <input name="billing_contact_email" type="email" value={f.billing_contact_email} onChange={handleChange} className={inputClass()} placeholder="billing@company.com" />
              </div>
              <div>
                <label className={labelClass}>Contact Phone</label>
                <input name="billing_contact_phone" value={f.billing_contact_phone} onChange={handleChange} className={inputClass()} placeholder="514-555-0100" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ReadField label="Contact Name"  value={f.billing_contact_name} />
              <ReadField label="Contact Email" value={f.billing_contact_email} />
              <ReadField label="Contact Phone" value={f.billing_contact_phone} />
            </div>
          )}
        </div>

        {/* ── Billing Address ── */}
        <div>
          <SectionTitle>Billing Address</SectionTitle>
          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Address Line 1</label>
                <input name="billing_address_line1" value={f.billing_address_line1} onChange={handleChange} className={inputClass()} placeholder="123 Main Street" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Address Line 2</label>
                <input name="billing_address_line2" value={f.billing_address_line2} onChange={handleChange} className={inputClass()} placeholder="Suite 400" />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input name="billing_city" value={f.billing_city} onChange={handleChange} className={inputClass()} placeholder="Montreal" />
              </div>
              <div>
                <label className={labelClass}>Province</label>
                <select name="billing_province" value={f.billing_province} onChange={handleChange} className={inputClass()}>
                  <option value="">Select province</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Postal Code</label>
                <input name="billing_postal_code" value={f.billing_postal_code} onChange={handleChange} className={inputClass()} placeholder="H1A 1A1" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <ReadField label="Address" value={[f.billing_address_line1, f.billing_address_line2].filter(Boolean).join(', ')} />
              </div>
              <ReadField label="City"        value={f.billing_city} />
              <ReadField label="Province"    value={f.billing_province} />
              <ReadField label="Postal Code" value={f.billing_postal_code} />
            </div>
          )}
        </div>

        {/* ── Payment Preferences ── */}
        <div>
          <SectionTitle>Payment Preferences</SectionTitle>
          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Payment Method</label>
                <select name="payment_method" value={f.payment_method} onChange={handleChange} className={inputClass()}>
                  <option value="EFT">EFT (Electronic Funds Transfer)</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="WIRE">Wire Transfer</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Billing Frequency</label>
                <select name="billing_frequency" value={f.billing_frequency} onChange={handleChange} className={inputClass()}>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Invoice Email</label>
                <input name="invoice_email" type="email" value={f.invoice_email} onChange={handleChange} className={inputClass()} placeholder="finance@company.com" />
              </div>
              <div>
                <label className={labelClass}>Invoice Delivery</label>
                <select name="invoice_delivery" value={f.invoice_delivery} onChange={handleChange} className={inputClass()}>
                  <option value="EMAIL">Email</option>
                  <option value="PORTAL">Portal</option>
                  <option value="MAIL">Mail</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Purchase Order Number</label>
                <input name="po_number" value={f.po_number} onChange={handleChange} className={inputClass()} placeholder="Optional" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ReadField label="Payment Method"    value={{ EFT: 'EFT (Electronic Funds Transfer)', CHEQUE: 'Cheque', WIRE: 'Wire Transfer' }[f.payment_method] ?? f.payment_method} />
              <ReadField label="Billing Frequency" value={{ MONTHLY: 'Monthly', QUARTERLY: 'Quarterly', ANNUAL: 'Annual' }[f.billing_frequency] ?? f.billing_frequency} />
              <ReadField label="Invoice Email"     value={f.invoice_email} />
              <ReadField label="Invoice Delivery"  value={{ EMAIL: 'Email', PORTAL: 'Portal', MAIL: 'Mail' }[f.invoice_delivery] ?? f.invoice_delivery} />
              <ReadField label="PO Number"         value={f.po_number} />
            </div>
          )}
        </div>

        {/* ── Banking Details ── */}
        <div>
          <SectionTitle>Banking Details</SectionTitle>
          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Bank Name</label>
                <input name="bank_name" value={f.bank_name} onChange={handleChange} className={inputClass()} placeholder="e.g. Royal Bank of Canada" />
              </div>
              <div>
                <label className={labelClass}>Institution Number</label>
                <input name="bank_institution_no" value={f.bank_institution_no} onChange={handleChange} className={inputClass()} placeholder="e.g. 003" maxLength={3} />
              </div>
              <div>
                <label className={labelClass}>Transit Number</label>
                <input name="bank_transit_no" value={f.bank_transit_no} onChange={handleChange} className={inputClass()} placeholder="e.g. 00123" maxLength={5} />
              </div>
              <div>
                <label className={labelClass}>Account Number</label>
                <input name="bank_account_no" value={f.bank_account_no} onChange={handleChange} className={inputClass()} placeholder="e.g. 1234567" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <ReadField label="Bank Name" value={f.bank_name} />
              </div>
              <ReadField label="Institution Number" value={f.bank_institution_no} />
              <ReadField label="Transit Number"     value={f.bank_transit_no} />
              <ReadField label="Account Number"     value={f.bank_account_no ? `••••${f.bank_account_no.slice(-3)}` : null} />
            </div>
          )}
        </div>

        {/* ── Tax Information ── */}
        <div>
          <SectionTitle>Tax Information</SectionTitle>
          {editing ? (
            <div className="max-w-sm">
              <label className={labelClass}>Business Number (GST/HST)</label>
              <input name="business_number" value={f.business_number} onChange={handleChange} className={inputClass()} placeholder="e.g. 123456789RT0001" />
            </div>
          ) : (
            <ReadField label="Business Number (GST/HST)" value={f.business_number} />
          )}
        </div>

        {/* ── Actions ── */}
        {editing && (
          <div>
            {saveError && <p className="text-sm text-red-600 mb-3">Error: {saveError}</p>}
            <div className="flex gap-3">
              <Button variant="contained" size="small" onClick={handleSave} disabled={saving} style={{ backgroundColor: colors.brandPrimary }}>
                {saving ? 'SAVING…' : 'SAVE CHANGES'}
              </Button>
              <Button variant="outlined" size="small" onClick={cancelEdit} disabled={saving}>
                CANCEL
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Billing History tab ──────────────────────────────────────────────────────
function BillingHistoryTab({ sponsorId }) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading]   = useState(true)
  const [sponsor, setSponsor]   = useState(null)

  useEffect(() => {
    async function fetchAll() {
      const [{ data: invData }, { data: spData }] = await Promise.all([
        supabase.from('sponsor_invoice').select('*').eq('sponsor_id', sponsorId).order('invoice_date', { ascending: false }),
        supabase.from('sponsor').select('sponsor_name, province_state_code, country_code').eq('sponsor_id', sponsorId).single(),
      ])
      setInvoices(invData ?? [])
      setSponsor(spData)
      setLoading(false)
    }
    fetchAll()
  }, [sponsorId])

  function formatCurrency(amount, currency) {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: currency ?? 'CAD' }).format(amount)
  }

  function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function downloadInvoicePdf(inv) {
    const doc = new jsPDF()
    const primaryColor = [30, 80, 160] // dark blue

    // ── Header bar ──
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 28, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 14, 18)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(inv.invoice_number, 196, 18, { align: 'right' })

    // ── Sponsor info ──
    doc.setTextColor(40, 40, 40)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(sponsor?.sponsor_name ?? 'ABC Company', 14, 40)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`${sponsor?.province_state_code ?? ''}, ${sponsor?.country_code ?? 'CA'}`, 14, 47)

    // ── Invoice meta (right side) ──
    const metaX = 130
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    const meta = [
      ['Invoice Date:', formatDate(inv.invoice_date)],
      ['Due Date:',     formatDate(inv.due_date)],
      ['Status:',       inv.status],
      ...(inv.paid_at ? [['Paid On:', formatDate(inv.paid_at)]] : []),
    ]
    meta.forEach(([label, value], i) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, metaX, 40 + i * 7)
      doc.setFont('helvetica', 'normal')
      doc.text(value, 196, 40 + i * 7, { align: 'right' })
    })

    // ── Divider ──
    doc.setDrawColor(200, 200, 200)
    doc.line(14, 62, 196, 62)

    // ── Line items table ──
    autoTable(doc, {
      startY: 68,
      head: [['Description', 'Currency', 'Amount']],
      body: [[inv.description ?? 'Group benefits premium', inv.currency ?? 'CAD', formatCurrency(inv.amount, inv.currency)]],
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
      columnStyles: { 2: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    })

    // ── Total ──
    const finalY = doc.lastAutoTable.finalY + 6
    doc.setFillColor(245, 247, 250)
    doc.rect(130, finalY, 66, 12, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(40, 40, 40)
    doc.text('Total:', 134, finalY + 8)
    doc.text(formatCurrency(inv.amount, inv.currency), 196, finalY + 8, { align: 'right' })

    // ── Footer ──
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(160, 160, 160)
    doc.text('Thank you for your business.', 105, 280, { align: 'center' })

    doc.save(`${inv.invoice_number}.pdf`)
  }

  const STATUS_CFG = {
    PAID:    { bg: '#dcfce7', text: '#15803d', label: 'Paid' },
    PENDING: { bg: '#fef9c3', text: '#854d0e', label: 'Pending' },
    OVERDUE: { bg: '#fee2e2', text: '#b91c1c', label: 'Overdue' },
    VOID:    { bg: '#f3f4f6', text: '#6b7280', label: 'Void' },
  }

  const totalPaid = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + Number(inv.amount), 0)

  if (loading) return <p className="text-sm text-gray-400 py-8">Loading…</p>

  return (
    <div>
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid, 'CAD')}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(
              invoices.filter((inv) => ['PENDING', 'OVERDUE'].includes(inv.status)).reduce((s, inv) => s + Number(inv.amount), 0),
              'CAD'
            )}
          </p>
        </div>
      </div>

      {/* Invoices table */}
      {invoices.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No invoices on record.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Invoice #</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Invoice Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Date</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Paid On</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => {
                const cfg = STATUS_CFG[inv.status] ?? STATUS_CFG.PENDING
                return (
                  <tr key={inv.id} className={i < invoices.length - 1 ? 'border-b border-gray-100' : ''}>
                    <td className="px-5 py-3 font-mono text-xs text-gray-700">{inv.invoice_number}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{inv.description ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(inv.invoice_date)}</td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(inv.due_date)}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-800">{formatCurrency(inv.amount, inv.currency)}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(inv.paid_at)}</td>
                    <td className="px-5 py-3">
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
                        onClick={() => downloadInvoicePdf(inv)}
                        sx={{ textTransform: 'none', minWidth: 0, px: 1 }}
                      >
                        PDF
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AccountPage() {
  const { sponsorId } = usePersona()

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Account</h1>
      <p className="text-sm text-gray-500 mb-5">Manage your company profile and billing information.</p>
      <hr className="border-gray-200 mb-6" />

      <Tabs.Root defaultValue="company">
        <Tabs.List className="flex border-b border-gray-200 mb-6">
          <Tabs.Trigger
            value="company"
            className="px-4 py-3 text-sm font-medium cursor-pointer whitespace-nowrap border-b-2 border-transparent text-gray-500 hover:text-gray-800 transition-colors data-[selected]:border-interactive data-[selected]:text-interactive"
          >
            Company Info
          </Tabs.Trigger>
          <Tabs.Trigger
            value="billing"
            className="px-4 py-3 text-sm font-medium cursor-pointer whitespace-nowrap border-b-2 border-transparent text-gray-500 hover:text-gray-800 transition-colors data-[selected]:border-interactive data-[selected]:text-interactive"
          >
            Billing
          </Tabs.Trigger>
          <Tabs.Trigger
            value="history"
            className="px-4 py-3 text-sm font-medium cursor-pointer whitespace-nowrap border-b-2 border-transparent text-gray-500 hover:text-gray-800 transition-colors data-[selected]:border-interactive data-[selected]:text-interactive"
          >
            Billing History
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="company">
          <CompanyTab sponsorId={sponsorId} />
        </Tabs.Content>

        <Tabs.Content value="billing">
          <BillingTab sponsorId={sponsorId} />
        </Tabs.Content>

        <Tabs.Content value="history">
          <BillingHistoryTab sponsorId={sponsorId} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
