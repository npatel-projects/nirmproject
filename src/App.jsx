import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from './components/PortalLayout'
import ContractsPage from './pages/portal/ContractsPage'
import ContractDetailPage from './pages/portal/ContractDetailPage'
import PlansPage from './pages/portal/PlansPage'
import PlanDetailPage from './pages/portal/PlanDetailPage'
import MembersPage from './pages/portal/MembersPage'
import EmployeeDetailPage from './pages/portal/EmployeeDetailPage'
import EnrollmentPage from './pages/portal/EnrollmentPage'
import ClaimsPage from './pages/portal/ClaimsPage'
import ClaimDetailPage from './pages/portal/ClaimDetailPage'
import CreateClaimPage from './pages/portal/CreateClaimPage'
import PersonaGuard from './components/PersonaGuard'
import { usePersona } from './context/PersonaContext'

function DefaultRedirect() {
  const { persona } = usePersona()
  return <Navigate to={persona.defaultRoute} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DefaultRedirect />} />
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<DefaultRedirect />} />
          <Route path="contracts" element={<PersonaGuard route="contracts"><ContractsPage /></PersonaGuard>} />
          <Route path="contracts/:contractId" element={<PersonaGuard route="contracts"><ContractDetailPage /></PersonaGuard>} />
          <Route path="plans" element={<PersonaGuard route="plans"><PlansPage /></PersonaGuard>} />
          <Route path="plans/:planId" element={<PersonaGuard route="plans"><PlanDetailPage /></PersonaGuard>} />
          <Route path="members" element={<PersonaGuard route="members"><MembersPage /></PersonaGuard>} />
          <Route path="members/:employeeId" element={<PersonaGuard route="members"><EmployeeDetailPage /></PersonaGuard>} />
          <Route path="members/:employeeId/enroll" element={<PersonaGuard route="members"><EnrollmentPage /></PersonaGuard>} />
          <Route path="claims" element={<PersonaGuard route="claims"><ClaimsPage /></PersonaGuard>} />
          <Route path="claims/new" element={<PersonaGuard route="claims"><CreateClaimPage /></PersonaGuard>} />
          <Route path="claims/:claimId" element={<PersonaGuard route="claims"><ClaimDetailPage /></PersonaGuard>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
