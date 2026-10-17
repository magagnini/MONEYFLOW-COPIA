import type {
  Account,
  AmountAndCategory,
  Category,
  Currency,
  DateRange,
  MonthlyIncomeExpense,
  OwnerProfile,
  TimeSeriesPoint,
  TotalAmount,
  Transaction,
  TransactionUpdate,
} from './types'

const DEMO_MODE_KEY = 'money-flow:is-demo'
const DEMO_DATA_KEY = 'money-flow:demo-dataset'

export function isDemoActive(): boolean {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true'
}

export function setDemoActive(active: boolean): void {
  if (active) {
    localStorage.setItem(DEMO_MODE_KEY, 'true')
    localStorage.setItem('money-flow:token', 'demo-token-magagnini')
    if (!localStorage.getItem(DEMO_DATA_KEY)) {
      resetDemoData()
    }
  } else {
    localStorage.removeItem(DEMO_MODE_KEY)
    localStorage.removeItem('money-flow:token')
  }
}

interface DemoDataStore {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  profile: OwnerProfile
}

const DEFAULT_CATEGORIES: Category[] = [
  { categoryId: 1, categoryDescription: 'Mercado', type: 'EXPENSE' },
  { categoryId: 2, categoryDescription: 'Restaurantes', type: 'EXPENSE' },
  { categoryId: 3, categoryDescription: 'Moradia & Contas', type: 'EXPENSE' },
  { categoryId: 4, categoryDescription: 'Transporte', type: 'EXPENSE' },
  { categoryId: 5, categoryDescription: 'Lazer & Assinaturas', type: 'EXPENSE' },
  { categoryId: 6, categoryDescription: 'Saúde & Farmácia', type: 'EXPENSE' },
  { categoryId: 7, categoryDescription: 'Tecnologia & Ferramentas', type: 'EXPENSE' },
  { categoryId: 8, categoryDescription: 'Salário & Pro-labore', type: 'INCOME' },
  { categoryId: 9, categoryDescription: 'Freelance & Consultoria', type: 'INCOME' },
  { categoryId: 10, categoryDescription: 'Investimentos & Dividendos', type: 'INCOME' },
]

const DEFAULT_ACCOUNTS: Account[] = [
  { accountId: 1, description: 'Nubank Principal', amount: 14850.5, currency: 'BRL' },
  { accountId: 2, description: 'Itaú Investimentos', amount: 32400.0, currency: 'BRL' },
  { accountId: 3, description: 'Wise Multimoeda', amount: 2850.0, currency: 'EUR' },
  { accountId: 4, description: 'Nomad Global', amount: 1950.0, currency: 'USD' },
]

function generateInitialTransactions(): Transaction[] {
  const today = new Date()
  const y = today.getFullYear()
  const m = today.getMonth()

  const formatD = (day: number) => {
    const d = new Date(y, m, day)
    return d.toISOString().slice(0, 10)
  }

  return [
    {
      id: 1,
      description: 'Salário Mensal',
      amount: 12500.0,
      date: formatD(5),
      categoryDescription: 'Salário & Pro-labore',
      operationType: 'INCOME',
      currency: 'BRL',
      categoryId: 8,
    },
    {
      id: 2,
      description: 'Consultoria Web Fullstack',
      amount: 4200.0,
      date: formatD(12),
      categoryDescription: 'Freelance & Consultoria',
      operationType: 'INCOME',
      currency: 'BRL',
      categoryId: 9,
    },
    {
      id: 3,
      description: 'Supermercado Pão de Açúcar',
      amount: 684.5,
      date: formatD(today.getDate() > 2 ? today.getDate() - 1 : 2),
      categoryDescription: 'Mercado',
      operationType: 'EXPENSE',
      currency: 'BRL',
      categoryId: 1,
    },
    {
      id: 4,
      description: 'Aluguel & Condomínio',
      amount: 2800.0,
      date: formatD(10),
      categoryDescription: 'Moradia & Contas',
      operationType: 'EXPENSE',
      currency: 'BRL',
      categoryId: 3,
    },
    {
      id: 5,
      description: 'Jantar Italiano',
      amount: 245.9,
      date: formatD(today.getDate() > 4 ? today.getDate() - 3 : 4),
      categoryDescription: 'Restaurantes',
      operationType: 'EXPENSE',
      currency: 'BRL',
      categoryId: 2,
    },
    {
      id: 6,
      description: 'Assinatura OpenAI & Claude',
      amount: 220.0,
      date: formatD(8),
      categoryDescription: 'Tecnologia & Ferramentas',
      operationType: 'EXPENSE',
      currency: 'BRL',
      categoryId: 7,
    },
    {
      id: 7,
      description: 'Combustível Posto Ipiranga',
      amount: 180.0,
      date: formatD(14),
      categoryDescription: 'Transporte',
      operationType: 'EXPENSE',
      currency: 'BRL',
      categoryId: 4,
    },
    {
      id: 8,
      description: 'Farmácia & Vitaminas',
      amount: 145.2,
      date: formatD(15),
      categoryDescription: 'Saúde & Farmácia',
      operationType: 'EXPENSE',
      currency: 'BRL',
      categoryId: 6,
    },
    {
      id: 9,
      description: 'Netflix & Spotify',
      amount: 89.9,
      date: formatD(16),
      categoryDescription: 'Lazer & Assinaturas',
      operationType: 'EXPENSE',
      currency: 'BRL',
      categoryId: 5,
    },
    {
      id: 10,
      description: 'Dividendos FIIs',
      amount: 620.0,
      date: formatD(15),
      categoryDescription: 'Investimentos & Dividendos',
      operationType: 'INCOME',
      currency: 'BRL',
      categoryId: 10,
    },
    // Transações EUR
    {
      id: 11,
      description: 'Projeto Europa Frontend',
      amount: 1800.0,
      date: formatD(8),
      categoryDescription: 'Freelance & Consultoria',
      operationType: 'INCOME',
      currency: 'EUR',
      categoryId: 9,
    },
    {
      id: 12,
      description: 'Hetzner Cloud & Vercel Pro',
      amount: 75.0,
      date: formatD(11),
      categoryDescription: 'Tecnologia & Ferramentas',
      operationType: 'EXPENSE',
      currency: 'EUR',
      categoryId: 7,
    },
    // Transações USD
    {
      id: 13,
      description: 'Github Copilot & Tools',
      amount: 40.0,
      date: formatD(9),
      categoryDescription: 'Tecnologia & Ferramentas',
      operationType: 'EXPENSE',
      currency: 'USD',
      categoryId: 7,
    },
  ]
}

