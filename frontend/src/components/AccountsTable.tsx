import dayjs from 'dayjs';
import { Account } from '../types';

export default function AccountsTable({
    items,
    onEdit,
    onDelete,
}: {
    items: Account[];
    onEdit: (acc: Account) => void;
    onDelete: (id: string) => void;
}) {
    if (!items.length) return <div className="muted">No accounts</div>;

    return (
        <table className="table">
            <thead>
            <tr>
                <th>Owner</th>
                <th>Account #</th>
                <th>Currency</th>
                <th className="num">Balance</th>
                <th>Created</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {items.map(a => (
                <tr key={a.id}>
                    <td>{a.ownerName}</td>
                    <td>{a.accountNumber}</td>
                    <td>{a.currency}</td>
                    <td className="num">{a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>{dayjs(a.createdUtc).format('YYYY-MM-DD HH:mm')}</td>
                    <td className="row">
                        <button className="btn small" onClick={() => onEdit(a)}>Edit</button>
                        <button className="btn small danger" onClick={() => onDelete(a.id)}>Delete</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}