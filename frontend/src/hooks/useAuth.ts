import { useCallback, useEffect, useState } from 'react'
import { authApi, UNAUTHORIZED_EVENT } from '@/lib/api'
import { clearToken, getToken, setToken } from '@/lib/auth'
import { isDemoActive, setDemoActive } from '@/lib/mockStore'

interface AuthState {
  isAuthenticated: boolean
  isDemo: boolean
  loading: boolean
  error: string | null
}

export interface UseAuth extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginAsDemo: () => void
  logout: () => void
}

export function useAuth(): UseAuth {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: Boolean(getToken()),
    isDemo: isDemoActive(),
    loading: false,
    error: null,
  })

  useEffect(() => {
    function handleUnauthorized() {
      setDemoActive(false)
      setState({ isAuthenticated: false, isDemo: false, loading: false, error: null })
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      setDemoActive(false)
      const { token } = await authApi.login(email, password)
      setToken(token)
      setState({ isAuthenticated: true, isDemo: false, loading: false, error: null })
    } catch {
      // Mensagem clara permitindo tentar o modo demo
      setState({
        isAuthenticated: false,
        isDemo: false,
        loading: false,
        error: 'Falha ao autenticar. Se não houver backend ativo na porta 8080, use o Modo Demonstração abaixo.',
      })
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      setDemoActive(false)
      const { token } = await authApi.register(name, email, password)
      setToken(token)
      setState({ isAuthenticated: true, isDemo: false, loading: false, error: null })
    } catch {
      setState({
        isAuthenticated: false,
        isDemo: false,
        loading: false,
        error: 'Não foi possível conectar ao backend para criar a conta. Experimente o Modo Demonstração.',
      })
    }
  }, [])

  const loginAsDemo = useCallback(() => {
    setDemoActive(true)
    setState({ isAuthenticated: true, isDemo: true, loading: false, error: null })
  }, [])

  const logout = useCallback(() => {
    setDemoActive(false)
    clearToken()
    setState({ isAuthenticated: false, isDemo: false, loading: false, error: null })
  }, [])

  return { ...state, login, register, loginAsDemo, logout }
}
