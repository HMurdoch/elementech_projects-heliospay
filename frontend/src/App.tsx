import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import './app.css';
import {
    getAccounts, createAccount, updateAccount, deleteAccount,
    getTransactions, createTransaction
} from './lib/api';
import { Account, Transaction } from './types';
import AccountsTable from './components/AccountsTable';
import AccountForm, { AccountFormValues } from './components/AccountForm';
import TransactionsTable from './components/TransactionsTable';
import TransactionForm, { TxFormValues } from './components/TransactionForm';

export default function App() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterAccountId, setFilterAccountId] = useState<string>('');
    const [search, setSearch] = useState('');

    // dialogs
    const [showAccDialog, setShowAccDialog] = useState(false);
    const [editAcc, setEditAcc] = useState<Account | null>(null);
    const [showTxDialog, setShowTxDialog] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

    const refreshAccounts = async () => {
        setLoading(true);
        try { setAccounts(await getAccounts()); }
        finally { setLoading(false); }
    };

    const refreshTransactions = async () => {
        setLoading(true);
        try { setTransactions(await getTransactions({ accountId: filterAccountId || undefined, q: search || undefined })); }
        finally { setLoading(false); }
    };

    useEffect(() => { refreshAccounts(); }, []);
    useEffect(() => { refreshTransactions(); }, [filterAccountId, search]);

    const totalBalance = useMemo(
        () => accounts.reduce((s, a) => s + a.balance, 0),
        [accounts]
    );

    const handleSaveAccount = async (values: AccountFormValues) => {
        if (editAcc) {
            await updateAccount(editAcc.id, values);
        } else {
            await createAccount(values);
        }
        setShowAccDialog(false);
        setEditAcc(null);
        await refreshAccounts();
    };

    const handleDeleteAccount = async (id: string) => {
        if (!confirm('Delete this account?')) return;
        await deleteAccount(id);
        await refreshAccounts();
        if (filterAccountId === id) setFilterAccountId('');
        await refreshTransactions();
    };

    const handlePostTx = async (values: TxFormValues) => {
        // API expects positive amount but type differentiates, or amount sign may matter.
        const payload = {
            accountId: values.accountId,
            type: values.type,
            amount: values.type === 'Debit' ? -Math.abs(values.amount) : Math.abs(values.amount),
            description: values.description
        };
        await createTransaction(payload);
        setShowTxDialog(false);
        await Promise.all([refreshTransactions(), refreshAccounts()]);
    };

    return (
        <div className="page">
            <header className="header">
                <div>
                    <h1>HeliosPay • Demo</h1>
                    <div className="muted">Integration POC · {dayjs().format('YYYY')}</div>
                </div>

                <div className="right">
                    <div className="muted mono">API: {apiUrl}</div>
                    <a className="btn link" href={`${apiUrl}/swagger`} target="_blank" rel="noreferrer">Open Swagger ↗</a>
                </div>
            </header>

            {/* Accounts */}
            <section className="card">
                <div className="row between">
                    <h2>Accounts</h2>
                    <div className="row gap">
                        <button className="btn" onClick={refreshAccounts} disabled={loading}>Refresh</button>
                        <button className="btn primary" onClick={() => { setEditAcc(null); setShowAccDialog(true); }}>New account</button>
                    </div>
                </div>

                <div className="row stats">
                    <div className="stat">
                        <div className="label">Accounts</div>
                        <div className="value">{accounts.length}</div>
                    </div>
                    <div className="stat">
                        <div className="label">Total balance</div>
                        <div className="value">{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                <AccountsTable
                    items={accounts}
                    onEdit={(a) => { setEditAcc(a); setShowAccDialog(true); }}
                    onDelete={handleDeleteAccount}
                />
            </section>

            {/* Filters + post transaction */}
            <section className="card">
                <div className="row between">
                    <h2>Transactions</h2>
                    <div className="row gap">
                        <select value={filterAccountId} onChange={e => setFilterAccountId(e.target.value)}>
                            <option value="">All accounts</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.ownerName} – {a.accountNumber}</option>)}
                        </select>
                        <input placeholder="Search description…" value={search} onChange={e => setSearch(e.target.value)} />
                        <button className="btn" onClick={refreshTransactions} disabled={loading}>Refresh</button>
                        <button className="btn primary" onClick={() => setShowTxDialog(true)} disabled={!accounts.length}>Add transaction</button>
                    </div>
                </div>

                <TransactionsTable items={transactions} />
            </section>

            {/* Account dialog */}
            {showAccDialog && (
                <dialog open className="dialog">
                    <div className="dialog-card">
                        <div className="row between">
                            <h3>{editAcc ? 'Edit account' : 'New account'}</h3>
                            <button className="btn small" onClick={() => { setShowAccDialog(false); setEditAcc(null); }}>✕</button>
                        </div>
                        <AccountForm
                            defaultValues={editAcc ?? undefined}
                            onSubmit={handleSaveAccount}
                            onCancel={() => { setShowAccDialog(false); setEditAcc(null); }}
                        />
                    </div>
                </dialog>
            )}

            {/* Transaction dialog */}
            {showTxDialog && (
                <dialog open className="dialog">
                    <div className="dialog-card">
                        <div className="row between">
                            <h3>Post transaction</h3>
                            <button className="btn small" onClick={() => setShowTxDialog(false)}>✕</button>
                        </div>
                        <TransactionForm
                            accounts={accounts}
                            defaultAccountId={filterAccountId || accounts[0]?.id}
                            onSubmit={handlePostTx}
                            onCancel={() => setShowTxDialog(false)}
                        />
                    </div>
                </dialog>
            )}
        </div>
    );
}
