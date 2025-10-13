// src/components/AccountsPanel.tsx
import { useEffect, useMemo, useState } from 'react';
import type { Account, Transaction } from '../types';
import { AccountsApi, TransactionsApi } from '../api';

type Filters = {
    owner?: string;
    accountNumber?: string;
    balanceFrom?: number | null;
    balanceTo?: number | null;
    createdFrom?: string;
    createdTo?: string;
};

type Props = {
    accounts: Account[];
    setAccounts: (rows: Account[]) => void;
    onCreate: () => void;
    onEdit: (acc: Account) => void;
    onDelete: (acc: Account) => void;
};

export default function AccountsPanel({
    accounts,
    setAccounts,
    onCreate,
    onEdit,
    onDelete,
}: Props) {
    const [filters, setFilters] = useState<Filters>({
        owner: '',
        accountNumber: '',
        balanceFrom: null,
        balanceTo: null,
        createdFrom: '',
        createdTo: '',
    });

    const [selected, setSelected] = useState<Account | null>(null);
    const [recent, setRecent] = useState<Transaction[]>([]);
    const [xferTo, setXferTo] = useState('');
    const [xferAmt, setXferAmt] = useState('');
    const [xferDesc, setXferDesc] = useState('');

    const noFilters =
        !filters.owner?.trim() &&
        !filters.accountNumber?.trim() &&
        (filters.balanceFrom == null || filters.balanceFrom === ('' as any)) &&
        (filters.balanceTo == null || filters.balanceTo === ('' as any)) &&
        !filters.createdFrom?.trim() &&
        !filters.createdTo?.trim();

    const rows = useMemo(() => {
        return accounts.filter((a) => {
            const owner = (a.ownerName ?? '').toLowerCase();
            const acc = (a.accountNumber ?? '').toLowerCase();
            const bal = Number(a.balance ?? 0);
            const created = new Date(a.createdUtc);

            if (filters.owner && !owner.includes(filters.owner.toLowerCase())) return false;
            if (filters.accountNumber && !acc.includes(filters.accountNumber.toLowerCase())) return false;
            if (filters.balanceFrom != null && filters.balanceFrom !== ('' as any) && bal < Number(filters.balanceFrom)) return false;
            if (filters.balanceTo != null && filters.balanceTo !== ('' as any) && bal > Number(filters.balanceTo)) return false;
            if (filters.createdFrom && created < new Date(filters.createdFrom)) return false;
            if (filters.createdTo && created > new Date(filters.createdTo)) return false;
            return true;
        });
    }, [accounts, filters]);  // :contentReference[oaicite:0]{index=0}

    async function refresh() {
        const data = await AccountsApi.list();
        setAccounts(data);
    }

    useEffect(() => {
        if (!selected) return void setRecent([]);
        TransactionsApi.list({ accountId: selected.id })
            .then((t) => setRecent(t.slice(0, 10)))
            .catch(() => setRecent([]));
    }, [selected]);  // :contentReference[oaicite:1]{index=1}

    async function postTransfer(e: React.FormEvent) {
        e.preventDefault();
        if (!selected || !xferTo || !xferAmt) return;
        const amount = Number(xferAmt);
        if (!amount || amount <= 0) return;

        await TransactionsApi.create({
            accountId: selected.id,
            type: 'Debit',
            amount,
            description: xferDesc ? `Transfer to ${xferTo.slice(0, 6)}… — ${xferDesc}` : `Transfer to ${xferTo.slice(0, 6)}…`,
        });
        await TransactionsApi.create({
            accountId: xferTo,
            type: 'Credit',
            amount,
            description: xferDesc ? `Transfer from ${selected.accountNumber} — ${xferDesc}` : `Transfer from ${selected.accountNumber}`,
        });

        await refresh();
        setXferAmt('');
        setXferDesc('');
        const tx = await TransactionsApi.list({ accountId: selected.id });
        setRecent(tx.slice(0, 10));
    }

    return (
        <section className="panel clickfix">
            <header className="panel-header">
                <div className="panel-left">
                    <button type="button" className="btn" onClick={refresh}>Refresh</button>
                </div>
                <div className="panel-right">
                    <button type="button" className="btn primary" onClick={onCreate}>New account</button>
                </div>
            </header>

            <div className="filters-bar">
                <input placeholder="Owner" value={filters.owner ?? ''} onChange={(e) => setFilters(f => ({ ...f, owner: e.target.value }))} />
                <input placeholder="Account #" value={filters.accountNumber ?? ''} onChange={(e) => setFilters(f => ({ ...f, accountNumber: e.target.value }))} />
                <input type="number" placeholder="Balance from" value={filters.balanceFrom ?? ''} onChange={(e) => setFilters(f => ({ ...f, balanceFrom: e.target.value === '' ? null : Number(e.target.value) }))} />
                <input type="number" placeholder="to" value={filters.balanceTo ?? ''} onChange={(e) => setFilters(f => ({ ...f, balanceTo: e.target.value === '' ? null : Number(e.target.value) }))} />
                <input type="date" value={filters.createdFrom ?? ''} onChange={(e) => setFilters(f => ({ ...f, createdFrom: e.target.value }))} />
                <input type="date" value={filters.createdTo ?? ''} onChange={(e) => setFilters(f => ({ ...f, createdTo: e.target.value }))} />
            </div>

            <div className="two-pane">
                <div className={`accounts-list ${noFilters ? 'scrolling' : ''}`}>
                    <div className="rows">
                        <table className="grid fixed">
                            <colgroup>
                                <col />
                                <col />
                                <col style={{ width: 90 }} />
                                <col style={{ width: 140 }} />
                                <col style={{ width: 140 }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Owner</th>
                                    <th>Account #</th>
                                    <th>Currency</th>
                                    <th>Balance</th>
                                    <th>Created</th>
                                    <th style={{ width: 120 }} />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((a) => (
                                    <tr key={a.id} className={selected?.id === a.id ? 'selected' : ''} onClick={() => setSelected(a)} style={{ cursor: 'pointer' }}>
                                        <td>{a.ownerName}</td>
                                        <td>{a.accountNumber}</td>
                                        <td>{a.currency}</td>
                                        <td>{a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td>{new Date(a.createdUtc).toLocaleString()}</td>
                                        <td className="actions">
                                            <button type="button" className="btn sm"
                                                onClick={(e) => { e.stopPropagation(); onEdit(a); }}>
                                                Edit
                                            </button>
                                            <button type="button" className="btn sm danger"
                                                onClick={(e) => { e.stopPropagation(); onDelete(a); }}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && <tr><td colSpan={6}>No accounts</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                <aside className={`details ${selected ? 'open' : ''}`}>
                    {!selected && <div className="muted">Click an account to view details</div>}
                    {selected && (
                        <>
                            <div className="details-header">
                                <div>
                                    <div className="overline">Selected account</div>
                                    <h3 style={{ margin: 0 }}>{selected.ownerName}</h3>
                                    <div className="muted">{selected.accountNumber} • {selected.currency}</div>
                                </div>
                                <div>
                                    <button type="button" className="btn sm" onClick={() => onEdit(selected)}>Edit</button>
                                    <button type="button" className="btn sm danger" onClick={() => onDelete(selected)}>Delete</button>
                                </div>
                            </div>

                            <div className="kv">
                                <div><span>Balance</span><b>{selected.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></div>
                                <div><span>Created</span><b>{new Date(selected.createdUtc).toLocaleString()}</b></div>
                            </div>

                            <hr />

                            <form className="xfer" onSubmit={postTransfer}>
                                <div className="overline">Transfer</div>
                                <label>From</label>
                                <input value={`${selected.ownerName} — ${selected.accountNumber}`} readOnly />
                                <label>To</label>
                                <select value={xferTo} onChange={(e) => setXferTo(e.target.value)}>
                                    <option value="">Choose destination…</option>
                                    {accounts.filter(a => a.id !== selected.id).map(a => (
                                        <option key={a.id} value={a.id}>{a.ownerName} — {a.accountNumber}</option>
                                    ))}
                                </select>
                                <label>Amount</label>
                                <input type="number" step="0.01" min="0" value={xferAmt} onChange={(e) => setXferAmt(e.target.value)} />
                                <label>Description</label>
                                <input value={xferDesc} onChange={(e) => setXferDesc(e.target.value)} />
                                <div><button className="btn primary" type="submit" disabled={!xferTo || !xferAmt}>Post transfer</button></div>
                            </form>

                            <hr />

                            <div className="overline" style={{ marginBottom: 8 }}>Recent activity</div>
                            <table className="grid fixed">
                                <colgroup>
                                    <col style={{ width: 160 }} />
                                    <col style={{ width: 110 }} />
                                    <col style={{ width: 80 }} />
                                    <col />
                                </colgroup>
                                <thead>
                                    <tr><th>Date</th><th>Amount</th><th>Type</th><th>Description</th></tr>
                                </thead>
                                <tbody>
                                    {recent.map(t => (
                                        <tr key={t.id}>
                                            <td>{new Date(t.createdAt).toLocaleString()}</td>
                                            <td style={{ color: t.type === 'Credit' ? 'var(--green)' : 'var(--red)' }}>
                                                {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td>{t.type}</td>
                                            <td>{t.description ?? ''}</td>
                                        </tr>
                                    ))}
                                    {recent.length === 0 && <tr><td colSpan={4}>No activity</td></tr>}
                                </tbody>
                            </table>
                        </>
                    )}
                </aside>
            </div>
        </section>
    );
}
