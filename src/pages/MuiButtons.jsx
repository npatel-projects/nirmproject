import { useState } from 'react'
import {
  Alert, BottomNavigation, BottomNavigationAction, Breadcrumbs,
  Button, ButtonGroup, Checkbox, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Drawer, Fab, FormControlLabel,
  IconButton, LinearProgress, Link as MuiLink, Modal, Stack, Box,
  Switch, Tab, Tabs, Typography, Paper,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import AddIcon from '@mui/icons-material/Add'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import DownloadIcon from '@mui/icons-material/Download'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import NotificationsIcon from '@mui/icons-material/Notifications'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { Link } from 'react-router-dom'

function Card({ title, description, children }) {
  return (
    <Box sx={{ bgcolor: 'white', borderRadius: 2, p: { xs: 2, sm: 3, md: 4 }, boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.06)' }}>
      <Typography variant="subtitle1" fontWeight={700} mb={0.5}>{title}</Typography>
      {description && (
        <Typography variant="caption" color="text.secondary" display="block" mb={3}>
          {description}
        </Typography>
      )}
      {children}
    </Box>
  )
}

function Row({ label, children }) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'center' },
      gap: { xs: 1, sm: 3 },
      py: 1.5,
      borderBottom: '1px solid #f0f2f4',
      '&:last-child': { borderBottom: 0 },
    }}>
      <Typography variant="caption" fontWeight={600} sx={{
        textTransform: 'uppercase', letterSpacing: 1.5, color: '#b7bbc2',
        width: { sm: 96 }, flexShrink: 0,
      }}>
        {label}
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center">
        {children}
      </Stack>
    </Box>
  )
}

const dataGridRows = [
  { id: 1, name: 'Alice Johnson', role: 'Designer', status: 'Active', joined: '2022-03-01' },
  { id: 2, name: 'Bob Smith', role: 'Engineer', status: 'Active', joined: '2021-07-15' },
  { id: 3, name: 'Carol White', role: 'Manager', status: 'Inactive', joined: '2020-01-10' },
  { id: 4, name: 'David Lee', role: 'Engineer', status: 'Active', joined: '2023-06-20' },
  { id: 5, name: 'Eva Chen', role: 'Designer', status: 'Active', joined: '2022-11-05' },
]
const dataGridCols = [
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 120 },
  { field: 'role', headerName: 'Role', flex: 1, minWidth: 100 },
  { field: 'status', headerName: 'Status', flex: 1, minWidth: 90 },
  { field: 'joined', headerName: 'Joined', flex: 1, minWidth: 110 },
]

