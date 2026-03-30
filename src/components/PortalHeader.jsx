import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import AppsIcon from '@mui/icons-material/Apps'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CheckIcon from '@mui/icons-material/Check'
import { Badge, CircularProgress } from '@mui/material'
import { Avatar } from '@ark-ui/react/avatar'
import { colors } from '../theme'
import { usePersona, PERSONAS } from '../context/PersonaContext'
import { supabase } from '../lib/supabase'

export default function PortalHeader() {
  const navigate = useNavigate()
  const { personaKey, persona, activeEntity, switchTo } = usePersona()

  const [menuOpen, setMenuOpen] = useState(false)
  const [expandedPersona, setExpandedPersona] = useState(null)
  const [entities, setEntities] = useState([])
  const [entitiesLoading, setEntitiesLoading] = useState(false)
  const menuRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
        setExpandedPersona(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  async function handleExpandPersona(key) {
    if (expandedPersona === key) {
      setExpandedPersona(null)
      return
    }
    setExpandedPersona(key)
    setEntities([])
    setEntitiesLoading(true)

    if (key === 'SPONSOR_ADMIN') {
      const { data } = await supabase.from('sponsor').select('sponsor_id, sponsor_name')
      setEntities((data ?? []).map((s) => ({ id: s.sponsor_id, label: s.sponsor_name })))
    } else if (key === 'MEMBER') {
      const { data } = await supabase
        .from('employee')
        .select('employee_id, first_name, last_name, member(member_id, member_number, member_status)')
        .eq('employment_status', 'ACTIVE')
        .order('last_name')

      setEntities(
        (data ?? []).map((e) => {
          const activeMember = (e.member ?? []).find((m) => m.member_status === 'ACTIVE')
          return activeMember
            ? {
                id: activeMember.member_id,
                label: `${e.first_name} ${e.last_name} (${activeMember.member_number})`,
                employeeId: e.employee_id,
                enrolled: true,
              }
            : {
                id: e.employee_id,
                label: `${e.first_name} ${e.last_name}`,
                employeeId: e.employee_id,
                enrolled: false,
              }
        })
      )
    }

    setEntitiesLoading(false)
  }

  function handleSelectEntity(key, entity) {
    switchTo(key, entity)
    setMenuOpen(false)
    setExpandedPersona(null)
    if (key === 'MEMBER') {
      if (entity.enrolled === false) {
        navigate('/portal') // self-enrollment landing — TBD
      } else {
        navigate(`/portal/members/${entity.employeeId}`)
      }
    } else {
      navigate(PERSONAS[key].defaultRoute)
    }
  }

  return (
    <header
      className="flex items-center justify-between px-6 h-14 shrink-0"
      style={{ backgroundColor: colors.brandPrimary }}
    >
      {/* Left — logo + name */}
      <div className="flex items-center gap-2 text-white">
        <SecurityOutlinedIcon style={{ color: colors.brandAccent, fontSize: 28 }} />
        <span className="font-semibold text-base tracking-wide">ABC Insurance</span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-5 text-white">
        {/* Language */}
        <button className="flex items-center gap-0.5 text-sm font-medium hover:opacity-80 transition-opacity">
          English
          <KeyboardArrowDownIcon fontSize="small" />
        </button>

        {/* Notifications */}
        <button className="hover:opacity-80 transition-opacity">
          <Badge
            badgeContent={1}
            color="error"
            sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}
          >
            <MailOutlineIcon fontSize="small" />
          </Badge>
        </button>

        {/* Avatar + persona info */}
        <div className="flex items-center gap-2">
          <Avatar.Root className="cursor-pointer hover:opacity-80 transition-opacity">
            <Avatar.Fallback
              className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: colors.brandPrimaryDark }}
            >
              {persona.initials}
            </Avatar.Fallback>
          </Avatar.Root>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-xs font-semibold text-white">{persona.label}</span>
            {activeEntity && (
              <span className="text-xs text-white/70 truncate max-w-[140px]">{activeEntity.label}</span>
            )}
          </div>
        </div>

        {/* Apps grid */}
        <button className="hover:opacity-80 transition-opacity">
          <AppsIcon fontSize="small" />
        </button>

        {/* Settings — two-level persona + entity switcher */}
        <div className="relative" ref={menuRef}>
          <button
            className="hover:opacity-80 transition-opacity focus:outline-none"
            onClick={() => {
              setMenuOpen((o) => !o)
              setExpandedPersona(null)
            }}
          >
            <SettingsOutlinedIcon fontSize="small" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-72">
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Switch Persona</p>
              </div>

              {/* Persona rows */}
              {Object.values(PERSONAS).map((p) => {
                const isActive = p.key === personaKey
                const isExpanded = expandedPersona === p.key

                return (
                  <div key={p.key}>
                    <button
                      className={`flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        isExpanded ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => handleExpandPersona(p.key)}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          backgroundColor: isActive ? colors.brandPrimary : '#e5e7eb',
                          color: isActive ? '#fff' : '#374151',
                        }}
                      >
                        {p.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{p.label}</p>
                        <p className="text-xs text-gray-500 leading-snug">{p.description}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isActive && (
                          <CheckIcon fontSize="small" style={{ color: colors.brandPrimary }} />
                        )}
                        <ChevronRightIcon
                          fontSize="small"
                          className={`text-gray-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Entity sub-list */}
                    {isExpanded && (
                      <div className="bg-gray-50 border-t border-gray-100 max-h-48 overflow-y-auto">
                        {entitiesLoading ? (
                          <div className="flex justify-center py-4">
                            <CircularProgress size={18} />
                          </div>
                        ) : entities.length === 0 ? (
                          <p className="text-xs text-gray-400 px-6 py-3">No options available</p>
                        ) : (
                          entities.map((entity) => {
                            const isSelected = isActive && activeEntity?.id === entity.id
                            return (
                              <button
                                key={entity.id}
                                className={`flex items-center gap-2 w-full px-6 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                                  isSelected ? 'font-semibold' : ''
                                }`}
                                onClick={() => handleSelectEntity(p.key, entity)}
                              >
                                {isSelected ? (
                                  <CheckIcon style={{ color: colors.brandPrimary, fontSize: 14 }} />
                                ) : (
                                  <span className="inline-block w-3.5" />
                                )}
                                <span className="text-gray-800 truncate flex-1 min-w-0">{entity.label}</span>
                                {p.key === 'MEMBER' && entity.enrolled === false && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 shrink-0">
                                    Not Enrolled
                                  </span>
                                )}
                              </button>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Broker — coming soon */}
              <div className="border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-3 opacity-40 cursor-not-allowed">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-gray-200 text-gray-500">
                    BR
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Broker</p>
                    <p className="text-xs text-gray-500">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
