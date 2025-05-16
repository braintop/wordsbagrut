import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import Routing from './Routing/Routing'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { AuthProvider } from './context/AuthContext'
import { QuizProvider } from './context/QuizContext'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  direction: 'rtl', // Support for RTL (Hebrew)
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <QuizProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Routing />
          </ThemeProvider>
        </QuizProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
