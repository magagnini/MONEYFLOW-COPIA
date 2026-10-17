import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Wallet, Plus, X } from 'lucide-react'
import { KpiStrip, type KpiItem } from '@/components/KpiStrip'
import { useCurrency } from '@/contexts/CurrencyContext'
import { accountsApi } from '@/lib/api'
import { cn, parseAmountInput, type Currency } from '@/lib/utils'

export function Accounts() {
  const {
    accounts: data,
    accountsLoading: loading,
    accountsError: error,
    refreshAccounts,
    currencies,
    format,
  } = useCurrency()
  useEffect(() => refreshAccounts(), [refreshAccounts])

  const [isCreating, setIsCreating] = useState(false)
  const [description, setDescription] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [currency, setCurrency] = useState<Currency>('BRL')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleCreateAccount(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const parsed = parseAmountInput(amountStr || '0')
    if (parsed === null) {
      setFormError('Informe um saldo inicial válido (ex: 1.000,00 ou 0)')
      return
    }
    if (!description.trim()) {
      setFormError('Informe o nome da conta.')
      return
    }

    setSubmitting(true)
    try {
      await accountsApi.create(description.trim(), parsed, currency)
      setDescription('')
      setAmountStr('')
      setIsCreating(false)
      refreshAccounts()
    } catch {
      setFormError('Não foi possível criar a conta.')
    } finally {
      setSubmitting(false)
    }
  }

  // Sem câmbio: um total por moeda, nunca somando moedas diferentes.
  const totals = useMemo(() => {
    const map = new Map<Currency, number>()
    for (const a of data) map.set(a.currency, (map.get(a.currency) ?? 0) + a.amount)
    return map
  }, [data])
  const multiCurrency = currencies.length > 1
  const totalItems: KpiItem[] = (currencies.length > 0 ? currencies : (['BRL'] as Currency[])).map(
    (c) => {
      const value = totals.get(c) ?? 0
      return {
        label: multiCurrency ? `Saldo total · ${c}` : 'Saldo total',
        value,
        currency: c,
        icon: Wallet,
        tone: value < 0 ? 'negative' : 'neutral',
      }
    },
  )

  return (
    <main className="bg-page-grid flex-1 overflow-y-auto px-10 pt-9 pb-10">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          <span className="eyebrow">Carteira</span>
          <h1 className="font-display text-5xl leading-[52px] font-normal tracking-[-0.02em] text-fg">
            Contas
          </h1>
          <p className="text-[15px] text-fg-muted">
            {multiCurrency
              ? 'Saldo por moeda — cada conta na sua própria moeda, sem conversão.'
              : 'Saldo consolidado de todas as suas contas.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-brand px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition hover:opacity-90"
        >
          <Plus className="size-4" strokeWidth={2.4} />
          Nova Conta
        </button>
      </header>

      {error && (
        <div className="mb-6 border border-negative/40 bg-negative/10 px-4 py-3 text-sm text-negative">
          Não foi possível carregar as contas: {error}
        </div>
      )}

      <div className={cn('mb-7', totalItems.length > 1 ? 'max-w-5xl' : 'max-w-xl')}>
        <KpiStrip loading={loading} items={totalItems} />
      </div>

      <section className="flex flex-col border border-edge bg-surface">
        <div className="flex items-end justify-between gap-4 px-6 pt-6 pb-4">
          <div className="flex flex-col gap-1.5">
            <span className="eyebrow">Suas contas</span>
            <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-fg">
              Onde está o dinheiro
            </h2>
          </div>
          {!loading && data.length > 0 && (
            <span className="font-mono text-[11px] text-fg-subtle">
              {data.length} {data.length === 1 ? 'conta' : 'contas'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-px px-6 pb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-surface-raised" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <p className="text-sm text-fg-muted">Nenhuma conta cadastrada ainda.</p>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black"
            >
              <Plus className="size-3.5" />
              Criar Primeira Conta
            </button>
          </div>
        ) : (
          <ul className="flex flex-col border-t border-white/8">
            {data.map((account) => {
              // Participação dentro da própria moeda da conta.
              const total = totals.get(account.currency) ?? 0
              const share = total > 0 ? (account.amount / total) * 100 : 0
              return (
                <li
                  key={account.accountId}
                  className="flex h-16 items-center gap-4 border-b border-white/8 px-6 transition-colors duration-150 last:border-b-0 hover:bg-white/[0.03]"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center border border-edge">
                    <Wallet className="size-4 text-fg-muted" strokeWidth={1.8} />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold text-fg">{account.description}</span>
                    <span className="font-mono text-[11px] text-fg-subtle">
                      •••• {1000 + (account.accountId % 9000)} · {account.currency}
                    </span>
                  </div>
                  <span className="hidden w-16 shrink-0 text-right font-mono text-xs text-fg-subtle sm:block">
                    {share.toFixed(0)}%
                  </span>
                  <span
                    className={cn(
                      'w-36 shrink-0 text-right font-display text-[15px] font-medium tabular-nums',
                      account.amount < 0 ? 'text-negative' : 'text-fg',
                    )}
                  >
                    {format(account.amount, account.currency)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Modal Nova Conta */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md border border-edge bg-surface p-7 text-fg shadow-2xl">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="absolute top-5 right-5 text-fg-subtle transition hover:text-fg"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>

            <div className="mb-6 flex flex-col gap-1">
              <span className="eyebrow">Adicionar Conta</span>
              <h2 className="font-display text-2xl font-normal tracking-[-0.02em]">Nova Conta Bancária</h2>
            </div>

            {formError && (
              <div className="mb-4 border border-negative/40 bg-negative/10 px-3.5 py-2.5 text-xs text-negative">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
                <span>Nome da Conta</span>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nubank, Itaú, Carteira, C6..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border border-edge bg-surface-raised px-3.5 py-2.5 font-mono text-sm text-fg outline-none transition focus:border-brand"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
                  <span>Saldo Inicial (ex: 1.500,00)</span>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="border border-edge bg-surface-raised px-3.5 py-2.5 font-mono text-sm text-fg outline-none transition focus:border-brand"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
                  <span>Moeda</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="border border-edge bg-surface-raised px-3.5 py-2.5 font-mono text-xs text-fg outline-none transition focus:border-brand"
                  >
                    <option value="BRL">BRL (R$)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </label>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="border border-edge px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-fg-muted transition hover:border-fg-subtle hover:text-fg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition hover:opacity-90 disabled:opacity-50"
                >
                  <Plus className="size-4" />
                  {submitting ? 'Criando…' : 'Criar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
