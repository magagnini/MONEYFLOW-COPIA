import { useState } from 'react'
import { Sparkles, RotateCcw } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Dashboard } from '@/pages/Dashboard'
import { Accounts } from '@/pages/Accounts'
import { Reports } from '@/pages/Reports'
import { Settings } from '@/pages/Settings'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { useAuth } from '@/hooks/useAuth'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { resetDemoData } from '@/lib/mockStore'
import type { View } from '@/lib/types'

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [authView, setAuthView] = useState<'login' | 'register'>('login')
  const auth = useAuth()

  function handleResetDemo() {
    if (confirm('Deseja restaurar os dados de demonstração originais?')) {
      resetDemoData()
      window.location.reload()
    }
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="flex h-screen bg-background text-fg">
        {authView === 'login' ? (
          <Login auth={auth} onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <Register auth={auth} onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    )
  }

  return (
    <CurrencyProvider>
      <div className="flex h-screen flex-col bg-background text-fg">
        {auth.isDemo && (
          <div className="flex items-center justify-between border-b border-brand/30 bg-brand/10 px-6 py-2 text-xs text-brand">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5" />
              <span className="font-semibold uppercase tracking-wider">
                Modo Demonstração (Vercel Preview)
              </span>
              <span className="hidden text-brand/80 sm:inline">
                — Todas as alterações (novas transações e edições) são salvas no seu navegador.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetDemo}
                className="flex items-center gap-1.5 underline-offset-4 hover:underline"
              >
                <RotateCcw className="size-3" />
                Resetar Dados
              </button>
              <button
                type="button"
                onClick={auth.logout}
                className="font-medium text-white/70 hover:text-white"
              >
                Sair do Demo
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <Sidebar active={view} onNavigate={setView} onLogout={auth.logout} />
          {view === 'dashboard' && <Dashboard />}
          {view === 'accounts' && <Accounts />}
          {view === 'reports' && <Reports />}
          {view === 'settings' && <Settings />}
        </div>
      </div>
    </CurrencyProvider>
  )
}
