// src/api.ts
export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

type HttpOpts = RequestInit & { query?: Record<string, string | number | undefined | null> };

async function http<T>(path: string, opts: HttpOpts = {}): Promise<T> {
    const url = new URL(path, API_BASE);
    if (opts.query) {
        Object.entries(opts.query).forEach(([k, v]) => {
            if (v !== undefined && v !== null && `${v}`.length) url.searchParams.set(k, String(v));
        });
    }

    const res = await fetch(url.toString(), {
        headers: { 'Content-Type': 'application/json' },
        ...opts,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
    }
    return (await res.json()) as T;
}

/* =========================
 * Accounts
 * =======================*/
export const AccountsApi = {
    list: () => http<Account[]>('/api/accounts'),
    create: (data: Pick<Account, 'ownerName' | 'accountNumber' | 'currency'>) =>
        http<Account>('/api/accounts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Account>) =>
        http<Account>(`/api/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => http<void>(`/api/accounts/${id}`, { method: 'DELETE' }),
};

/* =========================
 * Transactions
 *  - server already supports ?accountId=&q=
 * =======================*/
export const TransactionsApi = {
    list: (p: { accountId?: string; q?: string } = {}) =>
        http<Transaction[]>('/api/transactions', { query: p }),
    create: (data: { accountId: string; amount: number; type: 'Credit' | 'Debit'; description?: string }) =>
        http<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
};

/* ==== Types ==== */
export type Account = {
    id: string;
    ownerName: string;
    accountNumber: string;
    balance: number;
    currency: string;
    createdUtc: string;
};

export type Transaction = {
    id: string;
    accountId: string;
    createdAt: string;
    amount: number;
    type: "Debit" | "Credit";
    description?: string;
};

export type AccountFilters = {
    owner?: string;
    accountNumber?: string;
    balanceFrom?: number;
    balanceTo?: number;
    createdFrom?: string; // yyyy-mm-dd
    createdTo?: string;   // yyyy-mm-dd
};

/* ==== Accounts ==== */
export function getAccounts(filters?: AccountFilters) {
    // Map UI filters to API query params (adjust names if your controller differs)
    return http<Account[]>("/api/accounts", {
        query: {
            ownerName: filters?.owner,
            accountNumber: filters?.accountNumber,
            balanceFrom: filters?.balanceFrom,
            balanceTo: filters?.balanceTo,
            createdFrom: filters?.createdFrom,
            createdTo: filters?.createdTo,
        },
    });
}

export function createAccount(payload: {
    ownerName: string;
    accountNumber: string;
    currency: string;
}) {
    return http<Account>("/api/accounts", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function updateAccount(
    id: string,
    payload: Partial<Pick<Account, "ownerName" | "accountNumber" | "currency">>
) {
    return http<Account>(`/api/accounts/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export function deleteAccount(id: string) {
    return http<Json>(`/api/accounts/${id}`, { method: "DELETE" });
}

/* ==== Transactions ==== */
export function getTransactions(params: { accountId?: string; q?: string }) {
    return http<Transaction[]>("/api/transactions", { query: params });
}

export function createTransaction(payload: {
    accountId: string;
    type: "Debit" | "Credit";
    amount: number;
    description?: string;
}) {
    return http<Transaction>("/api/transactions", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
