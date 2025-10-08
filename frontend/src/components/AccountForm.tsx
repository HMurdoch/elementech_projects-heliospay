import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Currency, CreateAccountDto, Account } from "../api";
import { createAccount, updateAccount } from "../api";

const schema = z.object({
    ownerName: z.string().min(2, "Owner name is required"),
    accountNumber: z.string().min(3, "Account # is required"),
    currency: z.enum(["ZAR", "USD", "EUR"])
});
type FormValues = z.infer<typeof schema>;

type Props = {
    open: boolean;
    onClose: () => void;
    /** When editing we pass an account; when creating it's undefined */
    account?: Account | null;
    onSaved: (account: Account) => void;
};

export default function AccountForm({ open, onClose, account, onSaved }: Props) {
    const isEdit = !!account;

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            ownerName: account?.ownerName ?? "",
            accountNumber: account?.accountNumber ?? "",
            currency: (account?.currency ?? "ZAR") as Currency
        }
    });

    React.useEffect(() => {
        reset({
            ownerName: account?.ownerName ?? "",
            accountNumber: account?.accountNumber ?? "",
            currency: (account?.currency ?? "ZAR") as Currency
        });
    }, [account, reset]);

    if (!open) return null;

    const onSubmit = async (values: FormValues) => {
        try {
            let saved: Account;
            if (isEdit && account) {
                saved = await updateAccount(account.id, values);
            } else {
                saved = await createAccount(values as CreateAccountDto);
            }
            onSaved(saved);
            onClose();
        } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.title ?? err?.message ?? "Failed to save account");
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-card">
                <div className="modal-header">
                    <h3>{isEdit ? "Edit account" : "New account"}</h3>
                    <button className="icon-btn" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
                    <label>
                        <span>Owner</span>
                        <input {...register("ownerName")} placeholder="Owner name" />
                        {errors.ownerName && <small className="err">{errors.ownerName.message}</small>}
                    </label>

                    <label>
                        <span>Account #</span>
                        <input {...register("accountNumber")} placeholder="e.g. 62842233416" />
                        {errors.accountNumber && <small className="err">{errors.accountNumber.message}</small>}
                    </label>

                    <label>
                        <span>Currency</span>
                        <select {...register("currency")}>
                            <option value="ZAR">ZAR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                        {errors.currency && <small className="err">{errors.currency.message}</small>}
                    </label>

                    <div className="actions">
                        <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn" disabled={isSubmitting}>
                            {isEdit ? "Save" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
