import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { usePersona } from '../../context/PersonaContext'
import { Tabs } from '@ark-ui/react/tabs'
import { Button, Chip } from '@mui/material'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined'
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { colors } from '../../theme'

// ─── Mock PBM / carrier data (replace with real integration later) ────────────
const MOCK_PBM = {
  bin:       '610502',
  pcn:       'ADJ',
  rxGrp:     'GRP001',
  helpDesk:  '1-800-555-0199',
  website:   'pbm.abcinsurance.example.com',
}

const MOCK_DENTAL_CARRIER = {
  name:      'ABC Insurance',
  phone:     '1-800-555-0100',
  website:   'dental.abcinsurance.example.com',
  adminNote: 'Present this card to your dental provider at time of service.',
}

// ─── Card field row ───────────────────────────────────────────────────────────
function CardField({ label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{label}</span>
      <span className={`text-sm font-semibold ${mono ? 'font-mono tracking-wider' : ''}`}>{value}</span>
    </div>
  )
}

// ─── Physical card shell ──────────────────────────────────────────────────────
function BenefitCard({ children, gradient, printId }) {
  return (
    <div
      id={printId}
      className="rounded-2xl p-6 w-full max-w-sm shadow-lg text-white relative overflow-hidden"
      style={{ background: gradient, minHeight: '200px' }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10 bg-white" />
      <div className="absolute -bottom-10 -left-6 w-48 h-48 rounded-full opacity-10 bg-white" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ─── Drug / PBM card ──────────────────────────────────────────────────────────
function DrugCard({ member, plan, contract }) {
  const memberName = member?.employee
    ? `${member.employee.first_name} ${member.employee.last_name}`
    : '—'

  return (
    <BenefitCard
      printId="card-drug"
      gradient={`linear-gradient(135deg, #0369a1 0%, #0891b2 100%)`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <LocalPharmacyOutlinedIcon style={{ fontSize: 20 }} />
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Prescription Drug</span>
        </div>
        <span className="text-xs font-semibold opacity-70">MOCK DATA</span>
      </div>

      {/* Carrier name */}
      <p className="text-lg font-bold mb-4">ABC Insurance</p>

      {/* PBM fields — standard pharmacy layout */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
        <CardField label="BIN"   value={MOCK_PBM.bin}   mono />
        <CardField label="PCN"   value={MOCK_PBM.pcn}   mono />
        <CardField label="Group" value={MOCK_PBM.rxGrp} mono />
        <CardField label="ID"    value={member?.member_number ?? '—'} mono />
      </div>

      <div className="border-t border-white/20 pt-3 mt-1">
        <CardField label="Member" value={memberName} />
      </div>

      {/* Footer */}
      <div className="mt-3 text-[10px] opacity-60">
        Help Desk: {MOCK_PBM.helpDesk} · {MOCK_PBM.website}
      </div>
    </BenefitCard>
  )
}

// ─── Dental card ──────────────────────────────────────────────────────────────
function DentalCard({ member, plan, contract }) {
  const memberName = member?.employee
    ? `${member.employee.first_name} ${member.employee.last_name}`
    : '—'
  const groupNumber = contract?.contract_number ?? '—'
  const planName    = plan?.plan_name ?? '—'

  return (
    <BenefitCard
      printId="card-dental"
      gradient={`linear-gradient(135deg, ${colors.brandPrimary} 0%, ${colors.brandPrimaryDark} 100%)`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <MedicalServicesOutlinedIcon style={{ fontSize: 20 }} />
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Dental</span>
        </div>
        <span className="text-xs font-semibold opacity-70">MOCK DATA</span>
      </div>

      <p className="text-lg font-bold mb-4">{MOCK_DENTAL_CARRIER.name}</p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
        <CardField label="Group #"     value={groupNumber} mono />
        <CardField label="Member #"    value={member?.member_number ?? '—'} mono />
        <CardField label="Plan"        value={planName} />
        <CardField label="Certificate" value={member?.certificate_number ?? '—'} mono />
      </div>

      <div className="border-t border-white/20 pt-3 mt-1">
        <CardField label="Member" value={memberName} />
      </div>

      <div className="mt-3 text-[10px] opacity-60">
        {MOCK_DENTAL_CARRIER.phone} · {MOCK_DENTAL_CARRIER.website}
      </div>
    </BenefitCard>
  )
}

// ─── Print a single card by element id ───────────────────────────────────────
function printCard(id, title) {
  const el = document.getElementById(id)
  if (!el) return

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f9fafb; font-family: 'Open Sans', sans-serif; }
          .card { width: 340px; }
        </style>
      </head>
      <body>
        <div class="card">${el.outerHTML}</div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
    </html>
  `
  const win = window.open('', '_blank', 'width=500,height=400')
  win.document.write(html)
  win.document.close()
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MyCardPage() {
  const { activeEntity } = usePersona()
  const memberId = activeEntity?.id

  const [member,   setMember]   = useState(null)
  const [plan,     setPlan]     = useState(null)
  const [contract, setContract] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!memberId) { setLoading(false); return }

    async function fetchData() {
      const { data: memberData, error: err } = await supabase
        .from('member')
        .select(`
          member_id, member_number, certificate_number, plan_id,
          employee(first_name, last_name),
          plan(plan_name, group_contract(contract_number, contract_name))
        `)
        .eq('member_id', memberId)
        .single()

      if (err) { setError(err.message); setLoading(false); return }

      setMember(memberData)
      setPlan(memberData?.plan ?? null)
      // plan may join to group_contract as array or object depending on FK direction
      const contractData = Array.isArray(memberData?.plan?.group_contract)
        ? memberData.plan.group_contract[0]
        : memberData?.plan?.group_contract
      setContract(contractData ?? null)
      setLoading(false)
    }

    fetchData()
  }, [memberId])

  if (loading) return <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
  if (error)   return <div className="text-sm text-red-500 py-4">Error: {error}</div>

  return (
    <div className="max-w-2xl">
      {/* Page header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Benefits Card</h1>
          <p className="text-sm text-gray-500 mt-1">
            Present these cards to your provider or pharmacist at time of service.
          </p>
        </div>
      </div>

      {/* Mock data notice */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
        <InfoOutlinedIcon style={{ fontSize: '1rem', color: '#d97706', marginTop: 2, flexShrink: 0 }} />
        <p className="text-xs text-amber-700">
          Card data shown is for testing purposes only. Real carrier and PBM numbers will be populated once the third-party integration is complete.
        </p>
      </div>

      {/* Tabs — Dental / Drug */}
      <Tabs.Root defaultValue="dental">
        <Tabs.List className="flex gap-1 border-b border-gray-200 mb-6">
          {[
            { value: 'dental', label: 'Dental',          icon: MedicalServicesOutlinedIcon },
            { value: 'drug',   label: 'Prescription Drug', icon: LocalPharmacyOutlinedIcon  },
          ].map(({ value, label, icon: Icon }) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-500 border-b-2 border-transparent -mb-px transition-colors
                data-[selected]:text-blue-600 data-[selected]:border-blue-600
                hover:text-gray-700 focus:outline-none"
            >
              <Icon style={{ fontSize: '1rem' }} />
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Dental tab */}
        <Tabs.Content value="dental">
          <div className="flex flex-col gap-6">
            <DentalCard member={member} plan={plan} contract={contract} />
            <div className="flex gap-3">
              <Button
                variant="contained"
                startIcon={<PrintOutlinedIcon />}
                onClick={() => printCard('card-dental', 'Dental Benefits Card')}
              >
                Print Card
              </Button>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">How to use your Dental card</h3>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Present this card to your dental provider before treatment begins.</li>
                <li>Your provider will submit the claim directly to ABC Insurance.</li>
                <li>You are responsible for any amounts not covered under your plan.</li>
                <li>Contact us at {MOCK_DENTAL_CARRIER.phone} for benefit inquiries.</li>
              </ul>
            </div>
          </div>
        </Tabs.Content>

        {/* Drug tab */}
        <Tabs.Content value="drug">
          <div className="flex flex-col gap-6">
            <DrugCard member={member} plan={plan} contract={contract} />
            <div className="flex gap-3">
              <Button
                variant="contained"
                startIcon={<PrintOutlinedIcon />}
                onClick={() => printCard('card-drug', 'Prescription Drug Benefits Card')}
              >
                Print Card
              </Button>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">How to use your Drug card</h3>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Present this card to your pharmacist when filling a prescription.</li>
                <li>Provide the <strong>BIN</strong>, <strong>PCN</strong>, <strong>Group</strong>, and <strong>ID</strong> fields if asked.</li>
                <li>Eligible drugs are processed at point of sale — no paper claim needed.</li>
                <li>Contact the PBM help desk at {MOCK_PBM.helpDesk} for pharmacy issues.</li>
              </ul>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
