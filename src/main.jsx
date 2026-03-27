import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import { muiTheme } from './muiTheme'
import { PersonaProvider } from './context/PersonaContext'
import './style.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={muiTheme}>
      <PersonaProvider>
        <App />
      </PersonaProvider>
    </ThemeProvider>
  </StrictMode>
)
