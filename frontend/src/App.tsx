// src/App.tsx
import { useEffect, useState } from 'react';
import type { Account, Transaction } from './types';
import { AccountsApi, TransactionsApi } from './api';
import AccountsPanel from './components/AccountsPanel';
import AccountForm from './components/AccountForm';
import TransactionForm from './components/TransactionForm';

export default function App() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    // new/edit account modal
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [editAccount, setEditAccount] = useState<Account | null>(null);

    // transactions panel state
    const [txAccountId, setTxAccountId] = useState<string | undefined>(undefined);
    const [txQuery, setTxQuery] = useState('');

    async function loadAccounts() {
        setLoading(true);
        try {
            const data = await AccountsApi.list();
            setAccounts(data);
        } finally {
            setLoading(false);
        }
    }

    async function loadTransactions() {
        setLoading(true);
        try {
            const data = await TransactionsApi.list({
                accountId: txAccountId,
                q: txQuery || undefined,
            });
            setTransactions(data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // first load
        loadAccounts();
        loadTransactions();
    }, []);

    // whenever tx filters change, refresh list
    useEffect(() => {
        loadTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [txAccountId, txQuery]);

    const handleCreateAccount = () => {
        setEditAccount(null);
        setShowAccountForm(true);
    };
    const handleEditAccount = (acc: Account) => {
        setEditAccount(acc);
        setShowAccountForm(true);
    };

    const handleSaveAccount = async (values: Pick<Account, 'ownerName' | 'accountNumber' | 'currency'> & { id?: string }) => {
        if (editAccount?.id) {
            await AccountsApi.update(editAccount.id, values);
        } else {
            await AccountsApi.create(values);
        }
        setShowAccountForm(false);
        setEditAccount(null);
        await loadAccounts();
    };

    const handleDeleteAccount = async (acc: Account) => {
        if (!confirm(`Delete ${acc.ownerName} (${acc.accountNumber})?`)) return;
        await AccountsApi.remove(acc.id);
        await loadAccounts();
    };

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <div className="title">HeliosPay • Demo</div>
                    <div className="subtitle">Integration POC · 2025</div>
                </div>
                <div className="header-actions">
                    {/* top-left refresh -> handled inside AccountsPanel now */}
                    {/* Keep top-right Create only */}
                    <button className="btn primary" onClick={handleCreateAccount}>New account</button>
                    <a className="link" href="http://localhost:5000/index.html" target="_blank" rel="noreferrer">Open Swagger ↗</a>
                </div>
            </header>

            {/* Accounts */}
            <AccountsPanel
                accounts={accounts}
                setAccounts={setAccounts}
                onEdit={handleEditAccount}
                onDelete={handleDeleteAccount}
                onCreate={handleCreateAccount}
            />

            {/* Transactions */}
            <section className="panel" style={{ marginTop: 20 }}>
                <header className="panel-header">
                    <h3>Transactions</h3>
                </header>
                <div className="tx-filters">
                    <select
                        value={txAccountId ?? ''}
                        onChange={(e) => setTxAccountId(e.target.value || undefined)}
                    >
                        <option value="">All accounts</option>
                        {accounts.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.ownerName} — {a.accountNumber}
                            </option>
                        ))}
                    </select>

                    <input
                        placeholder="Search description…"
                        value={txQuery}
                        onChange={(e) => setTxQuery(e.target.value)}
                    />

                    <button className="btn" onClick={loadTransactions}>Refresh</button>

                    {/* Add transaction button opens existing TransactionForm (unchanged) */}
                    <TransactionForm
                        accounts={accounts}
                        onPosted={loadTransactions}
                    />
                </div>

                <div className="table-wrap">
                    <table className="grid">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Account ID</th>
                                <th>Amount</th>
                                <th>Type</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 && (
                                <tr><td colSpan={5}>No transactions</td></tr>
                            )}
                            {transactions.map(t => (
                                <tr key={t.id}>
                                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                                    <td>{t.accountId.slice(0, 8)}</td>
                                    <td
                                        style={{ color: t.type === 'Credit' ? 'var(--green)' : 'var(--red)' }}
                                    >
                                        {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td>{t.type}</td>
                                    <td>{t.description || ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Account modal */}
            {showAccountForm && (
                <AccountForm
                    initial={editAccount ?? undefined}
                    onCancel={() => { setShowAccountForm(false); setEditAccount(null); }}
                    onSave={handleSaveAccount}
                />
            )}
        </main>
    );
}
