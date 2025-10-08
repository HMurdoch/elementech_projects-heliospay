import dayjs from 'dayjs'
import { useState } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import { Account } from '../types'
import Badge from './Badge'
import Confirm from './Confirm'
import AccountForm from './AccountForm'
import { Table } from './Table'

export default function AccountsPanel({ onPick }: { onPick: (a: Account | null) => void }) {
    const { items, loading, currency, setCurrency, refresh, create, update, remove } = useAccounts("ZAR");
    const [editing, setEditing] = useState<Account | null>(null);
    const [creating, setCreating] = useState(false);
    const [toDelete, setToDelete] = useState<Account | null>(null);

    // events
    const onNew = async (payload: { ownerName: string; accountNumber: string; currency: string; }) => {
        await create(payload);
    };
    const onEdit = async (id: string, payload: { ownerName: string; accountNumber: string; currency: string; }) => {
        await update(id, payload);
    };
    const onDelete = async (id: string) => { await remove(id); };


    return (
        <div className="card">
            {/* currency filter + buttons */}
            {/* ... */}
            <button onClick={refresh}>Refresh</button>
            {/* New account modal uses <AccountForm onSubmit={onNew} /> */}

            <table>{/* map items */}
                <tbody>
                {loading ? (
                    <tr><td colSpan={6}>Loading…</td></tr>
                ) : items.length === 0 ? (
                    <tr><td colSpan={6}>No accounts</td></tr>
                ) : items.map(a => (
                    <tr key={a.id}>
                        <td>{a.ownerName ?? a.ownerName}</td>
                        <td>{a.accountNumber}</td>
                        <td>{a.currency}</td>
                        <td>{a.balance.toFixed(2)}</td>
                        <td>{new Date(a.createdUtc).toLocaleString()}</td>
                        <td>
                            {/* Edit opens AccountForm with initial values calling onEdit(a.id, values) */}
                            <button onClick={() => onDelete(a.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    ); }

function Modal({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
    return (
        <div className="center" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)' }} onMouseDown={onClose}>
            <div onMouseDown={e => e.stopPropagation()}>{children}</div>
        </div>
    )
}
