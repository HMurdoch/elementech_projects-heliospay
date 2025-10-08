import { api } from "../lib/api";

export type Account = {
    id: string;
    ownerName: string;
    accountNumber: string;
    currency: string;
    balance: number;
    createdUtc: string;
};

export type AccountCreate = {
    ownerName: string;
    accountNumber: string;
    currency: string;
};

export type AccountUpdate = AccountCreate;

export async function getAccounts(currency?: string) {
    const res = await api.get<Account[]>("/api/accounts", { params: { currency } });
    return res.data;
}
export async function getAccount(id: string) {
    const res = await api.get<Account>(`/api/accounts/${id}`);
    return res.data;
}
export async function createAccount(payload: AccountCreate) {
    const res = await api.post<Account>("/api/accounts", payload);
    return res.data;
}
export async function updateAccount(id: string, payload: AccountUpdate) {
    const res = await api.put<Account>(`/api/accounts/${id}`, payload);
    return res.data;
}
export async function deleteAccount(id: string) {
    await api.delete(`/api/accounts/${id}`);
}