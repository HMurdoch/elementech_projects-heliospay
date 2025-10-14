import { api } from "../api/client";
import type { Transaction } from "../api";

export type TxCreate = {
    accountId: string;
    type: "Credit" | "Debit";
    amount: number;
    description?: string;
};

export async function listTransactions(params?: {
    accountId?: string;
    take?: number;
}): Promise<Transaction[]> {
    const { data } = await api.get<Transaction[]>("/transactions", { params });
    return data;
}

export async function createTransaction(payload: TxCreate): Promise<Transaction> {
    const { data } = await api.post<Transaction>("/transactions", payload);
    return data;
}