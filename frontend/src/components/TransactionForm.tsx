import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Account } from "../api";

const schema = z.object({
    accountId: z.string().uuid(),
    type: z.enum(["Credit", "Debit"]),
    amount: z.coerce.number().min(0.01, "Amount must be > 0"),
    description: z.string().optional(),
});
export type TxFormValues = z.infer<typeof schema>;

export default function TransactionForm({
    accounts,
    onSubmit,
    onCancel,
    defaultAccountId,
}: {
    accounts: Account[];
    defaultAccountId?: string;
    onSubmit: (values: TxFormValues) => void;
    onCancel: () => void;
}) {
    const { register, handleSubmit, formState: { errors } } = useForm<TxFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { accountId: defaultAccountId, type: "Credit", amount: 100, description: "" },
    });

    return (
        <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
            <label>
                <span>Account</span>
                <select {...register("accountId")}>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.ownerName} – {a.accountNumber}</option>)}
                </select>
                {errors.accountId && <em>{errors.accountId.message}</em>}
            </label>

            <label>
                <span>Type</span>
                <select {...register("type")}>
                    <option value="Credit">Credit (+)</option>
                    <option value="Debit">Debit (–)</option>
                </select>
            </label>

            <label>
                <span>Amount</span>
                <input type="number" step="0.01" {...register("amount")} />
                {errors.amount && <em>{errors.amount.message}</em>}
            </label>

            <label className="span-2">
                <span>Description</span>
                <input {...register("description")} />
            </label>

            <div className="row actions">
                <button type="submit" className="btn primary">Post</button>
                <button type="button" className="btn" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}
