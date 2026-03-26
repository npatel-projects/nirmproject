import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from './components/PortalLayout'
import ContractsPage from './pages/portal/ContractsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/portal/contracts" replace />} />
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<Navigate to="contracts" replace />} />
          <Route path="contracts" element={<ContractsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
