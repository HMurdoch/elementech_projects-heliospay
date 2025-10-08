import dayjs from 'dayjs'
import { Account, Transaction } from '../types'
import { useTransactions } from '../hooks/useTransactions'
import TransactionForm from './TransactionForm'
import Badge from './Badge'
import { Table } from './Table'
import { useState } from 'react'

export default function TransactionsPanel({ account }: { account: Account | null }) {
    const { items, loading, reload, add } = useTransactions(account?.id)
    const [adding, setAdding] = useState(false)

    return (
        <div className="panel">
            <div className="toolbar">
                <div className="h1" style={{ fontSize: '1.2rem' }}>Transactions</div>
                <div className="muted">Showing {account ? 'for ' + account.ownerName : 'all accounts'}</div>
                <div className="right" />
                {account && <button className="primary" onClick={() => setAdding(true)}>Add transaction</button>}
                <button className="ghost" onClick={reload} disabled={loading}>Refresh</button>
            </div>

            <div className="sep"></div>

            <Table head={<>
                <th>Date</th><th>Account ID</th><th>Amount</th><th>Type</th><th>Description</th>
            </>}>
                {items.map(tx => <Row key={tx.id} tx={tx} />)}
            </Table>

            {adding && account && (
                <Modal onClose={() => setAdding(false)}>
                    <TransactionForm
                        onCancel={() => setAdding(false)}
                        onSubmit={async d => {
                            await add({ accountId: account.id, ...d })
                            setAdding(false)
                        }}
                    />
                </Modal>
            )}
        </div>
    )
}

function Row({ tx }: { tx: Transaction }) {
    const kind = tx.type === 'Credit' ? 'ok' : 'danger'
    const signed = tx.type === 'Credit' ? +tx.amount : -tx.amount
    return (
        <tr>
            <td className="small muted">{dayjs(tx.createdAt ?? tx.requestedUtc ?? tx.completedUtc).format('YYYY-MM-DD HH:mm')}</td>
            <td className="small">{tx.accountId.slice(0, 8)}…</td>
            <td style={{ fontWeight: 700 }} className={kind === 'ok' ? '' : 'danger'}>{signed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td><Badge kind={kind as any}>{tx.type}</Badge></td>
            <td className="small">{tx.description ?? '—'}</td>
        </tr>
    )
}

function Modal({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
    return (
        <div className="center" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)' }} onMouseDown={onClose}>
            <div onMouseDown={e => e.stopPropagation()}>{children}</div>
        </div>
    )
}
