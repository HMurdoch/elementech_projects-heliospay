import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Account, Currency } from '../types';

const schema = z.object({
    ownerName: z.string().min(2, 'Owner name required'),
    accountNumber: z.string().min(3, 'Account # required'),
    currency: z.enum(['ZAR', 'USD', 'EUR', 'GBP']),
});

export type AccountFormValues = z.infer<typeof schema>;

export default function AccountForm({
    defaultValues,
    onSubmit,
    onCancel,
}: {
    defaultValues?: Partial<Account>;
    onSubmit: (values: AccountFormValues) => void;
    onCancel: () => void;
}) {
    const { register, handleSubmit, formState: { errors } } = useForm<AccountFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            ownerName: defaultValues?.ownerName ?? '',
            accountNumber: defaultValues?.accountNumber ?? '',
            currency: (defaultValues?.currency as Currency) ?? 'ZAR',
        }
    });

    return (
        <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
            <label>
                <span>Owner</span>
                <input {...register('ownerName')} />
                {errors.ownerName && <em>{errors.ownerName.message}</em>}
            </label>

            <label>
                <span>Account #</span>
                <input {...register('accountNumber')} />
                {errors.accountNumber && <em>{errors.accountNumber.message}</em>}
            </label>

            <label>
                <span>Currency</span>
                <select {...register('currency')}>
                    <option>ZAR</option>
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                </select>
            </label>

            <div className="row actions">
                <button type="submit" className="btn primary">Save</button>
                <button type="button" className="btn" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}