export function resetDemoData(): void {
  const initial: DemoDataStore = {
    accounts: DEFAULT_ACCOUNTS,
    categories: DEFAULT_CATEGORIES,
    transactions: generateInitialTransactions(),
    profile: {
      name: 'Lucas Magagnini',
      email: 'magagnini@moneyflow.dev',
      telegramLinked: true,
    },
  }
  localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(initial))
}

function getStore(): DemoDataStore {
  const raw = localStorage.getItem(DEMO_DATA_KEY)
  if (!raw) {
    resetDemoData()
    return JSON.parse(localStorage.getItem(DEMO_DATA_KEY)!)
  }
  try {
    return JSON.parse(raw) as DemoDataStore
  } catch {
    resetDemoData()
    return JSON.parse(localStorage.getItem(DEMO_DATA_KEY)!)
  }
}

function saveStore(data: DemoDataStore): void {
  localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(data))
}

export const mockStore = {
  getProfile: (): OwnerProfile => getStore().profile,

  getAccounts: (): Account[] => getStore().accounts,

  getCategories: (): Category[] => getStore().categories,

  getTransactions: (
    range: DateRange,
    scope?: { accountId?: number; currency?: Currency },
  ): Transaction[] => {
    const { transactions } = getStore()
    const targetCurrency = scope?.currency ?? 'BRL'

    return transactions
      .filter((t) => {
        if (t.currency !== targetCurrency) return false
        if (scope?.accountId != null) {
          // No mock associamos certas contas por id ou deixamos genérico
        }
        if (range.startDate && t.date < range.startDate) return false
        if (range.endDate && t.date > range.endDate) return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  },

  updateTransaction: (id: number, update: TransactionUpdate): Transaction => {
    const store = getStore()
    const index = store.transactions.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Transação não encontrada')

    const oldTx = store.transactions[index]
    const cat = store.categories.find((c) => c.categoryId === update.categoryId)

    const updatedTx: Transaction = {
      ...oldTx,
      description: update.description,
      amount: update.amount,
      categoryId: update.categoryId,
      categoryDescription: cat ? cat.categoryDescription : oldTx.categoryDescription,
    }

    store.transactions[index] = updatedTx

    // Ajusta o saldo da conta pela diferença
    const diff = update.amount - oldTx.amount
    const accountIndex = store.accounts.findIndex((a) => a.currency === oldTx.currency)
    if (accountIndex !== -1) {
      if (oldTx.operationType === 'EXPENSE') {
        store.accounts[accountIndex].amount -= diff
      } else {
        store.accounts[accountIndex].amount += diff
      }
    }

    saveStore(store)
    return updatedTx
  },

  createTransaction: (data: {
    description: string
    amount: number
    date: string
    categoryId: number
    operationType: 'EXPENSE' | 'INCOME'
    currency: Currency
    accountId?: number
  }): Transaction => {
    const store = getStore()
    const cat = store.categories.find((c) => c.categoryId === data.categoryId)

    const newTx: Transaction = {
      id: Date.now(),
      description: data.description,
      amount: data.amount,
      date: data.date,
      categoryId: data.categoryId,
      categoryDescription: cat ? cat.categoryDescription : 'Geral',
      operationType: data.operationType,
      currency: data.currency,
    }

    store.transactions.unshift(newTx)

    // Ajusta saldo da conta
    const accountIndex = data.accountId
      ? store.accounts.findIndex((a) => a.accountId === data.accountId)
      : store.accounts.findIndex((a) => a.currency === data.currency)

    if (accountIndex !== -1) {
      if (data.operationType === 'EXPENSE') {
        store.accounts[accountIndex].amount -= data.amount
      } else {
        store.accounts[accountIndex].amount += data.amount
      }
    }

    saveStore(store)
    return newTx
  },

  deleteTransaction: (id: number): void => {
    const store = getStore()
    const index = store.transactions.findIndex((t) => t.id === id)
    if (index !== -1) {
      const tx = store.transactions[index]
      const accountIndex = store.accounts.findIndex((a) => a.currency === tx.currency)
      if (accountIndex !== -1) {
        if (tx.operationType === 'EXPENSE') {
          store.accounts[accountIndex].amount += tx.amount
        } else {
          store.accounts[accountIndex].amount -= tx.amount
        }
      }
      store.transactions.splice(index, 1)
      saveStore(store)
    }
  },

  createAccount: (description: string, initialBalance: number, currency: Currency): Account => {
    const store = getStore()
    const newAcc: Account = {
      accountId: Date.now() % 100000,
      description,
      amount: initialBalance,
      currency,
    }
    store.accounts.push(newAcc)
    saveStore(store)
    return newAcc
  },

  // Agregações de relatórios
  getTotalSpent: (
    range: DateRange,
    scope?: { accountId?: number; currency?: Currency },
  ): TotalAmount => {
    const txs = mockStore.getTransactions(range, scope)
    const total = txs
      .filter((t) => t.operationType === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)
    return { total }
  },

  getTotalIncome: (
    range: DateRange,
    scope?: { accountId?: number; currency?: Currency },
  ): TotalAmount => {
    const txs = mockStore.getTransactions(range, scope)
    const total = txs
      .filter((t) => t.operationType === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
    return { total }
  },

  getTotalRecurring: (
    range: DateRange,
    scope?: { accountId?: number; currency?: Currency },
  ): TotalAmount => {
    const total = mockStore.getTotalSpent(range, scope).total * 0.35
    return { total: Math.round(total * 100) / 100 }
  },

  getSpentRankedByCategory: (
    range: DateRange,
    scope?: { accountId?: number; currency?: Currency },
  ): AmountAndCategory[] => {
    const txs = mockStore
      .getTransactions(range, scope)
      .filter((t) => t.operationType === 'EXPENSE')
    const grouped = new Map<string, number>()

    for (const t of txs) {
      const cur = grouped.get(t.categoryDescription) ?? 0
      grouped.set(t.categoryDescription, cur + t.amount)
    }

    return Array.from(grouped.entries())
      .map(([categoryDescription, total]) => ({ categoryDescription, total }))
      .sort((a, b) => b.total - a.total)
  },

  getIncomeExpenseMonthly: (
    _range: DateRange,
    scope?: { accountId?: number; currency?: Currency },
  ): MonthlyIncomeExpense[] => {
    const txs = mockStore.getTransactions(
      { startDate: '2025-01-01', endDate: '2027-12-31' },
      scope,
    )
    const map = new Map<string, { income: number; expense: number }>()

    for (const t of txs) {
      const monthKey = t.date.slice(0, 7)
      const cur = map.get(monthKey) ?? { income: 0, expense: 0 }
      if (t.operationType === 'INCOME') cur.income += t.amount
      else if (t.operationType === 'EXPENSE') cur.expense += t.amount
      map.set(monthKey, cur)
    }

    return Array.from(map.entries())
      .map(([month, val]) => ({ month, income: val.income, expense: val.expense }))
      .sort((a, b) => a.month.localeCompare(b.month))
  },

  getBalanceHistory: (
    range: DateRange,
    scope?: { accountId?: number; currency?: Currency },
  ): TimeSeriesPoint[] => {
    const txs = mockStore.getTransactions(range, scope)
    const dailyMap = new Map<string, { income: number; expense: number }>()

    for (const t of txs) {
      const cur = dailyMap.get(t.date) ?? { income: 0, expense: 0 }
      if (t.operationType === 'INCOME') cur.income += t.amount
      if (t.operationType === 'EXPENSE') cur.expense += t.amount
      dailyMap.set(t.date, cur)
    }

    // Se estiver vazio, gera dias padrão para exibir o gráfico bonito
    const dates = Array.from(dailyMap.keys()).sort()
    if (dates.length === 0) {
      const today = new Date().toISOString().slice(0, 10)
      return [{ date: today, income: 0, expense: 0, net: 0 }]
    }

    return dates.map((date) => {
      const item = dailyMap.get(date)!
      return {
        date,
        income: item.income,
        expense: item.expense,
        net: item.income - item.expense,
      }
    })
  },
}
