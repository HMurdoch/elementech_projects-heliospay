// src/api.ts
// Single place for all HTTP calls used by the app.
// Works with your HelioPay.API controllers (Accounts, Transactions).

export type Currency = 'ZAR' | 'USD' | 'EUR' | 'GBP';

export type Account = {
    id: string;               // Guid
    owner: string;
    accountNumber: string;
    currency: Currency;
    balance: number;
    createdAt: string;        // ISO date
};

export type AccountUpsert = {
    owner: string;
    accountNumber: string;
    currency: Currency;
};

export type TransactionType = 'Credit' | 'Debit';

export type Transaction = {
    id: string;               // Guid
    accountId: string;        // Guid
    amount: number;           // positive for Credit, negative for Debit in DB; UI sends + and type
    type: TransactionType;
    description?: string;
    createdAt: string;        // ISO date
};

export type TxnPost = {
    accountId: string;
    amount: number;           // positive value
    type: TransactionType;    // 'Credit' | 'Debit'
    description?: string;
};

export type AccountsFilter = {
    owner?: string;
    accountNumber?: string;
    balanceFrom?: number | null;
    balanceTo?: number | null;
    createdFrom?: string | null; // ISO (yyyy-mm-dd) or null
    createdTo?: string | null;   // ISO (yyyy-mm-dd) or null
};

// Unified, typed API helpers used by the app
// Works with: http://localhost:5000 (override via VITE_API_URL)

const API_BASE = (import.meta as any)?.env?.VITE_API_URL ?? 'http://localhost:5000';

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
        ...options,
        // keep CORS simple for localhost dev
        mode: 'cors',
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
    }
    return (res.status === 204 ? (undefined as unknown as T) : (await res.json())) as T;
}

// -------------------- Accounts --------------------

export type AccountDto = {
    ownerName: string;
    accountNumber: string;
    currency: string;
    balance?: number;
};

export const AccountsApi = {
    list: () => request<any[]>('/api/accounts'),
    get: (id: string) => request<any>(`/api/accounts/${id}`),
    create: (dto: AccountDto) =>
        request<any>('/api/accounts', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id: string, dto: Partial<AccountDto>) =>
        request<any>(`/api/accounts/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
    remove: (id: string) => request<void>(`/api/accounts/${id}`, { method: 'DELETE' }),
};

// ------------------ Transactions ------------------

export type TransactionCreateDto = {
    accountId: string;
    type: 'Credit' | 'Debit';
    amount: number;
    description?: string | null;
};

export const TransactionsApi = {
    list: (q?: { accountId?: string; q?: string; take?: number }) =>
        request<any[]>('/api/transactions', { query: q }),
    create: (dto: TransactionCreateDto) =>
        request<any>('/api/transactions', { method: 'POST', body: JSON.stringify(dto) }),
};
