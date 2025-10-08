import { useCallback, useEffect, useState } from "react";
import { Account, getAccounts, createAccount, updateAccount, deleteAccount, AccountCreate, AccountUpdate } from "../services/accounts";

export function useAccounts(defaultCurrency?: string) {
    const [items, setItems] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [currency, setCurrency] = useState<string | undefined>(defaultCurrency);

    const refresh = useCallback(async () => {
        setLoading(true);
        try { setItems(await getAccounts(currency)); }
        finally { setLoading(false); }
    }, [currency]);

    useEffect(() => { refresh(); }, [refresh]);

    return {
        items, loading, currency, setCurrency, refresh,
        async create(p: AccountCreate) { const a = await createAccount(p); setItems(v => [a, ...v]); },
        async update(id: string, p: AccountUpdate) { const a = await updateAccount(id, p); setItems(v => v.map(x => x.id === id ? a : x)); },
        async remove(id: string) { await deleteAccount(id); setItems(v => v.filter(x => x.id !== id)); },
    };
}