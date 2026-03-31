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
import MyCardPage from './pages/portal/MyCardPage'
import ChangeRequestsPage from './pages/portal/ChangeRequestsPage'
import CreateChangeRequestPage from './pages/portal/CreateChangeRequestPage'
import ChangeRequestDetailPage from './pages/portal/ChangeRequestDetailPage'
import ContactsPage from './pages/portal/ContactsPage'
import AnalyticsPage from './pages/portal/AnalyticsPage'
import MyGroupsPage from './pages/portal/MyGroupsPage'
import MessagesPage from './pages/portal/MessagesPage'
import MessageDetailPage from './pages/portal/MessageDetailPage'
import TestPage from './pages/portal/TestPage'
import PersonaGuard from './components/PersonaGuard'
import AuthGuard from './components/AuthGuard'
import LoginPage from './pages/LoginPage'
import { usePersona } from './context/PersonaContext'

function DefaultRedirect() {
  const { persona, personaKey, activeEntity } = usePersona()
  if (personaKey === 'MEMBER' && activeEntity?.employeeId) {
    return <Navigate to={`/portal/members/${activeEntity.employeeId}`} replace />
  }
  return <Navigate to={persona.defaultRoute} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DefaultRedirect />} />
        <Route path="/portal" element={<AuthGuard><PortalLayout /></AuthGuard>}>
          <Route index element={<DefaultRedirect />} />
          <Route path="contracts" element={<PersonaGuard route="contracts"><ContractsPage /></PersonaGuard>} />
          <Route path="contracts/:contractId" element={<PersonaGuard route="contracts"><ContractDetailPage /></PersonaGuard>} />
          <Route path="plans" element={<PersonaGuard route="plans"><PlansPage /></PersonaGuard>} />
          <Route path="plans/:planId" element={<PersonaGuard route="plans"><PlanDetailPage /></PersonaGuard>} />
          <Route path="members" element={<PersonaGuard route="members"><MembersPage /></PersonaGuard>} />
          <Route path="members/:employeeId" element={<PersonaGuard route="member-profile"><EmployeeDetailPage /></PersonaGuard>} />
          <Route path="members/:employeeId/enroll" element={<PersonaGuard route="member-profile"><EnrollmentPage /></PersonaGuard>} />
          <Route path="claims" element={<PersonaGuard route="claims"><ClaimsPage /></PersonaGuard>} />
          <Route path="claims/new" element={<PersonaGuard route="claims"><CreateClaimPage /></PersonaGuard>} />
          <Route path="claims/:claimId" element={<PersonaGuard route="claims"><ClaimDetailPage /></PersonaGuard>} />
          <Route path="my-card" element={<PersonaGuard route="my-card"><MyCardPage /></PersonaGuard>} />
          <Route path="requests" element={<PersonaGuard route="requests"><ChangeRequestsPage /></PersonaGuard>} />
          <Route path="requests/new" element={<PersonaGuard route="requests"><CreateChangeRequestPage /></PersonaGuard>} />
          <Route path="requests/:requestId" element={<PersonaGuard route="requests"><ChangeRequestDetailPage /></PersonaGuard>} />
          <Route path="contacts" element={<PersonaGuard route="contacts"><ContactsPage /></PersonaGuard>} />
          <Route path="analytics" element={<PersonaGuard route="analytics"><AnalyticsPage /></PersonaGuard>} />
          <Route path="broker/groups" element={<PersonaGuard route="broker-groups"><MyGroupsPage /></PersonaGuard>} />
          <Route path="messages" element={<PersonaGuard route="messages"><MessagesPage /></PersonaGuard>} />
          <Route path="messages/:messageId" element={<PersonaGuard route="messages"><MessageDetailPage /></PersonaGuard>} />
          <Route path="test" element={<TestPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
