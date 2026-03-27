import { createContext, useContext, useState } from 'react'

// ─── Persona definitions ──────────────────────────────────────────────────────
export const PERSONAS = {
  SPONSOR_ADMIN: {
    key:           'SPONSOR_ADMIN',
    label:         'Sponsor',
    description:   'Full access to all portal features',
    initials:      'SP',
    allowedRoutes: ['contracts', 'plans', 'members', 'analytics', 'contacts', 'claims'],
    defaultRoute:  '/portal/contracts',
  },
  MEMBER: {
    key:           'MEMBER',
    label:         'Member',
    description:   'Access to member profile, claims and contacts',
    initials:      'MB',
    allowedRoutes: ['members', 'claims', 'contacts'],
    defaultRoute:  '/portal/members',
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

  // Convenience: the sponsor ID to use in queries
  const sponsorId = personaKey === 'SPONSOR_ADMIN'
    ? (activeEntity?.id ?? 'a1000000-0000-0000-0000-000000000001')
    : 'a1000000-0000-0000-0000-000000000001'

  return (
    <PersonaContext.Provider value={{
      personaKey,
      persona: PERSONAS[personaKey],
      activeEntity,
      sponsorId,
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
