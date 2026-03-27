import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import AppsIcon from '@mui/icons-material/Apps'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Badge } from '@mui/material'
import { Avatar } from '@ark-ui/react/avatar'
import { colors } from '../theme'

export default function PortalHeader() {
  return (
    <header className="flex items-center justify-between px-6 h-14 shrink-0" style={{ backgroundColor: colors.brandPrimary }}>
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
          <Badge badgeContent={1} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
            <MailOutlineIcon fontSize="small" />
          </Badge>
        </button>

        {/* User avatar */}
        <Avatar.Root className="cursor-pointer hover:opacity-80 transition-opacity">
          <Avatar.Fallback className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: colors.brandPrimaryDark }}>
            NP
          </Avatar.Fallback>
        </Avatar.Root>

        {/* Apps grid */}
        <button className="hover:opacity-80 transition-opacity">
          <AppsIcon fontSize="small" />
        </button>

        {/* Settings */}
        <button className="hover:opacity-80 transition-opacity">
          <SettingsOutlinedIcon fontSize="small" />
        </button>
      </div>
    </header>
  )
}
