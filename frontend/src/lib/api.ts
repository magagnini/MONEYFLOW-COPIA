import type {
  Account,
  Currency,
  AmountAndCategory,
  Category,
  DateRange,
  MonthlyIncomeExpense,
  OwnerProfile,
  TelegramInvite,
  TimeSeriesPoint,
  TotalAmount,
  Transaction,
  TransactionUpdate,
} from './types'
import { clearToken, getToken } from './auth'
import { isDemoActive, mockStore } from './mockStore'

const CUSTOM_API_KEY = 'money-flow:custom-api-url'

export function getApiBaseUrl(): string {
  const custom = localStorage.getItem(CUSTOM_API_KEY)
  if (custom && custom.trim().length > 0) return custom.trim()
  return import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
}

export function setApiBaseUrl(url: string): void {
  if (url.trim()) {
    localStorage.setItem(CUSTOM_API_KEY, url.trim())
  } else {
    localStorage.removeItem(CUSTOM_API_KEY)
  }
}

/** Disparado quando qualquer chamada recebe 401 (token ausente/expirado). */
export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response, path: string): Promise<T> {
  if (res.status === 401) {
    clearToken()
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} — ${path}`)
  }
  return res.json() as Promise<T>
}

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const baseUrl = getApiBaseUrl()
  const url = new URL(`${baseUrl}${path}`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  let res: Response
  try {
    res = await fetch(url, {
      headers: { Accept: 'application/json', ...authHeaders() },
    })
  } catch {
    if (getToken() && !isDemoActive()) {
      clearToken()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    throw new Error(`Network error — ${path}`)
  }
  return handleResponse<T>(res, path)
}

async function send<T>(method: 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const baseUrl = getApiBaseUrl()
  const url = new URL(`${baseUrl}${path}`)
  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeaders(),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error(`Network error — ${path}`)
  }
  return handleResponse<T>(res, path)
}

const post = <T>(path: string, body: unknown) => send<T>('POST', path, body)
const put = <T>(path: string, body: unknown) => send<T>('PUT', path, body)

/** Escopo das agregações: conta específica e/ou moeda (nunca soma moedas diferentes). */
export interface ReportScope {
  accountId?: number
  currency?: Currency
}

/**
 * Monta os query params das queries de agregação. `accountId` e `currency` são
 * opcionais e só entram no querystring quando presentes.
 */
function reportParams(range: DateRange, scope: ReportScope = {}): Record<string, string> {
  const params: Record<string, string> = { ...range }
  if (scope.accountId != null) params.accountId = String(scope.accountId)
  if (scope.currency != null) params.currency = scope.currency
  return params
}

export const reportsApi = {
  totalSpent: async (range: DateRange, scope?: ReportScope): Promise<TotalAmount> => {
    if (isDemoActive()) return mockStore.getTotalSpent(range, scope)
    return get<TotalAmount>('/transactions/total-spent-by-time', reportParams(range, scope))
  },

  totalIncome: async (range: DateRange, scope?: ReportScope): Promise<TotalAmount> => {
    if (isDemoActive()) return mockStore.getTotalIncome(range, scope)
    return get<TotalAmount>('/transactions/total-income-by-time', reportParams(range, scope))
  },

  totalRecurring: async (range: DateRange, scope?: ReportScope): Promise<TotalAmount> => {
    if (isDemoActive()) return mockStore.getTotalRecurring(range, scope)
    return get<TotalAmount>('/transactions/total-recurring-by-time', reportParams(range, scope))
  },

  spentRankedByCategory: async (
    range: DateRange,
    scope?: ReportScope,
  ): Promise<AmountAndCategory[]> => {
    if (isDemoActive()) return mockStore.getSpentRankedByCategory(range, scope)
    return get<AmountAndCategory[]>(
      '/transactions/total-spent-ranked-by-category',
      reportParams(range, scope),
    )
  },

  incomeExpenseMonthly: async (
    range: DateRange,
    scope?: ReportScope,
  ): Promise<MonthlyIncomeExpense[]> => {
    if (isDemoActive()) return mockStore.getIncomeExpenseMonthly(range, scope)
    return get<MonthlyIncomeExpense[]>(
      '/transactions/income-expense-monthly',
      reportParams(range, scope),
    )
  },

  balanceHistory: async (range: DateRange, scope?: ReportScope): Promise<TimeSeriesPoint[]> => {
    if (isDemoActive()) return mockStore.getBalanceHistory(range, scope)
    const raw = await get<Record<string, unknown>[]>(
      '/transactions/history-balance',
      reportParams(range, scope),
    )
    return raw.map((r) => ({
      date: String(r.date ?? r.day),
      income: Number(r.income),
      expense: Number(r.expense),
      net: Number(r.net),
    })) as TimeSeriesPoint[]
  },
}

export const transactionsApi = {
  list: async (range: DateRange, scope?: ReportScope): Promise<Transaction[]> => {
    if (isDemoActive()) return mockStore.getTransactions(range, scope)
    return get<Transaction[]>('/transactions', reportParams(range, scope))
  },

  /** Edita descrição, categoria e valor; o backend ajusta o saldo da conta pela diferença. */
  update: async (id: number, body: TransactionUpdate): Promise<Transaction> => {
    if (isDemoActive()) return mockStore.updateTransaction(id, body)
    return put<Transaction>(`/transactions/${id}`, body)
  },

  /** Cria uma nova transação */
  create: async (data: {
    description: string
    amount: number
    date: string
    categoryId: number
    operationType: 'EXPENSE' | 'INCOME'
    currency: Currency
    accountId?: number
  }): Promise<Transaction> => {
    if (isDemoActive()) return mockStore.createTransaction(data)
    return post<Transaction>('/transactions', data)
  },

  /** Remove uma transação */
  delete: async (id: number): Promise<void> => {
    if (isDemoActive()) {
      mockStore.deleteTransaction(id)
      return
    }
    await send<void>('DELETE', `/transactions/${id}`)
  },
}

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    if (isDemoActive()) return mockStore.getCategories()
    return get<Category[]>('/categories')
  },
}

export const accountsApi = {
  getAll: async (): Promise<Account[]> => {
    if (isDemoActive()) return mockStore.getAccounts()
    return get<Account[]>('/accounts')
  },

  create: async (description: string, initialBalance: number, currency: Currency): Promise<Account> => {
    if (isDemoActive()) return mockStore.createAccount(description, initialBalance, currency)
    return post<Account>('/accounts', { description, amount: initialBalance, currency })
  },
}

export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string }> => {
    if (isDemoActive()) return { token: 'demo-token-magagnini' }
    return post<{ token: string }>('/auth/login', { email, password })
  },
  register: async (name: string, email: string, password: string): Promise<{ token: string }> => {
    if (isDemoActive()) return { token: 'demo-token-magagnini' }
    return post<{ token: string }>('/auth/register', { name, email, password })
  },
}

export const ownerApi = {
  me: async (): Promise<OwnerProfile> => {
    if (isDemoActive()) return mockStore.getProfile()
    return get<OwnerProfile>('/owner/me')
  },
  telegramInvite: async (): Promise<TelegramInvite> => {
    if (isDemoActive()) return { link: 'https://t.me/MoneyFlowMagagniniBot?start=demo-link' }
    return post<TelegramInvite>('/owner/telegram-invite', {})
  },
}
