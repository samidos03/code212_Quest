import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AuthProvider } from './lib/auth'
import { ThemeProvider } from './lib/theme'
import { WorkspaceProvider } from './lib/workspace'
import { TooltipProvider } from './components/ui/tooltip'
import { ToastProvider } from './components/ui/toast'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <ThemeProvider>
              <TooltipProvider delayDuration={200} skipDelayDuration={400}>
                <ToastProvider>
                  <MotionConfig reducedMotion="user">
                    <App />
                  </MotionConfig>
                </ToastProvider>
              </TooltipProvider>
            </ThemeProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
