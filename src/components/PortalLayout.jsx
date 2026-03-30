import { Accordion } from '@ark-ui/react/accordion'
import { NavLink, Outlet } from 'react-router-dom'
import PortalHeader from './PortalHeader'
import PortalFooter from './PortalFooter'
import { usePersona } from '../context/PersonaContext'

import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined'
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer transition-colors ${
    isActive
      ? 'bg-nav-active-bg text-nav-active-text font-medium'
      : 'text-nav-text hover:bg-nav-hover-bg'
  }`

export default function PortalLayout() {
  const { can, activeEntity } = usePersona()
  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <PortalHeader />

      <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-14 md:w-64 bg-white border-r border-gray-200 flex flex-col py-4 shrink-0 transition-all duration-200">

        <nav className="flex-1 px-2 space-y-1">
          {/* Group Policy Contracts — Sponsor only */}
          {can('contracts') && (
            <Accordion.Root defaultValue={['group-policy']} collapsible>
              <Accordion.Item value="group-policy">
                <Accordion.ItemTrigger className="flex items-center justify-between w-full px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-left">
                  <span className="flex items-center gap-2">
                    <PolicyOutlinedIcon fontSize="small" className="text-gray-500 shrink-0" />
                    <span className="hidden md:inline">Group Policy Contracts</span>
                  </span>
                  <Accordion.ItemIndicator className="hidden md:flex">
                    <ChevronRightIcon
                      fontSize="small"
                      className="text-gray-400 transition-transform duration-200 [[data-state=open]_&]:rotate-90"
                    />
                  </Accordion.ItemIndicator>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent className="pl-4 mt-1 space-y-1 hidden md:block">
                  <NavLink to="/portal/contracts" className={navLinkClass}>
                    <ArticleOutlinedIcon fontSize="small" className="shrink-0" />
                    <span className="hidden md:inline">Contracts</span>
                  </NavLink>
                  <NavLink to="/portal/plans" className={navLinkClass}>
                    <ListAltOutlinedIcon fontSize="small" className="shrink-0" />
                    <span className="hidden md:inline">Plans</span>
                  </NavLink>
                </Accordion.ItemContent>
              </Accordion.Item>
            </Accordion.Root>
          )}

          {can('my-benefits') && (
            <NavLink
              to={activeEntity?.employeeId ? `/portal/members/${activeEntity.employeeId}` : '/portal/claims'}
              className={navLinkClass}
            >
              <AccountCircleOutlinedIcon fontSize="small" className="shrink-0" />
              <span className="hidden md:inline">My Benefits</span>
            </NavLink>
          )}
          {can('members') && (
            <NavLink to="/portal/members" className={navLinkClass}>
              <PeopleAltOutlinedIcon fontSize="small" className="shrink-0" />
              <span className="hidden md:inline">Members</span>
            </NavLink>
          )}
          {can('claims') && (
            <NavLink to="/portal/claims" className={navLinkClass}>
              <LocalHospitalOutlinedIcon fontSize="small" className="shrink-0" />
              <span className="hidden md:inline">Claims</span>
            </NavLink>
          )}
          {can('analytics') && (
            <NavLink to="/portal/analytics" className={navLinkClass}>
              <BarChartOutlinedIcon fontSize="small" className="shrink-0" />
              <span className="hidden md:inline">Analytics</span>
            </NavLink>
          )}
          {can('requests') && (
            <NavLink to="/portal/requests" className={navLinkClass}>
              <AssignmentOutlinedIcon fontSize="small" className="shrink-0" />
              <span className="hidden md:inline">Change Requests</span>
            </NavLink>
          )}
          {can('my-card') && (
            <NavLink to="/portal/my-card" className={navLinkClass}>
              <CreditCardOutlinedIcon fontSize="small" className="shrink-0" />
              <span className="hidden md:inline">My Card</span>
            </NavLink>
          )}
          {can('contacts') && (
            <NavLink to="/portal/contacts" className={navLinkClass}>
              <ContactPhoneOutlinedIcon fontSize="small" className="shrink-0" />
              <span className="hidden md:inline">Contacts</span>
            </NavLink>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-full flex flex-col p-4 md:p-6 lg:p-10">
          <div className="flex-1">
            <Outlet />
          </div>
          <PortalFooter />
        </div>
      </main>
      </div>
    </div>
  )
}
