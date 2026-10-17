import { useState, type FormEvent } from 'react'
import { Sparkles } from 'lucide-react'
import type { UseAuth } from '@/hooks/useAuth'
import { AuthError, AuthShell, AuthSubmit, authInput, authLabel } from '@/components/AuthShell'

interface LoginProps {
  auth: UseAuth
  onSwitchToRegister: () => void
}

export function Login({ auth, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    void auth.login(email, password)
  }

  return (
    <AuthShell eyebrow="Money Flow · Magagnini Edition" title="Entrar" subtitle="Acesse suas contas e inteligência financeira.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {auth.error && <AuthError message={auth.error} />}

        <label className="flex flex-col gap-2">
          <span className={authLabel}>Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInput}
            placeholder="voce@email.com"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={authLabel}>Senha</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInput}
            placeholder="••••••••"
          />
        </label>

        <AuthSubmit disabled={auth.loading}>{auth.loading ? 'Entrando…' : 'Entrar'}</AuthSubmit>

        <div className="relative my-2 flex items-center justify-center">
          <div className="w-full border-t border-ink/15" />
          <span className="bg-paper px-3 font-mono text-xs uppercase tracking-wider text-ink/40">ou</span>
        </div>

        <button
          type="button"
          onClick={auth.loginAsDemo}
          className="flex items-center justify-center gap-2 border border-ink/20 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition-all duration-150 hover:border-black hover:bg-brand-soft"
        >
          <Sparkles className="size-4 text-black" />
          Testar no Modo Demonstração (Vercel)
        </button>

        <p className="text-sm text-ink/65">
          Não tem conta?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-semibold text-indigo underline-offset-4 hover:underline"
          >
            Criar conta
          </button>
        </p>
      </form>
    </AuthShell>
  )
}
