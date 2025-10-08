import dayjs from 'dayjs';
import clsx from 'clsx';
import { Transaction } from '../types';

export default function TransactionsTable({ items }: { items: Transaction[] }) {
    if (!items.length) return <div className="muted">No transactions</div>;

    return (
        <table className="table">
            <thead>
            <tr>
                <th>Date</th>
                <th>Account ID</th>
                <th className="num">Amount</th>
                <th>Type</th>
                <th>Description</th>
            </tr>
            </thead>
            <tbody>
            {items.map(t => (
                <tr key={t.id}>
                    <td>{dayjs(t.createdAt).format('YYYY-MM-DD HH:mm')}</td>
                    <td className="mono">{t.accountId.slice(0, 8)}</td>
                    <td className={clsx('num', t.type === 'Credit' ? 'green' : 'red')}>
                        {t.type === 'Debit' ? '-' : ''}{Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td><span className={clsx('pill', t.type === 'Credit' ? 'pill-green' : 'pill-red')}>{t.type}</span></td>
                    <td>{t.description ?? ''}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}