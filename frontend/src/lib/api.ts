import axios from 'axios';
import { Account, Transaction } from '../types';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
    headers: { 'Content-Type': 'application/json' }
});

// Accounts
export const getAccounts = async (): Promise<Account[]> => {
    const { data } = await api.get('/api/accounts');
    return data;
};

export const createAccount = async (payload: Partial<Account>): Promise<Account> => {
    const { data } = await api.post('/api/accounts', payload);
    return data;
};

export const updateAccount = async (id: string, payload: Partial<Account>): Promise<Account> => {
    const { data } = await api.put(`/api/accounts/${id}`, payload);
    return data;
};

export const deleteAccount = async (id: string): Promise<void> => {
    await api.delete(`/api/accounts/${id}`);
};

// Transactions
export const getTransactions = async (params?: { accountId?: string; q?: string }): Promise<Transaction[]> => {
    const { data } = await api.get('/api/transactions', { params });
    return data;
};

export const createTransaction = async (payload: {
    accountId: string;
    amount: number;           // positive = Credit, negative = Debit
    type: 'Credit' | 'Debit';
    description?: string;
}): Promise<Transaction> => {
    const { data } = await api.post('/api/transactions', payload);
    return data;
};

export default api;