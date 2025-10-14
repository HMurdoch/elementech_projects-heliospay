import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { Account, Currency } from "../api";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";

type FormValues = {
    ownerName: string;
    accountNumber: string;
    currency: Currency; // "ZAR" | "USD" | "EUR" | "GBP"
};

type Props = {
    open: boolean;
    initialValues?: Account | null;
    onCancel: () => void;
    onSave: (values: FormValues) => Promise<void>;
};

export default function AccountForm({
    open,
    initialValues,
    onCancel,
    onSave,
}: Props) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting, errors },
    } = useForm<FormValues>({
        defaultValues: {
            ownerName: "",
            accountNumber: "",
            currency: "ZAR",
        },
    });

    useEffect(() => {
        reset({
            ownerName: initialValues?.ownerName ?? "",
            accountNumber: initialValues?.accountNumber ?? "",
            currency: (initialValues?.currency as Currency) ?? "ZAR",
        });
    }, [initialValues, reset]);

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        await onSave(values);
    };

    return (
        <Modal open={open} onClose={onCancel}>
            <h3 style={{ margin: "0 0 10px" }}>
                {initialValues ? "Edit account" : "New account"}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
                <label>
                    <span>Owner</span>
                    <input
                        {...register("ownerName", { required: true })}
                        placeholder="Owner name"
                    />
                    {errors.ownerName && (
                        <small className="err">Owner is required</small>
                    )}
                </label>

                <label>
                    <span>Account #</span>
                    <input
                        {...register("accountNumber", { required: true })}
                        placeholder="e.g. 62842233416"
                    />
                    {errors.accountNumber && (
                        <small className="err">Account # is required</small>
                    )}
                </label>

                <label>
                    <span>Currency</span>
                    <select {...register("currency", { required: true })}>
                        <option value="ZAR">ZAR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
                </label>

                <div className="row gap-8">
                    <button
                        type="button"
                        className="btn"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn primary" disabled={isSubmitting}>
                        {isSubmitting ? <Spinner size={16} /> : "Save"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
