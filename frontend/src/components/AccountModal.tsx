import { useEffect, useState } from "react";
import Modal from "./Modal";
import type { Account } from "../api";
import { createAccount, updateAccount } from "../api";

type Props = {
    open: boolean;
    mode: "create" | "edit";
    initial?: Account | null;
    onClose: () => void;
    onSaved: () => void; // refresh list
};

const CURRENCIES = ["ZAR", "USD", "EUR", "GBP"] as const;

export default function AccountModal({ open, mode, initial, onClose, onSaved }: Props) {
    const [ownerName, setOwnerName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [currency, setCurrency] = useState<string>("ZAR");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        setError("");
        if (mode === "edit" && initial) {
            setOwnerName(initial.ownerName ?? "");
            setAccountNumber(initial.accountNumber ?? "");
            setCurrency(String(initial.currency ?? "ZAR").toUpperCase());
        } else if (mode === "create") {
            setOwnerName("");
            setAccountNumber("");
            setCurrency("ZAR");
        }
    }, [mode, initial, open]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!ownerName.trim()) return setError("Owner name is required.");
        if (!accountNumber.trim()) return setError("Account # is required.");

        setSaving(true);
        try {
            if (mode === "create") {
                await createAccount({ ownerName, accountNumber, currency });
            } else if (mode === "edit" && initial) {
                await updateAccount(initial.id, { ownerName, accountNumber, currency });
            }
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err?.message ?? "Failed to save.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === "create" ? "New account" : "Edit account"}
            widthClassName="w-[520px]"
            footer={
                <div className="row gap-8">
                    <button className="btn" type="button" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className="btn primary" type="submit" form="account-modal-form" disabled={saving}>
                        {saving ? "Saving…" : "Save"}
                    </button>
                </div>
            }
        >
            <form id="account-modal-form" onSubmit={onSubmit} className="form-grid">
                <label>Owner</label>
                <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} autoFocus />

                <label>Account #</label>
                <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />

                <label>Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {error && <div className="form-error">{error}</div>}
            </form>
        </Modal>
    );
}
