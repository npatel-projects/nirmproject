import { Navigate } from 'react-router-dom'
import { usePersona } from '../context/PersonaContext'

/**
 * Wraps a route and redirects to the persona's default route
 * if the current persona is not allowed to access it.
 *
 * Usage:
 *   <PersonaGuard route="contracts">
 *     <ContractsPage />
 *   </PersonaGuard>
 */
export default function PersonaGuard({ route, children }) {
  const { can, persona } = usePersona()

  if (!can(route)) {
    return <Navigate to={persona.defaultRoute} replace />
  }

  return children
}