export default function MuiShowcase() {
  const [bottomNav, setBottomNav] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState(0)
  const [dateValue, setDateValue] = useState(null)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8' }}>

      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #f0f2f4', px: { xs: 2, sm: 4, md: 7 }, py: { xs: 2, sm: 3 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
          <Box>
            <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2' }} />
              <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1.5, color: '#9ca7b4' }}>
                Material UI
              </Typography>
            </Stack>
            <Typography variant="h5" fontWeight={700} color="#1b1c1e" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
              Component Showcase
            </Typography>
          </Box>
          <Stack direction="row" gap={1}>
            <Button component={Link} to="/" variant="outlined" size="small">
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>DIT Guide</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>DIT</Box>
            </Button>
            <Button component={Link} to="/ark" variant="outlined" size="small">
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Ark UI</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Ark</Box>
            </Button>
            <Button component={Link} to="/storage" variant="outlined" size="small">
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Storage</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>📁</Box>
            </Button>
            <Button component={Link} to="/members" variant="outlined" size="small">
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Members</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>👥</Box>
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Stack gap={3} sx={{ px: { xs: 2, sm: 4, md: 7 }, py: { xs: 3, sm: 5 } }}>

        {/* Buttons */}
        <Card title="Buttons" description="Variants, sizes, icons, groups and FAB.">
          <Row label="Contained">
            <Button variant="contained">Primary</Button>
            <Button variant="contained" color="secondary">Secondary</Button>
            <Button variant="contained" color="success">Success</Button>
            <Button variant="contained" color="error">Error</Button>
            <Button variant="contained" color="warning">Warning</Button>
          </Row>
          <Row label="Outlined">
            <Button variant="outlined">Primary</Button>
            <Button variant="outlined" color="secondary">Secondary</Button>
            <Button variant="outlined" color="error">Error</Button>
          </Row>
          <Row label="Text">
            <Button variant="text">Primary</Button>
            <Button variant="text" color="secondary">Secondary</Button>
            <Button variant="text" color="error">Delete</Button>
          </Row>
          <Row label="Sizes">
            <Button variant="contained" size="small">Small</Button>
            <Button variant="contained" size="medium">Medium</Button>
            <Button variant="contained" size="large">Large</Button>
          </Row>
          <Row label="Icons">
            <Button variant="contained" startIcon={<AddIcon />}>Add</Button>
            <Button variant="outlined" endIcon={<SendIcon />}>Send</Button>
            <IconButton color="primary"><EditIcon /></IconButton>
            <IconButton color="error"><DeleteIcon /></IconButton>
          </Row>
          <Row label="Group">
            <Stack gap={1.5} flexWrap="wrap" direction="row">
              <ButtonGroup variant="contained">
                <Button>One</Button><Button>Two</Button><Button>Three</Button>
              </ButtonGroup>
              <ButtonGroup variant="outlined">
                <Button>One</Button><Button>Two</Button><Button>Three</Button>
              </ButtonGroup>
            </Stack>
          </Row>
          <Row label="FAB">
            <Fab color="primary" size="small"><AddIcon /></Fab>
            <Fab color="primary"><AddIcon /></Fab>
            <Fab color="secondary" variant="extended"><SendIcon sx={{ mr: 1 }} />Send</Fab>
          </Row>
          <Row label="Disabled">
            <Button variant="contained" disabled>Disabled</Button>
            <Button variant="outlined" disabled>Disabled</Button>
            <Button variant="contained" loading>Loading</Button>
          </Row>
        </Card>

        {/* Banners / Alerts */}
        <Card title="Banners & Alerts" description="Inline feedback messages for various severities.">
          <Stack gap={1.5}>
            <Alert severity="info">This is an informational message.</Alert>
            <Alert severity="success">Your changes have been saved successfully.</Alert>
            <Alert severity="warning">Your session will expire in 5 minutes.</Alert>
            <Alert severity="error">Something went wrong. Please try again.</Alert>
            <Alert severity="info" variant="filled">Filled info alert.</Alert>
            <Alert severity="success" variant="filled">Filled success alert.</Alert>
            <Alert severity="warning" variant="outlined">Outlined warning alert.</Alert>
            <Alert severity="error" variant="outlined">Outlined error alert.</Alert>
          </Stack>
        </Card>

        {/* Breadcrumbs */}
        <Card title="Breadcrumbs" description="Navigation trail showing current location.">
          <Stack gap={2}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ flexWrap: 'wrap' }}>
              <MuiLink underline="hover" color="inherit" href="#">Home</MuiLink>
              <MuiLink underline="hover" color="inherit" href="#">Components</MuiLink>
              <Typography color="text.primary">Breadcrumbs</Typography>
            </Breadcrumbs>
            <Breadcrumbs separator="›" sx={{ flexWrap: 'wrap' }}>
              <MuiLink underline="hover" color="inherit" href="#">Dashboard</MuiLink>
              <MuiLink underline="hover" color="inherit" href="#">Settings</MuiLink>
              <MuiLink underline="hover" color="inherit" href="#">Profile</MuiLink>
              <Typography color="text.primary">Edit</Typography>
            </Breadcrumbs>
          </Stack>
        </Card>

        {/* Checkbox & Switch */}
        <Card title="Checkbox & Switch" description="Form selection controls.">
          <Row label="Checkbox">
            <FormControlLabel control={<Checkbox defaultChecked />} label="Checked" />
            <FormControlLabel control={<Checkbox />} label="Unchecked" />
            <FormControlLabel control={<Checkbox indeterminate />} label="Indeterminate" />
            <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
            <FormControlLabel control={<Checkbox color="secondary" defaultChecked />} label="Secondary" />
            <FormControlLabel control={<Checkbox color="success" defaultChecked />} label="Success" />
            <FormControlLabel control={<Checkbox color="error" defaultChecked />} label="Error" />
          </Row>
          <Row label="Switch">
            <FormControlLabel control={<Switch defaultChecked />} label="On" />
            <FormControlLabel control={<Switch />} label="Off" />
            <FormControlLabel control={<Switch disabled />} label="Disabled" />
            <FormControlLabel control={<Switch color="secondary" defaultChecked />} label="Secondary" />
            <FormControlLabel control={<Switch color="success" defaultChecked />} label="Success" />
            <FormControlLabel control={<Switch color="warning" defaultChecked />} label="Warning" />
          </Row>
        </Card>

        {/* Tabs */}
        <Card title="Tabs" description="Organise content into switchable panels.">
          <Stack gap={2}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
              <Tab label="Overview" />
              <Tab label="Activity" />
              <Tab label="Settings" />
              <Tab label="Disabled" disabled />
            </Tabs>
            <Box sx={{ p: 2, bgcolor: '#f4f6f8', borderRadius: 1 }}>
              {tab === 0 && <Typography variant="body2">Overview content goes here.</Typography>}
              {tab === 1 && <Typography variant="body2">Activity feed goes here.</Typography>}
              {tab === 2 && <Typography variant="body2">Settings panel goes here.</Typography>}
            </Box>
          </Stack>
        </Card>

        {/* Progress */}
        <Card title="Progress" description="Linear and circular progress indicators.">
          <Row label="Linear">
            <Box sx={{ width: '100%' }}>
              <Stack gap={1.5}>
                <LinearProgress />
                <LinearProgress color="secondary" />
                <LinearProgress color="success" />
                <LinearProgress color="error" />
                <LinearProgress variant="determinate" value={60} />
                <LinearProgress variant="buffer" value={60} valueBuffer={80} />
              </Stack>
            </Box>
          </Row>
          <Row label="Circular">
            <CircularProgress />
            <CircularProgress color="secondary" />
            <CircularProgress color="success" />
            <CircularProgress color="error" />
            <CircularProgress variant="determinate" value={75} />
            <CircularProgress size={28} />
            <CircularProgress size={56} />
          </Row>
        </Card>

        {/* Date Picker */}
        <Card title="Date Picker" description="MUI X date picker with calendar popover.">
          <Row label="Standard">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Pick a date"
                value={dateValue}
                onChange={setDateValue}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="Disabled"
                disabled
                slotProps={{ textField: { size: 'small' } }}
              />
            </LocalizationProvider>
          </Row>
        </Card>

        {/* Data Grid */}
        <Card title="Data Grid" description="MUI X data grid with sorting, selection and pagination.">
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Box sx={{ minWidth: 400, height: 320 }}>
              <DataGrid
                rows={dataGridRows}
                columns={dataGridCols}
                pageSize={5}
                checkboxSelection
                disableRowSelectionOnClick
              />
            </Box>
          </Box>
        </Card>

        {/* Dialog, Drawer, Modal */}
        <Card title="Dialog, Drawer & Modal" description="Overlay components — click the buttons to open each one.">
          <Row label="Dialog">
            <Button variant="contained" onClick={() => setDialogOpen(true)}>Open Dialog</Button>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to proceed? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={() => setDialogOpen(false)} autoFocus>Confirm</Button>
              </DialogActions>
            </Dialog>
          </Row>
          <Row label="Drawer">
            <Button variant="outlined" onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Box sx={{ width: { xs: '80vw', sm: 280 }, p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Drawer</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  This is a side drawer. It can contain navigation, filters, or detail views.
                </Typography>
                <Button variant="contained" fullWidth onClick={() => setDrawerOpen(false)}>Close</Button>
              </Box>
            </Drawer>
          </Row>
          <Row label="Modal">
            <Button variant="outlined" onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
              <Box sx={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'white', borderRadius: 2, p: { xs: 3, sm: 4 },
                width: { xs: 'calc(100vw - 32px)', sm: 400 },
                boxShadow: '0px 8px 32px rgba(0,0,0,0.12)',
              }}>
                <Typography variant="h6" fontWeight={700} mb={1}>Modal Title</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  This is a basic MUI Modal. Unlike Dialog, it gives you full layout control.
                </Typography>
                <Stack direction="row" gap={1.5} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button variant="contained" onClick={() => setModalOpen(false)}>Confirm</Button>
                </Stack>
              </Box>
            </Modal>
          </Row>
        </Card>

        {/* Bottom Navigation */}
        <Card title="Bottom Navigation" description="Mobile-style bottom tab bar.">
          <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }} elevation={3}>
            <BottomNavigation value={bottomNav} onChange={(_, v) => setBottomNav(v)}>
              <BottomNavigationAction label="Home" icon={<HomeIcon />} />
              <BottomNavigationAction label="Search" icon={<SearchIcon />} />
              <BottomNavigationAction label="Alerts" icon={<NotificationsIcon />} />
              <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
            </BottomNavigation>
          </Paper>
        </Card>

      </Stack>
    </Box>
  )
}
