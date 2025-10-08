import clsx from 'clsx'

export default function Badge({ kind = 'info', children }: { kind?: 'info' | 'ok' | 'warn' | 'danger', children: React.ReactNode }) {
    return <span className={clsx('badge', kind)}>{children}</span>
}