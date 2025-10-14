import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { AccountsApi } from "./api";
import AccountsPanel from "./components/AccountsPanel";
import AccountForm from "./components/AccountForm";
export default function App() {
    const [accounts, setAccounts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    async function refreshAccounts() {
        const data = await AccountsApi.list();
        setAccounts(data);
    }
    useEffect(() => { void refreshAccounts(); }, []);
    function onCreate() {
        setEditing(null);
        setShowForm(true);
    }
    function onEdit(acc) {
        setEditing(acc);
        setShowForm(true);
    }
    async function onDelete(acc) {
        if (!confirm(`Delete account ${acc.accountNumber}?`))
            return;
        await AccountsApi.delete(acc.id);
        await refreshAccounts();
    }
    async function handleFormSubmit(values) {
        if (editing) {
            await AccountsApi.update(editing.id, values);
        }
        else {
            await AccountsApi.create(values);
        }
        setShowForm(false);
        setEditing(null);
        await refreshAccounts();
    }
    return (_jsxs("main", { className: "container", children: [_jsx(AccountsPanel, { accounts: accounts, setAccounts: setAccounts, onCreate: onCreate, onEdit: onEdit, onDelete: onDelete }), showForm && (_jsx(AccountForm, { open: showForm, initialValues: editing ?? undefined, onCancel: () => { setShowForm(false); setEditing(null); }, onSave: handleFormSubmit }))] }));
}
