import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Tabs } from '@ark-ui/react/tabs'
import { Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'

// Which benefit_types belong to each tab
const TAB_BENEFIT_TYPES = {
  'life-disability':   ['LIFE', 'ADD', 'STD', 'LTD', 'CI'],
  'drugs':             ['DRUG'],
  'health':            ['EHC'],
  'dental':            ['DENTAL'],
  'spending-accounts': ['HSA', 'WSA'],
  'additional':        ['VISION', 'OOC'],
}

function formatCurrency(val) {
  if (val == null) return '—'
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val)
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
    </div>
  )
}

function BenefitTable({ benefits }) {
  if (benefits.length === 0)
    return <p className="text-sm text-gray-400 px-6 py-8">No benefits configured for this section.</p>

  return (
    <table className="w-full text-sm">
      <thead className="border-b border-gray-100">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Benefit</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Coverage Formula</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Flat Amount</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">NEM</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Max</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Waiting (days)</th>
        </tr>
      </thead>
      <tbody>
        {benefits.map((b, i) => (
          <tr key={b.benefit_id} className={i < benefits.length - 1 ? 'border-b border-gray-100' : ''}>
            <td className="px-6 py-3 text-gray-900 font-medium">{b.benefit_name}</td>
            <td className="px-6 py-3 text-gray-600">{b.benefit_type}</td>
            <td className="px-6 py-3 text-gray-600">{b.coverage_formula.replace('_', ' ')}</td>
            <td className="px-6 py-3 text-gray-600">{formatCurrency(b.flat_amount)}</td>
            <td className="px-6 py-3 text-gray-600">{formatCurrency(b.nem_amount)}</td>
            <td className="px-6 py-3 text-gray-600">{formatCurrency(b.max_amount)}</td>
            <td className="px-6 py-3 text-gray-600">{b.waiting_period_days ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const TABS = [
  { id: 'overview',         label: 'Overview' },
  { id: 'life-disability',  label: 'Life & Disability' },
  { id: 'drugs',            label: 'Drugs' },
  { id: 'health',           label: 'Health' },
  { id: 'dental',           label: 'Dental' },
  { id: 'spending-accounts',label: 'Spending Accounts' },
  { id: 'additional',       label: 'Additional Benefits' },
]

export default function PlanDetailPage() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const contractId = searchParams.get('contractId')

  const [plan, setBenefit] = useState(null)
  const [benefits, setBenefits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const backUrl = contractId ? `/portal/plans?contractId=${contractId}` : '/portal/plans'

  useEffect(() => {
    async function fetchData() {
      const [planRes, benefitsRes] = await Promise.all([
        supabase
          .from('plan')
          .select(`
            plan_id, plan_name, plan_code, status, plan_definition_json,
            effective_date, termination_date, version,
            group_contract ( contract_name, contract_number, sponsor ( sponsor_name ) )
          `)
          .eq('plan_id', planId)
          .single(),
        supabase
          .from('benefit')
          .select('*')
          .eq('plan_id', planId)
          .eq('is_active', true)
          .order('benefit_type'),
      ])

      if (planRes.error) setError(planRes.error.message)
      else {
        setBenefit(planRes.data)
        setBenefits(benefitsRes.data ?? [])
      }
      setLoading(false)
    }
    fetchData()
  }, [planId])

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>
  if (error)   return <p className="text-sm text-red-500">Error: {error}</p>

  const def = plan.plan_definition_json ?? {}
  const sponsor = plan.group_contract?.sponsor?.sponsor_name ?? '—'

  return (
    <div className="w-full">
      {/* Back */}
      <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate(backUrl)} sx={{ mb: 1, pl: 0 }}>
        Back to Plans
      </Button>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{plan.plan_name}</h1>

      {/* Tabs */}
      <Tabs.Root defaultValue="overview">
        <Tabs.List className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              className="px-4 py-3 text-sm font-medium cursor-pointer whitespace-nowrap border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors data-[selected]:border-b-2 data-[selected]:text-gray-900"
              style={{}}
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
          <div className="flex-1" />
        </Tabs.List>

        {/* Overview tab */}
        <Tabs.Content value="overview">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            <div className="flex gap-3">
              <Button variant="outlined" startIcon={<PeopleAltOutlinedIcon />} onClick={() => navigate(`/portal/members?planId=${planId}`)}>
                VIEW MEMBERS
              </Button>
              <Button variant="outlined" startIcon={<RequestQuoteOutlinedIcon />}>
                REQUEST QUOTE FOR PLAN
              </Button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-5">General</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-5">
              <InfoRow label="Sponsor" value={sponsor} />
              <InfoRow label="Group" value={def.group} />
              <InfoRow label="Plan Type" value={def.plan_type} />
              <InfoRow label="Eligible Classes" value={
                def.eligible_classes?.length
                  ? <ul className="space-y-0.5">{def.eligible_classes.map((c, i) => <li key={i}>{c}</li>)}</ul>
                  : '—'
              } />
              <InfoRow label="Modules" value={def.modules?.join(', ')} />
              <InfoRow label="Reenrolment Period" value={def.reenrolment_period} />
              <InfoRow label="Waiting Period" value={
                benefits.length
                  ? `${Math.min(...benefits.map(b => b.waiting_period_days ?? 9999))} days`
                  : '—'
              } />
              <InfoRow label="Status" value={plan.status} />
            </div>
          </div>
        </Tabs.Content>

        {/* Benefit tabs */}
        {Object.entries(TAB_BENEFIT_TYPES).map(([tabId, types]) => (
          <Tabs.Content key={tabId} value={tabId}>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <BenefitTable benefits={benefits.filter(b => types.includes(b.benefit_type))} />
            </div>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  )
}
