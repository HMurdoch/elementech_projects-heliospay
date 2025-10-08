import { ReactNode } from 'react'

export function Table({ head, children }: { head: ReactNode, children: ReactNode }) {
    return (
        <div className="panel">
            <table className="table">
                <thead><tr>{head}</tr></thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    )
}