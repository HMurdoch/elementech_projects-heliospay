// src/api.ts
// ----------------------------- Request ----------------------------------
/*const API_BASE = (import.meta as any)?.env?.VITE_API_URL ?? 'http://localhost:5000';*/
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
async function request(path, options) {
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
    list: () => request('/api/accounts'),
    get: (id) => request(`/api/accounts/${id}`),
    create: (dto) => request('/api/accounts', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id, dto) => request(`/api/accounts/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
    delete: (id) => request(`/api/accounts/${id}`, { method: 'DELETE' }),
};
// compatibility named exports (some components import these directly)
export const listAccounts = AccountsApi.list;
export const getAccount = AccountsApi.get;
export const createAccount = AccountsApi.create;
export const updateAccount = AccountsApi.update;
export const deleteAccount = AccountsApi.delete;
// --------------------------- Transactions -------------------------------
export const TransactionsApi = {
    list: (q) => request('/api/transactions', { query: q }),
    /**
     * Creates a single transaction on one account.
     * NOTE: If you use this directly for a debit, send a NEGATIVE amount.
     * Prefer TransfersApi.transfer for two-leg transfers.
     */
    create: (dto) => request('/api/transactions', { method: 'POST', body: JSON.stringify(dto) }),
};
export const listTransactions = TransactionsApi.list;
export const createTransaction = TransactionsApi.create;
// ----------------------------- Transfers --------------------------------
export const TransfersApi = {
    transfer: (dto) => request('/api/transactions/transfer', {
        method: 'POST',
        body: JSON.stringify(dto),
    }),
};
// compatibility alias
export const transfer = TransfersApi.transfer;
// ----------------------------- Utilities --------------------------------
export function formatAmount(x, minimumFractionDigits = 2, maximumFractionDigits = 2) {
    return Number(x ?? 0).toLocaleString(undefined, { minimumFractionDigits, maximumFractionDigits });
}
