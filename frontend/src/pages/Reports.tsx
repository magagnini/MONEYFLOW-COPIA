import { useState } from 'react'
import {
  Download,
  FileSpreadsheet,
  FileText,
  TrendingDown,
  TrendingUp,
  Percent,
  CheckCircle,
  Scale,
} from 'lucide-react'
import { KpiStrip } from '@/components/KpiStrip'
import { PeriodPicker } from '@/components/PeriodPicker'
import { CurrencySelector } from '@/components/CurrencySelector'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useReports } from '@/hooks/useReports'
import { useTransactions } from '@/hooks/useTransactions'
import { currentMonthRange } from '@/lib/utils'
import type { DateRange } from '@/lib/types'

export function Reports() {
  const [draftRange, setDraftRange] = useState<DateRange>(currentMonthRange)
  const [appliedRange, setAppliedRange] = useState<DateRange>(draftRange)
  const { currency, format, accountsLoading, accountsError } = useCurrency()

  const ready = !accountsLoading && !accountsError
  const reports = useReports(appliedRange, { currency }, ready)
  const transactions = useTransactions(appliedRange, { currency }, ready)

  const income = reports.data?.totalIncome ?? 0
  const spent = reports.data?.totalSpent ?? 0
  const net = income - spent
  const savingsRate = income > 0 ? Math.max(0, ((income - spent) / income) * 100) : 0

  function exportCSV() {
    if (!transactions.data.length) return
    const headers = ['ID', 'Data', 'Descrição', 'Categoria', 'Tipo', 'Moeda', 'Valor']
    const rows = transactions.data.map((t) => [
      t.id,
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.categoryDescription.replace(/"/g, '""')}"`,
      t.operationType,
      t.currency,
      t.amount.toFixed(2),
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `moneyflow-relatorio-${appliedRange.startDate}-a-${appliedRange.endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function exportJSON() {
    if (!transactions.data.length) return
    const exportObject = {
      period: appliedRange,
      currency,
      summary: {
        totalIncome: income,
        totalSpent: spent,
        netResult: net,
        savingsRate: `${savingsRate.toFixed(1)}%`,
      },
      ranking: reports.data?.ranking ?? [],
      transactions: transactions.data,
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2))
    const link = document.createElement('a')
    link.setAttribute('href', dataStr)
    link.setAttribute('download', `moneyflow-analytics-${appliedRange.startDate}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="bg-page-grid flex-1 overflow-y-auto px-10 pt-9 pb-10">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          <span className="eyebrow">Inteligência Financeira</span>
          <h1 className="font-display text-5xl leading-[52px] font-normal tracking-[-0.02em] text-fg">
            Relatórios & Analytics
          </h1>
          <p className="text-[15px] text-fg-muted">
            Análise aprofundada de receitas, despesas, taxa de economia e exportação contábil.
          </p>
        </div>

        <div className="flex flex-wrap items-stretch gap-3">
          <PeriodPicker
            range={draftRange}
            onChange={setDraftRange}
            onSearch={() => setAppliedRange(draftRange)}
            onApply={(r) => {
              setDraftRange(r)
              setAppliedRange(r)
            }}
          />
          <CurrencySelector />
        </div>
      </header>

      {/* KPI Cards */}
      <div className="mb-7">
        <KpiStrip
          loading={reports.loading}
          items={[
            {
              label: 'Total Receitas',
              value: income,
              icon: TrendingUp,
              tone: 'data',
              currency,
            },
            {
              label: 'Total Despesas',
              value: spent,
              icon: TrendingDown,
              tone: 'negative',
              currency,
            },
            {
              label: 'Resultado Líquido',
              value: net,
              icon: Scale,
              tone: net >= 0 ? 'data' : 'negative',
              currency,
            },
            {
              label: 'Taxa de Poupança',
              value: Number(savingsRate.toFixed(1)),
              icon: Percent,
              tone: savingsRate >= 20 ? 'data' : 'neutral',
              formatted: `${savingsRate.toFixed(1)}%`,
            },
          ]}
        />
      </div>

      {/* Export & Ações Rápidas */}
      <section className="mb-7 flex flex-wrap items-center justify-between gap-4 border border-edge bg-surface p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center border border-brand/40 bg-brand/10">
            <CheckCircle className="size-5 text-brand" />
          </div>
          <div>
            <h3 className="font-display text-lg font-medium text-fg">Exportação Contábil</h3>
            <p className="text-xs text-fg-muted">
              Exporte seus dados filtrados para conciliação ou declaração de impostos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-2 border border-edge bg-surface-raised px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-fg transition hover:border-fg-subtle"
          >
            <FileSpreadsheet className="size-4 text-brand" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={exportJSON}
            className="flex items-center gap-2 border border-edge bg-surface-raised px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-fg transition hover:border-fg-subtle"
          >
            <Download className="size-4 text-data" />
            Exportar JSON
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 border border-edge bg-surface-raised px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-fg transition hover:border-fg-subtle"
          >
            <FileText className="size-4" />
            Imprimir Relatório
          </button>
        </div>
      </section>

      {/* Grid de Detalhes: Ranking de Categorias e Histórico Mensal */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Despesas por Categoria */}
        <section className="flex flex-col border border-edge bg-surface p-6">
          <div className="mb-6 flex flex-col gap-1">
            <span className="eyebrow">Categorias</span>
            <h3 className="font-display text-2xl font-normal tracking-[-0.02em] text-fg">
              Onde você mais gastou
            </h3>
          </div>

          {reports.loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse bg-surface-raised" />
              ))}
            </div>
          ) : (reports.data?.ranking.length ?? 0) === 0 ? (
            <p className="py-8 text-center text-sm text-fg-muted">
              Nenhuma despesa registrada para o período selecionado.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {reports.data?.ranking.map((item, index) => {
                const percent = spent > 0 ? (item.total / spent) * 100 : 0
                return (
                  <div key={item.categoryDescription} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium text-fg">
                        <span className="font-mono text-fg-subtle">#{index + 1}</span>
                        {item.categoryDescription}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-fg-subtle">{percent.toFixed(1)}%</span>
                        <span className="font-display font-medium text-fg">
                          {format(item.total, currency)}
                        </span>
                      </div>
                    </div>
                    {/* Barra de progresso */}
                    <div className="h-1.5 w-full bg-surface-raised">
                      <div
                        className="h-full bg-brand transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(2, percent))}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Evolução Mensal */}
        <section className="flex flex-col border border-edge bg-surface p-6">
          <div className="mb-6 flex flex-col gap-1">
            <span className="eyebrow">Comparativo Mensal</span>
            <h3 className="font-display text-2xl font-normal tracking-[-0.02em] text-fg">
              Receitas vs Despesas
            </h3>
          </div>

          {reports.loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse bg-surface-raised" />
              ))}
            </div>
          ) : (reports.data?.monthlyIncomeExpense.length ?? 0) === 0 ? (
            <p className="py-8 text-center text-sm text-fg-muted">
              Nenhum dado mensal consolidado disponível.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-white/5">
              {reports.data?.monthlyIncomeExpense.map((m) => {
                const monthNet = m.income - m.expense
                return (
                  <div key={m.month} className="flex items-center justify-between py-3.5">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-semibold text-fg">{m.month}</span>
                      <span className="font-mono text-[11px] text-fg-subtle">
                        {monthNet >= 0 ? '+ Superávit' : '− Déficit'}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 font-display text-sm">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-wider text-fg-subtle">Entradas</span>
                        <span className="text-data">{format(m.income, currency)}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-wider text-fg-subtle">Saídas</span>
                        <span className="text-negative">{format(m.expense, currency)}</span>
                      </div>
                      <div className="flex flex-col items-end min-w-[90px]">
                        <span className="text-[10px] uppercase tracking-wider text-fg-subtle">Líquido</span>
                        <span className={monthNet >= 0 ? 'text-fg font-medium' : 'text-negative font-medium'}>
                          {format(monthNet, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
