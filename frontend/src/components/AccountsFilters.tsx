type Props = {
    value: FilterState;                         // { owner, accountNumber, balanceFrom, balanceTo, createdFrom, createdTo }
    onChange: (next: Partial<FilterState>) => void;
    onApply: () => void;                        // <- this is the Refresh button
};

type Filters = {
    owner?: string;
    accountNumber?: string;
    balanceFrom?: number | null;
    balanceTo?: number | null;
    createdFrom?: string;   // yyyy-mm-dd
    createdTo?: string;     // yyyy-mm-dd
};

export type FilterState = {
    owner?: string;
    accountNumber?: string;
    balanceFrom?: number | null;
    balanceTo?: number | null;
    createdFrom?: string;
    createdTo?: string;
};

export default function AccountsFilters({
    value,
    onChange,
    onApply
}: {
    value: Filters;
    onChange: (next: Filters) => void;
    onApply: () => void;
}) {
    return (
        <div className="filters">
            <div className="filters-left">
                <button className="btn" onClick={onApply}>Refresh</button>
            </div>

            <div className="filters-grid">
                {/* Owner */}
                <input
                    placeholder="Owner"
                    value={value.owner ?? ''}
                    onChange={e => onChange({ owner: e.target.value })}
                />
                {/* Account # */}
                <input
                    placeholder="Account #"
                    value={value.accountNumber ?? ''}
                    onChange={e => onChange({ accountNumber: e.target.value })}
                />
                {/* Balance range */}
                <input
                    type="number"
                    placeholder="Balance from"
                    value={value.balanceFrom ?? ''}
                    onChange={e => onChange({ balanceFrom: e.target.value === '' ? undefined : Number(e.target.value) })}
                />
                <input
                    type="number"
                    placeholder="to"
                    value={value.balanceTo ?? ''}
                    onChange={e => onChange({ balanceTo: e.target.value === '' ? undefined : Number(e.target.value) })}
                />
                {/* Created range */}
                <input
                    type="date"
                    placeholder="Created from"
                    value={value.createdFrom ?? ''}
                    onChange={e => onChange({ createdFrom: e.target.value })}
                />
                <input
                    type="date"
                    placeholder="to"
                    value={value.createdTo ?? ''}
                    onChange={e => onChange({ createdTo: e.target.value })}
                />
            </div>
        </div>
    );
}