import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Send,
  ExternalLink,
  Clock,
  Check,
  Server,
  Sparkles,
  Save,
  RefreshCw,
} from 'lucide-react'
import { ownerApi, getApiBaseUrl, setApiBaseUrl } from '@/lib/api'
import { isDemoActive } from '@/lib/mockStore'

export function Settings() {
  // null = ainda carregando (ou falhou): nesse caso mostra o botão normal de vincular.
  const [telegramLinked, setTelegramLinked] = useState<boolean | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Configuração de API
  const [apiUrl, setApiUrl] = useState(() => getApiBaseUrl())
  const [apiSaveStatus, setApiSaveStatus] = useState<string | null>(null)
  const [testingApi, setTestingApi] = useState(false)
  const isDemo = isDemoActive()

  useEffect(() => {
    let active = true
    ownerApi
      .me()
      .then((profile) => {
        if (active) setTelegramLinked(profile.telegramLinked)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const { link } = await ownerApi.telegramInvite()
      setLink(link)
    } catch {
      setError('Não foi possível gerar o link. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleSaveApiUrl(e: React.FormEvent) {
    e.preventDefault()
    setApiBaseUrl(apiUrl)
    setApiSaveStatus('URL da API salva com sucesso!')
    setTimeout(() => setApiSaveStatus(null), 3000)
  }

  async function handleTestApiConnection() {
    setTestingApi(true)
    setApiSaveStatus(null)
    try {
      const res = await fetch(`${apiUrl}/categories`, { method: 'GET' })
      if (res.ok || res.status === 401) {
        setApiSaveStatus('Conexão com o backend realizada com sucesso!')
      } else {
        setApiSaveStatus(`Backend respondeu com status: ${res.status}`)
      }
    } catch {
      setApiSaveStatus('Erro ao conectar. Verifique se o backend está acessível e com CORS habilitado.')
    } finally {
      setTestingApi(false)
    }
  }

  return (
    <main className="bg-page-grid flex-1 overflow-y-auto px-10 pt-9 pb-10">
      <header className="mb-7 flex flex-col gap-2.5">
        <span className="eyebrow">Preferências</span>
        <h1 className="font-display text-5xl leading-[52px] font-normal tracking-[-0.02em] text-fg">
          Configurações
        </h1>
        <p className="text-[15px] text-fg-muted">
          Gerencie integrações com Telegram, conexões com o backend e implantação no Vercel.
        </p>
      </header>

      <div className="flex max-w-2xl flex-col gap-6">
        {/* Status de Execução */}
        <section className="flex flex-col gap-4 border border-edge bg-surface p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center border border-edge">
              <Sparkles className="size-5 text-brand" strokeWidth={1.8} />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-fg">
                Ambiente de Execução
              </h2>
              <p className="text-sm text-fg-muted">
                {isDemo
                  ? 'Você está operando no Modo Demonstração interativo (Vercel Ready).'
                  : 'Você está conectado a uma API externa ou local.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.04em] ${
                isDemo
                  ? 'border-brand/40 bg-brand/10 text-brand'
                  : 'border-data/40 bg-data/10 text-data'
              }`}
            >
              <Check className="size-3.5" strokeWidth={2.2} />
              {isDemo ? 'Modo Demonstração Interativo' : 'Modo Conectado ao Backend'}
            </span>
          </div>
        </section>

        {/* Telegram Bot */}
        <section className="flex flex-col gap-6 border border-edge bg-surface p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center border border-edge">
              <Send className="size-5 text-fg-muted" strokeWidth={1.8} />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-fg">Telegram</h2>
              <p className="text-sm text-fg-muted">
                {telegramLinked
                  ? 'Seu Telegram está vinculado. Registre transações por mensagem ou voz no bot.'
                  : 'Vincule o bot do Telegram para registrar transações por mensagem ou voz.'}
              </p>
            </div>
          </div>

          {telegramLinked && (
            <span className="flex w-fit items-center gap-2 border border-data/40 bg-data/10 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.04em] text-data">
              <Check className="size-3.5" strokeWidth={2.2} />
              Telegram vinculado
            </span>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className={
              telegramLinked
                ? 'flex w-fit items-center gap-2.5 border border-edge px-5 py-3 text-sm font-semibold uppercase tracking-[0.04em] text-fg-muted transition-colors duration-150 hover:border-fg-subtle hover:text-fg disabled:opacity-50'
                : 'flex w-fit items-center gap-2.5 bg-brand px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.04em] text-black transition-opacity duration-150 hover:opacity-90 disabled:opacity-50'
            }
          >
            {loading ? 'Gerando link…' : telegramLinked ? 'Vincular outro chat' : 'Vincular Telegram'}
            <ArrowRight className="size-4" strokeWidth={2.2} />
          </button>

          {error && (
            <div className="border border-negative/40 bg-negative/10 px-4 py-3 text-sm text-negative">
              {error}
            </div>
          )}

          {link && (
            <div className="flex flex-col gap-3 border border-edge bg-surface-raised px-5 py-4">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 break-all text-sm font-medium text-data hover:underline"
              >
                <ExternalLink className="size-4 shrink-0" strokeWidth={1.8} />
                {link}
              </a>
              <p className="flex items-center gap-2 font-mono text-xs text-fg-subtle">
                <Clock className="size-3.5 shrink-0" strokeWidth={1.8} />
                Você tem 15 minutos para abrir o link no Telegram antes que ele expire.
              </p>
            </div>
          )}
        </section>

        {/* Configuração da API Backend */}
        <section className="flex flex-col gap-5 border border-edge bg-surface p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center border border-edge">
              <Server className="size-5 text-fg-muted" strokeWidth={1.8} />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-fg">
                Conexão da API (Backend)
              </h2>
              <p className="text-sm text-fg-muted">
                Endereço da API REST (Spring Boot). Configure a URL caso tenha publicado seu backend.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveApiUrl} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 font-mono text-xs text-fg-muted">
              <span>Endpoint Base da API</span>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8080/api ou https://seu-backend.railway.app/api"
                className="border border-edge bg-surface-raised px-3.5 py-2.5 font-mono text-sm text-fg outline-none transition focus:border-brand"
              />
            </label>

            {apiSaveStatus && (
              <div className="border border-data/40 bg-data/10 px-3.5 py-2 text-xs text-data">
                {apiSaveStatus}
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="flex items-center gap-2 bg-brand px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition hover:opacity-90"
              >
                <Save className="size-3.5" />
                Salvar URL
              </button>
              <button
                type="button"
                onClick={handleTestApiConnection}
                disabled={testingApi}
                className="flex items-center gap-2 border border-edge bg-surface-raised px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-fg transition hover:border-fg-subtle"
              >
                <RefreshCw className={`size-3.5 ${testingApi ? 'animate-spin' : ''}`} />
                {testingApi ? 'Testando…' : 'Testar Conexão'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}
