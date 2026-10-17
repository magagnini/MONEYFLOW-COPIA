import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Eye, Trash2, X } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'
import { categoriesApi, transactionsApi } from '@/lib/api'
import type { Category, Transaction } from '@/lib/types'
import { CURRENCIES, cn, formatAmountInput, parseAmountInput } from '@/lib/utils'

interface EditTransactionDialogProps {
  transaction: Transaction
  onClose: () => void
  /** Chamado depois que o backend confirmou a edição (saldo já ajustado). */
  onSaved: () => void
}

const fieldClass =
  'w-full border border-edge bg-surface-raised px-3.5 py-3 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-fg-subtle focus:border-brand/60'

export function EditTransactionDialog({ transaction, onClose, onSaved }: EditTransactionDialogProps) {
  const [description, setDescription] = useState(transaction.description)
  const [amount, setAmount] = useState(formatAmountInput(transaction.amount))
  const [categoryId, setCategoryId] = useState<number>(transaction.categoryId)
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const descriptionRef = useRef<HTMLInputElement>(null)
  // Com "ocultar valores" ligado, o valor fica mascarado até a pessoa pedir pra ver.
  const { valuesVisible } = useCurrency()
  const [revealed, setRevealed] = useState(false)
  const amountHidden = !valuesVisible && !revealed

  // Enquanto salva, o diálogo não fecha: o PUT já foi e o resultado precisa chegar.
  const savingRef = useRef(false)
  const onCloseRef = useRef(onClose)
  const onSavedRef = useRef(onSaved)
  useEffect(() => {
    onCloseRef.current = onClose
    onSavedRef.current = onSaved
  })
  const requestClose = () => {
    if (!savingRef.current) onCloseRef.current()
  }

  const isIncome = transaction.operationType === 'INCOME'
  const symbol = CURRENCIES.find((c) => c.code === transaction.currency)?.symbol ?? transaction.currency

  // Só categorias do mesmo tipo: gasto não vira entrada pela edição.
  const options = useMemo(
    () => (categories ?? []).filter((c) => c.type === (isIncome ? 'INCOME' : 'EXPENSE')),
    [categories, isIncome],
  )

  useEffect(() => {
    let active = true
    categoriesApi
      .list()
      .then((list) => {
        if (active) setCategories(list)
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar as categorias.')
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    descriptionRef.current?.focus()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = parseAmountInput(amount)
    if (parsed == null || parsed <= 0) {
      setError('Valor inválido. Use notação brasileira (ex: 25,90 ou 1.000,50) maior que zero.')
      return
    }

    const trimmed = description.trim()
    if (trimmed.length === 0) {
      setError('A descrição não pode ficar vazia.')
      return
    }

    savingRef.current = true
    setSaving(true)
    try {
      await transactionsApi.update(transaction.id, {
        description: trimmed,
        amount: parsed,
        categoryId,
      })
      onSavedRef.current()
    } catch {
      setError('Não foi possível salvar a transação. Tente novamente.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Deseja realmente excluir esta transação? O saldo da conta será revertido.')) return

    savingRef.current = true
    setSaving(true)
    try {
      await transactionsApi.delete(transaction.id)
      onSavedRef.current()
    } catch {
      setError('Não foi possível excluir a transação.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-tx-title"
      onClick={requestClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col gap-5 border border-edge bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-edge pb-4">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'label-mono px-2 py-0.5 text-[11px] font-semibold tracking-wider',
                isIncome ? 'bg-data/15 text-data' : 'bg-negative/15 text-negative',
              )}
            >
              {isIncome ? 'Entrada' : 'Gasto'}
            </span>
            <span className="font-mono text-xs text-fg-subtle">{transaction.date}</span>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            className="flex size-7 items-center justify-center text-fg-muted transition-colors duration-150 hover:text-fg disabled:opacity-50"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="size-4" strokeWidth={1.8} />
          </button>
        </div>

        <h2 id="edit-tx-title" className="font-display text-2xl font-normal tracking-[-0.02em] text-fg">
          Editar transação
        </h2>

        <label className="flex flex-col gap-2">
          <span className="label-mono text-[11px] text-fg-muted">Descrição</span>
          <input
            ref={descriptionRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            type="text"
            required
            autoComplete="off"
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="label-mono text-[11px] text-fg-muted">Categoria</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            disabled={categories == null}
            className={cn(fieldClass, 'cursor-pointer')}
          >
            {categories == null && <option value={categoryId}>{transaction.categoryDescription}</option>}
            {options.map((c) => (
              <option key={c.categoryId} value={c.categoryId} className="bg-surface text-fg">
                {c.categoryDescription}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="label-mono text-[11px] text-fg-muted">Valor</span>
          <div className="flex items-stretch border border-edge bg-surface-raised focus-within:border-brand/60">
            <span className="flex items-center border-r border-edge px-3.5 font-mono text-sm text-fg-muted">
              {symbol}
            </span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type={amountHidden ? 'password' : 'text'}
              inputMode="decimal"
              autoComplete="off"
              className="w-full bg-transparent px-3.5 py-3 font-display text-sm tabular-nums text-fg outline-none"
            />
            {amountHidden && (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="flex items-center border-l border-edge px-3.5 text-fg-muted transition-colors duration-150 hover:text-fg"
                title="Mostrar valor"
                aria-label="Mostrar valor"
              >
                <Eye className="size-4" strokeWidth={1.8} />
              </button>
            )}
          </div>
          <span className="font-mono text-[11px] text-fg-subtle">
            O saldo da conta é ajustado pela diferença.
          </span>
        </label>

        {error && (
          <div className="border border-negative/40 bg-negative/10 px-4 py-3 text-sm text-negative">{error}</div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="flex items-center gap-1.5 border border-negative/30 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.04em] text-negative transition-colors hover:bg-negative/10 disabled:opacity-50"
          >
            <Trash2 className="size-3.5" />
            Excluir
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={requestClose}
              disabled={saving}
              className="border border-edge px-5 py-3 text-sm font-semibold uppercase tracking-[0.04em] text-fg-muted transition-colors duration-150 hover:border-fg-subtle hover:text-fg disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || categories == null}
              className="bg-brand px-5 py-3 text-sm font-semibold uppercase tracking-[0.04em] text-black transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
