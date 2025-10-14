import { useCallback, useEffect, useState } from "react";
import type { Transaction } from "../api";
import {
    listTransactions,
    createTransaction,
    type TxCreate,
} from "../services/transactions";

/**
 * Transactions hook. If an accountId is provided, it filters by that account.
 */
export default function useTransactions(accountId?: string) {
    const [items, setItems] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listTransactions({
                accountId: accountId || undefined,
                take: 10,
            });
            setItems(data);
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    const create = useCallback(async (payload: TxCreate) => {
        await createTransaction(payload);
        await refresh();
    }, [refresh]);

    useEffect(() => { void refresh(); }, [refresh]);

    return {
        items,
        loading,
        refresh,
        create,
        setItems,
    };
}