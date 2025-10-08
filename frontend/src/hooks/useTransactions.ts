import { useCallback, useEffect, useState } from "react";
import { Transaction, getTransactions, createTransaction, TxCreate } from "../services/transactions";

export function useTransactions() {
    const [items, setItems] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [accountId, setAccountId] = useState<string | undefined>(undefined);

    const refresh = useCallback(async () => {
        setLoading(true);
        try { setItems(await getTransactions(accountId)); }
        finally { setLoading(false); }
    }, [accountId]);

    useEffect(() => { refresh(); }, [refresh]);

    return {
        items, loading, accountId, setAccountId, refresh,
        async create(p: TxCreate) { const t = await createTransaction(p); setItems(v => [t, ...v]); }
    };
}