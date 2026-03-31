import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePersona } from '../../context/PersonaContext'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import StatusChip from '../../components/StatusChip'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { colors } from '../../theme'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <Icon style={{ fontSize: '0.95rem', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
      <div className="min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold leading-none mb-0.5">
          {label}
        </p>
        <p className="text-sm text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function ContractRow({ contract }) {
  const navigate = useNavigate()
  const plans = contract.plan ?? []

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg px-6 py-5 flex items-center gap-6 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all group"
      onClick={() => navigate(`/portal/contracts/${contract.contract_id}`)}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#f0fdf4' }}
      >
        <ArticleOutlinedIcon style={{ fontSize: '1.2rem', color: colors.brandPrimary }} />
      </div>

      {/* Contract name + plans */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-semibold text-gray-900 text-sm">
            {contract.contract_name}
          </h3>
          <span className="text-xs text-gray-400">{contract.contract_number}</span>
          <StatusChip status={contract.status} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {plans.map((p) => (
            <span
              key={p.plan_name}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
            >
              {p.plan_name}
            </span>
          ))}
          {plans.length === 0 && (
            <span className="text-xs text-gray-400">No plans</span>
          )}
        </div>
      </div>

      {/* Meta columns */}
      <div className="hidden md:flex items-center gap-8 shrink-0">
        <MetaItem
          icon={CalendarTodayOutlinedIcon}
          label="Effective"
          value={formatDate(contract.effective_date)}
        />
        <MetaItem
          icon={AutorenewOutlinedIcon}
          label="Renewal"
          value={formatDate(contract.renewal_date)}
        />
      </div>

      {/* Chevron */}
      <ChevronRightIcon
        className="shrink-0 text-gray-300 group-hover:text-gray-400 transition-colors"
        style={{ fontSize: '1.25rem' }}
      />
    </div>
  )
}

export default function ContractsPage() {
  const { sponsorId } = usePersona()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    async function fetchContracts() {
      const { data, error } = await supabase
        .from('group_contract')
        .select(`
          contract_id,
          contract_number,
          contract_name,
          effective_date,
          renewal_date,
          status,
          sponsor ( sponsor_name ),
          plan ( plan_name )
        `)
        .eq('sponsor_id', sponsorId)
        .eq('status', 'ACTIVE')
        .order('effective_date', { ascending: false })

      if (error) setError(error.message)
      else setContracts(data)
      setLoading(false)
    }
    fetchContracts()
  }, [sponsorId])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Group Policy Contracts</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        {loading ? '' : `${contracts.length} active ${contracts.length === 1 ? 'contract' : 'contracts'}`}
      </p>

      {loading && <p className="text-sm text-gray-400">Loading contracts...</p>}
      {error   && <p className="text-sm text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="flex flex-col gap-3">
          {contracts.map((contract) => (
            <ContractRow key={contract.contract_id} contract={contract} />
          ))}
          {contracts.length === 0 && (
            <p className="text-sm text-gray-400">No active contracts found.</p>
          )}
        </div>
      )}
    </div>
  )
}
