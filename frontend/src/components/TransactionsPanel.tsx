import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { TransactionsApi, type Account, type Transaction } from "../api";
import TransactionForm from "./TransactionForm";
import Spinner from "../ui/Spinner";
import { useToast } from "../ui/Toast";

type Props = { account?: Account | null; accounts: Account[] };

export default function TransactionsPanel({ account, accounts }: Props) {
    const toast = useToast();
    const [items, setItems] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    async function load() {
        if (!account?.id) {
            setItems([]);
            return;
        }
        setLoading(true);
        try {
            const data = await TransactionsApi.list({
                accountId: account.id,
                take: 10,
            });
            setItems(data);
        } catch (e: any) {
            toast.push({ kind: "err", text: e?.message ?? "Failed to load transactions" });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.id]);

    async function handleCreate(d: {
        accountId: string;
        type: "Credit" | "Debit";
        amount: number;
        description?: string;
    }) {
        try {
            await TransactionsApi.create(d);
            await load();
            toast.push({ kind: "ok", text: "Transaction added" });
        } catch (e: any) {
            toast.push({ kind: "err", text: e?.message ?? "Failed to add transaction" });
        }
    }

    return (
        <div className="panel">
            <div className="toolbar">
                <div className="h1" style={{ fontSize: "1.2rem" }}>
                    Transactions
                </div>
                <div className="muted">
                    {account ? `Showing for ${account.ownerName}` : "No account selected"}
                </div>
                <div className="right" />
                {account && (
                    <button className="btn primary" onClick={() => setAdding(true)}>
                        Add transaction
                    </button>
                )}
                <button className="btn ghost" onClick={() => load()} disabled={loading}>
                    {loading ? <Spinner size={14} /> : "Refresh"}
                </button>
            </div>

            <div className="sep"></div>

            <table className="grid fixed">
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
                    {loading && (
                        <tr>
                            <td colSpan={5} className="muted small">
                                <div className="row">
                                    <Spinner /> Loading transactions…
                                </div>
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        items.map((tx) => (
                            <tr key={tx.id}>
                                <td className="small muted">
                                    {dayjs(tx.createdAt ?? tx.createdUtc ?? "").format(
                                        "YYYY-MM-DD HH:mm"
                                    )}
                                </td>
                                <td className="small">{tx.accountId?.slice(0, 8)}…</td>
                                <td
                                    style={{ fontWeight: 700 }}
                                    className={
                                        tx.type === "Credit" || tx.amount > 0 ? "credit" : "debit"
                                    }
                                >
                                    {(tx.type === "Credit" ? +tx.amount : -tx.amount).toLocaleString(
                                        undefined,
                                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                                    )}
                                </td>
                                <td>
                                    <span className="badge">{tx.type}</span>
                                </td>
                                <td className="small">{tx.description ?? "—"}</td>
                            </tr>
                        ))}
                    {!loading && items.length === 0 && (
                        <tr>
                            <td colSpan={5} className="muted small">
                                No transactions
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {adding && account && (
                <div
                    className="center"
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)" }}
                    onMouseDown={() => setAdding(false)}
                >
                    <div onMouseDown={(e) => e.stopPropagation()}>
                        <TransactionForm
                            accounts={accounts}
                            defaultAccountId={account.id}
                            onSubmit={async (d) => {
                                await handleCreate(d);
                                setAdding(false);
                            }}
                            onCancel={() => setAdding(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
