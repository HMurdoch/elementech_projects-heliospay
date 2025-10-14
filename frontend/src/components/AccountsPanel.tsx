import { useEffect, useMemo, useState } from "react";
import {
    AccountsApi,
    TransactionsApi,
    TransfersApi,
    type Account,
    type Transaction,
} from "../api";
import Spinner from "../ui/Spinner";
import { useToast } from "../ui/Toast";

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
    setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
    onCreate: () => void;
    onEdit: (a: Account) => void;
    onDelete: (a: Account) => void;
};

export default function AccountsPanel({
    accounts,
    setAccounts,
    onCreate,
    onEdit,
    onDelete,
}: Props) {
    const toast = useToast();
    const [filters, setFilters] = useState<Filters>({});
    const [selected, setSelected] = useState<Account | null>(null);
    const [recent, setRecent] = useState<Transaction[]>([]);
    const [xferTo, setXferTo] = useState("");
    const [xferAmt, setXferAmt] = useState("");
    const [xferDesc, setXferDesc] = useState("");
    const [posting, setPosting] = useState(false);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    async function refresh() {
        setLoading(true);
        try {
            const data = await AccountsApi.list();
            setAccounts(data);
            if (selected) setSelected(data.find((a) => a.id === selected.id) ?? null);
        } catch (e: any) {
            toast.push({ kind: "err", text: e?.message ?? "Failed to load accounts" });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!selected) {
            setRecent([]);
            return;
        }
        void TransactionsApi.list({ accountId: selected.id, take: 10 })
            .then(setRecent)
            .catch(() => setRecent([]));
    }, [selected?.id]);

    const rows = useMemo(() => {
        return accounts.filter((a) => {
            const owner = (a.ownerName ?? "").toLowerCase();
            const acc = (a.accountNumber ?? "").toLowerCase();
            const bal = Number(a.balance ?? 0);
            const created = new Date(a.createdUtc);

            if (filters.owner && !owner.includes(filters.owner.toLowerCase()))
                return false;
            if (
                filters.accountNumber &&
                !acc.includes(filters.accountNumber.toLowerCase())
            )
                return false;
            if (
                filters.balanceFrom != null &&
                filters.balanceFrom !== ("" as any) &&
                bal < Number(filters.balanceFrom)
            )
                return false;
            if (
                filters.balanceTo != null &&
                filters.balanceTo !== ("" as any) &&
                bal > Number(filters.balanceTo)
            )
                return false;
            if (filters.createdFrom && created < new Date(filters.createdFrom))
                return false;
            if (filters.createdTo && created > new Date(filters.createdTo))
                return false;
            return true;
        });
    }, [accounts, filters]);

    async function postTransfer(e: React.FormEvent) {
        e.preventDefault();
        setMsg("");
        if (!selected) return;

        if (!xferTo) {
            setMsg("Please choose a destination account.");
            return;
        }
        const amount = Number(xferAmt);
        if (!amount || amount <= 0) {
            setMsg("Enter a positive amount.");
            return;
        }
        if (selected.id === xferTo) {
            setMsg("From and To cannot match.");
            return;
        }

        const toAcc = accounts.find((a) => a.id === xferTo);
        if (
            toAcc &&
            String(toAcc.currency).toUpperCase() !==
            String(selected.currency).toUpperCase()
        ) {
            setMsg(
                `Currencies must match (${String(selected.currency).toUpperCase()} → ${String(
                    toAcc.currency
                ).toUpperCase()}).`
            );
            return;
        }

        setPosting(true);
        try {
            await TransfersApi.transfer({
                fromAccountId: selected.id,
                toAccountId: xferTo,
                amount,
                description: xferDesc || undefined,
            });
            await refresh();
            const tx = await TransactionsApi.list({
                accountId: selected.id,
                take: 10,
            });
            setRecent(tx);
            setXferAmt("");
            setXferDesc("");
            toast.push({ kind: "ok", text: "Transfer posted" });
        } catch (err: any) {
            const text = err?.message ?? "Failed to post transfer";
            setMsg(text);
            toast.push({ kind: "err", text });
        } finally {
            setPosting(false);
        }
    }

    return (
        <section className="accounts-page">
            <div className="accounts-toolbar">
                <div className="left">
                    <button type="button" className="btn" onClick={refresh} disabled={loading}>
                        {loading ? <Spinner size={14} /> : "Refresh"}
                    </button>
                </div>
                <div className="right">
                    <button type="button" className="btn primary" onClick={onCreate}>
                        New account
                    </button>
                </div>
            </div>

            <div className="accounts-2col">
                {/* LEFT */}
                <div className="pane-left">
                    <div className="filters">
                        <input
                            placeholder="Owner"
                            value={filters.owner ?? ""}
                            onChange={(e) =>
                                setFilters((f) => ({ ...f, owner: e.target.value }))
                            }
                        />
                        <input
                            placeholder="Account #"
                            value={filters.accountNumber ?? ""}
                            onChange={(e) =>
                                setFilters((f) => ({ ...f, accountNumber: e.target.value }))
                            }
                        />
                        <input
                            type="number"
                            placeholder="Balance from"
                            value={filters.balanceFrom ?? ""}
                            onChange={(e) =>
                                setFilters((f) => ({
                                    ...f,
                                    balanceFrom:
                                        e.target.value === "" ? null : Number(e.target.value),
                                }))
                            }
                        />
                        <input
                            type="number"
                            placeholder="to"
                            value={filters.balanceTo ?? ""}
                            onChange={(e) =>
                                setFilters((f) => ({
                                    ...f,
                                    balanceTo:
                                        e.target.value === "" ? null : Number(e.target.value),
                                }))
                            }
                        />
                        <input
                            type="date"
                            value={filters.createdFrom ?? ""}
                            onChange={(e) =>
                                setFilters((f) => ({ ...f, createdFrom: e.target.value }))
                            }
                        />
                        <input
                            type="date"
                            value={filters.createdTo ?? ""}
                            onChange={(e) =>
                                setFilters((f) => ({ ...f, createdTo: e.target.value }))
                            }
                        />
                    </div>

                    <div className="list-scroll">
                        <table className="grid fixed">
                            <colgroup>
                                <col />
                                <col />
                                <col style={{ width: 90 }} />
                                <col style={{ width: 140 }} />
                                <col style={{ width: 160 }} />
                                <col style={{ width: 140 }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Owner</th>
                                    <th>Account #</th>
                                    <th>Cur</th>
                                    <th>Balance</th>
                                    <th>Created</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {loading && rows.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="muted small">
                                            <div className="row">
                                                <Spinner />
                                                Loading accounts…
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {!loading &&
                                    rows.map((a) => (
                                        <tr
                                            key={a.id}
                                            className={selected?.id === a.id ? "selected" : ""}
                                            onClick={() => setSelected(a)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <td>{a.ownerName}</td>
                                            <td>{a.accountNumber}</td>
                                            <td>{String(a.currency).toUpperCase()}</td>
                                            <td>
                                                {Number(a.balance).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </td>
                                            <td>{new Date(a.createdUtc).toLocaleString()}</td>
                                            <td className="actions">
                                                <button
                                                    type="button"
                                                    className="btn sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(a);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn sm danger"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(a);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                {!loading && rows.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="muted small">
                                            No accounts match your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT */}
                <aside className="pane-right">
                    {!selected && (
                        <div className="details-card muted">Select an account to view details</div>
                    )}
                    {selected && (
                        <div className="details-card">
                            <div className="details-head">
                                <div>
                                    <div className="overline">Selected account</div>
                                    <h3 className="title">{selected.ownerName}</h3>
                                    <div className="muted">
                                        {selected.accountNumber} • {String(selected.currency).toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            <div className="kv">
                                <div>
                                    <span>Balance</span>
                                    <b>
                                        {Number(selected.balance).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                        })}
                                    </b>
                                </div>
                                <div>
                                    <span>Created</span>
                                    <b>{new Date(selected.createdUtc).toLocaleString()}</b>
                                </div>
                            </div>

                            <hr />

                            <form className="xfer" onSubmit={postTransfer}>
                                <div className="overline">Transfer</div>
                                <label>From</label>
                                <input
                                    value={`${selected.ownerName} — ${selected.accountNumber}`}
                                    readOnly
                                />
                                <label>To</label>
                                <select value={xferTo} onChange={(e) => setXferTo(e.target.value)}>
                                    <option value="">Choose destination…</option>
                                    {accounts
                                        .filter((a) => a.id !== selected.id)
                                        .map((a) => {
                                            const same =
                                                String(a.currency).toUpperCase() ===
                                                String(selected.currency).toUpperCase();
                                            return (
                                                <option key={a.id} value={a.id} disabled={!same}>
                                                    {a.ownerName} — {a.accountNumber}
                                                    {same
                                                        ? ""
                                                        : ` (currency ${String(a.currency).toUpperCase()} ≠ ${String(
                                                            selected.currency
                                                        ).toUpperCase()})`}
                                                </option>
                                            );
                                        })}
                                </select>
                                <label>Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    inputMode="decimal"
                                    value={xferAmt}
                                    onChange={(e) => setXferAmt(e.target.value)}
                                />
                                <label>Description</label>
                                <input
                                    value={xferDesc}
                                    onChange={(e) => setXferDesc(e.target.value)}
                                />
                                <div className="row actions">
                                    <button
                                        type="submit"
                                        className="btn primary"
                                        disabled={posting || !xferTo || !xferAmt}
                                    >
                                        {posting ? <Spinner size={16} /> : "Post transfer"}
                                    </button>
                                </div>
                                {msg && <div className="small" style={{ marginTop: 8 }}>{msg}</div>}
                            </form>

                            <hr />

                            <div className="overline" style={{ marginBottom: 8 }}>
                                Recent activity
                            </div>
                            <table className="grid fixed">
                                <colgroup>
                                    <col style={{ width: 160 }} />
                                    <col style={{ width: 110 }} />
                                    <col style={{ width: 80 }} />
                                    <col />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Type</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent.map((t) => (
                                        <tr key={t.id}>
                                            <td className="small">
                                                {new Date(t.createdAt ?? t.createdUtc ?? "").toLocaleString()}
                                            </td>
                                            <td
                                                style={{ fontWeight: 700 }}
                                                className={
                                                    t.type === "Credit" || t.amount > 0 ? "credit" : "debit"
                                                }
                                            >
                                                {Number(t.amount).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </td>
                                            <td>
                                                <span className="badge">{t.type}</span>
                                            </td>
                                            <td className="small">{t.description ?? ""}</td>
                                        </tr>
                                    ))}
                                    {recent.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="muted small">
                                                No activity
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </aside>
            </div>
        </section>
    );
}
