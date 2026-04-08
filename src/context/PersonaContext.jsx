import { createContext, useContext, useState } from 'react'

// ─── Persona definitions ──────────────────────────────────────────────────────
export const PERSONAS = {
  SPONSOR_ADMIN: {
    key:           'SPONSOR_ADMIN',
    label:         'Sponsor',
    description:   'Full access to all portal features',
    initials:      'SP',
    allowedRoutes: ['contracts', 'plans', 'members', 'member-profile', 'analytics', 'contacts', 'claims', 'requests', 'messages', 'enrollment', 'account'],
    defaultRoute:  '/portal/contracts',
  },
  BROKER: {
    key:           'BROKER',
    label:         'Broker',
    description:   'Manage your book of business',
    initials:      'BR',
    allowedRoutes: ['broker-groups'],
    defaultRoute:  '/portal/broker/groups',
  },
  MEMBER: {
    key:           'MEMBER',
    label:         'Member',
    description:   'Access to member profile, claims and contacts',
    initials:      'MB',
    allowedRoutes: ['member-profile', 'claims', 'contacts', 'my-card', 'my-benefits', 'requests', 'messages', 'notifications'],
    defaultRoute:  '/portal/claims',
  },
}

const PersonaContext = createContext(null)

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

export function PersonaProvider({ children }) {
  const [personaKey, setPersonaKey] = useState(
    () => localStorage.getItem('portal_persona') ?? 'SPONSOR_ADMIN'
  )
  // activeEntity shape:
  //   SPONSOR_ADMIN → { id: sponsor_id, label: sponsor_name }
  //   MEMBER        → { id: member_id,  label: 'First Last (MEM#)', employeeId }
  const [activeEntity, setActiveEntity] = useState(
    () => load('portal_entity', null)
  )

  function switchTo(key, entity) {
    localStorage.setItem('portal_persona', key)
    localStorage.setItem('portal_entity', JSON.stringify(entity ?? null))
    setPersonaKey(key)
    setActiveEntity(entity ?? null)
  }

  function can(route) {
    return PERSONAS[personaKey]?.allowedRoutes.includes(route) ?? false
  }

  const sponsorId = personaKey === 'SPONSOR_ADMIN'
    ? (activeEntity?.id ?? 'a1000000-0000-0000-0000-000000000001')
    : 'a1000000-0000-0000-0000-000000000001'

  const brokerId = personaKey === 'BROKER'
    ? (activeEntity?.id ?? 'b0000001-0000-0000-0000-000000000001')
    : null

  // For MEMBER persona: enrolled flag is set explicitly by PortalHeader when selecting an entity
  const isEnrolled = personaKey !== 'MEMBER' || activeEntity?.enrolled !== false

  return (
    <PersonaContext.Provider value={{
      personaKey,
      persona: PERSONAS[personaKey],
      activeEntity,
      sponsorId,
      brokerId,
      isEnrolled,
      switchTo,
      can,
    }}>
      {children}
    </PersonaContext.Provider>
  )
}

export function usePersona() {
  return useContext(PersonaContext)
}
