import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from './components/PortalLayout'
import ContractsPage from './pages/portal/ContractsPage'
import ContractDetailPage from './pages/portal/ContractDetailPage'
import PlansPage from './pages/portal/PlansPage'
import PlanDetailPage from './pages/portal/PlanDetailPage'
import MembersPage from './pages/portal/MembersPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/portal/contracts" replace />} />
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<Navigate to="contracts" replace />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="contracts/:contractId" element={<ContractDetailPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="plans/:planId" element={<PlanDetailPage />} />
          <Route path="members" element={<MembersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
