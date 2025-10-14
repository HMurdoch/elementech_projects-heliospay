// src/api.ts

// ----------------------------- Types ------------------------------------

export type Currency = 'ZAR' | 'USD' | 'EUR' | 'GBP';

export type Account = {
    id: string;
    ownerName: string;
    accountNumber: string;
    currency: Currency | string;
    balance: number;
    createdUtc: string;
};

export type AccountDto = {
    ownerName: string;
    accountNumber: string;
    currency: Currency | string;
    balance?: number;
};

export type TransactionType = 'Credit' | 'Debit';

export type Transaction = {
    id: string;
    accountId: string;
    accountNumber?: string;
    amount: number;
    type: TransactionType;
    description?: string | null;
    status?: string;
    currency?: Currency;
    createdAt?: string;
    createdUtc?: string;
    requestedUtc?: string | null;
    completedUtc?: string | null;
    correlationId?: string | null;
};

export type TransactionCreateDto = {
    accountId: string;
    type: TransactionType; // 'Credit' | 'Debit'
    amount: number;        // negative for debit if hitting /transactions directly
    description?: string | null;
};

export type TransferDto = {
    fromAccountId: string;
    toAccountId: string;
    amount: number;        // positive number
    description?: string | null;
};

// ----------------------------- Request ----------------------------------

/*const API_BASE = (import.meta as any)?.env?.VITE_API_URL ?? 'http://localhost:5000';*/
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

async function request<T>(
    path: string,
    options?: RequestInit & { query?: Record<string, unknown> }
): Promise<T> {
    const url = new URL(path, API_BASE);

    if (options?.query) {
        Object.entries(options.query)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .forEach(([k, v]) => url.searchParams.set(k, String(v)));
    }

    const res = await fetch(url.toString(), {
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        ...options,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
    }

    // @ts-expect-error allow void on 204 responses
    return res.status === 204 ? undefined : (await res.json());
}

// ----------------------------- Accounts ---------------------------------

export const AccountsApi = {
    list: () => request<Account[]>('/api/accounts'),
    get: (id: string) => request<Account>(`/api/accounts/${id}`),
    create: (dto: AccountDto) =>
        request<Account>('/api/accounts', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id: string, dto: Partial<AccountDto>) =>
        request<Account>(`/api/accounts/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
    delete: (id: string) =>
        request<void>(`/api/accounts/${id}`, { method: 'DELETE' }),
};

// compatibility named exports (some components import these directly)
export const listAccounts = AccountsApi.list;
export const getAccount = AccountsApi.get;
export const createAccount = AccountsApi.create;
export const updateAccount = AccountsApi.update;
export const deleteAccount = AccountsApi.delete;

// --------------------------- Transactions -------------------------------

export const TransactionsApi = {
    list: (q?: { accountId?: string; q?: string; take?: number }) =>
        request<Transaction[]>('/api/transactions', { query: q }),
    /**
     * Creates a single transaction on one account.
     * NOTE: If you use this directly for a debit, send a NEGATIVE amount.
     * Prefer TransfersApi.transfer for two-leg transfers.
     */
    create: (dto: TransactionCreateDto) =>
        request<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(dto) }),
};

export const listTransactions = TransactionsApi.list;
export const createTransaction = TransactionsApi.create;

// ----------------------------- Transfers --------------------------------

export const TransfersApi = {
    transfer: (dto: TransferDto) =>
        request<void>('/api/transactions/transfer', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),
};

// compatibility alias
export const transfer = TransfersApi.transfer;

// ----------------------------- Utilities --------------------------------

export function formatAmount(x: number, minimumFractionDigits = 2, maximumFractionDigits = 2) {
    return Number(x ?? 0).toLocaleString(undefined, { minimumFractionDigits, maximumFractionDigits });
}
