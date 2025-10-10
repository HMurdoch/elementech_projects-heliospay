import dayjs from 'dayjs';
import { Account } from '../types';

export default function AccountsTable({
    items,
    onEdit,
    onDelete,
    autoScroll = false
}: {
    items: Account[];
    onEdit: (acc: Account) => void;
    onDelete: (id: string) => void;
    autoScroll?: boolean;
}) {
    if (!items.length) return <div className="muted">No accounts</div>;

    const loopList = autoScroll ? [...items, ...items] : items;

    return (
        <div className={autoScroll ? "marquee" : undefined}>
            <table className="table">
                <thead>
                <tr>
                    <th>Owner</th>
                    <th>Account #</th>
                    <th>Currency</th>
                    <th className="num">Balance</th>
                    <th>Created</th>
                    <th />
                </tr>
                </thead>
                <tbody>
                {loopList.map((a, idx) => (
                    <tr key={a.id + ":" + idx}>
                        <td>{a.ownerName}</td>
                        <td>{a.accountNumber}</td>
                        <td>{a.currency}</td>
                        <td className="num">
                            {a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td>{dayjs(a.createdUtc).format('YYYY-MM-DD HH:mm')}</td>
                        <td className="row">
                            <button className="btn small" onClick={() => onEdit(a)}>Edit</button>
                            <button className="btn small danger" onClick={() => onDelete(a.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}