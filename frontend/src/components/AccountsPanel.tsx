// src/components/AccountsPanel.tsx
import { useMemo, useState } from 'react';
import type { Account } from '../types';
import { AccountsApi } from '../api';

export type AccountFilters = {
    owner?: string;
    accountNumber?: string;
    balanceFrom?: number | null;
    balanceTo?: number | null;
    createdFrom?: string; // ISO yyyy-mm-dd
    createdTo?: string;   // ISO yyyy-mm-dd
};

type Props = {
    accounts: Account[];
    setAccounts: (rows: Account[]) => void;
    onEdit: (acc: Account) => void;
    onDelete: (acc: Account) => void;
    onCreate: () => void; // open the modal
};

export default function AccountsPanel({
    accounts,
    setAccounts,
    onEdit,
    onDelete,
    onCreate,
}: Props) {
    const [filters, setFilters] = useState<AccountFilters>({
        owner: '',
        accountNumber: '',
        balanceFrom: null,
        balanceTo: null,
        createdFrom: '',
        createdTo: '',
    });

    const noFilters =
        !filters.owner?.trim() &&
        !filters.accountNumber?.trim() &&
        (filters.balanceFrom == null || filters.balanceFrom === undefined || filters.balanceFrom === ('' as any)) &&
        (filters.balanceTo == null || filters.balanceTo === undefined || filters.balanceTo === ('' as any)) &&
        !filters.createdFrom?.trim() &&
        !filters.createdTo?.trim();

    // Client-side filtering (fast and avoids extra round trips)
    const rows = useMemo(() => {
        return accounts.filter((a) => {
            // Adjust field names here if yours differ
            const owner = a.ownerName?.toLowerCase() ?? '';
            const accNo = a.accountNumber?.toLowerCase() ?? '';
            const bal = Number(a.balance ?? 0);
            const created = new Date(a.createdUtc);

            if (filters.owner && !owner.includes(filters.owner.toLowerCase())) return false;
            if (filters.accountNumber && !accNo.includes(filters.accountNumber.toLowerCase())) return false;

            if (filters.balanceFrom != null && filters.balanceFrom !== ('' as any))
                if (bal < Number(filters.balanceFrom)) return false;

            if (filters.balanceTo != null && filters.balanceTo !== ('' as any))
                if (bal > Number(filters.balanceTo)) return false;

            if (filters.createdFrom) {
                const from = new Date(filters.createdFrom);
                if (created < from) return false;
            }
            if (filters.createdTo) {
                const to = new Date(filters.createdTo);
                if (created > to) return false;
            }
            return true;
        });
    }, [accounts, filters]);

    async function refresh() {
        const fresh = await AccountsApi.list();
        setAccounts(fresh);
        // filters stay as the user set them; list recalculates via useMemo
    }

    return (
        <section className="panel">
            <header className="panel-header">
                <div className="panel-left">
                    <button className="btn" onClick={refresh}>Refresh</button>
                </div>

                <div className="panel-right">
                    <button className="btn primary" onClick={onCreate}>New account</button>
                </div>
            </header>

            {/* Filter bar */}
            <div className="filters-bar">
                <input
                    placeholder="Owner"
                    value={filters.owner ?? ''}
                    onChange={(e) => setFilters((f) => ({ ...f, owner: e.target.value }))}
                />
                <input
                    placeholder="Account #"
                    value={filters.accountNumber ?? ''}
                    onChange={(e) => setFilters((f) => ({ ...f, accountNumber: e.target.value }))}
                />

                <input
                    type="number"
                    placeholder="Balance from"
                    value={filters.balanceFrom ?? ''}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, balanceFrom: e.target.value === '' ? null : Number(e.target.value) }))
                    }
                />
                <input
                    type="number"
                    placeholder="to"
                    value={filters.balanceTo ?? ''}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, balanceTo: e.target.value === '' ? null : Number(e.target.value) }))
                    }
                />

                <input
                    type="date"
                    placeholder="Created from"
                    value={filters.createdFrom ?? ''}
                    onChange={(e) => setFilters((f) => ({ ...f, createdFrom: e.target.value }))}
                />
                <input
                    type="date"
                    placeholder="to"
                    value={filters.createdTo ?? ''}
                    onChange={(e) => setFilters((f) => ({ ...f, createdTo: e.target.value }))}
                />
            </div>

            {/* Table */}
            <div className={`accounts-list ${noFilters ? 'scrolling' : ''}`}>
                <div className="rows">
                    <table className="grid">
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
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={6}>No accounts</td>
                                </tr>
                            )}
                            {rows.map((a) => (
                                <tr key={a.id}>
                                    <td>{a.ownerName}</td>
                                    <td>{a.accountNumber}</td>
                                    <td>{a.currency}</td>
                                    <td>{a.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td>{new Date(a.createdUtc).toLocaleString()}</td>
                                    <td className="actions">
                                        <button className="btn sm" onClick={() => onEdit(a)}>Edit</button>
                                        <button className="btn sm danger" onClick={() => onDelete(a)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

