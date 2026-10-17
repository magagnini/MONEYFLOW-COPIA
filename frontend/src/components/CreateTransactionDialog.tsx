import { useState, type FormEvent } from 'react'
import { Plus, X, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { transactionsApi, categoriesApi } from '@/lib/api'
import { useCurrency } from '@/contexts/CurrencyContext'
import { parseAmountInput } from '@/lib/utils'
import type { Category, Currency } from '@/lib/types'
import { useEffect } from 'react'

interface CreateTransactionDialogProps {
  onClose: () => void
  onCreated: () => void
  defaultCurrency?: Currency
}

export function CreateTransactionDialog({
  onClose,
  onCreated,
  defaultCurrency = 'BRL',
}: CreateTransactionDialogProps) {
  const { accounts } = useCurrency()
  const [description, setDescription] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [operationType, setOperationType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1)
  const [selectedAccountId, setSelectedAccountId] = useState<number>(
    accounts[0]?.accountId ?? 1,
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    categoriesApi
      .list()
      .then((cats) => {
        setCategories(cats)
        const firstMatching = cats.find((c) => c.type === operationType)
        if (firstMatching) setSelectedCategoryId(firstMatching.categoryId)
      })
      .catch(() => {})
  }, [operationType])

  const filteredCategories = categories.filter((c) => c.type === operationType)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = parseAmountInput(amountStr)
    if (!parsed || parsed <= 0) {
      setError('Informe um valor válido em formato pt-BR (ex: 45,90 ou 1.250,00)')
      return
    }

    if (!description.trim()) {
      setError('A descrição não pode ficar vazia.')
      return
    }

    const selectedAccount = accounts.find((a) => a.accountId === selectedAccountId)
    const currency = selectedAccount?.currency ?? defaultCurrency

    setSubmitting(true)
    try {
      await transactionsApi.create({
        description: description.trim(),
        amount: parsed,
        date,
        categoryId: selectedCategoryId,
        operationType,
        currency,
        accountId: selectedAccountId,
      })
      onCreated()
      onClose()
    } catch {
      setError('Não foi possível registrar a transação.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg border border-edge bg-surface p-7 text-fg shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-fg-subtle transition hover:text-fg"
          aria-label="Fechar"
        >
          <X className="size-5" />
        </button>

        <div className="mb-6 flex flex-col gap-1">
          <span className="eyebrow">Novo Lançamento</span>
          <h2 className="font-display text-2xl font-normal tracking-[-0.02em]">
            Registrar Transação
          </h2>
          <p className="text-xs text-fg-muted">
            Adicione uma receita ou despesa diretamente no painel.
          </p>
        </div>

        {error && (
          <div className="mb-4 border border-negative/40 bg-negative/10 px-3.5 py-2.5 text-xs text-negative">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tipo de Operação */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOperationType('EXPENSE')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                operationType === 'EXPENSE'
                  ? 'border border-negative/50 bg-negative/15 text-negative'
                  : 'border border-edge bg-surface-raised text-fg-muted hover:text-fg'
              }`}
            >
              <ArrowDownRight className="size-4" />
              Gasto (Despesa)
            </button>
            <button
              type="button"
              onClick={() => setOperationType('INCOME')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                operationType === 'INCOME'
                  ? 'border border-data/50 bg-data/15 text-data'
                  : 'border border-edge bg-surface-raised text-fg-muted hover:text-fg'
              }`}
            >
              <ArrowUpRight className="size-4" />
              Entrada (Receita)
            </button>
          </div>

          {/* Descrição */}
          <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
            <span>Descrição</span>
            <input
              type="text"
              required
              placeholder="Ex: Supermercado, Salário, Freelance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-edge bg-surface-raised px-3.5 py-2.5 font-mono text-sm text-fg outline-none transition focus:border-brand"
            />
          </label>

          {/* Valor & Data */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
              <span>Valor (ex: 120,50)</span>
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
              <span>Data</span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-edge bg-surface-raised px-3.5 py-2.5 font-mono text-sm text-fg outline-none transition focus:border-brand"
              />
            </label>
          </div>

          {/* Categoria & Conta */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
              <span>Categoria</span>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                className="border border-edge bg-surface-raised px-3.5 py-2.5 font-mono text-xs text-fg outline-none transition focus:border-brand"
              >
                {filteredCategories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId} className="bg-surface text-fg">
                    {c.categoryDescription}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
              <span>Conta de Destino</span>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                className="border border-edge bg-surface-raised px-3.5 py-2.5 font-mono text-xs text-fg outline-none transition focus:border-brand"
              >
                {accounts.map((a) => (
                  <option key={a.accountId} value={a.accountId} className="bg-surface text-fg">
                    {a.description} ({a.currency})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Botões */}
          <div className="mt-4 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-edge px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-fg-muted transition hover:border-fg-subtle hover:text-fg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition hover:opacity-90 disabled:opacity-50"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              {submitting ? 'Salvando…' : 'Salvar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
