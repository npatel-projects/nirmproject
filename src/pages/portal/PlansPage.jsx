import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Select, createListCollection } from '@ark-ui/react/select'
import { Pagination } from '@ark-ui/react/pagination'
import SearchIcon from '@mui/icons-material/Search'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { colors } from '../../theme'

const PAGE_SIZE = 10

export default function PlansPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [plans, setPlans] = useState([])
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const contractFilter = searchParams.get('contractId') ?? 'all'

  useEffect(() => {
    async function fetchData() {
      const [plansRes, contractsRes] = await Promise.all([
        supabase
          .from('plan')
          .select('plan_id, plan_name, plan_code, status, contract_id, group_contract(contract_id, contract_name, contract_number)')
          .order('plan_name'),
        supabase
          .from('group_contract')
          .select('contract_id, contract_name, contract_number')
          .eq('status', 'ACTIVE')
          .order('contract_name'),
      ])

      if (plansRes.error) setError(plansRes.error.message)
      else {
        setPlans(plansRes.data)
        setContracts(contractsRes.data ?? [])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [search, contractFilter])

  const filtered = useMemo(() => {
    return plans.filter(p => {
      const matchesContract = contractFilter === 'all' || p.contract_id === contractFilter
      const matchesSearch = p.plan_name.toLowerCase().includes(search.toLowerCase())
      return matchesContract && matchesSearch
    })
  }, [plans, contractFilter, search])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const contractCollection = createListCollection({
    items: [
      { label: 'All Contracts', value: 'all' },
      ...contracts.map(c => ({ label: `${c.contract_name} (${c.contract_number})`, value: c.contract_id })),
    ],
  })

  const selectedContractLabel = contractFilter === 'all'
    ? 'All Contracts'
    : contracts.find(c => c.contract_id === contractFilter)?.contract_name ?? 'All Contracts'

  function handleContractChange(value) {
    if (value === 'all') {
      searchParams.delete('contractId')
    } else {
      searchParams.set('contractId', value)
    }
    setSearchParams(searchParams)
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Plans</h1>
      <hr className="border-gray-200 mb-5" />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative">
          <SearchIcon fontSize="small" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400 w-56"
          />
        </div>

        {/* Contract filter */}
        <Select.Root
          collection={contractCollection}
          value={[contractFilter]}
          onValueChange={({ value }) => handleContractChange(value[0])}
        >
          <Select.Control>
            <Select.Trigger className="flex items-center justify-between gap-2 px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer hover:border-gray-400 focus:outline-none min-w-52">
              <Select.ValueText className="text-gray-700 truncate">
                {selectedContractLabel}
              </Select.ValueText>
              <ArrowDropDownIcon fontSize="small" className="text-gray-400 shrink-0" />
            </Select.Trigger>
          </Select.Control>
          <Select.Positioner>
            <Select.Content className="bg-white border border-gray-200 rounded shadow-lg z-50 min-w-52 py-1">
              {contractCollection.items.map(item => (
                <Select.Item
                  key={item.value}
                  item={item}
                  className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 data-[highlighted]:bg-gray-50"
                >
                  <Select.ItemText>{item.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading plans...</p>}
      {error && <p className="text-sm text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none">
                    <span className="flex items-center gap-1">
                      Plan Name <UnfoldMoreIcon fontSize="small" className="text-gray-400" />
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none">
                    <span className="flex items-center gap-1">
                      Contract <UnfoldMoreIcon fontSize="small" className="text-gray-400" />
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((plan, i) => (
                  <tr
                    key={plan.plan_id}
                    onClick={() => navigate(`/portal/plans/${plan.plan_id}${contractFilter !== 'all' ? `?contractId=${contractFilter}` : ''}`)}
                    className={`cursor-pointer hover:bg-gray-50 ${i < paginated.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <td className="px-6 py-3 font-medium" style={{ color: colors.link }}>
                      {plan.plan_name}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {plan.group_contract?.contract_name ?? '—'}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{plan.status}</td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-400">
                      No plans found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
              </span>

              <Pagination.Root
                count={filtered.length}
                pageSize={PAGE_SIZE}
                page={page}
                onPageChange={({ page }) => setPage(page)}
              >
                <Pagination.Context>
                  {({ pages }) => (
                    <div className="flex items-center gap-1">
                      <Pagination.PrevTrigger className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronLeftIcon fontSize="small" />
                      </Pagination.PrevTrigger>

                      {pages.map((p, i) =>
                        p.type === 'page' ? (
                          <Pagination.Item
                            key={i}
                            {...p}
                            className="w-8 h-8 rounded flex items-center justify-center text-sm cursor-pointer hover:bg-gray-100 data-[selected]:text-white data-[selected]:font-semibold"
                            style={{}}
                            data-selected={p.value === page ? '' : undefined}
                          >
                            <span
                              className="w-8 h-8 rounded flex items-center justify-center"
                              style={p.value === page ? { backgroundColor: colors.brandPrimary, color: '#fff' } : {}}
                            >
                              {p.value}
                            </span>
                          </Pagination.Item>
                        ) : (
                          <Pagination.Ellipsis key={i} index={i} className="px-1">…</Pagination.Ellipsis>
                        )
                      )}

                      <Pagination.NextTrigger className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronRightIcon fontSize="small" />
                      </Pagination.NextTrigger>
                    </div>
                  )}
                </Pagination.Context>
              </Pagination.Root>
            </div>
          )}
        </>
      )}
    </div>
  )
}
