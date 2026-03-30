import { createTheme } from '@mui/material/styles'
import { colors } from './theme'

export const muiTheme = createTheme({
  palette: {
    primary: {
      main:  colors.brandPrimary,
      dark:  colors.brandPrimaryDark,
      contrastText: '#ffffff',
    },
    error: {
      main: colors.error,
    },
  },
  typography: {
    fontFamily: 'Open Sans, sans-serif',
    button: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: 'medium',
      },
      styleOverrides: {
        containedPrimary: {
          borderRadius: '9999px',
          textTransform: 'uppercase',
          '&:hover': { backgroundColor: colors.brandPrimaryDark },
        },
        outlinedPrimary: {
          borderRadius: '9999px',
          textTransform: 'uppercase',
        },
        textPrimary: {
          borderRadius: '4px',
          textTransform: 'none',
        },
      },
    },
  },
})
