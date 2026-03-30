import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import { Tooltip } from '@ark-ui/react/tooltip'
import { Button } from '@mui/material'
import { colors } from '../../theme'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function InfoGrid({ fields }) {
  return (
    <div className="grid grid-cols-2 gap-x-12 gap-y-6 p-6">
      {fields.map(({ label, value }) => (
        <div key={label}>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-sm text-gray-900">{value || '—'}</p>
        </div>
      ))}
    </div>
  )
}

export default function ContractDetailPage() {
  const { contractId } = useParams()
  const navigate = useNavigate()
  const [contract, setContract] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const [contractRes, docsRes] = await Promise.all([
        supabase
          .from('group_contract')
          .select(`
            contract_id, contract_number, contract_name,
            effective_date, renewal_date, termination_date,
            funding_type, status, country_code,
            sponsor ( sponsor_name ),
            plan ( plan_name )
          `)
          .eq('contract_id', contractId)
          .single(),

        supabase
          .from('contract_document')
          .select('document_id, document_type, event, effective_date, issue_date, storage_ref')
          .eq('contract_id', contractId)
          .order('issue_date', { ascending: true }),
      ])

      if (contractRes.error) setError(contractRes.error.message)
      else {
        setContract(contractRes.data)
        setDocuments(docsRes.data ?? [])
      }
      setLoading(false)
    }

    fetchData()
  }, [contractId])

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>
  if (error)   return <p className="text-sm text-red-500">Error: {error}</p>

  const plans = contract.plan ?? []
  const planNames = plans.map(p => p.plan_name).join(', ')

  const policyFields = [
    { label: 'Plans',                   value: planNames },
    { label: 'Group Policy Number',     value: contract.contract_number },
    { label: 'Contract Effective Date', value: formatDate(contract.effective_date) },
    { label: 'Renewal Date',            value: formatDate(contract.renewal_date) },
    { label: 'Funding Type',            value: contract.funding_type },
    { label: 'Status',                  value: contract.status },
    { label: 'Country',                 value: contract.country_code },
    { label: 'Termination Date',        value: formatDate(contract.termination_date) },
  ]

  return (
    <div className="w-full">
      {/* Back link */}
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/portal/contracts')}
        sx={{ mb: 2, pl: 0 }}
      >
        Back to Group Policy Contracts
      </Button>

      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {contract.contract_name} {contract.contract_number}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{planNames}</p>
        </div>
        <Button variant="contained" onClick={() => navigate(`/portal/plans?contractId=${contract.contract_id}`)}>
          VIEW PLANS
        </Button>
      </div>

      {/* Policy Information */}
      <div className="bg-white border border-gray-200 rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Policy Information</h2>
        </div>
        <InfoGrid fields={policyFields} />
      </div>

      {/* Documents */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Documents</h2>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Document Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Effective Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Issue Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">View PDF</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, i) => (
              <tr key={doc.document_id} className={i < documents.length - 1 ? 'border-b border-gray-100' : ''}>
                <td className="px-6 py-4 text-gray-900">{doc.document_type}</td>
                <td className="px-6 py-4 text-gray-600">{doc.event}</td>
                <td className="px-6 py-4 text-gray-600">{formatDate(doc.effective_date)}</td>
                <td className="px-6 py-4 text-gray-600">{formatDate(doc.issue_date)}</td>
                <td className="px-6 py-4">
                  {doc.storage_ref ? (
                    <a href={doc.storage_ref} target="_blank" rel="noreferrer" style={{ color: colors.link }}>
                      <FileDownloadOutlinedIcon fontSize="small" />
                    </a>
                  ) : (
                    <Tooltip.Root openDelay={100} closeDelay={0}>
                      <Tooltip.Trigger asChild>
                        <span className="text-gray-300 cursor-not-allowed inline-flex">
                          <FileDownloadOutlinedIcon fontSize="small" />
                        </span>
                      </Tooltip.Trigger>
                      <Tooltip.Positioner>
                        <Tooltip.Content className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md">
                          PDF not yet available
                        </Tooltip.Content>
                      </Tooltip.Positioner>
                    </Tooltip.Root>
                  )}
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">No documents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
