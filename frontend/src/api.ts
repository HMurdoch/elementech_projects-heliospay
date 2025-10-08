// frontend/src/api.ts
import axios, { AxiosError } from "axios";

// Use the https port in dev to avoid redirect hops
export const API_BASE =
    import.meta.env.VITE_API_BASE ??
        'https://localhost:5001';

import axios from 'axios';
export const api = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
});

// Simple interceptor to surface useful messages in the console
api.interceptors.response.use(
    (r) => r,
    (err: AxiosError) => {
        const url = err.config?.baseURL
            ? `${err.config.baseURL}${err.config.url}`
            : err.config?.url;
        console.error(
            "[API ERROR]",
            err.code || err.name,
            err.message,
            "→",
            url
        );
        throw err;
    }
);

// --- typed wrappers ---------------------------------------------------------
export type AccountDto = {
    id: string;
    ownerName: string;
    accountNumber: string;
    currency: string;
    balance: number;
    createdUtc: string;
};

export type TransactionDto = {
    id: string;
    accountId: string;
    createdAt: string;
    amount: number;
    type: "Credit" | "Debit";
    description: string;
};

// Accounts
export const getAccounts = () => api.get<AccountDto[]>("/accounts");
export const createAccount = (payload: {
    ownerName: string;
    accountNumber: string;
    currency: string;
}) => api.post<AccountDto>("/accounts", payload);
export const updateAccount = (
    id: string,
    payload: Partial<Pick<AccountDto, "ownerName" | "accountNumber" | "currency">>
) => api.put<AccountDto>(`/accounts/${id}`, payload);
export const deleteAccount = (id: string) => api.delete<void>(`/accounts/${id}`);

// Transactions
export const getTransactions = (accountId?: string, q?: string) =>
    api.get<TransactionDto[]>("/transactions", {
        params: { accountId, q },
    });
export const createTransaction = (payload: {
    accountId: string;
    amount: number;
    type: "Credit" | "Debit";
    description?: string;
}) => api.post<TransactionDto>("/transactions", payload);
