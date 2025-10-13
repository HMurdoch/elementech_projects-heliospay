// src/App.tsx
import { useEffect, useState } from 'react';
import type { Account } from './types';
import { AccountsApi } from './api';
import AccountsPanel from './components/AccountsPanel';
import AccountForm from './components/AccountForm'; // assumes you already have this

export default function App() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Account | null>(null);

    async function refreshAccounts() {
        setAccounts(await AccountsApi.list());
    }

    useEffect(() => {
        refreshAccounts();
    }, []);

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
        await AccountsApi.remove(acc.id);
        await refreshAccounts();
    }

    async function handleFormSubmit(values: any) {
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
            {/* top bar (keep your Swagger link etc. here if you want) */}
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