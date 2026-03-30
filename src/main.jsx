import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import { muiTheme } from './muiTheme'
import { AuthProvider } from './context/AuthContext'
import { PersonaProvider } from './context/PersonaContext'
import './style.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={muiTheme}>
      <AuthProvider>
        <PersonaProvider>
          <App />
        </PersonaProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)
