export type Currency = 'ZAR' | 'USD' | 'EUR' | 'GBP';

export interface Account {
    id: string;                // GUID from API
    ownerName: string;
    accountNumber: string;
    currency: Currency;
    balance: number;
    createdUtc: string;        // ISO date
}

export type TransactionType = 'Credit' | 'Debit';

export interface Transaction {
    id: string;
    accountId: string;
    createdAt: string;
    amount: number;
    type: TransactionType;
    description?: string | null;
}

export interface Paged<T> {
    items: T[];
    total: number;
}