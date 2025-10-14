import { useEffect, useState } from "react";
import { AccountsApi, type Account } from "./api";
import AccountsPanel from "./components/AccountsPanel";
import AccountForm from "./components/AccountForm";

export default function App() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Account | null>(null);

    async function refreshAccounts() {
        const data = await AccountsApi.list();
        setAccounts(data);
    }

    useEffect(() => { void refreshAccounts(); }, []);

    function onCreate() {
        setEditing(null);
        setShowForm(true);
    }

    function onEdit(acc: Account) {
        setEditing(acc);
        setShowForm(true);
    }

    async function onDelete(acc: Account) {
        if (!confirm(`Delete account ${acc.accountNumber}?`)) return;
        await AccountsApi.delete(acc.id);
        await refreshAccounts();
    }

    async function handleFormSubmit(values: {
        ownerName: string;
        accountNumber: string;
        currency: "ZAR" | "USD" | "EUR" | "GBP";
    }) {
        if (editing) {
            await AccountsApi.update(editing.id, values);
        } else {
            await AccountsApi.create(values);
        }
        setShowForm(false);
        setEditing(null);
        await refreshAccounts();
    }

    return (
        <main className="container">
            <AccountsPanel
                accounts={accounts}
                setAccounts={setAccounts}
                onCreate={onCreate}
                onEdit={onEdit}
                onDelete={onDelete}
            />

            {showForm && (
                <AccountForm
                    open={showForm}
                    initialValues={editing ?? undefined}
                    onCancel={() => { setShowForm(false); setEditing(null); }}
                    onSave={handleFormSubmit}
                />
            )}
        </main>
    );
}