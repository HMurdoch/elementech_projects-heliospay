import { useCallback, useEffect, useState } from "react";
import type { Account } from "../api";
import {
    listAccounts,
    getAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    type AccountDto,
} from "../services/accounts";

/**
 * Simple accounts hook that owns list state + CRUD helpers.
 */
export default function useAccounts() {
    const [items, setItems] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listAccounts();
            setItems(data);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOne = useCallback(async (id: string) => {
        return await getAccount(id);
    }, []);

    const create = useCallback(async (dto: AccountDto) => {
        await createAccount(dto);
        await refresh();
    }, [refresh]);

    const update = useCallback(async (id: string, dto: Partial<AccountDto>) => {
        await updateAccount(id, dto);
        await refresh();
    }, [refresh]);

    const remove = useCallback(async (id: string) => {
        await deleteAccount(id);
        await refresh();
    }, [refresh]);

    useEffect(() => { void refresh(); }, [refresh]);

    return {
        items,
        loading,
        refresh,
        fetchOne,
        create,
        update,
        remove,
        setItems, // exposed in case a component wants to optimistically update
    };
}