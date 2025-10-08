import { api } from "../lib/api";

export type Transaction = {
    id: string;
    accountId: string;
    createdAt: string;
    amount: number;
    type: "Credit" | "Debit";
    description?: string;
};

export type TxCreate = {
    accountId: string;
    amount: number; // + credit / - debit (or include type)
    type: "Credit" | "Debit";
    description?: string;
};

export async function getTransactions(accountId?: string) {
    const res = await api.get<Transaction[]>("/api/transactions", { params: { accountId } });
    return res.data;
}
export async function createTransaction(payload: TxCreate) {
    const res = await api.post<Transaction>("/api/transactions", payload);
    return res.data;
}