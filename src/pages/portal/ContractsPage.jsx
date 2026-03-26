import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function ContractCard({ contract }) {
  const plans = contract.plan ?? []

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div>
          <p className="font-semibold text-gray-900">
            {contract.contract_name} {contract.contract_number}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {plans.length} {plans.length === 1 ? 'Plan' : 'Plans'} &bull; Effective:{' '}
            {new Date(contract.effective_date).toLocaleDateString('en-CA', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </p>
        </div>
        <button className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
          View Details
        </button>
      </div>

      {/* Card body */}
      <div className="px-5 py-4 space-y-4">
        <DetailRow label="Plans" value={plans.map(p => p.plan_name).join(', ') || '—'} />
        <DetailRow label="Group Policy Contract Number" value={contract.contract_number} />
        <DetailRow label="Contract Effective Date" value={formatDate(contract.effective_date)} />
        <DetailRow label="Next Renewal Date" value={formatDate(contract.renewal_date)} />
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        .eq('status', 'ACTIVE')
        .order('effective_date', { ascending: false })

      if (error) setError(error.message)
      else setContracts(data)
      setLoading(false)
    }

    fetchContracts()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Group Policy Contracts</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Click on a policy contract to view details or access plans
      </p>

      {loading && <p className="text-sm text-gray-400">Loading contracts...</p>}
      {error && <p className="text-sm text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contracts.map((contract) => (
            <ContractCard key={contract.contract_id} contract={contract} />
          ))}
        </div>
      )}
    </div>
  )
}
