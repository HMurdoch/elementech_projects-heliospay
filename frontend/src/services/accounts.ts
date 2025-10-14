import { api } from "../api/client";
import type { Account } from "../api";

export type AccountDto = {
    ownerName: string;
    accountNumber: string;
    currency: "ZAR" | "USD" | "EUR" | "GBP";
};

export async function listAccounts(): Promise<Account[]> {
    const { data } = await api.get<Account[]>("/accounts");
    return data;
}

export async function getAccount(id: string): Promise<Account> {
    const { data } = await api.get<Account>(`/accounts/${id}`);
    return data;
}

export async function createAccount(dto: AccountDto): Promise<Account> {
    const { data } = await api.post<Account>("/accounts", dto);
    return data;
}

export async function updateAccount(
    id: string,
    dto: Partial<AccountDto>
): Promise<Account> {
    const { data } = await api.put<Account>(`/accounts/${id}`, dto);
    return data;
}

export async function deleteAccount(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`);
}