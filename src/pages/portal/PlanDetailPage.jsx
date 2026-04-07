import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Tabs } from '@ark-ui/react/tabs'
import { Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'

// ── Tab definitions ────────────────────────────────────────────────────────────
// benefit_types controls which benefits feed into each tab.
// 'additional' also renders plan_definition_json.additional_benefits cards.
const TAB_DEFS = [
  { id: 'overview',         label: 'Overview',           types: [] },
  { id: 'life-disability',  label: 'Life & Disability',  types: ['LIFE', 'ADD', 'STD', 'LTD', 'CI'] },
  { id: 'drugs',            label: 'Drugs',              types: ['DRUG'] },
  { id: 'health',           label: 'Health',             types: ['EHC'] },
  { id: 'dental',           label: 'Dental',             types: ['DENTAL'] },
  { id: 'spending-accounts',label: 'Spending Accounts',  types: ['HSA', 'WSA'] },
  { id: 'additional',       label: 'Additional Benefits',types: ['VISION', 'OOC'] },
]

// ── Small helpers ──────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="text-sm font-medium text-gray-900">{value || '—'}</div>
    </div>
  )
}

function EmptySection() {
  return <p className="text-sm text-gray-400 py-10 text-center">No benefits configured for this section.</p>
}

// ── Field renderer inside a card ──────────────────────────────────────────────
// A field has { label, value? } or { label, values? } (bullet list).
function FieldGrid({ fields }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-4">
      {fields.map((f, i) => (
        <div key={i}>
          <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
          {Array.isArray(f.values) ? (
            <ul className="text-sm font-medium text-gray-900 space-y-0.5 list-none">
              {f.values.map((v, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  {v}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm font-medium text-gray-900 whitespace-pre-line">{f.value ?? '—'}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ── A single display-section card (non-tiered benefits) ───────────────────────
// section: { title, wide, fields }
function FieldCard({ section }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-5">{section.title}</p>
      <FieldGrid fields={section.fields} />
    </div>
  )
}

// ── Tier selector pill ─────────────────────────────────────────────────────────
function TierSelector({ tiers, selected, onChange }) {
  if (tiers.length <= 1) return null
  return (
    <div className="flex items-center gap-1 mb-5 p-1 bg-gray-100 rounded-full w-fit">
      {tiers.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            selected === t.key
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t.key}
        </button>
      ))}
    </div>
  )
}

// ── Tiered benefit content ─────────────────────────────────────────────────────
// tier: { key, label, field_groups: [{ title?, fields }] }
function TieredContent({ tier }) {
  if (!tier) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-5">{tier.label}</p>
      <div className="space-y-6">
        {tier.field_groups.map((group, i) => (
          <div key={i}>
            {group.title && (
              <p className="text-sm font-semibold text-gray-700 mb-3">{group.title}</p>
            )}
            <FieldGrid fields={group.fields} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Life & Disability tab ──────────────────────────────────────────────────────
// Renders display_sections from each benefit.
// wide sections span 2 cols, narrow sections go 2-per-row.
function LifeDisabilityTab({ benefits }) {
  const relevant = benefits.filter((b) => TAB_DEFS[1].types.includes(b.benefit_type))

  // Flatten all display_sections across all relevant benefits, preserving order
  const sections = relevant.flatMap((b) => b.benefit_definition_json?.display_sections ?? [])

  if (sections.length === 0) return <EmptySection />

  // Render: wide sections are full-width rows; narrow ones pair up in a 2-col grid
  const rows = []
  let i = 0
  while (i < sections.length) {
    const s = sections[i]
    if (s.wide) {
      rows.push(<FieldCard key={i} section={s} />)
      i++
    } else {
      // Pair with next narrow section if available
      const next = sections[i + 1] && !sections[i + 1].wide ? sections[i + 1] : null
      rows.push(
        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldCard section={s} />
          {next ? <FieldCard section={next} /> : <div />}
        </div>
      )
      i += next ? 2 : 1
    }
  }

  return <div className="space-y-4">{rows}</div>
}

// ── Tiered tab (Drugs / Health / Dental) ──────────────────────────────────────
function TieredTab({ benefits, types, tabLabel }) {
  const benefit = benefits.find((b) => types.includes(b.benefit_type))
  const tiers = benefit?.benefit_definition_json?.tiers ?? []
  const [selected, setSelected] = useState(tiers[0]?.key ?? '')

  // Reset selected tier if benefit changes (e.g., plan navigation)
  useEffect(() => {
    if (tiers.length > 0 && !tiers.find((t) => t.key === selected)) {
      setSelected(tiers[0].key)
    }
  }, [benefit?.benefit_id])

  if (!benefit || tiers.length === 0) return <EmptySection />

  const currentTier = tiers.find((t) => t.key === selected) ?? tiers[0]

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">{tabLabel}</h2>
        <TierSelector tiers={tiers} selected={selected} onChange={setSelected} />
      </div>
      <TieredContent tier={currentTier} />
    </div>
  )
}

// ── Spending Accounts tab ──────────────────────────────────────────────────────
// HSA/WSA — can be tiered or flat; renders same as Life & Disability but for HSA/WSA types.
function SpendingAccountsTab({ benefits }) {
  const relevant = benefits.filter((b) => TAB_DEFS[5].types.includes(b.benefit_type))
  if (relevant.length === 0) return <EmptySection />

  return (
    <div className="space-y-4">
      {relevant.map((b) => {
        const tiers = b.benefit_definition_json?.tiers
        if (tiers?.length) {
          return <TieredTabSingle key={b.benefit_id} benefit={b} />
        }
        const sections = b.benefit_definition_json?.display_sections ?? []
        return sections.map((s, i) => <FieldCard key={`${b.benefit_id}-${i}`} section={s} />)
      })}
    </div>
  )
}

function TieredTabSingle({ benefit }) {
  const tiers = benefit.benefit_definition_json?.tiers ?? []
  const [selected, setSelected] = useState(tiers[0]?.key ?? '')
  const currentTier = tiers.find((t) => t.key === selected) ?? tiers[0]
  return (
    <div>
      <TierSelector tiers={tiers} selected={selected} onChange={setSelected} />
      <TieredContent tier={currentTier} />
    </div>
  )
}

// ── Additional Benefits tab ────────────────────────────────────────────────────
// Renders VISION/OOC benefit cards + plan_definition_json.additional_benefits (EAP, etc.)
function AdditionalBenefitsTab({ benefits, additionalBenefits }) {
  const relevant = benefits.filter((b) => TAB_DEFS[6].types.includes(b.benefit_type))
  const sections = relevant.flatMap((b) => b.benefit_definition_json?.display_sections ?? [])

  if (sections.length === 0 && additionalBenefits.length === 0) return <EmptySection />

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {sections.map((s, i) => <FieldCard key={`s-${i}`} section={s} />)}
      {additionalBenefits.map((ab, i) => <FieldCard key={`ab-${i}`} section={ab} />)}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function PlanDetailPage() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const contractId = searchParams.get('contractId')

  const [plan, setPlan] = useState(null)
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
            plan_id, plan_name, plan_code, plan_type, status, plan_definition_json,
            effective_date, termination_date, version,
            group_contract ( contract_name, contract_number, sponsor ( sponsor_name ) )
          `)
          .eq('plan_id', planId)
          .single(),
        supabase
          .from('benefit')
          .select('benefit_id, benefit_name, benefit_type, coverage_formula, flat_amount, nem_amount, max_amount, waiting_period_days, benefit_definition_json')
          .eq('plan_id', planId)
          .eq('is_active', true)
          .order('benefit_type'),
      ])

      if (planRes.error) setError(planRes.error.message)
      else {
        setPlan(planRes.data)
        setBenefits(benefitsRes.data ?? [])
      }
      setLoading(false)
    }
    fetchData()
  }, [planId])

  if (loading) return <p className="text-sm text-gray-400 py-10 text-center">Loading...</p>
  if (error)   return <p className="text-sm text-red-500">Error: {error}</p>

  const def = plan.plan_definition_json ?? {}
  const sponsor = plan.group_contract?.sponsor?.sponsor_name ?? '—'
  const additionalBenefits = def.additional_benefits ?? []

  // Only show tabs that have data
  const visibleTabs = TAB_DEFS.filter((tab) => {
    if (tab.id === 'overview') return true
    if (tab.id === 'additional') return additionalBenefits.length > 0 || benefits.some((b) => tab.types.includes(b.benefit_type))
    return benefits.some((b) => tab.types.includes(b.benefit_type))
  })

  return (
    <div className="w-full">
      <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate(backUrl)} sx={{ mb: 1, pl: 0 }}>
        Back to Plans
      </Button>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">{plan.plan_name}</h1>

      <Tabs.Root defaultValue="overview">
        <Tabs.List className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {visibleTabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              className="px-4 py-3 text-sm font-medium cursor-pointer whitespace-nowrap border-b-2 border-transparent text-gray-500 hover:text-gray-800 transition-colors data-[selected]:border-interactive data-[selected]:text-interactive"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
          <div className="flex-1" />
        </Tabs.List>

        {/* ── Overview ─────────────────────────────────────────────────── */}
        <Tabs.Content value="overview">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            <div className="flex gap-3">
              <Button
                variant="outlined"
                startIcon={<PeopleAltOutlinedIcon />}
                onClick={() => navigate(`/portal/members?planId=${planId}`)}
                sx={{ textTransform: 'none' }}
              >
                View Members
              </Button>
              <Button
                variant="outlined"
                startIcon={<RequestQuoteOutlinedIcon />}
                sx={{ textTransform: 'none' }}
              >
                Request Quote for Plan
              </Button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-5">General</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-5">
              <InfoRow label="Sponsor" value={sponsor} />
              <InfoRow label="Group" value={def.group} />
              <InfoRow label="Plan Type" value={plan.plan_type} />
              <InfoRow label="Eligible Classes" value={
                def.eligible_classes?.length
                  ? <ul className="space-y-0.5">{def.eligible_classes.map((c, i) => <li key={i}>{c}</li>)}</ul>
                  : '—'
              } />
              <InfoRow label="Modules" value={def.modules?.join(', ')} />
              <InfoRow label="Re-enrolment Period" value={def.reenrolment_period} />
              <InfoRow label="Status" value={plan.status} />
            </div>
          </div>
        </Tabs.Content>

        {/* ── Life & Disability ─────────────────────────────────────────── */}
        <Tabs.Content value="life-disability">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Life & Disability</h2>
          <LifeDisabilityTab benefits={benefits} />
        </Tabs.Content>

        {/* ── Drugs ────────────────────────────────────────────────────── */}
        <Tabs.Content value="drugs">
          <TieredTab benefits={benefits} types={['DRUG']} tabLabel="Drugs" />
        </Tabs.Content>

        {/* ── Health ───────────────────────────────────────────────────── */}
        <Tabs.Content value="health">
          <TieredTab benefits={benefits} types={['EHC']} tabLabel="Health" />
        </Tabs.Content>

        {/* ── Dental ───────────────────────────────────────────────────── */}
        <Tabs.Content value="dental">
          <TieredTab benefits={benefits} types={['DENTAL']} tabLabel="Dental" />
        </Tabs.Content>

        {/* ── Spending Accounts ─────────────────────────────────────────── */}
        <Tabs.Content value="spending-accounts">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Spending Accounts</h2>
          <SpendingAccountsTab benefits={benefits} />
        </Tabs.Content>

        {/* ── Additional Benefits ───────────────────────────────────────── */}
        <Tabs.Content value="additional">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Additional Benefits</h2>
          <AdditionalBenefitsTab benefits={benefits} additionalBenefits={additionalBenefits} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
